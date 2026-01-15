# Dockerfile pour iahome.fr - Production
#
# IMPORTANT:
# Sur cette machine, `next build` dans Docker a parfois des erreurs de type EOF.
# On utilise donc un build Next.js **pré-généré sur l'hôte** (le dossier `.next/`),
# puis on construit une image runtime légère autour.

FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat curl
WORKDIR /app

COPY package*.json ./
# Dépendances runtime (Next est nécessaire pour `next start`)
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# curl pour healthcheck
RUN apk add --no-cache curl

# Variables d'environnement
COPY env.production.local ./.env.production
COPY env.production.local ./.env.local

# Dépendances + app buildée
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY public ./public
COPY .next ./.next

# S'assurer que tous les fichiers statiques sont copiés
RUN ls -la ./.next/static || echo "Static files not found"

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Créer le dossier logs
RUN mkdir -p /app/logs

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
