from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import subprocess
import logging
from pathlib import Path
import asyncio
import aiofiles
import uvicorn

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Document Processing Service", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Formats supportés
SUPPORTED_FORMATS = {
    'pdf': ['application/pdf'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'doc': ['application/msword'],
    'ppt': ['application/vnd.ms-powerpoint'],
    'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'odt': ['application/vnd.oasis.opendocument.text'],
    'odp': ['application/vnd.oasis.opendocument.presentation']
}

def check_dependencies():
    """Vérifier que les dépendances système sont installées"""
    try:
        # Vérifier ffmpeg
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        logger.info("ffmpeg trouvé")
        
        # Vérifier pandoc
        subprocess.run(['pandoc', '--version'], capture_output=True, check=True)
        logger.info("pandoc trouvé")
        
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        logger.error(f"Dépendance manquante: {e}")
        return False

@app.get("/")
async def root():
    """Endpoint de base"""
    return {
        "service": "Document Processing Service",
        "status": "running",
        "supported_formats": list(SUPPORTED_FORMATS.keys())
    }

@app.get("/health")
async def health_check():
    """Vérification de santé du service"""
    deps_ok = check_dependencies()
    return {
        "status": "healthy" if deps_ok else "degraded",
        "dependencies_ok": deps_ok,
        "supported_formats": list(SUPPORTED_FORMATS.keys())
    }

def get_file_type(filename: str) -> str:
    """Déterminer le type de fichier à partir de l'extension"""
    ext = Path(filename).suffix.lower().lstrip('.')
    for file_type, mime_types in SUPPORTED_FORMATS.items():
        if ext == file_type:
            return file_type
    return None

async def extract_audio_from_pdf(pdf_path: str, output_dir: str) -> str:
    """Extraire l'audio d'un PDF (si il contient des médias)"""
    try:
        # Essayer d'extraire les médias du PDF
        audio_path = os.path.join(output_dir, "extracted_audio.wav")
        
        # Utiliser pdf2pic pour extraire les images, puis tesseract pour OCR
        # Pour l'instant, on va simuler l'extraction
        logger.info(f"Tentative d'extraction audio du PDF: {pdf_path}")
        
        # Créer un fichier audio vide pour l'instant
        # Dans une implémentation complète, on utiliserait des outils comme:
        # - pdf2pic pour extraire les images
        # - tesseract pour OCR
        # - text-to-speech pour convertir en audio
        
        with open(audio_path, 'w') as f:
            f.write("")  # Fichier vide pour l'instant
            
        return audio_path
        
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction audio du PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Impossible d'extraire l'audio du PDF: {str(e)}")

async def convert_document_to_text(file_path: str, file_type: str) -> str:
    """Convertir un document en texte"""
    try:
        if file_type == 'pdf':
            # Utiliser pdftotext pour convertir PDF en texte
            try:
                result = subprocess.run([
                    'pdftotext', file_path, '-'
                ], capture_output=True, text=True, check=True)
                return result.stdout
            except (subprocess.CalledProcessError, FileNotFoundError):
                # Fallback: utiliser python-pdf2 si pdftotext n'est pas disponible
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as file:
                        pdf_reader = PyPDF2.PdfReader(file)
                        text = ""
                        for page in pdf_reader.pages:
                            text += page.extract_text() + "\n"
                        return text
                except ImportError:
                    # Dernier recours: utiliser pdfplumber
                    try:
                        import pdfplumber
                        with pdfplumber.open(file_path) as pdf:
                            text = ""
                            for page in pdf.pages:
                                text += page.extract_text() or ""
                            return text
                    except ImportError:
                        raise HTTPException(
                            status_code=500, 
                            detail="Aucun outil PDF disponible. Installez pdftotext, PyPDF2 ou pdfplumber."
                        )
            
        elif file_type in ['docx', 'doc']:
            # Utiliser pandoc pour convertir DOCX/DOC en texte
            result = subprocess.run([
                'pandoc', file_path, '-t', 'plain', '--wrap=none'
            ], capture_output=True, text=True, check=True)
            return result.stdout
            
        elif file_type in ['ppt', 'pptx']:
            # Utiliser pandoc pour convertir PowerPoint en texte
            result = subprocess.run([
                'pandoc', file_path, '-t', 'plain', '--wrap=none'
            ], capture_output=True, text=True, check=True)
            return result.stdout
            
        elif file_type in ['odt', 'odp']:
            # Utiliser pandoc pour convertir OpenDocument en texte
            result = subprocess.run([
                'pandoc', file_path, '-t', 'plain', '--wrap=none'
            ], capture_output=True, text=True, check=True)
            return result.stdout
            
        else:
            raise HTTPException(status_code=400, detail=f"Format non supporté: {file_type}")
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur pandoc: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la conversion: {e.stderr}")
    except Exception as e:
        logger.error(f"Erreur lors de la conversion: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la conversion: {str(e)}")

@app.post("/process-document")
async def process_document(file: UploadFile = File(...)):
    """
    Traiter un document (PDF, DOCX, etc.) et extraire le texte
    """
    try:
        # Vérifier le type de fichier
        file_type = get_file_type(file.filename)
        if not file_type:
            raise HTTPException(
                status_code=400, 
                detail=f"Format non supporté. Formats acceptés: {', '.join(SUPPORTED_FORMATS.keys())}"
            )
        
        # Vérifier le type MIME
        if file.content_type not in SUPPORTED_FORMATS[file_type]:
            logger.warning(f"Type MIME inattendu: {file.content_type} pour {file.filename}")
        
        logger.info(f"Traitement du document: {file.filename} (type: {file_type})")
        
        # Créer un répertoire temporaire
        with tempfile.TemporaryDirectory() as temp_dir:
            # Sauvegarder le fichier uploadé
            file_path = os.path.join(temp_dir, file.filename)
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Convertir le document en texte
            text_content = await convert_document_to_text(file_path, file_type)
            
            if not text_content.strip():
                raise HTTPException(
                    status_code=400, 
                    detail="Aucun texte trouvé dans le document"
                )
            
            # Calculer des statistiques
            word_count = len(text_content.split())
            char_count = len(text_content)
            
            return {
                "success": True,
                "filename": file.filename,
                "file_type": file_type,
                "text": text_content.strip(),
                "statistics": {
                    "word_count": word_count,
                    "character_count": char_count,
                    "line_count": len(text_content.splitlines())
                },
                "processing_method": "pandoc_conversion"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du traitement du document: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@app.post("/extract-audio")
async def extract_audio(file: UploadFile = File(...)):
    """
    Extraire l'audio d'un document (principalement PDF avec médias)
    """
    try:
        file_type = get_file_type(file.filename)
        if not file_type:
            raise HTTPException(
                status_code=400, 
                detail=f"Format non supporté. Formats acceptés: {', '.join(SUPPORTED_FORMATS.keys())}"
            )
        
        logger.info(f"Extraction audio du document: {file.filename}")
        
        # Créer un répertoire temporaire
        with tempfile.TemporaryDirectory() as temp_dir:
            # Sauvegarder le fichier uploadé
            file_path = os.path.join(temp_dir, file.filename)
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            if file_type == 'pdf':
                # Extraire l'audio du PDF
                audio_path = await extract_audio_from_pdf(file_path, temp_dir)
                
                if os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
                    # Lire le fichier audio
                    async with aiofiles.open(audio_path, 'rb') as f:
                        audio_content = await f.read()
                    
                    return {
                        "success": True,
                        "filename": file.filename,
                        "audio_extracted": True,
                        "audio_size": len(audio_content),
                        "message": "Audio extrait avec succès"
                    }
                else:
                    return {
                        "success": False,
                        "filename": file.filename,
                        "audio_extracted": False,
                        "message": "Aucun audio trouvé dans le document"
                    }
            else:
                return {
                    "success": False,
                    "filename": file.filename,
                    "audio_extracted": False,
                    "message": f"Extraction audio non supportée pour le format {file_type}"
                }
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction audio: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'extraction: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
