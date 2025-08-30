# Dockerfile pour iahome.fr - Production
FROM node:20-alpine AS base

# Installer les dépendances nécessaires
RUN apk add --no-cache libc6-compat curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm ci

# Copier les fichiers d'environnement pour le build
COPY env.production.local ./.env.production
COPY env.production.local ./.env.local

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Image de production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

    # Installer curl pour healthcheck (wget non disponible)
    RUN apk add --no-cache curl

# Copier les variables d'environnement
COPY --from=base /app/.env.production ./
COPY --from=base /app/.env.local ./

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/package.json ./package.json

# S'assurer que tous les fichiers statiques sont copiés
RUN ls -la ./.next/static || echo "Static files not found"

# Créer le dossier logs
RUN mkdir -p /app/logs

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"] 