/**
 * Domain expiry lookup for the portal's admin domain tracker.
 *
 * Source: RDAP (https://rdap.org), the free public registry lookup —
 * no API key needed. A domain the registry does not know returns
 * found: false instead of an error, so the admin page can show
 * "unknown" instead of failing.
 *
 * GET /api/domains?domain=example.com
 *   -> { domain, expiry, registrar, found: true }
 *   -> { domain, expiry: null, registrar: null, found: false }
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED (that exact bug hit api/contact.js).
 */

import { normalizeDomain } from "../src/lib/adminTools.js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/** Pure helper, exported so tests can feed it a saved RDAP reply. */
export function parseRdap(domain, data) {
  const events = Array.isArray(data?.events) ? data.events : [];
  const expiryEvent = events.find(
    (event) => event?.eventAction === "expiration" && event.eventDate,
  );
  const entities = Array.isArray(data?.entities) ? data.entities : [];
  const registrar = entities.find(
    (entity) =>
      Array.isArray(entity?.roles) && entity.roles.includes("registrar"),
  );
  const vcard = registrar?.vcardArray?.[1] || [];
  const fn = vcard.find((prop) => prop?.[0] === "fn")?.[3] || "";
  return {
    domain,
    expiry: expiryEvent ? expiryEvent.eventDate : null,
    registrar: fn || null,
    found: true,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Use GET for this endpoint." });
  }
  const domain = normalizeDomain(req.query?.domain);
  if (!domain) {
    return json(res, 400, {
      error: "Pass a domain, e.g. ?domain=mytechflowlabs.com",
    });
  }
  try {
    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.status === 404) {
      return json(res, 200, {
        domain,
        expiry: null,
        registrar: null,
        found: false,
      });
    }
    if (!response.ok) {
      throw new Error(`RDAP answered ${response.status}.`);
    }
    return json(res, 200, parseRdap(domain, await response.json()));
  } catch {
    return json(res, 502, {
      error: "Could not look up that domain right now.",
    });
  }
}
