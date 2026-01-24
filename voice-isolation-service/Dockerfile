FROM python:3.11-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier les scripts de patch
COPY patch_gradio_client.py .
COPY patch_gradio_early.py .

# Appliquer le patch au build (optionnel, le patch sera aussi appliqué au runtime)
RUN python patch_gradio_client.py || true

# Copier le code de l'application
COPY app.py .

# Créer les dossiers nécessaires
RUN mkdir -p /app/uploads /app/outputs

# Exposer le port Gradio
EXPOSE 7860

# Variables d'environnement
ENV GRADIO_SERVER_NAME=0.0.0.0
ENV GRADIO_SERVER_PORT=7860

# Lancer l'application
CMD ["python", "app.py"]
