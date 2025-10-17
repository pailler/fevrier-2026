#!/usr/bin/env python3
"""
Script de démarrage pour l'application Meeting Reports Generator
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Vérifier que les dépendances sont installées"""
    try:
        import fastapi
        import whisper
        import langchain
        print("✅ Toutes les dépendances sont installées")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        print("Installez les dépendances avec: pip install -r requirements.txt")
        return False

def check_openai_key():
    """Vérifier que la clé API OpenAI est configurée"""
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY n'est pas définie")
        print("Définissez votre clé API OpenAI:")
        print("export OPENAI_API_KEY='votre_cle_api_ici'")
        return False
    print("✅ Clé API OpenAI configurée")
    return True

def create_directories():
    """Créer les répertoires nécessaires"""
    dirs = ["../uploads", "../reports"]
    for dir_path in dirs:
        Path(dir_path).mkdir(exist_ok=True)
        print(f"✅ Répertoire créé: {dir_path}")

def start_server():
    """Démarrer le serveur FastAPI"""
    print("🚀 Démarrage du serveur Meeting Reports Generator...")
    print("📡 API disponible sur: http://localhost:8001")
    print("📚 Documentation: http://localhost:8001/docs")
    print("🛑 Appuyez sur Ctrl+C pour arrêter")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main-simple-working:app", 
            "--host", "0.0.0.0", 
            "--port", "8001", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Serveur arrêté")

def main():
    """Fonction principale"""
    print("🎯 Meeting Reports Generator - Script de démarrage")
    print("=" * 50)
    
    # Vérifications
    if not check_requirements():
        sys.exit(1)
    
    if not check_openai_key():
        print("⚠️  L'application peut ne pas fonctionner correctement sans la clé API")
        response = input("Voulez-vous continuer quand même? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Créer les répertoires
    create_directories()
    
    # Démarrer le serveur
    start_server()

if __name__ == "__main__":
    main()

