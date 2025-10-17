#!/usr/bin/env python3
"""
Test avec un vrai fichier audio pour vérifier le résumé
"""

import requests
import json
import time
import os
from pathlib import Path

def test_real_audio_summary():
    """Test avec un vrai fichier audio"""
    print("=== Test avec un vrai fichier audio ===")
    
    # Utiliser un fichier audio existant
    uploads_dir = Path("backend/uploads")
    if not uploads_dir.exists():
        print("Dossier uploads non trouvé")
        return False
    
    # Trouver un fichier audio existant
    audio_files = list(uploads_dir.glob("*.webm")) + list(uploads_dir.glob("*.wav")) + list(uploads_dir.glob("*.mp3"))
    if not audio_files:
        print("Aucun fichier audio trouvé")
        return False
    
    # Prendre le plus récent
    latest_file = max(audio_files, key=lambda x: x.stat().st_mtime)
    print(f"Fichier audio trouvé: {latest_file}")
    print(f"Taille: {latest_file.stat().st_size} bytes")
    
    # Upload du fichier
    print("\n1. Upload du fichier...")
    try:
        with open(latest_file, "rb") as f:
            files = {"file": (latest_file.name, f, "audio/webm" if latest_file.suffix == ".webm" else "audio/wav")}
            response = requests.post("http://localhost:8001/upload", files=files)
        
        if response.status_code == 200:
            upload_result = response.json()
            file_id = upload_result.get("id") or upload_result.get("file_id")
            if not file_id:
                print(f"Erreur: pas d'ID dans la réponse: {upload_result}")
                return False
            print(f"Upload réussi: {file_id}")
        else:
            print(f"Erreur upload: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Erreur lors de l'upload: {e}")
        return False
    
    # Traitement du fichier
    print("\n2. Traitement du fichier...")
    try:
        response = requests.post(f"http://localhost:8001/process/{file_id}")
        if response.status_code == 200:
            print("Traitement démarré")
        else:
            print(f"Erreur traitement: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Erreur lors du traitement: {e}")
        return False
    
    # Attendre la fin du traitement
    print("\n3. Attente de la fin du traitement...")
    max_attempts = 60  # 2 minutes max
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"http://localhost:8001/status/{file_id}")
            if response.status_code == 200:
                status = response.json()
                if status["status"] == "completed":
                    print("Traitement terminé!")
                    break
                elif status["status"] == "error":
                    print(f"Erreur de traitement: {status.get('error', 'Unknown error')}")
                    return False
                else:
                    print(f"Statut: {status['status']} - Attente... ({attempt+1}/{max_attempts})")
                    time.sleep(2)
            else:
                print(f"Erreur de statut: {response.status_code}")
                time.sleep(2)
        except Exception as e:
            print(f"Erreur lors de la vérification: {e}")
            time.sleep(2)
    else:
        print("Timeout - traitement non terminé")
        return False
    
    # Récupérer le rapport
    print("\n4. Récupération du rapport...")
    try:
        response = requests.get(f"http://localhost:8001/report/{file_id}")
        if response.status_code == 200:
            report = response.json()
            print("Rapport récupéré!")
            
            # Vérifier le résumé
            print(f"\n5. Vérification du résumé:")
            print(f"  - ID: {report.get('id')}")
            print(f"  - Fichier: {report.get('filename')}")
            print(f"  - Durée estimée: {report.get('duration_minutes')} minutes")
            print(f"  - Nombre de mots: {report.get('word_count')}")
            print(f"  - IA activée: {report.get('ai_enhanced')}")
            
            print(f"\n  - Résumé: {report.get('summary', 'VIDE')}")
            print(f"  - Points clés: {report.get('key_points', [])}")
            print(f"  - Actions: {report.get('action_items', [])}")
            print(f"  - Participants: {report.get('participants', [])}")
            print(f"  - Décisions: {report.get('decisions', [])}")
            print(f"  - Prochaines étapes: {report.get('next_steps', 'VIDE')}")
            
            # Vérifier si le résumé est généré
            summary = report.get('summary', '')
            key_points = report.get('key_points', [])
            
            if summary and len(summary) > 10 and key_points and len(key_points) > 0:
                print("\n✅ Résumé généré avec succès!")
                print(f"   Résumé: {summary[:200]}...")
                print(f"   Points clés: {len(key_points)} éléments")
                return True
            else:
                print("\n❌ Résumé non généré ou incomplet")
                print(f"   Résumé vide: {not summary or len(summary) <= 10}")
                print(f"   Points clés vides: {not key_points or len(key_points) == 0}")
                return False
        else:
            print(f"Erreur récupération rapport: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Erreur lors de la récupération: {e}")
        return False

if __name__ == "__main__":
    test_real_audio_summary()
