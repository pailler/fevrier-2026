# Dockerfile pour prompt-generator
FROM node:20-alpine AS base

# Installer les dépendances nécessaires
RUN apk add --no-cache libc6-compat curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY package-lock.json* ./

# Installer toutes les dépendances
# Utiliser npm ci si package-lock.json existe, sinon npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

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

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le build
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/package.json ./package.json

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage - Next.js standalone crée un server.js dans le dossier standalone
CMD ["node", "server.js"]


