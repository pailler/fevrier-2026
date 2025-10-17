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
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
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
app = FastAPI(title="Meeting Reports Generator", version="1.0.0")

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
    global whisper_model, llm
    
    logger.info("Loading Whisper model...")
    whisper_model = whisper.load_model("base")
    
    logger.info("Initializing LLM...")
    # Utilisez votre clé API OpenAI ou configurez un autre LLM
    llm = OpenAI(temperature=0.3, max_tokens=1000)
    
    logger.info("Application started successfully!")

# Routes
@app.get("/")
async def root():
    return {"message": "Meeting Reports Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "whisper_loaded": whisper_model is not None, "llm_loaded": llm is not None}

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio file for processing"""
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Generate unique ID
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"File uploaded: {filename}")
        return {"id": file_id, "filename": filename, "status": "uploaded"}
    
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Error uploading file")

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
        result = whisper_model.transcribe(file_path)
        transcript = result["text"]
        
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
    """Generate meeting report using LangChain"""
    
    # Split transcript into chunks if too long
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200
    )
    
    chunks = text_splitter.split_text(transcript)
    documents = [Document(page_content=chunk) for chunk in chunks]
    
    # Create prompts for different parts of the report
    summary_prompt = PromptTemplate(
        input_variables=["text"],
        template="""
        Analysez cette transcription de réunion et créez un résumé structuré :
        
        Transcription: {text}
        
        Créez un résumé qui inclut :
        1. Objectif de la réunion
        2. Points clés discutés
        3. Décisions prises
        4. Prochaines étapes
        
        Format: Texte structuré et professionnel
        """
    )
    
    action_items_prompt = PromptTemplate(
        input_variables=["text"],
        template="""
        Extrayez les éléments d'action (tâches, décisions, prochaines étapes) de cette transcription :
        
        Transcription: {text}
        
        Listez chaque élément d'action avec :
        - Description claire
        - Responsable (si mentionné)
        - Échéance (si mentionnée)
        
        Format: Liste à puces
        """
    )
    
    key_points_prompt = PromptTemplate(
        input_variables=["text"],
        template="""
        Identifiez les points clés de cette réunion :
        
        Transcription: {text}
        
        Listez les points les plus importants discutés, les décisions majeures, et les informations critiques.
        
        Format: Liste à puces
        """
    )
    
    participants_prompt = PromptTemplate(
        input_variables=["text"],
        template="""
        Identifiez les participants à cette réunion :
        
        Transcription: {text}
        
        Listez tous les noms de personnes mentionnés ou identifiés comme participants.
        
        Format: Liste simple
        """
    )
    
    # Generate different parts of the report
    summary_chain = LLMChain(llm=llm, prompt=summary_prompt)
    action_items_chain = LLMChain(llm=llm, prompt=action_items_prompt)
    key_points_chain = LLMChain(llm=llm, prompt=key_points_prompt)
    participants_chain = LLMChain(llm=llm, prompt=participants_prompt)
    
    # Process each chunk and combine results
    summary_parts = []
    action_items_parts = []
    key_points_parts = []
    participants_parts = []
    
    for doc in documents:
        summary_parts.append(summary_chain.run(text=doc.page_content))
        action_items_parts.append(action_items_chain.run(text=doc.page_content))
        key_points_parts.append(key_points_chain.run(text=doc.page_content))
        participants_parts.append(participants_chain.run(text=doc.page_content))
    
    # Combine and clean up results
    full_summary = "\n\n".join(summary_parts)
    full_action_items = "\n".join(action_items_parts)
    full_key_points = "\n".join(key_points_parts)
    full_participants = "\n".join(participants_parts)
    
    # Clean up action items and key points
    action_items = [item.strip() for item in full_action_items.split('\n') if item.strip() and not item.strip().startswith(('Transcription:', 'Format:'))]
    key_points = [point.strip() for point in full_key_points.split('\n') if point.strip() and not point.strip().startswith(('Transcription:', 'Format:'))]
    participants = [p.strip() for p in full_participants.split('\n') if p.strip() and not p.strip().startswith(('Transcription:', 'Format:'))]
    
    # Create final report
    report = {
        "id": file_id,
        "filename": f"{file_id}.wav",
        "transcript": transcript,
        "summary": full_summary,
        "action_items": action_items,
        "key_points": key_points,
        "participants": participants,
        "created_at": datetime.now().isoformat(),
        "duration": None  # Could be extracted from audio metadata
    }
    
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


