/**
 * POST /api/publish-apps
 *
 * Makes an admin app change PERMANENT: commits the updated catalog to
 * public/apps.json in GitHub (and an uploaded image to public/art/uploads/).
 * The next Vercel deploy then serves the new cards to every device.
 *
 * The browser never sees the GitHub token. This function runs server-side
 * and reads it from env only:
 *   GITHUB_TOKEN        - fine-grained PAT, Contents: read+write, this repo only
 *   GITHUB_REPO         - "techflowlabs6/mytechflowlabs-portal" (default)
 *   GITHUB_BRANCH       - "main" (default)
 *   ADMIN_PUBLISH_TOKEN - any random string; the admin enters it once per
 *                         browser session when publishing. If it is not set
 *                         in Vercel, publishing is disabled with a 501 and
 *                         setup instructions instead of failing silently.
 *
 * Body: { apps: [...], images?: [{ dataUrl, appId }], image?: { dataUrl, appId }, message?: string }
 * Each image, when present, is stored as a real file in the repo and the
 * matching app's imageUrl is rewritten to /art/uploads/<file> before commit.
 */

const CATEGORIES = [
  "Education",
  "Productivity",
  "Finance",
  "3D Games & Arcade",
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function isSafeImageValue(value) {
  if (typeof value !== "string" || !value) return true; // empty = no image
  if (value.startsWith("/art/uploads/") && !value.includes("..")) return true;
  if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validateApps(apps) {
  if (!Array.isArray(apps) || apps.length > 100)
    return "apps must be an array of at most 100 apps.";
  for (const app of apps) {
    if (!app || typeof app.name !== "string" || !app.name.trim())
      return "Every app needs a name.";
    try {
      const url = new URL(app.url);
      if (!["https:", "http:"].includes(url.protocol))
        return `App "${app.name}" needs an http(s) web address.`;
    } catch {
      return `App "${app.name}" needs a valid web address.`;
    }
    if (app.category && !CATEGORIES.includes(app.category))
      return `App "${app.name}" has an unknown category.`;
    if (!isSafeImageValue(app.imageUrl || ""))
      return `App "${app.name}" has an unsafe image address.`;
  }
  return "";
}

function dataUrlParts(dataUrl) {
  const match = /^data:image\/(png|jpe?g|webp|gif|avif);base64,([A-Za-z0-9+/=]+)$/.exec(
    String(dataUrl || ""),
  );
  if (!match) return null;
  return { ext: match[1] === "jpeg" ? "jpg" : match[1], base64: match[2] };
}

async function github(path, token, method = "GET", body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    /* GitHub error bodies are JSON; a non-JSON body means something else broke. */
  }
  if (!res.ok) {
    const detail = data?.message || text.slice(0, 200) || `GitHub ${res.status}`;
    const error = new Error(`GitHub ${res.status}: ${detail}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Use POST." });
  }

  const publishToken = process.env.ADMIN_PUBLISH_TOKEN;
  if (!publishToken) {
    return json(res, 501, {
      ok: false,
      code: "publish_not_configured",
      error:
        "GitHub publishing is not set up yet. In Vercel, set ADMIN_PUBLISH_TOKEN and GITHUB_TOKEN (see PERSISTENCE_SETUP.md), redeploy, then publish again. Your change is still saved on this device.",
    });
  }
  const supplied =
    String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
    String(req.headers["x-publish-token"] || "");
  if (!supplied || supplied !== publishToken) {
    return json(res, 401, {
      ok: false,
      error: "That publish token is not correct. Enter the ADMIN_PUBLISH_TOKEN from Vercel.",
    });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return json(res, 501, {
      ok: false,
      code: "publish_not_configured",
      error:
        "GITHUB_TOKEN is not set in Vercel. Add a fine-grained token with Contents read/write for this repo only (see PERSISTENCE_SETUP.md), redeploy, then publish again.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { ok: false, error: "Body must be JSON." });
    }
  }
  const appsError = validateApps(body?.apps);
  if (appsError) return json(res, 400, { ok: false, error: appsError });

  const repo = process.env.GITHUB_REPO || "techflowlabs6/mytechflowlabs-portal";
  const branch = process.env.GITHUB_BRANCH || "main";
  const apps = body.apps.map((app) => ({
    id: String(app.id || ""),
    name: String(app.name || "").trim(),
    shortNote: String(app.shortNote || "").trim(),
    url: String(app.url || "").trim(),
    imageUrl: String(app.imageUrl || "").trim(),
    description: String(app.description || "").trim(),
    category: String(app.category || "Productivity"),
  }));

  try {
    // 1. Uploaded images first, so the catalog can point at their committed paths.
    const incomingImages = Array.isArray(body.images)
      ? body.images
      : body.image
        ? [body.image]
        : [];
    const imageUrls = {};
    for (const image of incomingImages.slice(0, 10)) {
      const parts = dataUrlParts(image?.dataUrl);
      if (!parts)
        return json(res, 400, { ok: false, error: "An uploaded image is not a valid image file." });
      if (Math.floor((parts.base64.length * 3) / 4) > MAX_IMAGE_BYTES)
        return json(res, 400, { ok: false, error: "An uploaded image is over 2 MB after resizing." });
      const safeId =
        String(image.appId || "app").replace(/[^a-z0-9-]/gi, "").slice(0, 40) ||
        "app";
      const imagePath = `public/art/uploads/${safeId}-${Date.now()}.${parts.ext}`;
      await github(`/repos/${repo}/contents/${imagePath}`, token, "PUT", {
        message: `feat(portal): upload card image for ${safeId}`,
        content: parts.base64,
        branch,
      });
      const publicPath = `/${imagePath.replace(/^public\//, "")}`;
      imageUrls[image.appId] = publicPath;
      const target = apps.find((app) => app.id === image.appId);
      if (target) target.imageUrl = publicPath;
    }

    // 2. Commit the catalog. Updating needs the file's current SHA.
    const appsPath = "public/apps.json";
    let sha;
    try {
      const existing = await github(
        `/repos/${repo}/contents/${appsPath}?ref=${encodeURIComponent(branch)}`,
        token,
      );
      sha = existing?.sha;
    } catch (error) {
      if (error.status !== 404) throw error; // 404 = first publish, create it
    }
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      apps,
    };
    const commit = await github(`/repos/${repo}/contents/${appsPath}`, token, "PUT", {
      message:
        body.message ||
        `chore(portal): publish apps catalog (${apps.length} apps)`,
      content: Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    });

    return json(res, 200, {
      ok: true,
      committed: true,
      commitSha: commit?.commit?.sha || "",
      commitUrl: commit?.commit?.html_url || "",
      imageUrls,
      updatedAt: payload.updatedAt,
      note: "Committed to GitHub. Vercel will deploy it — new cards appear on every device after the deploy finishes.",
    });
  } catch (error) {
    const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 502;
    return json(res, status, {
      ok: false,
      error: `Could not commit to GitHub: ${error.message}`,
    });
  }
}
