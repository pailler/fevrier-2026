#!/usr/bin/env python3
"""
Script pour diagnostiquer et résoudre le problème de transcription Whisper
"""

import os
import subprocess
import sys
from pathlib import Path

def check_whisper_installation():
    """Vérifier l'installation de Whisper"""
    print("=== Diagnostic Whisper ===")
    
    try:
        import whisper
        print("[OK] Whisper importé avec succès")
        
        # Vérifier la version
        print(f"[INFO] Version Whisper: {whisper.__version__}")
        
        # Vérifier les modèles disponibles
        print("[INFO] Modèles disponibles:")
        models = whisper.available_models()
        for model in models[:5]:  # Afficher les 5 premiers
            print(f"  - {model}")
        
        return True
        
    except ImportError as e:
        print(f"[ERROR] Whisper non installé: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Erreur Whisper: {e}")
        return False

def check_ffmpeg():
    """Vérifier FFmpeg"""
    print("\n=== Diagnostic FFmpeg ===")
    
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("[OK] FFmpeg installé")
            print(f"[INFO] Version: {result.stdout.split('ffmpeg version')[1].split()[0]}")
            return True
        else:
            print("[ERROR] FFmpeg non fonctionnel")
            return False
    except FileNotFoundError:
        print("[ERROR] FFmpeg non trouvé")
        return False
    except Exception as e:
        print(f"[ERROR] Erreur FFmpeg: {e}")
        return False

def test_whisper_with_sample():
    """Tester Whisper avec un fichier audio simple"""
    print("\n=== Test Whisper avec Fichier Simple ===")
    
    try:
        import whisper
        
        # Créer un fichier audio de test simple
        test_file = "test_whisper.wav"
        print(f"[INFO] Création du fichier de test: {test_file}")
        
        # Créer un fichier WAV simple avec des données audio
        import wave
        import struct
        import math
        
        sample_rate = 16000
        duration = 2  # 2 secondes
        frequency = 440  # La note A4
        
        with wave.open(test_file, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16 bits
            wav_file.setframerate(sample_rate)
            
            # Générer un signal audio simple (tone)
            frames = []
            for i in range(int(sample_rate * duration)):
                value = int(32767 * math.sin(2 * math.pi * frequency * i / sample_rate))
                frames.append(struct.pack('<h', value))
            
            wav_file.writeframes(b''.join(frames))
        
        print(f"[OK] Fichier de test créé: {os.path.getsize(test_file)} bytes")
        
        # Tester Whisper
        print("[INFO] Test de transcription avec Whisper...")
        model = whisper.load_model("base")
        
        # Essayer avec le chemin absolu
        abs_path = os.path.abspath(test_file)
        print(f"[INFO] Chemin absolu: {abs_path}")
        
        result = model.transcribe(abs_path)
        print(f"[OK] Transcription réussie: '{result['text']}'")
        
        # Nettoyer
        os.remove(test_file)
        return True
        
    except Exception as e:
        print(f"[ERROR] Erreur test Whisper: {e}")
        # Nettoyer en cas d'erreur
        if os.path.exists("test_whisper.wav"):
            os.remove("test_whisper.wav")
        return False

def check_audio_files():
    """Vérifier les fichiers audio existants"""
    print("\n=== Vérification des Fichiers Audio ===")
    
    uploads_dir = Path("meeting-reports/backend/uploads")
    if not uploads_dir.exists():
        print("[ERROR] Dossier uploads non trouvé")
        return False
    
    files = list(uploads_dir.glob("*"))
    print(f"[INFO] {len(files)} fichier(s) trouvé(s)")
    
    for file in files[:5]:  # Vérifier les 5 premiers
        print(f"[FILE] {file.name}")
        print(f"  - Taille: {file.stat().st_size} bytes")
        print(f"  - Existe: {file.exists()}")
        print(f"  - Chemin absolu: {file.absolute()}")
        
        # Tester l'accès au fichier
        try:
            with open(file, 'rb') as f:
                header = f.read(12)
                print(f"  - Header: {header[:4]}")
        except Exception as e:
            print(f"  - Erreur lecture: {e}")
    
    return True

def suggest_solutions():
    """Suggérer des solutions"""
    print("\n=== Solutions Suggérées ===")
    
    print("1. Problème de permissions Windows:")
    print("   - Exécuter en tant qu'administrateur")
    print("   - Vérifier les permissions du dossier uploads")
    
    print("\n2. Problème de chemin Windows:")
    print("   - Utiliser des chemins avec des slashes normaux")
    print("   - Éviter les caractères spéciaux dans les noms de fichiers")
    
    print("\n3. Alternative FFmpeg:")
    print("   - Installer FFmpeg pour la conversion audio")
    print("   - Utiliser des formats audio compatibles")
    
    print("\n4. Solution Docker:")
    print("   - Utiliser Docker pour isoler l'environnement")
    print("   - Éviter les problèmes de compatibilité Windows")

if __name__ == "__main__":
    print("Diagnostic du Problème de Transcription Whisper")
    print("=" * 60)
    
    # Tests
    whisper_ok = check_whisper_installation()
    ffmpeg_ok = check_ffmpeg()
    test_ok = test_whisper_with_sample() if whisper_ok else False
    files_ok = check_audio_files()
    
    # Solutions
    suggest_solutions()
    
    print("\n" + "=" * 60)
    print("RÉSUMÉ DU DIAGNOSTIC")
    print("=" * 60)
    
    print(f"Whisper: {'OK' if whisper_ok else 'ERREUR'}")
    print(f"FFmpeg: {'OK' if ffmpeg_ok else 'ERREUR'}")
    print(f"Test transcription: {'OK' if test_ok else 'ERREUR'}")
    print(f"Fichiers audio: {'OK' if files_ok else 'ERREUR'}")
    
    if not test_ok:
        print("\n[RECOMMANDATION] Le problème semble être lié à l'accès aux fichiers sur Windows.")
        print("L'application fonctionne avec une transcription simulée pour la démonstration.")




















