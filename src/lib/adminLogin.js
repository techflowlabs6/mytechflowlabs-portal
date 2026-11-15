/**
 * Client side of the admin password login.
 *
 * The password is verified server-side by /api/login — nothing here
 * ever sees the hash, and no password or hash value is stored in the
 * browser. A successful password login is remembered for this tab
 * session only (sessionStorage), never in localStorage: closing the
 * tab means logging in again.
 *
 * When no password login is configured, the caller falls back to the
 * old email check — the client never locks Naveen out before he sets
 * the hash up.
 */

export const ADMIN_AUTH_KEY = "mytechflow_admin_auth";

/** True when this tab session already passed the password check. */
export function readAdminAuth(sessionStore) {
  try {
    return sessionStore?.getItem?.(ADMIN_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAdminAuth(sessionStore) {
  try {
    sessionStore?.setItem?.(ADMIN_AUTH_KEY, "1");
  } catch {
    /* A session-only flag is a bonus; the page works without it. */
  }
}

export function clearAdminAuth(sessionStore) {
  try {
    sessionStore?.removeItem?.(ADMIN_AUTH_KEY);
  } catch {
    /* Nothing to clean up. */
  }
}

/**
 * Ask the server whether a password login is configured. Never throws:
 * any failure (offline, server error) reads as "not configured", so the
 * old email check stays available.
 */
export async function fetchLoginConfigured(fetchFn = fetch) {
  try {
    const response = await fetchFn("/api/login");
    if (!response.ok) return false;
    const data = await response.json();
    return data?.configured === true;
  } catch {
    return false;
  }
}

/**
 * Verify a password with the server.
 * Returns { ok } for a decided answer, { notConfigured: true } when no
 * hash is set on the server, or { error: "unavailable" } when the
 * server cannot be reached at all.
 */
export async function verifyAdminPasswordRemote(password, fetchFn = fetch) {
  try {
    const response = await fetchFn("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.status === 501) return { notConfigured: true };
    const data = await response.json();
    return { ok: data?.ok === true };
  } catch {
    return { error: "unavailable" };
  }
}
