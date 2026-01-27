"""
Module ESRGAN pour l'upscaling d'images
Utilise les modèles existants dans StabilityMatrix
"""

import os
import torch
import torch.nn as nn
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Optional, Tuple
import zipfile
import tempfile


class RRDBNet(nn.Module):
    """
    Architecture RRDBNet pour ESRGAN
    """
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, 
                 num_block=23, num_grow_ch=32, scale=4):
        super(RRDBNet, self).__init__()
        self.scale = scale
        self.conv_first = nn.Conv2d(num_in_ch, num_feat, 3, 1, 1)
        self.body = self._make_layer(num_block, num_feat, num_grow_ch)
        self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_last = nn.Conv2d(num_feat, num_out_ch, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)
        
        # Upsampling
        self.upsample = nn.Sequential(
            nn.Conv2d(num_feat, num_feat * 4, 3, 1, 1),
            nn.PixelShuffle(2),
            nn.LeakyReLU(negative_slope=0.2, inplace=True)
        )
    
    def _make_layer(self, num_block, num_feat, num_grow_ch):
        layers = []
        for _ in range(num_block):
            layers.append(ResidualDenseBlock_5C(num_feat, num_grow_ch))
        return nn.Sequential(*layers)
    
    def forward(self, x):
        feat = self.conv_first(x)
        body_feat = self.conv_body(self.body(feat))
        feat = feat + body_feat
        feat = self.lrelu(self.conv_up1(self.upsample(feat)))
        if self.scale == 4:
            feat = self.lrelu(self.conv_up2(self.upsample(feat)))
        out = self.conv_last(self.lrelu(self.conv_hr(feat)))
        return out


class ResidualDenseBlock_5C(nn.Module):
    def __init__(self, nf=64, gc=32, bias=True):
        super(ResidualDenseBlock_5C, self).__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1, bias=bias)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1, bias=bias)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1, bias=bias)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1, bias=bias)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1, bias=bias)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)
    
    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class ESRGANUpscaler:
    """
    Classe pour upscaler des images avec ESRGAN
    """
    
    def __init__(self, model_path: str, device: Optional[str] = None):
        """
        Initialise l'upscaler ESRGAN
        
        Args:
            model_path: Chemin vers le fichier modèle (.pt, .pth, ou .zip)
            device: Device PyTorch ('cuda', 'cpu', ou None pour auto-détection)
        """
        self.model_path = Path(model_path)
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scale = 4  # Facteur d'upscaling par défaut
        
        if not self.model_path.exists():
            raise FileNotFoundError(f"Modèle non trouvé: {model_path}")
        
        self._load_model()
    
    def _load_model(self):
        """Charge le modèle ESRGAN"""
        print(f"Chargement du modèle depuis: {self.model_path}")
        print(f"Device: {self.device}")
        
        try:
            # Gérer les fichiers ZIP (comme fixYourBlurHires_4xUltra4xAnimeSharp.zip)
            if self.model_path.suffix == '.zip':
                with zipfile.ZipFile(self.model_path, 'r') as zip_ref:
                    # Extraire dans un dossier temporaire
                    with tempfile.TemporaryDirectory() as temp_dir:
                        zip_ref.extractall(temp_dir)
                        # Chercher un fichier .pt ou .pth dans l'archive
                        model_files = list(Path(temp_dir).rglob('*.pt')) + list(Path(temp_dir).rglob('*.pth'))
                        if model_files:
                            actual_model_path = model_files[0]
                            try:
                                checkpoint = torch.load(actual_model_path, map_location=self.device, weights_only=False)
                            except TypeError:
                                checkpoint = torch.load(actual_model_path, map_location=self.device)
                        else:
                            raise FileNotFoundError("Aucun fichier modèle trouvé dans l'archive ZIP")
            else:
                # PyTorch 2.6+ nécessite weights_only=False pour charger les modèles avec classes personnalisées
                try:
                    checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
                except TypeError:
                    # Pour les versions antérieures de PyTorch
                    checkpoint = torch.load(self.model_path, map_location=self.device)
            
            # Détection de l'architecture du modèle
            if isinstance(checkpoint, dict):
                # Essayer différentes clés possibles
                if 'model' in checkpoint:
                    # Le modèle est déjà un nn.Module complet
                    self.model = checkpoint['model'].to(self.device).eval()
                elif isinstance(checkpoint, dict) and any(k.startswith('model.') for k in checkpoint.keys()):
                    # Le modèle utilise une structure "model.0.weight", "model.1.sub..." etc.
                    # C'est probablement un modèle Real-ESRGAN avec structure différente
                    # Vérifier si c'est un modèle converti
                    if 'converted_from' in checkpoint and checkpoint['converted_from'] == 'Real-ESRGAN':
                        # C'est un modèle déjà converti, utiliser state_dict
                        # Utiliser les paramètres du checkpoint si disponibles
                        num_in_ch = checkpoint.get('num_in_ch', 3)
                        num_out_ch = checkpoint.get('num_out_ch', 3)
                        num_feat = checkpoint.get('num_feat', 64)
                        num_block = checkpoint.get('num_block', 23)
                        num_grow_ch = checkpoint.get('num_grow_ch', 32)
                        scale = checkpoint.get('scale', 4)
                        
                        self.model = RRDBNet(num_in_ch=num_in_ch, num_out_ch=num_out_ch, 
                                           num_feat=num_feat, num_block=num_block, 
                                           num_grow_ch=num_grow_ch, scale=scale)
                        self.model.load_state_dict(checkpoint['state_dict'], strict=False)
                        self.model = self.model.to(self.device).eval()
                    else:
                        # Modèle non converti, essayer de charger quand même
                        self._load_real_esrgan_format(checkpoint)
                elif 'params' in checkpoint:
                    self.model = RRDBNet(num_in_ch=3, num_out_ch=3, 
                                       num_feat=64, num_block=23, 
                                       num_grow_ch=32, scale=4)
                    self.model.load_state_dict(checkpoint['params'])
                    self.model = self.model.to(self.device).eval()
                elif 'state_dict' in checkpoint:
                    self.model = RRDBNet(num_in_ch=3, num_out_ch=3, 
                                       num_feat=64, num_block=23, 
                                       num_grow_ch=32, scale=4)
                    self.model.load_state_dict(checkpoint['state_dict'])
                    self.model = self.model.to(self.device).eval()
                elif 'model_state_dict' in checkpoint:
                    self.model = RRDBNet(num_in_ch=3, num_out_ch=3, 
                                       num_feat=64, num_block=23, 
                                       num_grow_ch=32, scale=4)
                    self.model.load_state_dict(checkpoint['model_state_dict'])
                    self.model = self.model.to(self.device).eval()
                else:
                    # Le checkpoint est directement le state_dict
                    # Vérifier si c'est le format Real-ESRGAN
                    if any(k.startswith('model.') for k in checkpoint.keys()):
                        self._load_real_esrgan_format(checkpoint)
                    else:
                        self.model = RRDBNet(num_in_ch=3, num_out_ch=3, 
                                           num_feat=64, num_block=23, 
                                           num_grow_ch=32, scale=4)
                        # Essayer de charger directement
                        try:
                            self.model.load_state_dict(checkpoint)
                        except:
                            # Si ça échoue, essayer avec les clés du dictionnaire
                            self.model.load_state_dict({k.replace('module.', ''): v for k, v in checkpoint.items()})
                        self.model = self.model.to(self.device).eval()
            else:
                # Format direct (le modèle lui-même)
                if isinstance(checkpoint, torch.nn.Module):
                    self.model = checkpoint.to(self.device).eval()
                else:
                    raise RuntimeError("Format de modèle non reconnu")
            
            print("[OK] Modele charge avec succes")
            
        except Exception as e:
            print(f"Erreur lors du chargement: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Impossible de charger le modèle: {e}")
    
    def _load_real_esrgan_format(self, checkpoint):
        """Charge un modèle au format Real-ESRGAN"""
        # Le checkpoint utilise une structure "model.0", "model.1.sub..." etc.
        # C'est le format Real-ESRGAN standard qui nécessite la bibliothèque Real-ESRGAN
        
        # Vérifier si Real-ESRGAN est disponible via le wrapper
        try:
            from esrgan_wrapper import REALESRGAN_AVAILABLE
            if REALESRGAN_AVAILABLE:
                # Si Real-ESRGAN est disponible, on ne devrait pas arriver ici
                # car le wrapper devrait l'utiliser. Mais si on arrive ici,
                # c'est qu'il y a un problème. On lève quand même l'erreur
                # mais avec un message plus clair.
                print("[AVERTISSEMENT] Format Real-ESRGAN detecte mais Real-ESRGAN devrait etre utilise via le wrapper")
        except ImportError:
            pass
        
        print("="*60)
        print("ERREUR: Format de modele Real-ESRGAN detecte")
        print("="*60)
        print("Ce modele utilise le format Real-ESRGAN qui necessite")
        print("la bibliotheque Real-ESRGAN pour fonctionner correctement.")
        print("")
        print("Solutions possibles:")
        print("1. Installer Real-ESRGAN (recommandé):")
        print("   pip install realesrgan")
        print("   Note: L'installation peut etre complexe sur Windows")
        print("")
        print("2. Utiliser un modele au format ESRGAN standard")
        print("   (sans le prefixe 'model.' dans les cles)")
        print("")
        print("3. Convertir le modele vers un format compatible")
        print("="*60)
        
        raise RuntimeError(
            "Le modele utilise le format Real-ESRGAN qui n'est pas compatible "
            "avec cette implementation. Veuillez installer Real-ESRGAN ou utiliser "
            "un modele au format ESRGAN standard."
        )
    
    def _load_custom_format(self, checkpoint):
        """Charge un modèle avec format personnalisé"""
        # Si le checkpoint contient 'model' comme clé principale, l'utiliser
        if isinstance(checkpoint, dict) and 'model' in checkpoint:
            if isinstance(checkpoint['model'], torch.nn.Module):
                self.model = checkpoint['model'].to(self.device).eval()
                return
        
        # Si le checkpoint est directement un nn.Module
        if isinstance(checkpoint, torch.nn.Module):
            self.model = checkpoint.to(self.device).eval()
            return
        
        # Dernière tentative : essayer de créer un modèle wrapper
        # qui utilise directement les poids du checkpoint
        # Pour cela, on va utiliser une approche simple : charger avec notre architecture
        # et ignorer les erreurs de mapping
        print("Tentative de chargement avec architecture personnalisee...")
        self.model = RRDBNet(num_in_ch=3, num_out_ch=3, 
                           num_feat=64, num_block=23, 
                           num_grow_ch=32, scale=4)
        
        # Essayer de charger avec strict=False
        try:
            self.model.load_state_dict(checkpoint, strict=False)
            print("Modele charge avec strict=False")
        except Exception as e:
            print(f"Erreur lors du chargement: {e}")
            # Essayer de mapper les clés "model.X" vers notre structure
            mapped_state = {}
            for k, v in checkpoint.items():
                # Enlever le préfixe "model." si présent
                new_key = k.replace('model.', '')
                mapped_state[new_key] = v
            
            try:
                self.model.load_state_dict(mapped_state, strict=False)
                print("Modele charge apres mapping des cles")
            except Exception as e2:
                raise RuntimeError(f"Impossible de charger le modele: {e2}")
        
        self.model = self.model.to(self.device).eval()
    
    def upscale(self, image: Image.Image, tile_size: int = 512, 
                tile_pad: int = 10) -> Image.Image:
        """
        Upscale une image avec le modèle ESRGAN
        
        Args:
            image: Image PIL à upscaler
            tile_size: Taille des tuiles pour le traitement (pour économiser la mémoire)
            tile_pad: Padding autour des tuiles
            
        Returns:
            Image PIL upscalée (4x la taille originale)
        """
        if self.model is None:
            raise RuntimeError("Modèle non chargé")
        
        print(f"[DEBUG] Upscaling image: {image.size}, mode: {image.mode}")
        
        # Conversion en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
            print(f"[DEBUG] Image convertie en RGB: {image.size}")
        
        # Conversion en tensor
        img_array = np.array(image).astype(np.float32) / 255.0
        img_tensor = torch.from_numpy(np.transpose(img_array, (2, 0, 1))).float()
        img_tensor = img_tensor.unsqueeze(0).to(self.device)
        
        print(f"[DEBUG] Tensor shape: {img_tensor.shape}, device: {img_tensor.device}")
        print(f"[DEBUG] Tensor range: [{img_tensor.min().item():.3f}, {img_tensor.max().item():.3f}]")
        
        # Upscaling par tuiles pour les grandes images
        if img_tensor.shape[2] * img_tensor.shape[3] > tile_size * tile_size:
            print(f"[DEBUG] Utilisation du traitement par tuiles")
            output = self._upscale_tiled(img_tensor, tile_size, tile_pad)
        else:
            print(f"[DEBUG] Traitement direct (pas de tuiles)")
            with torch.no_grad():
                try:
                    output = self.model(img_tensor)
                    print(f"[DEBUG] Output shape: {output.shape}")
                    print(f"[DEBUG] Output range: [{output.min().item():.3f}, {output.max().item():.3f}]")
                except Exception as e:
                    print(f"[DEBUG] Erreur lors du forward: {e}")
                    import traceback
                    traceback.print_exc()
                    raise
        
        # Post-traitement
        # Vérifier si les valeurs sont dans une plage raisonnable
        output_min = output.min().item()
        output_max = output.max().item()
        print(f"[DEBUG] Output avant traitement: [{output_min:.3f}, {output_max:.3f}]")
        
        # Le modèle ESRGAN peut produire des valeurs en dehors de [0,1]
        # On doit les normaliser correctement
        if output_max > 1.0 or output_min < 0.0:
            # Si les valeurs sont très élevées, c'est probablement que le modèle
            # n'a pas été correctement calibré. On va utiliser une normalisation adaptative
            if abs(output_max) > 100 or abs(output_min) > 100:
                print(f"[DEBUG] Valeurs tres elevees detectees, normalisation adaptative...")
                # Normaliser vers [0, 1] en utilisant percentile pour être plus robuste
                # Utiliser les percentiles 1% et 99% pour éviter les outliers
                output_flat = output.flatten()
                p1 = torch.quantile(output_flat, 0.01).item()
                p99 = torch.quantile(output_flat, 0.99).item()
                print(f"[DEBUG] Percentiles: 1%={p1:.3f}, 99%={p99:.3f}")
                
                # Normaliser entre p1 et p99, puis clamp
                output = (output - p1) / (p99 - p1 + 1e-8)
                output = torch.clamp(output, 0, 1)
            else:
                # Valeurs modérément hors de [0,1], juste clamp
                print(f"[DEBUG] Valeurs moderees hors range, clamp simple...")
                output = torch.clamp(output, 0, 1)
        else:
            # Déjà dans [0,1], juste s'assurer
            output = torch.clamp(output, 0, 1)
        
        print(f"[DEBUG] Output apres traitement: [{output.min().item():.3f}, {output.max().item():.3f}]")
        
        # Conversion en PIL
        output_np = output.squeeze(0).cpu().numpy()
        output_np = np.transpose(output_np, (1, 2, 0))
        
        # Vérifier que l'image n'est pas uniforme
        if output_np.std() < 0.01:
            print(f"[DEBUG] ATTENTION: Image uniforme (std={output_np.std():.3f})")
            print(f"[DEBUG] Fallback vers interpolation...")
            # Fallback: utiliser interpolation simple
            return image.resize((image.size[0] * 4, image.size[1] * 4), Image.LANCZOS)
        
        output_np = np.clip(output_np * 255, 0, 255).astype(np.uint8)
        
        print(f"[DEBUG] Output numpy shape: {output_np.shape}, range: [{output_np.min()}, {output_np.max()}]")
        
        # Vérifier que l'image n'est pas vide
        if output_np.max() == 0 or output_np.min() == output_np.max():
            print(f"[DEBUG] ATTENTION: Image de sortie suspecte (min={output_np.min()}, max={output_np.max()})")
            # Si l'image est vide, retourner l'image originale agrandie avec interpolation
            print(f"[DEBUG] Fallback: utilisation de l'interpolation bilineaire")
            return image.resize((image.size[0] * 4, image.size[1] * 4), Image.LANCZOS)
        
        result_image = Image.fromarray(output_np)
        print(f"[DEBUG] Image finale: {result_image.size}, mode: {result_image.mode}")
        
        return result_image
    
    def _upscale_tiled(self, img_tensor: torch.Tensor, 
                      tile_size: int, tile_pad: int) -> torch.Tensor:
        """Upscale une image par tuiles pour économiser la mémoire"""
        batch, channel, height, width = img_tensor.shape
        scale = self.scale
        
        output_height = height * scale
        output_width = width * scale
        
        # Calculer le nombre de tuiles
        tiles_y = (height + tile_size - 1) // tile_size
        tiles_x = (width + tile_size - 1) // tile_size
        
        output = torch.zeros((batch, channel, output_height, output_width), 
                           dtype=img_tensor.dtype, device=self.device)
        
        for y in range(tiles_y):
            for x in range(tiles_x):
                # Calculer les coordonnées de la tuile
                y_start = y * tile_size
                y_end = min(y_start + tile_size, height)
                x_start = x * tile_size
                x_end = min(x_start + tile_size, width)
                
                # Extraire la tuile avec padding
                y_pad_start = max(0, y_start - tile_pad)
                y_pad_end = min(height, y_end + tile_pad)
                x_pad_start = max(0, x_start - tile_pad)
                x_pad_end = min(width, x_end + tile_pad)
                
                tile = img_tensor[:, :, y_pad_start:y_pad_end, 
                                x_pad_start:x_pad_end]
                
                # Upscaler la tuile
                with torch.no_grad():
                    upscaled_tile = self.model(tile)
                
                # Calculer les coordonnées de sortie
                y_out_start = y_start * scale
                y_out_end = y_end * scale
                x_out_start = x_start * scale
                x_out_end = x_end * scale
                
                # Calculer le padding à retirer
                y_pad_remove = (y_start - y_pad_start) * scale
                x_pad_remove = (x_start - x_pad_start) * scale
                
                y_out_start_final = y_out_start - y_pad_remove
                y_out_end_final = y_out_end - y_pad_remove
                x_out_start_final = x_out_start - x_pad_remove
                x_out_end_final = x_out_end - x_pad_remove
                
                # Dimensions de la tuile upscalée sans padding
                tile_h = (y_end - y_start) * scale
                tile_w = (x_end - x_start) * scale
                
                # Placer la tuile upscalée dans l'image de sortie
                output[:, :, y_out_start_final:y_out_start_final + tile_h, 
                      x_out_start_final:x_out_start_final + tile_w] = \
                    upscaled_tile[:, :, y_pad_remove:y_pad_remove + tile_h,
                                 x_pad_remove:x_pad_remove + tile_w]
        
        return output
