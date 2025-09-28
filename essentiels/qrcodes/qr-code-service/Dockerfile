FROM python:3.9-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier requirements.txt s'il existe
COPY requirements.txt* ./

# Installer les dépendances Python
RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    qrcode[pil] \
    pillow \
    psycopg2-binary \
    pyjwt \
    && rm -rf /root/.cache/pip

# Copier le code de l'application
COPY . .

# Créer le répertoire pour les QR codes
RUN mkdir -p /app/qr_codes

# Exposer le port
EXPOSE 7005

# Commande par défaut
CMD ["python", "qr_service.py"]