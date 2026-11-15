import test from "node:test";
import assert from "node:assert/strict";
import {
  VIDEOS_KEY,
  readVideosOpen,
  writeVideosOpen,
} from "../src/lib/uiPrefs.js";

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

test("videos collapse: closed by default, remembered once opened", () => {
  const store = fakeStore();
  assert.equal(readVideosOpen(store), false);
  writeVideosOpen(store, true);
  assert.equal(store._data[VIDEOS_KEY], "1");
  assert.equal(readVideosOpen(store), true);
  writeVideosOpen(store, false);
  assert.equal(store._data[VIDEOS_KEY], "0");
  assert.equal(readVideosOpen(store), false);
});

test("videos collapse: a missing or broken store reads as closed", () => {
  assert.equal(readVideosOpen(null), false);
  assert.equal(readVideosOpen({}), false);
  const throwing = {
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("denied");
    },
  };
  assert.equal(readVideosOpen(throwing), false);
  writeVideosOpen(throwing, true); // must not throw
});
