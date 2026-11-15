/**
 * Renewal calendar — the owner's list of domain / hosting / subscription
 * renewals, saved per device in localStorage. Dates are entered by hand;
 * nothing here does a live lookup (the domain tracker in batch 3 is the
 * one that checks expiry dates online).
 */

export const RENEWALS_KEY = "mytechflow_renewals_v1";
export const RENEWAL_KINDS = ["domain", "hosting", "subscription"];
export const RENEWAL_KIND_LABELS = {
  domain: "Domain",
  hosting: "Hosting",
  subscription: "Subscription",
};

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole days from today to the date; null when the date is empty/invalid. */
export function daysUntil(dateStr, now = new Date()) {
  const target = parseDateOnly(dateStr);
  if (!target) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

/** overdue | soon (<=30 days) | watch (<=90 days) | ok | nodate. */
export function renewalStatus(renewal, now = new Date()) {
  const days = daysUntil(renewal?.date, now);
  if (days === null) return "nodate";
  if (days < 0) return "overdue";
  if (days <= 30) return "soon";
  if (days <= 90) return "watch";
  return "ok";
}

/** Dated renewals first, soonest first; undated last, by name. */
export function sortRenewals(list, now = new Date()) {
  return [...(list || [])].sort((a, b) => {
    const da = daysUntil(a?.date, now);
    const db = daysUntil(b?.date, now);
    if (da === null && db === null) {
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    }
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db || String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

/**
 * First-run seed: one "domain" renewal per unique hostname in the
 * catalog, with no date yet ("set a date" in the UI).
 */
export function seedRenewals(apps) {
  const seen = new Set();
  const seeded = [];
  for (const app of apps || []) {
    let host = "";
    try {
      host = new URL(String(app?.url || "")).hostname.toLowerCase();
      if (host.startsWith("www.")) host = host.slice(4);
    } catch {
      host = "";
    }
    if (!host || seen.has(host)) continue;
    seen.add(host);
    seeded.push({ id: uid(), name: host, kind: "domain", date: "", cost: "" });
  }
  return seeded;
}

export function createRenewal({ name = "", kind = "domain", date = "", cost = "" } = {}) {
  return {
    id: uid(),
    name: String(name).trim(),
    kind: RENEWAL_KINDS.includes(kind) ? kind : "domain",
    date: String(date).trim(),
    cost: String(cost).trim(),
  };
}

/**
 * null when nothing was ever saved (caller seeds from the catalog),
 * [] when an empty list was saved on purpose, [] on damaged data.
 */
export function readRenewals(storage) {
  try {
    const raw = storage?.getItem(RENEWALS_KEY);
    if (raw === null || raw === undefined) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
}

export function writeRenewals(storage, renewals) {
  try {
    storage?.setItem(RENEWALS_KEY, JSON.stringify(renewals || []));
    return true;
  } catch {
    return false;
  }
}

export function upsertRenewal(renewals, renewal) {
  const next = [...(renewals || [])];
  const index = next.findIndex((item) => item.id === renewal.id);
  if (index >= 0) next[index] = renewal;
  else next.push(renewal);
  return next;
}

export function deleteRenewal(renewals, id) {
  return (renewals || []).filter((item) => item.id !== id);
}
