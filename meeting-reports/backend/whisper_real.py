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



































