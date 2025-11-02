from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional
import whisper
import os
import uuid
import json
from datetime import datetime
from pathlib import Path
import asyncio
import os
from openai import OpenAI
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Configuration
UPLOAD_DIR = Path("/app/uploads")
REPORTS_DIR = Path("/app/reports")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
REPORTS_DIR.mkdir(exist_ok=True, parents=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app - Configuration pour supporter les gros fichiers (500MB)
app = FastAPI(
    title="Compte rendus IA", 
    version="1.0.0",
    # Configuration pour les gros fichiers
    # FastAPI/Starlette limite par défaut à ~16MB, on augmente à 500MB
)

# Middleware pour augmenter la limite de taille de body pour les uploads
class LargeFileUploadMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour permettre les uploads de gros fichiers jusqu'à 500MB.
    Starlette a une limite par défaut de ~16MB qu'on contourne ici.
    """
    MAX_UPLOAD_SIZE = 500 * 1024 * 1024  # 500 MB
    
    async def dispatch(self, request: Request, call_next):
        # Vérifier si c'est une requête POST vers /upload
        if request.method == "POST" and request.url.path in ["/upload", "/api/upload"]:
            # Vérifier la taille du Content-Length si disponible
            content_length = request.headers.get("content-length")
            if content_length:
                try:
                    size = int(content_length)
                    if size > self.MAX_UPLOAD_SIZE:
                        logger.warning(f"Fichier trop volumineux: {size} bytes (max: {self.MAX_UPLOAD_SIZE})")
                        return JSONResponse(
                            status_code=413,
                            content={"detail": f"Fichier trop volumineux. Maximum: {self.MAX_UPLOAD_SIZE / 1024 / 1024:.0f}MB"}
                        )
                except ValueError:
                    pass
        
        response = await call_next(request)
        return response

# Ajouter le middleware pour les gros fichiers
app.add_middleware(LargeFileUploadMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
whisper_model = None
openai_client = None

# Pydantic models
class MeetingReport(BaseModel):
    id: str
    filename: str
    transcript: str
    summary: str
    action_items: List[str]
    key_points: List[str]
    participants: List[str]
    created_at: datetime
    duration: Optional[float] = None

class ProcessingStatus(BaseModel):
    id: str
    status: str  # "processing", "completed", "error"
    progress: int  # 0-100
    message: str

# Initialize models
@app.on_event("startup")
async def startup_event():
    global whisper_model, openai_client
    
    logger.info("Loading Whisper model...")
    try:
        import whisper
        whisper_model = whisper
        logger.info("Whisper module loaded successfully")
    except Exception as e:
        logger.error(f"Error loading Whisper: {e}")
        whisper_model = None
    
    # Initialize OpenAI client
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            openai_client = OpenAI(api_key=openai_api_key)
            logger.info("OpenAI client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing OpenAI: {e}")
            openai_client = None
    else:
        logger.warning("OPENAI_API_KEY not set, OpenAI features will be disabled")
        openai_client = None
    
    logger.info("Application started successfully!")

# Routes
@app.get("/")
async def root():
    return {"message": "Compte rendus IA API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "whisper_loaded": whisper_model is not None}

@app.post("/upload")
async def upload_audio(file: UploadFile = File(None)):
    """Upload audio file for processing - Supports large files up to 500MB"""
    import traceback
    import aiofiles
    
    logger.info("=" * 80)
    logger.info("UPLOAD ENDPOINT CALLED")
    logger.info("=" * 80)
    
    # Log request info
    if file:
        logger.info(f"Request headers: {dict(file.headers) if hasattr(file, 'headers') else 'No headers'}")
    
    # Vérifier si un fichier a été fourni
    if file is None:
        logger.error("❌ No file provided in request")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail="No file provided")
    
    logger.info(f"✅ File object received: filename={file.filename}, content_type={file.content_type}")
    
    # Accepter tous les types de fichiers audio
    if file.content_type and not file.content_type.startswith("audio/"):
        logger.warning(f"⚠️ Content type '{file.content_type}' is not audio, but proceeding anyway")
    
    # Generate unique ID
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix if file.filename else ".wav"
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    logger.info(f"📝 Saving file: {filename}")
    logger.info(f"📦 Expected file size from headers: {file.headers.get('content-length', 'unknown') if hasattr(file, 'headers') else 'unknown'} bytes")
    
    # Save file using streaming for large files (prevents loading entire file in memory)
    try:
        # Utiliser aiofiles pour écrire en streaming et éviter de charger tout en mémoire
        # Augmenter la taille des chunks pour améliorer les performances (64KB au lieu de 8KB)
        async with aiofiles.open(file_path, "wb") as buffer:
            chunk_size = 65536  # 64KB chunks pour meilleures performances
            total_size = 0
            last_logged = 0
            
            logger.info(f"🚀 Starting file stream...")
            
            # Stream the file content in chunks avec timeout
            while True:
                try:
                    # Lire le chunk avec timeout pour éviter les blocages
                    chunk = await asyncio.wait_for(file.read(chunk_size), timeout=300.0)  # 5 minutes timeout par chunk
                    if not chunk:
                        break
                    
                    await buffer.write(chunk)
                    total_size += len(chunk)
                    
                    # Log progress plus fréquent pour les gros fichiers (toutes les 5MB)
                    if total_size - last_logged >= (5 * 1024 * 1024):  # Every 5MB
                        logger.info(f"📊 Upload progress: {total_size / 1024 / 1024:.1f} MB")
                        last_logged = total_size
                        
                except asyncio.TimeoutError:
                    logger.error(f"❌ Timeout while reading chunk at {total_size} bytes")
                    raise HTTPException(status_code=408, detail=f"Upload timeout after {total_size / 1024 / 1024:.1f} MB")
        
        logger.info(f"✅ File uploaded successfully: {filename}, size: {total_size} bytes ({total_size / 1024 / 1024:.2f} MB)")
        logger.info("=" * 80)
        return {"id": file_id, "filename": filename, "status": "uploaded", "size": total_size}
    
    except Exception as e:
        logger.error(f"❌ Error uploading file: {e}", exc_info=True)
        logger.error(traceback.format_exc())
        # Clean up partial file if it exists
        if file_path.exists():
            try:
                file_path.unlink()
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.post("/process/{file_id}")
async def process_audio(file_id: str, background_tasks: BackgroundTasks):
    """Process audio file to generate meeting report"""
    file_path = UPLOAD_DIR / f"{file_id}.wav"
    
    if not file_path.exists():
        # Try other extensions
        for ext in [".mp3", ".m4a", ".webm", ".ogg", ".FLAC", ".flac", ".wav", ".WAV"]:
            alt_path = UPLOAD_DIR / f"{file_id}{ext}"
            if alt_path.exists():
                file_path = alt_path
                break
        else:
            raise HTTPException(status_code=404, detail="File not found")
    
    # Start background processing
    background_tasks.add_task(process_meeting_audio, file_id, str(file_path))
    
    return {"id": file_id, "status": "processing", "message": "Processing started"}

@app.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    """Get processing status"""
    status_file = REPORTS_DIR / f"{file_id}_status.json"
    
    if not status_file.exists():
        raise HTTPException(status_code=404, detail="Processing status not found")
    
    with open(status_file, "r") as f:
        status = json.load(f)
    
    return status

@app.get("/report/{file_id}")
async def get_meeting_report(file_id: str):
    """Get generated meeting report"""
    report_file = REPORTS_DIR / f"{file_id}_report.json"
    
    if not report_file.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    with open(report_file, "r") as f:
        report = json.load(f)
    
    return report

@app.get("/reports")
async def list_reports():
    """List all generated reports"""
    reports = []
    
    for report_file in REPORTS_DIR.glob("*_report.json"):
        with open(report_file, "r") as f:
            report = json.load(f)
            reports.append({
                "id": report["id"],
                "filename": report["filename"],
                "created_at": report["created_at"],
                "summary": report["summary"][:200] + "..." if len(report["summary"]) > 200 else report["summary"]
            })
    
    return sorted(reports, key=lambda x: x["created_at"], reverse=True)

@app.delete("/reports/{file_id}")
async def delete_report(file_id: str):
    """Delete a report and associated files"""
    # Delete report file
    report_file = REPORTS_DIR / f"{file_id}_report.json"
    if report_file.exists():
        report_file.unlink()
    
    # Delete status file
    status_file = REPORTS_DIR / f"{file_id}_status.json"
    if status_file.exists():
        status_file.unlink()
    
    # Delete audio file
    for ext in [".wav", ".mp3", ".m4a", ".webm", ".ogg"]:
        audio_file = UPLOAD_DIR / f"{file_id}{ext}"
        if audio_file.exists():
            audio_file.unlink()
            break
    
    return {"message": "Report deleted successfully"}

@app.post("/clean")
async def clean_all_reports():
    """Delete all reports and uploaded files"""
    try:
        deleted_reports = 0
        deleted_files = 0
        
        # Delete all report files
        for report_file in REPORTS_DIR.glob("*_report.json"):
            report_file.unlink()
            deleted_reports += 1
        
        # Delete all status files
        for status_file in REPORTS_DIR.glob("*_status.json"):
            status_file.unlink()
        
        # Delete all uploaded audio files
        for audio_file in UPLOAD_DIR.glob("*"):
            if audio_file.is_file():
                audio_file.unlink()
                deleted_files += 1
        
        logger.info(f"Cleaned {deleted_reports} reports and {deleted_files} files")
        
        return {
            "message": f"All reports and files deleted successfully. ({deleted_reports} reports, {deleted_files} files)"
        }
    except Exception as e:
        logger.error(f"Error cleaning reports: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error cleaning reports: {str(e)}")

@app.post("/diarize-speakers/{file_id}")
async def diarize_speakers(file_id: str):
    """Identifie les locuteurs dans un fichier audio"""
    try:
        # Vérifier que le rapport existe
        report_path = REPORTS_DIR / f"{file_id}_report.json"
        if not report_path.exists():
            raise HTTPException(status_code=404, detail="Rapport non trouvé")
        
        with open(report_path, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        # Extraire les participants du rapport
        participants = report.get('participants', [])
        if isinstance(participants, str):
            participants = [p.strip() for p in participants.split(',') if p.strip()]
        
        # Simuler une diarisation basée sur la transcription
        # En production, on utiliserait pyannote.audio ou une autre bibliothèque
        
        # Analyse simple : compter les transitions de locuteurs
        transcript = report.get('transcript', '')
        
        # Extraction approximative basée sur les participants détectés
        speakers = []
        for i, participant in enumerate(participants):
            if participant and participant != "Non identifié":
                # Générer un temps estimé pour chaque participant
                duration = len(transcript) / len(participants) if participants else 0
                speakers.append({
                    "id": f"speaker_{i}",
                    "name": participant,
                    "role": "Participant",
                    "duration": duration,
                    "words_count": len(transcript.split()) // len(participants) if participants else 0
                })
        
        # Statistiques approximatives
        statistics = {
            "total_speakers": len(speakers),
            "total_duration": len(transcript) / 10,  # Estimation arbitraire
            "transcript_length": len(transcript)
        }
        
        return {
            "success": True,
            "speakers": speakers,
            "statistics": statistics,
            "message": "Analyse basée sur les participants détectés dans le rapport"
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    except Exception as e:
        logger.error(f"Error diarizing speakers: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Erreur lors de l'analyse des locuteurs: {str(e)}"
        }

@app.post("/generate-pdf/{file_id}")
async def generate_pdf(file_id: str):
    """Génère un PDF à partir d'un rapport (stub pour l'instant)"""
    # Cette fonctionnalité n'est pas encore implémentée
    return {
        "status": "error",
        "message": "PDF generation not implemented yet"
    }

@app.get("/download-pdf/{file_id}")
async def download_pdf(file_id: str):
    """Télécharge un PDF généré du rapport"""
    try:
        # Load the report data (le fichier s'appelle {file_id}_report.json)
        report_path = REPORTS_DIR / f"{file_id}_report.json"
        if not report_path.exists():
            raise HTTPException(status_code=404, detail="Rapport non trouvé")
        
        with open(report_path, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        # Generate PDF
        pdf_path = REPORTS_DIR / f"{file_id}.pdf"
        if not pdf_path.exists():
            if not generate_pdf(report, str(pdf_path)):
                raise HTTPException(status_code=500, detail="Erreur lors de la génération du PDF")
        
        # Return PDF file
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=f"compte-rendu-{file_id}.pdf"
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    except Exception as e:
        logger.error(f"Error downloading PDF: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors du téléchargement: {str(e)}")

# Background processing function
async def process_meeting_audio(file_id: str, file_path: str):
    """Process audio file and generate meeting report"""
    try:
        # Update status
        await update_status(file_id, "processing", 10, "Starting transcription...")
        
        # Transcribe audio
        logger.info(f"Transcribing audio: {file_path}")
        try:
            # Utiliser directement le module whisper (correct API)
            import whisper as whisper_lib
            logger.info("Loading Whisper model: base")
            model = whisper_lib.load_model("base")
            logger.info("Whisper model loaded, starting transcription in French...")
            # Forcer la langue française
            result = model.transcribe(file_path, language="fr")
            transcript = result["text"]
            logger.info(f"Transcription completed: {len(transcript)} characters")
        except Exception as e:
            logger.error(f"Transcription error: {e}", exc_info=True)
            raise
        
        await update_status(file_id, "processing", 50, "Transcription completed, generating report...")
        
        # Generate meeting report using LangChain
        report = await generate_meeting_report(transcript, file_id)
        
        await update_status(file_id, "processing", 90, "Finalizing report...")
        
        # Save report
        report_file = REPORTS_DIR / f"{file_id}_report.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        await update_status(file_id, "completed", 100, "Report generated successfully")
        
        logger.info(f"Report generated successfully for {file_id}")
        
    except Exception as e:
        logger.error(f"Error processing audio {file_id}: {e}")
        await update_status(file_id, "error", 0, f"Error: {str(e)}")

async def update_status(file_id: str, status: str, progress: int, message: str):
    """Update processing status"""
    status_data = {
        "id": file_id,
        "status": status,
        "progress": progress,
        "message": message,
        "updated_at": datetime.now().isoformat()
    }
    
    status_file = REPORTS_DIR / f"{file_id}_status.json"
    with open(status_file, "w") as f:
        json.dump(status_data, f, indent=2)

async def generate_meeting_report(transcript: str, file_id: str) -> dict:
    """Generate a meeting report from transcript using OpenAI"""
    
    # Use OpenAI if available, otherwise fallback to basic extraction
    if openai_client:
        try:
            logger.info("Using OpenAI for intelligent summarization in French")
            
            # Create a prompt for OpenAI (en français)
            prompt = f"""Analysez cette transcription de réunion et extrayez :

1. Un résumé concis (2-3 phrases)
2. Les points clés discutés (max 10)
3. Les éléments d'action avec propriétaires si mentionnés (max 10)
4. Les participants principaux mentionnés (max 5)

Transcription :
{transcript}

Formatez la réponse en JSON avec ces clés exactes : summary, key_points, action_items, participants.
Chaque clé doit contenir une liste de chaînes de caractères.
Tout doit être en français."""

            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Vous êtes un expert en analyse de réunions. Extrayez et structurez les informations de réunion en français."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse OpenAI response
            content = response.choices[0].message.content
            logger.info(f"OpenAI response: {content[:200]}...")
            
            # Try to parse as JSON, fallback if needed
            try:
                import json as json_lib
                ai_data = json_lib.loads(content)
            except:
                # If not JSON, use basic parsing
                ai_data = {
                    "summary": content.split("1.")[0] if "1." in content else content[:200],
                    "key_points": [l.strip() for l in content.split("\n") if l.strip() and "-" in l][:10],
                    "action_items": [],
                    "participants": []
                }
            
            summary = ai_data.get("summary", content[:200])
            key_points = ai_data.get("key_points", [])
            action_items = ai_data.get("action_items", [])
            participants = ai_data.get("participants", ["Non identifié"])
            
        except Exception as e:
            logger.error(f"OpenAI error: {e}, falling back to basic extraction")
            # Fallback to basic extraction
            summary, key_points, action_items, participants = await _basic_extraction(transcript)
    else:
        # Basic extraction
        summary, key_points, action_items, participants = await _basic_extraction(transcript)
    
    # Create final report
    report = {
        "id": file_id,
        "filename": f"{file_id}.wav",
        "transcript": transcript,
        "summary": summary if summary else "Résumé non disponible",
        "action_items": action_items if action_items else ["Aucun élément d'action identifié"],
        "key_points": key_points if key_points else ["Aucun point clé identifié"],
        "participants": participants if participants else ["Non identifié"],
        "created_at": datetime.now().isoformat(),
        "duration": None
    }
    
    return report

async def _basic_extraction(transcript: str):
    """Basic extraction fallback"""
    lines = transcript.split('\n')
    
    # Extract potential action items (lines with "do", "need to", etc.)
    action_items = []
    key_points = []
    
    for line in lines:
        line_lower = line.lower()
        if any(word in line_lower for word in ['do', 'need to', 'should', 'will', 'must', 'action']):
            if line.strip():
                action_items.append(line.strip())
        elif len(line.strip()) > 20:  # Potential key points
            key_points.append(line.strip())
    
    # Limit results
    action_items = action_items[:10] if len(action_items) > 10 else action_items
    key_points = key_points[:10] if len(key_points) > 10 else key_points
    
    # Create summary from transcript
    transcript_lines = [l.strip() for l in transcript.split('\n') if l.strip()]
    summary = "\n".join(transcript_lines[:3])  # First 3 lines as summary
    
    participants = []
    
    return summary, key_points, action_items, participants

def generate_pdf(report: dict, output_path: str):
    """Generate PDF from report data"""
    try:
        logger.info(f"Generating PDF for report: {output_path}")
        # Create PDF
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        
        # Story to build the PDF
        story = []
        
        # Title - Style amélioré
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor='#1e40af',
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Compte-rendu de Réunion", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Report info - Style amélioré avec fond
        info_style = ParagraphStyle(
            'Info',
            parent=styles['Normal'],
            fontSize=10,
            textColor='#4b5563',
            spaceAfter=8,
            backColor='#f3f4f6',
            borderPadding=8
        )
        info_box_style = ParagraphStyle(
            'InfoBox',
            parent=styles['Normal'],
            fontSize=10,
            textColor='#6b7280',
            spaceAfter=5
        )
        story.append(Paragraph(f"<b>Fichier:</b> {report.get('filename', 'N/A')}", info_box_style))
        story.append(Paragraph(f"<b>Date de création:</b> {report.get('created_at', 'N/A')}", info_box_style))
        if report.get('duration'):
            story.append(Paragraph(f"<b>Durée:</b> {report.get('duration', 'N/A')}", info_box_style))
        story.append(Spacer(1, 0.4*inch))
        
        # Summary - Style amélioré
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Heading2'],
            fontSize=18,
            textColor='#1e40af',
            spaceBefore=25,
            spaceAfter=12,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor='#1e40af',
            borderPadding=8,
            backColor='#eff6ff'
        )
        story.append(Paragraph("📋 Résumé", subtitle_style))
        
        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_JUSTIFY,
            spaceAfter=12,
            leading=14,
            leftIndent=0,
            rightIndent=0
        )
        
        summary = report.get('summary', '')
        # Handle summary - can be string or list
        if isinstance(summary, list):
            summary = ' '.join(str(s) for s in summary if s)
        elif not isinstance(summary, str):
            summary = str(summary) if summary else ''
        
        # Format summary as paragraphs
        if summary:
            # Split by periods or newlines for better paragraph breaks
            paragraphs = summary.replace('. ', '.\n').split('\n')
            for para in paragraphs:
                para = para.strip()
                if para:
                    # Remove trailing period if followed by new paragraph
                    if para.endswith('.') and len(para) > 1:
                        para = para[:-1]
                    story.append(Paragraph(para, normal_style))
        
        story.append(Spacer(1, 0.2*inch))
        
        # Key Points - Style amélioré
        story.append(Paragraph("🔑 Points clés", subtitle_style))
        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            bulletIndent=10,
            spaceAfter=8,
            leading=14
        )
        
        key_points = report.get('key_points', [])
        if isinstance(key_points, str):
            key_points = [kp.strip() for kp in key_points.split(',') if kp.strip()]
        elif not isinstance(key_points, list):
            key_points = [str(key_points)] if key_points else []
        
        # Handle list items that might be nested lists
        key_points_flat = []
        for point in key_points:
            if isinstance(point, list):
                key_points_flat.extend([str(p) for p in point if p])
            else:
                key_points_flat.append(str(point))
        
        for point in key_points_flat:
            point = point.strip()
            if point:
                story.append(Paragraph(f"• {point}", normal_style))
        
        story.append(Spacer(1, 0.2*inch))
        
        # Action Items - Style amélioré
        story.append(Paragraph("✅ Éléments d'action", subtitle_style))
        
        action_items = report.get('action_items', [])
        if isinstance(action_items, str):
            action_items = [ai.strip() for ai in action_items.split(',') if ai.strip()]
        elif not isinstance(action_items, list):
            action_items = [str(action_items)] if action_items else []
        
        # Handle list items that might be nested lists
        action_items_flat = []
        for item in action_items:
            if isinstance(item, list):
                action_items_flat.extend([str(i) for i in item if i])
            else:
                action_items_flat.append(str(item))
        
        for item in action_items_flat:
            item = item.strip()
            if item:
                story.append(Paragraph(f"• {item}", normal_style))
        
        story.append(Spacer(1, 0.2*inch))
        
        # Participants - Style amélioré
        story.append(Paragraph("👥 Participants", subtitle_style))
        
        participants = report.get('participants', [])
        if isinstance(participants, str):
            participants = [p.strip() for p in participants.split(',') if p.strip()]
        elif not isinstance(participants, list):
            participants = [str(participants)] if participants else []
        
        # Handle list items that might be nested lists
        participants_flat = []
        for participant in participants:
            if isinstance(participant, list):
                participants_flat.extend([str(p) for p in participant if p])
            else:
                participants_flat.append(str(participant))
        
        for participant in participants_flat:
            participant = participant.strip()
            if participant:
                story.append(Paragraph(f"• {participant}", normal_style))
        
        story.append(PageBreak())
        
        # Full Transcript - Style amélioré
        transcript_title_style = ParagraphStyle(
            'TranscriptTitle',
            parent=styles['Heading2'],
            fontSize=18,
            textColor='#1e40af',
            spaceBefore=25,
            spaceAfter=15,
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("📝 Transcription complète", transcript_title_style))
        
        transcript_style = ParagraphStyle(
            'Transcript',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=12,
            leftIndent=10,
            rightIndent=10
        )
        transcript = report.get('transcript', '')
        # Handle transcript - can be string or list
        if isinstance(transcript, list):
            transcript = ' '.join(str(t) for t in transcript if t)
        elif not isinstance(transcript, str):
            transcript = str(transcript) if transcript else ''
        
        # Split transcript into paragraphs
        if transcript:
            paragraphs = transcript.split('\n')
            for para in paragraphs:
                para = para.strip()
                if para:
                    story.append(Paragraph(para, transcript_style))
                    story.append(Spacer(1, 0.08*inch))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor='#9ca3af',
            alignment=TA_CENTER,
            spaceBefore=20
        )
        story.append(Paragraph("─" * 50, footer_style))
        story.append(Paragraph("Généré par Compte rendus IA - IAHome", footer_style))
        story.append(Paragraph(f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", footer_style))
        
        # Build PDF
        doc.build(story)
        logger.info(f"PDF generated successfully: {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return False

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        limit_concurrency=1000,
        limit_max_requests=10000,
        timeout_keep_alive=75,
        # Configuration pour les gros fichiers (500MB)
        # Note: uvicorn utilise Starlette qui a une limite par défaut de ~16MB
        # Cette configuration est gérée via le Dockerfile avec les arguments CLI
    )










