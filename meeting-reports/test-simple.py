#!/usr/bin/env python3
"""
Test simple de l'application
"""

import requests
import time

def test_upload_and_process():
    """Test simple d'upload et traitement"""
    print("=== Test Simple Meeting Reports ===")
    
    # Test de santé
    print("[1] Test de sante...")
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            print("[OK] Backend fonctionne")
        else:
            print("[ERROR] Backend ne repond pas")
            return
    except Exception as e:
        print(f"[ERROR] Erreur connexion: {e}")
        return
    
    # Test d'upload d'un fichier existant
    print("\n[2] Test d'upload...")
    
    # Utiliser un fichier existant
    test_file = "backend/uploads/cf03fd87-2926-4fa2-a1df-aad62af306c0.wav"
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'audio/wav')}
            response = requests.post("http://localhost:8001/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            file_id = data.get('id')
            print(f"[OK] Upload reussi - ID: {file_id}")
            
            # Demarrer le traitement
            print("\n[3] Demarrage du traitement...")
            process_response = requests.post(f"http://localhost:8001/process/{file_id}")
            
            if process_response.status_code == 200:
                print("[OK] Traitement demarre")
                
                # Surveiller le statut
                print("\n[4] Surveillance...")
                for i in range(20):
                    time.sleep(1)
                    status_response = requests.get(f"http://localhost:8001/status/{file_id}")
                    
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        status = status_data.get('status')
                        progress = status_data.get('progress', 0)
                        message = status_data.get('message', '')
                        
                        print(f"   {progress}% - {status} - {message}")
                        
                        if status == 'completed':
                            print("\n[SUCCESS] Traitement termine!")
                            
                            # Afficher le rapport
                            reports_response = requests.get("http://localhost:8001/reports")
                            if reports_response.status_code == 200:
                                reports = reports_response.json()
                                print(f"\n[INFO] {len(reports)} rapport(s) genere(s)")
                                for report in reports:
                                    print(f"   - {report.get('title', 'Sans titre')}")
                            
                            return True
                        elif status == 'error':
                            print(f"\n[ERROR] Erreur: {message}")
                            return False
                    else:
                        print(f"[ERROR] Erreur statut: {status_response.status_code}")
                        return False
                
                print("\n[TIMEOUT] Traitement trop long")
                return False
            else:
                print(f"[ERROR] Erreur demarrage: {process_response.status_code}")
                return False
        else:
            print(f"[ERROR] Erreur upload: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False

if __name__ == "__main__":
    test_upload_and_process()





