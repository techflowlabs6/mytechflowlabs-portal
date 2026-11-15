/**
 * Owner tools for the admin back office: uptime monitor, analytics
 * dashboard and domain tracker.
 *
 * Admin is English by design — nothing here is translated, and the
 * visitor-facing site is untouched by these sections.
 *
 * - Uptime: live check on demand via /api/uptime, no storage in v1.
 * - Analytics: shared totals from /api/stats when configured (the
 *   shared flag comes from the page), otherwise this device's counts.
 *   Charts are dependency-free SVG bars.
 * - Domains: watchlist derived from the catalog URLs plus domains the
 *   admin adds by hand; the manual part is saved in localStorage on
 *   this device only. Expiry comes from /api/domains (RDAP).
 */

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  barWidth,
  buildChartData,
  daysUntil,
  deriveDomains,
  expiryTone,
  normalizeDomain,
  readDomainWatchlist,
  writeDomainWatchlist,
} from "../lib/adminTools.js";
import { formatCount } from "../lib/stats.js";

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

function formatCheckedAt(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatExpiryDate(iso) {
  try {
    return new Date(iso).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Uptime
// ---------------------------------------------------------------------------

function UptimeSection() {
  const [uptime, setUptime] = useState({
    state: "idle",
    checkedAt: "",
    results: [],
  });

  const check = async () => {
    setUptime((prev) => ({ ...prev, state: "loading" }));
    try {
      const response = await fetch("/api/uptime");
      if (!response.ok) throw new Error("uptime unavailable");
      const data = await response.json();
      setUptime({
        state: "done",
        checkedAt: data.checkedAt || "",
        results: Array.isArray(data.results) ? data.results : [],
      });
    } catch {
      setUptime((prev) => ({ ...prev, state: "error" }));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await check();
    })();
    return () => {
      cancelled = true;
    };
    // One live check when the section appears; Refresh re-checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const up = uptime.results.filter((row) => row.ok).length;
  return (
    <section className="admin-section" aria-labelledby="admin-uptime">
      <div className="admin-section-head">
        <div>
          <h3 id="admin-uptime">Uptime</h3>
          <p>
            Live check of every app, right now.{" "}
            {uptime.state === "done" &&
              `${up} of ${uptime.results.length} up.`}
          </p>
        </div>
        <button
          className="button button--quiet"
          onClick={check}
          disabled={uptime.state === "loading"}
        >
          <RefreshCw size={16} />
          {uptime.state === "loading" ? "Checking…" : "Refresh"}
        </button>
      </div>
      {uptime.state === "error" && (
        <p className="admin-note admin-note--error" role="status">
          Could not check uptime. Try Refresh in a moment.
        </p>
      )}
      {uptime.state === "loading" && !uptime.results.length && (
        <p className="admin-note">Checking every app…</p>
      )}
      {uptime.results.length > 0 && (
        <ul className="uptime-list">
          {uptime.results.map((row) => (
            <li key={row.id} className="uptime-row">
              <span
                className={`status-dot ${row.ok ? "status-dot--ok" : "status-dot--down"}`}
                aria-label={row.ok ? "Up" : "Down"}
              />
              <span className="uptime-name">{row.name}</span>
              <span className="uptime-url">{row.url}</span>
              <span className="uptime-meta">
                {row.ok
                  ? `${row.status} · ${row.ms} ms`
                  : row.status
                    ? `HTTP ${row.status}`
                    : "No response"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {uptime.checkedAt && (
        <p className="admin-note">
          Last checked {formatCheckedAt(uptime.checkedAt)}
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

function BarChart({ rows, valueKey, color, label }) {
  const max = Math.max(0, ...rows.map((row) => row[valueKey]));
  const rowHeight = 30;
  const height = rows.length * rowHeight + 8;
  return (
    <svg
      className="analytics-chart"
      viewBox={`0 0 640 ${height}`}
      width="100%"
      role="img"
      aria-label={label}
    >
      {rows.map((row, index) => {
        const y = 8 + index * rowHeight;
        const width = (barWidth(row[valueKey], max) / 100) * 360;
        const name =
          row.name.length > 24 ? `${row.name.slice(0, 24)}…` : row.name;
        return (
          <g key={row.id}>
            <text x="8" y={y + 17} fontSize="13" fill="currentColor">
              {name}
            </text>
            <rect
              x="190"
              y={y + 4}
              width={row[valueKey] > 0 ? Math.max(width, 2) : 0}
              height="16"
              rx="4"
              fill={color}
            />
            <text x="562" y={y + 17} fontSize="13" fill="currentColor">
              {formatCount(row[valueKey])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AnalyticsSection({ apps, launches, likes, shared }) {
  const { rows, totals, mostLaunched } = buildChartData(apps, launches, likes);
  return (
    <section className="admin-section" aria-labelledby="admin-analytics">
      <div className="admin-section-head">
        <div>
          <h3 id="admin-analytics">Analytics</h3>
          <p>
            {shared
              ? "Shared (Drive/KV) — totals across all visitors."
              : "This device only — shared counts need the Drive setup (see DRIVE_STATS_SETUP.md)."}
          </p>
        </div>
      </div>
      <div className="analytics-totals">
        <div>
          <strong>{formatCount(totals.launches)}</strong>
          <span>Total launches</span>
        </div>
        <div>
          <strong>{formatCount(totals.likes)}</strong>
          <span>Total likes</span>
        </div>
        <div>
          <strong>{mostLaunched ? mostLaunched.name : "—"}</strong>
          <span>Most launched</span>
        </div>
      </div>
      {totals.launches === 0 && totals.likes === 0 ? (
        <p className="admin-note">
          No launches recorded yet — open an app and the numbers appear
          here.
        </p>
      ) : (
        <div className="analytics-charts">
          <div>
            <h4>Launches per app</h4>
            <BarChart
              rows={rows}
              valueKey="launches"
              color="#799e26"
              label="Launches per app"
            />
          </div>
          <div>
            <h4>Likes per app</h4>
            <BarChart
              rows={rows}
              valueKey="likes"
              color="#ff5d73"
              label="Likes per app"
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

function DomainsSection({ apps }) {
  const [manual, setManual] = useState(() => readDomainWatchlist(storage()));
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainError, setDomainError] = useState("");

  // Catalog domains plus the admin's own additions, catalog order first.
  const watchlist = [
    ...deriveDomains(apps),
    ...manual.filter((domain) => !deriveDomains(apps).includes(domain)),
  ];
  const derived = new Set(deriveDomains(apps));

  const checkDomains = async (list) => {
    setChecking(true);
    const settled = await Promise.all(
      list.map(async (domain) => {
        try {
          const response = await fetch(
            `/api/domains?domain=${encodeURIComponent(domain)}`,
          );
          if (!response.ok) return [domain, { error: true }];
          return [domain, await response.json()];
        } catch {
          return [domain, { error: true }];
        }
      }),
    );
    setResults((prev) => ({ ...prev, ...Object.fromEntries(settled) }));
    setChecking(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await checkDomains(watchlist);
    })();
    return () => {
      cancelled = true;
    };
    // One lookup per domain when the section appears; Refresh re-checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addDomain = () => {
    const domain = normalizeDomain(newDomain);
    if (!domain) {
      setDomainError("Enter a domain like mytechflowlabs.com");
      return;
    }
    if (watchlist.includes(domain)) {
      setDomainError("That domain is already on the list.");
      return;
    }
    setDomainError("");
    const next = writeDomainWatchlist(storage(), [...manual, domain]);
    setManual(next);
    setNewDomain("");
    checkDomains([domain]);
  };

  const removeDomain = (domain) => {
    const next = writeDomainWatchlist(
      storage(),
      manual.filter((item) => item !== domain),
    );
    setManual(next);
    setResults((prev) => {
      const copy = { ...prev };
      delete copy[domain];
      return copy;
    });
  };

  return (
    <section className="admin-section" aria-labelledby="admin-domains">
      <div className="admin-section-head">
        <div>
          <h3 id="admin-domains">Domains</h3>
          <p>
            Expiry dates for the domains your apps live on. Red means under
            30 days, amber under 90. Watchlist saved on this device only.
          </p>
        </div>
        <button
          className="button button--quiet"
          onClick={() => checkDomains(watchlist)}
          disabled={checking}
        >
          <RefreshCw size={16} />
          {checking ? "Checking…" : "Refresh"}
        </button>
      </div>
      <ul className="domain-list">
        {watchlist.map((domain) => {
          const info = results[domain];
          const days =
            info && !info.error ? daysUntil(info.expiry) : null;
          const tone = expiryTone(days);
          return (
            <li key={domain} className="domain-row">
              <span
                className={`status-dot status-dot--${tone}`}
                aria-label={`Expires ${tone}`}
              />
              <span className="domain-name">{domain}</span>
              <span className="domain-meta">
                {info?.error || !info
                  ? "unknown"
                  : !info.found
                    ? "not found in the registry"
                    : info.expiry
                      ? `${formatExpiryDate(info.expiry)} · ${days < 0 ? `expired ${-days} days ago` : `${days} days left`}`
                      : "no expiry on record"}
              </span>
              <span className="domain-meta">
                {info?.registrar || ""}
              </span>
              {!derived.has(domain) && (
                <button
                  className="button button--quiet button--small"
                  onClick={() => removeDomain(domain)}
                  aria-label={`Remove ${domain}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="domain-add">
        <label className="sr-only" htmlFor="domain-add-input">
          Add a domain to watch
        </label>
        <input
          id="domain-add-input"
          type="text"
          value={newDomain}
          onChange={(event) => setNewDomain(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addDomain();
          }}
          placeholder="Add a domain, e.g. example.com"
          autoComplete="off"
        />
        <button className="button button--primary" onClick={addDomain}>
          <Plus size={16} />
          Add domain
        </button>
      </div>
      {domainError && (
        <p className="admin-note admin-note--error" role="status">
          {domainError}
        </p>
      )}
    </section>
  );
}

export default function AdminTools({ apps, launches, likes, shared }) {
  return (
    <div className="admin-tools">
      <UptimeSection />
      <AnalyticsSection
        apps={apps}
        launches={launches}
        likes={likes}
        shared={shared}
      />
      <DomainsSection apps={apps} />
    </div>
  );
}
