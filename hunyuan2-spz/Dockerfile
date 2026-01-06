# Dockerfile pour Hunyuan3D-2
# Image avec support CUDA pour GPU NVIDIA

FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Variables d'environnement
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV CUDA_VISIBLE_DEVICES=0

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3-pip \
    git \
    wget \
    curl \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Créer un lien symbolique pour python et s'assurer que python3 pointe vers python3.11
RUN ln -sf /usr/bin/python3.11 /usr/bin/python && \
    ln -sf /usr/bin/python3.11 /usr/bin/python3 && \
    python --version && \
    python3 --version

# Mettre à jour pip pour python3.11
RUN python3.11 -m pip install --upgrade pip setuptools wheel

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de code
COPY code/ /app/code/
COPY tools/ /app/tools/

# Définir le répertoire de travail pour le code
WORKDIR /app/code

# Installer PyTorch avec support CUDA 12.4 (avant les autres dépendances)
# Utiliser python3.11 -m pip pour s'assurer que les packages sont installés pour Python 3.11
# CUDA 12.4 est compatible avec cu121 (rétrocompatibilité)
RUN python3.11 -m pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Installer les dépendances Python de base (pybind11, ninja pour la compilation)
RUN python3.11 -m pip install --no-cache-dir pybind11 ninja

# Installer les autres dépendances Python (en excluant msvc_runtime qui est Windows-only)
RUN grep -v "^msvc_runtime" requirements.txt | grep -v "^#" | grep -v "^$" > requirements_linux.txt && \
    python3.11 -m pip install --no-cache-dir -r requirements_linux.txt && \
    python3.11 -m pip install --no-cache-dir gradio==4.44.1 && \
    python3.11 -m pip install --no-cache-dir sentencepiece huggingface_hub accelerate && \
    python3.11 -c "import gradio; print('Gradio installed:', gradio.__version__)" || echo "Gradio installation failed"

# Installer le package hy3dgen (compilera les extensions C++ si nécessaire)
RUN python3.11 -m pip install --no-cache-dir -e . || echo "Installation avec avertissements, extensions peuvent être compilées au runtime"

# Créer le fichier d'initialisation
RUN touch hunyuan_init_done.txt

# Créer les répertoires nécessaires
RUN mkdir -p temp/current_generation gradio_cache

# Exposer le port 8888
EXPOSE 8888

# Commande par défaut - lancer Gradio
# Utiliser python3.11 explicitement pour éviter les problèmes de PATH
CMD ["python3.11", "gradio_app.py", \
     "--model_path", "tencent/Hunyuan3D-2mv", \
     "--subfolder", "hunyuan3d-dit-v2-mv-turbo", \
     "--texgen_model_path", "tencent/Hunyuan3D-2", \
     "--port", "8888", \
     "--host", "0.0.0.0", \
     "--low_vram_mode", \
     "--enable_flashvdm", \
     "--enable_t23d"]

