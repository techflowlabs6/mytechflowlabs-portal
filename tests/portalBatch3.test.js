import test from "node:test";
import assert from "node:assert/strict";
import uptimeHandler, { checkApp, parseAppsPayload } from "../api/uptime.js";
import domainsHandler, { parseRdap, rdapUrlFor } from "../api/domains.js";
import {
  DOMAINS_KEY,
  barWidth,
  buildChartData,
  daysUntil,
  deriveDomains,
  expiryTone,
  hostnameOf,
  normalizeDomain,
  readDomainWatchlist,
  writeDomainWatchlist,
} from "../src/lib/adminTools.js";

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

function mockResponse({ ok = true, status = 200, jsonData = null } = {}) {
  return {
    ok,
    status,
    json: async () => jsonData,
    text: async () => JSON.stringify(jsonData),
  };
}

function fakeStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    _data: data,
  };
}

// ---------------------------------------------------------------------------
// Uptime
// ---------------------------------------------------------------------------

test("uptime: parseAppsPayload reads the committed apps.json shape", () => {
  const apps = parseAppsPayload(
    JSON.stringify({
      version: 1,
      updatedAt: "2026-11-15T00:00:00.000Z",
      apps: [
        { id: "lexi-parcours", name: "Lexi", url: "https://lexi.mytechflowlabs.com/" },
        { id: "no-url", name: "No URL" },
      ],
    }),
  );
  assert.deepEqual(apps, [
    {
      id: "lexi-parcours",
      name: "Lexi",
      url: "https://lexi.mytechflowlabs.com/",
    },
  ]);
  assert.throws(() => parseAppsPayload(JSON.stringify({ version: 1 })));
});

test("uptime: checkApp reports ok with status and timing", async () => {
  const app = { id: "lexi", name: "Lexi", url: "https://lexi.mytechflowlabs.com/" };
  const result = await checkApp(app, async (url, options) => {
    assert.equal(url, app.url);
    assert.equal(options.method, "HEAD");
    return mockResponse({ status: 200 });
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.equal(typeof result.ms, "number");
});

test("uptime: checkApp falls back to GET when HEAD answers 405", async () => {
  const methods = [];
  const result = await checkApp(
    { id: "a", name: "A", url: "https://example.com/" },
    async (_url, options) => {
      methods.push(options.method);
      // ok mirrors a real fetch (2xx only): 405 is not ok.
      const status = methods.length === 1 ? 405 : 200;
      return mockResponse({ ok: status >= 200 && status < 300, status });
    },
  );
  assert.deepEqual(methods, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
});

test("uptime: checkApp falls back to GET when HEAD answers 404 (Lexi case)", async () => {
  // Lexi lives on ChatGPT Sites: HEAD answers 404 while GET is 200.
  // Falling back only on 405 misreported it as down on the live site.
  const methods = [];
  const result = await checkApp(
    { id: "lexi", name: "Lexi", url: "https://lexi.mytechflowlabs.com/" },
    async (_url, options) => {
      methods.push(options.method);
      return mockResponse({
        ok: methods.length > 1,
        status: methods.length === 1 ? 404 : 200,
      });
    },
  );
  assert.deepEqual(methods, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
});

test("uptime: checkApp marks a 500 and a network failure as down", async () => {
  const down500 = await checkApp(
    { id: "a", name: "A", url: "https://example.com/" },
    async () => mockResponse({ ok: false, status: 500 }),
  );
  assert.equal(down500.ok, false);
  assert.equal(down500.status, 500);
  const downNet = await checkApp(
    { id: "b", name: "B", url: "https://down.example/" },
    async () => {
      throw new Error("fetch failed");
    },
  );
  assert.equal(downNet.ok, false);
  assert.equal(downNet.status, 0);
});

test("uptime: handler checks every catalog app in parallel", async (t) => {
  const seen = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    seen.push([url, options?.method]);
    // A 500 for the driver app, 200 for everything else.
    // ok mirrors a real fetch (2xx only), so the driver's HEAD 500
    // triggers the GET fallback, exactly like the live Lexi case.
    const status = url.includes("driver.mytechflowlabs.com") ? 500 : 200;
    return mockResponse({ ok: status >= 200 && status < 300, status });
  };
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  const { status, body } = await callHandler(uptimeHandler, {
    method: "GET",
    headers: {},
    query: {},
  });
  assert.equal(status, 200);
  assert.equal(typeof body.checkedAt, "string");
  assert.equal(body.results.length, 9);
  assert.equal(body.results.every((row) => typeof row.ms === "number"), true);
  const driver = body.results.find((row) => row.id === "4");
  assert.equal(driver.ok, false);
  assert.equal(driver.status, 500);
  assert.equal(
    body.results.filter((row) => row.ok).length,
    8,
  );
  // Eight healthy apps are HEAD-only; the driver's HEAD 500 falls back
  // to a GET (which also 500s), so there is exactly one GET call.
  assert.equal(
    seen.filter(([, method]) => method === "HEAD").length,
    9,
  );
  assert.equal(
    seen.filter(([, method]) => method === "GET").length,
    1,
  );
  assert.equal(
    seen.find(([, method]) => method === "GET")[0].includes("driver."),
    true,
  );
});

test("uptime: handler rejects non-GET with 405", async () => {
  const { status } = await callHandler(uptimeHandler, {
    method: "POST",
    headers: {},
    query: {},
  });
  assert.equal(status, 405);
});

// ---------------------------------------------------------------------------
// Domains (RDAP)
// ---------------------------------------------------------------------------

const RDAP_SAMPLE = {
  objectClassName: "domain",
  handle: "MYTECHFLOWLABS.COM",
  events: [
    { eventAction: "registration", eventDate: "2024-01-10T00:00:00Z" },
    { eventAction: "expiration", eventDate: "2027-03-02T00:00:00Z" },
    { eventAction: "last changed", eventDate: "2026-01-10T00:00:00Z" },
  ],
  entities: [
    {
      objectClassName: "entity",
      roles: ["registrar"],
      vcardArray: [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "Example Registrar, Inc."],
        ],
      ],
    },
  ],
};

test("domains: parseRdap picks the expiration event and the registrar", () => {
  assert.deepEqual(
    parseRdap("mytechflowlabs.com", RDAP_SAMPLE),
    {
      domain: "mytechflowlabs.com",
      expiry: "2027-03-02T00:00:00Z",
      registrar: "Example Registrar, Inc.",
      found: true,
    },
  );
});

test("domains: parseRdap handles a reply with no expiry and no registrar", () => {
  assert.deepEqual(parseRdap("example.com", { events: [], entities: [] }), {
    domain: "example.com",
    expiry: null,
    registrar: null,
    found: true,
  });
});

test("domains: rdapUrlFor routes each TLD to its authoritative registry", () => {
  assert.equal(
    rdapUrlFor("mytechflowlabs.com"),
    "https://rdap.verisign.com/com/v1/domain/mytechflowlabs.com",
  );
  assert.equal(
    rdapUrlFor("example.net"),
    "https://rdap.verisign.com/net/v1/domain/example.net",
  );
  assert.equal(
    rdapUrlFor("example.org"),
    "https://rdap.publicinterestregistry.org/rdap/domain/example.org",
  );
  assert.equal(
    rdapUrlFor("example.ca"),
    "https://rdap.ca.fury.ca/rdap/domain/example.ca",
  );
  assert.equal(
    rdapUrlFor("example.xyz"),
    "https://rdap.org/domain/example.xyz",
  );
});

test("domains: handler returns expiry for a known domain", async (t) => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(
      url,
      "https://rdap.verisign.com/com/v1/domain/mytechflowlabs.com",
    );
    return mockResponse({ jsonData: RDAP_SAMPLE });
  };
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  const { status, body } = await callHandler(domainsHandler, {
    method: "GET",
    query: { domain: "MyTechFlowLabs.com" },
  });
  assert.equal(status, 200);
  assert.equal(body.domain, "mytechflowlabs.com");
  assert.equal(body.expiry, "2027-03-02T00:00:00Z");
  assert.equal(body.registrar, "Example Registrar, Inc.");
  assert.equal(body.found, true);
});

test("domains: handler returns found:false for an unknown domain", async (t) => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    mockResponse({ ok: false, status: 404, jsonData: null });
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  const { status, body } = await callHandler(domainsHandler, {
    method: "GET",
    query: { domain: "no-such-domain-xyz.example" },
  });
  assert.equal(status, 200);
  assert.equal(body.found, false);
  assert.equal(body.expiry, null);
});

test("domains: handler rejects a bad domain with 400 and RDAP errors with 502", async (t) => {
  const bad = await callHandler(domainsHandler, {
    method: "GET",
    query: { domain: "not a domain!!" },
  });
  assert.equal(bad.status, 400);
  const missing = await callHandler(domainsHandler, {
    method: "GET",
    query: {},
  });
  assert.equal(missing.status, 400);

  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => mockResponse({ ok: false, status: 503 });
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  const failed = await callHandler(domainsHandler, {
    method: "GET",
    query: { domain: "example.com" },
  });
  assert.equal(failed.status, 502);
});

test("domains: handler rejects non-GET with 405", async () => {
  const { status } = await callHandler(domainsHandler, {
    method: "POST",
    query: { domain: "example.com" },
  });
  assert.equal(status, 405);
});

// ---------------------------------------------------------------------------
// Admin tool helpers
// ---------------------------------------------------------------------------

test("adminTools: normalizeDomain lowercases, strips www and rejects junk", () => {
  assert.equal(normalizeDomain("  WWW.Example.COM/ "), "example.com");
  assert.equal(normalizeDomain("sub.example.co.uk"), "sub.example.co.uk");
  assert.equal(normalizeDomain("not a domain"), "");
  assert.equal(normalizeDomain(""), "");
  assert.equal(normalizeDomain(null), "");
});

test("adminTools: hostnameOf and deriveDomains dedupe catalog hosts", () => {
  assert.equal(hostnameOf("https://www.lexi.mytechflowlabs.com/x"), "lexi.mytechflowlabs.com");
  assert.equal(hostnameOf("not a url"), "");
  assert.equal(hostnameOf("https://localhost/"), "");
  assert.deepEqual(
    deriveDomains([
      { url: "https://lexi.mytechflowlabs.com/" },
      { url: "https://lexi.mytechflowlabs.com/other" },
      { url: "https://french.mytechflowlabs.com/" },
      { url: "" },
      {},
    ]),
    ["lexi.mytechflowlabs.com", "french.mytechflowlabs.com"],
  );
});

test("adminTools: daysUntil and expiryTone colour rules", () => {
  const now = new Date("2026-11-15T12:00:00Z");
  assert.equal(daysUntil("2026-12-15T12:00:00Z", now), 30);
  assert.equal(daysUntil("2026-11-10T12:00:00Z", now), -5);
  assert.equal(daysUntil("garbage", now), null);
  assert.equal(expiryTone(null), "unknown");
  assert.equal(expiryTone(-1), "expired");
  assert.equal(expiryTone(0), "red");
  assert.equal(expiryTone(29), "red");
  assert.equal(expiryTone(30), "amber");
  assert.equal(expiryTone(89), "amber");
  assert.equal(expiryTone(90), "ok");
  assert.equal(expiryTone(400), "ok");
});

test("adminTools: domain watchlist round-trips through localStorage", () => {
  const store = fakeStore();
  assert.deepEqual(readDomainWatchlist(store), []);
  const saved = writeDomainWatchlist(store, [
    "Example.COM",
    "example.com",
    "bad domain",
    "other.org",
  ]);
  assert.deepEqual(saved, ["example.com", "other.org"]);
  assert.equal(
    store._data[DOMAINS_KEY],
    JSON.stringify(["example.com", "other.org"]),
  );
  assert.deepEqual(readDomainWatchlist(store), ["example.com", "other.org"]);
  assert.deepEqual(readDomainWatchlist(fakeStore({ [DOMAINS_KEY]: "broken" })), []);
});

test("adminTools: buildChartData sorts, totals and picks the most launched", () => {
  const apps = [
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
    { id: "c", name: "Gamma" },
  ];
  const { rows, totals, mostLaunched } = buildChartData(
    apps,
    { a: 3, b: 12 },
    { a: 1, c: 5 },
  );
  assert.deepEqual(
    rows.map((row) => row.id),
    ["b", "a", "c"],
  );
  assert.deepEqual(totals, { launches: 15, likes: 6 });
  assert.equal(mostLaunched.id, "b");
  assert.deepEqual(buildChartData(apps, {}, {}), {
    rows: [
      { id: "a", name: "Alpha", launches: 0, likes: 0 },
      { id: "b", name: "Beta", launches: 0, likes: 0 },
      { id: "c", name: "Gamma", launches: 0, likes: 0 },
    ],
    totals: { launches: 0, likes: 0 },
    mostLaunched: null,
  });
});

test("adminTools: barWidth scales 0-100 and clamps", () => {
  assert.equal(barWidth(5, 10), 50);
  assert.equal(barWidth(0, 10), 0);
  assert.equal(barWidth(10, 10), 100);
  assert.equal(barWidth(20, 10), 100);
  assert.equal(barWidth(5, 0), 0);
});
