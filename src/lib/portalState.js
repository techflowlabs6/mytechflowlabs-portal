import { INITIAL_APPS } from "../data/portalApps.js";

export const APPS_KEY = "mytechflow_apps_v2";
export const ADMIN_KEY = "mytechflow_admin_clean";
export const MIGRATION_KEY = "mytechflow_citrus_v1";
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
