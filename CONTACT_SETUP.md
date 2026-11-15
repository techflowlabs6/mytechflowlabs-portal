# Contact, app-request and newsletter forms — setup

The portal's forms (Contact, "Request an app", newsletter signup in the
footer) work with **no setup at all**: they try the server first, and if
email sending is not configured they open the visitor's email app with
the message pre-filled instead. Nothing is ever lost silently.

To make them send directly from the site (no email app needed), set
these in **Vercel → your project → Settings → Environment Variables**,
then redeploy:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | A Resend API key (`re_...`) from https://resend.com/api-keys (free tier covers this site's volume) |
| `CONTACT_FROM` | A verified sender, e.g. `MyTechFlow Labs <hello@mytechflowlabs.com>` — the domain must be verified in Resend, or use Resend's onboarding sender while testing |
| `CONTACT_TO` | (optional) Inbox for the messages — defaults to `techflowlabs6@gmail.com` |

## How it works

- `api/contact.js` accepts `{ kind: "message" | "request" | "subscribe", name, email, message }`.
- With the env vars set it sends one email per submission via Resend and
  answers `{ ok: true }`; the form shows "Message sent".
- Without them it answers `501 contact_not_configured` and the site
  falls back to a pre-filled `mailto:` link.
- No message content is stored anywhere — it is emailed and forgotten.

## Test it

1. Set the three variables, redeploy.
2. Submit the Contact form on the live site — you should see "Message
   sent" and the email should arrive at `CONTACT_TO`.
3. Remove `RESEND_API_KEY` and redeploy to check the fallback: the form
   should open your email app with the message filled in.
