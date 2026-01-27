"""
Script de test pour vérifier que le modèle converti fonctionne correctement
"""

import sys
from pathlib import Path
from PIL import Image
import numpy as np
from esrgan_model import ESRGANUpscaler

def test_model(model_path):
    """Teste un modèle ESRGAN"""
    print(f"\n{'='*60}")
    print(f"Test du modele: {model_path}")
    print(f"{'='*60}\n")
    
    if not Path(model_path).exists():
        print(f"ERREUR: Fichier non trouve: {model_path}")
        return False
    
    try:
        # Charger le modèle
        print("1. Chargement du modele...")
        upscaler = ESRGANUpscaler(model_path)
        print("   [OK] Modele charge\n")
        
        # Créer une image de test simple
        print("2. Creation d'une image de test...")
        test_image = Image.new('RGB', (100, 100), color='red')
        # Ajouter un peu de variation
        img_array = np.array(test_image)
        img_array[25:75, 25:75] = [0, 255, 0]  # Carré vert au centre
        test_image = Image.fromarray(img_array)
        print(f"   Image de test: {test_image.size}, mode: {test_image.mode}\n")
        
        # Tester l'upscaling
        print("3. Test d'upscaling...")
        try:
            upscaled = upscaler.upscale(test_image)
            print(f"   [OK] Upscaling reussi")
            print(f"   Taille originale: {test_image.size}")
            print(f"   Taille upscalee: {upscaled.size}")
            print(f"   Facteur: {upscaled.size[0] / test_image.size[0]:.1f}x\n")
            
            # Vérifier que l'image n'est pas vide
            upscaled_array = np.array(upscaled)
            if upscaled_array.max() == 0:
                print("   [ERREUR] Image upscalee est vide (tous les pixels sont 0)")
                return False
            
            if upscaled_array.min() == upscaled_array.max():
                print("   [ERREUR] Image upscalee est uniforme (pas de variation)")
                return False
            
            print(f"   Range des pixels: [{upscaled_array.min()}, {upscaled_array.max()}]")
            print(f"   [OK] Image upscalee valide\n")
            
            # Sauvegarder pour inspection
            output_path = Path(model_path).parent / "test_output.png"
            upscaled.save(output_path)
            print(f"4. Image de test sauvegardee: {output_path}\n")
            
            print(f"{'='*60}")
            print("TEST REUSSI!")
            print(f"{'='*60}\n")
            return True
            
        except Exception as e:
            print(f"   [ERREUR] Erreur lors de l'upscaling: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    except Exception as e:
        print(f"ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    # Tester le modèle converti
    model_path = Path(__file__).parent / "converted_models" / "4xUltrasharp_4xUltrasharpV10_converted.pt"
    
    if not model_path.exists():
        print(f"Modele converti non trouve: {model_path}")
        print("Voulez-vous tester le modele original? (y/n)")
        # Pour l'instant, on teste juste le converti
        sys.exit(1)
    
    success = test_model(str(model_path))
    sys.exit(0 if success else 1)
