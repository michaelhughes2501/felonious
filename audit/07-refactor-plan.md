# 07 — Refactor Plan

## Ground rules

- `npm test` (once real tests exist) must pass on every PR.
- CLAUDE.md's conventions (`{success, data, error}` envelope, parameterised SQL, two-space indent, PEP 8 for Python) are load-bearing.
- No PR reintroduces one of the three deleted CI workflows without a real reason.

## Phase A — Truth-in-CI + hygiene

### A1. (Done) Delete three broken CI workflows
Done in this pass. Verify Actions tab is clean on the PR.

### A2. Fix `backend-flask/app.py` to honour `FLASK_DEBUG` env var
- Effort: 15 min.
- Update `backend-flask/.env.example` to include `FLASK_DEBUG=0`.

### A3. Add ESLint to `backend-node`
- Effort: 30 min. Mirror the frontend's flat config.

### A4. Add a real test suite
- Effort: 3 hrs.
- **Node backend:** `vitest` + `supertest`. Cover register/login/me, kits CRUD, connects CRUD, assistant chat (both paths), rate limiter.
- **Frontend:** `vitest` + `@testing-library/react`. One test per page.
- **Flask backend:** `pytest` on the two live endpoints.

### A5. Verify Dependabot targets all ecosystems
- Effort: 10 min. Check `.github/dependabot.yml` covers npm (root + workspaces), pip (backend-flask), github-actions.

## Phase B — Security hardening

### B1. Add `helmet` to Node
- Effort: 30 min. CSP baseline that allows `'self'` + inline (or use nonces once inline is removed).

### B2. Add `express-rate-limit` on `/api/auth/*` and `/api/assistant/chat`
- Effort: 45 min. Login: 10/min per IP. Register: 5/hour per IP. Assistant: 30/hour per user.

### B3. Restrict CORS to configured origin in prod
- Effort: 15 min. `cors({ origin: process.env.CORS_ORIGIN })` behind a check.

### B4. Fix `x-forwarded-for` trust in `rateLimit.js`
- Effort: 20 min. `app.set('trust proxy', 1)` documented; use `req.ip`.

### B5. Refuse to boot without required env vars
- Effort: 20 min. `JWT_SECRET` already refuses; extend to `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.

### B6. Audit `AuthContext.jsx` — token storage
- Effort: 1 hr. Confirm not `localStorage`; move to `httpOnly` cookie if it is.

### B7. Rate-limit the Anthropic call per user
- Effort: 30 min. Reuses B2 infrastructure.

### B8. Add per-call token accounting for the Clerk
- Effort: 45 min. Log `response.usage`; consider a `clerk_usage` table for attribution.

## Phase C — Structure

### C1. Extract `envelope.js`
- Effort: 30 min. `res.ok(data)`, `res.fail(code, message, status?)`. Migrate one controller as proof; rest follows.

### C2. Split `index.js` into `app.js` + `server.js`
- Effort: 15 min. `app.js` exports the Express instance; `server.js` calls `listen`. Enables supertest.

### C3. Introduce a `services/` layer
- Effort: 1 hr. `services/anthropic.js` wraps the SDK + prompt loading + fallback bookkeeping.

### C4. Move `SYSTEM_PROMPT` to `prompts/clerk.md`
- Effort: 20 min. Load at startup, cache in memory.

### C5. Add a `BaseModel` helper (optional)
- Effort: 1 hr. `findOne(where)`, `findMany(where)`, `insert(row)`, `update(where, patch)`. Optional — only if it removes real repetition.

## Phase D — Migrations + observability

### D1. Introduce `knex migrate` (or `dbmate`)
- Effort: 2 hrs. Baseline migration matches current schema. `schema.sql` becomes generated.

### D2. Wire `pino` for structured JSON logging
- Effort: 30 min. Also swap `console.error` for `logger.error` in error handler.

### D3. Wire Sentry (or equivalent)
- Effort: 30 min. DSN from env.

### D4. Add `/api/health` DB check
- Effort: 15 min. `SELECT 1` on the pool; return 503 on failure.

### D5. Wire an uptime probe
- Effort: 30 min. Point UptimeRobot / Better Uptime at `/api/health` at 1-min intervals.

## Phase E — Deploy

### E1. Add `Dockerfile.node` + `.dockerignore`
- Effort: 45 min.

### E2. Pick a deploy target and commit config
- Effort: 45 min.

### E3. Managed MySQL (PlanetScale / Neon-mysql / Aiven) + document
- Effort: 2 hrs, mostly docs + provisioning scripts.

## Phase F — Product

### F1. Add password strength + email verification
- Effort: 4 hrs (email provider integration is the bulk).

### F2. Add resident self-deletion (right-to-be-forgotten)
- Effort: 1 hr.

### F3. Move the static `RESOURCES`-equivalent (Clerk's `eventSchedule`, `resourceMap`) to DB tables
- Effort: 2 hrs.

## Effort estimate

| Phase | Steps | Effort |
|-------|-------|--------|
| A | 5 | ~4.5 hrs |
| B | 8 | ~5 hrs |
| C | 5 | ~3.5 hrs |
| D | 5 | ~4 hrs |
| E | 3 | ~3.5 hrs |
| F | 3 | ~7 hrs |
| **Total** | **29 PRs** | **~28 hrs** |

## Explicit non-goals

- **Removing the Flask backend.** Documented as intentional; keep as archival.
- **Rewriting Node in TypeScript.** Not urgent; the code is small and JSDoc could suffice.
- **Introducing GraphQL / gRPC.** REST is fine at this scale.
- **Adding a queue (BullMQ / rabbit).** No async work exists that needs it.
