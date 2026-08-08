# 08 — Fixed Project Structure

Target layout after Phases A–E of [07-refactor-plan.md](./07-refactor-plan.md). Nothing that exists today is deleted (except the three broken workflows, done this pass).

```
felonious/
│
├── package.json                    ← workspaces root; existing
├── package-lock.json               ← existing
├── README.md                       ← human onboarding
├── CLAUDE.md                       ← AI context (existing)
├── AGENTS.md                       ← AI naming conventions (existing)
├── SECURITY.md                     ← existing
├── LICENSE                         ← add
├── .gitignore                      ← POSIX paths (fixed this pass)
├── .editorconfig                   ← add
│
├── backend-node/
│   ├── package.json
│   ├── src/
│   │   ├── app.js                  ← Express instance (was index.js)
│   │   ├── server.js               ← .listen bootstrap
│   │   ├── envelope.js             ← added (Phase C1)
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js              ← centralised env-var check (Phase B5)
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rateLimit.js        ← real one via express-rate-limit
│   │   │   ├── helmet.js           ← wraps helmet with app CSP
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── kits.js
│   │   │   ├── connects.js
│   │   │   ├── items.js
│   │   │   ├── assistant.js
│   │   │   └── integrations.js
│   │   │
│   │   ├── controllers/            (unchanged)
│   │   │
│   │   ├── models/
│   │   │   ├── BaseModel.js        ← optional (Phase C5)
│   │   │   ├── Resident.js
│   │   │   ├── Kit.js
│   │   │   ├── Connect.js
│   │   │   └── Item.js
│   │   │
│   │   └── services/
│   │       ├── anthropic.js
│   │       └── prompts/
│   │           └── clerk.md
│   │
│   ├── test/                       ← added (Phase A4)
│   │   ├── auth.test.js
│   │   ├── kits.test.js
│   │   ├── connects.test.js
│   │   └── assistant.test.js
│   │
│   ├── pages/                      ← existing (integrations static)
│   ├── public/                     ← frontend build output
│   ├── .env.example
│   └── .eslintrc.mjs               ← added (Phase A3)
│
├── backend-flask/
│   ├── app.py                      ← FLASK_DEBUG-aware (Phase A2)
│   ├── debug_logging.py            ← still there; consider gating on FLASK_DEBUG
│   ├── config/db.py
│   ├── models/item.py
│   ├── controllers/item_controller.py
│   ├── routes/items.py
│   ├── requirements.txt
│   ├── requirements-dev.txt        ← added (ruff, pytest, pip-audit)
│   ├── tests/                      ← added (Phase A4)
│   │   └── test_health.py
│   └── .env.example                ← FLASK_DEBUG added
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── context/AuthContext.jsx     ← audited for token storage (Phase B6)
│       ├── components/{Navbar,StatusBadge}.jsx
│       ├── pages/                      ← existing
│       ├── services/                   ← added
│       │   ├── api.js                  ← axios wrapper + auth interceptor
│       │   ├── auth.js
│       │   ├── kits.js
│       │   ├── connects.js
│       │   └── clerk.js
│       └── test/
│           └── smoke.test.jsx
│
├── database/
│   ├── schema.sql                  ← generated from migrations (or kept as reference)
│   ├── seed.js                     ← existing
│   └── migrations/                 ← added (Phase D1)
│       └── 20260802_initial.js
│
├── ops/                            ← added
│   ├── Dockerfile.node
│   ├── Dockerfile.flask
│   ├── .dockerignore
│   ├── fly.toml   (or render.yaml)
│   └── runbook.md
│
├── docs/
│   ├── DEPLOY.md                   ← added
│   ├── PRIVACY.md                  ← added (data model + right-to-be-forgotten)
│   └── ONBOARDING.md               ← added
│
└── .github/
    ├── workflows/
    │   ├── codeql.yml              ← existing
    │   ├── defender-for-devops.yml ← existing
    │   ├── node.js.yml             ← existing, tests actually run once A4 lands
    │   ├── ci-flask.yml            ← added: pytest + pip-audit
    │   └── docker-build.yml        ← added (Phase E1)
    ├── dependabot.yml              ← existing; verified per Phase A5
    └── instructions/
        └── codacy.instructions.md  ← existing, correctly gitignored
```

## Explicit call-outs

- **`backend-node/index.js` moves to `src/app.js` + `src/server.js`.** The compat symlink `backend-node/index.js` requires `./src/server.js` so existing `npm start` scripts keep working.
- **`schema.sql` becomes generated** once knex migrations are in place. Until then, keep hand-edited.
- **Three deleted CI workflows** (this pass) do not reappear.
- **`.env` files stay gitignored.**
- **The Flask backend's shape doesn't change** — just gains a `FLASK_DEBUG`-aware `app.run`, a real `requirements-dev.txt`, and a `tests/` folder.

## Sibling parity

Once this structure lands, the repo will look like:

- **`ConvictCode/`** — same layered pattern in the Flask side.
- **`ImpactConnect-main/`** — same three-tier shape (React + Express + DB) but Drizzle instead of raw mysql2.

Different from:
- **`new-horizon-platform/`** — Supabase-native, no Express backend.
- **`NewHorizon_Android/`** — mobile app; different stack.
