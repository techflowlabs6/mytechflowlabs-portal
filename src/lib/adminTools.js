/**
 * Owner/admin tool helpers for the portal: uptime, analytics charts
 * and the domain tracker. Pure functions only — the React pieces live
 * in src/components/AdminTools.jsx and the server pieces in api/.
 *
 * Admin is English by design; these helpers never translate anything.
 */

export const DOMAINS_KEY = "mytechflow_domains_v1";

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/** Lowercase a domain, strip www. and a trailing slash; "" when invalid. */
export function normalizeDomain(value) {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
  return DOMAIN_PATTERN.test(cleaned) ? cleaned : "";
}

/** Hostname of an app URL, www. stripped; "" when it is not a URL. */
export function hostnameOf(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") ? host : "";
  } catch {
    return "";
  }
}

/** Unique domains of the catalog, in catalog order. */
export function deriveDomains(apps) {
  const seen = new Set();
  const domains = [];
  for (const app of apps || []) {
    const host = hostnameOf(app?.url);
    if (host && !seen.has(host)) {
      seen.add(host);
      domains.push(host);
    }
  }
  return domains;
}

/** Whole days from now until an ISO date; null when the date is unusable. */
export function daysUntil(dateStr, now = new Date()) {
  const target = Date.parse(dateStr || "");
  if (Number.isNaN(target)) return null;
  return Math.floor((target - now.getTime()) / (24 * 60 * 60 * 1000));
}

/** Colour tone for a days-until-expiry value. */
export function expiryTone(days) {
  if (days === null || days === undefined) return "unknown";
  if (days < 0) return "expired";
  if (days < 30) return "red";
  if (days < 90) return "amber";
  return "ok";
}

/** The admin's domain watchlist (localStorage, this device only). */
export function readDomainWatchlist(store) {
  try {
    const raw = JSON.parse(store?.getItem(DOMAINS_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return [...new Set(raw.map(normalizeDomain).filter(Boolean))];
  } catch {
    return [];
  }
}

export function writeDomainWatchlist(store, list) {
  const clean = [...new Set((list || []).map(normalizeDomain).filter(Boolean))];
  try {
    store?.setItem(DOMAINS_KEY, JSON.stringify(clean));
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return clean;
}

/**
 * Rows for the analytics bar charts, sorted most-launched first, plus
 * totals and the most-launched app (null when nothing launched yet).
 */
export function buildChartData(apps, launches, likes) {
  const rows = (apps || []).map((app) => ({
    id: app.id,
    name: app.name,
    launches: Number(launches?.[app.id]) || 0,
    likes: Number(likes?.[app.id]) || 0,
  }));
  rows.sort((a, b) => b.launches - a.launches || b.likes - a.likes);
  const totals = rows.reduce(
    (acc, row) => ({
      launches: acc.launches + row.launches,
      likes: acc.likes + row.likes,
    }),
    { launches: 0, likes: 0 },
  );
  const mostLaunched = rows.find((row) => row.launches > 0) || null;
  return { rows, totals, mostLaunched };
}

/** Bar width as a percentage of the chart maximum (0–100). */
export function barWidth(value, max) {
  if (!max || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}
