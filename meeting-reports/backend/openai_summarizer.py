"""
Module de résumé avec OpenAI
"""

import os
import openai
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class OpenAISummarizer:
    def __init__(self):
        """Initialiser le client OpenAI"""
        # Clé API depuis les variables d'environnement
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = "gpt-3.5-turbo"
        self.max_tokens = 1000
        self.temperature = 0.3
        
        if self.api_key:
            self.enabled = True
            logger.info("OpenAI client initialized successfully with provided API key")
        else:
            self.enabled = False
            logger.warning("OpenAI API key not configured - using fallback summarization")
    
    def summarize_transcript(self, transcript: str, language: str = "fr") -> Dict[str, str]:
        """
        Résumer une transcription avec OpenAI
        
        Args:
            transcript: Le texte de la transcription
            language: Langue du résumé (fr, en, etc.)
            
        Returns:
            Dict contenant le résumé, les points clés et les actions
        """
        if not self.enabled:
            return self._fallback_summary(transcript)
        
        try:
            # Créer le prompt pour le résumé
            prompt = self._create_summary_prompt(transcript, language)
            
            # Appeler l'API OpenAI (nouvelle version)
            client = openai.OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"Tu es un assistant spécialisé dans le résumé de réunions en {language}."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            # Extraire la réponse
            summary_text = response.choices[0].message.content
            
            # Parser la réponse structurée
            return self._parse_summary_response(summary_text)
            
        except Exception as e:
            logger.error(f"Erreur OpenAI: {e}")
            return self._fallback_summary(transcript)
    
    def _create_summary_prompt(self, transcript: str, language: str) -> str:
        """Créer le prompt pour OpenAI"""
        if language == "fr":
            return f"""
Analyse cette transcription de réunion et fournis un résumé structuré en français.

Transcription:
{transcript}

Fournis ta réponse au format JSON suivant:
{{
    "summary": "Résumé concis de la réunion en 2-3 phrases",
    "key_points": ["Point clé 1", "Point clé 2", "Point clé 3"],
    "action_items": ["Action 1", "Action 2", "Action 3"],
    "participants": ["Participant 1", "Participant 2"],
    "decisions": ["Décision 1", "Décision 2"],
    "next_steps": "Prochaines étapes recommandées"
}}

Assure-toi que:
- Le résumé soit concis et informatif
- Les points clés soient les plus importants
- Les actions soient spécifiques et mesurables
- Les participants soient identifiés si possible
- Les décisions soient clairement énoncées
"""
        else:
            return f"""
Analyze this meeting transcript and provide a structured summary in English.

Transcript:
{transcript}

Provide your response in the following JSON format:
{{
    "summary": "Concise meeting summary in 2-3 sentences",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
    "action_items": ["Action 1", "Action 2", "Action 3"],
    "participants": ["Participant 1", "Participant 2"],
    "decisions": ["Decision 1", "Decision 2"],
    "next_steps": "Recommended next steps"
}}

Ensure that:
- The summary is concise and informative
- Key points are the most important ones
- Actions are specific and measurable
- Participants are identified if possible
- Decisions are clearly stated
"""
    
    def _parse_summary_response(self, response_text: str) -> Dict[str, Any]:
        """Parser la réponse JSON d'OpenAI"""
        try:
            import json
            import re
            
            # Nettoyer la réponse
            cleaned_response = response_text.strip()
            
            # Si la réponse commence par des guillemets, les enlever
            if cleaned_response.startswith('"') and cleaned_response.endswith('"'):
                cleaned_response = cleaned_response[1:-1]
            
            # Essayer de trouver un objet JSON complet
            json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            
            # Essayer de parser le JSON directement
            return json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.warning(f"Erreur de parsing JSON: {e}")
            logger.warning(f"Réponse reçue: {response_text[:200]}...")
            # Si ce n'est pas du JSON valide, essayer d'extraire les sections
            return self._extract_sections_from_text(response_text)
    
    def _extract_sections_from_text(self, text: str) -> Dict[str, Any]:
        """Extraire les sections du texte si le JSON n'est pas valide"""
        sections = {
            "summary": "",
            "key_points": [],
            "action_items": [],
            "participants": [],
            "decisions": [],
            "next_steps": ""
        }
        
        lines = text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Détecter les sections
            if "summary" in line.lower() or "résumé" in line.lower():
                current_section = "summary"
            elif "key points" in line.lower() or "points clés" in line.lower():
                current_section = "key_points"
            elif "action" in line.lower() or "action" in line.lower():
                current_section = "action_items"
            elif "participant" in line.lower():
                current_section = "participants"
            elif "decision" in line.lower() or "décision" in line.lower():
                current_section = "decisions"
            elif "next step" in line.lower() or "prochaine" in line.lower():
                current_section = "next_steps"
            elif line.startswith('-') or line.startswith('•'):
                # Ajouter à la liste actuelle
                if current_section and current_section in sections:
                    if isinstance(sections[current_section], list):
                        sections[current_section].append(line[1:].strip())
            else:
                # Ajouter au texte actuel
                if current_section and isinstance(sections[current_section], str):
                    sections[current_section] += " " + line
        
        return sections
    
    def _fallback_summary(self, transcript: str) -> Dict[str, str]:
        """Résumé de fallback sans OpenAI"""
        words = transcript.split()
        word_count = len(words)
        
        # Résumé simple basé sur la longueur
        if word_count < 50:
            summary = "Réunion courte avec peu de contenu."
        elif word_count < 200:
            summary = "Réunion de durée moyenne avec plusieurs points abordés."
        else:
            summary = "Réunion longue avec de nombreux sujets discutés."
        
        return {
            "summary": summary,
            "key_points": [transcript[:100] + "..." if len(transcript) > 100 else transcript],
            "action_items": ["Analyser la transcription pour identifier les actions"],
            "participants": ["Participants non identifiés"],
            "decisions": ["Décisions à extraire de la transcription"],
            "next_steps": "Réviser la transcription pour planifier les prochaines étapes"
        }

# Instance globale
summarizer = OpenAISummarizer()
