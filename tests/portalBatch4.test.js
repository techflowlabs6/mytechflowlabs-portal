import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { ACCENT_PRESETS, DEFAULT_ACCENT, presetById, readAccent, resolveAccent, writeAccent } from "../src/lib/accentTheme.js";
import { createNote, deleteNote, readNotes, upsertNote, writeNotes } from "../src/lib/notes.js";
import { createRenewal, daysUntil, deleteRenewal, readRenewals, renewalStatus, seedRenewals, sortRenewals, upsertRenewal, writeRenewals } from "../src/lib/renewals.js";
import { findDuplicateUrls, normalizeUrl } from "../src/lib/urls.js";
import messagesHandler from "../api/messages.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function memStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
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

async function callHandler(handler, req) {
  const res = mockRes();
  await handler(req, res);
  return { status: res._status, body: JSON.parse(res._body || "{}") };
}

function mockResponse({ ok = true, status = 200, jsonData = null, textData = null, etag = null } = {}) {
  return {
    ok,
    status,
    json: async () => jsonData,
    text: async () => textData,
    headers: {
      get: (name) => (name.toLowerCase() === "etag" ? etag : null),
    },
  };
}

async function withEnv(vars, fn) {
  const keys = [
    "GOOGLE_SERVICE_ACCOUNT_KEY",
    "DRIVE_STATS_FILE_ID",
    "DRIVE_MESSAGES_FILE_ID",
    "ADMIN_PUBLISH_TOKEN",
    "RESEND_API_KEY",
    "CONTACT_FROM",
  ];
  const saved = {};
  for (const key of keys) saved[key] = process.env[key];
  try {
    for (const key of keys) delete process.env[key];
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    return await fn();
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

async function withFetch(fetchMock, fn) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    return await fn();
  } finally {
    globalThis.fetch = realFetch;
  }
}

// A real RSA keypair so the RS256 JWTs the handlers sign are genuine.
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const SA_EMAIL = "portal-stats@test-project.iam.gserviceaccount.com";
const SA_JSON = JSON.stringify({
  type: "service_account",
  client_email: SA_EMAIL,
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
});
const MESSAGES_FILE_ID = "1oOQP36nZ2WIHIdQOCWsqpZTexywgHZuk";
const DRIVE_ENV = {
  GOOGLE_SERVICE_ACCOUNT_KEY: SA_JSON,
  DRIVE_MESSAGES_FILE_ID: MESSAGES_FILE_ID,
  ADMIN_PUBLISH_TOKEN: "test-admin-token",
};

function makeDriveFetch(scenario = {}) {
  const calls = [];
  const state = {
    stored: scenario.stored !== undefined ? scenario.stored : '{"version":1,"messages":[]}',
    etag: scenario.etag !== undefined ? scenario.etag : "etag-1",
    writes: [],
  };
  const fetchMock = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", headers: options.headers || {}, body: options.body });
    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      if (scenario.failToken) return mockResponse({ ok: false, status: 500 });
      return mockResponse({ jsonData: { access_token: "test-access-token" } });
    }
    if (url.startsWith("https://www.googleapis.com/drive/v3/files/")) {
      if (scenario.failRead) return mockResponse({ ok: false, status: 500 });
      if (scenario.read404) return mockResponse({ ok: false, status: 404 });
      return mockResponse({ textData: state.stored, etag: state.etag });
    }
    if (url.startsWith("https://upload.googleapis.com/upload/drive/v3/files/")) {
      state.writes.push({ body: options.body, headers: options.headers });
      if (scenario.write412First && state.writes.length === 1) {
        state.stored = scenario.concurrentStored;
        state.etag = "etag-2";
        return mockResponse({ ok: false, status: 412 });
      }
      if (scenario.failWrite) return mockResponse({ ok: false, status: 500 });
      state.stored = options.body;
      return mockResponse({ jsonData: {} });
    }
    throw new Error(`unexpected fetch: ${url}`);
  };
  return { fetch: fetchMock, calls, state };
}

function decodeJwt(assertion) {
  const [header, claims, signature] = assertion.split(".");
  return {
    header: JSON.parse(Buffer.from(header, "base64url").toString()),
    claims: JSON.parse(Buffer.from(claims, "base64url").toString()),
    signature,
    signingInput: `${header}.${claims}`,
  };
}

// api/contact.js is ESM now (PR #5), so the handler is imported directly
// like api/messages.js above. It reads the global fetch at call time, so
// the mock is installed around each call and restored after.
import contactHandler from "../api/contact.js";

function loadContactHandler(fetchFn) {
  return async (req, res) => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = fetchFn;
    try {
      return await contactHandler(req, res);
    } finally {
      globalThis.fetch = realFetch;
    }
  };
}

// ---------------------------------------------------------------------------
// Theme presets (#20)
// ---------------------------------------------------------------------------

test("accent presets: six presets, unique ids, valid hex colours", () => {
  assert.equal(ACCENT_PRESETS.length, 6);
  const ids = ACCENT_PRESETS.map((preset) => preset.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ACCENT_PRESETS[0].id, DEFAULT_ACCENT);
  for (const preset of ACCENT_PRESETS) {
    for (const mode of ["light", "dark"]) {
      for (const value of Object.values(preset[mode])) {
        assert.match(value, /^#[0-9a-f]{6}$/, `${preset.id} ${mode} colour ${value}`);
      }
    }
  }
});

test("resolveAccent falls back to the default for unknown or empty values", () => {
  assert.equal(resolveAccent("ocean"), "ocean");
  assert.equal(resolveAccent("nope"), DEFAULT_ACCENT);
  assert.equal(resolveAccent(""), DEFAULT_ACCENT);
  assert.equal(resolveAccent(undefined), DEFAULT_ACCENT);
});

test("presetById returns the default preset for an unknown id", () => {
  assert.equal(presetById("mint").name, "Forest Mint");
  assert.equal(presetById("nope").id, DEFAULT_ACCENT);
});

test("accent choice round-trips through storage", () => {
  const store = memStorage();
  assert.equal(readAccent(store), DEFAULT_ACCENT);
  assert.equal(writeAccent(store, "violet"), "violet");
  assert.equal(readAccent(store), "violet");
  assert.equal(writeAccent(store, "nope"), DEFAULT_ACCENT);
  assert.equal(readAccent(store), DEFAULT_ACCENT);
});

// ---------------------------------------------------------------------------
// Scratchpad (#14)
// ---------------------------------------------------------------------------

test("notes: create, add, update, delete, damaged storage reads as empty", () => {
  const note = createNote("  Title  ", "body");
  assert.equal(note.title, "Title");
  assert.equal(note.body, "body");
  assert.ok(note.id);
  assert.ok(note.createdAt);

  let notes = upsertNote([], note);
  assert.equal(notes.length, 1);
  const edited = { ...note, title: "New title" };
  notes = upsertNote(notes, edited);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, "New title");
  notes = deleteNote(notes, note.id);
  assert.deepEqual(notes, []);

  const store = memStorage();
  assert.deepEqual(readNotes(store), []);
  assert.equal(writeNotes(store, [note]), true);
  assert.equal(readNotes(store).length, 1);
  store.setItem("mytechflow_notes_v1", "{not json");
  assert.deepEqual(readNotes(store), []);
});

// ---------------------------------------------------------------------------
// Renewal calendar (#9)
// ---------------------------------------------------------------------------

test("daysUntil counts whole days from today", () => {
  const now = new Date(2026, 10, 15); // 15 Nov 2026
  assert.equal(daysUntil("2026-11-15", now), 0);
  assert.equal(daysUntil("2026-11-16", now), 1);
  assert.equal(daysUntil("2026-11-14", now), -1);
  assert.equal(daysUntil("2026-12-15", now), 30);
  assert.equal(daysUntil("", now), null);
  assert.equal(daysUntil("not-a-date", now), null);
});

test("renewalStatus thresholds: overdue, soon, watch, ok, nodate", () => {
  const now = new Date(2026, 10, 15);
  assert.equal(renewalStatus({ date: "2026-11-14" }, now), "overdue");
  assert.equal(renewalStatus({ date: "2026-11-15" }, now), "soon");
  assert.equal(renewalStatus({ date: "2026-12-15" }, now), "soon");
  assert.equal(renewalStatus({ date: "2026-12-16" }, now), "watch");
  assert.equal(renewalStatus({ date: "2027-02-13" }, now), "watch");
  assert.equal(renewalStatus({ date: "2027-02-14" }, now), "ok");
  assert.equal(renewalStatus({ date: "" }, now), "nodate");
});

test("sortRenewals puts dated soonest-first, undated last by name", () => {
  const now = new Date(2026, 10, 15);
  const sorted = sortRenewals(
    [
      { id: "a", name: "zeta", kind: "domain", date: "", cost: "" },
      { id: "b", name: "beta", kind: "domain", date: "2026-12-01", cost: "" },
      { id: "c", name: "alpha", kind: "domain", date: "2026-11-20", cost: "" },
      { id: "d", name: "apple", kind: "domain", date: "", cost: "" },
    ],
    now,
  );
  assert.deepEqual(
    sorted.map((item) => item.id),
    ["c", "b", "d", "a"],
  );
});

test("seedRenewals takes one entry per unique hostname, skips bad URLs", () => {
  const seeded = seedRenewals([
    { id: "1", url: "https://lexi.mytechflowlabs.com/" },
    { id: "2", url: "https://www.lexi.mytechflowlabs.com/learn" },
    { id: "3", url: "https://example.com/app" },
    { id: "4", url: "not a url" },
    { id: "5", url: "" },
  ]);
  assert.deepEqual(
    seeded.map((item) => item.name),
    ["lexi.mytechflowlabs.com", "example.com"],
  );
  assert.ok(seeded.every((item) => item.kind === "domain" && item.date === ""));
});

test("renewals storage: null when never saved, round-trip otherwise", () => {
  const store = memStorage();
  assert.equal(readRenewals(store), null);
  const renewal = createRenewal({ name: "example.com", kind: "bogus", date: "2027-01-01", cost: "$12" });
  assert.equal(renewal.kind, "domain"); // unknown kind falls back
  let list = upsertRenewal([], renewal);
  assert.equal(writeRenewals(store, list), true);
  assert.equal(readRenewals(store).length, 1);
  list = deleteRenewal(list, renewal.id);
  assert.deepEqual(list, []);
});

// ---------------------------------------------------------------------------
// Duplicate-link detector (#18)
// ---------------------------------------------------------------------------

test("normalizeUrl strips www, trailing slash, query, hash; http == https", () => {
  assert.equal(normalizeUrl("https://www.Example.com/App/?x=1#top"), "https://example.com/App");
  assert.equal(normalizeUrl("http://example.com/App/"), "https://example.com/App");
  assert.equal(normalizeUrl("https://example.com"), "https://example.com");
  assert.equal(normalizeUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeUrl("javascript:alert(1)"), "");
  assert.equal(normalizeUrl("not a url"), "");
  assert.equal(normalizeUrl(""), "");
  assert.equal(normalizeUrl(null), "");
});

test("findDuplicateUrls groups only real collisions", () => {
  const groups = findDuplicateUrls([
    { id: "a", name: "Alpha", url: "https://example.com/app" },
    { id: "b", name: "Beta", url: "https://www.example.com/app/?ref=x" },
    { id: "c", name: "Gamma", url: "http://example.com/app/" },
    { id: "d", name: "Delta", url: "https://other.com/" },
    { id: "e", name: "Epsilon", url: "not a url" },
    { id: "f", name: "Zeta", url: "" },
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].url, "https://example.com/app");
  assert.deepEqual(
    groups[0].apps.map((app) => app.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(findDuplicateUrls([{ id: "a", url: "https://x.com/" }]), []);
});

// ---------------------------------------------------------------------------
// Messages inbox endpoint (#19)
// ---------------------------------------------------------------------------

test("messages GET: 405 for other methods", async () => {
  const result = await callHandler(messagesHandler, { method: "POST", headers: {} });
  assert.equal(result.status, 405);
});

test("messages GET: 501 when the admin token is not configured", async () => {
  await withEnv({ ...DRIVE_ENV, ADMIN_PUBLISH_TOKEN: undefined }, async () => {
    const result = await callHandler(messagesHandler, { method: "GET", headers: {} });
    assert.equal(result.status, 501);
    assert.equal(result.body.code, "publish_not_configured");
  });
});

test("messages GET: 401 for a wrong token", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const result = await callHandler(messagesHandler, {
      method: "GET",
      headers: { authorization: "Bearer wrong" },
    });
    assert.equal(result.status, 401);
  });
});

test("messages GET: 501 when Drive is not configured", async () => {
  await withEnv({ ADMIN_PUBLISH_TOKEN: "test-admin-token" }, async () => {
    const result = await callHandler(messagesHandler, {
      method: "GET",
      headers: { authorization: "Bearer test-admin-token" },
    });
    assert.equal(result.status, 501);
    assert.equal(result.body.code, "messages_not_configured");
  });
});

test("messages GET: returns stored messages newest first, drops bad entries", async () => {
  const stored = JSON.stringify({
    version: 1,
    messages: [
      { id: "old", type: "message", name: "Old", email: "old@x.com", message: "first", createdAt: "2026-11-14T10:00:00.000Z" },
      { id: "new", type: "subscribe", name: "", email: "new@x.com", message: "", createdAt: "2026-11-15T10:00:00.000Z" },
      { type: "message", message: "no id, dropped" },
      { id: "bad", type: "weird", name: "Bad", email: "", message: "bad type falls back", createdAt: "2026-11-15T09:00:00.000Z" },
    ],
  });
  await withEnv(DRIVE_ENV, async () => {
    const { fetch } = makeDriveFetch({ stored });
    await withFetch(fetch, async () => {
      const result = await callHandler(messagesHandler, {
        method: "GET",
        headers: { authorization: "Bearer test-admin-token" },
      });
      assert.equal(result.status, 200);
      assert.deepEqual(
        result.body.messages.map((item) => item.id),
        ["new", "bad", "old"],
      );
      assert.equal(result.body.messages[1].type, "message");
    });
  });
});

test("messages GET: missing or malformed file reads as an empty inbox", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const missing = makeDriveFetch({ read404: true });
    await withFetch(missing.fetch, async () => {
      const result = await callHandler(messagesHandler, {
        method: "GET",
        headers: { authorization: "Bearer test-admin-token" },
      });
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.messages, []);
    });
    const broken = makeDriveFetch({ stored: "{not json" });
    await withFetch(broken.fetch, async () => {
      const result = await callHandler(messagesHandler, {
        method: "GET",
        headers: { authorization: "Bearer test-admin-token" },
      });
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.messages, []);
    });
  });
});

test("messages GET: Drive failure answers 502", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch } = makeDriveFetch({ failToken: true });
    await withFetch(fetch, async () => {
      const result = await callHandler(messagesHandler, {
        method: "GET",
        headers: { authorization: "Bearer test-admin-token" },
      });
      assert.equal(result.status, 502);
    });
  });
});

// ---------------------------------------------------------------------------
// Contact form appends to the Drive inbox (#19, via api/contact.js)
// ---------------------------------------------------------------------------

test("contact: valid message is appended to messages.json before the 501 mailto fallback", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, calls, state } = makeDriveFetch();
    const handler = loadContactHandler(fetch);
    const result = await callHandler(handler, {
      method: "POST",
      body: { kind: "message", name: "Naveen", email: "naveen@example.com", message: "Hello" },
    });
    // No Resend key is set, so the form still answers 501 — the inbox
    // append must not change that, and must have happened anyway.
    assert.equal(result.status, 501);
    assert.equal(result.body.code, "contact_not_configured");
    assert.equal(state.writes.length, 1);
    const stored = JSON.parse(state.writes[0].body);
    assert.equal(stored.messages.length, 1);
    assert.equal(stored.messages[0].type, "message");
    assert.equal(stored.messages[0].name, "Naveen");
    assert.equal(stored.messages[0].message, "Hello");

    // The token exchange carried a genuine RS256 JWT for the service account.
    const tokenCall = calls.find((c) => c.url.startsWith("https://oauth2.googleapis.com/token"));
    assert.ok(tokenCall, "token exchange was called");
    const assertion = new URLSearchParams(tokenCall.body).get("assertion");
    const { header, claims, signature, signingInput } = decodeJwt(assertion);
    assert.equal(header.alg, "RS256");
    assert.equal(claims.iss, SA_EMAIL);
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(signingInput);
    assert.equal(verifier.verify(publicKey, Buffer.from(signature, "base64url")), true);
  });
});

test("contact: invalid submissions are not appended", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch();
    const handler = loadContactHandler(fetch);
    const result = await callHandler(handler, {
      method: "POST",
      body: { kind: "message", name: "Naveen", email: "naveen@example.com", message: "   " },
    });
    assert.equal(result.status, 400);
    assert.equal(state.writes.length, 0);
  });
});

test("contact: a Drive outage never breaks the form", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch({ failWrite: true });
    const handler = loadContactHandler(fetch);
    const result = await callHandler(handler, {
      method: "POST",
      body: { kind: "request", name: "", email: "", message: "Please add a timer app" },
    });
    assert.equal(result.status, 501); // same as without Drive
    assert.equal(state.writes.length, 1); // it tried, then carried on
  });
});

test("contact: no Drive calls at all when the inbox is not configured", async () => {
  await withEnv({}, async () => {
    const { fetch, calls } = makeDriveFetch();
    const handler = loadContactHandler(fetch);
    const result = await callHandler(handler, {
      method: "POST",
      body: { kind: "message", name: "", email: "", message: "Hello" },
    });
    assert.equal(result.status, 501);
    assert.equal(calls.length, 0);
  });
});

test("contact: newsletter signup is appended too", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch();
    const handler = loadContactHandler(fetch);
    const result = await callHandler(handler, {
      method: "POST",
      body: { kind: "subscribe", email: "fan@example.com" },
    });
    assert.equal(result.status, 501);
    assert.equal(state.writes.length, 1);
    const stored = JSON.parse(state.writes[0].body);
    assert.equal(stored.messages[0].type, "subscribe");
    assert.equal(stored.messages[0].email, "fan@example.com");
  });
});
