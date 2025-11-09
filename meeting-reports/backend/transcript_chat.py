import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("config.env")

logger = logging.getLogger(__name__)

class TranscriptChat:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
        self.enabled = self.api_key is not None and self.api_key != "your_openai_api_key_here"
        
        if not self.enabled:
            logger.warning("OpenAI API key not configured - chat functionality disabled")
        else:
            logger.info("Transcript chat functionality enabled")
    
    def create_chat_session(self, transcript: str, report_id: str) -> str:
        """
        Crée une nouvelle session de chat pour une transcription
        
        Args:
            transcript: Le texte de la transcription
            report_id: L'ID du rapport
            
        Returns:
            L'ID de la session de chat
        """
        session_id = f"chat_{report_id}_{int(datetime.now().timestamp())}"
        
        # Créer le contexte initial
        context = {
            "session_id": session_id,
            "report_id": report_id,
            "transcript": transcript,
            "messages": [
                {
                    "role": "system",
                    "content": f"""Tu es un assistant spécialisé dans l'analyse de transcriptions de réunions. 
                    Tu as accès à la transcription complète suivante et tu peux répondre aux questions des utilisateurs 
                    sur son contenu, extraire des informations spécifiques, résumer des sections, etc.
                    
                    Transcription de la réunion:
                    ---
                    {transcript}
                    ---
                    
                    Réponds en français et sois précis dans tes réponses en citant des passages spécifiques quand nécessaire."""
                }
            ],
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat()
        }
        
        # Sauvegarder la session
        self._save_chat_session(context)
        
        return session_id
    
    def send_message(self, session_id: str, message: str) -> Dict[str, Any]:
        """
        Envoie un message dans une session de chat
        
        Args:
            session_id: L'ID de la session
            message: Le message de l'utilisateur
            
        Returns:
            La réponse de l'IA
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "Chat functionality not available - OpenAI API key not configured"
            }
        
        try:
            # Charger la session
            session = self._load_chat_session(session_id)
            if not session:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            # Ajouter le message utilisateur
            session["messages"].append({
                "role": "user",
                "content": message
            })
            
            # Appeler l'API OpenAI
            client = OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=session["messages"],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            # Extraire la réponse
            ai_response = response.choices[0].message.content
            
            # Ajouter la réponse de l'IA
            session["messages"].append({
                "role": "assistant",
                "content": ai_response
            })
            
            # Mettre à jour la dernière activité
            session["last_activity"] = datetime.now().isoformat()
            
            # Sauvegarder la session mise à jour
            self._save_chat_session(session)
            
            return {
                "success": True,
                "response": ai_response,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Récupère l'historique d'une session de chat
        
        Args:
            session_id: L'ID de la session
            
        Returns:
            L'historique des messages
        """
        session = self._load_chat_session(session_id)
        if not session:
            return []
        
        # Retourner seulement les messages utilisateur et assistant (pas le système)
        return [msg for msg in session["messages"] if msg["role"] in ["user", "assistant"]]
    
    def get_suggested_questions(self, transcript: str) -> List[str]:
        """
        Génère des questions suggérées basées sur la transcription
        
        Args:
            transcript: Le texte de la transcription
            
        Returns:
            Liste de questions suggérées
        """
        if not self.enabled:
            return [
                "Quels sont les points clés de cette réunion ?",
                "Qui étaient les participants ?",
                "Quelles décisions ont été prises ?",
                "Y a-t-il des actions à suivre ?"
            ]
        
        try:
            client = OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Génère 5 questions pertinentes que quelqu'un pourrait poser sur cette transcription de réunion. Retourne seulement les questions, une par ligne, sans numérotation."
                    },
                    {
                        "role": "user",
                        "content": f"Transcription: {transcript[:1000]}..."
                    }
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            questions = response.choices[0].message.content.strip().split('\n')
            return [q.strip() for q in questions if q.strip()]
            
        except Exception as e:
            logger.error(f"Error generating suggested questions: {e}")
            return [
                "Quels sont les points clés de cette réunion ?",
                "Qui étaient les participants ?",
                "Quelles décisions ont été prises ?",
                "Y a-t-il des actions à suivre ?"
            ]
    
    def _save_chat_session(self, session: Dict[str, Any]):
        """Sauvegarde une session de chat"""
        try:
            chat_dir = Path("chat_sessions")
            chat_dir.mkdir(exist_ok=True)
            
            session_file = chat_dir / f"{session['session_id']}.json"
            with open(session_file, "w", encoding="utf-8") as f:
                json.dump(session, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Error saving chat session: {e}")
    
    def _load_chat_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Charge une session de chat"""
        try:
            chat_dir = Path("chat_sessions")
            session_file = chat_dir / f"{session_id}.json"
            
            if not session_file.exists():
                return None
            
            with open(session_file, "r", encoding="utf-8") as f:
                return json.load(f)
                
        except Exception as e:
            logger.error(f"Error loading chat session: {e}")
            return None

# Instance globale
transcript_chat = TranscriptChat()







































