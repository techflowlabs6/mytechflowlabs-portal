/**
 * GET /api/messages
 *
 * The admin inbox: contact-form messages, app requests and newsletter
 * signups, stored in a Google Drive JSON file (messages.json in the
 * mytechflowlabs-portal folder). The file is appended to by api/contact.js
 * on every form submission.
 *
 * Admin-only: the caller must send the same ADMIN_PUBLISH_TOKEN as for
 * /api/publish-apps, as `Authorization: Bearer <token>` (the token the
 * admin already enters once per browser session when publishing).
 *
 * Vercel env vars (see DRIVE_STATS_SETUP.md):
 *   GOOGLE_SERVICE_ACCOUNT_KEY - service-account JSON (same key as stats)
 *   DRIVE_MESSAGES_FILE_ID     - the messages.json file id in Drive
 *   ADMIN_PUBLISH_TOKEN         - the admin token (see PERSISTENCE_SETUP.md)
 *
 * Until the Drive vars are set this answers 501 with
 * `messages_not_configured` and the Admin inbox says so instead of
 * erroring. The client keeps read/unread state per device in
 * localStorage — the server never stores it.
 *
 * Response: { messages: [{ id, type, name, email, message, createdAt }] }
 * newest first.
 */

import {
  DrivePreconditionError,
  driveAccessToken,
  driveConfigFor,
  readDriveFile,
} from "./stats.js";

const MAX_MESSAGES = 200;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function cleanMessage(item) {
  if (!item || typeof item !== "object") return null;
  const id = typeof item.id === "string" ? item.id : "";
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";
  if (!id || !createdAt) return null;
  return {
    id,
    type: ["message", "request", "subscribe"].includes(item.type)
      ? item.type
      : "message",
    name: typeof item.name === "string" ? item.name : "",
    email: typeof item.email === "string" ? item.email : "",
    message: typeof item.message === "string" ? item.message : "",
    createdAt,
  };
}

function parseMessages(text) {
  if (text === null) return [];
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (!parsed || !Array.isArray(parsed.messages)) return [];
  return parsed.messages.map(cleanMessage).filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Use GET for this endpoint." });
  }

  // Admin-only, same token check as /api/publish-apps.
  const publishToken = process.env.ADMIN_PUBLISH_TOKEN;
  if (!publishToken) {
    return json(res, 501, {
      ok: false,
      code: "publish_not_configured",
      error:
        "The inbox is not set up yet. In Vercel, set ADMIN_PUBLISH_TOKEN (see PERSISTENCE_SETUP.md), redeploy, then open the inbox again.",
    });
  }
  const supplied =
    String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
    String(req.headers["x-publish-token"] || "");
  if (!supplied || supplied !== publishToken) {
    return json(res, 401, {
      ok: false,
      error: "That publish token is not correct. Enter the ADMIN_PUBLISH_TOKEN from Vercel.",
    });
  }

  const config = driveConfigFor(process.env.DRIVE_MESSAGES_FILE_ID || "");
  if (!config) {
    return json(res, 501, {
      code: "messages_not_configured",
      error:
        "The inbox needs the Drive setup: set GOOGLE_SERVICE_ACCOUNT_KEY and DRIVE_MESSAGES_FILE_ID in Vercel (see DRIVE_STATS_SETUP.md) — until then messages are not stored.",
    });
  }

  try {
    const token = await driveAccessToken(config);
    const { text } = await readDriveFile(config, token);
    const messages = parseMessages(text)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, MAX_MESSAGES);
    return json(res, 200, { messages });
  } catch (error) {
    if (error instanceof DrivePreconditionError) {
      return json(res, 502, { error: "The inbox file changed mid-read. Try again." });
    }
    return json(res, 502, {
      error: "Could not reach the inbox store. Try again in a moment.",
    });
  }
}
