# Frontend Replatform Plan: Next.js + shadcn/ui (apps/web)

## Goal
Treat the current Jekyll frontend as legacy for marketing continuity, and re‑implement the primary experiences with a modern, clean UX using Next.js + Tailwind v4 + shadcn/ui under `apps/web`, deploying statically on Netlify.

## Scope (Phase 1)
- Coaching page: modern listing, search/filter, coach profiles, clear CTAs
- Resume/LinkedIn Makeover page: focused landing with pricing and trust
- Blog index page: modern grid + detail route (static)

## Deployment
- Netlify separate site for `apps/web` (monorepo). No SSR required.
- Build: `npm run build` (Next 15 SSG). Plugin: `@netlify/plugin-nextjs`.
- Output: static assets served by Netlify CDN.

## Data strategy
- Phase 1 (retain): Reuse Jekyll data as the source of truth
  - `_data/*.yml` (e.g., coaches, companies, specialties, pricing)
  - `_posts/**/*.md` for blog entries
- Access pattern: build‑time loaders in Next (SSG) read these files directly from the monorepo.
  - Implement utilities in `apps/web/lib/data/`:
    - `loadCoaches.ts`: read `_data/coaches.yml`, resolve company icons, pricing
    - `loadTaxonomies.ts`: read roles, specialties, companies, pricing
    - `loadPosts.ts`: read `_posts/**/*.md`, parse frontmatter + excerpt
  - Libraries: `js-yaml`, `gray-matter` (dev-only, run in `getStaticProps`/`generateStaticParams`)
- Phase 2 (migrate): Optionally extract to a shared package or headless CMS. Defer until UX is live.

## Routing (apps/web)
- `/coaching`: coaches grid with filters; links to static profile routes (optional v2)
- `/resume` (alias `/services/linkedin-makeover` for continuity via redirect): makeover landing + pricing
- `/blog` and `/blog/[slug]`: blog index and posts (static)

## Cutover plan
- Launch `apps/web` on a subdomain (e.g., `app.techinterview.coach`) for A/B and gradual traffic.
- Preserve Jekyll pages; add cross‑links to the new experiences.
- When metrics win, 301 selected routes from Jekyll to Next.

## Netlify configuration (apps/web)
- `apps/web/netlify.toml` (sample)
  - build: `next build`
  - plugin: `@netlify/plugin-nextjs`
  - node: 20
- Monorepo: configure Netlify to use `apps/web` as base directory.

## UX foundations
- Tailwind v4 tokens with sky primary; shadcn/ui components; subtle motion and focus states
- Lightweight filters (no heavy carousels); mobile‑first; accessible semantics

## Risks & mitigations
- Cross‑repo file access: Next SSG reading from root. Mitigate with monorepo build and explicit relative paths; if CI sandbox limits, copy data during build.
- Divergence between Jekyll and Next content: single source of truth remains `_data` and `_posts` until migration.

## Next steps
1. Implement `apps/web/lib/data/*` loaders and types
2. Scaffold `/coaching`, `/resume`, `/blog` routes with SSG
3. Add Netlify site for `apps/web` and a temporary subdomain
4. A/B test homepage and coaching funnels; iterate components
