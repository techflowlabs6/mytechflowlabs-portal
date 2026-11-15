# Shared counts on Google Drive (JSON file)

The portal's visitor counts (launches + likes per app, shown on the cards
and in "Jump back in" / "Most loved") are shared through one JSON file in
Google Drive instead of a database. The file is the single source of truth;
the site reads it and rewrites it on every launch/like click.

**The file (already created):**

- File: `portal-stats.json` — id `1HnJd_0yJu5P917CJl3rxqLmFAjiZMUh8`
- Folder: `mytechflowlabs-portal` — id `1gY4lvD6LTmZnDWG3vCByprym8lwv4YnS`
- Inside: `Website Databases` → `TechFlow Labs` (TechFlow account,
  techflowlabs6@gmail.com)
- Shape: `{"version":1,"updatedAt":"...","launches":{"<app-id>":n},"likes":{"<app-id>":n}}`

The live site cannot use Brio's Drive connection — it needs its own login
to Drive. That login is a Google **service account**: a robot account that
only ever touches this one folder.

## Setup (one time, about 10 minutes)

### 1. Create the service account

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and
   sign in with techflowlabs6@gmail.com.
2. Top-left project picker → **New Project** (any name, e.g.
   `mytechflow-portal`) → Create. Wait for it to finish, then make sure
   it is the selected project.
3. Left menu → **IAM & Admin → Service Accounts** → **Create service
   account**.
4. Name it e.g. `mytechflow-portal-stats` → Create and continue.
5. **Grant access**: no role is needed — access comes from the Drive
   folder share in step 3, not from a cloud role. Click Continue, then
   Done.

### 2. Create and download its JSON key

1. On the Service Accounts list, click the new account's email
   (`...@<project>.iam.gserviceaccount.com`).
2. **Keys** tab → **Add key → Create new key → JSON** → Create.
3. A `.json` file downloads. **Keep it private — it is a password.**
   Never commit it to GitHub, never paste it into a chat, never upload
   it to Drive. It lives in exactly one place: the Vercel env var in
   step 4.

### 3. Share the Drive folder with the service account

1. In Google Drive (TechFlow account), open the `mytechflowlabs-portal`
   folder inside `Website Databases` inside `TechFlow Labs`.
2. **Share** → paste the service-account email from step 2
   (`...@<project>.iam.gserviceaccount.com`) → role **Editor** →
   **Share**. (Editor is needed because the site rewrites the file.
   The account can only see this one folder — nothing else in Drive.)
3. Do **not** move, rename or delete `portal-stats.json`. If it is ever
   deleted, the endpoint answers 502 until a new file with that name is
   created in the folder.

### 4. Add the two env vars in Vercel and redeploy

1. Vercel dashboard → **mytechflowlabs-portal** → **Settings →
   Environment Variables**.
2. Add:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` — the **entire contents** of the
     downloaded `.json` file, pasted as one value (including the
     `{"type":"service_account",...}` wrapper).
   - `DRIVE_STATS_FILE_ID` — `1HnJd_0yJu5P917CJl3rxqLmFAjiZMUh8`
3. **Deployments** → latest deployment → **⋯ → Redeploy** (env vars only
   take effect on a new deployment).

## How to verify it works

1. Open `https://mytechflowlabs.com/api/stats?ids=lexi-parcours` — it
   should return `200` with `{"shared":true,"launches":{...},"likes":{...}}`
   instead of the old `501 stats_not_configured`.
2. On the site, launch any app (click its card), then reload the page —
   its launch count should have gone up by 1.
3. Open `portal-stats.json` in Drive — the numbers in the file should
   match what the site shows.

## Known limits (honest)

- **Two visitors clicking at the exact same moment can lose a count.**
  The endpoint reads the file, adds 1, and writes it back; if two
  clicks overlap, the second write can overwrite the first. At this
  site's traffic that is rare, and the endpoint retries once when Drive
  reports the file changed under it — but it is not atomic the way a
  database is.
- **Each event is a Drive call (~1 second).** Launching an app waits for
  the Drive write before the site moves on; a slow Drive day means a
  slow click.
- **Malformed file contents are treated as empty counts**, never as a
  crash — but do not hand-edit the JSON in Drive unless you are sure of
  the shape above; a bad edit resets the numbers to zero on the next
  write.
- **If the service account loses access** (folder unshared, key deleted
  in Cloud Console), the endpoint answers `502` and the site falls back
  to per-device counts until access is restored.

## If you ever want the database version instead

`KV_SETUP.md` still applies: create a Vercel KV database and set
`KV_REST_API_URL` + `KV_REST_API_TOKEN`. Note the precedence: when both
backends are configured, **Drive wins** — to switch to KV, remove the
`GOOGLE_SERVICE_ACCOUNT_KEY` / `DRIVE_STATS_FILE_ID` env vars (or the KV
vars stay ignored) and redeploy.

## Messages inbox (same service account, second file)

The Admin "Messages & subscribers" inbox stores every contact-form
message, app request and newsletter signup in a second JSON file in the
same folder, using the same service account — no second key is needed.

**The file (already created):**

- File: `messages.json` — id `1oOQP36nZ2WIHIdQOCWsqpZTexywgHZuk`
- Folder: `mytechflowlabs-portal` — id `1gY4lvD6LTmZnDWG3vCByprym8lwv4YnS`
- Shape: `{"version":1,"updatedAt":"...","messages":[{"id":"...","type":"message"|"request"|"subscribe","name":"...","email":"...","message":"...","createdAt":"..."}]}` (newest first, at most 500)

**Setup:** the folder share from step 3 above already covers this file
(the service account is Editor on the whole folder). Just add one more
env var in Vercel (same place as step 4) and redeploy:

- `DRIVE_MESSAGES_FILE_ID` — `1oOQP36nZ2WIHIdQOCWsqpZTexywgHZuk`

The inbox is admin-only: opening it needs the same
`ADMIN_PUBLISH_TOKEN` as publishing, so set that too if it is not set
already (see PERSISTENCE_SETUP.md).

**How to verify it works:** submit the contact form on the live site,
then open the inbox in Admin — the message should be listed. The form
itself never breaks when the inbox is unconfigured or Drive is down:
the message is simply not stored, and the email flow (or the mailto
fallback) still runs.

**Known limits:** same read-modify-write caveat as the counts above —
two form submissions at the exact same moment can lose one. Messages
are capped at 500 in the file (oldest drop off). Read/unread is tracked
per device in the browser, not in Drive.
