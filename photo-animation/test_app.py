"""Script de test pour diagnostiquer les problèmes de démarrage"""

import sys
import os

print("=" * 50)
print("Test de démarrage de l'application")
print("=" * 50)

# Test 1: Imports de base
print("\n1. Test des imports de base...")
try:
    import gradio as gr
    print("   [OK] Gradio importe")
except Exception as e:
    print(f"   [ERREUR] Gradio: {e}")
    sys.exit(1)

try:
    import torch
    print(f"   [OK] PyTorch importe (version {torch.__version__})")
except Exception as e:
    print(f"   [ERREUR] PyTorch: {e}")

try:
    import cv2
    print(f"   [OK] OpenCV importe (version {cv2.__version__})")
except Exception as e:
    print(f"   [ERREUR] OpenCV: {e}")
    sys.exit(1)

try:
    from PIL import Image
    print("   [OK] PIL importe")
except Exception as e:
    print(f"   [ERREUR] PIL: {e}")
    sys.exit(1)

# Test 2: Import diffusers
print("\n2. Test de l'import diffusers...")
try:
    os.environ["XFORMERS_DISABLED"] = "1"
    os.environ["DIFFUSERS_NO_ADAPTER"] = "1"
    from diffusers import StableDiffusionImg2ImgPipeline
    print("   [OK] Diffusers importe")
except Exception as e:
    print(f"   [WARNING] Diffusers non disponible: {type(e).__name__}")
    print(f"   Message: {str(e)[:100]}")

# Test 3: Import de l'application
print("\n3. Test de l'import de l'application...")
try:
    from app import PhotoAnimator, animate_image
    print("   [OK] Application importee")
except Exception as e:
    print(f"   [ERREUR] Import application: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Initialisation
print("\n4. Test de l'initialisation...")
try:
    animator = PhotoAnimator()
    print("   [OK] PhotoAnimator initialise")
except Exception as e:
    print(f"   [ERREUR] Initialisation: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Creation de l'interface
print("\n5. Test de la creation de l'interface...")
try:
    from app import create_interface
    demo = create_interface()
    print("   [OK] Interface creee")
except Exception as e:
    print(f"   [ERREUR] Creation interface: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 50)
print("Tous les tests sont passes!")
print("L'application devrait pouvoir demarrer.")
print("=" * 50)
