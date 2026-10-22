# syntax=docker/dockerfile:1
# ==============================================================================
# NODE.47 — image de production multi-étapes
#
#   build  : bun (rapide, verrou bun.lock) — next build en mode standalone
#   runtime: node:24-bookworm-slim (glibc, compatible moteurs Prisma linux-gnu)
#
#   La base SQLite vit dans /app/db (volume Docker) — jamais dans l'image.
#   Toutes les pages lisant la base sont force-dynamic : aucune requête au build.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Dépendances — couche reconstruite uniquement quand package.json/bun.lock changent
# ------------------------------------------------------------------------------
FROM oven/bun:1.3-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ------------------------------------------------------------------------------
# 2. Build — prisma generate + next build (standalone)
# ------------------------------------------------------------------------------
FROM oven/bun:1.3-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# URL factice au build : NEXT_PUBLIC_* peut être inliné côté client.
# La valeur réelle de production est fournie au runtime (compose / VPS).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Aucune page n'interroge la base au build (force-dynamic) — URL de repli suffisante
ENV DATABASE_URL=file:/tmp/build-placeholder.db

RUN bunx prisma generate && bun run build

# ------------------------------------------------------------------------------
# 3. Runtime — serveur standalone + volume base de données
# ------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Sortie standalone : server.js + node_modules tracés + .next/static + public
# (le script build du projet a déjà copié static et public dans standalone)
COPY --from=builder --chown=node:node /app/.next/standalone ./

# Schéma Prisma embarqué pour référence / accès `prisma db push` en conteneur
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Base SQLite sur volume persistant, monté depuis l'hôte (./db:/app/db)
RUN mkdir -p /app/db && chown -R node:node /app/db
VOLUME ["/app/db"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
