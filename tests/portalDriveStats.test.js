import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import statsHandler from "../api/stats.js";

// A real RSA keypair so the RS256 JWT the handler signs is genuine — the
// HTTP side is mocked, the crypto is not.
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const SA_EMAIL = "portal-stats@test-project.iam.gserviceaccount.com";
const FILE_ID = "1HnJd_0yJu5P917CJl3rxqLmFAjiZMUh8";
const SA_JSON = JSON.stringify({
  type: "service_account",
  client_email: SA_EMAIL,
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
});
const DRIVE_ENV = {
  GOOGLE_SERVICE_ACCOUNT_KEY: SA_JSON,
  DRIVE_STATS_FILE_ID: FILE_ID,
};

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

function defaultStored() {
  return JSON.stringify({
    version: 1,
    updatedAt: "2026-11-15T00:00:00.000Z",
    launches: { "lexi-parcours": 3 },
    likes: { "lexi-parcours": 2 },
  });
}

function makeDriveFetch(scenario = {}) {
  const calls = [];
  const state = {
    stored: scenario.stored !== undefined ? scenario.stored : defaultStored(),
    etag: scenario.etag !== undefined ? scenario.etag : "etag-1",
    writes: [],
  };
  const fetchMock = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", headers: options.headers || {}, body: options.body });
    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      if (scenario.failToken) {
        return mockResponse({ ok: false, status: 500 });
      }
      return mockResponse({
        jsonData: { access_token: "test-access-token", token_type: "Bearer", expires_in: 3600 },
      });
    }
    if (url.startsWith("https://www.googleapis.com/drive/v3/files/")) {
      if (scenario.failRead) {
        return mockResponse({ ok: false, status: 500 });
      }
      if (scenario.read404) {
        return mockResponse({ ok: false, status: 404 });
      }
      return mockResponse({ textData: state.stored, etag: state.etag });
    }
    if (url.startsWith("https://upload.googleapis.com/upload/drive/v3/files/")) {
      state.writes.push({ body: options.body, headers: options.headers });
      if (scenario.write412First && state.writes.length === 1) {
        // A concurrent change lands between our read and write.
        state.stored = scenario.concurrentStored;
        state.etag = "etag-2";
        return mockResponse({ ok: false, status: 412 });
      }
      if (scenario.failWrite) {
        return mockResponse({ ok: false, status: 500 });
      }
      state.stored = options.body;
      return mockResponse({ jsonData: {} });
    }
    throw new Error(`unexpected fetch: ${url}`);
  };
  return { fetch: fetchMock, calls, state };
}

// Run fn with the given env vars set (KV vars always removed unless the
// test passes them explicitly), then restore everything.
async function withEnv(vars, fn) {
  const keys = [
    "GOOGLE_SERVICE_ACCOUNT_KEY",
    "DRIVE_STATS_FILE_ID",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
  ];
  const saved = {};
  for (const key of keys) {
    saved[key] = process.env[key];
  }
  try {
    for (const key of keys) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(vars)) {
      process.env[key] = value;
    }
    return await fn();
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
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

function decodeJwt(assertion) {
  const [header, claims, signature] = assertion.split(".");
  return {
    header: JSON.parse(Buffer.from(header, "base64url").toString()),
    claims: JSON.parse(Buffer.from(claims, "base64url").toString()),
    signature,
    signingInput: `${header}.${claims}`,
  };
}

test("Drive GET returns shared totals from portal-stats.json", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, calls } = makeDriveFetch();
    await withFetch(fetch, async () => {
      const result = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(result.status, 200);
      assert.equal(result.body.shared, true);
      assert.equal(result.body.launches["lexi-parcours"], 3);
      assert.equal(result.body.likes["lexi-parcours"], 2);

      const tokenCall = calls.find((c) => c.url.startsWith("https://oauth2.googleapis.com/token"));
      assert.ok(tokenCall, "token exchange was called");
      const assertion = new URLSearchParams(tokenCall.body).get("assertion");
      const { header, claims, signature, signingInput } = decodeJwt(assertion);
      assert.equal(header.alg, "RS256");
      assert.equal(header.typ, "JWT");
      assert.equal(claims.iss, SA_EMAIL);
      assert.equal(claims.aud, "https://oauth2.googleapis.com/token");
      assert.equal(claims.scope, "https://www.googleapis.com/auth/drive");
      assert.equal(claims.exp - claims.iat, 3600);
      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(signingInput);
      assert.equal(
        verifier.verify(publicKey, Buffer.from(signature, "base64url")),
        true,
        "JWT signature verifies against the service-account key",
      );

      const readCall = calls.find((c) => c.url.includes("/drive/v3/files/"));
      assert.equal(readCall.headers.Authorization, "Bearer test-access-token");
      assert.ok(readCall.url.includes(FILE_ID));
    });
  });
});

test("Drive POST launch increments and writes the full file back", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch();
    await withFetch(fetch, async () => {
      const result = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "launch" },
      });
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, { ok: true, launches: 4, likes: 2 });
      assert.equal(state.writes.length, 1);
      const written = JSON.parse(state.writes[0].body);
      assert.equal(written.launches["lexi-parcours"], 4);
      assert.equal(written.likes["lexi-parcours"], 2);
      assert.equal(written.version, 1);
      assert.equal(state.writes[0].headers["If-Match"], "etag-1");
    });
  });
});

test("Drive POST like and unlike, clamped at zero", async () => {
  const stored = JSON.stringify({
    version: 1,
    updatedAt: "2026-11-15T00:00:00.000Z",
    launches: {},
    likes: {},
  });
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch({ stored });
    await withFetch(fetch, async () => {
      const liked = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "like" },
      });
      assert.deepEqual(liked.body, { ok: true, launches: 0, likes: 1 });

      const unliked = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "unlike" },
      });
      assert.deepEqual(unliked.body, { ok: true, launches: 0, likes: 0 });

      // Un-liking again must not go below zero.
      const unlikedAgain = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "unlike" },
      });
      assert.deepEqual(unlikedAgain.body, { ok: true, launches: 0, likes: 0 });
      assert.equal(JSON.parse(state.writes[2].body).likes["lexi-parcours"], 0);
    });
  });
});

test("malformed stored JSON is treated as empty counts", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch({ stored: "not-json{{{", etag: null });
    await withFetch(fetch, async () => {
      const get = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(get.status, 200);
      assert.equal(get.body.launches["lexi-parcours"], 0);
      assert.equal(get.body.likes["lexi-parcours"], 0);

      const post = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "launch" },
      });
      assert.deepEqual(post.body, { ok: true, launches: 1, likes: 0 });
      assert.equal(JSON.parse(state.writes[0].body).launches["lexi-parcours"], 1);
      assert.equal(state.writes[0].headers["If-Match"], undefined);
    });
  });
});

test("missing Drive file (404) is treated as empty counts", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const { fetch } = makeDriveFetch({ read404: true });
    await withFetch(fetch, async () => {
      const get = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(get.status, 200);
      assert.equal(get.body.launches["lexi-parcours"], 0);
    });
  });
});

test("Drive write retries once after a 412 and uses the fresh data", async () => {
  const concurrentStored = JSON.stringify({
    version: 1,
    updatedAt: "2026-11-15T00:00:00.000Z",
    launches: { "lexi-parcours": 5 },
    likes: { "lexi-parcours": 2 },
  });
  await withEnv(DRIVE_ENV, async () => {
    const { fetch, state } = makeDriveFetch({ write412First: true, concurrentStored });
    await withFetch(fetch, async () => {
      const result = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "launch" },
      });
      assert.equal(result.status, 200);
      // 5 (fresh read after the 412) + 1, not 3 (stale read) + 1.
      assert.deepEqual(result.body, { ok: true, launches: 6, likes: 2 });
      assert.equal(state.writes.length, 2);
      assert.equal(JSON.parse(state.writes[1].body).launches["lexi-parcours"], 6);
      assert.equal(state.writes[1].headers["If-Match"], "etag-2");
    });
  });
});

test("Drive backend wins over KV when both are configured", async () => {
  await withEnv(
    {
      ...DRIVE_ENV,
      KV_REST_API_URL: "https://kv.example.invalid",
      KV_REST_API_TOKEN: "kv-token",
    },
    async () => {
      const { fetch, calls } = makeDriveFetch();
      const guardedFetch = async (url, options) => {
        if (String(url).includes("kv.example.invalid")) {
          throw new Error("KV backend must not be called when Drive is configured");
        }
        return fetch(url, options);
      };
      await withFetch(guardedFetch, async () => {
        const result = await callHandler(statsHandler, {
          method: "GET",
          query: { ids: "lexi-parcours" },
        });
        assert.equal(result.status, 200);
        assert.equal(result.body.launches["lexi-parcours"], 3);
        assert.ok(calls.some((c) => c.url.includes("/drive/v3/files/")));
      });
    },
  );
});

test("stats endpoint answers 501 when neither Drive nor KV is configured", async () => {
  await withEnv({}, async () => {
    const get = await callHandler(statsHandler, {
      method: "GET",
      query: { ids: "lexi-parcours" },
    });
    assert.equal(get.status, 501);
    assert.equal(get.body.code, "stats_not_configured");
    const post = await callHandler(statsHandler, {
      method: "POST",
      body: { appId: "lexi-parcours", event: "launch" },
    });
    assert.equal(post.status, 501);
  });
});

test("invalid service-account key JSON falls back to 501", async () => {
  await withEnv(
    { GOOGLE_SERVICE_ACCOUNT_KEY: "not-json", DRIVE_STATS_FILE_ID: FILE_ID },
    async () => {
      const get = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(get.status, 501);
      assert.equal(get.body.code, "stats_not_configured");
    },
  );
});

test("Drive failure answers 502", async () => {
  await withEnv(DRIVE_ENV, async () => {
    const tokenDown = makeDriveFetch({ failToken: true });
    await withFetch(tokenDown.fetch, async () => {
      const get = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(get.status, 502);
    });

    const readDown = makeDriveFetch({ failRead: true });
    await withFetch(readDown.fetch, async () => {
      const get = await callHandler(statsHandler, {
        method: "GET",
        query: { ids: "lexi-parcours" },
      });
      assert.equal(get.status, 502);
    });

    const writeDown = makeDriveFetch({ failWrite: true });
    await withFetch(writeDown.fetch, async () => {
      const post = await callHandler(statsHandler, {
        method: "POST",
        body: { appId: "lexi-parcours", event: "launch" },
      });
      assert.equal(post.status, 502);
    });
  });
});
