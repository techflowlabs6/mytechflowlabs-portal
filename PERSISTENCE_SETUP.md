# Making admin changes permanent (GitHub publish)

Today, adding or editing a card saves it in **that browser only**
(`localStorage`, key `mytechflow_apps_v2`). That is why a card added on one
phone or laptop does not show up on another device or after logging out.

This project now has a permanent path:

1. You add / edit a card in Admin.
2. The site saves it on your device **immediately**, so nothing is lost.
3. It then tries to publish: the server commits the updated catalog to
   `public/apps.json` in GitHub (and an uploaded image to
   `public/art/uploads/`).
4. Vercel deploys that commit, and the new card appears on **every device**.

## One-time setup (about 5 minutes, Naveen only)

### 1. GitHub token — server side only, never in the browser

1. GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
2. Name it `mytechflowlabs-portal publish`, expiry 90 days (renew it when
   it expires — publishing stops, local saving keeps working).
3. Repository access: **Only select repositories** →
   `techflowlabs6/mytechflowlabs-portal`.
4. Permissions → Repository permissions → **Contents: Read and write**.
   Nothing else.
5. Copy the token once. You will not see it again.

### 2. Publish token — the password the Admin screen asks for

Pick any long random string, for example from a password generator.
This is **not** your GitHub token. It only lets the Admin screen ask the
server to publish. If it ever leaks, change it in Vercel — the GitHub
token stays safe.

### 3. Vercel environment variables

Vercel Dashboard → mytechflowlabs-portal → Settings → Environment Variables,
add these for **Production** (and Preview if you test there):

| Name | Value |
| --- | --- |
| `GITHUB_TOKEN` | the fine-grained token from step 1 |
| `GITHUB_REPO` | `techflowlabs6/mytechflowlabs-portal` |
| `GITHUB_BRANCH` | `main` |
| `ADMIN_PUBLISH_TOKEN` | the random string from step 2 |

Redeploy (Deployments → ⋯ → Redeploy) so the server function picks them up.

### 4. Test it

1. Open the live site, log in as Admin (1-click login).
2. Add a test card, pick **Upload image**, choose a small photo.
3. Save. The admin bar should say **“Published to GitHub”** with a commit link.
4. Wait for the Vercel deploy, then open the site on another device —
   the test card should be there. Delete the test card and publish again
   to clean up.

## If publishing is not set up yet

Nothing breaks. Saving still works on that device, and the admin bar says
**“Saved on this device only — GitHub publishing is not set up yet”**,
with a **Download apps.json** button. That file is the exact catalog —
hand it to Brio (or commit it to `public/apps.json` yourself) and it
becomes permanent the same way.

## How the site decides what to show

- First visit on a device: the site loads the committed `public/apps.json`.
- After that, your device keeps its own copy in `localStorage`, so edits
  work offline.
- On each visit it re-checks `public/apps.json`. If the committed catalog
  is **newer** than your device copy, it adopts the committed one — so a
  card published from another device replaces a stale local copy instead
  of hiding it forever.
- **Restore defaults** resets your device copy to the 9 built-in apps.
  It does not delete anything from GitHub until you publish again.

## Dark / light mode

The sun/moon switch in the top bar flips the whole site between the light
Citrus & Ink theme and a dark theme. Your choice is saved per device
(`mytechflow_theme`) and the site also follows your phone/computer's
system setting on first visit. It works on phone, tablet and desktop.
