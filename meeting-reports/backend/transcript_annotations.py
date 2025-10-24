import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class TranscriptAnnotations:
    def __init__(self):
        self.annotations_dir = Path("annotations")
        self.annotations_dir.mkdir(exist_ok=True)
    
    def add_annotation(self, report_id: str, annotation: Dict[str, Any]) -> bool:
        """
        Ajoute une annotation à une transcription
        
        Args:
            report_id: L'ID du rapport
            annotation: Les données de l'annotation
            
        Returns:
            True si l'annotation a été ajoutée avec succès
        """
        try:
            # Charger les annotations existantes
            annotations = self._load_annotations(report_id)
            
            # Ajouter un ID unique et un timestamp
            annotation_id = f"ann_{int(datetime.now().timestamp() * 1000)}"
            annotation["id"] = annotation_id
            annotation["created_at"] = datetime.now().isoformat()
            
            # Ajouter l'annotation
            annotations.append(annotation)
            
            # Sauvegarder
            self._save_annotations(report_id, annotations)
            
            logger.info(f"Annotation ajoutée: {annotation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding annotation: {e}")
            return False
    
    def get_annotations(self, report_id: str) -> List[Dict[str, Any]]:
        """
        Récupère toutes les annotations d'un rapport
        
        Args:
            report_id: L'ID du rapport
            
        Returns:
            Liste des annotations
        """
        return self._load_annotations(report_id)
    
    def update_annotation(self, report_id: str, annotation_id: str, updates: Dict[str, Any]) -> bool:
        """
        Met à jour une annotation existante
        
        Args:
            report_id: L'ID du rapport
            annotation_id: L'ID de l'annotation
            updates: Les mises à jour à appliquer
            
        Returns:
            True si la mise à jour a réussi
        """
        try:
            annotations = self._load_annotations(report_id)
            
            # Trouver l'annotation
            for i, annotation in enumerate(annotations):
                if annotation.get("id") == annotation_id:
                    # Mettre à jour
                    annotations[i].update(updates)
                    annotations[i]["updated_at"] = datetime.now().isoformat()
                    
                    # Sauvegarder
                    self._save_annotations(report_id, annotations)
                    
                    logger.info(f"Annotation mise à jour: {annotation_id}")
                    return True
            
            logger.warning(f"Annotation non trouvée: {annotation_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error updating annotation: {e}")
            return False
    
    def delete_annotation(self, report_id: str, annotation_id: str) -> bool:
        """
        Supprime une annotation
        
        Args:
            report_id: L'ID du rapport
            annotation_id: L'ID de l'annotation
            
        Returns:
            True si la suppression a réussi
        """
        try:
            annotations = self._load_annotations(report_id)
            
            # Filtrer l'annotation à supprimer
            original_count = len(annotations)
            annotations = [ann for ann in annotations if ann.get("id") != annotation_id]
            
            if len(annotations) < original_count:
                # Sauvegarder
                self._save_annotations(report_id, annotations)
                logger.info(f"Annotation supprimée: {annotation_id}")
                return True
            else:
                logger.warning(f"Annotation non trouvée: {annotation_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting annotation: {e}")
            return False
    
    def create_timestamp_marker(self, report_id: str, timestamp: float, text: str, 
                              marker_type: str = "note") -> bool:
        """
        Crée un marqueur temporel
        
        Args:
            report_id: L'ID du rapport
            timestamp: Le timestamp en secondes
            text: Le texte du marqueur
            marker_type: Le type de marqueur (note, action, decision, etc.)
            
        Returns:
            True si le marqueur a été créé
        """
        marker = {
            "type": "timestamp_marker",
            "timestamp": timestamp,
            "text": text,
            "marker_type": marker_type,
            "created_at": datetime.now().isoformat()
        }
        
        return self.add_annotation(report_id, marker)
    
    def create_highlight(self, report_id: str, start_time: float, end_time: float, 
                        text: str, highlight_type: str = "important") -> bool:
        """
        Crée un surlignage de section
        
        Args:
            report_id: L'ID du rapport
            start_time: Temps de début en secondes
            end_time: Temps de fin en secondes
            text: Le texte surligné
            highlight_type: Le type de surlignage
            
        Returns:
            True si le surlignage a été créé
        """
        highlight = {
            "type": "highlight",
            "start_time": start_time,
            "end_time": end_time,
            "text": text,
            "highlight_type": highlight_type,
            "created_at": datetime.now().isoformat()
        }
        
        return self.add_annotation(report_id, highlight)
    
    def create_action_item(self, report_id: str, text: str, assignee: str = None, 
                          priority: str = "medium", due_date: str = None) -> bool:
        """
        Crée un élément d'action
        
        Args:
            report_id: L'ID du rapport
            text: Le texte de l'action
            assignee: La personne assignée
            priority: La priorité (low, medium, high)
            due_date: La date d'échéance
            
        Returns:
            True si l'élément d'action a été créé
        """
        action_item = {
            "type": "action_item",
            "text": text,
            "assignee": assignee,
            "priority": priority,
            "due_date": due_date,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        return self.add_annotation(report_id, action_item)
    
    def get_annotations_by_type(self, report_id: str, annotation_type: str) -> List[Dict[str, Any]]:
        """
        Récupère les annotations d'un type spécifique
        
        Args:
            report_id: L'ID du rapport
            annotation_type: Le type d'annotation
            
        Returns:
            Liste des annotations du type spécifié
        """
        annotations = self._load_annotations(report_id)
        return [ann for ann in annotations if ann.get("type") == annotation_type]
    
    def _load_annotations(self, report_id: str) -> List[Dict[str, Any]]:
        """Charge les annotations d'un rapport"""
        try:
            annotation_file = self.annotations_dir / f"{report_id}_annotations.json"
            
            if not annotation_file.exists():
                return []
            
            with open(annotation_file, "r", encoding="utf-8") as f:
                return json.load(f)
                
        except Exception as e:
            logger.error(f"Error loading annotations: {e}")
            return []
    
    def _save_annotations(self, report_id: str, annotations: List[Dict[str, Any]]):
        """Sauvegarde les annotations d'un rapport"""
        try:
            annotation_file = self.annotations_dir / f"{report_id}_annotations.json"
            
            with open(annotation_file, "w", encoding="utf-8") as f:
                json.dump(annotations, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Error saving annotations: {e}")

# Instance globale
transcript_annotations = TranscriptAnnotations()



















