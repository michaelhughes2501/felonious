# AGENTS.md

## Product Direction

Felonious is a secure, supervised digital platform for monitored reconnection between people who shared confinement experiences. The app may use institution-inspired user-facing nomenclature, but the implementation must remain clinical, neutral, and rehabilitation-focused.

## Terminology Rules

Use the prison-facing terms only in UI copy where specified. Backend routes, database columns, logs, and compliance-sensitive code should use neutral technical terminology.

| UI Term | Neutral Term | Use |
| --- | --- | --- |
| The Yard | Community Hub | Main landing and discovery surface |
| Kites | Messages / Communications | Private messaging |
| My Cell | User Profile / Personal Space | Resident profile and settings |
| Block | Group / Cohort | Group chat or interest community |
| Roll Call | Daily Check-in | Daily status confirmation |
| Commissary | Resource Center | Resource library |
| Good Time | Positive Behavior Credits | Positive engagement points |
| SHU | Restricted Status | Temporary restricted access |
| PO | Case Manager / Supervisor | Assigned oversight contact |
| Release Date | Program Completion | Transition or program milestone date |
| Cellmate | Connection / Peer | Matched or connected peer |
| Chow Hall | Group Discussion Forum | Public discussions |
| Work Detail | Employment Resources | Job and training resources |
| Law Library | Legal Resources | Legal aid and documentation |
| Visitation | Scheduled Video Call | Supervised video communication |
| Contraband | Prohibited Content | Flagged or blocked material |
| Report | Anonymous Reporter | Reporting mechanism |
| Crew | Affiliation Group | User-defined interest/background group |
| Shakedown | Content Audit | Automated or manual content review |
| Commissary List | Resource Wishlist | Saved resources or goals |
| Tier | Privilege Level | Access level |
| Lockdown | Emergency Suspension | Platform-wide or user-specific halt |
| Rec Yard | Wellness Activities | Wellness and mental health modules |
| Mail Room | Moderation Queue | Pending message review |
| Badge | Role Identifier | Role/status indicator |
| Warden | Platform Administrator | Super-admin |
| Captain | Moderation Lead | Moderation supervisor |
| CO | Monitor / Observer | Read-only supervision account |
| Resident | Participant / Member | End user; never use "Inmate" in UI |
| Program | Program Duration | Enrollment duration |
| Unit | Cohort Grouping | Administrative grouping |
| The Clerk | Conversational Assistant | AI assistant for navigation, Kites, resource finding, and event reminders |

## Tone

- User-facing copy must be dignified, empowering, and community-oriented.
- Clinical/admin copy must be neutral and professional.
- Avoid punitive language, dehumanizing terms, and glorification of incarceration.
- Do not use "inmate" in UI. Use "Resident."

## Current Architecture

- `frontend/`: React + Vite user interface.
- `backend-node/`: Node/Express API currently serving `/api/kits` and `/api/connects`.
- `backend-flask/`: Flask API scaffold, currently less complete than Node.
- `database/schema.sql`: MySQL schema.

The current frontend proxy points to Node on port `5001` because the active resource and connection routes live there.

## API Shape Target

Move new API work toward this response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  },
  "error": null
}
```

## Security Direction

- Keep `.env` files out of git.
- Treat all messaging, profile, and moderation data as sensitive.
- Staff roles should follow RBAC: Resident, PO, CO, Captain, Warden.
- User-facing supervision transparency is required for future messaging and video features.
- Add tests before expanding safety-critical moderation, matching, or risk-scoring behavior.
- The Clerk may help draft messages and summarize events, but must not provide therapy, legal advice, or emergency intervention.
