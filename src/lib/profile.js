/**
 * Profile page data helpers: the public profile view's numbers.
 * Pure functions only — the React pieces live in
 * src/components/ProfileView.jsx. Built on the admin chart helpers
 * in src/lib/adminTools.js so both pages always agree.
 */

import { buildChartData } from "./adminTools.js";

/** The most recently added app (by addedAt), or null when none has one. */
export function newestApp(apps) {
  let newest = null;
  let newestTime = 0;
  for (const app of apps || []) {
    const time = Date.parse(app?.addedAt || "");
    if (Number.isNaN(time)) continue;
    if (time > newestTime) {
      newestTime = time;
      newest = app;
    }
  }
  return newest;
}

/**
 * Everything the profile page shows: app count, chart rows, totals,
 * the most-launched app and the newest app.
 */
export function profileStats(apps, launches, likes) {
  const list = Array.isArray(apps) ? apps : [];
  const { rows, totals, mostLaunched } = buildChartData(
    list,
    launches,
    likes,
  );
  return {
    appCount: list.length,
    rows,
    totals,
    mostLaunched,
    newest: newestApp(list),
  };
}
