/**
 * Admin password login for the portal.
 *
 * The password itself is never stored anywhere. Naveen keeps only its
 * scrypt hash in a Vercel env var, ADMIN_PASSWORD_HASH, generated with
 * scripts/make-admin-hash.mjs. The check runs here, server-side — the
 * hash never reaches the browser.
 *
 * Hash format: scrypt:<N>:<r>:<p>:<saltHex>:<keyHex>
 * (N=16384, r=8, p=1, 64-byte key, random 16-byte salt.)
 *
 * GET /api/login
 *   -> { configured: true|false } — true when ADMIN_PASSWORD_HASH is set.
 *
 * POST /api/login { password }
 *   -> { ok: true } on a match, { ok: false } on any mismatch.
 *   A malformed hash, a missing password and a wrong password all give
 *   the same generic failure — no hints about which one failed.
 *   When no hash is configured at all:
 *   -> 501 { ok: false, error: "not_configured" }
 *   (the client keeps the old email check in that case, so Naveen is
 *   never locked out before he sets the hash up.)
 *
 * This only locks the admin screen. It does not replace
 * ADMIN_PUBLISH_TOKEN, which still gates publishing and the messages
 * inbox.
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED (that exact bug hit api/contact.js).
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export const SCRYPT_N = 16384;
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;
export const SCRYPT_KEY_LEN = 64;
export const SCRYPT_SALT_LEN = 16;

/** Parse a stored hash, or null when it is not a well-formed hash. */
export function parseAdminHash(value) {
  if (typeof value !== "string") return null;
  const parts = value.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return null;
  }
  // scrypt requires N to be a power of two greater than 1.
  if (n <= 1 || (n & (n - 1)) !== 0 || r < 1 || p < 1) return null;
  if (!/^[0-9a-fA-F]+$/.test(parts[4]) || !/^[0-9a-fA-F]+$/.test(parts[5])) {
    return null;
  }
  const salt = Buffer.from(parts[4], "hex");
  const key = Buffer.from(parts[5], "hex");
  if (salt.length !== SCRYPT_SALT_LEN || key.length !== SCRYPT_KEY_LEN) {
    return null;
  }
  return { n, r, p, salt, key };
}

export function formatAdminHash({ n, r, p, salt, key }) {
  return ["scrypt", n, r, p, salt.toString("hex"), key.toString("hex")].join(
    ":",
  );
}

/** Hash a password with a fresh random salt. Throws on an empty password. */
export async function hashAdminPassword(password) {
  if (typeof password !== "string" || !password) {
    throw new Error("A non-empty password is required.");
  }
  const salt = randomBytes(SCRYPT_SALT_LEN);
  const key = await scrypt(password, salt, SCRYPT_KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return formatAdminHash({ n: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, salt, key });
}

/**
 * True only when the password matches the stored hash. Never throws:
 * a malformed hash or an unusable password is simply a mismatch.
 */
export async function verifyAdminPassword(password, storedHash) {
  try {
    if (typeof password !== "string" || !password) return false;
    const parsed = parseAdminHash(storedHash);
    if (!parsed) return false;
    const key = await scrypt(password, parsed.salt, parsed.key.length, {
      N: parsed.n,
      r: parsed.r,
      p: parsed.p,
    });
    return (
      key.length === parsed.key.length && timingSafeEqual(key, parsed.key)
    );
  } catch {
    return false;
  }
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  // Vercel parses JSON bodies already; accept an object or a JSON string.
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return json(res, 200, {
      configured: Boolean(process.env.ADMIN_PASSWORD_HASH),
    });
  }
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  if (!stored) {
    return json(res, 501, { ok: false, error: "not_configured" });
  }
  const body = readBody(req);
  const ok = await verifyAdminPassword(body?.password, stored);
  return json(res, 200, { ok });
}
