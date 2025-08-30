#!/usr/bin/env python3
"""
Configuration pour DragGAN
Paramètres et constantes pour l'application
"""

import os
from typing import Dict, Any

# Configuration de base
APP_NAME = "DragGAN"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Édition d'images par IA avec DragGAN"

# Chemins des répertoires
BASE_DIR = "/app"
MODELS_DIR = os.path.join(BASE_DIR, "models")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
CACHE_DIR = os.path.join(BASE_DIR, "cache")

# Configuration du serveur
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 7860
DEBUG_MODE = True

# Configuration Gradio
GRADIO_CONFIG = {
    "server_name": SERVER_HOST,
    "server_port": SERVER_PORT,
    "share": False,
    "debug": DEBUG_MODE,
    "show_error": True,
    "analytics_enabled": False
}

# Configuration des modèles
MODEL_CONFIG = {
    "default_model": "ffhq",
    "supported_formats": [".pkl", ".pt", ".pth", ".ckpt"],
    "model_download_url": "https://github.com/XingangPan/DragGAN/releases/download/v1.0/DragGAN_v1.0.zip",
    "model_cache_dir": os.path.join(CACHE_DIR, "models")
}

# Configuration du traitement d'images
IMAGE_CONFIG = {
    "max_size": (1024, 1024),
    "min_size": (256, 256),
    "supported_formats": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"],
    "default_format": "png",
    "quality": 95,
    "compression": 9
}

# Configuration DragGAN
DRAGGAN_CONFIG = {
    "max_points": 20,
    "min_points": 2,
    "point_radius": 10,
    "mask_radius": 15,
    "iterations": 100,
    "learning_rate": 0.01,
    "momentum": 0.9,
    "weight_decay": 1e-4,
    "batch_size": 1,
    "device": "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
}

# Configuration de sécurité
SECURITY_CONFIG = {
    "max_file_size": 50 * 1024 * 1024,  # 50MB
    "allowed_extensions": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"],
    "max_processing_time": 300,  # 5 minutes
    "rate_limit": 10,  # requêtes par minute
}

# Configuration des logs
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "file": os.path.join(BASE_DIR, "logs", "draggan.log"),
    "max_size": 10 * 1024 * 1024,  # 10MB
    "backup_count": 5
}

# Configuration de performance
PERFORMANCE_CONFIG = {
    "num_workers": 4,
    "prefetch_factor": 2,
    "pin_memory": True,
    "persistent_workers": True,
    "max_memory_usage": 0.8,  # 80% de la RAM disponible
}

# Configuration des exemples
EXAMPLE_CONFIG = {
    "num_examples": 3,
    "example_images": [
        {
            "name": "Portrait",
            "url": "https://via.placeholder.com/512x512/FF6B6B/FFFFFF?text=Portrait",
            "description": "Exemple de portrait pour l'édition de visage"
        },
        {
            "name": "Paysage",
            "url": "https://via.placeholder.com/512x512/4ECDC4/FFFFFF?text=Paysage",
            "description": "Exemple de paysage pour l'édition de scènes"
        },
        {
            "name": "Objet",
            "url": "https://via.placeholder.com/512x512/45B7D1/FFFFFF?text=Objet",
            "description": "Exemple d'objet pour l'édition d'objets"
        }
    ]
}

# Configuration des modèles pré-entraînés
PRETRAINED_MODELS = {
    "ffhq": {
        "name": "FFHQ",
        "description": "Modèle optimisé pour les portraits et visages",
        "file": "ffhq.pkl",
        "resolution": (512, 512),
        "category": "face"
    },
    "lsun_car": {
        "name": "LSUN Car",
        "description": "Modèle pour les voitures et véhicules",
        "file": "lsun_car.pkl",
        "resolution": (512, 512),
        "category": "vehicle"
    },
    "lsun_cat": {
        "name": "LSUN Cat",
        "description": "Modèle pour les chats et animaux",
        "file": "lsun_cat.pkl",
        "resolution": (512, 512),
        "category": "animal"
    },
    "lsun_church": {
        "name": "LSUN Church",
        "description": "Modèle pour les bâtiments et architecture",
        "file": "lsun_church.pkl",
        "resolution": (512, 512),
        "category": "building"
    }
}

# Configuration des messages d'erreur
ERROR_MESSAGES = {
    "file_too_large": "Le fichier est trop volumineux. Taille maximale: 50MB",
    "unsupported_format": "Format de fichier non supporté. Formats acceptés: JPG, PNG, BMP, TIFF",
    "processing_timeout": "Le traitement a pris trop de temps. Veuillez réessayer",
    "model_not_found": "Modèle non trouvé. Veuillez vérifier la configuration",
    "invalid_points": "Points de drag invalides. Veuillez définir au moins 2 points",
    "gpu_not_available": "GPU non disponible. Le traitement sera effectué sur CPU",
    "memory_error": "Mémoire insuffisante. Veuillez utiliser une image plus petite"
}

# Configuration des messages de succès
SUCCESS_MESSAGES = {
    "processing_complete": "Traitement terminé avec succès!",
    "model_loaded": "Modèle chargé avec succès",
    "image_saved": "Image sauvegardée avec succès",
    "cache_cleared": "Cache vidé avec succès"
}

# Configuration de l'interface utilisateur
UI_CONFIG = {
    "theme": "soft",
    "title": "DragGAN - Édition d'Images IA",
    "description": "Édition interactive d'images par IA",
    "favicon": "🎨",
    "show_tips": True,
    "auto_save": True,
    "show_progress": True
}

def get_config() -> Dict[str, Any]:
    """Obtenir la configuration complète"""
    return {
        "app": {
            "name": APP_NAME,
            "version": APP_VERSION,
            "description": APP_DESCRIPTION
        },
        "paths": {
            "base": BASE_DIR,
            "models": MODELS_DIR,
            "outputs": OUTPUTS_DIR,
            "uploads": UPLOADS_DIR,
            "cache": CACHE_DIR
        },
        "server": {
            "host": SERVER_HOST,
            "port": SERVER_PORT,
            "debug": DEBUG_MODE
        },
        "gradio": GRADIO_CONFIG,
        "models": MODEL_CONFIG,
        "images": IMAGE_CONFIG,
        "draggan": DRAGGAN_CONFIG,
        "security": SECURITY_CONFIG,
        "logging": LOGGING_CONFIG,
        "performance": PERFORMANCE_CONFIG,
        "examples": EXAMPLE_CONFIG,
        "pretrained_models": PRETRAINED_MODELS,
        "errors": ERROR_MESSAGES,
        "success": SUCCESS_MESSAGES,
        "ui": UI_CONFIG
    }

def validate_config() -> bool:
    """Valider la configuration"""
    try:
        # Vérifier les répertoires
        for path in [BASE_DIR, MODELS_DIR, OUTPUTS_DIR, UPLOADS_DIR, CACHE_DIR]:
            if not os.path.exists(path):
                os.makedirs(path, exist_ok=True)
        
        # Vérifier les paramètres critiques
        if DRAGGAN_CONFIG["max_points"] < DRAGGAN_CONFIG["min_points"]:
            return False
        
        if IMAGE_CONFIG["max_size"][0] < IMAGE_CONFIG["min_size"][0]:
            return False
        
        return True
    except Exception:
        return False
