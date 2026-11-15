/**
 * Uptime monitor for the portal: a live check of every catalogued app.
 *
 * No storage in v1 — each call checks the apps right now and returns
 * the result. The admin page calls it on demand (Refresh button).
 *
 * The app list comes from public/apps.json: read from disk first
 * (local dev / preview, where the file is on disk), falling back to
 * fetching /apps.json from this site's own origin on Vercel, where
 * the function bundle does not carry the public folder.
 *
 * Each app is fetched with HEAD and a 5 second timeout, falling back
 * to GET when a host answers 405 to HEAD. All checks run in parallel.
 *
 * GET /api/uptime
 *   -> { checkedAt, results: [{ id, name, url, ok, status, ms }] }
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED (that exact bug hit api/contact.js).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const CHECK_TIMEOUT_MS = 5000;

/** The committed public/apps.json shape: { version: 1, updatedAt, apps: [...] }. */
export function parseAppsPayload(text) {
  const parsed = JSON.parse(text);
  const apps = Array.isArray(parsed) ? parsed : parsed?.apps;
  if (!Array.isArray(apps)) {
    throw new Error("apps.json has no apps array.");
  }
  return apps
    .filter((app) => app && typeof app.url === "string" && app.url.trim())
    .map((app) => ({
      id: String(app.id ?? ""),
      name: String(app.name ?? app.id ?? ""),
      url: app.url.trim(),
    }));
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function fetchWithTimeout(url, method, fetchFn) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    return await fetchFn(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Pure helper, exported so tests can feed it a mocked fetch. */
export async function checkApp(app, fetchFn = fetch) {
  const started = Date.now();
  try {
    let response = await fetchWithTimeout(app.url, "HEAD", fetchFn);
    if (response.status === 405) {
      response = await fetchWithTimeout(app.url, "GET", fetchFn);
    }
    const ms = Date.now() - started;
    const status = response.status || 0;
    return {
      id: app.id,
      name: app.name,
      url: app.url,
      ok: status >= 200 && status < 400,
      status,
      ms,
    };
  } catch {
    return {
      id: app.id,
      name: app.name,
      url: app.url,
      ok: false,
      status: 0,
      ms: Date.now() - started,
    };
  }
}

async function loadApps(req) {
  try {
    const text = await readFile(
      path.join(process.cwd(), "public", "apps.json"),
      "utf8",
    );
    return parseAppsPayload(text);
  } catch {
    // On Vercel the function bundle does not carry the public folder,
    // so fetch the committed catalog from this site's own origin.
  }
  const host = req?.headers?.host;
  if (!host) {
    throw new Error("Could not load the app list.");
  }
  const proto = req.headers["x-forwarded-proto"] || "https";
  const response = await fetch(`${proto}://${host}/apps.json`);
  if (!response.ok) {
    throw new Error(`apps.json answered ${response.status}.`);
  }
  return parseAppsPayload(await response.text());
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Use GET for this endpoint." });
  }
  try {
    const apps = await loadApps(req);
    const results = await Promise.all(apps.map((app) => checkApp(app)));
    return json(res, 200, {
      checkedAt: new Date().toISOString(),
      results,
    });
  } catch {
    return json(res, 502, {
      error: "Could not check uptime right now.",
    });
  }
}
