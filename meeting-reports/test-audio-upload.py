#!/usr/bin/env python3
"""
Script de test pour l'upload et traitement d'audio
"""

import requests
import time
import json
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8001"
FRONTEND_URL = "http://localhost:3001"

def test_health():
    """Test de santé du backend"""
    print("[TEST] Test de santé du backend...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Backend OK - Whisper: {data.get('whisper_loaded', False)}")
            return True
        else:
            print(f"[ERROR] Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur connexion backend: {e}")
        return False

def test_reports():
    """Test de récupération des rapports"""
    print("\n[TEST] Test des rapports...")
    try:
        response = requests.get(f"{BACKEND_URL}/reports")
        if response.status_code == 200:
            reports = response.json()
            print(f"[OK] {len(reports)} rapport(s) trouve(s)")
            for report in reports[:3]:  # Afficher les 3 premiers
                print(f"   - {report.get('title', 'Sans titre')} ({report.get('created_at', 'N/A')})")
            return True
        else:
            print(f"[ERROR] Erreur recuperation rapports: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False

def create_test_audio():
    """Créer un fichier audio de test simple"""
    print("\n[TEST] Creation d'un fichier audio de test...")
    
    # Créer un fichier WAV simple (1 seconde de silence)
    import wave
    import struct
    
    sample_rate = 16000
    duration = 1  # 1 seconde
    frequency = 440  # La note A4
    
    # Générer une onde sinusoïdale simple
    samples = []
    for i in range(int(sample_rate * duration)):
        value = int(32767 * 0.1 * (i / sample_rate))  # Amplitude faible
        samples.append(struct.pack('<h', value))
    
    # Sauvegarder le fichier WAV
    test_file = "test_audio.wav"
    with wave.open(test_file, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16 bits
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b''.join(samples))
    
    print(f"[OK] Fichier de test cree: {test_file}")
    return test_file

def test_audio_upload(audio_file):
    """Test d'upload d'un fichier audio"""
    print(f"\n[TEST] Test d'upload: {audio_file}")
    
    if not os.path.exists(audio_file):
        print(f"[ERROR] Fichier non trouve: {audio_file}")
        return False
    
    try:
        # Upload du fichier
        with open(audio_file, 'rb') as f:
            files = {'file': (audio_file, f, 'audio/wav')}
            response = requests.post(f"{BACKEND_URL}/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            file_id = data.get('id')
            print(f"[OK] Upload reussi - ID: {file_id}")
            
            # Demarrer le traitement
            process_response = requests.post(f"{BACKEND_URL}/process/{file_id}")
            if process_response.status_code == 200:
                print("[OK] Traitement demarre")
                
                # Surveiller le statut
                print("[WAIT] Surveillance du traitement...")
                for i in range(30):  # Attendre max 30 secondes
                    time.sleep(1)
                    status_response = requests.get(f"{BACKEND_URL}/status/{file_id}")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        status = status_data.get('status')
                        progress = status_data.get('progress', 0)
                        message = status_data.get('message', '')
                        
                        print(f"   {progress}% - {status} - {message}")
                        
                        if status == 'completed':
                            print("[OK] Traitement termine avec succes!")
                            return True
                        elif status == 'error':
                            print(f"[ERROR] Erreur de traitement: {message}")
                            return False
                    else:
                        print(f"[ERROR] Erreur statut: {status_response.status_code}")
                        return False
                
                print("[TIMEOUT] Timeout - traitement trop long")
                return False
            else:
                print(f"[ERROR] Erreur demarrage traitement: {process_response.status_code}")
                return False
        else:
            print(f"[ERROR] Erreur upload: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False

def cleanup_test_files():
    """Nettoyer les fichiers de test"""
    print("\n[CLEANUP] Nettoyage...")
    test_files = ["test_audio.wav"]
    for file in test_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"[OK] Supprime: {file}")

def main():
    """Fonction principale de test"""
    print("=== Test de l'application Meeting Reports ===")
    print("=" * 50)
    
    # Tests
    if not test_health():
        print("\n[ERROR] Backend non disponible - arret des tests")
        return
    
    test_reports()
    
    # Creer et tester un fichier audio
    audio_file = create_test_audio()
    
    try:
        test_audio_upload(audio_file)
    finally:
        cleanup_test_files()
    
    print("\n" + "=" * 50)
    print("[OK] Tests termines")
    print(f"Frontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")

if __name__ == "__main__":
    main()
