import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { INITIAL_APPS } from "../src/data/portalApps.js";
import { parseAppsJson } from "../src/lib/portalState.js";
import {
  effectiveCounts,
  fetchSharedStats,
  formatCount,
  readLikedIds,
  recordSharedEvent,
  toggleLikedLocal,
} from "../src/lib/stats.js";
import {
  STRINGS,
  categoryLabelLocalized,
  localizeApp,
  resolveLang,
  statusLabelLocalized,
  t,
} from "../src/lib/i18n.js";
import statsHandler from "../api/stats.js";
import videosHandler, { parseVideosFeed } from "../api/videos.js";

function fakeStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
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

test("formatCount shortens big numbers for the cards", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(42), "42");
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(1000), "1k");
  assert.equal(formatCount(1200), "1.2k");
  assert.equal(formatCount(15000), "15k");
  assert.equal(formatCount(2500000), "2.5M");
});

test("likes are one per visitor per app, remembered on the device", () => {
  const store = fakeStore();
  assert.deepEqual(readLikedIds(store), []);
  assert.deepEqual(toggleLikedLocal(store, "lexi-parcours"), {
    liked: true,
    ids: ["lexi-parcours"],
  });
  assert.deepEqual(readLikedIds(store), ["lexi-parcours"]);
  assert.deepEqual(toggleLikedLocal(store, "lexi-parcours"), {
    liked: false,
    ids: [],
  });
});

test("effectiveCounts prefers shared totals, falls back to the device", () => {
  const local = { "lexi-parcours": 3, 1: 2 };
  const liked = ["lexi-parcours"];
  const shared = {
    shared: true,
    launches: { "lexi-parcours": 1200 },
    likes: { "lexi-parcours": 45 },
  };
  const merged = effectiveCounts(local, liked, shared);
  assert.equal(merged.launches["lexi-parcours"], 1200);
  assert.equal(merged.likes["lexi-parcours"], 45);
  assert.equal(merged.launches["1"], 2); // no shared value: local stands

  const localOnly = effectiveCounts(local, liked, { shared: false });
  assert.equal(localOnly.launches["lexi-parcours"], 3);
  assert.equal(localOnly.likes["lexi-parcours"], 1); // this visitor liked it
  assert.equal(localOnly.likes["1"], 0);
});

test("shared stats fail soft when the endpoint is down or unconfigured", async () => {
  const ok = await fetchSharedStats(["lexi-parcours"], async () => ({
    ok: true,
    json: async () => ({
      shared: true,
      launches: { "lexi-parcours": 7 },
      likes: { "lexi-parcours": 2 },
    }),
  }));
  assert.equal(ok.shared, true);
  assert.equal(ok.launches["lexi-parcours"], 7);

  const notConfigured = await fetchSharedStats(["lexi-parcours"], async () => ({
    ok: false,
    status: 501,
  }));
  assert.equal(notConfigured.shared, false);

  const down = await fetchSharedStats(["lexi-parcours"], async () => {
    throw new Error("network down");
  });
  assert.equal(down.shared, false);
  assert.equal(await recordSharedEvent("x", "launch", async () => { throw new Error("down"); }), null);
});

test("stats endpoint answers 501 with setup instructions when KV is missing", async () => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
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

test("every UI string exists in English and French", () => {
  const enKeys = Object.keys(STRINGS.en).sort();
  const frKeys = Object.keys(STRINGS.fr).sort();
  assert.deepEqual(frKeys, enKeys);
  for (const key of enKeys) {
    assert.ok(STRINGS.en[key].length > 0, `en.${key} is empty`);
    assert.ok(STRINGS.fr[key].length > 0, `fr.${key} is empty`);
  }
  assert.equal(t("fr", "launchMany", { n: "1.2k" }), "1.2k lancements");
  assert.equal(t("xx", "navAbout"), "About"); // unknown language falls back
});

test("language follows the saved choice, then the browser language", () => {
  assert.equal(resolveLang("fr", "en-US"), "fr");
  assert.equal(resolveLang("en", "fr-FR"), "en");
  assert.equal(resolveLang(null, "fr-CA"), "fr");
  assert.equal(resolveLang(null, "fr"), "fr");
  assert.equal(resolveLang(null, "en-US"), "en");
  assert.equal(resolveLang("banana", "en-US"), "en");
});

test("app text localizes to French and falls back to English", () => {
  const lexi = INITIAL_APPS[0];
  const fr = localizeApp(lexi, "fr");
  assert.equal(fr.shortNote, "Le vocabulaire français, chaque jour.");
  assert.match(fr.description, /Développez votre vocabulaire/);
  assert.equal(fr.features.length, 3);
  assert.equal(localizeApp(lexi, "en").shortNote, lexi.shortNote);
  const untranslated = localizeApp({ ...lexi, descriptionFr: "" }, "fr");
  assert.equal(untranslated.description, lexi.description);
  assert.equal(categoryLabelLocalized("Education", "fr"), "Éducation");
  assert.equal(categoryLabelLocalized("3D Games & Arcade", "en"), "Arcade");
  assert.equal(statusLabelLocalized("soon", "fr"), "Bientôt");
  assert.equal(statusLabelLocalized("live", "en"), "live");
});

test("every seed app ships a French short note, description and features", () => {
  assert.equal(INITIAL_APPS.length, 10);
  for (const app of INITIAL_APPS) {
    assert.ok(app.shortNoteFr?.length > 0, `${app.id} needs shortNoteFr`);
    assert.ok(app.descriptionFr?.length > 0, `${app.id} needs descriptionFr`);
    assert.equal(
      app.featuresFr?.length,
      app.features.length,
      `${app.id} featuresFr must match features`,
    );
  }
  const { apps } = parseAppsJson(fs.readFileSync("public/apps.json", "utf8"));
  assert.equal(apps.length, 10);
  assert.equal(apps[0].descriptionFr, INITIAL_APPS[0].descriptionFr);
});

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <entry>
  <id>yt:video:abc123</id>
  <yt:videoId>abc123</yt:videoId>
  <title>Tom &amp; Jerry: AI &lt;Test&gt;</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abc123"/>
  <published>2026-11-15T18:00:17+00:00</published>
  <media:group><media:thumbnail url="https://i.ytimg.com/vi/abc123/hqdefault.jpg" width="480" height="360"/></media:group>
 </entry>
 <entry>
  <id>yt:video:def456</id>
  <yt:videoId>def456</yt:videoId>
  <title>Second Video</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=def456"/>
  <published>2026-11-14T18:00:00+00:00</published>
 </entry>
</feed>`;

test("videos feed parses titles, links, thumbnails and dates", () => {
  const videos = parseVideosFeed(SAMPLE_FEED);
  assert.equal(videos.length, 2);
  assert.equal(videos[0].title, "Tom & Jerry: AI <Test>");
  assert.equal(videos[0].url, "https://www.youtube.com/watch?v=abc123");
  assert.equal(
    videos[0].thumbnail,
    "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  );
  assert.equal(videos[0].publishedAt, "2026-11-15T18:00:17+00:00");
  // Missing thumbnail falls back to the standard YouTube image URL.
  assert.equal(
    videos[1].thumbnail,
    "https://i.ytimg.com/vi/def456/hqdefault.jpg",
  );
  assert.deepEqual(parseVideosFeed("not xml at all"), []);
});

test("videos endpoint serves the parsed feed as JSON", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () => SAMPLE_FEED,
  });
  try {
    const { status, body } = await callHandler(videosHandler, {
      method: "GET",
    });
    assert.equal(status, 200);
    assert.equal(body.videos.length, 2);
    assert.equal(body.videos[0].id, "abc123");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("changelog is valid, newest first, and translated", () => {
  const data = JSON.parse(fs.readFileSync("public/changelog.json", "utf8"));
  assert.equal(data.version, 1);
  assert.ok(data.entries.length >= 3);
  const dates = data.entries.map((entry) => entry.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
  for (const entry of data.entries) {
    assert.ok(entry.title?.length > 0, `${entry.date} needs a title`);
    assert.ok(entry.titleFr?.length > 0, `${entry.date} needs titleFr`);
    assert.ok(entry.items.length > 0, `${entry.date} needs items`);
    assert.equal(entry.itemsFr.length, entry.items.length);
  }
});
