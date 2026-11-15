/**
 * Admin theme presets — the accent + surface colours for the whole site.
 *
 * Applied as a `data-accent="<id>"` attribute on <html> (see the rules at
 * the end of src/index.css). The day/night toggle keeps working on top:
 * each preset defines its colours for the light theme and for the dark
 * theme separately, so switching light/dark never fights the preset.
 * The choice is saved per device in localStorage.
 */

export const ACCENT_KEY = "mytechflow_accent";
export const DEFAULT_ACCENT = "amber-teal";

export const ACCENT_PRESETS = [
  {
    id: "amber-teal",
    name: "Amber Teal",
    light: { citrus: "#c7f13c", paper: "#fafbf7", surface: "#ffffff", surface2: "#edf0e8" },
    dark: { citrus: "#c7f13c", paper: "#121a15", surface: "#182420", surface2: "#1e2d25" },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    light: { citrus: "#3b82f6", paper: "#f6f9fc", surface: "#ffffff", surface2: "#e8eef5" },
    dark: { citrus: "#60a5fa", paper: "#0f161d", surface: "#16222d", surface2: "#1c2c3a" },
  },
  {
    id: "sunset",
    name: "Sunset Coral",
    light: { citrus: "#ff7a59", paper: "#fdf8f5", surface: "#ffffff", surface2: "#f7e9e2" },
    dark: { citrus: "#ff9a7a", paper: "#1c1310", surface: "#241a15", surface2: "#2e211a" },
  },
  {
    id: "violet",
    name: "Royal Violet",
    light: { citrus: "#8b5cf6", paper: "#f8f7fd", surface: "#ffffff", surface2: "#ece9f7" },
    dark: { citrus: "#a78bfa", paper: "#151222", surface: "#1d1930", surface2: "#261f40" },
  },
  {
    id: "mint",
    name: "Forest Mint",
    light: { citrus: "#10b981", paper: "#f5faf7", surface: "#ffffff", surface2: "#e6f1ea" },
    dark: { citrus: "#34d399", paper: "#101a14", surface: "#16241b", surface2: "#1d2f24" },
  },
  {
    id: "rose",
    name: "Rose Pink",
    light: { citrus: "#ec4899", paper: "#fdf7f9", surface: "#ffffff", surface2: "#f8e8ef" },
    dark: { citrus: "#f472b6", paper: "#1d1218", surface: "#281a22", surface2: "#33222c" },
  },
];

export function presetById(id) {
  return ACCENT_PRESETS.find((preset) => preset.id === id) || ACCENT_PRESETS[0];
}

/** Pure helper so tests can check the choice without a DOM. */
export function resolveAccent(stored) {
  return ACCENT_PRESETS.some((preset) => preset.id === stored)
    ? stored
    : DEFAULT_ACCENT;
}

export function readAccent(storage) {
  try {
    return resolveAccent(storage?.getItem(ACCENT_KEY));
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function applyAccent(id) {
  const value = resolveAccent(id);
  document.documentElement.dataset.accent = value;
  return value;
}

export function writeAccent(storage, id) {
  const value = resolveAccent(id);
  try {
    storage?.setItem(ACCENT_KEY, value);
  } catch {
    /* Private browsing may block storage; the preset still applies this visit. */
  }
  return value;
}
