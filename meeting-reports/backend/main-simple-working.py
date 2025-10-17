from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import json
from datetime import datetime
from pathlib import Path
import asyncio
import logging
from dotenv import load_dotenv
from openai_summarizer import OpenAISummarizer
from whisper_api import whisper_transcribe_hybrid
from pdf_generator import pdf_generator

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "config.env"))

# Initialize services
summarizer = OpenAISummarizer()

# Configuration
UPLOAD_DIR = Path("uploads")
REPORTS_DIR = Path("reports")
PDF_DIR = Path("pdfs")
UPLOAD_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)
PDF_DIR.mkdir(exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Meeting Reports Generator", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Global variables
whisper_model = None

# Initialize models
@app.on_event("startup")
async def startup_event():
    global whisper_model
    
    logger.info("Loading Whisper model...")
    try:
        import whisper
        whisper_model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading Whisper model: {e}")
        whisper_model = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "whisper_loaded": whisper_model is not None,
        "llm_loaded": summarizer.enabled
    }

# Clean old reports endpoint
@app.post("/clean")
async def clean_old_reports():
    """Supprimer tous les anciens rapports"""
    try:
        # Supprimer tous les fichiers de rapports
        for file_path in REPORTS_DIR.glob("*"):
            if file_path.is_file():
                file_path.unlink()
                logger.info(f"Deleted report file: {file_path}")
        
        # Supprimer tous les fichiers uploadés
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                file_path.unlink()
                logger.info(f"Deleted upload file: {file_path}")
        
        # Supprimer tous les PDFs
        for file_path in PDF_DIR.glob("*"):
            if file_path.is_file():
                file_path.unlink()
                logger.info(f"Deleted PDF file: {file_path}")
        
        return {"message": "All old reports cleaned successfully", "status": "success"}
    except Exception as e:
        logger.error(f"Error cleaning reports: {e}")
        return {"message": f"Error cleaning reports: {str(e)}", "status": "error"}

# Delete individual report endpoint
@app.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """Supprimer un rapport spécifique"""
    try:
        # Supprimer le fichier de rapport
        report_file = REPORTS_DIR / f"{report_id}.json"
        if report_file.exists():
            report_file.unlink()
            logger.info(f"Deleted report file: {report_file}")
        
        # Supprimer le fichier uploadé associé
        upload_file = UPLOAD_DIR / f"{report_id}.wav"
        if upload_file.exists():
            upload_file.unlink()
            logger.info(f"Deleted upload file: {upload_file}")
        
        # Supprimer le PDF associé
        pdf_file = PDF_DIR / f"{report_id}.pdf"
        if pdf_file.exists():
            pdf_file.unlink()
            logger.info(f"Deleted PDF file: {pdf_file}")
        
        return {"message": f"Report {report_id} deleted successfully", "status": "success"}
    except Exception as e:
        logger.error(f"Error deleting report {report_id}: {e}")
        return {"message": f"Error deleting report: {str(e)}", "status": "error"}

# Generate PDF endpoint
@app.post("/generate-pdf/{report_id}")
async def generate_pdf(report_id: str):
    """Générer un PDF pour un rapport spécifique"""
    try:
        # Charger le rapport
        report_file = REPORTS_DIR / f"{report_id}.json"
        if not report_file.exists():
            raise HTTPException(status_code=404, detail="Report not found")
        
        with open(report_file, 'r', encoding='utf-8') as f:
            report_data = json.load(f)
        
        # Générer le PDF
        pdf_path = PDF_DIR / f"{report_id}.pdf"
        pdf_file_path = pdf_generator.generate_meeting_report_pdf(
            report_data,
            report_id
        )
        
        # Vérifier si le PDF a été généré
        success = pdf_file_path and os.path.exists(pdf_file_path)
        
        if success:
            logger.info(f"PDF generated successfully: {pdf_path}")
            return {"message": "PDF generated successfully", "status": "success", "pdf_path": str(pdf_path)}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
            
    except Exception as e:
        logger.error(f"Error generating PDF for {report_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

# Download PDF endpoint
@app.get("/download-pdf/{report_id}")
async def download_pdf(report_id: str):
    """Télécharger un PDF généré"""
    try:
        # Chercher le fichier PDF avec le pattern complet
        pdf_files = list(PDF_DIR.glob(f"{report_id}_rapport_*.pdf"))
        if not pdf_files:
            # Essayer le nom simple
            pdf_file = PDF_DIR / f"{report_id}.pdf"
            if not pdf_file.exists():
                raise HTTPException(status_code=404, detail="PDF not found")
        else:
            pdf_file = pdf_files[0]  # Prendre le premier fichier trouvé
        
        from fastapi.responses import FileResponse
        return FileResponse(
            path=str(pdf_file),
            filename=f"rapport_{report_id}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        logger.error(f"Error downloading PDF {report_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error downloading PDF: {str(e)}")

# Upload endpoint
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save uploaded file
        file_path = UPLOAD_DIR / f"{file_id}.{file.filename.split('.')[-1]}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"File uploaded: {file_id}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Process audio endpoint
@app.post("/process/{file_id}")
async def process_audio(file_id: str, background_tasks: BackgroundTasks):
    try:
        # Start processing in background
        background_tasks.add_task(process_audio_background, file_id)
        
        return {
            "file_id": file_id,
            "status": "processing",
            "message": "Audio processing started"
        }
        
    except Exception as e:
        logger.error(f"Error starting processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background processing function
async def process_audio_background(file_id: str):
    try:
        await update_status(file_id, "processing", 10, "Starting transcription...")
        
        # Find the uploaded file
        uploaded_files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
        if not uploaded_files:
            await update_status(file_id, "error", 0, "File not found")
            return
        
        file_path = uploaded_files[0]
        logger.info(f"Processing file: {file_path}")
        
        # Convert to WAV if needed
        wav_path = UPLOAD_DIR / f"{file_id}.wav"
        if file_path.suffix.lower() != '.wav':
            if convert_audio_to_wav(str(file_path), str(wav_path)):
                file_path = wav_path
            else:
                await update_status(file_id, "error", 0, "Audio conversion failed")
                return
        
        await update_status(file_id, "processing", 30, "Transcribing audio...")
        
        # Transcribe audio
        if whisper_model:
            transcript = whisper_model.transcribe(str(file_path))["text"]
        else:
            # Fallback to API transcription
            transcript = whisper_transcribe_hybrid(str(file_path))
        
        await update_status(file_id, "processing", 70, "Generating report...")
        
        # Generate AI report
        report = await generate_ai_meeting_report(transcript, file_id)
        
        await update_status(file_id, "completed", 100, "Processing completed")
        
        logger.info(f"Processing completed for {file_id}")
        
    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        await update_status(file_id, "error", 0, str(e))

# Status endpoint
@app.get("/status/{file_id}")
async def get_status(file_id: str):
    try:
        status_file = REPORTS_DIR / f"{file_id}_status.json"
        if status_file.exists():
            with open(status_file, "r") as f:
                return json.load(f)
        else:
            return {"status": "not_found", "message": "File not found"}
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Reports endpoint
@app.get("/reports")
async def get_reports():
    try:
        reports = []
        for report_file in REPORTS_DIR.glob("*.json"):
            if not report_file.name.endswith("_status.json"):
                with open(report_file, "r", encoding="utf-8") as f:
                    report_data = json.load(f)
                    reports.append(report_data)
        
        # Sort by creation date
        reports.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return reports
    except Exception as e:
        logger.error(f"Error getting reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get specific report
@app.get("/report/{file_id}")
async def get_report(file_id: str):
    try:
        report_file = REPORTS_DIR / f"{file_id}.json"
        if report_file.exists():
            with open(report_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        logger.error(f"Error getting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Update status function
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

def convert_audio_to_wav(input_path: str, output_path: str) -> bool:
    """Convert audio file to WAV format using subprocess and ffmpeg"""
    try:
        logger.info(f"Converting {input_path} to {output_path}")
        
        import subprocess
        
        # Try to use ffmpeg via subprocess
        ffmpeg_path = os.path.join(os.path.dirname(__file__), 'ffmpeg.exe')
        cmd = [
            ffmpeg_path, '-i', input_path, 
            '-acodec', 'pcm_s16le', 
            '-ar', '16000', 
            '-ac', '1', 
            '-y',  # overwrite output
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"Conversion successful: {output_path}")
            return True
        else:
            logger.error(f"FFmpeg error: {result.stderr}")
            return False
        
    except FileNotFoundError:
        logger.error("FFmpeg not found. Trying alternative approach...")
        # For now, just copy the file and let Whisper handle it
        import shutil
        try:
            shutil.copy2(input_path, output_path)
            logger.info(f"Copied file to: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Copy error: {e}")
            return False
    except Exception as e:
        logger.error(f"Conversion error: {e}")
        return False

async def generate_ai_meeting_report(transcript: str, file_id: str) -> dict:
    """Generate an AI-powered meeting report with OpenAI summarization"""
    
    # Basic text processing
    lines = transcript.split('\n')
    words = transcript.split()
    word_count = len(words)
    
    # Estimate duration (assuming ~150 words per minute)
    estimated_duration = max(1, word_count // 150)
    
    # Use OpenAI for advanced summarization
    logger.info(f"Generating AI summary for {file_id}...")
    ai_summary = summarizer.summarize_transcript(transcript, language="fr")
    
    # Create enhanced report
    report = {
        "id": file_id,
        "filename": f"{file_id}.wav",
        "transcript": transcript,
        "summary": ai_summary.get("summary", "Résumé non disponible"),
        "key_points": ai_summary.get("key_points", []),
        "action_items": ai_summary.get("action_items", []),
        "participants": ai_summary.get("participants", []),
        "decisions": ai_summary.get("decisions", []),
        "next_steps": ai_summary.get("next_steps", ""),
        "duration_minutes": estimated_duration,
        "word_count": word_count,
        "created_at": datetime.now().isoformat(),
        "duration": estimated_duration,
        "ai_enhanced": True
    }
    
    # Save report to file
    report_file = REPORTS_DIR / f"{file_id}.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    logger.info(f"AI-enhanced report generated successfully for {file_id}")
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
