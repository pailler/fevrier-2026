"""
Wrapper pour utiliser Real-ESRGAN directement si disponible
Fallback vers notre implémentation si Real-ESRGAN n'est pas installé
"""

import os
from pathlib import Path
from PIL import Image
from typing import Optional
import numpy as np
import cv2
import cv2

# Essayer d'importer Real-ESRGAN
REALESRGAN_AVAILABLE = False
try:
    from realesrgan import RealESRGANer
    # RRDBNet est dans basicsr, pas dans realesrgan
    try:
        from basicsr.archs.rrdbnet_arch import RRDBNet as RealESRGAN_RRDBNet
    except ImportError:
        # Si basicsr n'a pas RRDBNet, on utilisera RealESRGANer sans modèle spécifique
        RealESRGAN_RRDBNet = None
    
    REALESRGAN_AVAILABLE = True
    print("[INFO] Real-ESRGAN disponible - utilisation directe des modeles")
except ImportError as e:
    print(f"[INFO] Real-ESRGAN non disponible - utilisation de l'implementation personnalisee")
    print(f"       Erreur: {e}")
    REALESRGAN_AVAILABLE = False


class ESRGANUpscalerWrapper:
    """
    Wrapper qui utilise Real-ESRGAN si disponible, sinon notre implémentation
    """
    
    def __init__(self, model_path: str, device: Optional[str] = None, use_realesrgan: Optional[bool] = None):
        """
        Initialise l'upscaler
        
        Args:
            model_path: Chemin vers le fichier modèle
            device: Device PyTorch ('cuda', 'cpu', ou None)
            use_realesrgan: Forcer l'utilisation de Real-ESRGAN (None = auto-détection)
        """
        self.model_path = Path(model_path)
        self.device = device or ('cuda' if hasattr(__import__('torch'), 'cuda') and __import__('torch').cuda.is_available() else 'cpu')
        self.use_realesrgan = use_realesrgan if use_realesrgan is not None else REALESRGAN_AVAILABLE
        self.upsampler = None
        self.fallback_upscaler = None
        
        if not self.model_path.exists():
            raise FileNotFoundError(f"Modele non trouve: {model_path}")
        
        self._initialize()
    
    def _initialize(self):
        """Initialise l'upscaler (Real-ESRGAN ou fallback)"""
        if self.use_realesrgan and REALESRGAN_AVAILABLE:
            self._init_realesrgan()
        else:
            self._init_fallback()
    
    def _init_realesrgan(self):
        """Initialise Real-ESRGAN"""
        try:
            print(f"[Real-ESRGAN] Chargement du modele: {self.model_path}")
            
            # Vérifier d'abord la structure du checkpoint
            import torch
            try:
                checkpoint = torch.load(str(self.model_path), map_location='cpu', weights_only=False)
                print(f"[Real-ESRGAN] Structure du checkpoint: {list(checkpoint.keys())[:10] if isinstance(checkpoint, dict) else type(checkpoint)}")
                
                # Vérifier si le checkpoint a la structure attendue par Real-ESRGAN
                if isinstance(checkpoint, dict):
                    has_params = 'params' in checkpoint or 'params_ema' in checkpoint
                    has_model_keys = any(k.startswith('model.') for k in checkpoint.keys())
                    
                    if not has_params and has_model_keys:
                        # Le modèle utilise le format "model.X" mais pas "params"
                        # Il faut convertir ou utiliser le fallback
                        print("[Real-ESRGAN] Format detecte: model.X (pas params)")
                        print("[Real-ESRGAN] Ce format necessite une conversion ou un chargement special")
                        raise ValueError("Format de modele non supporte directement par RealESRGANer")
            except Exception as e:
                print(f"[Real-ESRGAN] Erreur lors de l'analyse du checkpoint: {e}")
                raise
            
            # RealESRGANer nécessite un modèle, pas None
            # Créer le modèle RRDBNet avec les paramètres par défaut
            if RealESRGAN_RRDBNet is not None:
                model = RealESRGAN_RRDBNet(
                    num_in_ch=3,
                    num_out_ch=3,
                    num_feat=64,
                    num_block=23,
                    num_grow_ch=32,
                    scale=4
                )
            else:
                # Si RRDBNet n'est pas disponible, essayer sans modèle (peut échouer)
                model = None
            
            # Utiliser RealESRGANer avec le modèle
            self.upsampler = RealESRGANer(
                scale=4,
                model_path=str(self.model_path),
                model=model,  # Passer le modèle créé
                tile=512,
                tile_pad=10,
                pre_pad=0,
                half=False,  # Utiliser float32 pour compatibilité
                gpu_id=0 if self.device == 'cuda' else -1
            )
            
            print("[Real-ESRGAN] Modele charge avec succes")
            self.scale = 4
            
        except (KeyError, ValueError, AttributeError) as e:
            # Erreur de format - le modèle n'a pas la structure attendue
            print(f"[Real-ESRGAN] Format de modele incompatible: {e}")
            print("[Real-ESRGAN] Le modele utilise probablement le format 'model.X'")
            print("[Real-ESRGAN] Tentative de chargement manuel avec conversion...")
            self.use_realesrgan = False
            # Ne PAS utiliser le fallback car il rejette aussi ce format
            # Au lieu de cela, essayer de charger manuellement
            try:
                self._init_realesrgan_manual()
                # Si le chargement manuel réussit, on marque comme utilisant Real-ESRGAN
                self.use_realesrgan = True
            except Exception as manual_error:
                print(f"[Real-ESRGAN] Echec du chargement manuel: {manual_error}")
                import traceback
                traceback.print_exc()
                raise RuntimeError(f"Impossible de charger le modele Real-ESRGAN: {manual_error}")
        except Exception as e:
            print(f"[Real-ESRGAN] Erreur lors du chargement: {e}")
            import traceback
            traceback.print_exc()
            print("[Real-ESRGAN] Fallback vers implementation personnalisee...")
            self.use_realesrgan = False
            self._init_fallback()
    
    def _init_realesrgan_manual(self):
        """Charge un modèle Real-ESRGAN manuellement en convertissant le format"""
        try:
            import torch
            from basicsr.archs.rrdbnet_arch import RRDBNet
            
            print("[Real-ESRGAN] Tentative de chargement manuel avec conversion du format...")
            
            # Charger le checkpoint
            checkpoint = torch.load(str(self.model_path), map_location='cpu', weights_only=False)
            
            # Créer le modèle
            model = RRDBNet(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_block=23,
                num_grow_ch=32,
                scale=4
            )
            
            # Convertir les clés du format "model.X" vers le format standard
            if isinstance(checkpoint, (dict, torch.nn.Module)):
                # Si c'est un OrderedDict ou dict avec clés "model.X"
                if hasattr(checkpoint, 'keys'):
                    # Chercher les clés qui commencent par "model."
                    model_keys = {k: v for k, v in checkpoint.items() if k.startswith('model.')}
                    
                    if model_keys:
                        # Mapping intelligent de la structure Real-ESRGAN vers RRDBNet
                        state_dict = self._convert_realesrgan_keys_to_rrdbnet(model_keys, model.state_dict())
                        
                        # Charger le state_dict
                        missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=False)
                        if missing_keys:
                            print(f"[Real-ESRGAN] Cles manquantes: {len(missing_keys)}")
                            if len(missing_keys) < 10:
                                print(f"  Exemples: {missing_keys[:5]}")
                        if unexpected_keys:
                            print(f"[Real-ESRGAN] Cles inattendues: {len(unexpected_keys)}")
                        
                        # Vérifier le ratio de mapping
                        mapped_count = len(state_dict)
                        total_expected = len(model.state_dict())
                        print(f"[Real-ESRGAN] Couches mappees: {mapped_count}/{total_expected} ({100*mapped_count/total_expected:.1f}%)")
                        
                        if mapped_count < total_expected * 0.5:
                            print("[Real-ESRGAN] AVERTISSEMENT: Moins de 50% des couches sont mappees!")
                            print("[Real-ESRGAN] Le modele peut ne pas fonctionner correctement.")
                        
                        # Créer un wrapper compatible avec RealESRGANer
                        self.upsampler = self._create_realesrgan_wrapper(model)
                        self.scale = 4
                        self.use_realesrgan = True  # Marquer comme utilisant Real-ESRGAN
                        print("[Real-ESRGAN] Modele charge manuellement avec succes (format converti)")
                        return
                    else:
                        # Pas de clés "model.", peut-être que c'est déjà un state_dict
                        try:
                            missing_keys, unexpected_keys = model.load_state_dict(checkpoint, strict=False)
                            self.upsampler = self._create_realesrgan_wrapper(model)
                            self.scale = 4
                            self.use_realesrgan = True
                            print("[Real-ESRGAN] Modele charge directement avec succes")
                            return
                        except:
                            pass
            
            raise ValueError("Format de checkpoint non reconnu")
            
        except Exception as e:
            print(f"[Real-ESRGAN] Erreur lors du chargement manuel: {e}")
            import traceback
            traceback.print_exc()
            # Dernier recours : fallback (mais il va aussi échouer)
            print("[Real-ESRGAN] Le fallback va aussi echouer car le format n'est pas compatible")
            print("[Real-ESRGAN] Il faudrait convertir le modele au prealable")
            raise RuntimeError(f"Impossible de charger le modele Real-ESRGAN: {e}")
    
    def _convert_realesrgan_keys_to_rrdbnet(self, checkpoint_keys, model_state_dict):
        """
        Convertit les clés du format Real-ESRGAN (model.X) vers RRDBNet (conv_first, body.X, etc.)
        """
        state_dict = {}
        
        # Mapping des patterns
        for checkpoint_key, value in checkpoint_keys.items():
            target_key = None
            
            # 1. Couche d'entrée: model.0.* -> conv_first.*
            if checkpoint_key.startswith('model.0.'):
                if 'weight' in checkpoint_key:
                    target_key = 'conv_first.weight'
                elif 'bias' in checkpoint_key:
                    target_key = 'conv_first.bias'
            
            # 2. Couche de corps: model.1.sub.* -> body.*
            elif checkpoint_key.startswith('model.1.sub.'):
                # Format: model.1.sub.0.RDB1.conv1.0.weight
                # Attendu: body.0.rdb1.conv1.weight
                parts = checkpoint_key.replace('model.1.sub.', '').split('.')
                if len(parts) >= 4:
                    block_idx = parts[0]  # 0, 1, 2, ...
                    rdb_name = parts[1].lower()  # RDB1 -> rdb1
                    conv_name = parts[2].lower()  # conv1 -> conv1
                    param_type = parts[-1]  # weight ou bias
                    
                    # Construire la clé cible
                    target_key = f'body.{block_idx}.{rdb_name}.{conv_name}.{param_type}'
            
            # 3. Couche de corps (conv_body): chercher après model.1.sub
            # Format possible: model.1.conv_body.* ou après les RDB blocks
            elif 'conv_body' in checkpoint_key.lower() or (checkpoint_key.startswith('model.1.') and 'sub' not in checkpoint_key):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                # Vérifier si c'est vraiment conv_body (pas dans sub)
                if len(parts) == 3 and parts[1] == '1':
                    target_key = f'conv_body.{param_type}'
            
            # 4. Couches d'upsampling: analyser la structure
            # model.2.* pourrait être conv_up1 ou le début de l'upsampling
            elif checkpoint_key.startswith('model.2.'):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                # Si c'est une couche simple (model.2.weight), c'est probablement conv_up1
                if len(parts) == 3:
                    target_key = f'conv_up1.{param_type}'
                # Sinon, analyser plus en détail
                elif 'up' in checkpoint_key.lower() or 'pixelshuffle' in checkpoint_key.lower():
                    # Détecter up1 vs up2 selon l'index ou le contexte
                    if '2' in parts[1] or (len(parts) > 2 and parts[2] == '0'):
                        target_key = f'conv_up1.{param_type}'
                    else:
                        target_key = f'conv_up2.{param_type}'
            
            elif checkpoint_key.startswith('model.3.'):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                # model.3.* est conv_body (après les RDB blocks, shape [64, 64, 3, 3])
                if len(parts) == 3:
                    target_key = f'conv_body.{param_type}'
            
            # 5. Couches d'upsampling et HR: model.6, model.8, model.10
            # D'après l'analyse: model.6 -> conv_up1, model.8 -> conv_hr, model.10 -> conv_last
            elif checkpoint_key.startswith('model.6.'):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                # model.6.* est conv_up1 (premier upsampling, shape [64, 64, 3, 3])
                if len(parts) == 3:
                    target_key = f'conv_up1.{param_type}'
            
            elif checkpoint_key.startswith('model.8.'):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                # model.8.* est conv_hr (après upsampling, shape [64, 64, 3, 3])
                if len(parts) == 3:
                    target_key = f'conv_hr.{param_type}'
            
            # 6. Couche finale: model.5.* ou dernière -> conv_last.*
            elif checkpoint_key.startswith('model.5.') or checkpoint_key.startswith('model.6.'):
                parts = checkpoint_key.split('.')
                param_type = parts[-1]
                if len(parts) == 3:
                    target_key = f'conv_last.{param_type}'
            
            # 7. Mapping basé sur les shapes pour les couches simples (model.X.weight/bias)
            if target_key is None:
                parts = checkpoint_key.split('.')
                if len(parts) == 3 and parts[0] == 'model' and parts[-1] in ['weight', 'bias']:
                    try:
                        layer_num = int(parts[1])
                        param_type = parts[-1]
                        
                        # Vérifier la shape pour déterminer la couche
                        value_shape = value.shape
                        
                        # conv_body: [64, 64, 3, 3] pour weight, [64] pour bias
                        # conv_up1: [256, 64, 3, 3] pour weight (PixelShuffle), [256] pour bias
                        # conv_up2: [256, 64, 3, 3] pour weight (PixelShuffle), [256] pour bias
                        # conv_hr: [64, 64, 3, 3] pour weight, [64] pour bias
                        # conv_last: [3, 64, 3, 3] pour weight, [3] pour bias
                        
                        # Mapping basé sur l'ordre logique de l'architecture:
                        # model.0 -> conv_first (déjà mappé)
                        # model.1.sub.* -> body.* (déjà mappé)
                        # model.3 -> conv_body (après les RDB blocks, shape [64, 64, 3, 3])
                        # model.6 -> conv_up1 (premier upsampling, shape [64, 64, 3, 3])
                        # model.8 -> conv_hr (après upsampling, shape [64, 64, 3, 3])
                        # model.10 -> conv_last (sortie finale, shape [3, 64, 3, 3])
                        
                        if param_type == 'weight':
                            if value_shape == (64, 64, 3, 3):
                                if layer_num == 3:
                                    target_key = 'conv_body.weight'
                                elif layer_num == 6:
                                    target_key = 'conv_up1.weight'
                                elif layer_num == 8:
                                    target_key = 'conv_hr.weight'
                            elif value_shape == (256, 64, 3, 3):
                                # PixelShuffle (dans le module upsample, pas directement)
                                if layer_num <= 4:
                                    target_key = 'conv_up1.weight'
                                else:
                                    target_key = 'conv_up2.weight'
                            elif value_shape == (3, 64, 3, 3):
                                target_key = 'conv_last.weight'
                        elif param_type == 'bias':
                            if value_shape == (64,):
                                if layer_num == 3:
                                    target_key = 'conv_body.bias'
                                elif layer_num == 6:
                                    target_key = 'conv_up1.bias'
                                elif layer_num == 8:
                                    target_key = 'conv_hr.bias'
                            elif value_shape == (256,):
                                # PixelShuffle
                                if layer_num <= 4:
                                    target_key = 'conv_up1.bias'
                                else:
                                    target_key = 'conv_up2.bias'
                            elif value_shape == (3,):
                                target_key = 'conv_last.bias'
                    except (ValueError, IndexError):
                        pass
            
            # Si on a trouvé une correspondance et que la shape correspond
            if target_key and target_key in model_state_dict:
                expected_shape = model_state_dict[target_key].shape
                if value.shape == expected_shape:
                    state_dict[target_key] = value
                else:
                    print(f"[Real-ESRGAN] Shape mismatch: {checkpoint_key} {value.shape} != {target_key} {expected_shape}")
        
        return state_dict
    
    def _create_realesrgan_wrapper(self, model):
        """Crée un wrapper compatible avec RealESRGANer pour un modèle déjà chargé"""
        # Importer les fonctions nécessaires de Real-ESRGAN
        from realesrgan.utils import RealESRGANer
        # cv2 et numpy sont déjà importés en haut du fichier
        
        # Créer un wrapper qui imite RealESRGANer
        class CustomRealESRGANer:
            def __init__(self, model, device, tile=512, tile_pad=10, pre_pad=0, half=False):
                self.scale = 4
                self.tile_size = tile
                self.tile_pad = tile_pad
                self.pre_pad = pre_pad
                self.half = half
                self.device = device
                self.model = model.to(device)
                if half:
                    self.model = self.model.half()
                self.model.eval()
            
            def enhance(self, img, outscale=None):
                """Upscale une image (compatible avec RealESRGANer.enhance)"""
                import torch
                import torch.nn.functional as F
                
                # Convertir en numpy si nécessaire
                if isinstance(img, Image.Image):
                    img = np.array(img)
                
                # Normaliser l'input comme RealESRGAN (0-255 -> 0-1)
                img = img.astype(np.float32)
                if np.max(img) > 256:  # 16-bit image
                    max_range = 65535
                    img = img / max_range
                else:
                    max_range = 255
                    img = img / max_range
                
                # Convertir BGR -> RGB si nécessaire (OpenCV utilise BGR)
                if len(img.shape) == 3 and img.shape[2] == 3:
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # Convertir en tensor: HWC -> CHW, puis ajouter batch dimension
                img_tensor = torch.from_numpy(np.transpose(img, (2, 0, 1))).float().unsqueeze(0).to(self.device)
                
                # Upscale avec le modèle
                with torch.no_grad():
                    output = self.model(img_tensor)
                
                # Post-process comme RealESRGAN: clamp entre 0 et 1
                output = output.squeeze(0).float().cpu().clamp_(0, 1)
                
                # Convertir en numpy: CHW -> HWC, puis BGR -> RGB (comme RealESRGAN)
                output_np = output.numpy()
                output_np = np.transpose(output_np, (1, 2, 0))
                # RealESRGAN fait: output_img[[2, 1, 0], :, :] pour BGR->RGB
                output_np = output_np[:, :, [2, 1, 0]]  # RGB -> BGR pour compatibilité
                
                # Convertir en uint8 (0-255)
                if max_range == 65535:
                    output_np = (output_np * 65535.0).round().astype(np.uint16)
                else:
                    output_np = (output_np * 255.0).round().astype(np.uint8)
                
                return output_np, 'RGB'
        
        return CustomRealESRGANer(model, self.device, tile=512, tile_pad=10, pre_pad=0, half=False)
    
    def _init_fallback(self):
        """Initialise notre implémentation de fallback"""
        from esrgan_model import ESRGANUpscaler
        print(f"[Fallback] Utilisation de l'implementation personnalisee")
        self.fallback_upscaler = ESRGANUpscaler(str(self.model_path), self.device)
        self.scale = 4
    
    def upscale(self, image: Image.Image, tile_size: int = 512, tile_pad: int = 10) -> Image.Image:
        """
        Upscale une image
        
        Args:
            image: Image PIL à upscaler
            tile_size: Taille des tuiles (pour Real-ESRGAN, ignoré si utilisé)
            tile_pad: Padding des tuiles (pour Real-ESRGAN, ignoré si utilisé)
            
        Returns:
            Image PIL upscalée (4x)
        """
        if self.use_realesrgan and self.upsampler is not None:
            return self._upscale_realesrgan(image)
        else:
            return self.fallback_upscaler.upscale(image, tile_size, tile_pad)
    
    def _upscale_realesrgan(self, image: Image.Image) -> Image.Image:
        """Upscale avec Real-ESRGAN"""
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convertir en numpy array (RGB)
        img_array = np.array(image)
        
        # Vérifier si c'est notre wrapper personnalisé ou le vrai RealESRGANer
        if hasattr(self.upsampler, 'enhance'):
            # Upscaler avec Real-ESRGAN
            output, _ = self.upsampler.enhance(img_array, outscale=4)
            
            # Le output est en BGR (comme RealESRGAN), convertir en RGB
            if len(output.shape) == 3 and output.shape[2] == 3:
                output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
            
            # Convertir en PIL
            return Image.fromarray(output)
        else:
            # Fallback : utiliser directement le modèle
            import torch
            import torch.nn.functional as F
            
            # Normaliser l'input (0-255 -> 0-1)
            img_array = np.array(image).astype(np.float32) / 255.0
            
            # Convertir en tensor: HWC -> CHW
            img_tensor = torch.from_numpy(np.transpose(img_array, (2, 0, 1))).float().unsqueeze(0).to(self.upsampler.device)
            
            # Upscale
            with torch.no_grad():
                output = self.upsampler.model(img_tensor)
            
            # Clamp et normaliser
            output = output.squeeze(0).cpu().clamp_(0, 1)
            
            # Convertir en numpy: CHW -> HWC
            output_np = output.numpy()
            output_np = np.transpose(output_np, (1, 2, 0))
            
            # Convertir en uint8 (0-255)
            output_np = (output_np * 255.0).round().astype(np.uint8)
            
            # Convertir en PIL
            return Image.fromarray(output_np)
    
    @property
    def is_realesrgan(self) -> bool:
        """Retourne True si Real-ESRGAN est utilisé"""
        return self.use_realesrgan and self.upsampler is not None
