# Deploying Chiedza to Render

The web app and the mobile API are the same Node service. Deploying it makes both
permanently reachable; the React Native app is distributed separately (see below).

## What is already configured

- [`render.yaml`](../render.yaml) — web service, persistent disk, environment variables.
- `app.set('trust proxy',1)` in [`src/app.js`](../src/app.js) — required behind Render's
  TLS termination so `req.ip` is the real visitor. Without it every visitor shares one
  rate-limit bucket, and `NODE_ENV=production` would fail to issue session cookies.
- `GET /healthz` — a health check that deliberately runs before the session middleware
  so Render's probes never touch the session store.

## One-time setup

1. Push this repository to GitHub.
2. In Render: **New → Blueprint**, point it at the repository. It reads `render.yaml`.
3. Confirm the plan. **A persistent disk requires a paid instance type.** On the free
   plan the filesystem is wiped on every deploy and restart, which would erase accounts,
   journals and check-ins with no error.
4. Deploy. The service comes up at `https://<name>.onrender.com`.

## Why the disk matters

`SQLITE_STORAGE=/var/data/chiedza.sqlite` points at the mounted disk. The database code
creates the directory if missing ([`src/config/database.js`](../src/config/database.js)),
so no manual step is needed — but if the mount path and this variable ever disagree, the
database silently lands on the ephemeral filesystem and is lost on the next restart.

To move to MySQL instead, set `DB_DIALECT=mysql` plus `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`. No code change is required.

## Secrets

`SESSION_SECRET`, `JWT_SECRET` and `DATA_ENCRYPTION_KEY` use `generateValue: true`, so
Render generates them once and keeps them stable across deploys. They must never be
committed — all three have insecure development fallbacks in the source, which is exactly
why they have to be set in the environment before anything is publicly reachable.

Rotating `DATA_ENCRYPTION_KEY` after launch makes all previously encrypted text
(AI messages, journals, grief archive) permanently unreadable. Treat it as immutable.

`OPENAI_API_KEY` is optional — unset, the AI listener uses the safe local fallback.

## Pointing the mobile app at the deployment

Set `EXPO_PUBLIC_API_URL` in [`mobile-app/.env`](../mobile-app/.env):

```
EXPO_PUBLIC_API_URL=https://<name>.onrender.com/api/mobile
```

`EXPO_PUBLIC_*` values are inlined at bundle time, so Metro must be restarted afterwards.

Deploying the server does **not** distribute the mobile app. Testers still need either
Expo Go (`npx expo start --tunnel`) or a TestFlight build via EAS. Every dependency in
`mobile-app/package.json` ships inside Expo Go, so no custom development build is needed.

## Before this is genuinely public

Per [`REQUIREMENTS-MAPPING.md`](./REQUIREMENTS-MAPPING.md), the crisis directory ships with
non-functional placeholder contacts, and GDPR/POPIA status is engineering foundations only.
A permanently public URL means strangers can register and use this as a real service. Gate
access — invite-only, a landing password, or verified regional crisis numbers — before
sharing it beyond stakeholders.
