# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**Felonious** is a resource and community-building platform for people leaving incarceration ("For those fresh out. Link up. Get your kit. Stay up."). It exposes:

- **Resource Kits** — curated assistance programs by category (housing, jobs, mental_health, legal, general) and location
- **Connects** — short profiles that let recently-released folks find peers in their area
- **Items** — generic resource items served by both backends (`/api/items`)

The repo intentionally keeps **two parallel backend implementations** (Flask and Node/Express) over the same MySQL schema as a learning/comparison artifact.

## Stack

| Layer        | Technology                                            |
|--------------|-------------------------------------------------------|
| Frontend     | React 18 + Vite 8 + React Router v6                   |
| Backend (1)  | Python + Flask + Flask-CORS (`backend-flask/`)        |
| Backend (2)  | Node.js + Express 4 + CORS (`backend-node/`)          |
| Database     | MySQL 8+ (shared schema in `database/schema.sql`)     |
| Tooling      | npm (frontend, Node backend) + pip (Flask backend)    |

## Repo layout

```
felonious/
├── backend-flask/                # Python implementation
│   ├── app.py                    # Flask app, route registration
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/db.py              # MySQL connection
│   ├── models/item.py
│   ├── controllers/item_controller.py
│   └── routes/                   # /api/items endpoints
│
├── backend-node/                 # Node implementation
│   ├── index.js                  # Express app, middleware, routes
│   ├── package.json              # scripts: start (node), dev (nodemon)
│   ├── .env.example
│   ├── config/db.js              # promise-based mysql2 pool
│   ├── models/                   # Kit.js, Connect.js, Item.js
│   ├── controllers/              # kitController.js, connectController.js, itemController.js
│   └── routes/                   # /api/kits, /api/connects, /api/items
│
├── frontend/                     # React + Vite SPA
│   ├── index.html
│   ├── vite.config.js            # proxies /api → http://localhost:5000 (Flask)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # React Router setup
│       ├── pages/                # Home.jsx, Kits.jsx, Connects.jsx
│       ├── components/
│       └── services/             # kitService, connectService, …
│
├── database/
│   └── schema.sql                # MySQL DDL + seed data (kits, connects)
│
└── .github/workflows/codeql.yml  # CodeQL on push/PR to master + weekly schedule
```

## Commands

### Database

```bash
mysql -u root -p < database/schema.sql
```

### Flask backend (listens on `http://localhost:5000`)

```bash
cd backend-flask
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # set DB_HOST, DB_USER, DB_PASS, DB_NAME
python app.py              # debug=True
```

### Node backend (listens on `http://localhost:5001` by default)

```bash
cd backend-node
npm install
cp .env.example .env       # set DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT
npm run dev                # nodemon
# or: npm start            # production
```

### Frontend (Vite dev server on `http://localhost:5173`)

```bash
cd frontend
npm install
npm run dev                # proxies /api to Flask (port 5000)
npm run build              # → dist/
npm run preview
npm run lint               # ESLint
```

To target the Node backend instead, edit the proxy target in `frontend/vite.config.js` to `http://localhost:5001`.

## Environment

Each backend reads `.env` from its own directory.

**`backend-flask/.env`**: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`  
**`backend-node/.env`**: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `PORT`

`.env` files are gitignored — never commit them.

## API surface

Both backends agree on:

- `GET /api/health` — liveness probe
- **Kits** (Node backend): `GET /api/kits`, `GET /api/kits/:id`, `POST /api/kits`, `PUT /api/kits/:id`, `DELETE /api/kits/:id`
- **Connects** (Node backend): `GET /api/connects`, `GET /api/connects/:id`, `POST /api/connects`, `PUT /api/connects/:id`, `DELETE /api/connects/:id`
- **Items** (both backends): `GET /api/items`

Whichever backend you implement a feature against first, mirror it in the other so the two stay in parity. The schema in `database/schema.sql` is the single source of truth — change it there before changing models.

## Database schema (highlights)

- **`kits`** — `id`, `title`, `category` (ENUM: housing/jobs/mental_health/legal/general), `location`, `description`, `url`, timestamps
- **`connects`** — `id`, `handle`, `location`, `released_date` (DATE), `bio` (TEXT), `contact`, timestamps

## Conventions

- The Vite proxy points at Flask (port 5000). If you switch the active backend to Node, update `vite.config.js` in the same change so the frontend keeps working.
- Keep route handlers thin — push business logic into the `models/`/`controllers/` layer of whichever backend you're touching.
- Use parameterized queries on both sides; never string-concatenate SQL.
- 2-space indent across the JS/JSX code; PEP 8 for Python.
- When adding a new resource type, change it in this order: `database/schema.sql` → backend models/controllers (both stacks) → backend routes → frontend service → frontend page.

## CI

`.github/workflows/codeql.yml` runs CodeQL analysis (Python + JavaScript/TypeScript, auto-detected) on push and PR to `master`, plus a weekly Tuesday schedule. Results land in the GitHub Security tab. The manual build step is commented out — re-enable if CodeQL fails to auto-build.
