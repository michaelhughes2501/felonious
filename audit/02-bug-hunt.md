# 02 — Bug Hunt

## Confirmed bugs

### B1 — Three broken CI workflows in `.github/workflows/`
- **Files:** `1codeql.yml`, `python-package-conda.yml`, `npm-publish-github-packages.yml`
- **Symptom:**
  - `1codeql.yml` — literal filename typo of `codeql.yml`. Same `name: "CodeQL Advanced"`, same triggers, same jobs. GitHub runs both; the Actions UI shows two identical entries.
  - `python-package-conda.yml` — runs `conda env update --file environment.yml`. **No `environment.yml` exists** in the repo. Fails on every push.
  - `npm-publish-github-packages.yml` — runs `npm publish` on release. Root and all workspace `package.json` files declare `"private": true`. Publish would fail even if a release were created.
- **Fix:** Delete all three. **Applied in this pass.**

### B2 — `.gitignore` line 36 uses a Windows path separator
- **File:** `.gitignore` (line 36)
- **Symptom:** `.github\instructions\codacy.instructions.md` — the `\` is a literal character on POSIX. The file is not ignored on macOS / Linux / Ubuntu CI.
- **Fix:** POSIX slash. **Applied in this pass.**

### B3 — `backend-flask/app.py` hard-codes `debug=True` on `app.run(...)`
- **File:** `backend-flask/app.py` (line 35)
- **Symptom:** Debug mode enables Werkzeug's interactive debugger. Anyone who can reach the port can get a Python REPL running as the web server user. Not currently deployed (CLAUDE.md marks Flask as archival), but the script is what `npm run start:flask` invokes.
- **Fix:** Read from `os.getenv('FLASK_DEBUG', '0').lower() in ('1','true','yes','on')`. Not applied — it's a behavioural change and needs to be tied to a `.env.example` update in the same commit. Called out in the refactor plan.

### B4 — `backend-flask/app.py` runs on `0.0.0.0` implicitly (Flask default is `127.0.0.1`; here it's `0.0.0.0` via port arg only)
- **File:** `backend-flask/app.py` (line 35)
- **Correction:** Actually, `app.run(debug=True, port=5000)` uses Flask's default host `127.0.0.1`, so this is *not* the LAN-exposed variant. B3 is still the correct concern; disregard the "bound to 0.0.0.0" framing in that section. Noting explicitly to prevent the misread.

### B5 — `Resident.ensureTable()` runs asynchronously at boot and only warns on failure
- **File:** `backend-node/index.js` (lines 40–41)
- **Symptom:** `Resident.ensureTable().catch(err => console.warn(...))`. If the DB is down at boot, the server still starts and accepts connections; every subsequent auth call fails with a mysterious "table doesn't exist" error until someone reads server logs.
- **Fix:** Either await the call in an async bootstrap and refuse to `app.listen` if it throws, or move table-creation entirely to `database/schema.sql` and require it be run before the server starts (already the CLAUDE.md convention). Not applied.

### B6 — `assistant.js` fallback path never surfaces API failures to observability
- **File:** `backend-node/controllers/assistantController.js` (line 133–146)
- **Symptom:** `callClaude` returns `null` on any Anthropic error — invalid API key, rate limit, quota exceeded, network hiccup. The controller silently switches to deterministic replies, with the only visible signal being `source: 'deterministic'` in the response body. A rotated / revoked key won't page anyone.
- **Fix:** In addition to `console.error(...)`, emit a structured log line and (once observability is wired) a metric like `assistant.fallback.reason={api_key_invalid|rate_limit|network|unknown}`. Not applied — needs the observability step first.

### B7 — Global Express error handler swallows the `next` parameter
- **File:** `backend-node/index.js` (line 66)
- **Not a bug** — Express recognises 4-arg middlewares as error handlers by the signature. `next` is *required* by the runtime to be present, even if unused. The linter warning is a false positive. Noting to prevent it being "cleaned up" incorrectly.

## Latent bugs

### L1 — `bcryptjs` at cost 12 is the JS variant; native `bcrypt` is faster
- **File:** `backend-node/package.json`
- **Symptom:** `bcryptjs` is a pure-JS implementation of bcrypt — safe, correct, but ~3× slower than the native `bcrypt` npm package. At cost 12 that translates to ~150ms per hash on typical hardware vs ~50ms. For 1000 concurrent registrations, this is the difference between 6 CPU-seconds and 2 CPU-seconds of blocking work in the event loop.
- **Fix:** Migrate to `bcrypt` once native builds are available in the target deploy environment.

### L2 — `AuthContext.jsx` — implementation not audited here
- **File:** `frontend/src/context/AuthContext.jsx`
- **Symptom:** Not read in this pass; needs a look for whether the JWT is stored in `localStorage` (bad — vulnerable to XSS-based token exfiltration) vs a `httpOnly` cookie (better).

### L3 — `SYSTEM_PROMPT` in the Clerk controller cannot be A/B tested or updated without a deploy
- **File:** `backend-node/controllers/assistantController.js` (lines 105–129)
- **Symptom:** Prompt is a JS string constant. Any tweak requires a full deploy. Consider externalising to a config file or DB row once the product is live.

### L4 — `backend-node/index.js` uses `app.get('*splat', ...)` for the SPA fallback but places it after route registrations, so `/api/*` misses hit the SPA fallback → the `if (originalUrl.startsWith('/api'))` guard inside the handler catches it
- **File:** `backend-node/index.js` (lines 47–56)
- **Not a bug** — the guard is deliberate. Noted so future refactors don't remove the guard.

### L5 — `rateLimit` middleware's IP source order trusts `x-forwarded-for` unconditionally
- **File:** `backend-node/middleware/rateLimit.js` (line 13)
- **Symptom:** `const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')`. A client can trivially set an arbitrary `X-Forwarded-For` and evade the limit. Only trust that header behind a known proxy (`express.set('trust proxy', ...)` + verify request came from the proxy).
- **Fix:** Use `req.ip` after setting `app.set('trust proxy', <hops>)` appropriately; document the deploy expectation.

### L6 — `authController` uses status codes correctly, but returns 500 with `SERVER_ERROR` for any DB failure — no distinction between "DB down" and "constraint violation"
- Not a bug; a UX consideration. In production, a `503` with `Retry-After` for transient DB failures beats a 500.

### L7 — `AGENTS.md` documents platform vocabulary (`Yard`, `Commissary`, `Cellmate`) that the frontend `App.jsx` also uses
- Not a bug; confirmed consistent. Called out because CLAUDE.md's `## Naming` section is enforced only by convention — worth an ESLint rule or a check-script if the vocabulary ever spreads across dozens of files.

## Not-a-bug

- **Two parallel backends** — intentional per CLAUDE.md ("learning/comparison artifact"). Not a bug.
- **`Resident.ensureTable()` duplication with `schema.sql`** — intentional and documented at line 55–61 of `schema.sql`.
- **`rateLimit` middleware existing in-tree instead of using `express-rate-limit`** — deliberate per the comment; not a bug.

## Nothing else surfaced from a static read

The Node backend follows one consistent envelope (`{success, data, error, meta}`) and uses parameterised queries throughout. The Flask backend is small enough that the debug-mode bug is the only real concern. The frontend was only shallowly audited here — a Phase-1 pass focuses on the backend + config surface.
