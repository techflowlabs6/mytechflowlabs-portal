import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  Search,
  X,
  Menu,
  Mail,
  Zap,
  Plus,
  RotateCcw,
  LogOut,
  Info,
  WifiOff,
  ChevronDown,
  Pencil,
  Trash2,
  CheckCircle2,
  Code2,
  Sun,
  Moon,
  Upload,
  Download,
} from "lucide-react";
import { INITIAL_APPS, SKILLS } from "./data/portalApps.js";
import {
  ADMIN_KEY,
  APPS_KEY,
  CATEGORIES,
  PUBLISH_TOKEN_KEY,
  appsJsonPayload,
  defaultArtwork,
  filterApps,
  isLexi,
  parseAppsJson,
  readAdmin,
  readApps,
  readSavedAt,
  safeImageUrl,
  safeWebUrl,
  writeApps,
  writeSavedAt,
} from "./lib/portalState.js";
import { applyTheme, readTheme, writeTheme } from "./lib/theme.js";
import {
  MAX_UPLOAD_BYTES,
  compressImageFile,
  dataUrlBytes,
  validateImageFile,
} from "./lib/imageUpload.js";
import "./App.css";

export { INITIAL_APPS } from "./data/portalApps.js";
const ADMIN_EMAIL = "techflowlabs6@gmail.com";
const CONTACT_MAILTO = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Inquiry via MyTechFlow Labs")}&body=${encodeURIComponent("Hi MyTechFlow Labs team,\n\nI am reaching out regarding...")}`;
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
const categoryLabel = (category) =>
  category === "3D Games & Arcade" ? "Arcade" : category;

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

function AppCard({ app, index, isAdmin, onEdit, onDelete, onDetails }) {
  const [artReady, setArtReady] = useState(false);
  const artwork = defaultArtwork(app);
  const light = artwork === 2 || artwork === 8;
  const url = safeWebUrl(app.url);
  const hasArtwork = artwork !== null || Boolean(safeImageUrl(app.imageUrl));
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
      >
        <div className="card-heading">
          <span className="eyebrow">{categoryLabel(app.category)}</span>
          {isLexi(app) && <span className="new-label">New</span>}
        </div>
        <h3>{app.name}</h3>
        {app.shortNote && <p className="card-note">{app.shortNote}</p>}
        <span className="launch-button">
          {url ? "Launch app" : "Link unavailable"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </a>
      <div className="card-tools">
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
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
  const firstAppsWrite = useRef(true);
  const filtered = filterApps(apps, search, category);
  const isFiltered = Boolean(search.trim()) || category !== "All";

  // Theme: apply to <html> and remember the choice on this device.
  useEffect(() => {
    applyTheme(theme);
    writeTheme(storage(), theme);
  }, [theme]);

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

  const closeModal = () => {
    setModal(null);
    setFormError("");
    setLoginError("");
  };
  const openLogin = () => {
    setMenuOpen(false);
    setLoginError("");
    setModal("login");
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
    setModal("details");
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
    const app = {
      ...(editingApp || {}),
      id: editingApp?.id || crypto.randomUUID(),
      name,
      url,
      imageUrl,
      shortNote: String(fields.get("shortNote") || "").trim(),
      description: String(fields.get("description") || "").trim(),
      category: String(fields.get("category")),
    };
    setApps((previous) => {
      const next = editingApp
        ? previous.map((item) => (item.id === editingApp.id ? app : item))
        : [app, ...previous];
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
        className="nav-link nav-link--active"
        aria-current="page"
        onClick={() => setMenuOpen(false)}
      >
        Apps
      </a>
      <a
        href={CONTACT_MAILTO}
        className="nav-link"
        onClick={() => setMenuOpen(false)}
      >
        Contact
        <Mail size={15} aria-hidden="true" />
      </a>
      {isAdmin ? (
        <button
          className="nav-link"
          onClick={() => {
            setIsAdmin(false);
            setMenuOpen(false);
          }}
        >
          Log out
          <LogOut size={16} aria-hidden="true" />
        </button>
      ) : (
        <button className="nav-link" onClick={openLogin}>
          Admin
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
              <h1 id="welcome-title">Your apps. One place.</h1>
              <p>Learn, focus, track and play.</p>
            </div>
            <span className="welcome-label">
              <span />
              Built by MyTechFlow Labs
            </span>
          </div>
        </section>
        <section
          className="container app-section"
          id="apps"
          aria-labelledby="apps-title"
        >
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
                Search apps
              </label>
              <input
                id="app-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search apps"
                autoComplete="off"
              />
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
                    {categoryLabel(item)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="catalogue-heading">
            <h2 id="apps-title" aria-live="polite" aria-atomic="true">
              {filtered.length}{" "}
              {filtered.length === 1 ? "application" : "applications"}
              {isFiltered && (
                <span className="result-total"> / {apps.length}</span>
              )}
            </h2>
            {isAdmin && <span className="admin-indicator">Admin mode</span>}
          </div>
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
                  onEdit={openEditor}
                  onDelete={deleteApp}
                  onDetails={openDetails}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={28} />
              </span>
              <h3>No apps found</h3>
              <p>
                {search.trim() ? (
                  <>Try another search or category to find your app.</>
                ) : (
                  <>There are no apps in this category yet.</>
                )}
              </p>
              <button className="button button--primary" onClick={resetFilters}>
                Clear filters
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
          <details className="capabilities" id="capabilities">
            <summary>
              <span>
                <Code2 size={18} />
                Engineering capabilities
              </span>
              <ChevronDown size={18} />
            </summary>
            <div className="capabilities-content">
              <p>The craft behind our apps.</p>
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
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <a href={CONTACT_MAILTO}>
            Let’s talk
            <ArrowUpRight size={15} />
          </a>
          <span>© {new Date().getFullYear()} MyTechFlow Labs</span>
          <a href={CONTACT_MAILTO} className="footer-email">
            {ADMIN_EMAIL}
          </a>
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
      {modal === "details" && detailApp && (
        <Dialog title={detailApp.name} onClose={closeModal}>
          <span className="detail-category">
            {categoryLabel(detailApp.category)}
          </span>
          {detailApp.shortNote && (
            <p className="detail-note">{detailApp.shortNote}</p>
          )}
          <p className="detail-description">
            {detailApp.description || "Open the app to explore more."}
          </p>
          {safeWebUrl(detailApp.url) ? (
            <a
              className="button button--primary full-width"
              href={safeWebUrl(detailApp.url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch app
              <ArrowUpRight size={18} />
            </a>
          ) : (
            <p className="form-error">This app needs a valid web address.</p>
          )}
        </Dialog>
      )}
    </div>
  );
}
