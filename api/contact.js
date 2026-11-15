/**
 * POST /api/contact
 *
 * Receives the portal's contact form, app-request form and newsletter
 * signup, and forwards them by email with Resend. Runs server-side; the
 * browser never sees the API key.
 *
 * Vercel env vars (see CONTACT_SETUP.md):
 *   RESEND_API_KEY - Resend API key (re_...)
 *   CONTACT_FROM   - verified sender, e.g. "MyTechFlow Labs <hello@mytechflowlabs.com>"
 *   CONTACT_TO     - inbox for the messages (default techflowlabs6@gmail.com)
 *
 * Until those are set, this answers 501 with setup instructions and the
 * site falls back to opening the visitor's email app pre-filled, so the
 * forms always work.
 *
 * Body: { kind: "message" | "request" | "subscribe", name?, email?, message? }
 */

const CONTACT_TO_DEFAULT = "techflowlabs6@gmail.com";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function clean(value, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Use POST for this endpoint." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const kind = ["message", "request", "subscribe"].includes(body.kind)
    ? body.kind
    : "message";
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 2000);

  if (!message && kind !== "subscribe")
    return json(res, 400, { error: "Write a message first." });
  if (kind === "subscribe" && !isEmail(email))
    return json(res, 400, { error: "Enter a valid email address to subscribe." });
  if (email && !isEmail(email))
    return json(res, 400, { error: "That email address does not look valid." });

  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.CONTACT_FROM || "";
  const to = process.env.CONTACT_TO || CONTACT_TO_DEFAULT;
  if (!apiKey || !from) {
    return json(res, 501, {
      code: "contact_not_configured",
      error:
        "Email sending is not set up yet. Set RESEND_API_KEY and CONTACT_FROM in Vercel (see CONTACT_SETUP.md) — until then the site opens your email app with the message pre-filled instead.",
    });
  }

  const subjects = {
    message: "New message via mytechflowlabs.com",
    request: "New app idea via mytechflowlabs.com",
    subscribe: "New newsletter signup via mytechflowlabs.com",
  };
  const lines = [
    `Kind: ${kind}`,
    name ? `Name: ${name}` : null,
    email ? `Email: ${email}` : null,
    "",
    message || "(no message — newsletter signup)",
  ].filter((line) => line !== null);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email || undefined,
        subject: subjects[kind],
        text: lines.join("\n"),
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return json(res, 502, {
        error: `Email provider refused the message (${response.status}). ${detail.slice(0, 200)}`,
      });
    }
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { error: "Could not reach the email provider. Try again in a moment." });
  }
}
