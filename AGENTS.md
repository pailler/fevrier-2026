# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview

This is a **Next.js 15 monolith** (the IAHome portal at `iahome.fr`) that acts as a gateway/dashboard for multiple AI-powered microservices. The main app runs on port 3000. All companion microservices (Whisper, PDF, MeTube, etc.) are Docker-based and optional for local development.

### Development Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Start (prod) | `npm start` |

### Environment Variables

The app requires a `.env.local` file at the root with:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — hardcoded fallbacks exist in `src/utils/supabaseService.ts`, so the app will start without these
- `STRIPE_SECRET_KEY` — required for build and Stripe API routes (use `sk_test_...` placeholder for build-only)
- `OPENAI_API_KEY` — required for build (AI detector routes initialize eagerly)
- `RESEND_API_KEY` — required for build (email service initializes eagerly)

For dev server (`npm run dev`), pages compile on-demand so missing keys only cause errors when those specific API routes are hit.

### Build Gotcha

`next build` will fail without `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, and `RESEND_API_KEY` because several API routes initialize these SDKs at module scope. Placeholder values (e.g. `sk_test_placeholder_for_build`) are sufficient to pass the build step.

### Linting

ESLint is configured via `eslint.config.mjs` (flat config) using `eslint-config-next`. The codebase currently has ~2200 pre-existing lint errors (mostly `@typescript-eslint/no-explicit-any` and unused vars). The `lint` script runs: `eslint --ext .js,.jsx,.ts,.tsx src`.

### External Services (cloud-hosted, not local)

- **Supabase** (auth, DB, storage) — cloud instance at `xemtoyzcihmncbrlsmhr.supabase.co`
- **Stripe** — payment processing
- **OpenAI** — AI features
- **Resend** — transactional emails

### Package Manager

Uses **npm** (lockfile: `package-lock.json`). Node.js 20 is required (matches production Dockerfile).
