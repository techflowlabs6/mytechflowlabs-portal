/**
 * Contact, app requests and newsletter signups.
 *
 * The forms try POST /api/contact first. That endpoint forwards the
 * message with Resend when RESEND_API_KEY is set in Vercel (see
 * CONTACT_SETUP.md). Until then it answers 501 and the form falls back
 * to opening the visitor's email app with everything pre-filled, so the
 * forms always work — they just need no setup to be usable.
 */

export const ADMIN_EMAIL = "techflowlabs6@gmail.com";

/** Build the mailto fallback for a form submission. */
export function buildContactMailto(kind, fields = {}) {
  const { name = "", email = "", message = "" } = fields;
  const signature = name || email ? `\n\n— ${name}${email ? ` (${email})` : ""}` : "";
  if (kind === "subscribe") {
    return (
      `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Subscribe me to MyTechFlow Labs updates")}` +
      `&body=${encodeURIComponent(`Hi MyTechFlow Labs team,\n\nPlease subscribe ${email || "me"} to your updates.\n\nThanks!`)}`
    );
  }
  if (kind === "request") {
    return (
      `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("App idea for MyTechFlow Labs")}` +
      `&body=${encodeURIComponent(`Hi MyTechFlow Labs team,\n\nApp idea: ${message}${signature}`)}`
    );
  }
  return (
    `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Inquiry via MyTechFlow Labs")}` +
    `&body=${encodeURIComponent(
      message
        ? `Hi MyTechFlow Labs team,\n\n${message}${signature}`
        : "Hi MyTechFlow Labs team,\n\nI am reaching out regarding...",
    )}`
  );
}

/** Send a form to /api/contact. Throws when the server is not set up. */
export async function sendContact(kind, fields) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, ...fields }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Contact server is not set up yet.");
  }
  return data;
}
