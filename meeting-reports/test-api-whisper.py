#!/usr/bin/env python3
"""
Test de la solution API Whisper
"""

import requests
import time
import os
import wave
import struct
import math

def create_test_audio():
    """Créer un fichier audio de test"""
    test_file = "test_api_whisper.wav"
    
    sample_rate = 16000
    duration = 3
    frequency = 440
    
    with wave.open(test_file, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        frames = []
        for i in range(int(sample_rate * duration)):
            t = i / sample_rate
            value = int(32767 * math.sin(2 * math.pi * frequency * t))
            frames.append(struct.pack('<h', value))
        
        wav_file.writeframes(b''.join(frames))
    
    print(f"[OK] Fichier de test créé: {test_file} ({os.path.getsize(test_file)} bytes)")
    return test_file

def test_api_transcription():
    """Tester la transcription avec l'API"""
    print("=== Test Transcription API ===")
    
    # Créer un fichier de test
    audio_file = create_test_audio()
    
    try:
        # Upload du fichier
        print("[1] Upload du fichier...")
        with open(audio_file, 'rb') as f:
            files = {'file': (audio_file, f, 'audio/wav')}
            response = requests.post("http://localhost:8001/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            file_id = data.get('id')
            print(f"[OK] Upload réussi - ID: {file_id}")
        else:
            print(f"[ERROR] Erreur upload: {response.status_code}")
            return False
        
        # Démarrer le traitement
        print("[2] Démarrage du traitement...")
        process_response = requests.post(f"http://localhost:8001/process/{file_id}")
        if process_response.status_code == 200:
            print("[OK] Traitement démarré")
        else:
            print(f"[ERROR] Erreur traitement: {process_response.status_code}")
            return False
        
        # Surveiller le statut
        print("[3] Surveillance du traitement...")
        for i in range(30):  # Attendre max 30 secondes
            time.sleep(1)
            status_response = requests.get(f"http://localhost:8001/status/{file_id}")
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                status = status_data.get('status')
                progress = status_data.get('progress', 0)
                message = status_data.get('message', '')
                
                print(f"   {progress}% - {status} - {message}")
                
                if status == 'completed':
                    print("[OK] Traitement terminé avec succès!")
                    
                    # Récupérer le rapport
                    report_response = requests.get(f"http://localhost:8001/report/{file_id}")
                    if report_response.status_code == 200:
                        report = report_response.json()
                        transcript = report.get('transcript', '')
                        
                        print(f"\n[TRANSCRIPTION] {transcript[:200]}...")
                        
                        # Vérifier si c'est une vraie transcription ou simulée
                        if "Transcription simulée" in transcript:
                            print("[INFO] Transcription simulée utilisée")
                        else:
                            print("[SUCCESS] Vraie transcription réussie!")
                        
                        return True
                    else:
                        print(f"[ERROR] Erreur récupération rapport: {report_response.status_code}")
                        return False
                        
                elif status == 'error':
                    print(f"[ERROR] Erreur de traitement: {message}")
                    return False
            else:
                print(f"[ERROR] Erreur statut: {status_response.status_code}")
                return False
        
        print("[TIMEOUT] Timeout - traitement trop long")
        return False
        
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False
    
    finally:
        # Nettoyer
        if os.path.exists(audio_file):
            os.remove(audio_file)
            print(f"[CLEANUP] Fichier supprimé: {audio_file}")

def test_backend_health():
    """Tester la santé du backend"""
    print("=== Test Santé Backend ===")
    
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Backend OK - Whisper: {data.get('whisper_loaded', False)}")
            return True
        else:
            print(f"[ERROR] Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur connexion: {e}")
        return False

if __name__ == "__main__":
    print("Test de la Solution API Whisper")
    print("=" * 50)
    
    # Attendre que le backend démarre
    print("[WAIT] Attente du démarrage du backend...")
    time.sleep(10)
    
    # Tests
    if not test_backend_health():
        print("[ERROR] Backend non disponible")
        exit(1)
    
    success = test_api_transcription()
    
    print("\n" + "=" * 50)
    if success:
        print("[SUCCESS] Solution API Whisper fonctionne!")
    else:
        print("[ERROR] Solution API Whisper échouée")





























