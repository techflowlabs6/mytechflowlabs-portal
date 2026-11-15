import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import loginHandler, {
  formatAdminHash,
  hashAdminPassword,
  parseAdminHash,
  verifyAdminPassword,
} from "../api/login.js";
import {
  ADMIN_AUTH_KEY,
  clearAdminAuth,
  fetchLoginConfigured,
  readAdminAuth,
  verifyAdminPasswordRemote,
  writeAdminAuth,
} from "../src/lib/adminLogin.js";

// A test-only dummy password. It is not a real credential and is never
// used outside this file.
const TEST_PASSWORD = "test-password-123";
const WRONG_PASSWORD = "not-the-password";

const HASH = await hashAdminPassword(TEST_PASSWORD);

function fakeStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    _data: data,
  };
}

function mockRes() {
  const res = {
    _status: 0,
    _body: "",
    status(code) {
      this._status = code;
      return this;
    },
    setHeader() {
      return this;
    },
    end(body) {
      this._body = body;
    },
  };
  return res;
}

async function callHandler(req) {
  const res = mockRes();
  await loginHandler(req, res);
  return { status: res._status, body: JSON.parse(res._body || "{}") };
}

let savedHash;
beforeEach(() => {
  savedHash = process.env.ADMIN_PASSWORD_HASH;
});
afterEach(() => {
  if (savedHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
  else process.env.ADMIN_PASSWORD_HASH = savedHash;
});

// --- Hash format -----------------------------------------------------------

test("hash format: scrypt prefix, params, 16-byte salt, 64-byte key", () => {
  const parts = HASH.split(":");
  assert.equal(parts[0], "scrypt");
  assert.deepEqual(parts.slice(1, 4), ["16384", "8", "1"]);
  assert.equal(parts[4].length, 32); // 16-byte salt as hex
  assert.equal(parts[5].length, 128); // 64-byte key as hex
  assert.deepEqual(parseAdminHash(HASH), {
    n: 16384,
    r: 8,
    p: 1,
    salt: Buffer.from(parts[4], "hex"),
    key: Buffer.from(parts[5], "hex"),
  });
  assert.equal(formatAdminHash(parseAdminHash(HASH)), HASH);
});

test("hashing the same password twice gives different hashes, both valid", async () => {
  const other = await hashAdminPassword(TEST_PASSWORD);
  assert.notEqual(other, HASH);
  assert.equal(await verifyAdminPassword(TEST_PASSWORD, other), true);
});

test("verify: correct password passes, wrong or empty password fails", async () => {
  assert.equal(await verifyAdminPassword(TEST_PASSWORD, HASH), true);
  assert.equal(await verifyAdminPassword(WRONG_PASSWORD, HASH), false);
  assert.equal(await verifyAdminPassword("", HASH), false);
  assert.equal(await verifyAdminPassword(null, HASH), false);
});

test("verify: malformed stored hashes fail instead of throwing", async () => {
  const malformed = [
    "not-a-hash",
    "scrypt:16384:8:1:abcd", // too few parts
    "scrypt:16384:8:1:zz:ab", // non-hex
    "scrypt:10000:8:1:00:00", // N not a power of two
    "scrypt:16384:8:1:00:00", // salt/key too short
    "bcrypt:$2b$12$abcdefghijklmnopqrstuv",
    "",
    null,
    undefined,
  ];
  for (const stored of malformed) {
    assert.equal(await verifyAdminPassword(TEST_PASSWORD, stored), false);
  }
});

test("hashAdminPassword throws on an empty password", async () => {
  await assert.rejects(() => hashAdminPassword(""), /non-empty password/);
});

// --- Endpoint --------------------------------------------------------------

test("GET /api/login reports configured true/false from the env var", async () => {
  process.env.ADMIN_PASSWORD_HASH = HASH;
  assert.deepEqual((await callHandler({ method: "GET" })).body, {
    configured: true,
  });
  delete process.env.ADMIN_PASSWORD_HASH;
  assert.deepEqual((await callHandler({ method: "GET" })).body, {
    configured: false,
  });
});

test("POST /api/login: correct password ok, wrong password generic failure", async () => {
  process.env.ADMIN_PASSWORD_HASH = HASH;
  assert.deepEqual(
    await callHandler({ method: "POST", body: { password: TEST_PASSWORD } }),
    { status: 200, body: { ok: true } },
  );
  assert.deepEqual(
    await callHandler({ method: "POST", body: { password: WRONG_PASSWORD } }),
    { status: 200, body: { ok: false } },
  );
  assert.deepEqual(
    await callHandler({ method: "POST", body: {} }),
    { status: 200, body: { ok: false } },
  );
});

test("POST /api/login accepts a JSON-string body, like Vercel may pass", async () => {
  process.env.ADMIN_PASSWORD_HASH = HASH;
  const result = await callHandler({
    method: "POST",
    body: JSON.stringify({ password: TEST_PASSWORD }),
  });
  assert.deepEqual(result, { status: 200, body: { ok: true } });
});

test("POST /api/login without a configured hash is 501 not_configured", async () => {
  delete process.env.ADMIN_PASSWORD_HASH;
  assert.deepEqual(
    await callHandler({ method: "POST", body: { password: TEST_PASSWORD } }),
    { status: 501, body: { ok: false, error: "not_configured" } },
  );
});

test("POST /api/login with a malformed stored hash fails generically", async () => {
  process.env.ADMIN_PASSWORD_HASH = "garbage-value";
  assert.deepEqual(
    await callHandler({ method: "POST", body: { password: TEST_PASSWORD } }),
    { status: 200, body: { ok: false } },
  );
});

test("other methods are rejected with 405", async () => {
  assert.deepEqual(await callHandler({ method: "DELETE" }), {
    status: 405,
    body: { ok: false, error: "method_not_allowed" },
  });
});

// --- Client helpers --------------------------------------------------------

test("session flag: written on login, read back, cleared on logout", () => {
  const store = fakeStore();
  assert.equal(readAdminAuth(store), false);
  writeAdminAuth(store);
  assert.equal(store._data[ADMIN_AUTH_KEY], "1");
  assert.equal(readAdminAuth(store), true);
  clearAdminAuth(store);
  assert.equal(readAdminAuth(store), false);
  assert.equal(readAdminAuth(null), false);
  writeAdminAuth(null); // must not throw
  clearAdminAuth(null); // must not throw
});

test("fetchLoginConfigured: true/false from the endpoint, false on failure", async () => {
  const ok = async () => ({
    ok: true,
    json: async () => ({ configured: true }),
  });
  const notConfigured = async () => ({
    ok: true,
    json: async () => ({ configured: false }),
  });
  const badStatus = async () => ({ ok: false, json: async () => ({}) });
  const throwing = async () => {
    throw new Error("offline");
  };
  assert.equal(await fetchLoginConfigured(ok), true);
  assert.equal(await fetchLoginConfigured(notConfigured), false);
  assert.equal(await fetchLoginConfigured(badStatus), false);
  assert.equal(await fetchLoginConfigured(throwing), false);
});

test("verifyAdminPasswordRemote: ok, wrong, 501, and unreachable", async () => {
  const succeed = async () => ({
    status: 200,
    json: async () => ({ ok: true }),
  });
  const fail = async () => ({
    status: 200,
    json: async () => ({ ok: false }),
  });
  const unconfigured = async () => ({
    status: 501,
    json: async () => ({ ok: false, error: "not_configured" }),
  });
  const throwing = async () => {
    throw new Error("offline");
  };
  assert.deepEqual(await verifyAdminPasswordRemote("x", succeed), {
    ok: true,
  });
  assert.deepEqual(await verifyAdminPasswordRemote("x", fail), {
    ok: false,
  });
  assert.deepEqual(await verifyAdminPasswordRemote("x", unconfigured), {
    notConfigured: true,
  });
  assert.deepEqual(await verifyAdminPasswordRemote("x", throwing), {
    error: "unavailable",
  });
});
