/**
 * French / English for the portal's visitor-facing chrome.
 *
 * The public face of the site (nav, hero, filters, cards, detail dialog,
 * contact/request forms, About, What's new, Latest videos, footer) is
 * fully translated. The admin back office (editor, publish toolbar) stays
 * in English — only Naveen sees it.
 *
 * App content is translated per app in src/data/portalApps.js
 * (descriptionFr / shortNoteFr / featuresFr); localizeApp() falls back
 * to English wherever a French field is missing.
 */

export const LANG_KEY = "mytechflow_lang";
export const LANGS = ["en", "fr"];

/** Pure helper so tests can check the choice without a DOM. */
export function resolveLang(stored, navigatorLang = "") {
  if (stored === "en" || stored === "fr") return stored;
  return String(navigatorLang || "")
    .toLowerCase()
    .startsWith("fr")
    ? "fr"
    : "en";
}

export function readLang(storage, navigatorLang = "") {
  try {
    return resolveLang(storage?.getItem(LANG_KEY), navigatorLang);
  } catch {
    return resolveLang(null, navigatorLang);
  }
}

export function writeLang(storage, lang) {
  const value = lang === "fr" ? "fr" : "en";
  try {
    storage?.setItem(LANG_KEY, value);
  } catch {
    /* Private browsing may block storage; the language still applies. */
  }
  return value;
}

export const CATEGORY_FR = {
  All: "Toutes",
  Education: "Éducation",
  Productivity: "Productivité",
  Finance: "Finance",
  "3D Games & Arcade": "Jeux 3D et arcade",
};

export const STATUS_FR = {
  live: "En ligne",
  beta: "Bêta",
  soon: "Bientôt",
};

export const STRINGS = {
  en: {
    navApps: "Apps",
    navAbout: "About",
    navChangelog: "What's new",
    navContact: "Contact",
    navAdmin: "Admin",
    navLogout: "Log out",
    heroTitle: "Your apps. One place.",
    heroSub: "Learn, focus, track and play.",
    heroBuiltBy: "Built by MyTechFlow Labs",
    searchPlaceholder: "Search apps",
    searchLabel: "Search apps",
    sortFeatured: "Featured first",
    sortNewest: "Newest",
    sortAz: "A–Z",
    sortLaunched: "Most launched",
    applications: "applications",
    application: "application",
    launchApp: "Launch app",
    linkUnavailable: "Link unavailable",
    launchOne: "1 launch",
    launchMany: "{n} launches",
    likeOne: "1 like",
    likeMany: "{n} likes",
    like: "Like",
    liked: "Liked",
    newBadge: "New",
    featuredBadge: "Featured",
    jumpBackTitle: "Jump back in",
    jumpBackNote: "Your most-launched apps on this device.",
    mostLovedTitle: "Most loved",
    mostLovedNote: "The apps visitors love most.",
    videosTitle: "Latest from TechFlow Labs",
    videosNote: "Fresh from the YouTube channel.",
    watchOnYouTube: "Watch on YouTube",
    aboutLead:
      "One home for everything TechFlow Labs builds — French learning, focus tools, money trackers and arcade games.",
    aboutP1:
      "MyTechFlow Labs is Naveen's workshop: every app here started as something he wanted for himself — a better way to learn French, track a shift's earnings, or just play a quick game. When an app is ready, it lands here first.",
    aboutP2:
      "New apps appear at the top of the catalog, and every change to this site is listed on the What's new page. If something is missing, ask for it — every request gets read.",
    aboutApps: "apps",
    aboutCategories: "categories",
    aboutVisitChannel: "Visit the YouTube channel",
    changelogTitle: "What's new",
    changelogNote: "Every change to this portal, newest first.",
    changelogEmpty: "Nothing here yet — check back after the next update.",
    requestTitle: "Missing an app?",
    requestText: "Tell me what to build next.",
    requestButton: "Request an app",
    capTitle: "Engineering capabilities",
    capNote: "The craft behind our apps.",
    footerTagline: "Your apps. One place.",
    newsletterTitle: "Get TechFlow Labs updates",
    subscribe: "Subscribe",
    catalogUpdated: "Catalog updated",
    backToTop: "Back to top",
    emptyTitle: "No apps found",
    emptySearch: "Try another search or category to find your app.",
    emptyCategory: "There are no apps in this category yet.",
    clearFilters: "Clear filters",
    whatsInside: "What's inside",
    detailFallback: "Open the app to explore more.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    detailsButton: "App details",
    loading: "Loading…",
    messagePlaceholder: "Hi…",
    ideaPlaceholder: "e.g. A Pomodoro timer that syncs with TimeLog…",
    contactIntro:
      "Questions, feedback or business — every message gets read.",
    requestIntro: "Tell me what to build next — one line is enough.",
    yourName: "Your name",
    emailOptional: "(optional — so I can reply)",
    messageLabel: "Message *",
    ideaLabel: "Your app idea *",
    sendMessage: "Send message",
    sendIdea: "Send app idea",
    sending: "Sending…",
    writeMessage: "Write a message first.",
    invalidEmail: "That email address does not look valid.",
    invalidSubscribeEmail: "Enter a valid email address.",
    contactSent: "Message sent. I'll get back to you soon.",
    requestSent: "Thanks — your app idea is in. Every one gets read.",
    subscribedMsg: "You're subscribed. Welcome to TechFlow Labs updates.",
    mailtoSent:
      "Email sending isn't set up yet, so I opened your email app with the message pre-filled — just press send.",
    mailtoSubscribe: "Opening your email app to finish subscribing…",
  },
  fr: {
    navApps: "Applis",
    navAbout: "À propos",
    navChangelog: "Quoi de neuf",
    navContact: "Contact",
    navAdmin: "Admin",
    navLogout: "Se déconnecter",
    heroTitle: "Tes applis. Un seul endroit.",
    heroSub: "Apprendre, se concentrer, suivre et jouer.",
    heroBuiltBy: "Créé par MyTechFlow Labs",
    searchPlaceholder: "Rechercher une appli",
    searchLabel: "Rechercher une appli",
    sortFeatured: "À la une d'abord",
    sortNewest: "Plus récentes",
    sortAz: "A–Z",
    sortLaunched: "Plus lancées",
    applications: "applications",
    application: "application",
    launchApp: "Ouvrir l'appli",
    linkUnavailable: "Lien indisponible",
    launchOne: "1 lancement",
    launchMany: "{n} lancements",
    likeOne: "1 j'aime",
    likeMany: "{n} j'aime",
    like: "J'aime",
    liked: "Aimée",
    newBadge: "Nouveau",
    featuredBadge: "À la une",
    jumpBackTitle: "Reprendre",
    jumpBackNote: "Tes applis les plus lancées sur cet appareil.",
    mostLovedTitle: "Les plus aimées",
    mostLovedNote: "Les applis préférées des visiteurs.",
    videosTitle: "Les dernières vidéos de TechFlow Labs",
    videosNote: "Tout droit de la chaîne YouTube.",
    watchOnYouTube: "Regarder sur YouTube",
    aboutLead:
      "Un seul endroit pour tout ce que TechFlow Labs crée — apprentissage du français, outils de concentration, suivi d'argent et jeux d'arcade.",
    aboutP1:
      "MyTechFlow Labs, c'est l'atelier de Naveen : chaque appli est née d'un besoin personnel — mieux apprendre le français, suivre les gains d'un quart de travail, ou simplement jouer. Quand une appli est prête, elle arrive ici en premier.",
    aboutP2:
      "Les nouvelles applis apparaissent en haut du catalogue, et chaque changement du site est listé sur la page Quoi de neuf. S'il manque quelque chose, demande-le — chaque demande est lue.",
    aboutApps: "applis",
    aboutCategories: "catégories",
    aboutVisitChannel: "Visiter la chaîne YouTube",
    changelogTitle: "Quoi de neuf",
    changelogNote: "Tous les changements du portail, du plus récent au plus ancien.",
    changelogEmpty: "Rien pour l'instant — reviens après la prochaine mise à jour.",
    requestTitle: "Il manque une appli ?",
    requestText: "Dis-moi quoi créer ensuite.",
    requestButton: "Proposer une appli",
    capTitle: "Savoir-faire technique",
    capNote: "Le savoir-faire derrière nos applis.",
    footerTagline: "Tes applis. Un seul endroit.",
    newsletterTitle: "Recevoir les nouveautés TechFlow Labs",
    subscribe: "S'abonner",
    catalogUpdated: "Catalogue mis à jour",
    backToTop: "Retour en haut",
    emptyTitle: "Aucune appli trouvée",
    emptySearch: "Essaie une autre recherche ou catégorie.",
    emptyCategory: "Il n'y a pas encore d'appli dans cette catégorie.",
    clearFilters: "Effacer les filtres",
    whatsInside: "Ce qu'il y a dedans",
    detailFallback: "Ouvre l'appli pour en découvrir plus.",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    detailsButton: "Détails de l'appli",
    loading: "Chargement…",
    messagePlaceholder: "Bonjour…",
    ideaPlaceholder: "p. ex. Un minuteur Pomodoro qui se synchronise avec TimeLog…",
    contactIntro:
      "Questions, commentaires ou affaires — chaque message est lu.",
    requestIntro: "Dis-moi quoi créer ensuite — une ligne suffit.",
    yourName: "Ton nom",
    emailOptional: "(facultatif — pour que je puisse répondre)",
    messageLabel: "Message *",
    ideaLabel: "Ton idée d'appli *",
    sendMessage: "Envoyer le message",
    sendIdea: "Envoyer l'idée",
    sending: "Envoi…",
    writeMessage: "Écris d'abord un message.",
    invalidEmail: "Cette adresse e-mail ne semble pas valide.",
    invalidSubscribeEmail: "Entre une adresse e-mail valide.",
    contactSent: "Message envoyé. Je te répondrai bientôt.",
    requestSent: "Merci — ton idée est bien reçue. Chacune est lue.",
    subscribedMsg:
      "C'est fait, tu es abonné(e). Bienvenue dans les nouveautés TechFlow Labs.",
    mailtoSent:
      "L'envoi par e-mail n'est pas encore configuré : ton application de messagerie s'est ouverte avec le message pré-rempli — il ne reste qu'à envoyer.",
    mailtoSubscribe:
      "Ouverture de ton application de messagerie pour terminer l'inscription…",
  },
};

export function t(lang, key, vars = {}) {
  const table = STRINGS[lang] || STRINGS.en;
  let value = table[key] ?? STRINGS.en[key] ?? key;
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

export function categoryLabelLocalized(category, lang) {
  if (lang === "fr") return CATEGORY_FR[category] || category;
  return category === "3D Games & Arcade" ? "Arcade" : category;
}

export function statusLabelLocalized(status, lang) {
  if (lang === "fr") return STATUS_FR[status] || status;
  return status;
}

/** The app's visible text in the current language (English fallback). */
export function localizeApp(app, lang) {
  if (lang !== "fr") return app;
  return {
    ...app,
    shortNote: app.shortNoteFr || app.shortNote,
    description: app.descriptionFr || app.description,
    features:
      Array.isArray(app.featuresFr) && app.featuresFr.length
        ? app.featuresFr
        : app.features,
  };
}
