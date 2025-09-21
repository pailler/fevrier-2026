FROM python:3.11-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY librespeed_service.py .

# Créer un utilisateur non-root
RUN useradd -m -u 1000 librespeed && chown -R librespeed:librespeed /app
USER librespeed

# Exposer le port
EXPOSE 7006

# Commande de démarrage
CMD ["python", "librespeed_service.py"]


