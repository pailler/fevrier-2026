#!/usr/bin/env python3
"""
Utilitaires pour DragGAN
Fonctions d'aide pour le traitement d'images et la gestion des modèles
"""

import os
import cv2
import numpy as np
from PIL import Image
import torch
import json
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

def load_image(image_path: str) -> np.ndarray:
    """Charger une image depuis un fichier"""
    try:
        if isinstance(image_path, str):
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Impossible de charger l'image: {image_path}")
            return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            return image_path
    except Exception as e:
        logger.error(f"Erreur lors du chargement de l'image: {e}")
        raise

def save_image(image: np.ndarray, output_path: str) -> bool:
    """Sauvegarder une image"""
    try:
        if isinstance(image, Image.Image):
            image.save(output_path)
        else:
            cv2.imwrite(output_path, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde: {e}")
        return False

def resize_image(image: np.ndarray, target_size: Tuple[int, int]) -> np.ndarray:
    """Redimensionner une image"""
    try:
        return cv2.resize(image, target_size, interpolation=cv2.INTER_LANCZOS4)
    except Exception as e:
        logger.error(f"Erreur lors du redimensionnement: {e}")
        return image

def normalize_image(image: np.ndarray) -> np.ndarray:
    """Normaliser une image (0-1)"""
    try:
        if image.dtype == np.uint8:
            return image.astype(np.float32) / 255.0
        return image
    except Exception as e:
        logger.error(f"Erreur lors de la normalisation: {e}")
        return image

def denormalize_image(image: np.ndarray) -> np.ndarray:
    """Dénormaliser une image (0-255)"""
    try:
        if image.max() <= 1.0:
            return (image * 255).astype(np.uint8)
        return image.astype(np.uint8)
    except Exception as e:
        logger.error(f"Erreur lors de la dénormalisation: {e}")
        return image

def validate_drag_points(points: List[List[int]], image_shape: Tuple[int, int]) -> bool:
    """Valider les points de drag"""
    try:
        if not points or len(points) < 2:
            return False
        
        height, width = image_shape[:2]
        
        for point in points:
            if len(point) != 2:
                return False
            x, y = point
            if x < 0 or x >= width or y < 0 or y >= height:
                return False
        
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la validation des points: {e}")
        return False

def create_mask_from_points(points: List[List[int]], image_shape: Tuple[int, int], radius: int = 10) -> np.ndarray:
    """Créer un masque à partir des points de drag"""
    try:
        height, width = image_shape[:2]
        mask = np.zeros((height, width), dtype=np.uint8)
        
        for point in points:
            x, y = point
            cv2.circle(mask, (x, y), radius, 255, -1)
        
        return mask
    except Exception as e:
        logger.error(f"Erreur lors de la création du masque: {e}")
        return np.zeros(image_shape[:2], dtype=np.uint8)

def apply_mask_to_image(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Appliquer un masque à une image"""
    try:
        if len(image.shape) == 3:
            mask_3d = np.stack([mask] * 3, axis=-1)
            return image * (mask_3d / 255.0)
        else:
            return image * (mask / 255.0)
    except Exception as e:
        logger.error(f"Erreur lors de l'application du masque: {e}")
        return image

def calculate_optical_flow(img1: np.ndarray, img2: np.ndarray) -> np.ndarray:
    """Calculer le flux optique entre deux images"""
    try:
        # Convertir en niveaux de gris
        if len(img1.shape) == 3:
            gray1 = cv2.cvtColor(img1, cv2.COLOR_RGB2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_RGB2GRAY)
        else:
            gray1, gray2 = img1, img2
        
        # Calculer le flux optique
        flow = cv2.calcOpticalFlowFarneback(
            gray1, gray2, None, 
            pyr_scale=0.5, levels=3, winsize=15, 
            iterations=3, poly_n=5, poly_sigma=1.2, 
            flags=0
        )
        
        return flow
    except Exception as e:
        logger.error(f"Erreur lors du calcul du flux optique: {e}")
        return np.zeros((img1.shape[0], img1.shape[1], 2))

def warp_image_with_flow(image: np.ndarray, flow: np.ndarray) -> np.ndarray:
    """Déformer une image avec un flux optique"""
    try:
        height, width = image.shape[:2]
        
        # Créer une grille de coordonnées
        y_coords, x_coords = np.mgrid[0:height, 0:width].astype(np.float32)
        
        # Appliquer le flux
        new_x = x_coords + flow[:, :, 0]
        new_y = y_coords + flow[:, :, 1]
        
        # Remapper l'image
        warped = cv2.remap(image, new_x, new_y, cv2.INTER_LINEAR)
        
        return warped
    except Exception as e:
        logger.error(f"Erreur lors de la déformation: {e}")
        return image

def blend_images(img1: np.ndarray, img2: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    """Fusionner deux images"""
    try:
        return cv2.addWeighted(img1, alpha, img2, 1 - alpha, 0)
    except Exception as e:
        logger.error(f"Erreur lors de la fusion: {e}")
        return img1

def get_image_info(image: np.ndarray) -> dict:
    """Obtenir les informations d'une image"""
    try:
        return {
            "shape": image.shape,
            "dtype": str(image.dtype),
            "min_value": float(image.min()),
            "max_value": float(image.max()),
            "mean_value": float(image.mean()),
            "std_value": float(image.std())
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse de l'image: {e}")
        return {}

def ensure_directory(path: str) -> bool:
    """S'assurer qu'un répertoire existe"""
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la création du répertoire: {e}")
        return False

def list_model_files(models_path: str) -> List[str]:
    """Lister les fichiers de modèles disponibles"""
    try:
        if not os.path.exists(models_path):
            return []
        
        model_files = []
        for root, dirs, files in os.walk(models_path):
            for file in files:
                if file.endswith(('.pkl', '.pt', '.pth', '.ckpt')):
                    model_files.append(os.path.join(root, file))
        
        return model_files
    except Exception as e:
        logger.error(f"Erreur lors de la liste des modèles: {e}")
        return []

def save_processing_info(info: dict, output_path: str) -> bool:
    """Sauvegarder les informations de traitement"""
    try:
        with open(output_path, 'w') as f:
            json.dump(info, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde des infos: {e}")
        return False

def load_processing_info(info_path: str) -> dict:
    """Charger les informations de traitement"""
    try:
        with open(info_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Erreur lors du chargement des infos: {e}")
        return {}
