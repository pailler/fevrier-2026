# Dockerfile pour DragGAN
FROM python:3.10-slim

# Définir les variables d'environnement
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    libgl1 \
    libglx-mesa0 \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Cloner DragGAN depuis GitHub
RUN git clone https://github.com/XingangPan/DragGAN.git /app/draggan_repo

# Copier les fichiers de l'application
COPY app.py .
COPY utils.py .
COPY config.py .

# Créer les répertoires nécessaires
RUN mkdir -p /app/models /app/outputs /app/uploads /app/cache

# Créer un fichier README pour les modèles
RUN echo "# Modèles DragGAN\n\nPlacez vos modèles .pkl dans ce répertoire.\n\nModèles disponibles:\n- ffhq.pkl (portraits)\n- lsun_car.pkl (voitures)\n- lsun_cat.pkl (chats)\n- lsun_church.pkl (bâtiments)" > /app/models/README.md

# Exposer le port
EXPOSE 7860

# Commande de démarrage
CMD ["python", "app.py"]
