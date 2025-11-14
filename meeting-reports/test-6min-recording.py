#!/usr/bin/env python3
"""
Test d'un enregistrement de 6 minutes avec résumé
"""

import requests
import json
import time
import os
from pathlib import Path

def test_6min_recording():
    """Test d'un enregistrement de 6 minutes"""
    print("=== Test d'enregistrement de 6 minutes ===")
    
    # Créer un fichier audio de test de 6 minutes
    print("1. Création d'un fichier audio de test de 6 minutes...")
    
    # Simuler un upload de fichier
    test_file_path = "test_6min_audio.webm"
    
    # Créer un fichier de test (simulation)
    with open(test_file_path, "wb") as f:
        # Écrire des données simulées
        f.write(b"fake_audio_data_for_6min_recording" * 1000)
    
    print(f"Fichier de test créé: {test_file_path}")
    
    # Upload du fichier
    print("\n2. Upload du fichier...")
    try:
        with open(test_file_path, "rb") as f:
            files = {"file": (test_file_path, f, "audio/webm")}
            response = requests.post("http://localhost:8001/upload", files=files)
        
        if response.status_code == 200:
            upload_result = response.json()
            file_id = upload_result["file_id"]
            print(f"Upload réussi: {file_id}")
        else:
            print(f"Erreur upload: {response.status_code}")
            return False
    except Exception as e:
        print(f"Erreur lors de l'upload: {e}")
        return False
    
    # Traitement du fichier
    print("\n3. Traitement du fichier...")
    try:
        response = requests.post(f"http://localhost:8001/process/{file_id}")
        if response.status_code == 200:
            print("Traitement démarré")
        else:
            print(f"Erreur traitement: {response.status_code}")
            return False
    except Exception as e:
        print(f"Erreur lors du traitement: {e}")
        return False
    
    # Attendre la fin du traitement
    print("\n4. Attente de la fin du traitement...")
    max_attempts = 30
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
                    print(f"Statut: {status['status']} - Attente...")
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
    print("\n5. Récupération du rapport...")
    try:
        response = requests.get(f"http://localhost:8001/report/{file_id}")
        if response.status_code == 200:
            report = response.json()
            print("Rapport récupéré!")
            
            # Vérifier le résumé
            print(f"\n6. Vérification du résumé:")
            print(f"  - Résumé: {report.get('summary', 'VIDE')[:100]}...")
            print(f"  - Points clés: {len(report.get('key_points', []))} éléments")
            print(f"  - Actions: {len(report.get('action_items', []))} éléments")
            print(f"  - Participants: {len(report.get('participants', []))} éléments")
            print(f"  - Décisions: {len(report.get('decisions', []))} éléments")
            print(f"  - Prochaines étapes: {report.get('next_steps', 'VIDE')[:100]}...")
            print(f"  - IA activée: {report.get('ai_enhanced', False)}")
            
            # Vérifier si le résumé est généré
            if report.get('summary') and len(report.get('summary', '')) > 10:
                print("\n✅ Résumé généré avec succès!")
                return True
            else:
                print("\n❌ Résumé non généré ou vide")
                return False
        else:
            print(f"Erreur récupération rapport: {response.status_code}")
            return False
    except Exception as e:
        print(f"Erreur lors de la récupération: {e}")
        return False
    finally:
        # Nettoyer le fichier de test
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_6min_recording()















































