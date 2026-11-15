/**
 * Visitor counts and likes, shared when Vercel KV is configured and
 * per-device (localStorage) when it is not.
 *
 * - Launches: always counted on this device (portalState's launch counts);
 *   also POSTed to /api/stats, which stores the shared total in KV.
 * - Likes: one like per visitor per app, remembered on this device; the
 *   shared total lives in KV. Un-liking sends "unlike".
 * - Display rule: shared totals win when the API answers; otherwise the
 *   device's own numbers are shown. Nothing here ever blocks the page —
 *   every network call fails soft.
 */

export const LIKES_KEY = "mytechflow_likes_v1";

export function formatCount(value) {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  const m = n / 1_000_000;
  return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
}

export function readLikedIds(store) {
  try {
    const raw = JSON.parse(store?.getItem(LIKES_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Flip this visitor's like for an app. Returns { liked, ids }. */
export function toggleLikedLocal(store, appId) {
  const ids = readLikedIds(store);
  const liked = !ids.includes(appId);
  const next = liked ? [...ids, appId] : ids.filter((id) => id !== appId);
  try {
    store?.setItem(LIKES_KEY, JSON.stringify(next));
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return { liked, ids: next };
}

export async function fetchSharedStats(ids, fetchFn = fetch) {
  const clean = [...new Set(ids)].filter(Boolean).slice(0, 50);
  if (!clean.length) return { shared: false, launches: {}, likes: {} };
  try {
    const response = await fetchFn(
      `/api/stats?ids=${clean.map(encodeURIComponent).join(",")}`,
    );
    if (!response.ok) return { shared: false, launches: {}, likes: {} };
    const data = await response.json();
    if (!data?.shared) return { shared: false, launches: {}, likes: {} };
    return {
      shared: true,
      launches: data.launches || {},
      likes: data.likes || {},
    };
  } catch {
    return { shared: false, launches: {}, likes: {} };
  }
}

export async function recordSharedEvent(appId, event, fetchFn = fetch) {
  try {
    const response = await fetchFn("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, event }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * The count to show for an app: the shared total when KV is live,
 * otherwise this device's own number. Local likes are a set, so they
 * contribute 1 when this visitor liked the app.
 */
export function effectiveCounts(localLaunches, likedIds, shared) {
  const launches = {};
  const likes = {};
  const ids = new Set([
    ...Object.keys(localLaunches || {}),
    ...(likedIds || []),
    ...Object.keys(shared?.launches || {}),
    ...Object.keys(shared?.likes || {}),
  ]);
  ids.forEach((id) => {
    launches[id] =
      shared?.shared && typeof shared.launches[id] === "number"
        ? shared.launches[id]
        : localLaunches[id] || 0;
    likes[id] =
      shared?.shared && typeof shared.likes[id] === "number"
        ? shared.likes[id]
        : likedIds.includes(id)
          ? 1
          : 0;
  });
  return { launches, likes };
}
