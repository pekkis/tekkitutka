# Project Guidelines

## Overview

Tekkitutka is a tech radar application built with Next.js App Router. It visualizes technology adoption across quadrants and rings using D3-based SVG charts, backed by PostgreSQL via Kysely.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 6
- Kysely + `kysely-codegen` for database access (PostgreSQL)
- D3 for radar chart visualization
- CSS Modules for styling
- pnpm as package manager

## Architecture

- **Server components** for data fetching — async components call service functions directly
- **Client components** (`"use client"`) only for interactive UI (forms, D3 chart)
- **`react.cache()`** for request deduplication across `generateMetadata` and page rendering
- **Server actions** defined in page files and passed as props to client components
- **Service layer** in `src/services/` handles all database access — never call Kysely directly from components
- Path alias: `@/*` maps to `./src/*`

## File Organization

- `src/app/` — pages and co-located route-specific components (`.tsx` + `.module.css`)
- `src/components/` — shared components
- `src/services/` — data access and business logic
- `docs/` — database schema
- `scripts/` — one-off data scripts

## Code Conventions

- Default exports for all components
- `FC` type from React for component typing
- Namespace imports for services: `import * as radars from "@/services/radar"`
- CSS Modules with logical properties (`margin-block`, `padding-inline`) and CSS nesting
- Ramda for functional utilities, Luxon for date formatting

## Build & Dev

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint (next/core-web-vitals + next/typescript)
pnpm kysely-codegen  # Regenerate DB types after schema changes
```

## Environment

Quadrant and ring labels are stored in the database (`quadrant` and `ring` tables) and fetched via the labels service.
