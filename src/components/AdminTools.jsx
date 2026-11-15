/**
 * Owner tools for the admin back office — batch 3 + batch 4 sections.
 *
 * Admin is English by design — nothing here is translated, and the
 * visitor-facing site is untouched by these sections.
 *
 * Batch 3:
 * - Uptime: live check on demand via /api/uptime, no storage in v1.
 * - Analytics: shared totals from /api/stats when configured (the
 *   shared flag comes from the page), otherwise this device's counts.
 *   Charts are dependency-free SVG bars.
 * - Domains: watchlist derived from the catalog URLs plus domains the
 *   admin adds by hand; the manual part is saved in localStorage on
 *   this device only. Expiry comes from /api/domains (RDAP).
 *
 * Batch 4:
 * - Theme editor: accent presets via CSS variables, per device.
 * - Scratchpad: title+body notes, per device in localStorage.
 * - Renewal calendar: manual renewal dates, soonest first.
 * - Duplicate links: normalized URL collisions in the catalog.
 * - Messages inbox: contact/request/newsletter submissions from
 *   /api/messages (Drive-backed, admin token required).
 */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Inbox,
  Link2,
  Mail,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
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
import { ACCENT_PRESETS, DEFAULT_ACCENT } from "../lib/accentTheme.js";
import {
  createNote,
  deleteNote,
  readNotes,
  upsertNote,
  writeNotes,
} from "../lib/notes.js";
import {
  RENEWAL_KIND_LABELS,
  RENEWAL_KINDS,
  createRenewal,
  daysUntil as renewalDaysUntil,
  deleteRenewal,
  readRenewals,
  renewalStatus,
  seedRenewals,
  sortRenewals,
  upsertRenewal,
  writeRenewals,
} from "../lib/renewals.js";
import { findDuplicateUrls } from "../lib/urls.js";

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

const READ_IDS_KEY = "mytechflow_messages_read_v1";

function readReadIds(store) {
  try {
    const parsed = JSON.parse(store?.getItem(READ_IDS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeReadIds(store, ids) {
  try {
    store?.setItem(READ_IDS_KEY, JSON.stringify(ids));
  } catch {
    /* Read state is cosmetic; ignore storage failures. */
  }
}

function formatDate(value) {
  const time = Date.parse(value || "");
  if (Number.isNaN(time)) return value || "";
  return new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  const time = Date.parse(value || "");
  if (Number.isNaN(time)) return value || "";
  return new Date(time).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Theme editor (#20)
// ---------------------------------------------------------------------------

function ThemeEditor({ accent, onAccentChange }) {
  return (
    <section className="admin-section" aria-label="Theme">
      <h3>
        <Palette size={16} /> Theme
      </h3>
      <p>
        Pick the site&rsquo;s colours. It previews live on this page and is
        saved on this device; the day/night switch keeps working on top.
      </p>
      <div className="preset-grid">
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-btn ${accent === preset.id ? "is-active" : ""}`}
            onClick={() => onAccentChange(preset.id)}
            aria-pressed={accent === preset.id}
          >
            <span className="preset-dots" aria-hidden="true">
              <span style={{ background: preset.light.citrus }} />
              <span style={{ background: preset.dark.citrus }} />
            </span>
            {preset.name}
            {accent === preset.id && <Check size={15} />}
          </button>
        ))}
      </div>
      <div className="admin-section-actions">
        <button
          type="button"
          className="button button--quiet"
          onClick={() => onAccentChange(DEFAULT_ACCENT)}
          disabled={accent === DEFAULT_ACCENT}
        >
          <RotateCcw size={15} />
          Reset to default
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Scratchpad (#14)
// ---------------------------------------------------------------------------

function Scratchpad() {
  const [notes, setNotes] = useState(() => readNotes(storage()));
  const [editingId, setEditingId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    writeNotes(storage(), notes);
  }, [notes]);

  const startNew = () => {
    setEditingId("");
    setTitle("");
    setBody("");
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
  };

  const save = () => {
    if (!title.trim() && !body.trim()) return;
    const note = editingId
      ? { ...notes.find((item) => item.id === editingId), title, body }
      : createNote(title, body);
    setNotes((previous) => upsertNote(previous, note));
    startNew();
  };

  return (
    <section className="admin-section" aria-label="Scratchpad">
      <h3>
        <StickyNote size={16} /> Scratchpad
      </h3>
      <p>Quick notes for yourself. Saved on this device only.</p>
      <div className="admin-form">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          aria-label="Note title"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write it down…"
          rows={3}
          aria-label="Note body"
        />
        <div className="admin-section-actions">
          <button type="button" className="button button--primary" onClick={save}>
            {editingId ? "Save note" : "Add note"}
          </button>
          {(editingId || title || body) && (
            <button type="button" className="button button--quiet" onClick={startNew}>
              <X size={15} />
              Cancel
            </button>
          )}
        </div>
      </div>
      {notes.length ? (
        <ul className="admin-list">
          {notes.map((note) => (
            <li key={note.id} className="admin-list-item">
              <div>
                <strong>{note.title || "(no title)"}</strong>
                {note.body && <p>{note.body}</p>}
                <span className="admin-list-meta">
                  Updated {formatDateTime(note.updatedAt)}
                </span>
              </div>
              <div className="admin-list-actions">
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => startEdit(note)}
                  aria-label={`Edit note ${note.title || ""}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => setNotes((previous) => deleteNote(previous, note.id))}
                  aria-label={`Delete note ${note.title || ""}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-empty">No notes yet.</p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Renewal calendar (#9)
// ---------------------------------------------------------------------------

const STATUS_LABELS = {
  overdue: "Overdue",
  soon: "Due soon",
  watch: "Within 90 days",
  ok: "OK",
  nodate: "Set a date",
};

function Renewals({ apps }) {
  const [renewals, setRenewals] = useState(() => {
    const stored = readRenewals(storage());
    return stored === null ? seedRenewals(apps) : stored;
  });
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("domain");
  const [date, setDate] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    writeRenewals(storage(), renewals);
  }, [renewals]);

  const startNew = () => {
    setEditingId("");
    setName("");
    setKind("domain");
    setDate("");
    setCost("");
  };

  const startEdit = (renewal) => {
    setEditingId(renewal.id);
    setName(renewal.name);
    setKind(renewal.kind);
    setDate(renewal.date);
    setCost(renewal.cost);
  };

  const save = () => {
    if (!name.trim()) return;
    const renewal = editingId
      ? { id: editingId, name, kind, date, cost }
      : createRenewal({ name, kind, date, cost });
    setRenewals((previous) => upsertRenewal(previous, renewal));
    startNew();
  };

  const sorted = sortRenewals(renewals);

  return (
    <section className="admin-section" aria-label="Renewal calendar">
      <h3>
        <CalendarClock size={16} /> Renewal calendar
      </h3>
      <p>
        Domains, hosting and subscriptions with their renewal dates. Dates
        are entered by hand; the list is saved on this device only.
      </p>
      <div className="admin-form">
        <div className="form-row">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name — e.g. mytechflowlabs.com"
            aria-label="Renewal name"
          />
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            aria-label="Renewal kind"
          >
            {RENEWAL_KINDS.map((value) => (
              <option key={value} value={value}>
                {RENEWAL_KIND_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Renewal date"
          />
          <input
            type="text"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="Cost (optional)"
            aria-label="Renewal cost"
          />
        </div>
        <div className="admin-section-actions">
          <button type="button" className="button button--primary" onClick={save}>
            {editingId ? "Save renewal" : "Add renewal"}
          </button>
          {(editingId || name || date || cost) && (
            <button type="button" className="button button--quiet" onClick={startNew}>
              <X size={15} />
              Cancel
            </button>
          )}
        </div>
      </div>
      {sorted.length ? (
        <ul className="admin-list">
          {sorted.map((renewal) => {
            const status = renewalStatus(renewal);
            const days = renewalDaysUntil(renewal.date);
            return (
              <li key={renewal.id} className="admin-list-item">
                <div>
                  <strong>{renewal.name}</strong>{" "}
                  <span className={`status-badge status-badge--${status}`}>
                    {status === "nodate"
                      ? STATUS_LABELS[status]
                      : `${STATUS_LABELS[status]}${days !== null ? ` — ${days < 0 ? `${-days} days overdue` : days === 0 ? "today" : `in ${days} days`}` : ""}`}
                  </span>
                  <p>
                    {RENEWAL_KIND_LABELS[renewal.kind] || renewal.kind}
                    {renewal.date ? ` · renews ${formatDate(renewal.date)}` : " · no date set"}
                    {renewal.cost ? ` · ${renewal.cost}` : ""}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => startEdit(renewal)}
                    aria-label={`Edit renewal ${renewal.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() =>
                      setRenewals((previous) => deleteRenewal(previous, renewal.id))
                    }
                    aria-label={`Delete renewal ${renewal.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-empty">No renewals tracked yet.</p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Duplicate-link detector (#18)
// ---------------------------------------------------------------------------

function DuplicateLinks({ apps }) {
  const duplicates = findDuplicateUrls(apps);
  return (
    <section className="admin-section" aria-label="Duplicate links">
      <h3>
        <Link2 size={16} /> Duplicate links
      </h3>
      {duplicates.length ? (
        <>
          <p className="dup-warning">
            <AlertTriangle size={15} /> {duplicates.length} destination
            {duplicates.length === 1 ? "" : "s"} linked by more than one card.
          </p>
          <ul className="admin-list">
            {duplicates.map((group) => (
              <li key={group.url} className="admin-list-item">
                <div>
                  <strong>{group.url}</strong>
                  <p>{group.apps.map((app) => app.name || app.id).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="admin-empty">No duplicate links — every card points somewhere different.</p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Messages & subscribers inbox (#19)
// ---------------------------------------------------------------------------

const MESSAGE_TYPE_LABELS = {
  message: "Message",
  request: "App request",
  subscribe: "Newsletter",
};

function MessagesInbox({ publishToken }) {
  const [inbox, setInbox] = useState({ state: "idle", messages: [], error: "" });
  const [readIds, setReadIds] = useState(() => readReadIds(storage()));
  const [refreshTick, setRefreshTick] = useState(0);

  // "idle" doubles as the loading state: a fetch is in flight whenever a
  // token is present and nothing has loaded yet. (No setState runs
  // synchronously inside this effect.)
  useEffect(() => {
    if (!publishToken) return;
    let cancelled = false;
    fetch("/api/messages", {
      headers: { Authorization: `Bearer ${publishToken}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok) {
          setInbox({ state: "loaded", messages: data.messages || [], error: "" });
        } else if (response.status === 401) {
          setInbox({ state: "needs-token", messages: [], error: data.error || "" });
        } else if (data.code === "messages_not_configured") {
          setInbox({ state: "needs-setup", messages: [], error: data.error || "" });
        } else {
          setInbox({
            state: "error",
            messages: [],
            error: data.error || "Could not load the inbox.",
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInbox({ state: "error", messages: [], error: "Could not reach the inbox." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [publishToken, refreshTick]);

  const refresh = () => {
    setInbox((previous) => ({ ...previous, state: "idle" }));
    setRefreshTick((tick) => tick + 1);
  };

  const toggleRead = (id) => {
    setReadIds((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      writeReadIds(storage(), next);
      return next;
    });
  };

  const unread = inbox.messages.filter((item) => !readIds.includes(item.id)).length;

  return (
    <section className="admin-section" aria-label="Messages inbox">
      <h3>
        <Inbox size={16} /> Messages &amp; subscribers
        {inbox.state === "loaded" && unread > 0 && (
          <span className="status-badge status-badge--soon">{unread} unread</span>
        )}
      </h3>
      <p>
        Contact messages, app requests and newsletter signups, newest first.
        Read/unread is tracked on this device only.
      </p>
      <div className="admin-section-actions">
        <button
          type="button"
          className="button button--quiet"
          onClick={refresh}
          disabled={!publishToken || inbox.state === "idle"}
        >
          <RefreshCw size={15} />
          {inbox.state === "idle" && publishToken ? "Loading…" : "Refresh inbox"}
        </button>
      </div>
      {(!publishToken || inbox.state === "needs-token") && (
        <p className="admin-empty">
          <Mail size={15} />{" "}
          {inbox.state === "needs-token" && inbox.error
            ? inbox.error
            : "Enter your publish token in the Publish section above, then refresh the inbox. The inbox uses the same token as publishing."}
        </p>
      )}
      {inbox.state === "needs-setup" && (
        <p className="admin-empty">
          The inbox needs the Drive setup: set GOOGLE_SERVICE_ACCOUNT_KEY and
          DRIVE_MESSAGES_FILE_ID in Vercel (see DRIVE_STATS_SETUP.md), then
          redeploy. Messages sent after that are stored and appear here.
        </p>
      )}
      {publishToken && inbox.state === "idle" && <p className="admin-empty">Loading the inbox…</p>}
      {inbox.state === "error" && <p className="admin-empty">{inbox.error}</p>}
      {inbox.state === "loaded" &&
        (inbox.messages.length ? (
          <ul className="admin-list">
            {inbox.messages.map((item) => {
              const isRead = readIds.includes(item.id);
              return (
                <li
                  key={item.id}
                  className={`admin-list-item message-item ${isRead ? "" : "is-unread"}`}
                >
                  <div>
                    <strong>{item.name || "(no name)"}</strong>{" "}
                    <span className="type-badge">
                      {MESSAGE_TYPE_LABELS[item.type] || "Message"}
                    </span>
                    <p>{item.message || "(newsletter signup — no message)"}</p>
                    <span className="admin-list-meta">
                      {item.email || "no email"} · {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="button button--quiet"
                      onClick={() => toggleRead(item.id)}
                    >
                      {isRead ? "Mark unread" : "Mark read"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="admin-empty">No messages yet.</p>
        ))}
    </section>
  );
}

export default function AdminTools({
  apps,
  launches,
  likes,
  shared,
  accent,
  onAccentChange,
  publishToken,
}) {
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
      <ThemeEditor accent={accent} onAccentChange={onAccentChange} />
      <Scratchpad />
      <Renewals apps={apps} />
      <DuplicateLinks apps={apps} />
      <MessagesInbox publishToken={publishToken} />
    </div>
  );
}
