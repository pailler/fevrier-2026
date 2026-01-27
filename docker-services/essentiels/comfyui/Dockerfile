# Dockerfile pour ComfyUI
# Basé sur le dépôt officiel : https://github.com/comfyanonymous/ComfyUI

FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cloner ComfyUI depuis GitHub
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /app

# Installer les dépendances Python
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
RUN pip install --no-cache-dir -r /app/requirements.txt

# Créer les dossiers nécessaires
RUN mkdir -p /app/models /app/output /app/input /app/custom_nodes

# Exposer le port
EXPOSE 8188

# Commande de démarrage
CMD ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188"]
