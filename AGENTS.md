# Project Guidelines

## Overview

Tekkitutka is a tech radar application visualizing technology adoption across quadrants and rings using D3-based SVG charts, backed by PostgreSQL via Kysely. The frontend (Astro + React islands) is decoupled from a separate Hono REST API.

## Tech Stack

- **Frontend** (`apps/web`): Astro 6 (SSR via `@astrojs/node`) + React 19 islands + TypeScript 6
- **API** (`packages/api`): Hono 4 + `@hono/node-server` v2 + Kysely + PostgreSQL
- D3 for radar chart visualization
- CSS Modules for styling
- pnpm workspace monorepo
- oxlint + oxfmt for linting/formatting

## Architecture

- **Astro pages** fetch data in frontmatter (server-side) via the typed `api` client
- **React islands** (`Radar`, `RadarChart`) handle interactivity, hydrated with `client:load`
- **API client** (`apps/web/src/services/api.ts`) is the single source of types shared with the frontend
- **Hono routes** (`packages/api/src/routes/`) call services in `packages/api/src/services/`
- **Service layer** in `packages/api/src/services/` handles all database access — never call Kysely directly from routes
- Path alias: `@/*` maps to `./src/*` in the web app

## File Organization

```
apps/web/
├── astro.config.mjs
├── src/
│   ├── pages/           # File-based routing (.astro)
│   ├── layouts/         # Shared page layouts
│   ├── components/      # Astro + React components (.astro / .tsx)
│   ├── services/        # API client + D3 chart code
│   ├── styles/          # Global CSS
│   └── env.d.ts
└── public/              # Static assets

packages/api/
├── src/
│   ├── index.ts         # Hono app entrypoint
│   ├── routes/          # Hono route modules
│   ├── services/        # DB access + business logic
│   └── db/              # Migrations, seeds, generated Kysely types
```

## Code Conventions

- Default exports for components
- `import type` for type-only imports (Vite/Astro warns otherwise)
- Relative `.js` imports in API (Node ESM with `nodenext` resolution)
- CSS Modules with logical properties (`margin-block`, `padding-inline`) and CSS nesting
- Ramda for functional utilities, Luxon for date formatting

## Build & Dev

```bash
pnpm dev              # Start all packages in parallel
pnpm build            # Build all packages
pnpm lint             # Run oxlint across packages
pnpm fmt              # Format with oxfmt
pnpm fmt:check        # Check formatting

# Per-package
pnpm --filter @tekkitutka/web dev
pnpm --filter @tekkitutka/api dev
pnpm --filter @tekkitutka/api db:migrate
pnpm --filter @tekkitutka/api db:seed
```

## Docker

```bash
docker compose up                          # db + migrate + api + app
docker compose --profile seed up seed      # run seed data
```

## Environment

- `DATABASE_URL` — PostgreSQL connection string (API only)
- `PUBLIC_API_URL` — Where the frontend reaches the API (Astro `import.meta.env.PUBLIC_API_URL`)

Quadrant and ring labels are stored in the database (`quadrant` and `ring` tables) and fetched via the labels service.
