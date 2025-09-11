FROM python:3.11-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    imagemagick \
    libreoffice \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Créer les dossiers nécessaires
RUN mkdir -p uploads downloads

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["python", "converter_app.py"]