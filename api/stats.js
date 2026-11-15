/**
 * Shared visitor counts for the portal: launches and likes per app.
 *
 * Storage: Vercel KV (Upstash Redis) over its REST API — no dependency to
 * install, just two env vars. Until KV is configured this endpoint answers
 * 501 with `stats_not_configured` and the site falls back to per-device
 * counts in localStorage (see src/lib/stats.js). Setup: KV_SETUP.md.
 *
 * GET  /api/stats?ids=a,b,c   -> { shared: true, launches: {id: n}, likes: {id: n} }
 * POST /api/stats { appId, event: "launch" | "like" | "unlike" }
 *      -> { ok: true, launches: n, likes: n }
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED (that exact bug hit api/contact.js).
 */

const LAUNCH_PREFIX = "portal:launches:";
const LIKE_PREFIX = "portal:likes:";
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function kvConfig() {
  const url = (process.env.KV_REST_API_URL || "").replace(/\/$/, "");
  const token = process.env.KV_REST_API_TOKEN || "";
  return url && token ? { url, token } : null;
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

export default async function handler(req, res) {
  const config = kvConfig();
  if (!config) {
    return json(res, 501, {
      code: "stats_not_configured",
      error:
        "Shared counts are not set up yet. Create a Vercel KV database and set KV_REST_API_URL and KV_REST_API_TOKEN (see KV_SETUP.md) — until then counts stay on each visitor's own device.",
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
      const { launches, likes } = await readCounts(config, ids);
      return json(res, 200, { shared: true, launches, likes });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const appId = String(body.appId || "");
      const event = String(body.event || "");
      if (!ID_PATTERN.test(appId)) {
        return json(res, 400, { error: "Pass a valid appId." });
      }
      if (event === "launch") {
        await kvFetch(config, `/incr/${LAUNCH_PREFIX}${appId}`, {
          method: "POST",
        });
      } else if (event === "like") {
        await kvFetch(config, `/incr/${LIKE_PREFIX}${appId}`, {
          method: "POST",
        });
      } else if (event === "unlike") {
        const dec = await kvFetch(config, `/decr/${LIKE_PREFIX}${appId}`, {
          method: "POST",
        });
        // Likes can never go below zero (a visitor un-liking twice, or a
        // stale client). toCount() clamps on read, so check the raw value.
        if (Number.parseInt(dec.result, 10) < 0) {
          await kvFetch(config, `/set/${LIKE_PREFIX}${appId}/0`, {
            method: "POST",
          });
        }
      } else {
        return json(res, 400, {
          error: 'event must be "launch", "like" or "unlike".',
        });
      }
      const { launches, likes } = await readCounts(config, [appId]);
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
