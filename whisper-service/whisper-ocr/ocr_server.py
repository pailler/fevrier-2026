#!/usr/bin/env python3
"""
Service OCR pour reconnaissance de texte dans les images
Utilise Tesseract OCR avec support français
"""

import os
import io
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import uvicorn

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration Tesseract
os.environ['TESSDATA_PREFIX'] = '/usr/share/tesseract-ocr/4.00/tessdata'

app = FastAPI(
    title="Whisper OCR Service",
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

# Configuration Tesseract
TESSERACT_CONFIG = '--oem 3 --psm 6 -l fra+eng'

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "whisper-ocr"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Whisper OCR",
        "version": "1.0.0",
        "description": "Service de reconnaissance de texte dans les images",
        "endpoints": {
            "health": "/health",
            "ocr": "/ocr",
            "docs": "/docs"
        }
    }

@app.post("/ocr")
async def extract_text_from_image(
    image_file: UploadFile = File(..., description="Fichier image à traiter")
):
    """
    Extrait le texte d'une image en utilisant Tesseract OCR
    
    Args:
        image_file: Fichier image (JPG, PNG, GIF, BMP, TIFF, PDF)
    
    Returns:
        JSON avec le texte extrait et les métadonnées
    """
    try:
        # Vérifier le type de fichier
        if not image_file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="Le fichier doit être une image (JPG, PNG, GIF, BMP, TIFF)"
            )
        
        # Lire le fichier
        image_data = await image_file.read()
        logger.info(f"Traitement de l'image: {image_file.filename} ({len(image_data)} bytes)")
        
        # Ouvrir l'image avec PIL
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Impossible d'ouvrir l'image: {str(e)}"
            )
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Extraire le texte avec Tesseract
        try:
            text = pytesseract.image_to_string(image, config=TESSERACT_CONFIG)
            text = text.strip()
            
            # Obtenir des informations supplémentaires
            data = pytesseract.image_to_data(image, config=TESSERACT_CONFIG, output_type=pytesseract.Output.DICT)
            
            # Compter les mots et les lignes
            words = [word for word in data['text'] if word.strip()]
            lines = text.split('\n')
            lines = [line.strip() for line in lines if line.strip()]
            
            # Calculer la confiance moyenne
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            result = {
                "text": text,
                "confidence": round(avg_confidence / 100, 2),  # Normaliser entre 0 et 1
                "word_count": len(words),
                "line_count": len(lines),
                "language": "fr+eng",
                "image_info": {
                    "filename": image_file.filename,
                    "size": len(image_data),
                    "dimensions": f"{image.width}x{image.height}",
                    "format": image.format
                }
            }
            
            logger.info(f"Texte extrait: {len(text)} caractères, {len(words)} mots, confiance: {avg_confidence:.1f}%")
            
            return JSONResponse(content=result)
            
        except Exception as e:
            logger.error(f"Erreur Tesseract: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de l'extraction de texte: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@app.post("/ocr/batch")
async def extract_text_from_multiple_images(
    image_files: list[UploadFile] = File(..., description="Liste de fichiers images à traiter")
):
    """
    Extrait le texte de plusieurs images en lot
    
    Args:
        image_files: Liste de fichiers images
    
    Returns:
        JSON avec les résultats pour chaque image
    """
    results = []
    
    for i, image_file in enumerate(image_files):
        try:
            result = await extract_text_from_image(image_file)
            results.append({
                "index": i,
                "filename": image_file.filename,
                "success": True,
                "result": result
            })
        except Exception as e:
            results.append({
                "index": i,
                "filename": image_file.filename,
                "success": False,
                "error": str(e)
            })
    
    return JSONResponse(content={
        "total_images": len(image_files),
        "successful": len([r for r in results if r["success"]]),
        "failed": len([r for r in results if not r["success"]]),
        "results": results
    })

if __name__ == "__main__":
    logger.info("Démarrage du service OCR Whisper...")
    uvicorn.run(
        "ocr_server:app",
        host="0.0.0.0",
        port=8080,
        log_level="info",
        access_log=True
    )

