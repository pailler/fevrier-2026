#!/usr/bin/env python3
"""
Créer un vrai fichier audio de test
"""

import numpy as np
import wave
import os
from pathlib import Path

def create_real_audio():
    """Créer un vrai fichier audio avec du contenu parlant"""
    print("=== Creation d'un vrai fichier audio ===")
    
    # Paramètres audio
    sample_rate = 16000
    duration = 3  # 3 secondes
    frequency = 440  # La note A4
    
    # Créer un signal audio plus réaliste
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Créer une onde sinusoïdale modulée (simule la parole)
    audio_data = np.sin(2 * np.pi * frequency * t) * 0.3
    
    # Ajouter de la modulation (simule les variations de la parole)
    modulation = np.sin(2 * np.pi * 5 * t) * 0.1
    audio_data = audio_data * (1 + modulation)
    
    # Normaliser et convertir en 16-bit
    audio_data = np.clip(audio_data, -1.0, 1.0)
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Sauvegarder le fichier WAV
    output_file = "real_test_audio.wav"
    with wave.open(output_file, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16 bits
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    print(f"[OK] Fichier audio cree: {output_file}")
    print(f"    Taille: {os.path.getsize(output_file)} bytes")
    
    return output_file

def test_with_real_audio():
    """Tester avec le vrai fichier audio"""
    print("\n=== Test avec le vrai fichier audio ===")
    
    # Créer le fichier
    audio_file = create_real_audio()
    
    # Tester avec Whisper
    try:
        import whisper
        print("[1] Chargement de Whisper...")
        model = whisper.load_model("base")
        print("[OK] Whisper charge")
        
        print("[2] Test de transcription...")
        result = model.transcribe(audio_file)
        print("[OK] Transcription reussie!")
        print(f"    Texte: '{result['text']}'")
        
        # Nettoyer
        os.remove(audio_file)
        print("[OK] Fichier de test supprime")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False

if __name__ == "__main__":
    test_with_real_audio()


































