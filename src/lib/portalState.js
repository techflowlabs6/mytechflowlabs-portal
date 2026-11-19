import { INITIAL_APPS } from "../data/portalApps.js";

export const APPS_KEY = "mytechflow_apps_v2";
export const ADMIN_KEY = "mytechflow_admin_clean";
export const MIGRATION_KEY = "mytechflow_citrus_v1";
export const APPS_SAVED_AT_KEY = "mytechflow_apps_saved_at";
export const PUBLISH_TOKEN_KEY = "mytechflow_publish_token";
export const LAUNCH_KEY = "mytechflow_launches_v1";

/** Card badges: live apps, beta tests, and apps still on the way. */
export const STATUSES = ["live", "beta", "soon"];
export const STATUS_LABELS = {
  live: "Live",
  beta: "Beta",
  soon: "Coming soon",
};
export const SORTS = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
  { value: "launched", label: "Most launched" },
];
export const CATEGORIES = [
  "All",
  "Education",
  "Productivity",
  "Finance",
  "3D Games & Arcade",
];

export function safeWebUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

/**
 * Images may come from three safe places:
 *  - an https/http URL (Unsplash or any host),
 *  - a site-relative path such as /art/uploads/<id>.jpg (GitHub-committed uploads),
 *  - a data:image/* URL produced by the in-browser upload compressor.
 * Everything else (javascript:, data:text/html, file:, …) is rejected.
 */
export function safeImageUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(trimmed))
    return trimmed;
  if (trimmed.startsWith("/art/") && !trimmed.includes(".."))
    return trimmed;
  return safeWebUrl(trimmed);
}

export function readSavedAt(storage) {
  try {
    return storage?.getItem(APPS_SAVED_AT_KEY) || "";
  } catch {
    return "";
  }
}

export function writeSavedAt(storage, isoDate) {
  try {
    storage?.setItem(APPS_SAVED_AT_KEY, isoDate);
    return true;
  } catch {
    return false;
  }
}

/**
 * Decide whether this device should adopt the GitHub-committed catalog.
 * A stored copy with no saved-at stamp was never edited by its owner, so
 * adopting can never discard local work — the old rule skipped those
 * devices entirely, which hid every newly committed app from them
 * (SpeakSharp never appeared on a device that had only ever browsed).
 * A device with unpublished edits (saved after the last commit) keeps
 * its own copy instead.
 */
export function shouldAdoptCommitted({ hasLocal, savedAt, updatedAt }) {
  if (!hasLocal) return true;
  if (!savedAt) return true;
  return Boolean(updatedAt) && updatedAt > savedAt;
}

/** The committed public/apps.json shape: { version: 1, updatedAt, apps: [...] }. */
export function appsJsonPayload(apps, updatedAt = new Date().toISOString()) {
  return { version: 1, updatedAt, apps };
}

export function parseAppsJson(text) {
  const parsed = JSON.parse(text);
  const apps = Array.isArray(parsed) ? parsed : parsed?.apps;
  if (!Array.isArray(apps)) throw new Error("apps.json has no apps array.");
  const cleaned = hydrateApps(apps, true);
  return {
    updatedAt:
      typeof parsed?.updatedAt === "string" ? parsed.updatedAt : "",
    apps: cleaned,
  };
}

export function isLexi(app) {
  return (
    app.id === "lexi-parcours" ||
    safeWebUrl(app.url).startsWith("https://lexi.mytechflowlabs.com/")
  );
}

// Run the Lexi addition once. Existing edits, custom cards and intentional deletions survive.
export function hydrateApps(saved, migrated) {
  let apps = Array.isArray(saved)
    ? saved
        .filter((app) => app && typeof app.name === "string")
        .map((app, i) => ({
          ...app,
          id: String(app.id ?? `saved-${i}`),
          name: app.name,
          url: typeof app.url === "string" ? app.url : "",
          imageUrl: typeof app.imageUrl === "string" ? app.imageUrl : "",
          shortNote: typeof app.shortNote === "string" ? app.shortNote : "",
          description:
            typeof app.description === "string" ? app.description : "",
          category:
            typeof app.category === "string" ? app.category : "Productivity",
          status: STATUSES.includes(app.status) ? app.status : "live",
          featured: app.featured === true,
          addedAt: typeof app.addedAt === "string" ? app.addedAt : "",
          features: Array.isArray(app.features)
            ? app.features.filter((item) => typeof item === "string")
            : [],
          shortNoteFr:
            typeof app.shortNoteFr === "string" ? app.shortNoteFr : "",
          descriptionFr:
            typeof app.descriptionFr === "string" ? app.descriptionFr : "",
          featuresFr: Array.isArray(app.featuresFr)
            ? app.featuresFr.filter((item) => typeof item === "string")
            : [],
        }))
    : INITIAL_APPS.map((app) => ({ ...app }));

  if (!migrated && !apps.some(isLexi)) apps.unshift({ ...INITIAL_APPS[0] });
  const lexi = apps.find(isLexi);
  return lexi ? [lexi, ...apps.filter((app) => app !== lexi)] : apps;
}

export function readApps(storage) {
  try {
    const raw = storage.getItem(APPS_KEY);
    return hydrateApps(
      raw === null ? null : JSON.parse(raw),
      storage.getItem(MIGRATION_KEY) === "1",
    );
  } catch {
    return hydrateApps(null, false);
  }
}

export function readAdmin(storage) {
  try {
    return storage.getItem(ADMIN_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeApps(storage, apps) {
  try {
    storage.setItem(APPS_KEY, JSON.stringify(apps));
    storage.setItem(MIGRATION_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

const searchable = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function filterApps(apps, search, category) {
  const query = searchable(search.trim());
  return apps.filter(
    (app) =>
      (category === "All" || app.category === category) &&
      searchable([app.name, app.shortNote, app.description].join(" ")).includes(
        query,
      ),
  );
}

export function defaultArtwork(app) {
  const index = INITIAL_APPS.findIndex(
    (seed) => seed.id === app.id && seed.imageUrl === app.imageUrl,
  );
  return index >= 0 ? index : null;
}

/** "New" badge: an app added in the last 30 days. */
export function isNewApp(app, now = new Date()) {
  const added = Date.parse(app.addedAt || "");
  if (Number.isNaN(added)) return false;
  const age = now.getTime() - added;
  return age >= 0 && age < 30 * 24 * 60 * 60 * 1000;
}

export function sortApps(apps, sort, launchCounts = {}) {
  const addedMs = (app) => {
    const t = Date.parse(app.addedAt || "");
    return Number.isNaN(t) ? 0 : t;
  };
  const list = [...apps];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => addedMs(b) - addedMs(a));
    case "az":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "launched":
      return list.sort(
        (a, b) => (launchCounts[b.id] || 0) - (launchCounts[a.id] || 0),
      );
    case "featured":
    default:
      return list.sort(
        (a, b) => Number(b.featured === true) - Number(a.featured === true),
      );
  }
}

/** Per-device launch counts (localStorage): powers "Most launched" and "Jump back in". */
export function readLaunchCounts(store) {
  try {
    const raw = JSON.parse(store?.getItem(LAUNCH_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function recordLaunch(store, appId) {
  const counts = readLaunchCounts(store);
  counts[appId] = (counts[appId] || 0) + 1;
  try {
    store?.setItem(LAUNCH_KEY, JSON.stringify(counts));
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return counts;
}
