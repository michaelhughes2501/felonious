# Security Policy

Felonious is intended to handle sensitive resident, supervision, communication, and resource data. Treat all security issues as high priority.

## Supported Versions

The project is pre-release. Security fixes should target the default branch until versioned releases are introduced.

| Version | Supported |
| --- | --- |
| `master` | Yes |

## Reporting a Vulnerability

Do not open public issues for vulnerabilities involving authentication, authorization, private communications, moderation bypasses, resident data exposure, or dependency exploits.

Report privately to the repository owner. Include:

- A clear summary of the issue.
- Steps to reproduce.
- Affected files, routes, or dependencies.
- Any known impact on resident, staff, or moderation data.

## Security Baseline

- Never commit `.env` files, tokens, database credentials, or API keys.
- Keep database fields and logs clinically neutral.
- Use role-based access controls for Resident, PO, CO, Captain, and Warden workflows.
- Log moderation and administrative actions with enough context for audit review.
- Add tests for authorization, moderation, and safety-sensitive behavior before shipping those modules.
