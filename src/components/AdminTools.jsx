/**
 * Batch 4 admin tools — owner-only sections shown under the publish
 * toolbar when Admin mode is on. Each section keeps its own state:
 * theme + notes + renewals live per device in localStorage, duplicate
 * links are computed from the catalog, and the inbox is fetched from
 * /api/messages (Drive-backed, admin token required).
 *
 * Nothing here renders for visitors: the parent only mounts this
 * component when isAdmin is true.
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
  RefreshCw,
  RotateCcw,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
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
  daysUntil,
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
            const days = daysUntil(renewal.date);
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

// ---------------------------------------------------------------------------

export default function AdminTools({ apps, accent, onAccentChange, publishToken }) {
  return (
    <div className="admin-tools">
      <ThemeEditor accent={accent} onAccentChange={onAccentChange} />
      <Scratchpad />
      <Renewals apps={apps} />
      <DuplicateLinks apps={apps} />
      <MessagesInbox publishToken={publishToken} />
    </div>
  );
}
