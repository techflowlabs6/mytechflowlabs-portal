import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { INITIAL_APPS } from "../src/data/portalApps.js";
import {
  appsJsonPayload,
  isNewApp,
  parseAppsJson,
  readLaunchCounts,
  recordLaunch,
  safeImageUrl,
  sortApps,
} from "../src/lib/portalState.js";
import { buildContactMailto } from "../src/lib/contact.js";
import { resolveTheme } from "../src/lib/theme.js";
import { dataUrlBytes, dataUrlExtension } from "../src/lib/imageUpload.js";

test("theme follows the saved choice, then the system setting", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme("banana", false), "light");
});

test("card images accept Unsplash links, repo uploads and uploaded data URLs", () => {
  assert.equal(
    safeImageUrl("https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80"),
    "https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80",
  );
  assert.equal(safeImageUrl("/art/uploads/my-app-123.jpg"), "/art/uploads/my-app-123.jpg");
  const dataUrl = "data:image/jpeg;base64,/9j/abc123+/=";
  assert.equal(safeImageUrl(dataUrl), dataUrl);
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "//evil.example.com/x.jpg",
    "/art/../secret.txt",
    "file:///tmp/a.jpg",
    "/relative.jpg",
  ])
    assert.equal(safeImageUrl(value), "", value);
});

test("uploaded image helpers measure size and extension", () => {
  assert.equal(dataUrlExtension("data:image/png;base64,abcd"), "png");
  assert.equal(dataUrlExtension("data:image/jpeg;base64,abcd"), "jpg");
  assert.equal(dataUrlExtension("https://example.com/x.jpg"), "jpg");
  assert.ok(dataUrlBytes("data:image/jpeg;base64,abcd") > 0);
});

test("the committed catalog round-trips through apps.json", () => {
  const payload = appsJsonPayload(INITIAL_APPS, "2026-11-14T00:00:00.000Z");
  assert.equal(payload.version, 1);
  assert.equal(payload.apps.length, 9);
  const parsed = parseAppsJson(JSON.stringify(payload));
  assert.equal(parsed.updatedAt, "2026-11-14T00:00:00.000Z");
  assert.equal(parsed.apps[0].url, "https://lexi.mytechflowlabs.com/");
  assert.throws(() => parseAppsJson(JSON.stringify({ version: 1 })), /no apps array/);
  assert.throws(() => parseAppsJson("{invalid"), SyntaxError);
});

test("public/apps.json is the committed source of truth and matches the seed", () => {
  const raw = fs.readFileSync(new URL("../public/apps.json", import.meta.url), "utf8");
  const { apps, updatedAt } = parseAppsJson(raw);
  assert.equal(apps.length, 9);
  assert.deepEqual(
    apps.map((app) => app.id),
    INITIAL_APPS.map((app) => app.id),
  );
  assert.ok(updatedAt.length > 0);
  assert.ok(apps.every((app) => app.name && app.url));
});

test("wide screens grow the container and add grid columns", () => {
  const indexCss = fs.readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  const appCss = fs.readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
  // Container must widen past the 1200px cap as screens grow.
  for (const [width, cap] of [
    ["1400px", "1400px"],
    ["1680px", "1640px"],
    ["1920px", "2000px"],
  ]) {
    assert.ok(
      indexCss.includes(`@media (min-width: ${width})`) &&
        indexCss.includes(`width: min(${cap},`),
      `container widens at ${width} to ${cap}`,
    );
  }
  // Grid must add columns on big screens and drop the mosaic wide spans there.
  assert.ok(appCss.includes("@media (min-width: 1400px)"));
  assert.ok(appCss.includes("grid-template-columns: repeat(5, minmax(0, 1fr))"));
  assert.ok(appCss.includes("@media (min-width: 1800px)"));
  assert.ok(appCss.includes("grid-template-columns: repeat(6, minmax(0, 1fr))"));
  const wideBlock = appCss.slice(appCss.indexOf("@media (min-width: 1400px)"));
  assert.ok(wideBlock.includes("grid-column: auto"));
});

test("sorting puts featured first, newest by date, A–Z, and most-launched", () => {
  const apps = [
    { id: "b", name: "Beta App", featured: false, addedAt: "2026-11-10" },
    { id: "a", name: "Alpha App", featured: true, addedAt: "2026-11-01" },
    { id: "c", name: "Gamma App", featured: false, addedAt: "2026-11-14" },
  ];
  assert.deepEqual(
    sortApps(apps, "featured").map((app) => app.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    sortApps(apps, "newest").map((app) => app.id),
    ["c", "b", "a"],
  );
  assert.deepEqual(
    sortApps(apps, "az").map((app) => app.name),
    ["Alpha App", "Beta App", "Gamma App"],
  );
  assert.deepEqual(
    sortApps(apps, "launched", { c: 5, b: 2 }).map((app) => app.id),
    ["c", "b", "a"],
  );
});

test("the New badge only shows for apps added in the last 30 days", () => {
  const now = new Date("2026-11-15T12:00:00.000Z");
  assert.equal(isNewApp({ addedAt: "2026-11-14" }, now), true);
  assert.equal(isNewApp({ addedAt: "2026-10-01" }, now), false);
  assert.equal(isNewApp({ addedAt: "" }, now), false);
  assert.equal(isNewApp({}, now), false);
});

test("launch counts accumulate per app in storage", () => {
  const store = new Map();
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
  assert.deepEqual(readLaunchCounts(storage), {});
  recordLaunch(storage, "lexi-parcours");
  recordLaunch(storage, "lexi-parcours");
  recordLaunch(storage, "1");
  assert.deepEqual(readLaunchCounts(storage), {
    "lexi-parcours": 2,
    1: 1,
  });
});

test("contact forms build a pre-filled mailto fallback", () => {
  const message = buildContactMailto("message", {
    name: "Naveen",
    email: "a@b.com",
    message: "Hello",
  });
  assert.ok(message.startsWith("mailto:techflowlabs6@gmail.com?subject="));
  assert.ok(message.includes(encodeURIComponent("Inquiry via MyTechFlow Labs")));
  assert.ok(message.includes(encodeURIComponent("Hello")));
  const request = buildContactMailto("request", { message: "A timer app" });
  assert.ok(request.includes(encodeURIComponent("App idea for MyTechFlow Labs")));
  const subscribe = buildContactMailto("subscribe", { email: "a@b.com" });
  assert.ok(subscribe.includes(encodeURIComponent("Subscribe me to MyTechFlow Labs updates")));
  assert.ok(subscribe.includes(encodeURIComponent("a@b.com")));
});

test("the committed catalog carries status, featured, dates and features", () => {
  const raw = fs.readFileSync(new URL("../public/apps.json", import.meta.url), "utf8");
  const { apps } = parseAppsJson(raw);
  assert.equal(apps.length, 9);
  for (const app of apps) {
    assert.ok(["live", "beta", "soon"].includes(app.status), app.name);
    assert.equal(typeof app.featured, "boolean", app.name);
    assert.ok(Array.isArray(app.features), app.name);
  }
  assert.deepEqual(
    apps.filter((app) => app.featured).map((app) => app.id),
    ["lexi-parcours"],
  );
});

test("PWA shell files exist: manifest with icons, service worker, robots, sitemap", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      new URL("../public/manifest.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.name, "MyTechFlow Labs");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  const sw = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.ok(sw.includes("/apps.json"));
  assert.ok(
    fs.existsSync(new URL("../public/robots.txt", import.meta.url)),
  );
  const sitemap = fs.readFileSync(
    new URL("../public/sitemap.xml", import.meta.url),
    "utf8",
  );
  assert.ok(sitemap.includes("https://mytechflowlabs.com/"));
  // Icons are stored as base64 text and decoded at build time
  // (scripts/decode-icons.mjs) — the decoded bytes must be real PNGs.
  for (const size of [192, 512]) {
    const bytes = Buffer.from(
      fs.readFileSync(
        new URL(`../public/icon-${size}.png.b64`, import.meta.url),
        "utf8",
      ),
      "base64",
    );
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  }
});
