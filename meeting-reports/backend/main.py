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
# Commenté temporairement pour éviter les conflits de dépendances
# from langchain.llms import OpenAI
# from langchain.prompts import PromptTemplate
# from langchain.chains import LLMChain
# from langchain.schema import Document
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.chains.summarize import load_summarize_chain
import logging

# Configuration
UPLOAD_DIR = Path("../uploads")
REPORTS_DIR = Path("../reports")
UPLOAD_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Compte rendus IA", version="1.0.0")

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
llm = None

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
    global whisper_model
    
    logger.info("Loading Whisper model...")
    try:
        import whisper
        whisper_model = whisper
        logger.info("Whisper module loaded successfully")
    except Exception as e:
        logger.error(f"Error loading Whisper: {e}")
        whisper_model = None
    
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
    """Upload audio file for processing"""
    import traceback
    logger.info("=" * 80)
    logger.info("UPLOAD ENDPOINT CALLED")
    logger.info("=" * 80)
    
    # Log request info
    logger.info(f"Request headers: {dict(file.headers) if hasattr(file, 'headers') else 'No headers'}")
    
    # Vérifier si un fichier a été fourni
    if file is None:
        logger.error("❌ No file provided in request")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail="No file provided")
    
    logger.info(f"✅ File object received: filename={file.filename}, content_type={file.content_type}")
    
    # Accepter tous les types de fichiers
    if file.content_type and not file.content_type.startswith("audio/"):
        logger.warning(f"⚠️ Content type '{file.content_type}' is not audio, but proceeding anyway")
    
    # Generate unique ID
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix if file.filename else ".wav"
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    logger.info(f"📝 Saving file: {filename}")
    
    # Save file
    try:
        content = await file.read()
        logger.info(f"✅ File content read: {len(content)} bytes")
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"✅ File uploaded successfully: {filename}, size: {len(content)} bytes")
        logger.info("=" * 80)
        return {"id": file_id, "filename": filename, "status": "uploaded"}
    
    except Exception as e:
        logger.error(f"❌ Error uploading file: {e}", exc_info=True)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.post("/process/{file_id}")
async def process_audio(file_id: str, background_tasks: BackgroundTasks):
    """Process audio file to generate meeting report"""
    file_path = UPLOAD_DIR / f"{file_id}.wav"
    
    if not file_path.exists():
        # Try other extensions
        for ext in [".mp3", ".m4a", ".webm", ".ogg"]:
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

@app.delete("/report/{file_id}")
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
            logger.info("Whisper model loaded, starting transcription...")
            result = model.transcribe(file_path)
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
    """Generate a basic meeting report from transcript"""
    
    # Simple extraction based on common patterns
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
    summary = "\n".join(transcript_lines[:5])  # First 5 lines as summary
    
    # Simple participant extraction (lines with names or "I", "we")
    participants = []
    
    # Create final report
    report = {
        "id": file_id,
        "filename": f"{file_id}.wav",
        "transcript": transcript,
        "summary": summary,
        "action_items": action_items if action_items else ["Aucun élément d'action identifié"],
        "key_points": key_points if key_points else ["Aucun point clé identifié"],
        "participants": participants if participants else ["Non identifié"],
        "created_at": datetime.now().isoformat(),
        "duration": None
    }
    
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)










