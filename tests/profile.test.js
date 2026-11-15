import test from "node:test";
import assert from "node:assert/strict";
import { newestApp, profileStats } from "../src/lib/profile.js";

const APPS = [
  { id: "lexi-parcours", name: "Lexi-Parcours", addedAt: "2026-11-14" },
  { id: "1", name: "French Learner App", addedAt: "" },
  { id: "2", name: "TimeLog Pro", addedAt: "2026-10-01" },
  { id: "3", name: "Old App", addedAt: "not-a-date" },
];

test("profile: newestApp picks the latest addedAt and ignores blanks", () => {
  assert.equal(newestApp(APPS).id, "lexi-parcours");
  assert.equal(newestApp([{ id: "a", addedAt: "" }]), null);
  assert.equal(newestApp([]), null);
  assert.equal(newestApp(null), null);
});

test("profile: newestApp keeps the first app on an addedAt tie", () => {
  const tied = [
    { id: "first", addedAt: "2026-11-14" },
    { id: "second", addedAt: "2026-11-14" },
  ];
  assert.equal(newestApp(tied).id, "first");
});

test("profile: profileStats counts apps, totals, most launched and newest", () => {
  const stats = profileStats(
    APPS,
    { "lexi-parcours": 12, 1: 4, 2: 0 },
    { "lexi-parcours": 3, 1: 9, 2: 0 },
  );
  assert.equal(stats.appCount, 4);
  assert.deepEqual(stats.totals, { launches: 16, likes: 12 });
  assert.equal(stats.mostLaunched.id, "lexi-parcours");
  assert.equal(stats.newest.id, "lexi-parcours");
  // Rows come sorted most-launched first, like the admin charts.
  assert.deepEqual(
    stats.rows.map((row) => row.id),
    ["lexi-parcours", "1", "2", "3"],
  );
});

test("profile: profileStats handles an empty catalog", () => {
  const stats = profileStats([], {}, {});
  assert.equal(stats.appCount, 0);
  assert.deepEqual(stats.totals, { launches: 0, likes: 0 });
  assert.equal(stats.mostLaunched, null);
  assert.equal(stats.newest, null);
  assert.deepEqual(stats.rows, []);
});

test("profile: profileStats treats missing counts as zero", () => {
  const stats = profileStats(APPS, undefined, undefined);
  assert.deepEqual(stats.totals, { launches: 0, likes: 0 });
  assert.equal(stats.mostLaunched, null);
  assert.equal(stats.newest.id, "lexi-parcours");
});
