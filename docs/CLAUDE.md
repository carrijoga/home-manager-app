# docs/CLAUDE.md

## Files in this directory

| File | Purpose |
|------|---------|
| `api.json` | **Source of truth** for all API endpoints and response shapes (~70KB). Update schemas in `src/schemas/` whenever this changes. |
| `ENVIRONMENTS.md` | Environment variable reference, multi-env execution scripts (`dev:staging`, `build:production`), and data mode guide (`mock` vs `api`). |
| `DEPLOY.md` | Step-by-step deployment guides for Vercel, Netlify, Docker, and production PWA setup. |
| `DESIGN.md` | UI/UX design rationale, form guidelines, animation policies, and visual style notes. |
| `ROADMAP.md` | Completed feature checklist, TypeScript migration progress, and future project milestones. |
| `payment-card-frontend-prompt.md` | Technical specifications prompt for credit card module migration and integration. |

## api.json

This is the OpenAPI/JSON spec exported from the backend. When working on a feature:
1. Check `api.json` for the exact endpoint path, method, request body, and response shape.
2. If the spec conflicts with what the live API returns, trust the live API and update `api.json` to match.
3. Zod schemas in `src/schemas/` must mirror the shapes defined here — keep them in sync.

Do not hand-edit `api.json` unless you are correcting a discrepancy with the live backend. It is regenerated from the backend project.

## DESIGN.md

Contains design rationale and visual decisions specific to Ninho. Consult it when making UI changes to stay consistent with the intended look and feel. It is not auto-generated — update it when significant design decisions are made.
