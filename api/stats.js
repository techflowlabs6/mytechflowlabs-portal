/**
 * Shared visitor counts for the portal: launches and likes per app.
 *
 * Two shared backends, in precedence order:
 *
 * 1. Google Drive JSON file — a single portal-stats.json in the
 *    mytechflowlabs-portal folder, read and rewritten on every event.
 *    Needs GOOGLE_SERVICE_ACCOUNT_KEY (the service-account JSON as a
 *    string) and DRIVE_STATS_FILE_ID. Setup: DRIVE_STATS_SETUP.md.
 *    Known limits: read-modify-write can lose a count if two visitors
 *    click at the exact same moment, and each event is a Drive call
 *    (~1 second). Service-account auth is done with node:crypto only
 *    (RS256 JWT) — no new dependency.
 *
 * 2. Vercel KV (Upstash Redis) over its REST API — needs
 *    KV_REST_API_URL and KV_REST_API_TOKEN. Setup: KV_SETUP.md.
 *
 * Until either backend is configured this endpoint answers 501 with
 * `stats_not_configured` and the site falls back to per-device counts
 * in localStorage (see src/lib/stats.js).
 *
 * GET  /api/stats?ids=a,b,c   -> { shared: true, launches: {id: n}, likes: {id: n} }
 * POST /api/stats { appId, event: "launch" | "like" | "unlike" }
 *      -> { ok: true, launches: n, likes: n }
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED (that exact bug hit api/contact.js).
 */

import crypto from "node:crypto";

const LAUNCH_PREFIX = "portal:launches:";
const LIKE_PREFIX = "portal:likes:";
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function kvConfig() {
  const url = (process.env.KV_REST_API_URL || "").replace(/\/$/, "");
  const token = process.env.KV_REST_API_TOKEN || "";
  return url && token ? { url, token } : null;
}

function driveConfig() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "";
  const fileId = process.env.DRIVE_STATS_FILE_ID || "";
  if (!raw || !fileId) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    const clientEmail = parsed.client_email || "";
    const privateKey = parsed.private_key || "";
    if (!clientEmail || !privateKey) {
      return null;
    }
    return { clientEmail, privateKey, fileId };
  } catch {
    return null;
  }
}

async function kvFetch(config, path, options = {}) {
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`KV request failed (${response.status}).`);
  }
  return response.json();
}

function toCount(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function readCounts(config, ids) {
  const commands = ids.flatMap((id) => [
    ["GET", `${LAUNCH_PREFIX}${id}`],
    ["GET", `${LIKE_PREFIX}${id}`],
  ]);
  const results = await kvFetch(config, "/pipeline", {
    method: "POST",
    body: JSON.stringify(commands),
  });
  const launches = {};
  const likes = {};
  ids.forEach((id, index) => {
    launches[id] = toCount(results[index * 2]?.result);
    likes[id] = toCount(results[index * 2 + 1]?.result);
  });
  return { launches, likes };
}

// ---------------------------------------------------------------------------
// Google Drive backend (portal-stats.json, read-modify-write)
// ---------------------------------------------------------------------------

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function driveJwt(config) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const claims = base64url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: DRIVE_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(config.privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

async function driveAccessToken(config) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: driveJwt(config),
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`Drive token exchange failed (${response.status}).`);
  }
  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Drive token exchange returned no access token.");
  }
  return data.access_token;
}

function emptyDriveStats() {
  return { version: 1, updatedAt: new Date().toISOString(), launches: {}, likes: {} };
}

function normalizeDriveStats(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyDriveStats();
  }
  const launches = {};
  const likes = {};
  for (const [id, value] of Object.entries(parsed.launches || {})) {
    if (ID_PATTERN.test(id)) {
      launches[id] = toCount(value);
    }
  }
  for (const [id, value] of Object.entries(parsed.likes || {})) {
    if (ID_PATTERN.test(id)) {
      likes[id] = toCount(value);
    }
  }
  return { version: 1, updatedAt: new Date().toISOString(), launches, likes };
}

class DrivePreconditionError extends Error {}

async function readDriveStats(config, token) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(config.fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  // A missing file (404) is treated like an empty store — the first
  // write creates the content. Any other failure is a real error.
  if (response.status === 404) {
    return { stats: emptyDriveStats(), etag: null };
  }
  if (!response.ok) {
    throw new Error(`Drive read failed (${response.status}).`);
  }
  const text = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Malformed stored JSON counts as empty, never as a crash.
    parsed = null;
  }
  const etag = response.headers?.get?.("etag") || null;
  return { stats: normalizeDriveStats(parsed), etag };
}

async function writeDriveStats(config, token, stats, etag) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (etag) {
    // Guard against overwriting a change made since our read.
    headers["If-Match"] = etag;
  }
  const response = await fetch(
    `https://upload.googleapis.com/upload/drive/v3/files/${encodeURIComponent(config.fileId)}?uploadType=media`,
    { method: "PATCH", headers, body: JSON.stringify(stats) },
  );
  if (response.status === 412) {
    throw new DrivePreconditionError("Drive file changed since read.");
  }
  if (!response.ok) {
    throw new Error(`Drive write failed (${response.status}).`);
  }
}

function applyDriveEvent(stats, appId, event) {
  if (event === "launch") {
    stats.launches[appId] = toCount(stats.launches[appId]) + 1;
  } else if (event === "like") {
    stats.likes[appId] = toCount(stats.likes[appId]) + 1;
  } else if (event === "unlike") {
    stats.likes[appId] = Math.max(0, toCount(stats.likes[appId]) - 1);
  }
  stats.updatedAt = new Date().toISOString();
  return stats;
}

async function handleDriveGet(config, ids) {
  const token = await driveAccessToken(config);
  const { stats } = await readDriveStats(config, token);
  const launches = {};
  const likes = {};
  for (const id of ids) {
    launches[id] = toCount(stats.launches[id]);
    likes[id] = toCount(stats.likes[id]);
  }
  return { shared: true, launches, likes };
}

async function handleDrivePost(config, appId, event) {
  const token = await driveAccessToken(config);
  // Read-modify-write with one retry if the file changed under us (412).
  for (let attempt = 0; attempt < 2; attempt++) {
    const { stats, etag } = await readDriveStats(config, token);
    const next = applyDriveEvent(stats, appId, event);
    try {
      await writeDriveStats(config, token, next, etag);
      return {
        ok: true,
        launches: toCount(next.launches[appId]),
        likes: toCount(next.likes[appId]),
      };
    } catch (error) {
      if (error instanceof DrivePreconditionError && attempt === 0) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Drive write failed after retry.");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  const drive = driveConfig();
  const kv = drive ? null : kvConfig();
  if (!drive && !kv) {
    return json(res, 501, {
      code: "stats_not_configured",
      error:
        "Shared counts are not set up yet. Set GOOGLE_SERVICE_ACCOUNT_KEY + DRIVE_STATS_FILE_ID (see DRIVE_STATS_SETUP.md) or create a Vercel KV database and set KV_REST_API_URL and KV_REST_API_TOKEN (see KV_SETUP.md) — until then counts stay on each visitor's own device.",
    });
  }

  try {
    if (req.method === "GET") {
      const raw = String(req.query?.ids || "");
      const ids = raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => ID_PATTERN.test(id))
        .slice(0, 50);
      if (!ids.length) {
        return json(res, 400, { error: "Pass app ids, e.g. ?ids=lexi-parcours,1" });
      }
      if (drive) {
        return json(res, 200, await handleDriveGet(drive, ids));
      }
      const { launches, likes } = await readCounts(kv, ids);
      return json(res, 200, { shared: true, launches, likes });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const appId = String(body.appId || "");
      const event = String(body.event || "");
      if (!ID_PATTERN.test(appId)) {
        return json(res, 400, { error: "Pass a valid appId." });
      }
      if (event !== "launch" && event !== "like" && event !== "unlike") {
        return json(res, 400, {
          error: 'event must be "launch", "like" or "unlike".',
        });
      }
      if (drive) {
        return json(res, 200, await handleDrivePost(drive, appId, event));
      }
      if (event === "launch") {
        await kvFetch(kv, `/incr/${LAUNCH_PREFIX}${appId}`, {
          method: "POST",
        });
      } else if (event === "like") {
        await kvFetch(kv, `/incr/${LIKE_PREFIX}${appId}`, {
          method: "POST",
        });
      } else if (event === "unlike") {
        const dec = await kvFetch(kv, `/decr/${LIKE_PREFIX}${appId}`, {
          method: "POST",
        });
        // Likes can never go below zero (a visitor un-liking twice, or a
        // stale client). toCount() clamps on read, so check the raw value.
        if (Number.parseInt(dec.result, 10) < 0) {
          await kvFetch(kv, `/set/${LIKE_PREFIX}${appId}/0`, {
            method: "POST",
          });
        }
      }
      const { launches, likes } = await readCounts(kv, [appId]);
      return json(res, 200, {
        ok: true,
        launches: launches[appId],
        likes: likes[appId],
      });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Use GET or POST for this endpoint." });
  } catch {
    return json(res, 502, {
      error: "Could not reach the counts store. Try again in a moment.",
    });
  }
}
