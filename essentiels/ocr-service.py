#!/usr/bin/env python3
"""
Service OCR pour la reconnaissance de texte dans les images
Utilise EasyOCR pour extraire le texte des images
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import cv2
import numpy as np
from PIL import Image
import io
import logging
import uvicorn
from typing import List, Dict, Any
import base64

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OCR Service",
    description="Service de reconnaissance de texte dans les images",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation d'EasyOCR (français et anglais)
try:
    reader = easyocr.Reader(['fr', 'en'], gpu=False)
    logger.info("EasyOCR initialisé avec succès")
except Exception as e:
    logger.error(f"Erreur lors de l'initialisation d'EasyOCR: {e}")
    reader = None

def preprocess_image(image_data: bytes) -> np.ndarray:
    """Préprocesse l'image pour améliorer la reconnaissance OCR"""
    try:
        # Charger l'image avec PIL
        image = Image.open(io.BytesIO(image_data))
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner si trop grande (optimisation)
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            # Utiliser LANCZOS pour les versions récentes de Pillow
            if hasattr(Image, 'Resampling'):
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            else:
                image = image.resize(new_size, Image.LANCZOS)
        
        # Convertir en numpy array
        img_array = np.array(image)
        
        # Améliorer le contraste et la netteté
        img_gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Appliquer un filtre de netteté
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(img_gray, -1, kernel)
        
        # Améliorer le contraste
        enhanced = cv2.convertScaleAbs(sharpened, alpha=1.2, beta=10)
        
        return enhanced
        
    except Exception as e:
        logger.error(f"Erreur lors du préprocessing: {e}")
        return None

@app.get("/")
async def root():
    """Endpoint de santé du service"""
    return {
        "service": "OCR Service",
        "status": "running",
        "version": "1.0.0",
        "languages": ["fr", "en"]
    }

@app.get("/health")
async def health_check():
    """Vérification de santé du service"""
    return {"status": "healthy", "ocr_ready": reader is not None}

@app.post("/ocr")
async def extract_text_from_image(file: UploadFile = File(...)):
    """
    Extrait le texte d'une image uploadée
    """
    if reader is None:
        raise HTTPException(status_code=500, detail="Service OCR non disponible")
    
    # Vérifier le type de fichier
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    try:
        # Lire les données de l'image
        image_data = await file.read()
        logger.info(f"Image reçue: {file.filename}, taille: {len(image_data)} bytes")
        
        # Préprocesser l'image
        processed_image = preprocess_image(image_data)
        if processed_image is None:
            raise HTTPException(status_code=400, detail="Impossible de traiter l'image")
        
        # Effectuer la reconnaissance OCR
        logger.info("Début de la reconnaissance OCR...")
        results = reader.readtext(processed_image)
        
        # Traiter les résultats
        extracted_texts = []
        confidence_scores = []
        
        for (bbox, text, confidence) in results:
            if confidence > 0.3:  # Filtrer les résultats peu fiables
                extracted_texts.append(text.strip())
                confidence_scores.append(confidence)
        
        # Combiner tous les textes extraits
        full_text = '\n'.join(extracted_texts)
        
        # Calculer la confiance moyenne
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        logger.info(f"OCR terminé: {len(extracted_texts)} zones de texte détectées")
        
        return {
            "text": full_text,
            "confidence": avg_confidence,
            "detected_texts": extracted_texts,
            "confidence_scores": confidence_scores,
            "total_detections": len(extracted_texts),
            "filename": file.filename,
            "file_size": len(image_data)
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de l'OCR: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la reconnaissance: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
