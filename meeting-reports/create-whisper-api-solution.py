#!/usr/bin/env python3
"""
Solution alternative avec API de transcription externe
"""

import os
import requests
import base64
import json

def transcribe_with_whisper_api(file_path):
    """
    Utiliser l'API Whisper d'OpenAI pour la transcription
    """
    try:
        # Lire le fichier audio
        with open(file_path, 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Encoder en base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Préparer la requête
        headers = {
            'Authorization': f'Bearer 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',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'whisper-1',
            'file': audio_base64,
            'response_format': 'json'
        }
        
        # Appeler l'API
        response = requests.post(
            'https://api.openai.com/v1/audio/transcriptions',
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
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

def transcribe_with_local_whisper_alternative(file_path):
    """
    Alternative locale avec une approche différente
    """
    try:
        import whisper
        
        # Essayer avec un modèle plus petit
        print("[WHISPER] Tentative avec modèle tiny...")
        model = whisper.load_model("tiny")
        
        # Utiliser un chemin absolu normalisé
        abs_path = os.path.abspath(file_path)
        normalized_path = os.path.normpath(abs_path)
        
        print(f"[WHISPER] Chemin normalisé: {normalized_path}")
        
        # Transcrire
        result = model.transcribe(normalized_path)
        
        print("[WHISPER] Transcription réussie avec modèle tiny!")
        return result
        
    except Exception as e:
        print(f"[WHISPER] Modèle tiny échoué: {e}")
        
        try:
            # Essayer avec un autre modèle
            print("[WHISPER] Tentative avec modèle small...")
            model = whisper.load_model("small")
            result = model.transcribe(file_path)
            
            print("[WHISPER] Transcription réussie avec modèle small!")
            return result
            
        except Exception as e2:
            print(f"[WHISPER] Modèle small échoué: {e2}")
            return None

def create_whisper_api_solution():
    """Créer une solution avec API Whisper"""
    print("=== Création Solution API Whisper ===")
    
    solution_code = '''
import os
import requests
import base64
import json

def whisper_transcribe_api(file_path):
    """
    Transcription avec API Whisper d'OpenAI
    """
    try:
        # Lire le fichier audio
        with open(file_path, 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Encoder en base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Préparer la requête
        headers = {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'whisper-1',
            'file': audio_base64,
            'response_format': 'json'
        }
        
        # Appeler l'API
        response = requests.post(
            'https://api.openai.com/v1/audio/transcriptions',
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'text': result.get('text', ''),
                'language': result.get('language', 'fr')
            }
        else:
            print(f"[ERROR] API Whisper erreur: {response.status_code}")
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
        
        # Essayer différents modèles
        models = ['tiny', 'base', 'small']
        
        for model_name in models:
            try:
                print(f"[WHISPER] Tentative avec modèle {model_name}...")
                model = whisper.load_model(model_name)
                
                # Essayer différents chemins
                paths_to_try = [
                    file_path,
                    os.path.abspath(file_path),
                    os.path.normpath(file_path),
                    os.path.relpath(file_path)
                ]
                
                for path in paths_to_try:
                    try:
                        result = model.transcribe(path)
                        print(f"[WHISPER] Transcription réussie avec {model_name}!")
                        return result
                    except:
                        continue
                        
            except Exception as e:
                print(f"[WHISPER] Modèle {model_name} échoué: {e}")
                continue
        
        return None
        
    except Exception as e:
        print(f"[WHISPER] Fallback local échoué: {e}")
        return None
'''
    
    # Écrire la solution
    with open("meeting-reports/backend/whisper_api.py", "w", encoding="utf-8") as f:
        f.write(solution_code)
    
    print("[OK] Solution API Whisper créée: whisper_api.py")
    return True

def test_api_solution():
    """Tester la solution API"""
    print("\n=== Test Solution API ===")
    
    try:
        # Créer un fichier de test
        import wave
        import struct
        import math
        
        test_file = "test_api.wav"
        
        with wave.open(test_file, 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            
            frames = []
            for i in range(16000 * 3):  # 3 secondes
                t = i / 16000
                value = int(32767 * math.sin(2 * math.pi * 440 * t))
                frames.append(struct.pack('<h', value))
            
            wav_file.writeframes(b''.join(frames))
        
        print(f"[OK] Fichier de test créé: {test_file}")
        
        # Tester l'API
        result = transcribe_with_whisper_api(test_file)
        
        if result:
            print(f"[SUCCESS] API Whisper réussie: '{result['text']}'")
        else:
            print("[WARNING] API Whisper échouée, test local...")
            
            # Tester local
            result = transcribe_with_local_whisper_alternative(test_file)
            
            if result:
                print(f"[SUCCESS] Whisper local réussi: '{result['text']}'")
            else:
                print("[ERROR] Toutes les méthodes ont échoué")
        
        # Nettoyer
        os.remove(test_file)
        return result is not None
        
    except Exception as e:
        print(f"[ERROR] Test échoué: {e}")
        return False

if __name__ == "__main__":
    print("Solution Alternative Whisper avec API")
    print("=" * 50)
    
    # Créer la solution
    solution_ok = create_whisper_api_solution()
    
    # Tester
    if solution_ok:
        test_ok = test_api_solution()
        
        print("\n" + "=" * 50)
        if test_ok:
            print("[SUCCESS] Solution API Whisper fonctionne!")
        else:
            print("[WARNING] Solution API partiellement fonctionnelle")
    else:
        print("[ERROR] Création de la solution échouée")



































