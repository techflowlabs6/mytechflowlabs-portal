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

  // --- Drive inbox (messages.json) -------------------------------------
  // Same service-account pattern as api/stats.js, kept inline here with
  // no imports: this file is still CommonJS (PR #5 converts it to ESM),
  // so it cannot import the shared helpers. Signing uses the WebCrypto
  // global, which works in both module styles. Fail-soft on purpose —
  // the inbox is a bonus, and a Drive outage must never break the form.
  const driveBase64url = (input) =>
    Buffer.from(input)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const driveMessagesConfig = () => {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "");
      const fileId = process.env.DRIVE_MESSAGES_FILE_ID || "";
      const clientEmail = parsed.client_email || "";
      const privateKey = parsed.private_key || "";
      if (!clientEmail || !privateKey || !fileId) return null;
      return { clientEmail, privateKey, fileId };
    } catch {
      return null;
    }
  };
  const driveJwt = async (config) => {
    const now = Math.floor(Date.now() / 1000);
    const signingInput = [
      driveBase64url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
      driveBase64url(
        JSON.stringify({
          iss: config.clientEmail,
          scope: "https://www.googleapis.com/auth/drive",
          aud: "https://oauth2.googleapis.com/token",
          exp: now + 3600,
          iat: now,
        }),
      ),
    ].join(".");
    const der = Buffer.from(
      config.privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, ""),
      "base64",
    );
    const key = await crypto.subtle.importKey(
      "pkcs8",
      der,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(signingInput),
    );
    return `${signingInput}.${driveBase64url(new Uint8Array(signature))}`;
  };
  const appendDriveMessage = async (config, record) => {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: await driveJwt(config),
      }).toString(),
    });
    if (!tokenResponse.ok) throw new Error("Drive token exchange failed.");
    const { access_token: token } = await tokenResponse.json();
    if (!token) throw new Error("Drive token exchange returned no access token.");
    const fileUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(config.fileId)}?alt=media`;
    const uploadUrl = `https://upload.googleapis.com/upload/drive/v3/files/${encodeURIComponent(config.fileId)}?uploadType=media`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const read = await fetch(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let messages = [];
      let etag = null;
      if (read.status !== 404) {
        if (!read.ok) throw new Error("Drive read failed.");
        etag = read.headers?.get?.("etag") || null;
        try {
          const parsed = JSON.parse(await read.text());
          if (parsed && Array.isArray(parsed.messages)) messages = parsed.messages;
        } catch {
          messages = [];
        }
      }
      const next = {
        version: 1,
        updatedAt: new Date().toISOString(),
        messages: [record, ...messages].slice(0, 500),
      };
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      if (etag) headers["If-Match"] = etag;
      const write = await fetch(uploadUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify(next),
      });
      if (write.status === 412 && attempt === 0) continue;
      if (!write.ok) throw new Error("Drive write failed.");
      return;
    }
    throw new Error("Drive write failed after retry.");
  };

  // Record the submission in the Drive inbox. Fail-soft: if Drive is not
  // configured or the write fails, the email flow below still runs.
  try {
    const drive = driveMessagesConfig();
    if (drive) {
      await appendDriveMessage(drive, {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        type: kind,
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      });
    }
  } catch {
    /* Inbox append failed; the form still works. */
  }

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
