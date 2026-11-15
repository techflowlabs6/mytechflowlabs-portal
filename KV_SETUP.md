# Shared visitor counts — Vercel KV setup

The portal's visitor counts (launches per app) and likes are shared totals
when Vercel KV is configured. Until then the site keeps counting on each
visitor's own device (localStorage) and the shared endpoint answers 501 —
nothing breaks, the numbers just stay per-device.

## What it stores

Two counters per app, in Vercel KV (Upstash Redis):

- `portal:launches:<app-id>` — incremented on every Launch click
- `portal:likes:<app-id>` — incremented on Like, decremented on unlike
  (never below zero)

No personal data is stored: no IPs, no emails, no per-visitor records.
A visitor's own like is remembered only in their browser.

## Create the database (about 3 minutes, in the Vercel dashboard)

1. Open the project in Vercel: **mytechflowlabs-portal**.
2. Go to **Storage** → **Create Database** → **KV** (Upstash Redis).
3. Name it anything (e.g. `portal-counts`), pick the nearest region, Create.
4. On the database page, click **Connect** / the project's name and
   confirm it attaches to `mytechflowlabs-portal`. Vercel adds these env
   vars to the project automatically:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - (plus `KV_URL` / `KV_REST_API_READ_ONLY_TOKEN`, which this code
     does not use)
5. **Redeploy** the Production deployment (Deployments → latest → ⋯ →
   Redeploy), or push any commit — env vars only take effect on a new
   deployment.

## Check it works

- Visit `https://mytechflowlabs.com/api/stats?ids=lexi-parcours` — before
  setup it answers 501 `stats_not_configured`; after setup it answers
  200 with `{ "shared": true, "launches": {...}, "likes": {...} }`.
- Launch any app once, reload the page: the card now shows the shared
  launch count.

## Cost

Vercel KV (Upstash) has a free tier that covers this portal's traffic
easily (a few thousand commands a day). If it ever outgrows the free
tier, Vercel shows usage on the database page before charging.

## If KV is ever removed

Delete the two env vars and redeploy: the endpoint goes back to 501
and the site silently falls back to per-device counts. No code change
needed.
