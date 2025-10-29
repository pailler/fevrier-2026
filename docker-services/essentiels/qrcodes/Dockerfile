FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY qr_service_clean.py .
COPY template.html .
COPY requirements.txt .

# Mettre à jour pip d'abord
RUN pip install --upgrade pip setuptools wheel

# Installer toutes les dépendances depuis requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Créer le dossier de logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 7006

# Commande de démarrage
CMD ["python", "qr_service_clean.py"]