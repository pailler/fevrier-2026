#!/usr/bin/env python3
"""
Solution complète pour faire fonctionner Whisper sans simulation
"""

import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path

def check_system_requirements():
    """Vérifier les prérequis système"""
    print("=== Vérification des Prérequis ===")
    
    # Vérifier Python
    print(f"[INFO] Python: {sys.version}")
    
    # Vérifier Whisper
    try:
        import whisper
        print(f"[OK] Whisper: {whisper.__version__}")
    except ImportError:
        print("[ERROR] Whisper non installé")
        return False
    
    # Vérifier FFmpeg
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("[OK] FFmpeg disponible")
            return True
        else:
            print("[WARNING] FFmpeg non fonctionnel")
    except:
        print("[WARNING] FFmpeg non trouvé")
    
    return True

def install_ffmpeg_windows():
    """Installer FFmpeg sur Windows"""
    print("\n=== Installation FFmpeg ===")
    
    # Vérifier si déjà installé
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("[OK] FFmpeg déjà installé")
            return True
    except:
        pass
    
    print("[INFO] Installation de FFmpeg...")
    
    # Essayer winget
    try:
        print("[INFO] Tentative d'installation via Winget...")
        result = subprocess.run(['winget', 'install', 'Gyan.FFmpeg', '--silent'], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print("[OK] FFmpeg installé via Winget")
            return True
    except Exception as e:
        print(f"[WARNING] Winget échoué: {e}")
    
    # Essayer chocolatey
    try:
        print("[INFO] Tentative d'installation via Chocolatey...")
        result = subprocess.run(['choco', 'install', 'ffmpeg', '-y'], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print("[OK] FFmpeg installé via Chocolatey")
            return True
    except Exception as e:
        print(f"[WARNING] Chocolatey échoué: {e}")
    
    print("[ERROR] Impossible d'installer FFmpeg automatiquement")
    print("[INFO] Veuillez installer FFmpeg manuellement depuis https://ffmpeg.org/download.html")
    return False

def create_whisper_workaround():
    """Créer un contournement pour Whisper"""
    print("\n=== Création du Contournement Whisper ===")
    
    workaround_code = '''
import os
import tempfile
import shutil
import subprocess
from pathlib import Path

def whisper_transcribe_real(file_path):
    """
    Transcription Whisper réelle avec contournements Windows
    """
    try:
        import whisper
        
        print(f"[WHISPER] Début transcription: {file_path}")
        
        # Vérifier que le fichier existe
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Fichier non trouvé: {file_path}")
        
        # Obtenir les informations du fichier
        file_size = os.path.getsize(file_path)
        print(f"[WHISPER] Taille fichier: {file_size} bytes")
        
        # Approche 1: Essayer directement
        try:
            model = whisper.load_model("base")
            result = model.transcribe(file_path)
            print("[WHISPER] Transcription directe réussie!")
            return result
        except Exception as e1:
            print(f"[WHISPER] Transcription directe échouée: {e1}")
        
        # Approche 2: Conversion préalable avec FFmpeg
        try:
            print("[WHISPER] Tentative de conversion avec FFmpeg...")
            
            # Créer un fichier temporaire
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Convertir avec FFmpeg
            cmd = [
                'ffmpeg', '-i', file_path,
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                '-y',
                temp_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                print("[WHISPER] Conversion FFmpeg réussie")
                
                # Transcrire le fichier converti
                model = whisper.load_model("base")
                result = model.transcribe(temp_path)
                
                # Nettoyer
                os.unlink(temp_path)
                
                print("[WHISPER] Transcription après conversion réussie!")
                return result
            else:
                print(f"[WHISPER] Conversion FFmpeg échouée: {result.stderr}")
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                
        except Exception as e2:
            print(f"[WHISPER] Conversion échouée: {e2}")
        
        # Approche 3: Copie dans un dossier temporaire
        try:
            print("[WHISPER] Tentative avec dossier temporaire...")
            
            with tempfile.TemporaryDirectory() as temp_dir:
                # Copier le fichier
                temp_file = os.path.join(temp_dir, "audio.wav")
                shutil.copy2(file_path, temp_file)
                
                # Vérifier la copie
                if not os.path.exists(temp_file):
                    raise Exception("Échec de la copie")
                
                # Transcrire
                model = whisper.load_model("base")
                result = model.transcribe(temp_file)
                
                print("[WHISPER] Transcription temporaire réussie!")
                return result
                
        except Exception as e3:
            print(f"[WHISPER] Transcription temporaire échouée: {e3}")
        
        # Approche 4: Utiliser un chemin court
        try:
            print("[WHISPER] Tentative avec chemin court...")
            
            # Créer un lien symbolique ou copie avec nom court
            short_path = "C:\\temp\\audio.wav"
            
            # Créer le dossier temp s'il n'existe pas
            os.makedirs("C:\\temp", exist_ok=True)
            
            # Copier avec nom court
            shutil.copy2(file_path, short_path)
            
            # Transcrire
            model = whisper.load_model("base")
            result = model.transcribe(short_path)
            
            # Nettoyer
            if os.path.exists(short_path):
                os.unlink(short_path)
            
            print("[WHISPER] Transcription chemin court réussie!")
            return result
            
        except Exception as e4:
            print(f"[WHISPER] Transcription chemin court échouée: {e4}")
        
        # Si toutes les approches échouent
        raise Exception("Toutes les approches de transcription ont échoué")
        
    except Exception as e:
        print(f"[WHISPER] Erreur finale: {e}")
        raise e
'''
    
    # Écrire le contournement
    with open("meeting-reports/backend/whisper_real.py", "w", encoding="utf-8") as f:
        f.write(workaround_code)
    
    print("[OK] Contournement Whisper créé: whisper_real.py")
    return True

def test_whisper_real():
    """Tester la transcription Whisper réelle"""
    print("\n=== Test Transcription Réelle ===")
    
    try:
        # Créer un fichier audio de test
        test_file = "test_whisper_real.wav"
        print(f"[INFO] Création du fichier de test: {test_file}")
        
        import wave
        import struct
        import math
        
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
        
        print(f"[OK] Fichier créé: {os.path.getsize(test_file)} bytes")
        
        # Importer et tester le contournement
        sys.path.append("meeting-reports/backend")
        from whisper_real import whisper_transcribe_real
        
        # Tester la transcription
        result = whisper_transcribe_real(test_file)
        
        print(f"[SUCCESS] Transcription réussie: '{result['text']}'")
        
        # Nettoyer
        os.remove(test_file)
        return True
        
    except Exception as e:
        print(f"[ERROR] Test échoué: {e}")
        # Nettoyer en cas d'erreur
        if os.path.exists("test_whisper_real.wav"):
            os.remove("test_whisper_real.wav")
        return False

def update_backend_with_real_whisper():
    """Mettre à jour le backend avec la transcription réelle"""
    print("\n=== Mise à jour du Backend ===")
    
    # Lire le fichier main-simple.py
    with open("meeting-reports/backend/main-simple.py", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remplacer l'import
    content = content.replace(
        "from whisper_fix import fix_whisper_transcription",
        "from whisper_real import whisper_transcribe_real"
    )
    
    # Remplacer l'appel de fonction
    content = content.replace(
        "result = fix_whisper_transcription(absolute_path)",
        "result = whisper_transcribe_real(absolute_path)"
    )
    
    # Écrire le fichier modifié
    with open("meeting-reports/backend/main-simple.py", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("[OK] Backend mis à jour avec transcription réelle")
    return True

if __name__ == "__main__":
    print("Solution Complète pour Whisper sans Simulation")
    print("=" * 60)
    
    # 1. Vérifier les prérequis
    if not check_system_requirements():
        print("[ERROR] Prérequis manquants")
        exit(1)
    
    # 2. Installer FFmpeg si nécessaire
    ffmpeg_ok = install_ffmpeg_windows()
    
    # 3. Créer le contournement
    workaround_ok = create_whisper_workaround()
    
    # 4. Tester la transcription réelle
    if workaround_ok:
        test_ok = test_whisper_real()
        
        if test_ok:
            # 5. Mettre à jour le backend
            update_ok = update_backend_with_real_whisper()
            
            print("\n" + "=" * 60)
            print("RÉSULTATS")
            print("=" * 60)
            print(f"FFmpeg: {'OK' if ffmpeg_ok else 'ERREUR'}")
            print(f"Contournement: {'OK' if workaround_ok else 'ERREUR'}")
            print(f"Test transcription: {'OK' if test_ok else 'ERREUR'}")
            print(f"Backend mis à jour: {'OK' if update_ok else 'ERREUR'}")
            
            if test_ok and update_ok:
                print("\n[SUCCESS] Whisper fonctionne maintenant sans simulation!")
                print("Redémarrez le backend pour appliquer les changements.")
            else:
                print("\n[WARNING] Certaines étapes ont échoué")
        else:
            print("\n[ERROR] Test de transcription échoué")
    else:
        print("\n[ERROR] Création du contournement échouée")



















