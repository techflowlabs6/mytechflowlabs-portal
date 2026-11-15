import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Download,
  Heart,
  History,
  Info,
  Lightbulb,
  Link2,
  LogOut,
  Mail,
  Menu,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Star,
  Sun,
  Trash2,
  Upload,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { INITIAL_APPS, SKILLS } from "./data/portalApps.js";
import {
  ADMIN_KEY,
  APPS_KEY,
  CATEGORIES,
  PUBLISH_TOKEN_KEY,
  SORTS,
  STATUSES,
  STATUS_LABELS,
  appsJsonPayload,
  defaultArtwork,
  filterApps,
  isLexi,
  isNewApp,
  parseAppsJson,
  readAdmin,
  readApps,
  readLaunchCounts,
  readSavedAt,
  recordLaunch,
  safeImageUrl,
  safeWebUrl,
  sortApps,
  writeApps,
  writeSavedAt,
} from "./lib/portalState.js";
import { ADMIN_EMAIL, buildContactMailto, sendContact } from "./lib/contact.js";
import { applyTheme, readTheme, writeTheme } from "./lib/theme.js";
import {
  effectiveCounts,
  fetchSharedStats,
  formatCount,
  readLikedIds,
  recordSharedEvent,
  toggleLikedLocal,
} from "./lib/stats.js";
import {
  categoryLabelLocalized,
  localizeApp,
  readLang,
  statusLabelLocalized,
  t,
  writeLang,
} from "./lib/i18n.js";
import {
  MAX_UPLOAD_BYTES,
  compressImageFile,
  dataUrlBytes,
  validateImageFile,
} from "./lib/imageUpload.js";
import AdminTools from "./components/AdminTools.jsx";
import ProfileView from "./components/ProfileView.jsx";
import "./App.css";

export { INITIAL_APPS } from "./data/portalApps.js";
const CONTACT_MAILTO = buildContactMailto("message");
const SOCIAL_LINKS = [
  { label: "YouTube", url: "https://www.youtube.com/@TechFlowLabs" },
  { label: "Instagram", url: "https://www.instagram.com/techflowlabs6" },
  { label: "X", url: "https://x.com/Techflowlabs6" },
  { label: "Threads", url: "https://www.threads.net/@techflowlabs6" },
];
const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};
const session = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
function LangToggle({ lang, onChange }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language / Langue">
      {["en", "fr"].map((value) => (
        <button
          key={value}
          type="button"
          className={`lang-toggle-button ${lang === value ? "is-active" : ""}`}
          aria-pressed={lang === value}
          onClick={() => onChange(value)}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
    >
      <span className="theme-toggle-icons" aria-hidden="true">
        <Sun size={15} />
        <Moon size={15} />
      </span>
      <span className="theme-toggle-knob" aria-hidden="true">
        {dark ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className="sr-only">
        {dark
          ? "Dark mode is on. Switch to light mode."
          : "Light mode is on. Switch to dark mode."}
      </span>
    </button>
  );
}

function Dialog({ title, onClose, children, className = "" }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector("input, textarea, select")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      queueMicrotask(() => {
        const fallback = [
          ...document.querySelectorAll(".menu-toggle, .brand"),
        ].find((element) => element.getClientRects().length > 0);
        const target =
          previousFocus?.isConnected && previousFocus !== document.body
            ? previousFocus
            : fallback;
        target?.focus({ preventScroll: true });
      });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-header">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function ContactForm({ kind, status, onSubmit, lang }) {
  const isRequest = kind === "request";
  return (
    <form onSubmit={(event) => onSubmit(event, kind)}>
      <p className="dialog-intro">
        {isRequest ? t(lang, "requestIntro") : t(lang, "contactIntro")}
      </p>
      <div className="form-field">
        <label htmlFor="contact-name">{t(lang, "yourName")}</label>
        <input
          id="contact-name"
          name="name"
          maxLength={120}
          autoComplete="name"
          placeholder={t(lang, "yourName")}
        />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">
          Email {kind === "message" ? t(lang, "emailOptional") : ""}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">
          {isRequest ? t(lang, "ideaLabel") : t(lang, "messageLabel")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          maxLength={2000}
          placeholder={
            isRequest ? t(lang, "ideaPlaceholder") : t(lang, "messagePlaceholder")
          }
        />
      </div>
      {status.state !== "idle" && (
        <p className={`form-note form-note--${status.state}`} role="status">
          {status.message}
        </p>
      )}
      <button
        className="button button--primary full-width"
        type="submit"
        disabled={status.state === "sending" || status.state === "sent"}
      >
        <Send size={16} />
        {status.state === "sending"
          ? t(lang, "sending")
          : isRequest
            ? t(lang, "sendIdea")
            : t(lang, "sendMessage")}
      </button>
    </form>
  );
}

function AppArtwork({ app, artwork, onReady }) {
  if (artwork !== null)
    return (
      <svg
        className="card-art"
        viewBox={`${artwork % 3} ${Math.floor(artwork / 3)} 1 1`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <image
          href="/art/apps-atlas.webp"
          x="0"
          y="0"
          width="3"
          height="3"
          onLoad={onReady}
          onError={onReady}
        />
      </svg>
    );
  const imageUrl = safeImageUrl(app.imageUrl);
  return imageUrl ? (
    <img
      className="card-art"
      src={imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={onReady}
      onError={(event) => {
        event.currentTarget.style.opacity = "0";
        onReady();
      }}
    />
  ) : null;
}

function AppCard({
  app,
  index,
  isAdmin,
  copied,
  onEdit,
  onDelete,
  onDetails,
  onLaunch,
  onCopyLink,
  lang,
  launches,
  likes,
  liked,
  onToggleLike,
}) {
  const [artReady, setArtReady] = useState(false);
  const artwork = defaultArtwork(app);
  const light = artwork === 2 || artwork === 8;
  const url = safeWebUrl(app.url);
  const hasArtwork = artwork !== null || Boolean(safeImageUrl(app.imageUrl));
  // Visible text in the visitor's language; ids and URLs stay raw so
  // admin edits never save a translated copy over the original.
  const display = localizeApp(app, lang);
  const stats = [
    launches > 0
      ? t(lang, launches === 1 ? "launchOne" : "launchMany", {
          n: formatCount(launches),
        })
      : "",
    likes > 0
      ? t(lang, likes === 1 ? "likeOne" : "likeMany", {
          n: formatCount(likes),
        })
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article
      className={`app-card ${light ? "app-card--light" : ""} ${isAdmin ? "app-card--admin" : ""} ${artReady || !hasArtwork ? "art-ready" : ""}`}
      style={{ "--card-delay": `${Math.min(index, 8) * 35}ms` }}
    >
      <AppArtwork
        app={app}
        artwork={artwork}
        onReady={() => setArtReady(true)}
      />
      <div className="card-shade" />
      <a
        className="app-link"
        href={url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!url || undefined}
        aria-label={`Launch ${app.name} (opens in a new tab)`}
        tabIndex={url ? 0 : -1}
        onClick={() => onLaunch(app)}
      >
        <div className="card-heading">
          <span className="eyebrow">
            {categoryLabelLocalized(display.category, lang)}
          </span>
          {isNewApp(app) && (
            <span className="new-label">{t(lang, "newBadge")}</span>
          )}
          {app.status && app.status !== "live" && (
            <span className="status-label">
              {statusLabelLocalized(app.status, lang)}
            </span>
          )}
        </div>
        <h3>{display.name}</h3>
        {display.shortNote && <p className="card-note">{display.shortNote}</p>}
        {stats && (
          <p className="card-stats" aria-label={stats}>
            {stats}
          </p>
        )}
        <span className="launch-button">
          {url ? t(lang, "launchApp") : t(lang, "linkUnavailable")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </a>
      <div className="card-tools">
        <button
          className={`card-tool like-button ${liked ? "is-liked" : ""}`}
          onClick={() => onToggleLike(app)}
          aria-pressed={liked}
          aria-label={
            liked
              ? `${t(lang, "liked")}: ${app.name}`
              : `${t(lang, "like")}: ${app.name}`
          }
          title={liked ? t(lang, "liked") : t(lang, "like")}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          className="card-tool"
          onClick={() => onCopyLink(app)}
          aria-label={`Copy link to ${app.name}`}
          title="Copy app link"
        >
          {copied ? <Check size={17} /> : <Link2 size={17} />}
        </button>
        <button
          className="card-tool"
          onClick={() => onDetails(app)}
          aria-label={`About ${app.name}`}
          title="App details"
        >
          <Info size={17} />
        </button>
        {isAdmin && (
          <>
            <button
              className="card-tool"
              onClick={() => onEdit(app)}
              aria-label={`Edit ${app.name}`}
              title="Edit app"
            >
              <Pencil size={16} />
            </button>
            <button
              className="card-tool"
              onClick={() => onDelete(app)}
              aria-label={`Delete ${app.name}`}
              title="Delete app"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function Spotlight({ app, onLaunch, onDetails, lang, launches, likes }) {
  const [artReady, setArtReady] = useState(false);
  const artwork = defaultArtwork(app);
  const url = safeWebUrl(app.url);
  const stats = [
    launches > 0
      ? t(lang, launches === 1 ? "launchOne" : "launchMany", {
          n: formatCount(launches),
        })
      : "",
    likes > 0
      ? t(lang, likes === 1 ? "likeOne" : "likeMany", {
          n: formatCount(likes),
        })
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <section className="spotlight" aria-labelledby="spotlight-title">
      <span className="spotlight-label">
        <Star size={14} aria-hidden="true" />
        {t(lang, "featuredBadge")}
      </span>
      <div className="spotlight-inner">
        <div className={`spotlight-art ${artReady ? "art-ready" : ""}`}>
          <AppArtwork
            app={app}
            artwork={artwork}
            onReady={() => setArtReady(true)}
          />
          <div className="card-shade" />
        </div>
        <div className="spotlight-copy">
          <h2 id="spotlight-title">{app.name}</h2>
          {app.shortNote && <p className="spotlight-note">{app.shortNote}</p>}
          {app.description && (
            <p className="spotlight-desc">{app.description}</p>
          )}
          {stats && <p className="spotlight-stats">{stats}</p>}
          <div className="spotlight-actions">
            {url ? (
              <a
                className="button button--primary"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLaunch(app)}
              >
                {t(lang, "launchApp")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ) : null}
            <button
              className="button button--quiet"
              type="button"
              onClick={() => onDetails(app)}
            >
              {t(lang, "detailsButton")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutView({ apps, lang }) {
  return (
    <div className="page-view">
      <h2>{t(lang, "navAbout")}</h2>
      <p className="page-lead">{t(lang, "aboutLead")}</p>
      <p>{t(lang, "aboutP1")}</p>
      <p>{t(lang, "aboutP2")}</p>
      <p className="page-stats">
        <strong>{apps.length}</strong> {t(lang, "aboutApps")} ·{" "}
        <strong>{CATEGORIES.length - 1}</strong>{" "}
        {t(lang, "aboutCategories")}
      </p>
      <a
        className="button button--primary"
        href="https://www.youtube.com/@TechFlowLabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t(lang, "aboutVisitChannel")}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}

function ChangelogView({ entries, failed, lang }) {
  return (
    <div className="page-view">
      <h2>{t(lang, "changelogTitle")}</h2>
      <p className="page-lead">{t(lang, "changelogNote")}</p>
      {failed ? (
        <p>{t(lang, "changelogEmpty")}</p>
      ) : entries === null ? (
        <p>{t(lang, "loading")}</p>
      ) : entries.length === 0 ? (
        <p>{t(lang, "changelogEmpty")}</p>
      ) : (
        <ol className="changelog-list">
          {entries.map((entry) => (
            <li
              key={`${entry.date}-${entry.title}`}
              className="changelog-entry"
            >
              <time dateTime={entry.date}>
                {new Date(`${entry.date}T00:00:00`).toLocaleDateString(
                  lang === "fr" ? "fr-FR" : "en-CA",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </time>
              <h3>
                {lang === "fr" && entry.titleFr ? entry.titleFr : entry.title}
              </h3>
              <ul>
                {(lang === "fr" && entry.itemsFr?.length
                  ? entry.itemsFr
                  : entry.items
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function VideosRow({ videos, lang }) {
  if (!videos.length) return null;
  return (
    <section className="videos" aria-labelledby="videos-title">
      <h2 id="videos-title">{t(lang, "videosTitle")}</h2>
      <p>{t(lang, "videosNote")}</p>
      <div className="videos-row">
        {videos.map((video) => (
          <a
            key={video.id}
            className="video-card"
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
            <span className="video-title">{video.title}</span>
            {video.publishedAt && (
              <time dateTime={video.publishedAt}>
                {new Date(video.publishedAt).toLocaleDateString(
                  lang === "fr" ? "fr-FR" : "en-CA",
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </time>
            )}
          </a>
        ))}
      </div>
      <a
        className="button button--quiet"
        href="https://www.youtube.com/@TechFlowLabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t(lang, "watchOnYouTube")}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

export default function App() {
  const [apps, setApps] = useState(() => readApps(storage()));
  const [isAdmin, setIsAdmin] = useState(() => readAdmin(storage()));
  const [theme, setTheme] = useState(() =>
    readTheme(
      storage(),
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches,
    ),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [launchCounts, setLaunchCounts] = useState(() =>
    readLaunchCounts(storage()),
  );
  const [lang, setLang] = useState(() =>
    readLang(
      storage(),
      typeof navigator !== "undefined" ? navigator.language : "",
    ),
  );
  const [sharedStats, setSharedStats] = useState({
    shared: false,
    launches: {},
    likes: {},
  });
  const [likedIds, setLikedIds] = useState(() => readLikedIds(storage()));
  const [videos, setVideos] = useState([]);
  const [view, setView] = useState("apps");
  const [changelog, setChangelog] = useState(null);
  const [changelogFailed, setChangelogFailed] = useState(false);
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [contactStatus, setContactStatus] = useState({
    state: "idle",
    message: "",
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState({
    state: "idle",
    message: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
  const [detailArtReady, setDetailArtReady] = useState(false);
  const [formError, setFormError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [reconnected, setReconnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ state: "idle", message: "" });
  const [publishToken, setPublishToken] = useState(
    () => session()?.getItem(PUBLISH_TOKEN_KEY) || "",
  );
  // Card-image form state: "upload" = pick a file from this device,
  // "url" = paste an image link (Unsplash or any host).
  const [imageSource, setImageSource] = useState("upload");
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadDataUrl, setUploadDataUrl] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [urlField, setUrlField] = useState("");
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchRef = useRef(null);
  const firstAppsWrite = useRef(true);
  // Shared totals win when Vercel KV is live; otherwise this device's
  // own counts are shown. See src/lib/stats.js.
  const effective = effectiveCounts(launchCounts, likedIds, sharedStats);
  const effectiveLaunches = effective.launches;
  const effectiveLikes = effective.likes;
  const filtered = sortApps(
    filterApps(apps, search, category),
    sort,
    effectiveLaunches,
  );
  const isFiltered = Boolean(search.trim()) || category !== "All";
  const featuredApp =
    apps.find((app) => app.featured) || apps.find(isLexi) || apps[0] || null;
  const jumpBackIn = [...apps]
    .sort(
      (a, b) => (launchCounts[b.id] || 0) - (launchCounts[a.id] || 0),
    )
    .filter((app) => (launchCounts[app.id] || 0) > 0)
    .slice(0, 4);
  const mostLoved = [...apps]
    .sort(
      (a, b) => (effectiveLikes[b.id] || 0) - (effectiveLikes[a.id] || 0),
    )
    .filter((app) => (effectiveLikes[app.id] || 0) > 0)
    .slice(0, 4);
  // Detail dialog text in the visitor's language (ids/URLs stay raw).
  const detailDisplay = detailApp ? localizeApp(detailApp, lang) : null;

  // Theme: apply to <html> and remember the choice on this device.
  useEffect(() => {
    applyTheme(theme);
    writeTheme(storage(), theme);
  }, [theme]);

  // Language: remember the choice on this device.
  useEffect(() => {
    writeLang(storage(), lang);
  }, [lang]);

  // Shared counts: fetch the KV totals for the current catalog. When the
  // endpoint is not configured (501) or unreachable, sharedStats stays
  // { shared: false } and the device's own counts are shown instead.
  const refreshStats = async () => {
    const stats = await fetchSharedStats(apps.map((app) => app.id));
    setSharedStats(stats);
  };
  useEffect(() => {
    refreshStats();
    // The catalog identity changes when apps are adopted or edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  // Latest videos from the channel, once per visit.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/videos");
        if (!response.ok || cancelled) return;
        const data = await response.json();
        if (!cancelled)
          setVideos(Array.isArray(data.videos) ? data.videos : []);
      } catch {
        /* Videos are a bonus section; the page works without them. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Changelog: loaded only when the page is opened.
  useEffect(() => {
    if (view !== "changelog" || changelog !== null || changelogFailed) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/changelog.json", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("changelog unavailable");
        const data = await response.json();
        if (cancelled) return;
        const entries = Array.isArray(data) ? data : data?.entries;
        setChangelog(Array.isArray(entries) ? entries : []);
      } catch {
        if (!cancelled) setChangelogFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, changelog, changelogFailed]);

  // Permanent catalog: adopt the GitHub-committed public/apps.json when it
  // is newer than this device's copy (or when this device has no copy yet).
  // Local edits that were never published are never silently discarded:
  // adoption only happens for a fresh device, or when the committed
  // catalog is newer than the last local change.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/apps.json", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const { updatedAt, apps: committed } = parseAppsJson(
          await response.text(),
        );
        if (cancelled) return;
        if (updatedAt) setCatalogUpdatedAt(updatedAt);
        const store = storage();
        const hasLocal = store?.getItem(APPS_KEY) !== null;
        const savedAt = readSavedAt(store);
        if (!hasLocal || (savedAt && updatedAt && updatedAt > savedAt)) {
          setApps(committed);
          writeSavedAt(store, updatedAt || new Date().toISOString());
        }
      } catch {
        /* Offline or pre-publish build: the bundled seed catalog stands. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setStorageFailed(!writeApps(storage(), apps));
    // Stamp the local-change time on every change after the first render,
    // so the apps.json check above can tell a newer commit from a stale copy.
    if (firstAppsWrite.current) {
      firstAppsWrite.current = false;
      return;
    }
    writeSavedAt(storage(), new Date().toISOString());
  }, [apps]);
  useEffect(() => {
    try {
      storage()?.setItem(ADMIN_KEY, isAdmin ? "true" : "false");
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
  }, [isAdmin]);
  useEffect(() => {
    let timeout;
    const onOffline = () => {
      setOffline(true);
      setReconnected(false);
      clearTimeout(timeout);
    };
    const onOnline = () => {
      setOffline(false);
      setReconnected(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setReconnected(false), 3500);
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (
        event.type === "pointerdown" &&
        !headerRef.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [menuOpen]);

  // Hash pages: #/about, #/profile and #/changelog open those pages,
  // #/app/<id> opens that app's details, anything else shows the catalog.
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash || "";
      if (hash === "#/about") {
        setView("about");
        setModal(null);
        return;
      }
      if (hash === "#/profile") {
        setView("profile");
        setModal(null);
        return;
      }
      if (hash === "#/changelog") {
        setView("changelog");
        setModal(null);
        return;
      }
      const match = /^#\/app\/(.+)$/.exec(hash);
      if (!match) {
        setView("apps");
        return;
      }
      const found = readApps(storage()).find(
        (item) => item.id === decodeURIComponent(match[1]),
      );
      if (found) {
        setDetailApp(found);
        setModal("details");
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "/" || modal) return;
      const target = event.target;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  const closeModal = () => {
    if (window.location.hash.startsWith("#/")) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    setModal(null);
    setFormError("");
    setLoginError("");
    setContactStatus({ state: "idle", message: "" });
  };
  const goToView = (next) => {
    setMenuOpen(false);
    setModal(null);
    setView(next);
    try {
      window.history.replaceState(
        null,
        "",
        next === "apps"
          ? window.location.pathname + window.location.search
          : `#/${next}`,
      );
    } catch {
      /* Hash pages are a nicety, not a requirement. */
    }
    // The target section only exists after the view renders.
    setTimeout(() => {
      if (next === "apps") {
        document.getElementById("apps")?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);
  };
  const openLogin = () => {
    setMenuOpen(false);
    setLoginError("");
    setModal("login");
  };
  const openContact = (kind) => {
    setMenuOpen(false);
    setContactStatus({ state: "idle", message: "" });
    setModal(kind === "request" ? "request" : "contact");
  };
  const openEditor = (app = null) => {
    setEditingApp(app);
    setFormError("");
    setUploadError("");
    const existingImage = app?.imageUrl || "";
    if (existingImage.startsWith("data:image/")) {
      setImageSource("upload");
      setUploadPreview(existingImage);
      setUploadDataUrl(existingImage);
      setUploadFileName("Current uploaded image");
      setUrlField("");
    } else {
      setImageSource("upload");
      setUploadPreview("");
      setUploadDataUrl("");
      setUploadFileName("");
      setUrlField(existingImage);
    }
    setModal("form");
  };
  const openDetails = (app) => {
    setDetailApp(app);
    setDetailArtReady(false);
    setModal("details");
    try {
      window.history.replaceState(null, "", `#/app/${app.id}`);
    } catch {
      /* Hash deep links are a nicety, not a requirement. */
    }
  };
  const handleLaunch = (app) => {
    setLaunchCounts(recordLaunch(storage(), app.id));
    // Shared count: fire and forget, then refresh the displayed totals.
    recordSharedEvent(app.id, "launch").then(() => refreshStats());
    try {
      window.gtag?.("event", "launch_app", {
        app_id: app.id,
        app_name: app.name,
      });
    } catch {
      /* Analytics is optional. */
    }
  };
  const toggleLike = (app) => {
    const { liked, ids } = toggleLikedLocal(storage(), app.id);
    setLikedIds(ids);
    recordSharedEvent(app.id, liked ? "like" : "unlike").then(() =>
      refreshStats(),
    );
  };
  const copyAppLink = async (app) => {
    const link =
      safeWebUrl(app.url) || `${window.location.origin}/#/app/${app.id}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement("textarea");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiedId(app.id);
    setTimeout(
      () => setCopiedId((current) => (current === app.id ? "" : current)),
      2000,
    );
  };
  const submitContactForm = async (event, kind) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const payload = {
      name: String(fields.get("name") || "").trim(),
      email: String(fields.get("email") || "").trim(),
      message: String(fields.get("message") || "").trim(),
    };
    if (!payload.message) {
      setContactStatus({ state: "error", message: t(lang, "writeMessage") });
      return;
    }
    if (payload.email && !payload.email.includes("@")) {
      setContactStatus({
        state: "error",
        message: t(lang, "invalidEmail"),
      });
      return;
    }
    setContactStatus({ state: "sending", message: t(lang, "sending") });
    try {
      await sendContact(kind, payload);
      setContactStatus({
        state: "sent",
        message:
          kind === "request"
            ? t(lang, "requestSent")
            : t(lang, "contactSent"),
      });
    } catch {
      // Email sending is not set up yet: hand the filled-in message to
      // the visitor's own email app instead of losing it.
      window.location.href = buildContactMailto(kind, payload);
      setContactStatus({
        state: "sent",
        message: t(lang, "mailtoSent"),
      });
    }
  };
  const submitNewsletter = async (event) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email.includes("@")) {
      setNewsletterStatus({
        state: "error",
        message: t(lang, "invalidSubscribeEmail"),
      });
      return;
    }
    setNewsletterStatus({ state: "sending", message: t(lang, "sending") });
    try {
      await sendContact("subscribe", { email });
      setNewsletterStatus({
        state: "sent",
        message: t(lang, "subscribedMsg"),
      });
      setNewsletterEmail("");
    } catch {
      window.location.href = buildContactMailto("subscribe", { email });
      setNewsletterStatus({
        state: "sent",
        message: t(lang, "mailtoSubscribe"),
      });
    }
  };
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
  };
  const handleLogin = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (String(fields.get("email")).trim().toLowerCase() === ADMIN_EMAIL) {
      setIsAdmin(true);
      closeModal();
    } else setLoginError("This email does not have admin access.");
  };
  const handleImageFile = async (file) => {
    const problem = validateImageFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploadError("");
    try {
      const dataUrl = await compressImageFile(file);
      if (dataUrlBytes(dataUrl) > MAX_UPLOAD_BYTES) {
        setUploadError(
          "That image is still over 2 MB after resizing. Pick a smaller one.",
        );
        return;
      }
      setUploadDataUrl(dataUrl);
      setUploadPreview(dataUrl);
      setUploadFileName(file.name);
    } catch {
      setUploadError("Could not read that image. Try a JPG or PNG file.");
    }
  };
  const localSavedNotice = () =>
    setSyncStatus({
      state: "local",
      message:
        "Saved on this device. Publish to GitHub below to make it permanent on every device.",
    });
  const saveApp = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") || "").trim();
    const url = safeWebUrl(String(fields.get("url") || "").trim());
    let imageUrl = "";
    if (imageSource === "upload") {
      imageUrl = uploadDataUrl;
      if (imageUrl && dataUrlBytes(imageUrl) > MAX_UPLOAD_BYTES) {
        setFormError("That uploaded image is over 2 MB. Pick a smaller one.");
        return;
      }
    } else {
      imageUrl = safeImageUrl(String(fields.get("imageUrl") || "").trim());
      const rawImage = String(fields.get("imageUrl") || "").trim();
      if (rawImage && !imageUrl) {
        setFormError(
          "That image address is not valid. Paste a full https image link, an /art/uploads path, or switch to Upload image.",
        );
        return;
      }
    }
    if (!name || !url) {
      setFormError(
        "Enter an app name and a valid http or https address for each URL.",
      );
      return;
    }
    const status = STATUSES.includes(String(fields.get("status")))
      ? String(fields.get("status"))
      : "live";
    const featured = fields.get("featured") === "on";
    const app = {
      ...(editingApp || {}),
      id: editingApp?.id || crypto.randomUUID(),
      name,
      url,
      imageUrl,
      shortNote: String(fields.get("shortNote") || "").trim(),
      description: String(fields.get("description") || "").trim(),
      category: String(fields.get("category")),
      status,
      featured,
      addedAt:
        editingApp?.addedAt || new Date().toISOString().slice(0, 10),
      features: Array.isArray(editingApp?.features)
        ? editingApp.features
        : [],
    };
    setApps((previous) => {
      let next = editingApp
        ? previous.map((item) => (item.id === editingApp.id ? app : item))
        : [app, ...previous];
      // Only one app can hold the spotlight at a time.
      if (app.featured) {
        next = next.map((item) =>
          item.id === app.id ? item : { ...item, featured: false },
        );
      }
      const lexi = next.find(isLexi);
      return lexi ? [lexi, ...next.filter((item) => item !== lexi)] : next;
    });
    localSavedNotice();
    closeModal();
  };
  const deleteApp = (app) => {
    if (window.confirm(`Delete ${app.name} from this dashboard?`)) {
      setApps((previous) => previous.filter((item) => item.id !== app.id));
      localSavedNotice();
    }
  };
  const restore = () => {
    if (
      window.confirm(
        "Restore the 9 default apps? This replaces the app cards saved on this device.",
      )
    ) {
      setApps(INITIAL_APPS.map((app) => ({ ...app })));
      resetFilters();
      localSavedNotice();
    }
  };
  /** Commit the current catalog (+ any uploaded images) to GitHub. */
  const publishCatalog = async () => {
    const token = publishToken.trim();
    if (token) session()?.setItem(PUBLISH_TOKEN_KEY, token);
    setSyncStatus({ state: "publishing", message: "Publishing to GitHub…" });
    const images = apps
      .filter((app) => String(app.imageUrl || "").startsWith("data:image/"))
      .map((app) => ({ dataUrl: app.imageUrl, appId: app.id }));
    try {
      const response = await fetch("/api/publish-apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ apps, images }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          setSyncStatus({
            state: "needs-token",
            message:
              "That publish token was not accepted. Enter the ADMIN_PUBLISH_TOKEN from Vercel and try again.",
          });
        } else if (data.code === "publish_not_configured") {
          setSyncStatus({ state: "local-only", message: data.error });
        } else {
          setSyncStatus({
            state: "error",
            message: data.error || "Publishing failed. Your cards are still saved on this device.",
          });
        }
        return;
      }
      // Committed images live at /art/uploads/… now — point the local
      // cards at those paths instead of the bulky data URLs.
      if (data.imageUrls && Object.keys(data.imageUrls).length) {
        setApps((previous) =>
          previous.map((item) =>
            data.imageUrls[item.id]
              ? { ...item, imageUrl: data.imageUrls[item.id] }
              : item,
          ),
        );
      }
      if (data.updatedAt) writeSavedAt(storage(), data.updatedAt);
      setSyncStatus({
        state: "published",
        message:
          "Published to GitHub. It appears on every device once the Vercel deploy finishes.",
        commitUrl: data.commitUrl || "",
      });
    } catch {
      setSyncStatus({
        state: "error",
        message:
          "Could not reach the publish server. Your cards are still saved on this device — try again when you are back online.",
      });
    }
  };
  const downloadCatalog = () => {
    const blob = new Blob(
      [JSON.stringify(appsJsonPayload(apps), null, 2)],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "apps.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const nav = (
    <>
      <a
        href="#apps"
        className={`nav-link ${view === "apps" ? "nav-link--active" : ""}`}
        aria-current={view === "apps" ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          goToView("apps");
        }}
      >
        {t(lang, "navApps")}
      </a>
      <a
        href="#/about"
        className={`nav-link ${view === "about" ? "nav-link--active" : ""}`}
        aria-current={view === "about" ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          goToView("about");
        }}
      >
        {t(lang, "navAbout")}
      </a>
      <a
        href="#/profile"
        className={`nav-link ${view === "profile" ? "nav-link--active" : ""}`}
        aria-current={view === "profile" ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          goToView("profile");
        }}
      >
        {t(lang, "navProfile")}
      </a>
      <a
        href="#/changelog"
        className={`nav-link ${view === "changelog" ? "nav-link--active" : ""}`}
        aria-current={view === "changelog" ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          goToView("changelog");
        }}
      >
        {t(lang, "navChangelog")}
      </a>
      <button className="nav-link" onClick={() => openContact("message")}>
        {t(lang, "navContact")}
        <Mail size={15} aria-hidden="true" />
      </button>
      {isAdmin ? (
        <button
          className="nav-link"
          onClick={() => {
            setIsAdmin(false);
            setMenuOpen(false);
          }}
        >
          {t(lang, "navLogout")}
          <LogOut size={16} aria-hidden="true" />
        </button>
      ) : (
        <button className="nav-link" onClick={openLogin}>
          {t(lang, "navAdmin")}
        </button>
      )}
    </>
  );

  return (
    <div className="portal">
      <a className="skip-link" href="#apps">
        Skip to apps
      </a>
      <header className="site-header" ref={headerRef}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="MyTechFlow Labs home">
            <span className="brand-mark">
              <Zap size={22} fill="currentColor" strokeWidth={1.5} />
            </span>
            <span>
              MyTechFlow <span className="brand-labs">Labs</span>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav}
          </nav>
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
          />
          <LangToggle lang={lang} onChange={(value) => setLang(value)} />
          <button
            ref={menuButtonRef}
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {nav}
          </nav>
        )}
      </header>
      <main id="top">
        <section className="welcome" aria-labelledby="welcome-title">
          <div className="container welcome-inner">
            <div>
              <h1 id="welcome-title">{t(lang, "heroTitle")}</h1>
              <p>{t(lang, "heroSub")}</p>
            </div>
            <span className="welcome-label">
              <span />
              {t(lang, "heroBuiltBy")}
            </span>
          </div>
        </section>
        <section
          className="container app-section"
          id="apps"
          aria-labelledby={view === "apps" ? "apps-title" : undefined}
        >
          {view === "about" ? (
            <AboutView apps={apps} lang={lang} />
          ) : view === "profile" ? (
            <ProfileView
              apps={apps}
              launches={effectiveLaunches}
              likes={effectiveLikes}
              shared={sharedStats.shared}
              lang={lang}
              socials={SOCIAL_LINKS}
            />
          ) : view === "changelog" ? (
            <ChangelogView
              entries={changelog}
              failed={changelogFailed}
              lang={lang}
            />
          ) : (
            <>
          {(offline || reconnected) && (
            <div
              className={`connection-notice ${offline ? "connection-notice--offline" : ""}`}
              role="status"
            >
              {offline ? <WifiOff size={18} /> : <CheckCircle2 size={18} />}
              <span>
                {offline
                  ? "You’re offline. Check your connection before opening an app."
                  : "You’re back online."}
              </span>
            </div>
          )}
          {storageFailed && (
            <p className="storage-notice" role="status">
              Your browser could not save changes. Keep this tab open to retain
              your current cards.
            </p>
          )}
          <div className="catalogue-toolbar">
            <div className="search-field">
              <Search size={20} aria-hidden="true" />
              <label className="sr-only" htmlFor="app-search">
                {t(lang, "searchLabel")}
              </label>
              <input
                ref={searchRef}
                id="app-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t(lang, "searchPlaceholder")}
                title="Press / to search"
                autoComplete="off"
              />
              <kbd className="search-hint" aria-hidden="true">
                /
              </kbd>
              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>
            <div className="filter-scroller">
              <div
                className="category-filters"
                role="group"
                aria-label="Filter apps by category"
              >
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    className={`filter-button ${category === item ? "is-active" : ""}`}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {categoryLabelLocalized(item, lang)}
                  </button>
                ))}
              </div>
            </div>
            <label className="sort-field">
              <span className="sr-only">Sort apps</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort apps"
              >
                {SORTS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(lang, {
                      featured: "sortFeatured",
                      newest: "sortNewest",
                      az: "sortAz",
                      launched: "sortLaunched",
                    }[item.value])}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="catalogue-heading">
            <h2 id="apps-title" aria-live="polite" aria-atomic="true">
              {filtered.length}{" "}
              {filtered.length === 1
                ? t(lang, "application")
                : t(lang, "applications")}
              {isFiltered && (
                <span className="result-total"> / {apps.length}</span>
              )}
            </h2>
            {isAdmin && <span className="admin-indicator">Admin mode</span>}
          </div>
          {!isFiltered && featuredApp && (
            <Spotlight
              app={localizeApp(featuredApp, lang)}
              onLaunch={handleLaunch}
              onDetails={openDetails}
              lang={lang}
              launches={effectiveLaunches[featuredApp.id] || 0}
              likes={effectiveLikes[featuredApp.id] || 0}
            />
          )}
          {!isFiltered && jumpBackIn.length > 0 && (
            <section
              className="jump-back"
              aria-labelledby="jump-back-title"
            >
              <h2 id="jump-back-title">
                <History size={16} aria-hidden="true" />
                {t(lang, "jumpBackTitle")}
              </h2>
              <p>{t(lang, "jumpBackNote")}</p>
              <div className="jump-back-row">
                {jumpBackIn.map((app) => (
                  <a
                    key={app.id}
                    className="jump-back-chip"
                    href={safeWebUrl(app.url) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLaunch(app)}
                  >
                    {app.name}
                    <span aria-label={`${launchCounts[app.id]} launches`}>
                      ×{launchCounts[app.id]}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}
          {!isFiltered && mostLoved.length > 0 && (
            <section
              className="jump-back most-loved"
              aria-labelledby="most-loved-title"
            >
              <h2 id="most-loved-title">
                <Heart size={16} aria-hidden="true" />
                {t(lang, "mostLovedTitle")}
              </h2>
              <p>{t(lang, "mostLovedNote")}</p>
              <div className="jump-back-row">
                {mostLoved.map((app) => (
                  <a
                    key={app.id}
                    className="jump-back-chip"
                    href={safeWebUrl(app.url) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLaunch(app)}
                  >
                    {app.name}
                    <span
                      aria-label={`${effectiveLikes[app.id]} likes`}
                    >
                      <Heart
                        size={13}
                        aria-hidden="true"
                        fill="currentColor"
                      />
                      {formatCount(effectiveLikes[app.id] || 0)}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}
          {isAdmin && (
            <div className="admin-toolbar">
              <p>Manage the cards saved on this device.</p>
              <div>
                <button
                  className="button button--primary"
                  onClick={() => openEditor()}
                >
                  <Plus size={17} />
                  Add new app
                </button>
                <button className="button button--quiet" onClick={restore}>
                  <RotateCcw size={16} />
                  Restore defaults
                </button>
              </div>
            </div>
          )}
          {isAdmin && (
            <div className="publish-toolbar">
              <div className="publish-info">
                <p>
                  <strong>Make it permanent.</strong> Publish to commit these
                  cards to GitHub — then they show on every device.
                </p>
                <label className="publish-token-field">
                  <span className="sr-only">Publish token</span>
                  <input
                    type="password"
                    value={publishToken}
                    onChange={(event) => setPublishToken(event.target.value)}
                    placeholder="Publish token (from Vercel)"
                    autoComplete="off"
                    aria-label="Publish token from Vercel"
                  />
                </label>
              </div>
              <div className="publish-actions">
                <button
                  className="button button--primary"
                  onClick={publishCatalog}
                  disabled={syncStatus.state === "publishing"}
                >
                  <Upload size={16} />
                  {syncStatus.state === "publishing"
                    ? "Publishing…"
                    : "Publish to GitHub"}
                </button>
                <button
                  className="button button--quiet"
                  onClick={downloadCatalog}
                >
                  <Download size={16} />
                  Download apps.json
                </button>
              </div>
              {syncStatus.state !== "idle" && (
                <p
                  className={`sync-status sync-status--${syncStatus.state}`}
                  role="status"
                >
                  {syncStatus.state === "published" && (
                    <CheckCircle2 size={16} />
                  )}
                  <span>{syncStatus.message}</span>
                  {syncStatus.commitUrl && (
                    <a
                      href={syncStatus.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View commit
                    </a>
                  )}
                </p>
              )}
            </div>
          )}
          {isAdmin && (
            <AdminTools
              apps={apps}
              launches={effectiveLaunches}
              likes={effectiveLikes}
              shared={sharedStats.shared}
            />
          )}
          {filtered.length ? (
            <div
              className={`app-grid ${!isFiltered ? "app-grid--mosaic" : ""}`}
            >
              {filtered.map((app, index) => (
                <AppCard
                  key={`${app.id}-${app.imageUrl}`}
                  app={app}
                  index={index}
                  isAdmin={isAdmin}
                  copied={copiedId === app.id}
                  onEdit={openEditor}
                  onDelete={deleteApp}
                  onDetails={openDetails}
                  onLaunch={handleLaunch}
                  onCopyLink={copyAppLink}
                  lang={lang}
                  launches={effectiveLaunches[app.id] || 0}
                  likes={effectiveLikes[app.id] || 0}
                  liked={likedIds.includes(app.id)}
                  onToggleLike={toggleLike}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={28} />
              </span>
              <h3>{t(lang, "emptyTitle")}</h3>
              <p>
                {search.trim() ? (
                  <>{t(lang, "emptySearch")}</>
                ) : (
                  <>{t(lang, "emptyCategory")}</>
                )}
              </p>
              <button className="button button--primary" onClick={resetFilters}>
                {t(lang, "clearFilters")}
              </button>
              {isAdmin && !apps.length && (
                <button
                  className="button button--quiet"
                  onClick={() => openEditor()}
                >
                  Add your first app
                </button>
              )}
            </div>
          )}
          <div className="request-band">
            <p>
              <strong>{t(lang, "requestTitle")}</strong>{" "}
              {t(lang, "requestText")}
            </p>
            <button
              className="button button--quiet"
              type="button"
              onClick={() => openContact("request")}
            >
              <Lightbulb size={16} />
              {t(lang, "requestButton")}
            </button>
          </div>
          <VideosRow videos={videos} lang={lang} />
          <details className="capabilities" id="capabilities">
            <summary>
              <span>
                <Code2 size={18} />
                {t(lang, "capTitle")}
              </span>
              <ChevronDown size={18} />
            </summary>
            <div className="capabilities-content">
              <p>{t(lang, "capNote")}</p>
              <div className="skills-grid">
                {SKILLS.map((skill) => (
                  <div className="skill-item" key={skill.title}>
                    <h3>{skill.title}</h3>
                    <p>{skill.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>
            </>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">
              <Zap size={22} fill="currentColor" strokeWidth={1.5} />
            </span>
            <div>
              <strong>MyTechFlow Labs</strong>
              <p>{t(lang, "footerTagline")}</p>
            </div>
          </div>
          <nav className="footer-links" aria-label="MyTechFlow Labs elsewhere">
            <a
              href="#/about"
              onClick={(event) => {
                event.preventDefault();
                goToView("about");
              }}
            >
              {t(lang, "navAbout")}
            </a>
            <a
              href="#/profile"
              onClick={(event) => {
                event.preventDefault();
                goToView("profile");
              }}
            >
              {t(lang, "navProfile")}
            </a>
            <a
              href="#/changelog"
              onClick={(event) => {
                event.preventDefault();
                goToView("changelog");
              }}
            >
              {t(lang, "navChangelog")}
            </a>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
            <a href={CONTACT_MAILTO}>Email</a>
          </nav>
          <form className="newsletter" onSubmit={submitNewsletter}>
            <label htmlFor="newsletter-email">
              {t(lang, "newsletterTitle")}
            </label>
            <div className="newsletter-row">
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <button
                className="button button--primary"
                type="submit"
                disabled={newsletterStatus.state === "sending"}
              >
                {t(lang, "subscribe")}
              </button>
            </div>
            {newsletterStatus.state !== "idle" && (
              <p
                className={`form-note form-note--${newsletterStatus.state}`}
                role="status"
              >
                {newsletterStatus.message}
              </p>
            )}
          </form>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} MyTechFlow Labs</span>
            {catalogUpdatedAt && (
              <span>
                {t(lang, "catalogUpdated")}{" "}
                {new Date(catalogUpdatedAt).toLocaleDateString(
                  lang === "fr" ? "fr-FR" : undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </span>
            )}
            <a href="#top" className="back-to-top">
              {t(lang, "backToTop")}
              <ArrowUp size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

      {modal === "login" && (
        <Dialog title="Admin login" onClose={closeModal}>
          <form onSubmit={handleLogin}>
            <p className="dialog-intro">Manage your application collection.</p>
            <div className="form-field">
              <label htmlFor="admin-email">Email address</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder={ADMIN_EMAIL}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </div>
            {loginError && (
              <p className="form-error" role="alert">
                {loginError}
              </p>
            )}
            <button className="button button--primary full-width" type="submit">
              Log in
              <ArrowUpRight size={16} />
            </button>
            <button
              className="button button--quiet full-width quick-login"
              type="button"
              onClick={() => {
                setIsAdmin(true);
                closeModal();
              }}
            >
              <Zap size={16} />
              1-click login
            </button>
          </form>
        </Dialog>
      )}
      {modal === "form" && (
        <Dialog
          title={editingApp ? "Edit application" : "Add application"}
          onClose={closeModal}
          className="dialog--wide"
        >
          <form onSubmit={saveApp} key={editingApp?.id || "new"}>
            <div className="form-field">
              <label htmlFor="form-name">
                App name <span>*</span>
              </label>
              <input
                id="form-name"
                name="name"
                defaultValue={editingApp?.name || ""}
                required
                maxLength={120}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="form-note">Short note</label>
              <input
                id="form-note"
                name="shortNote"
                defaultValue={editingApp?.shortNote || ""}
                maxLength={240}
                placeholder="A short description for the card"
              />
            </div>
            <div className="form-field">
              <label htmlFor="form-url">
                App web address <span>*</span>
              </label>
              <input
                id="form-url"
                name="url"
                type="url"
                defaultValue={editingApp?.url || ""}
                placeholder="https://your-app.com"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="form-category">Category</label>
              <select
                id="form-category"
                name="category"
                defaultValue={editingApp?.category || "Productivity"}
              >
                {CATEGORIES.filter((item) => item !== "All").map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="form-status">Status</label>
              <select
                id="form-status"
                name="status"
                defaultValue={editingApp?.status || "live"}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editingApp?.featured === true}
              />
              Feature this app in the spotlight
            </label>
            <div className="form-field">
              <span className="form-label" id="image-source-label">
                Card image
              </span>
              <div
                className="image-source-switch"
                role="group"
                aria-labelledby="image-source-label"
              >
                <button
                  type="button"
                  className={`image-source-button ${imageSource === "upload" ? "is-active" : ""}`}
                  aria-pressed={imageSource === "upload"}
                  onClick={() => setImageSource("upload")}
                >
                  <Upload size={15} />
                  Upload image
                </button>
                <button
                  type="button"
                  className={`image-source-button ${imageSource === "url" ? "is-active" : ""}`}
                  aria-pressed={imageSource === "url"}
                  onClick={() => setImageSource("url")}
                >
                  Image URL
                </button>
              </div>
              {imageSource === "upload" ? (
                <div className="image-upload">
                  <label className="button button--quiet" htmlFor="form-image-file">
                    <Upload size={16} />
                    Choose an image…
                  </label>
                  <input
                    id="form-image-file"
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                  />
                  <p className="field-hint">
                    JPG, PNG, WebP, GIF or AVIF, up to 8 MB. It is resized to
                    1200px and saved into the repo when you publish — no
                    Unsplash needed.
                  </p>
                  {uploadPreview && (
                    <figure className="image-preview">
                      <img src={uploadPreview} alt="Card image preview" />
                      <figcaption>
                        {uploadFileName}
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => {
                            setUploadPreview("");
                            setUploadDataUrl("");
                            setUploadFileName("");
                          }}
                        >
                          Remove image
                        </button>
                      </figcaption>
                    </figure>
                  )}
                  {uploadError && (
                    <p className="form-error" role="alert">
                      {uploadError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="image-upload">
                  <label className="sr-only" htmlFor="form-image">
                    Image web address
                  </label>
                  <input
                    id="form-image"
                    name="imageUrl"
                    type="url"
                    value={urlField}
                    onChange={(event) => setUrlField(event.target.value)}
                    placeholder="https://images.unsplash.com/photo-…"
                  />
                  <p className="field-hint">
                    Unsplash works — paste any direct image link. Or switch
                    back to Upload image to use your own file.
                  </p>
                  {safeImageUrl(urlField) && (
                    <figure className="image-preview">
                      <img src={safeImageUrl(urlField)} alt="Card image preview" />
                      <figcaption>Preview</figcaption>
                    </figure>
                  )}
                </div>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="form-description">Description</label>
              <textarea
                id="form-description"
                name="description"
                rows={3}
                defaultValue={editingApp?.description || ""}
                maxLength={2000}
              />
            </div>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <div className="form-actions">
              <button
                className="button button--quiet"
                type="button"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button className="button button--primary" type="submit">
                {editingApp ? "Save changes" : "Add app"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {(modal === "contact" || modal === "request") && (
        <Dialog
          title={modal === "request" ? "Request an app" : "Contact"}
          onClose={closeModal}
        >
          <ContactForm
            kind={modal}
            status={contactStatus}
            onSubmit={submitContactForm}
            lang={lang}
          />
        </Dialog>
      )}
      {modal === "details" && detailApp && detailDisplay && (
        <Dialog
          title={detailDisplay.name}
          onClose={closeModal}
          className="dialog--wide"
        >
          <div className={`detail-art ${detailArtReady ? "art-ready" : ""}`}>
            <AppArtwork
              app={detailApp}
              artwork={defaultArtwork(detailApp)}
              onReady={() => setDetailArtReady(true)}
            />
            <div className="card-shade" />
          </div>
          <div className="detail-badges">
            <span className="detail-category">
              {categoryLabelLocalized(detailDisplay.category, lang)}
            </span>
            {isNewApp(detailApp) && (
              <span className="new-label">{t(lang, "newBadge")}</span>
            )}
            {detailApp.status && detailApp.status !== "live" && (
              <span className="status-label">
                {statusLabelLocalized(detailApp.status, lang)}
              </span>
            )}
            {detailApp.featured && (
              <span className="featured-label">
                <Star size={12} aria-hidden="true" />
                {t(lang, "featuredBadge")}
              </span>
            )}
          </div>
          {detailDisplay.shortNote && (
            <p className="detail-note">{detailDisplay.shortNote}</p>
          )}
          <p className="detail-description">
            {detailDisplay.description || t(lang, "detailFallback")}
          </p>
          {(effectiveLaunches[detailApp.id] > 0 ||
            effectiveLikes[detailApp.id] > 0) && (
            <p className="detail-stats">
              {[
                effectiveLaunches[detailApp.id] > 0
                  ? t(
                      lang,
                      effectiveLaunches[detailApp.id] === 1
                        ? "launchOne"
                        : "launchMany",
                      { n: formatCount(effectiveLaunches[detailApp.id]) },
                    )
                  : "",
                effectiveLikes[detailApp.id] > 0
                  ? t(
                      lang,
                      effectiveLikes[detailApp.id] === 1
                        ? "likeOne"
                        : "likeMany",
                      { n: formatCount(effectiveLikes[detailApp.id]) },
                    )
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {Array.isArray(detailDisplay.features) &&
            detailDisplay.features.length > 0 && (
              <>
                <h3 className="detail-subheading">
                  {t(lang, "whatsInside")}
                </h3>
                <ul className="detail-features">
                  {detailDisplay.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          <div className="form-actions">
            {safeWebUrl(detailApp.url) ? (
              <a
                className="button button--primary"
                href={safeWebUrl(detailApp.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLaunch(detailApp)}
              >
                {t(lang, "launchApp")}
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <p className="form-error">
                This app needs a valid web address.
              </p>
            )}
            <button
              className="button button--quiet"
              type="button"
              onClick={() => toggleLike(detailApp)}
              aria-pressed={likedIds.includes(detailApp.id)}
            >
              <Heart
                size={16}
                fill={
                  likedIds.includes(detailApp.id) ? "currentColor" : "none"
                }
              />
              {likedIds.includes(detailApp.id)
                ? t(lang, "liked")
                : t(lang, "like")}
            </button>
            <button
              className="button button--quiet"
              type="button"
              onClick={() => copyAppLink(detailApp)}
            >
              {copiedId === detailApp.id ? (
                <>
                  <Check size={16} />
                  {t(lang, "linkCopied")}
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  {t(lang, "copyLink")}
                </>
              )}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
