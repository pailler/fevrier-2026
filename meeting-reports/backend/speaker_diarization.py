import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import torch
import torchaudio
from pyannote.audio import Pipeline
from pyannote.core import Segment
import tempfile
import shutil

logger = logging.getLogger(__name__)

class SpeakerDiarizer:
    def __init__(self):
        self.pipeline = None
        self.enabled = False
        self._initialize_pipeline()
    
    def _initialize_pipeline(self):
        """Initialise le pipeline de diarisation des locuteurs"""
        try:
            # Vérifier si un token Hugging Face est disponible
            hf_token = os.getenv("HUGGINGFACE_TOKEN")
            if not hf_token:
                logger.warning("HUGGINGFACE_TOKEN non configuré - diarisation désactivée")
                return
            
            # Initialiser le pipeline pyannote
            self.pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=hf_token
            )
            self.enabled = True
            logger.info("Pipeline de diarisation initialisé avec succès")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la diarisation: {e}")
            self.enabled = False
    
    def diarize_speakers(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        Identifie les différents locuteurs dans un fichier audio
        
        Args:
            audio_path: Chemin vers le fichier audio
            
        Returns:
            Liste des segments avec identification des locuteurs
        """
        if not self.enabled or not self.pipeline:
            logger.warning("Diarisation non disponible")
            return []
        
        try:
            logger.info(f"Début de la diarisation pour: {audio_path}")
            
            # Appliquer la diarisation
            diarization = self.pipeline(audio_path)
            
            # Convertir les résultats en format utilisable
            speakers = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                speakers.append({
                    "start": turn.start,
                    "end": turn.end,
                    "speaker": speaker,
                    "duration": turn.end - turn.start
                })
            
            logger.info(f"Diarisation terminée: {len(speakers)} segments trouvés")
            return speakers
            
        except Exception as e:
            logger.error(f"Erreur lors de la diarisation: {e}")
            return []
    
    def get_speaker_statistics(self, speakers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcule les statistiques des locuteurs
        
        Args:
            speakers: Liste des segments de locuteurs
            
        Returns:
            Statistiques des locuteurs
        """
        if not speakers:
            return {}
        
        # Compter le temps de parole par locuteur
        speaker_times = {}
        speaker_counts = {}
        
        for segment in speakers:
            speaker = segment["speaker"]
            duration = segment["duration"]
            
            if speaker not in speaker_times:
                speaker_times[speaker] = 0
                speaker_counts[speaker] = 0
            
            speaker_times[speaker] += duration
            speaker_counts[speaker] += 1
        
        # Calculer le temps total
        total_time = sum(speaker_times.values())
        
        # Créer les statistiques
        stats = {
            "total_speakers": len(speaker_times),
            "total_time": total_time,
            "speakers": []
        }
        
        for speaker, time in speaker_times.items():
            percentage = (time / total_time) * 100 if total_time > 0 else 0
            stats["speakers"].append({
                "speaker": speaker,
                "total_time": time,
                "percentage": round(percentage, 2),
                "segment_count": speaker_counts[speaker]
            })
        
        # Trier par temps de parole décroissant
        stats["speakers"].sort(key=lambda x: x["total_time"], reverse=True)
        
        return stats
    
    def merge_with_transcript(self, transcript: str, speakers: List[Dict[str, Any]], 
                            word_timestamps: Optional[List[Dict]] = None) -> List[Dict[str, Any]]:
        """
        Fusionne la diarisation avec la transcription
        
        Args:
            transcript: Texte transcrit
            speakers: Segments de locuteurs
            word_timestamps: Timestamps des mots (optionnel)
            
        Returns:
            Transcription avec identification des locuteurs
        """
        if not speakers:
            return [{"text": transcript, "speaker": "Unknown", "start": 0, "end": 0}]
        
        # Pour l'instant, une implémentation simple
        # Dans une version plus avancée, on pourrait utiliser les word_timestamps
        # pour une correspondance plus précise
        
        result = []
        words = transcript.split()
        words_per_speaker = len(words) // len(speakers) if speakers else 0
        
        current_word = 0
        for i, segment in enumerate(speakers):
            # Calculer le nombre de mots pour ce segment
            if i == len(speakers) - 1:
                # Dernier segment, prendre tous les mots restants
                segment_words = words[current_word:]
            else:
                segment_words = words[current_word:current_word + words_per_speaker]
            
            if segment_words:
                result.append({
                    "text": " ".join(segment_words),
                    "speaker": segment["speaker"],
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"]
                })
                current_word += len(segment_words)
        
        return result

# Instance globale
speaker_diarizer = SpeakerDiarizer()










