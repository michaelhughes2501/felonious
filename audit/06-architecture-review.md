# 06 — Architecture Review

## Current architecture

```
Browser (dev)                    Browser (prod)
   │                                 │
   ▼                                 ▼
Vite dev server (:5173)     ┌────────────────────┐
   │  proxy /api → :5001    │  backend-node/     │
   │                        │  index.js (Express)│
   ▼                        │  ┌────────────────┐│
   ─────────────────────────┼─▶│ /api/*         ││
                            │  │ /integrations/*││
                            │  │ static SPA →   ││
                            │  │ backend-node/  ││
                            │  │ public/        ││
                            │  └────────────────┘│
                            └──────────┬─────────┘
                                       ▼
                                 mysql2 pool
                                       │
                                       ▼
                                 MySQL 8+ (kits, connects, residents, items)
                                       ▲
                                       │
                              backend-flask/app.py
                              (archival — /api/health + /api/items)
```

## Why two backends?

CLAUDE.md says it explicitly: "The repo intentionally keeps two parallel backend implementations (Flask and Node/Express) over the same MySQL schema as a **learning/comparison artifact**." That is a legitimate choice for a portfolio project. It is also a real maintenance tax:

- Any schema change has to be reflected in both backends' models.
- Feature parity requires double the code + double the tests + double the auth wiring.
- The Clerk implementation exists only in Node; the Flask side has neither auth nor an assistant.

The recommendation is not to remove the Flask backend, but to be honest about its status: it is a **scaffold**, not a peer. That is roughly what the current docs already say.

## Layering

### Node backend
```
index.js
 ├── middleware/
 │    ├── auth.js         (requireAuth, optionalAuth, JWT_SECRET)
 │    └── rateLimit.js    (in-memory fixed window)
 ├── routes/
 │    ├── auth.js         → controllers/authController
 │    ├── kits.js         → controllers/kitController
 │    ├── connects.js     → controllers/connectController
 │    ├── items.js        → controllers/itemController
 │    ├── assistant.js    → controllers/assistantController
 │    └── integrations.js
 ├── controllers/         (all business logic)
 ├── models/              (thin DAOs on top of mysql2)
 │    ├── Resident.js
 │    ├── Kit.js
 │    ├── Connect.js
 │    └── Item.js
 └── config/db.js         (mysql2 pool)
```

This is textbook: routes → controllers → models → DB. Clean layering. Two friction points:

- **`{success, data, error, meta}` envelope is repeated at every response site.** A `res.envelope(...)` helper or a lightweight response wrapper would DRY it.
- **Model classes have no shared base.** `Resident.findByEmail`, `Kit.findAll`, `Connect.findById` each hand-roll the mysql2 call. A tiny `BaseModel` with `findOne`, `findMany`, `insert`, `update` would remove ~30% of code.

Neither is urgent.

### Flask backend
```
app.py
 ├── config/db.py
 ├── models/item.py
 ├── controllers/item_controller.py
 └── routes/items.py
```

Same shape at 1/3 the surface area. Correct for its scope.

### Frontend
```
frontend/src/
 ├── main.jsx
 ├── App.jsx
 ├── context/AuthContext.jsx
 ├── components/{Navbar, StatusBadge}.jsx
 └── pages/{Yard, Commissary, Connects, Clerk, Login, Register, Profile, NotFound}.jsx
```

Two-level split: `pages/` for route roots, `components/` for shared UI, `context/` for providers. Small and coherent. Would benefit from a `services/` folder for the API client wrappers (currently every page calls `axios` directly or via ad-hoc helpers — not audited in depth).

## The Clerk (assistant)

Architecture is worth calling out specifically:

- **Deterministic fallback + LLM path.** The controller picks based on `ANTHROPIC_API_KEY` presence and Anthropic API health.
- **Safety gate is first**, before any AI call, on crisis phrases.
- **Envelope is identical** for both paths — the frontend contract doesn't change.
- **`SYSTEM_PROMPT` is inline.** Move to `prompts/clerk.md` (loaded at startup) once product wants to iterate on it without a code deploy.

The pattern is *good* — production-shaped from day one. What's missing is:

- Cost / token accounting.
- Fallback observability (see [02-bug-hunt.md#b6](./02-bug-hunt.md)).
- Per-user rate limits.

## Schema

- **Ownership FKs** (`kits.created_by`, `connects.created_by` → `residents.id ON DELETE SET NULL`) are the right pattern.
- **`residents` mirrors between `schema.sql` and `Resident.ensureTable()`** — intentional per the comment; the redundancy is real but bounded to two files that need to stay in sync.
- **No versioned migrations.** First real schema change hits this wall. Recommend `knex migrate` (Node-native) or `dbmate` (single-binary, works with any Node/Python setup).

## Cross-cutting

- **Config:** each backend reads `.env` from its own directory. Correct.
- **Logging:** `console.*` only. Not shipped anywhere.
- **Testing:** absent.
- **Background jobs:** none needed today.

## Target architecture, once refactor lands

Same shape, just filled in:

```
felonious/
├── backend-node/
│   ├── src/
│   │   ├── app.js            ← was index.js; test-friendly (exports app)
│   │   ├── server.js         ← .listen bootstrap only
│   │   ├── config/{db,env}.js
│   │   ├── middleware/{auth, rateLimit, helmet, cors, errorHandler}.js
│   │   ├── routes/           ← same
│   │   ├── controllers/      ← same
│   │   ├── models/           ← BaseModel + specifics
│   │   ├── services/         ← e.g. anthropic.js, prompts/clerk.md
│   │   └── envelope.js       ← shared response shaper
│   └── test/                 ← supertest + vitest
├── backend-flask/            ← unchanged (archival)
├── frontend/
│   └── src/services/api.js   ← axios wrapper + interceptor for auth
├── database/
│   ├── migrations/           ← knex/dbmate migrations
│   ├── seed.js               ← existing
│   └── schema.sql            ← generated by dumping migrations for reference
└── ops/
    ├── Dockerfile.node
    ├── Dockerfile.flask
    └── runbook.md
```

## Verdict

The architecture is above scaffold quality. The two things worth doing:

1. **Extract an `envelope` helper** so the `{success, data, error}` shape is one function call, not five lines at every controller exit.
2. **Move to versioned migrations** before the first real schema change.

Everything else — Docker, helmet, ratelimit-redis, envelope helper, envelope tests — is the standard-issue production-readiness ramp captured in the refactor plan.
