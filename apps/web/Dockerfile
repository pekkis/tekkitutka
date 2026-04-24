FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV npm_config_store_dir="/pnpm/store"
RUN npm i -g pnpm

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web/ ./apps/web/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm --filter @tekkitutka/web build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @tekkitutka/web deploy --prod /out

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

COPY --from=builder --chown=astro:nodejs /out/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /out/package.json ./package.json
COPY --from=builder --chown=astro:nodejs /app/apps/web/dist ./dist

USER astro

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
