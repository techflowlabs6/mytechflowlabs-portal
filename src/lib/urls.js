/**
 * Duplicate-link detector — normalizes app URLs so the same destination
 * written different ways still collides, then groups the apps that point
 * at the same place. Pure functions; no DOM, no storage.
 *
 * Normalization: lowercase host, strip a leading www., http and https
 * count as the same, trailing slashes go, query strings and #fragments
 * are dropped. The path keeps its case (paths can be case-sensitive).
 * Anything that is not a valid http(s) URL normalizes to "" and is
 * ignored by the detector.
 */

export function normalizeUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host) return "";
  const path = url.pathname.replace(/\/+$/, "");
  return `https://${host}${path}`;
}

/**
 * Returns [{ url, apps: [{ id, name }] }] — one entry per normalized URL
 * shared by two or more apps. Apps with an empty or invalid URL are
 * skipped, never grouped.
 */
export function findDuplicateUrls(apps) {
  const groups = new Map();
  for (const app of apps || []) {
    const key = normalizeUrl(app?.url);
    if (!key) continue;
    const list = groups.get(key) || [];
    list.push({ id: String(app?.id ?? ""), name: String(app?.name ?? "") });
    groups.set(key, list);
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([url, list]) => ({ url, apps: list }));
}
