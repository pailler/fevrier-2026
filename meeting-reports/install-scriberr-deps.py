#!/usr/bin/env python3
"""
Script d'installation des dépendances pour les fonctionnalités Scriberr
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Exécute une commande et affiche le résultat"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Succès")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Échec")
        print(f"   Erreur: {e.stderr}")
        return False

def check_python_version():
    """Vérifie la version de Python"""
    print("🐍 Vérification de la version Python...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Version trop ancienne")
        print("   Python 3.8+ requis")
        return False

def install_pytorch():
    """Installe PyTorch"""
    print("🔥 Installation de PyTorch...")
    
    # Détecter le système d'exploitation
    import platform
    system = platform.system().lower()
    
    if system == "windows":
        # Installation pour Windows
        commands = [
            "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu",
            "pip install torchaudio"
        ]
    elif system == "darwin":  # macOS
        # Installation pour macOS
        commands = [
            "pip install torch torchvision torchaudio",
            "pip install torchaudio"
        ]
    else:  # Linux
        # Installation pour Linux
        commands = [
            "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu",
            "pip install torchaudio"
        ]
    
    success = True
    for cmd in commands:
        if not run_command(cmd, f"Installation PyTorch ({cmd.split()[-1]})"):
            success = False
    
    return success

def install_pyannote():
    """Installe pyannote.audio"""
    print("🎤 Installation de pyannote.audio...")
    
    commands = [
        "pip install pyannote.audio",
        "pip install pyannote.core"
    ]
    
    success = True
    for cmd in commands:
        if not run_command(cmd, f"Installation pyannote ({cmd.split()[-1]})"):
            success = False
    
    return success

def install_other_deps():
    """Installe les autres dépendances"""
    print("📦 Installation des autres dépendances...")
    
    deps = [
        "speechrecognition",
        "pydub"
    ]
    
    success = True
    for dep in deps:
        if not run_command(f"pip install {dep}", f"Installation {dep}"):
            success = False
    
    return success

def create_huggingface_config():
    """Crée un fichier de configuration pour Hugging Face"""
    print("🔧 Configuration Hugging Face...")
    
    config_file = Path("backend/config.env")
    
    if config_file.exists():
        # Lire le fichier existant
        with open(config_file, "r") as f:
            content = f.read()
        
        # Vérifier si le token est déjà configuré
        if "HUGGINGFACE_TOKEN" in content:
            print("✅ Token Hugging Face déjà configuré")
            return True
        
        # Ajouter le token
        with open(config_file, "a") as f:
            f.write("\n# Configuration Hugging Face (pour la diarisation des locuteurs)\n")
            f.write("# Obtenez votre token sur https://huggingface.co/settings/tokens\n")
            f.write("HUGGINGFACE_TOKEN=your_huggingface_token_here\n")
        
        print("✅ Configuration Hugging Face ajoutée")
        print("   ⚠️  N'oubliez pas de remplacer 'your_huggingface_token_here' par votre vrai token")
        return True
    else:
        print("❌ Fichier config.env non trouvé")
        return False

def test_imports():
    """Teste les imports des nouvelles dépendances"""
    print("🧪 Test des imports...")
    
    modules_to_test = [
        ("torch", "PyTorch"),
        ("torchaudio", "TorchAudio"),
        ("pyannote.audio", "pyannote.audio"),
        ("speech_recognition", "SpeechRecognition"),
        ("pydub", "pydub")
    ]
    
    success = True
    for module, name in modules_to_test:
        try:
            __import__(module)
            print(f"✅ {name} - Import réussi")
        except ImportError as e:
            print(f"❌ {name} - Import échoué: {e}")
            success = False
    
    return success

def main():
    """Fonction principale d'installation"""
    print("🚀 Installation des dépendances Scriberr")
    print("=" * 50)
    
    # Vérifier Python
    if not check_python_version():
        return
    
    # Installer PyTorch
    if not install_pytorch():
        print("❌ Échec de l'installation de PyTorch")
        return
    
    # Installer pyannote
    if not install_pyannote():
        print("❌ Échec de l'installation de pyannote")
        return
    
    # Installer les autres dépendances
    if not install_other_deps():
        print("❌ Échec de l'installation des autres dépendances")
        return
    
    # Configurer Hugging Face
    create_huggingface_config()
    
    # Tester les imports
    if not test_imports():
        print("❌ Certains modules ne peuvent pas être importés")
        return
    
    print("\n" + "=" * 50)
    print("✅ Installation terminée avec succès !")
    print("\n📝 Prochaines étapes:")
    print("   1. Obtenez un token Hugging Face sur https://huggingface.co/settings/tokens")
    print("   2. Remplacez 'your_huggingface_token_here' dans backend/config.env")
    print("   3. Redémarrez le backend")
    print("   4. Testez les nouvelles fonctionnalités avec test-scriberr-features.py")

if __name__ == "__main__":
    main()



















