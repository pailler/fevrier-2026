# Dockerfile pour l'application de recherche immobilière
FROM node:20-alpine AS base

# Installer les dépendances nécessaires
RUN apk add --no-cache libc6-compat curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Copier les fichiers d'environnement pour le build (optionnel, peut être absent)
COPY .env.production ./.env.production 2>/dev/null || true
COPY .env.production ./.env.local 2>/dev/null || true

# Définir les variables d'environnement comme ARG pour qu'elles soient disponibles au build time
ARG NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M

# Convertir les ARG en ENV pour qu'elles soient disponibles pendant le build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Image de production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Installer curl pour healthcheck
RUN apk add --no-cache curl

# Copier les variables d'environnement
COPY --from=base /app/.env.production ./ 2>/dev/null || true
COPY --from=base /app/.env.local ./ 2>/dev/null || true

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

# Créer le dossier logs
RUN mkdir -p /app/logs

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage
CMD ["npm", "start"]
