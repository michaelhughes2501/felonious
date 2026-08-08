# 04 — Security Review

## Authentication (Node backend)

### Strengths
- **`bcryptjs` at cost 12.** Correct baseline for 2024–2026 hardware.
- **JWT with a 7-day TTL.** Signed with `JWT_SECRET`, which is required at module load (`throw new Error(...)` on missing var). Zero risk of running with an unsigned or weak-default secret.
- **Register handler is thoughtful:** pre-checks for email and handle collisions, plus a `ER_DUP_ENTRY` fallback that correctly identifies which column collided via a regex on the `sqlMessage`.
- **Password minimum:** 8 characters. Below the 10–12 baseline but not embarrassing.

### Gaps
- **No account lockout / brute-force protection** on `/login`. The in-tree `rateLimit` middleware exists but is only applied to the `/integrations/*` file-serving routes.
- **JWT stored where?** The token is returned in the response body. The frontend has an `AuthContext` — where it puts the token was not audited in this pass. If it lands in `localStorage`, any XSS is a full account takeover. Recommend `httpOnly` cookies with `SameSite=Strict`.
- **No refresh tokens.** A 7-day access token cannot be revoked; if it's stolen, it's valid for the full week.
- **No password strength check** beyond length. Consider `zxcvbn` or a common-password blacklist.
- **No email verification.** `residents` accounts are usable immediately.
- **Handle case-sensitivity:** `handle` is `VARCHAR(100) NOT NULL UNIQUE` — MySQL default collation is case-insensitive for VARCHAR. Good (prevents `Alice` vs `alice` confusion) but should be documented.

## Rate limiting

- **`middleware/rateLimit.js`** — in-memory fixed-window limiter. Enough for the integrations pages. **Not applied to `/api/auth/*`, `/api/assistant/chat`, `/api/kits`, `/api/connects`.**
- **`x-forwarded-for` trusted unconditionally** — see [02-bug-hunt.md#l5](./02-bug-hunt.md). Client can spoof.
- **No distributed store.** In-memory means the limits reset on every deploy and don't work across horizontal replicas.

Recommend `express-rate-limit` + `rate-limit-redis` and applying it globally with tighter caps on `/api/auth/*` and `/api/assistant/chat`.

## CORS

- `app.use(cors())` — allows every origin. Fine for dev. In production, restrict to the deployed frontend origin (`CORS_ORIGIN` env var).

## Security headers

- **`helmet` is not installed.** No CSP, no HSTS, no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy.
- **The SPA and API are served from the same Express process** in production (`app.use(express.static('public'))`). One `helmet()` call configures headers for both. Trivial to add.

## SQL / injection

- **All queries use parameter placeholders.** `SELECT * FROM residents WHERE email = ?`, `INSERT INTO residents (...) VALUES (?, ?, ?)`, etc. No string concatenation observed in the Node backend or the audited Flask surface.
- **CLAUDE.md convention** ("never string-concatenate SQL") is enforced by practice.

## The Clerk (AI) endpoint

- **Crisis phrases bypass the LLM** and return a fixed safety response. Correct.
- **No rate limiting.** A malicious user can drain your Anthropic budget. **Recommend a per-resident cap.**
- **Prompt injection surface:** user message is passed as `content` to `client.messages.create` with a separate `system` prompt — the SDK's structural separation is the right defence. Not string-concatenation. Good.
- **No cost metering / token accounting.** Once real users hit this, you cannot attribute cost. Recommend logging `response.usage.input_tokens` + `output_tokens` per call.
- **Anthropic key exposure:** stored in `ANTHROPIC_API_KEY` env var, only read server-side. Correct.

## Data at rest

- **`residents.password`** — stores bcrypt hash. `VARCHAR(255)`. Wide enough for bcrypt (60 chars). Good.
- **`residents.email`** — plaintext. Fine at current scale; consider a policy on export requests.
- **`residents.bio`, `location`** — plaintext. Not sensitive by default.
- **`kits`, `connects`** — public-ish reference data. No PII.
- **No encryption at rest column-level.** Acceptable given the schema.

## Flask backend

- **`app.run(debug=True)`** — see [02-bug-hunt.md#b3](./02-bug-hunt.md). Debug mode is a code-execution vector if ever exposed externally.
- **`CORS(app)`** — default allows every origin. Same recommendation as Node.
- **No auth** on the Flask backend. It exposes only `/api/health` and `/api/items` (both read-only). Not a security issue given the scope.

## Secrets handling

- `.env` is `.gitignore`d in both backends.
- `.env.example` files are tracked and contain placeholders only.
- `JWT_SECRET` is required at module load — no weak default.
- `ANTHROPIC_API_KEY` is optional — the Clerk degrades to deterministic replies without it.

## Static analysis

- **CodeQL** covers Python + JS/TS + Actions on push/PR to `master`. Good.
- **Defender for DevOps** also runs. Fine.
- **Dependabot** exists. Should be verified to target npm, pip, and github-actions.

## Summary of concrete security actions

Priority order:

1. **Rate-limit `/api/auth/login`, `/api/auth/register`, `/api/assistant/chat`** globally, not just the integrations routes.
2. **Install `helmet`** and set at least a starter CSP + HSTS + Referrer-Policy.
3. **Restrict CORS** to the deployed frontend origin in production.
4. **Audit `AuthContext.jsx`** to confirm the JWT is not in `localStorage`.
5. **Move `x-forwarded-for` handling** behind an `app.set('trust proxy', ...)` configuration.
6. **Add a per-user cap on `/api/assistant/chat`** to protect the Anthropic budget.
7. **Fix `backend-flask/app.py`** debug flag.
8. **Add password-strength check + email verification** before real launch.
