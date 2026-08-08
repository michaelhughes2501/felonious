# 01 — Deep Engineering Audit

## Snapshot

| Dimension | State |
|-----------|-------|
| Frontend | React 19.1 + Vite 8.1 + React Router 7.6 + axios |
| Backend (active) | Node 20+ / Express 5.1, JWT auth, `mysql2`, `bcryptjs`, optional `@anthropic-ai/sdk` |
| Backend (archival) | Python 3 / Flask 3.1 / `mysql-connector-python` |
| DB | MySQL 8+ (schema in `database/schema.sql`; ownership FKs; guarded `ALTER TABLE ... IF NOT EXISTS`) |
| Repo layout | npm workspaces at root; `backend-node/` and `frontend/` are workspaces, `backend-flask/` is a sibling pip project |
| CI | 6 workflows in `.github/workflows/` — of which **3 are broken/redundant** (`1codeql.yml`, `python-package-conda.yml`, `npm-publish-github-packages.yml`) — all deleted in this pass. `codeql.yml`, `defender-for-devops.yml`, `node.js.yml` remain. |
| Docs | `CLAUDE.md`, `AGENTS.md`, `SECURITY.md` — comprehensive |
| Tests | **None.** `npm test` succeeds because no workspace declares any. |
| Lint | Frontend has an ESLint config; backends have none. |

## What works well

- **Auth flow is idiomatic.** `authController` uses `bcryptjs` at cost 12, JWT with a 7-day TTL, and a documented `{success, data, error}` envelope. The register handler pre-checks for `EMAIL_TAKEN` and `HANDLE_TAKEN` *and* falls back to a `ER_DUP_ENTRY` catch to handle the race — the regex that identifies which column collided is genuinely careful (looks for `for key '<schema>.column'` rather than a substring of `sqlMessage`).
- **`assistantController` degrades gracefully.** When `ANTHROPIC_API_KEY` is unset, the Clerk falls back to keyword-based deterministic replies with the same envelope. Crisis phrases (`kill myself`, `crisis`, `unsafe`) bypass the LLM entirely — safety gate first, model second.
- **DB schema is well-shaped.** Ownership columns on `kits` and `connects` (`created_by INT REFERENCES residents(id) ON DELETE SET NULL`) preserve data if a resident is deleted. Guarded `ALTER TABLE ... IF NOT EXISTS` lets the schema file be re-run against an existing DB.
- **`schema.sql` and `Resident.ensureTable()` are documented as duplicated intentionally** (schema.sql stays the source of truth; the model self-heals against a fresh dev DB).
- **`rateLimit` middleware** is a genuinely minimal in-memory limiter for the integrations endpoints — no external dep, clear intent. The comment ("Enough to satisfy CodeQL's missing rate limiting alert") is honest.
- **`.env.example` files exist** for both backends and are read by `dotenv.config()` from the correct paths.

## Concrete gaps

### G1 — Three broken CI workflows

All fixed in this pass — see the [audit README](./README.md).

### G2 — `backend-flask/app.py` runs `app.run(debug=True, port=5000)` unconditionally

```python
if __name__ == "__main__":
    debug_log(...)
    app.run(debug=True, port=5000)
```

Flask's debug mode enables the Werkzeug debugger, which allows arbitrary code execution if it's exposed to the network — a documented Werkzeug security warning ("Never enable the debugger in production"). Because CLAUDE.md marks the Flask backend as archival and the frontend proxies to Node (port 5001), this is not currently in production. But `python backend-flask/app.py` from `npm start:flask` will spin up a debug server on `0.0.0.0` in dev; anyone on the LAN can reach the debugger. See [02-bug-hunt.md#b4](./02-bug-hunt.md).

### G3 — `.gitignore` had a Windows path separator on line 36

Same issue as several sibling repos: `.github\instructions\codacy.instructions.md`. **Fixed in this pass.**

### G4 — No tests, anywhere

The root `npm test` succeeds because no workspace declares a test script. That is not a green CI — it is a silent no-op. `Node.js CI` prints "passing" every time regardless of the actual code. The frontend has ESLint but no tests. The Node backend has no `jest`/`vitest`/`supertest`. The Flask backend has no `pytest`.

### G5 — `backend-flask/debug_logging.py` is instrumented in the request path

`app.py` calls `debug_log(hypothesis_id="H_ROUTES", ...)` during registration and again in `__main__`. Without the file open I can't tell exactly what `debug_log` writes, but the shape (`hypothesis_id`, `run_id="pre-fix"`) suggests a research/debug harness. It should not ship in a production build.

### G6 — `frontend/src/App.jsx` imports `context/AuthContext` — the wrapper exists but is not audited here

Not a bug; noting that the auth context implementation would need review to confirm the JWT is stored securely (not `localStorage`) once the app is at real scale.

### G7 — `backend-node/index.js` uses `app.get('*splat', ...)` catch-all

Express 5 requires named wildcards (`*splat` rather than `*`). This is correct, and worth calling out because the transition trips up many code samples on the internet.

### G8 — Assistant fallback logic never logs which path was taken except to the response

`assistantController.chat` returns `source: 'ai' | 'deterministic'` in the response body. Good for the client; but there's no server-side metric of what % of requests fell back — meaning nobody notices if the Anthropic key is quietly rotated or rate-limited into deterministic-only mode.

### G9 — `Resident.ensureTable()` runs at server start with `catch(err => console.warn(...))`

If the DB is down at boot, the app starts and warns — then every auth call fails with a cryptic "table does not exist" error until someone reads the warning. Consider failing fast when the DB is unreachable at start.

### G10 — `SESSION_SECRET` is not used anywhere

The Node backend uses JWTs with `JWT_SECRET` — no cookie sessions. That's fine; noting that if a future feature adds server-side sessions, it needs its own secret and cannot re-use `JWT_SECRET`.

## Code smell inventory (rank-ordered)

| Rank | Smell | Where |
|------|-------|-------|
| 1 | Two parallel backends over the same DB (documented intent, but real maintenance tax) | `backend-node/` + `backend-flask/` |
| 2 | Debug logging plumbed through production Flask handlers | `backend-flask/app.py` |
| 3 | Every controller repeats the `{success, data, error, meta}` envelope inline | `backend-node/controllers/*.js` |
| 4 | `index.js` hand-registers seven routes without a router-aggregator file | `backend-node/index.js` |
| 5 | `assistantController.SYSTEM_PROMPT` is inline (~24 lines) in the controller | `backend-node/controllers/assistantController.js` |
| 6 | Frontend pages import an `AuthProvider` that is not co-located in a `providers/` folder | `frontend/src/App.jsx` |

## Verdict

For a two-backend "learning artifact" the code quality is above what the label suggests. The auth flow is careful, the Clerk fallback is thoughtful, the schema uses real FKs. The immediate hygiene bill is small: delete three broken workflows (done), fix the `.gitignore` typo (done), and stop the Flask backend from booting with debug=True by default. Everything else is deferred to the refactor plan.
