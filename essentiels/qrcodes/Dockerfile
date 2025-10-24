FROM python:3.9-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY requirements.txt .
COPY config.env .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Créer le dossier de logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 7005

# Commande de démarrage
CMD ["python", "qr_server_simple.py"]