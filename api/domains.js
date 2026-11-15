/**
 * Domain expiry lookup for the portal's admin domain tracker.
 *
 * Source: RDAP, the free public registry lookup — no API key needed.
 * The lookup goes straight to the authoritative registry for the
 * domain's TLD (.com/.net Verisign, .org PIR, .ca CIRA); any other
 * TLD falls back to https://rdap.org, which redirects to the right
 * registry. Going direct matters: rdap.org's redirect chain fails
 * from Vercel (every TLD answered 502 live), while the authoritative
 * servers answer fine. A domain the registry does not know returns
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

/** Authoritative RDAP servers, verified live (com/org/ca return 200). */
const RDAP_BASES = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
  org: "https://rdap.publicinterestregistry.org/rdap/domain/",
  ca: "https://rdap.ca.fury.ca/rdap/domain/",
};

/** Pure helper, exported so tests can check the per-TLD routing. */
export function rdapUrlFor(domain) {
  const tld = domain.split(".").pop();
  const base = RDAP_BASES[tld];
  return base
    ? `${base}${encodeURIComponent(domain)}`
    : `https://rdap.org/domain/${encodeURIComponent(domain)}`;
}

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
    const response = await fetch(rdapUrlFor(domain), {
      headers: { Accept: "application/json" },
    });
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
