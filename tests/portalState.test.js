import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_APPS } from "../src/data/portalApps.js";
import {
  APPS_KEY,
  MIGRATION_KEY,
  defaultArtwork,
  filterApps,
  hydrateApps,
  readApps,
  safeWebUrl,
  writeApps,
} from "../src/lib/portalState.js";

const memory = (initial) => {
  const values = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("fresh installs have ten launchable apps and Lexi first", () => {
  const apps = readApps(memory());
  assert.equal(apps.length, 10);
  assert.equal(apps[0].url, "https://lexi.mytechflowlabs.com/");
  assert.ok(apps.every((app) => safeWebUrl(app.url)));
  assert.equal(new Set(apps.map((app) => app.id)).size, 10);
});

test("SpeakSharp is in the catalog with its live link and French copy", () => {
  const app = INITIAL_APPS.find((entry) => entry.id === "speaksharp");
  assert.ok(app);
  assert.equal(app.name, "SpeakSharp");
  assert.equal(app.url, "https://speaksharp.mytechflowlabs.com/");
  assert.equal(app.category, "Education");
  assert.equal(app.status, "live");
  assert.equal(app.addedAt, "2026-11-19");
  assert.equal(app.shortNote, "Say it sharp, say it right.");
  assert.ok(app.descriptionFr.length > 20);
  assert.ok(app.featuresFr.length >= 3);
});

test("migration preserves customized cards and a shortened existing collection", () => {
  const edited = {
    ...INITIAL_APPS[2],
    name: "My French reader",
    description: "My custom notes",
    imageUrl: "https://example.com/mine.jpg",
  };
  const custom = {
    id: "personal",
    name: "Personal project",
    url: "https://example.com/",
    description: "",
  };
  const result = hydrateApps([edited, custom], false);
  assert.equal(result.length, 3);
  assert.equal(result[1].name, edited.name);
  assert.equal(result[1].description, edited.description);
  assert.equal(result[1].imageUrl, edited.imageUrl);
  assert.equal(result[2].id, "personal");
});

test("a previously added Lexi URL is recognized and moved first without duplication", () => {
  const result = hydrateApps(
    [INITIAL_APPS[1], { ...INITIAL_APPS[0], id: "manually-added" }],
    false,
  );
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "manually-added");
});

test("intentional deletions, including an empty collection, survive reloads after migration", () => {
  const store = memory();
  assert.equal(writeApps(store, []), true);
  assert.equal(store.getItem(MIGRATION_KEY), "1");
  assert.deepEqual(readApps(store), []);
  const withoutLexi = INITIAL_APPS.slice(1, 3);
  writeApps(store, withoutLexi);
  assert.deepEqual(
    readApps(store).map((app) => app.id),
    withoutLexi.map((app) => app.id),
  );
});

test("corrupt or unavailable browser storage falls back safely", () => {
  assert.equal(readApps(memory({ [APPS_KEY]: "{invalid" })).length, 10);
  const blocked = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("quota");
    },
  };
  assert.equal(readApps(blocked).length, 10);
  assert.equal(writeApps(blocked, INITIAL_APPS), false);
});

test("search trims whitespace, handles accents, and combines with category filtering", () => {
  const apps = [
    { ...INITIAL_APPS[1], name: "Français Décode" },
    ...INITIAL_APPS.slice(2),
  ];
  assert.equal(filterApps(apps, "  francais decode  ", "Education").length, 1);
  assert.equal(
    filterApps(apps, "pomodoro", "Productivity")[0].name,
    "TimeLog Pro",
  );
  assert.equal(filterApps(apps, "pomodoro", "Finance").length, 0);
  assert.equal(filterApps(apps, "", "3D Games & Arcade").length, 4);
});

test("app and image links accept only complete http(s) URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>",
    "file:///tmp/a",
    "/relative",
    "invalid",
  ])
    assert.equal(safeWebUrl(value), "");
  assert.equal(safeWebUrl("https://example.com"), "https://example.com/");
  assert.equal(safeWebUrl("http://localhost:3000"), "http://localhost:3000/");
});

test("default art never replaces a user-customized image", () => {
  assert.equal(defaultArtwork(INITIAL_APPS[0]), 0);
  assert.equal(defaultArtwork(INITIAL_APPS[8]), 8);
  assert.equal(
    defaultArtwork({
      ...INITIAL_APPS[1],
      imageUrl: "https://example.com/custom.jpg",
    }),
    null,
  );
  assert.equal(defaultArtwork({ id: "custom", imageUrl: "" }), null);
});
