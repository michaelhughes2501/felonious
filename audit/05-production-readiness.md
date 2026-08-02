# 05 — Production-Readiness Review

## Checklist

| # | Requirement | State |
|---|-------------|-------|
| 1 | Reproducible install | Partial. Root `install:all` installs both stacks. No lockfile for pip. |
| 2 | Env config documented | Yes — `.env.example` in each backend + CLAUDE.md table. |
| 3 | Env config **enforced** | Partially — `JWT_SECRET` is required at boot. Others are not. |
| 4 | Dependencies audited | Dependabot exists; no `npm audit` / `pip-audit` gates in CI. |
| 5 | Minimum test bar | **None.** `npm test` is a silent no-op. |
| 6 | Real CI (build + test) | Only CodeQL + Defender + a no-op `Node.js CI`. |
| 7 | Observability | None. `console.error`/`console.warn` only. |
| 8 | Rate limiting | Only on integrations pages. Not on auth or the Clerk. |
| 9 | Security headers | None (helmet not installed). |
| 10 | Backup / restore | Not documented. |
| 11 | Migrations | `schema.sql` uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... IF NOT EXISTS` — idempotent, but not versioned. No Flyway / Liquibase / Knex-migrate / Alembic. |
| 12 | Admin surface | None. |
| 13 | Runbook | Absent. |

## Deploy story

### What exists
- Root `npm start:node`, `npm start:flask` scripts.
- Express serves the built React SPA from `backend-node/public/` if the directory exists — see `index.js:44–58`.
- CLAUDE.md documents the local dev commands accurately.

### What's missing
- **A Dockerfile.** For a multi-workspace repo the sensible shape is:
  - `Dockerfile.node` — installs `backend-node` deps, builds the frontend, copies `frontend/dist/` → `backend-node/public/`, runs `node index.js`.
  - Optionally `Dockerfile.flask` for the archival backend.
- **A `.dockerignore`.**
- **A deploy target config** (`fly.toml` / `render.yaml` / `Procfile`).
- **A managed MySQL provisioning script or IaC (Terraform / SST).** Nothing exists for provisioning the DB.
- **A migration story.** `schema.sql` is fine for greenfield but the moment a column needs to change, an out-of-band SQL script is not survivable.

## Observability

- **Logging:** `console.log` / `console.warn` / `console.error` only. Not structured, not JSON, not shipped anywhere.
- **Error reporter:** none.
- **APM:** none.
- **Uptime probe:** `/api/health` exists on both backends. Nothing hits it.
- **Metrics:** none. No sense of DAU, request rate, error rate, Clerk fallback rate.

Recommend `pino` (structured JSON logs to stdout) + Sentry (`@sentry/node`) + a scheduled UptimeRobot probe as the minimum viable stack.

## Data lifecycle

- **Backup:** not documented. On managed MySQL (PlanetScale / RDS / Aiven) this is a provider default — must be documented, and the restore procedure tested at least once.
- **Restore:** untested.
- **Data deletion:** `residents` has `ON DELETE SET NULL` on the `created_by` FK for `kits` and `connects` — so deleting a resident preserves their contributions with anonymised authorship. That's a reasonable default; document it in a `PRIVACY.md`.
- **Right-to-be-forgotten:** no route implements resident deletion. Needed for any real product.
- **PII inventory:** would be `residents.email`, `residents.bio`, `residents.location`. Nothing else.

## Reliability

- **No graceful shutdown.** Express 5 supports it natively; nobody's wired it. Server terminates with in-flight requests on SIGTERM.
- **No connection-pool sizing** on `mysql2` (uses defaults). Fine at low load; needs revisiting under real traffic.
- **No timeout on the Anthropic call.** SDK default (~60s). During an Anthropic incident every chat request pins a worker for the full timeout.
- **No health-check for DB in `/api/health`.** Health returns 200 even when MySQL is down.

## Documentation

- `README.md` — need to verify (top-level).
- `CLAUDE.md` — comprehensive.
- `AGENTS.md` — comprehensive.
- `SECURITY.md` — exists.
- **Runbook** — absent.
- **Deploy guide** — absent.
- **Onboarding for a new dev** — CLAUDE.md is enough for someone familiar with the stack; a `docs/ONBOARDING.md` for less-experienced devs would help.

## Verdict

Same shape as ConvictCode: the code is more careful than the surrounding hygiene suggests, but the production-readiness gap list is long. Nothing here is engineering-hard; it's process-work. The refactor plan orders it.
