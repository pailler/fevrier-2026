import os
import requests
import base64
import json

def whisper_transcribe_api(file_path):
    """
    Transcription avec API Whisper d'OpenAI (format multipart/form-data)
    """
    try:
        print(f"[WHISPER API] Tentative de transcription: {file_path}")
        
        # Préparer les headers
        headers = {
            'Authorization': 'Bearer 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'
        }
        
        # Préparer les données (multipart/form-data)
        with open(file_path, 'rb') as audio_file:
            files = {
                'file': (os.path.basename(file_path), audio_file, 'audio/wav'),
                'model': (None, 'whisper-1'),
                'response_format': (None, 'json'),
                'language': (None, 'fr')
            }
            
            # Appeler l'API
            response = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers=headers,
                files=files,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[WHISPER API] Transcription réussie: {len(result.get('text', ''))} caractères")
            return {
                'text': result.get('text', ''),
                'language': result.get('language', 'fr')
            }
        else:
            print(f"[ERROR] API Whisper erreur: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Erreur API Whisper: {e}")
        return None

def whisper_transcribe_hybrid(file_path):
    """
    Solution hybride: API d'abord, puis locale
    """
    try:
        # Essayer l'API d'abord
        print("[WHISPER] Tentative avec API OpenAI...")
        result = whisper_transcribe_api(file_path)
        
        if result and result.get('text'):
            print("[WHISPER] Transcription API réussie!")
            return result
        
        # Si l'API échoue, essayer local
        print("[WHISPER] API échouée, tentative locale...")
        return whisper_transcribe_local_fallback(file_path)
        
    except Exception as e:
        print(f"[WHISPER] Erreur hybride: {e}")
        return None

def whisper_transcribe_local_fallback(file_path):
    """
    Fallback local avec approches alternatives
    """
    try:
        import whisper
        import tempfile
        import shutil
        
        print(f"[WHISPER LOCAL] Tentative de transcription locale: {file_path}")
        
        # Vérifier que le fichier existe
        if not os.path.exists(file_path):
            print(f"[WHISPER LOCAL] Fichier non trouvé: {file_path}")
            return None
        
        # Essayer avec le modèle tiny d'abord (plus rapide)
        try:
            print("[WHISPER LOCAL] Chargement du modèle tiny...")
            model = whisper.load_model("tiny")
            
            # Approche 1: Chemin direct
            try:
                print("[WHISPER LOCAL] Tentative avec chemin direct...")
                result = model.transcribe(file_path)
                print(f"[WHISPER LOCAL] Transcription réussie! Texte: {result['text'][:100]}...")
                return result
            except Exception as e1:
                print(f"[WHISPER LOCAL] Chemin direct échoué: {e1}")
            
            # Approche 2: Copie temporaire
            try:
                print("[WHISPER LOCAL] Tentative avec copie temporaire...")
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    temp_path = temp_file.name
                
                # Copier le fichier
                shutil.copy2(file_path, temp_path)
                
                # Transcrire
                result = model.transcribe(temp_path)
                
                # Nettoyer
                os.unlink(temp_path)
                
                print(f"[WHISPER LOCAL] Transcription temporaire réussie! Texte: {result['text'][:100]}...")
                return result
                
            except Exception as e2:
                print(f"[WHISPER LOCAL] Copie temporaire échouée: {e2}")
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            
            # Approche 3: Chemin court
            try:
                print("[WHISPER LOCAL] Tentative avec chemin court...")
                short_path = "C:\\temp\\audio.wav"
                os.makedirs("C:\\temp", exist_ok=True)
                
                # Copier avec nom court
                shutil.copy2(file_path, short_path)
                
                # Transcrire
                result = model.transcribe(short_path)
                
                # Nettoyer
                os.unlink(short_path)
                
                print(f"[WHISPER LOCAL] Transcription chemin court réussie! Texte: {result['text'][:100]}...")
                return result
                
            except Exception as e3:
                print(f"[WHISPER LOCAL] Chemin court échoué: {e3}")
                if os.path.exists(short_path):
                    os.unlink(short_path)
            
        except Exception as e:
            print(f"[WHISPER LOCAL] Modèle tiny échoué: {e}")
        
        print("[WHISPER LOCAL] Toutes les approches locales ont échoué")
        return None
        
    except Exception as e:
        print(f"[WHISPER LOCAL] Fallback local échoué: {e}")
        return None
