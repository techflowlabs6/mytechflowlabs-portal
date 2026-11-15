import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { INITIAL_APPS } from "../src/data/portalApps.js";
import {
  appsJsonPayload,
  parseAppsJson,
  safeImageUrl,
} from "../src/lib/portalState.js";
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
