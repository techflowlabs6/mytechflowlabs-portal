/**
 * Small per-device UI preferences, stored in localStorage.
 *
 * The Latest videos section is collapsed by default — Naveen opens it
 * only when he wants to see it — and the choice is remembered per
 * device, so it stays the way he left it.
 */

export const VIDEOS_KEY = "mytechflow_videos_open";

/** True only when the visitor previously opened the videos section. */
export function readVideosOpen(store) {
  try {
    return store?.getItem?.(VIDEOS_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeVideosOpen(store, open) {
  try {
    store?.setItem?.(VIDEOS_KEY, open ? "1" : "0");
  } catch {
    /* Preferences are a bonus; the page works without them. */
  }
}
