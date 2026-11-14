export const THEME_KEY = "mytechflow_theme";
export const THEMES = ["light", "dark"];

/** Pure helper so tests can check the choice without a DOM. */
export function resolveTheme(stored, prefersDark) {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

export function readTheme(storage, prefersDark) {
  try {
    return resolveTheme(storage?.getItem(THEME_KEY), prefersDark);
  } catch {
    return prefersDark ? "dark" : "light";
  }
}

export function applyTheme(theme) {
  const value = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = value;
  try {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute(
        "content",
        value === "dark" ? "#0e1512" : "#c7f13c",
      );
  } catch {
    /* theme-color is cosmetic; ignore failures. */
  }
  return value;
}

export function writeTheme(storage, theme) {
  const value = theme === "dark" ? "dark" : "light";
  try {
    storage?.setItem(THEME_KEY, value);
  } catch {
    /* Private browsing may block storage; theme still applies this visit. */
  }
  return value;
}
