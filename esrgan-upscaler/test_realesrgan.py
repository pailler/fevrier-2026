"""Test d'import de Real-ESRGAN"""

import sys

print("Test d'import Real-ESRGAN...")
print("="*60)

# Test 1: Import direct
try:
    import realesrgan
    print("[OK] Module realesrgan importe")
    print(f"     Chemin: {realesrgan.__file__}")
except ImportError as e:
    print(f"[ERREUR] Import realesrgan: {e}")

# Test 2: Import RealESRGANer
try:
    from realesrgan import RealESRGANer
    print("[OK] RealESRGANer importe")
except ImportError as e:
    print(f"[ERREUR] Import RealESRGANer: {e}")

# Test 3: Import RRDBNet
try:
    from realesrgan.archs.rrdbnet_arch import RRDBNet
    print("[OK] RRDBNet importe")
except ImportError as e:
    print(f"[ERREUR] Import RRDBNet: {e}")

# Test 4: Vérifier le chemin d'installation
import subprocess
result = subprocess.run([sys.executable, "-m", "pip", "show", "realesrgan"], 
                       capture_output=True, text=True)
print("\n" + "="*60)
print("Information pip show realesrgan:")
print("="*60)
print(result.stdout)
