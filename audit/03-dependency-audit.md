# 03 — Dependency Audit

## Root (`package.json`)

```json
"devDependencies": {
  "dotenv": "^16.5.0",
  "esbuild": "^0.28.1",
  "mysql2": "^3.14.0"
}
```

- **`esbuild` at root** — no direct usage; probably transitive from a workspace, or a leftover. Consider removing.
- **`mysql2` at root** — the `database/seed.js` script uses it. OK to keep here.
- **`dotenv` at root** — no root code reads a `.env`; probably belongs in each workspace. Fine as-is; harmless duplication.

## `backend-node/package.json`

```json
"dependencies": {
  "@anthropic-ai/sdk": "^0.55.0",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.3",
  "mysql2": "^3.14.0"
},
"devDependencies": { "nodemon": "^3.1.14" }
```

| Package | Notes |
|---------|-------|
| `express` `^5.1.0` | Current stable v5. `app.get('*splat', ...)` catch-all is correct for v5. |
| `@anthropic-ai/sdk` `^0.55.0` | 0.55 is stable, but the 0.x line has moved forward. Verify `response.content?.[0]?.text` still works when bumping. |
| `bcryptjs` `^3.0.3` | Pure-JS bcrypt. Correct, safe. See [02-bug-hunt.md#l1](./02-bug-hunt.md) for the native-bcrypt performance note. |
| `jsonwebtoken` `^9.0.3` | Fine. v9 fixed the historical `none` algorithm confusion. |
| `mysql2` `^3.14.0` | Current stable. |
| `cors` `^2.8.5` | Current stable. Application config uses the default `cors()` which allows any origin — consider restricting per-env before shipping. |
| `dotenv` `^16.5.0` | Fine. |
| `nodemon` `^3.1.14` | Dev-only. Fine. |

**Missing** (worth adding before real launch):
- **Test framework:** `jest` / `vitest` + `supertest` for route tests. Currently none.
- **Lint:** `eslint` (frontend has it; the Node backend does not).
- **Structured logging:** `pino` (fits Node/Express, minimal overhead).
- **Real rate limiter:** `express-rate-limit` + `rate-limit-redis` — the in-tree shim is enough for the integrations routes but not for `/api/auth/*` or `/api/assistant/chat`.
- **Security headers:** `helmet` — currently no headers set beyond CORS.
- **Input validation:** `zod` — controllers hand-check body shape today.

## `frontend/package.json`

```json
"dependencies": {
  "axios": "^1.10.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.0"
},
"devDependencies": {
  "@vitejs/plugin-react": "^5.2.0",
  "esbuild": "^0.28.1",
  "eslint": "^9.29.0",
  "vite": "^8.1.0"
}
```

| Package | Notes |
|---------|-------|
| `react`, `react-dom` `^19.1.0` | Current stable — good, matches sibling repos. |
| `react-router-dom` `^7.6.0` | v7 is stable. Migration from v6 already done. |
| `vite` `^8.1.0` | Latest major. Good. |
| `@vitejs/plugin-react` `^5.2.0` | Matches Vite 8. Good. |
| `axios` `^1.10.0` | Fine. Could be replaced with `fetch` + a thin wrapper; not urgent. |
| `esbuild` `^0.28.1` | Same as at root — investigate whether it's actually used. |
| `eslint` `^9.29.0` | Flat config style (v9). Fine. |

**Missing:**
- **Test runner:** `vitest` + `@testing-library/react` + `@testing-library/jest-dom`.
- **Type checking:** the project is `.jsx` — no TypeScript. Fine; if TS is ever added, add `typescript` + `@types/*`.

## `backend-flask/requirements.txt`

```
blinker==1.9.0
click==8.4.2
colorama==0.4.6
Flask==3.1.3
flask-cors==6.0.5
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.3
mysql-connector-python==9.7.0
python-dotenv==1.2.2
Werkzeug==3.1.8
```

- **All exact-pinned** — good for reproducibility, but the pins mean any new install gets the same versions forever until someone bumps them. Consider `>=X,<Y` ranges or a `pip-compile` / `uv pip compile` loop.
- **`mysql-connector-python`** — official Oracle driver. Fine. Slower than `PyMySQL` in benchmarks; not the bottleneck at this scale.
- **No test / lint / formatter deps.** No `pytest`, no `ruff`, no `flake8`. `python-package-conda.yml` was trying to `conda install flake8` at CI time but was broken; simply add the tools to `requirements-dev.txt`.

## CI workflows

| File | State | Action |
|------|-------|--------|
| `codeql.yml` | works | keep |
| `1codeql.yml` | typo duplicate of above | **deleted this pass** |
| `defender-for-devops.yml` | works | keep |
| `node.js.yml` | works (tests are no-ops) | keep |
| `python-package-conda.yml` | broken (needs `environment.yml`, doesn't exist) | **deleted this pass** |
| `npm-publish-github-packages.yml` | broken (private packages) | **deleted this pass** |

`.github/dependabot.yml` **exists** — good. It should be reviewed to confirm it's targeting all three ecosystems (`npm` at root, `pip` at `backend-flask/`, `github-actions`).

## Known vulnerabilities (best-effort without network)

- `express` v5 line has been advisory-quiet since GA.
- `jsonwebtoken` v9 is post-CVE-2022-23529 and safe.
- `bcryptjs` v3 has no open advisories.
- `axios` v1.x had a series of URL-parsing advisories in 2024; v1.10 is post-fix.
- `Flask` 3.1.3 is current stable.

Add a `pip-audit` step (or Dependabot for `pip`) to close the loop on the Flask side.

## Recommended dependency actions, in order

1. **Add `pip-audit` to the CI** (once `python-package-conda.yml` is out of the way — done this pass).
2. **Add `helmet` + `express-rate-limit` + `zod` + `pino` to `backend-node`** as one PR — the security + observability foundation.
3. **Add `vitest` to both `backend-node` and `frontend`** with one smoke test each.
4. **Add ESLint to `backend-node`** (matching the frontend's flat-config style).
5. **Bump `@anthropic-ai/sdk` and verify** the Clerk controller still works.
