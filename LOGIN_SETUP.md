# Admin password login — setup

The admin back office can be locked with a password. The password
itself is never stored anywhere: only a one-way scrypt hash of it lives
in Vercel, and the check runs server-side in `api/login.js`. The hash
cannot be turned back into the password.

This locks the **admin screen only**. It does not replace
`ADMIN_PUBLISH_TOKEN`, which still gates publishing to GitHub and the
messages inbox (see `PERSISTENCE_SETUP.md` and
`DRIVE_STATS_SETUP.md`).

## Setup (about 5 minutes)

### 1. Pick a strong password

Any password of at least 8 characters works; a longer passphrase is
better. You will type it twice and never see it again — keep it
somewhere safe yourself (a password manager, for example). There is no
"forgot password" email: if you lose it, reset it with step 5 below.

### 2. Generate the hash on your own computer

From the repo root:

```sh
node scripts/make-admin-hash.mjs
```

Type the password twice (each character shows as `*`). The script
prints **only** the hash value, for example:

```
scrypt:16384:8:1:9f2c…:a41d…
```

Nothing is written to any file. The password itself is never printed
or stored.

### 3. Paste the hash into Vercel

In the Vercel dashboard, open the project → Settings → Environment
Variables, and add:

- **Name:** `ADMIN_PASSWORD_HASH`
- **Value:** the hash printed by the script (the whole line, starting
  with `scrypt:`)

Apply it to Production (and Preview, if you want the password login on
preview deployments too).

### 4. Redeploy

Redeploy the Production deployment (Deployments → ⋯ → Redeploy), or
push any commit — the new env var only takes effect after a deploy.
From then on, opening Admin asks for the password; the 1-click login
button is gone.

### 5. Reset the password

Run the script again with the new password, replace the
`ADMIN_PASSWORD_HASH` value in Vercel, and redeploy. The old password
stops working as soon as the new deployment is live.

## Before the hash is set

Until `ADMIN_PASSWORD_HASH` exists, nothing changes: the admin login
works exactly as before (email check + 1-click login). The password
screen only appears once the hash is set and deployed, so you can
never lock yourself out by merging this code alone.

## How it works, briefly

- `scripts/make-admin-hash.mjs` — generates the hash (scrypt,
  N=16384, r=8, p=1, 64-byte key, random 16-byte salt).
- `api/login.js` — `GET /api/login` answers `{ configured: true }`
  when a hash is set; `POST /api/login { password }` answers
  `{ ok: true }` on a match and the same generic `{ ok: false }` for
  a wrong password, a malformed hash, or a missing password.
- `src/lib/adminLogin.js` — client helpers. A successful login is
  remembered in `sessionStorage` (`mytechflow_admin_auth`) for the
  current tab session only; closing the tab means logging in again.
  It is never written to `localStorage`.
- When a password login is configured, the old `localStorage` admin
  flag is ignored and removed, so it cannot reopen Admin on its own.
