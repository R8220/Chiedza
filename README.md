# Chiedza — Node.js Full-Stack Care Platform Prototype

A modern, responsive Node.js implementation of **Chiedza Application: Complete Product Scope & Technical Specification v2.0 (13 August 2026)**. The build is intentionally safety-first: AI is a listener/reflector/sensor, flagged high-risk or crisis language enters a human review workflow, and the product avoids streaks, leaderboards, FOMO and infinite feeds.

## What is inside

- **Node.js / Express 5** server with EJS responsive UI
- **SQLite for immediate local use** and **MySQL configuration for hosting** via Sequelize
- User, therapist, care-reviewer, caregiver and administrator roles
- AI Emotional Listener with optional OpenAI integration and safe local fallback
- Care Orchestrator, emotion/risk heuristics, structured AI care summaries and clinician corrections
- Five-room Quiet Arcade: Calm Me, Ground Me, Let Me Rest, Help Me Return, Carry With Me
- Mindfulness Corner, journaling, Low Battery / reduced-motion modes
- Therapist Corner: caseload, summaries, risk indicators, SOAP notes, care plans, sessions and secure in-app text
- Human safeguarding queue and moderated slow-community lanterns
- Matching Engine with clinical specialty, preference, language/timezone and workload weighting
- Return to Self recovery portal, Hearthstone milestones and Emotional Weather reflection
- Digital Grief Archive, AI Poetry Studio, Companion Mode and 2D Healing Sanctuary prototype
- PWA shell and offline grounding page
- Audit trail, user/role operations and crisis-contact directory
- Brand palette and typography from the specification


## Native mobile app added

This enhanced edition now includes an **Expo / React Native** client in `mobile-app/` plus a token-authenticated REST API under `/api/mobile`. The Node.js backend remains the source of truth for safety, AI routing, data and therapist workflows. See `docs/MOBILE-CONVERSION.md` and `mobile-app/README.md`.

## Important safety / production boundary

This repository is a **development prototype, not a clinically validated medical device or live crisis service**. The requirement document itself makes several items dependent on licensed clinical review, defined human capacity and external services. The code therefore does **not** invent those dependencies.

Before any public/clinical launch you must at minimum:

1. Have the safeguarding/routing thresholds clinically reviewed and validated.
2. Replace the seeded `CONFIGURE_IN_ADMIN` crisis entries with verified country/region-specific contacts and operating procedures.
3. Staff the Care Review queue with trained personnel and define response SLAs.
4. Perform privacy impact assessments, GDPR/POPIA legal review, penetration testing, threat modelling and security review.
5. Replace prototype app-layer storage encryption for messages with a reviewed **true end-to-end communication design** if E2E messaging is required.
6. Select and configure production video/audio, WhatsApp, EAP, crisis-service and payments providers.
7. Validate translations and culturally adapted clinical content with qualified language/cultural reviewers.
8. Validate any vocal-stress/biomarker functionality clinically before enabling it. This build deliberately does not infer depression/anxiety from voice.
9. Wrap the responsive/PWA frontend with a native shell (or build native clients) and complete Apple/Google store compliance for iOS/Android distribution.

See `docs/REQUIREMENTS-MAPPING.md` for feature-by-feature implementation status.

## Run in VS Code — quickest setup

### 1. Open the folder

Open this extracted folder in VS Code, then open **Terminal > New Terminal**.

### 2. Install packages

```bash
npm install
```

### 3. Create your environment file

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

For local testing, SQLite works with the default settings. Change `SESSION_SECRET` and `DATA_ENCRYPTION_KEY` before using real information.

### 4. Seed demo data

```bash
npm run seed
```

Demo accounts — password for all: **Demo123!**

| Role | Email |
|---|---|
| User | `user@chiedza.local` |
| Therapist | `therapist@chiedza.local` |
| Care reviewer | `reviewer@chiedza.local` |
| Administrator | `admin@chiedza.local` |
| Caregiver | `caregiver@chiedza.local` |

### 5. Start the system

```bash
npm run dev
```

Open: `http://localhost:3000`

## Enable live AI interaction

The system runs without an API key using a conservative local reflection fallback. To enable the configured AI provider, add to `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6
```

The AI layer is isolated in `src/services/aiService.js`. High-risk/crisis routing occurs **before** the normal generative listener call.

## Switch from SQLite to MySQL

Create a MySQL database and update `.env`:

```env
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=chiedza
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
```

Then run:

```bash
npm run seed
npm run dev
```

A sample `docker-compose.mysql.yml` is included if you prefer a local MySQL container.

## Main routes

### User
- `/app` — adaptive home + check-in
- `/listener` — AI Emotional Listener
- `/rooms` — Quiet Arcade
- `/mindfulness` — mindfulness + journals
- `/community` — Lanterns Left Behind
- `/app/recovery` — Return to Self + Hearthstone
- `/app/grief` — grief archive
- `/app/poetry` — AI poetry
- `/app/companion` — caregiver permissions
- `/app/sessions` — session requests
- `/app/messages` — therapist messages
- `/app/settings` — consent and control
- `/sanctuary` — 2D Digital Healing Sanctuary prototype

### Therapist
- `/therapist`
- `/therapist/users/:id`
- `/therapist/messages/:id`

### Care reviewer
- `/reviewer`

### Admin
- `/admin`
- `/admin/users`
- `/admin/crisis-contacts`
- `/admin/audit`

## Project structure

```text
chiedza-nodejs-system/
├── public/              # CSS, browser JS, PWA/offline assets
├── src/
│   ├── config/          # database configuration
│   ├── middleware/      # authentication / RBAC
│   ├── models/          # Sequelize data model
│   ├── routes/          # role and feature routes
│   ├── services/        # AI, risk, orchestration, matching, forecast
│   ├── utils/           # encryption + language copy
│   ├── app.js
│   └── seed.js
├── views/               # EJS pages
├── docs/                # requirements mapping
├── tests/               # smoke / safety tests
├── .env.example
└── package.json
```

## Tests

```bash
npm test
```

## Hosting notes

For a real deployment, use HTTPS, a managed MySQL/PostgreSQL service, strong secrets, reverse proxy/load balancer, secure backups, monitoring, centralized audit logs, retention/deletion policies, DPA/vendor review and a properly designed key-management solution. Do not use demo accounts or seeded crisis placeholders in production.
