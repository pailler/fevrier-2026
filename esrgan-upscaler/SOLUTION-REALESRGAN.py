"""
Solution alternative : Utiliser Real-ESRGAN directement si disponible
Cette solution permet d'utiliser les modèles Real-ESRGAN sans conversion
"""

import os
from pathlib import Path
from PIL import Image
from typing import Optional

def try_load_realesrgan(model_path: str):
    """
    Essaie de charger un modèle avec Real-ESRGAN si disponible
    """
    try:
        from realesrgan import RealESRGANer
        from realesrgan.archs.rrdbnet_arch import RRDBNet as RealESRGAN_RRDBNet
        
        print("Real-ESRGAN disponible, utilisation directe...")
        
        # Créer le modèle Real-ESRGAN
        model = RealESRGAN_RRDBNet(
            num_in_ch=3, 
            num_out_ch=3, 
            num_feat=64, 
            num_block=23, 
            num_grow_ch=32, 
            scale=4
        )
        
        # Créer l'upscaler Real-ESRGAN
        upsampler = RealESRGANer(
            scale=4,
            model_path=model_path,
            model=model,
            tile=512,
            tile_pad=10,
            pre_pad=0,
            half=False  # Utiliser float32 pour compatibilité
        )
        
        return upsampler
        
    except ImportError:
        print("Real-ESRGAN non disponible")
        return None
    except Exception as e:
        print(f"Erreur lors du chargement Real-ESRGAN: {e}")
        return None


def upscale_with_realesrgan(image: Image.Image, model_path: str) -> Optional[Image.Image]:
    """
    Upscale une image avec Real-ESRGAN si disponible
    """
    upsampler = try_load_realesrgan(model_path)
    
    if upsampler is None:
        return None
    
    # Convertir en numpy array
    import numpy as np
    img_array = np.array(image.convert('RGB'))
    
    # Upscaler
    output, _ = upsampler.enhance(img_array, outscale=4)
    
    # Convertir en PIL
    return Image.fromarray(output)


# Exemple d'utilisation dans app.py
"""
# Dans app.py, remplacer load_model par :

def load_model_with_fallback(model_type='ultrasharp'):
    # Essayer d'abord Real-ESRGAN
    if model_type == 'ultrasharp':
        model_path = str(MODEL_ULTRASHARP_ORIG)
    else:
        model_path = str(MODEL_ANIME_ORIG)
    
    # Essayer Real-ESRGAN
    try:
        from realesrgan import RealESRGANer
        # Utiliser Real-ESRGAN directement
        return 'realesrgan', model_path
    except ImportError:
        # Fallback vers notre implémentation
        return 'custom', load_model(model_type)
"""
