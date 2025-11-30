FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le répertoire pour les données si nécessaire
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 5001

# Commande de démarrage
CMD ["node", "server.js"]


