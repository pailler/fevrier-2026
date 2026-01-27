"""
Script de conversion de modèles Real-ESRGAN vers format ESRGAN standard
Convertit les modèles avec structure "model.X" vers notre architecture RRDBNet
"""

import torch
import torch.nn as nn
from pathlib import Path
import sys
import io

# Configurer l'encodage UTF-8 pour Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from esrgan_model import RRDBNet, ResidualDenseBlock_5C


def analyze_checkpoint(checkpoint_path):
    """Analyse la structure d'un checkpoint"""
    print(f"Analyse du checkpoint: {checkpoint_path}")
    try:
        checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False)
    except TypeError:
        checkpoint = torch.load(checkpoint_path, map_location='cpu')
    
    if isinstance(checkpoint, dict):
        print(f"Type: Dictionnaire avec {len(checkpoint)} clés")
        print("\nPremieres cles:")
        for i, key in enumerate(list(checkpoint.keys())[:10]):
            if hasattr(checkpoint[key], 'shape'):
                print(f"  {key}: {checkpoint[key].shape}")
            else:
                print(f"  {key}: {type(checkpoint[key])}")
        
        # Vérifier le format
        if any(k.startswith('model.') for k in checkpoint.keys()):
            print("\nFormat detecte: Real-ESRGAN (avec prefixe 'model.')")
            return 'realesrgan'
        else:
            print("\nFormat detecte: ESRGAN standard")
            return 'standard'
    else:
        print(f"Type: {type(checkpoint)}")
        return 'unknown'


def convert_realesrgan_to_standard(input_path, output_path):
    """
    Convertit un modèle Real-ESRGAN vers notre format RRDBNet
    
    Cette fonction tente de mapper les couches Real-ESRGAN vers notre architecture.
    Note: La conversion peut ne pas être parfaite car les architectures diffèrent.
    """
    print(f"\n{'='*60}")
    print("Conversion Real-ESRGAN -> Format Standard")
    print(f"{'='*60}\n")
    
    # Charger le checkpoint Real-ESRGAN
    print(f"Chargement: {input_path}")
    try:
        checkpoint = torch.load(input_path, map_location='cpu', weights_only=False)
    except TypeError:
        checkpoint = torch.load(input_path, map_location='cpu')
    
    if not isinstance(checkpoint, dict):
        raise ValueError("Le checkpoint doit etre un dictionnaire")
    
    # Créer notre modèle
    print("Creation du modele RRDBNet...")
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                   num_block=23, num_grow_ch=32, scale=4)
    
    # Obtenir le state_dict de notre modèle
    model_dict = model.state_dict()
    
    # Mapper les clés Real-ESRGAN vers notre format
    print("\nMapping des couches...")
    mapped_dict = {}
    unmapped_keys = []
    
    # Mapping des couches principales
    mapping_rules = {
        # Couche d'entrée
        'model.0.weight': 'conv_first.weight',
        'model.0.bias': 'conv_first.bias',
        
        # Couche de sortie (trouver la dernière couche)
        # On va chercher la dernière couche dans le checkpoint
    }
    
    # Trouver la dernière couche (conv_last)
    last_conv_key = None
    for key in checkpoint.keys():
        if 'conv' in key.lower() and ('last' in key.lower() or key.endswith('.weight')):
            # Vérifier si c'est probablement la dernière couche
            if 'model.' in key:
                parts = key.split('.')
                if len(parts) > 1:
                    try:
                        layer_num = int(parts[1])
                        if last_conv_key is None or int(last_conv_key.split('.')[1]) < layer_num:
                            last_conv_key = key
                    except:
                        pass
    
    print(f"Derniere couche detectee: {last_conv_key}")
    
    # Mapper les couches une par une
    mapped_count = 0
    for model_key in model_dict.keys():
        found = False
        
        # Essayer les règles de mapping directes
        for realesrgan_pattern, our_pattern in mapping_rules.items():
            if our_pattern == model_key:
                if realesrgan_pattern in checkpoint:
                    mapped_dict[model_key] = checkpoint[realesrgan_pattern]
                    found = True
                    mapped_count += 1
                    break
        
        # Si pas trouvé, essayer de trouver par nom de couche
        if not found:
            # Extraire le nom de la couche (sans les indices)
            layer_name = model_key.split('.')[0] if '.' in model_key else model_key
            
            # Chercher dans le checkpoint
            for ckpt_key, ckpt_value in checkpoint.items():
                # Enlever le préfixe "model."
                clean_key = ckpt_key.replace('model.', '')
                
                # Vérifier si les shapes correspondent
                if model_key in clean_key or clean_key.endswith(model_key.split('.')[-1]):
                    if ckpt_value.shape == model_dict[model_key].shape:
                        mapped_dict[model_key] = ckpt_value
                        found = True
                        mapped_count += 1
                        break
        
        if not found:
            unmapped_keys.append(model_key)
    
    print(f"\nCouches mappees: {mapped_count}/{len(model_dict)}")
    print(f"Couches non mappees: {len(unmapped_keys)}")
    
    if len(unmapped_keys) > 0:
        print("\nCouches non mappees (seront initialisees aleatoirement):")
        for key in unmapped_keys[:10]:  # Afficher les 10 premières
            print(f"  - {key}")
        if len(unmapped_keys) > 10:
            print(f"  ... et {len(unmapped_keys) - 10} autres")
    
    # Mettre à jour le modèle avec les poids mappés
    model_dict.update(mapped_dict)
    model.load_state_dict(model_dict, strict=False)
    
    # Sauvegarder le modèle converti (seulement state_dict)
    print(f"\nSauvegarde du modele converti: {output_path}")
    torch.save({
        'state_dict': model.state_dict(),
        # Ne pas sauvegarder 'model' pour éviter les problèmes avec weights_only=True
        'architecture': 'RRDBNet',
        'num_in_ch': 3,
        'num_out_ch': 3,
        'num_feat': 64,
        'num_block': 23,
        'num_grow_ch': 32,
        'scale': 4,
        'converted_from': 'Real-ESRGAN',
        'original_file': str(input_path)
    }, output_path)
    
    print(f"\n{'='*60}")
    print("Conversion terminee!")
    print(f"{'='*60}")
    print(f"\nModele converti sauvegarde dans: {output_path}")
    print(f"Note: Certaines couches peuvent avoir ete initialisees aleatoirement")
    print(f"si elles n'ont pas pu etre mappees depuis le modele original.")
    
    return output_path


def convert_with_intelligent_mapping(input_path, output_path):
    """
    Conversion intelligente qui analyse la structure et mappe les couches
    """
    print(f"\n{'='*60}")
    print("Conversion Intelligente Real-ESRGAN -> Format Standard")
    print(f"{'='*60}\n")
    
    try:
        checkpoint = torch.load(input_path, map_location='cpu', weights_only=False)
    except TypeError:
        checkpoint = torch.load(input_path, map_location='cpu')
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                   num_block=23, num_grow_ch=32, scale=4)
    model_dict = model.state_dict()
    
    # Analyser la structure Real-ESRGAN
    # Format typique: model.0 (conv first), model.1 (body), model.2+ (upsample), model.N (conv last)
    
    print("Analyse de la structure Real-ESRGAN...")
    
    # Extraire les couches par type
    conv_layers = {}
    body_layers = {}
    upsample_layers = {}
    
    for key, value in checkpoint.items():
        if 'model.0' in key:
            conv_layers[key] = value
        elif 'model.1' in key or 'RDB' in key:
            body_layers[key] = value
        elif 'upsample' in key.lower() or any(f'model.{i}' in key for i in range(10, 20)):
            upsample_layers[key] = value
        elif 'last' in key.lower() or any(f'model.{i}' in key for i in range(20, 30)):
            # Probablement la dernière couche
            pass
    
    print(f"  - Couches d'entree: {len(conv_layers)}")
    print(f"  - Couches du corps: {len(body_layers)}")
    print(f"  - Couches d'upsampling: {len(upsample_layers)}")
    
    # Mapping intelligent
    mapped_dict = {}
    
    # 1. Couche d'entrée (model.0 -> conv_first)
    if 'model.0.weight' in checkpoint and 'model.0.bias' in checkpoint:
        if checkpoint['model.0.weight'].shape == model_dict['conv_first.weight'].shape:
            mapped_dict['conv_first.weight'] = checkpoint['model.0.weight']
            mapped_dict['conv_first.bias'] = checkpoint['model.0.bias']
            print("  [OK] Couche d'entree mappee")
    
    # 2. Couches du corps - mapping complexe
    # Les RDB blocks dans Real-ESRGAN ont une structure différente
    # On va essayer de mapper les poids qui correspondent en shape
    
    # 3. Couches de sortie - trouver la dernière
    # Chercher la dernière couche conv dans le checkpoint
    last_layer_idx = None
    for key in checkpoint.keys():
        if 'model.' in key:
            try:
                idx = int(key.split('.')[1])
                if last_layer_idx is None or idx > last_layer_idx:
                    last_layer_idx = idx
            except:
                pass
    
    if last_layer_idx is not None:
        last_weight_key = f'model.{last_layer_idx}.weight'
        last_bias_key = f'model.{last_layer_idx}.bias'
        
        if last_weight_key in checkpoint:
            if checkpoint[last_weight_key].shape == model_dict['conv_last.weight'].shape:
                mapped_dict['conv_last.weight'] = checkpoint[last_weight_key]
                if last_bias_key in checkpoint:
                    mapped_dict['conv_last.bias'] = checkpoint[last_bias_key]
                print(f"  [OK] Couche de sortie mappee (model.{last_layer_idx})")
    
    # 4. Mapper les autres couches par shape matching
    print("\nMapping par correspondance de shape...")
    shape_matches = 0
    
    for model_key, model_tensor in model_dict.items():
        if model_key in mapped_dict:
            continue
        
        # Chercher dans le checkpoint une couche avec la même shape
        for ckpt_key, ckpt_tensor in checkpoint.items():
            if ckpt_tensor.shape == model_tensor.shape:
                # Vérifier que c'est le bon type de couche (conv, norm, etc.)
                if model_key.split('.')[0] in ckpt_key or model_key.split('.')[-1] in ckpt_key:
                    mapped_dict[model_key] = ckpt_tensor
                    shape_matches += 1
                    break
    
    print(f"  [OK] {shape_matches} couches mappees par shape")
    
    # Mettre à jour le modèle
    model_dict.update(mapped_dict)
    model.load_state_dict(model_dict, strict=False)
    
    # Sauvegarder (seulement state_dict pour éviter les problèmes de sécurité PyTorch 2.6+)
    print(f"\nSauvegarde: {output_path}")
    torch.save({
        'state_dict': model.state_dict(),
        # Ne pas sauvegarder 'model' pour éviter les problèmes avec weights_only=True
        'architecture': 'RRDBNet',
        'converted_from': 'Real-ESRGAN',
        'mapping_stats': {
            'total_layers': len(model_dict),
            'mapped_layers': len(mapped_dict),
            'unmapped_layers': len(model_dict) - len(mapped_dict)
        },
        'num_in_ch': 3,
        'num_out_ch': 3,
        'num_feat': 64,
        'num_block': 23,
        'num_grow_ch': 32,
        'scale': 4
    }, output_path)
    
    print(f"\n[OK] Conversion terminee!")
    print(f"  Couches mappees: {len(mapped_dict)}/{len(model_dict)}")
    
    return output_path


def main():
    """Fonction principale"""
    if len(sys.argv) < 2:
        print("Usage: python convert_model.py <input_model.pt> [output_model.pt]")
        print("\nExemple:")
        print("  python convert_model.py 4xUltrasharp_4xUltrasharpV10.pt")
        print("  python convert_model.py input.pt output_converted.pt")
        return
    
    input_path = Path(sys.argv[1])
    
    if not input_path.exists():
        print(f"Erreur: Fichier non trouve: {input_path}")
        return
    
    # Déterminer le chemin de sortie
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        # Créer un nom de sortie automatique
        output_path = input_path.parent / f"{input_path.stem}_converted{input_path.suffix}"
    
    # Analyser le format
    format_type = analyze_checkpoint(input_path)
    
    if format_type == 'realesrgan':
        print("\nConversion du modele Real-ESRGAN...")
        try:
            convert_with_intelligent_mapping(input_path, output_path)
            print(f"\n[OK] Modele converti avec succes!")
            print(f"  Fichier: {output_path}")
            print(f"\nVous pouvez maintenant utiliser ce modele avec l'application.")
        except Exception as e:
            print(f"\n[ERREUR] Erreur lors de la conversion: {e}")
            import traceback
            traceback.print_exc()
    elif format_type == 'standard':
        print("\nLe modele est deja au format standard, pas besoin de conversion.")
    else:
        print("\nFormat de modele non reconnu.")


if __name__ == '__main__':
    main()
