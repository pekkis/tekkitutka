FROM node:24-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN npm i -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
RUN pnpm install --frozen-lockfile

# --- Migrator ---
FROM base AS migrator
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY packages/api/src/db ./packages/api/src/db
COPY packages/api/package.json packages/api/tsconfig.json ./packages/api/

WORKDIR /app/packages/api
CMD ["./node_modules/.bin/tsx", "src/db/migrate.ts"]

# --- Production ---
FROM base AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY packages/api/ ./packages/api/

WORKDIR /app/packages/api

ENV NODE_ENV=production

EXPOSE 3001
ENV PORT=3001

CMD ["./node_modules/.bin/tsx", "src/index.ts"]
