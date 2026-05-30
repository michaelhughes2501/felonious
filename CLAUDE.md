# Felonious Project Guide

## Commands

Install and run the active Node API:

```powershell
cd C:\Users\MadMike\projects\felonious\backend-node
copy .env.example .env
npm install
npm run dev
```

Install and run the React frontend:

```powershell
cd C:\Users\MadMike\projects\felonious\frontend
npm install
npm run dev
```

Seed MySQL:

```powershell
cd C:\Users\MadMike\projects\felonious
mysql -u root -p < database\schema.sql
```

Run a production frontend build:

```powershell
cd C:\Users\MadMike\projects\felonious\frontend
npm run build
```

Push changes:

```powershell
cd C:\Users\MadMike\projects\felonious
git status
git add .
git commit -m "Describe the change"
git push
```

If `gh` is not on PATH, use:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth status
```

## Important Local Detail

`frontend/vite.config.js` proxies `/api` to `http://localhost:5001`, because the Node backend currently implements the `kits` and `connects` endpoints. Flask is scaffolded, but it is not the active API for the current UI.

## Naming

UI copy follows `AGENTS.md`:

- Community hub: "The Yard"
- Resource center: "Commissary"
- Employment resources: "Work Detail"
- Wellness resources: "Rec Yard"
- Legal resources: "Law Library"
- Peer connection: "Cellmate"
- End user: "Resident"
- AI assistant: "The Clerk"

Code and database fields should stay neutral for compliance.

## The Clerk

The current assistant implementation is local and deterministic:

- Backend route: `backend-node/routes/assistant.js`
- Backend controller: `backend-node/controllers/assistantController.js`
- Frontend page: `frontend/src/pages/Clerk.jsx`
- Frontend service: `frontend/src/services/assistantService.js`

It supports event reminders and Kite drafting. Wire a real model provider behind the controller later without changing the frontend contract.
