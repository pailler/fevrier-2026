FROM python:3.9-alpine

# Installer les dépendances système
RUN apk add --no-cache gcc musl-dev libffi-dev curl postgresql-dev

# Installer les packages Python
RUN pip install --no-cache-dir flask flask-cors qrcode[pil] pillow psycopg2-binary

# Créer le répertoire de travail
WORKDIR /app

# Copier le code source
COPY qr_service.py .

# Créer le dossier pour les QR codes
RUN mkdir -p /app/qr_codes

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["python", "qr_service.py"]
