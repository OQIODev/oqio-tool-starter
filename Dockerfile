# Build standalone Next.js — cible Coolify / Hetzner.
# Requiert `output: "standalone"` dans next.config.ts.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# CLI de migration, dans son propre arbre de dépendances.
#
# Le build standalone ne trace que le client Prisma — le CLI est une
# devDependency, absente de l'image. Et le picorer depuis node_modules ne marche
# pas : ses dépendances transitives (dont `effect`, via @prisma/config)
# manqueraient à l'appel. On lui installe donc un arbre propre, réduit à
# `prisma` + `dotenv`, aux versions exactes du lockfile pour qu'il ne dérive
# jamais de celles du projet.
FROM node:22-alpine AS migrator
WORKDIR /migrator
COPY package-lock.json ./
RUN PRISMA_V=$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version") \
 && DOTENV_V=$(node -p "require('./package-lock.json').packages['node_modules/dotenv'].version") \
 && rm package-lock.json \
 && npm init -y > /dev/null \
 && npm i --no-audit --no-fund "prisma@$PRISMA_V" "dotenv@$DOTENV_V"

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Tout ce qui sert aux migrations vit dans /app/migrate, à l'écart du
# node_modules tracé de l'app — aucune collision possible entre les deux arbres.
COPY --from=migrator /migrator/node_modules ./migrate/node_modules
COPY --from=builder /app/prisma ./migrate/prisma
COPY --from=builder /app/prisma.config.ts ./migrate/prisma.config.ts

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
