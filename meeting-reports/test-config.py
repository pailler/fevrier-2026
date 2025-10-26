#!/usr/bin/env python3
"""
Test de configuration OpenAI
"""

import os
from dotenv import load_dotenv

def test_config():
    """Test de la configuration"""
    print("=== Test Configuration OpenAI ===")
    
    # Charger le fichier config.env
    print("[1] Chargement du fichier config.env...")
    load_dotenv("backend/config.env")
    
    # Vérifier les variables d'environnement
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    max_tokens = os.getenv("OPENAI_MAX_TOKENS", "1000")
    temperature = os.getenv("OPENAI_TEMPERATURE", "0.3")
    
    print(f"[INFO] API Key: {'Configurée' if api_key and api_key != 'your_openai_api_key_here' else 'Non configurée'}")
    print(f"[INFO] Modèle: {model}")
    print(f"[INFO] Max Tokens: {max_tokens}")
    print(f"[INFO] Temperature: {temperature}")
    
    if api_key and api_key != "your_openai_api_key_here":
        print(f"[INFO] Clé API: {api_key[:20]}...{api_key[-10:]}")
        
        # Test direct OpenAI
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            
            print("[2] Test de connexion OpenAI...")
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": "Test de connexion - réponds simplement 'OK'"}
                ],
                max_tokens=10,
                temperature=0.1
            )
            
            result = response.choices[0].message.content
            print(f"[OK] OpenAI fonctionne! Réponse: {result}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Erreur OpenAI: {e}")
            return False
    else:
        print("[ERROR] Clé API non configurée")
        return False

if __name__ == "__main__":
    print("Test de Configuration OpenAI")
    print("=" * 50)
    
    success = test_config()
    
    print("\n" + "=" * 50)
    if success:
        print("[SUCCESS] Configuration OpenAI OK!")
    else:
        print("[ERROR] Problème de configuration")





















