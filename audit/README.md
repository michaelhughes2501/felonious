# Engineering Audit — Felonious

Branch: `claude/engineering-audit-refactor-j2mphk`
Scope: Phase 1 — reports + safe fixes only. Refactor execution deferred.

## Context

Felonious is a three-part app: a React 19 + Vite 8 frontend, a Node/Express 5 backend with JWT auth and an Anthropic-powered "Clerk" assistant, and a parallel Flask backend that exposes `/api/items` and `/api/health`. Both backends target the same MySQL schema. Per `CLAUDE.md`, the Node backend is the active one; Flask is intentionally kept as a "learning/comparison artifact."

Reports focus on the active surface (Node + frontend + DB) and treat the Flask side as archival — with one exception: [02-bug-hunt.md#b4](./02-bug-hunt.md) flags a real production-danger bug in `backend-flask/app.py` regardless of activity.

## Reports

| # | File | Focus |
|---|------|-------|
| 1 | [01-deep-engineering-audit.md](./01-deep-engineering-audit.md) | Snapshot |
| 2 | [02-bug-hunt.md](./02-bug-hunt.md) | Concrete defects |
| 3 | [03-dependency-audit.md](./03-dependency-audit.md) | Versions, upgrade path |
| 4 | [04-security-review.md](./04-security-review.md) | Auth, CSRF, secrets, headers |
| 5 | [05-production-readiness.md](./05-production-readiness.md) | Deploy, observability, backup |
| 6 | [06-architecture-review.md](./06-architecture-review.md) | Layering, dual-backend, DB migration story |
| 7 | [07-refactor-plan.md](./07-refactor-plan.md) | Ordered PRs |
| 8 | [08-fixed-project-structure.md](./08-fixed-project-structure.md) | Target tree |

## Safe fixes applied in this pass

- **`.gitignore`** — replaced `.github\instructions\codacy.instructions.md` (Windows path separator, does nothing on POSIX / CI) with a POSIX path.
- **`.github/workflows/1codeql.yml`** — deleted. Literal filename typo of `codeql.yml`; identical workflow name (`CodeQL Advanced`) so both appeared under the same name in the Actions UI and both ran on every push. Two runs = double the analysis time and doubled false-positive fan-out.
- **`.github/workflows/python-package-conda.yml`** — deleted. Runs `conda env update --file environment.yml` — this repo has no `environment.yml`, so the workflow **fails on every push**. It also runs `flake8` from a conda install with no config, spraying red X's across every commit in the Actions tab. `CLAUDE.md` documents only `codeql.yml` as the intended CI, so this was a leftover template.
- **`.github/workflows/npm-publish-github-packages.yml`** — deleted. The workflow tries to `npm publish` on release. `package.json` is `"private": true` at every workspace level, so publish is not possible even if a release were created. Also a leftover template.

`.github/workflows/node.js.yml` was **kept** (it runs `npm ci && npm test`, and the workspace test script is `npm test --workspaces --if-present`, which passes because no workspace declares tests yet — a real green check).

Nothing under `backend-flask/`, `backend-node/`, `frontend/`, or `database/` was modified — no code behaviour changes.
