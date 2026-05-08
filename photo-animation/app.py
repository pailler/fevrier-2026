"""
Application d'animation de photos réaliste
Utilise des modèles d'IA pour animer des photos de façon réaliste
Compatible avec Hugging Face Spaces
"""

import gradio as gr
import torch
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import os
from typing import Optional, Tuple
import warnings
warnings.filterwarnings("ignore")

# Configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Configuration du cache des modèles
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ROOT_DIR)  # Remonter d'un niveau depuis photo-animation
MODELS_CACHE_DIR = os.path.join(PROJECT_ROOT, "ai-models-cache", "huggingface")

# Configurer les variables d'environnement pour utiliser le cache personnalisé
os.environ["HF_HOME"] = MODELS_CACHE_DIR
os.environ["HUGGINGFACE_HUB_CACHE"] = MODELS_CACHE_DIR
os.environ["TRANSFORMERS_CACHE"] = MODELS_CACHE_DIR

print(f"[INFO] Cache des modeles configure: {MODELS_CACHE_DIR}")

# Essayer d'importer diffusers, utiliser fallback si non disponible
DIFFUSERS_AVAILABLE = False
StableDiffusionImg2ImgPipeline = None

try:
    # Désactiver xformers pour éviter les erreurs de DLL
    os.environ["XFORMERS_DISABLED"] = "1"
    os.environ["DIFFUSERS_NO_ADAPTER"] = "1"
    from diffusers import StableDiffusionImg2ImgPipeline
    DIFFUSERS_AVAILABLE = True
    print("[OK] Diffusers disponible")
except Exception as e:
    DIFFUSERS_AVAILABLE = False
    StableDiffusionImg2ImgPipeline = None
    print(f"[WARNING] Diffusers non disponible ({type(e).__name__}), utilisation du mode fallback")
    print("   L'application fonctionnera avec OpenCV pour l'animation")

class PhotoAnimator:
    """Classe pour animer des photos de façon réaliste"""
    
    def __init__(self):
        self.pipeline = None
        self.device = DEVICE
        self.use_diffusers = DIFFUSERS_AVAILABLE
        if self.use_diffusers:
            self._load_model()
    
    def _load_model(self):
        """Charge le modèle d'animation"""
        if not self.use_diffusers:
            return
            
        try:
            print(f"Chargement du modèle sur {self.device}...")
            # Utilisation d'un modèle Img2Img pour l'animation
            model_id = "runwayml/stable-diffusion-v1-5"
            
            # Utiliser le cache personnalisé
            cache_dir = MODELS_CACHE_DIR
            
            print(f"[INFO] Utilisation du cache: {cache_dir}")
            
            self.pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                model_id,
                cache_dir=cache_dir,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            self.pipeline = self.pipeline.to(self.device)
            if self.device == "cuda":
                self.pipeline.enable_attention_slicing()
                self.pipeline.enable_model_cpu_offload()
            print("[OK] Modele charge avec succes depuis le cache!")
        except Exception as e:
            print(f"[ERREUR] Erreur lors du chargement du modele: {e}")
            import traceback
            traceback.print_exc()
            print("Utilisation d'un mode de fallback...")
            self.pipeline = None
            self.use_diffusers = False
    
    def animate_photo(
        self,
        image: Image.Image,
        animation_type: str = "subtle",
        strength: float = 0.5,
        num_frames: int = 8
    ) -> Image.Image:
        """
        Anime une photo de façon réaliste
        
        Args:
            image: Image PIL à animer
            animation_type: Type d'animation ("subtle", "moderate", "strong")
            strength: Force de l'animation (0.0 à 1.0)
            num_frames: Nombre de frames pour l'animation
        
        Returns:
            Image animée avec effet de mouvement
        """
        # Convertir l'image en format approprié
        image = image.convert("RGB")
        original_size = image.size
        
        # Utiliser le pipeline si disponible, sinon fallback
        if self.pipeline is not None and self.use_diffusers:
            try:
                # Ajuster la taille si nécessaire (limite pour la mémoire)
                max_size = 768
                width, height = image.size
                if width > max_size or height > max_size:
                    ratio = min(max_size / width, max_size / height)
                    new_width = int(width * ratio)
                    new_height = int(height * ratio)
                    resized_image = image.resize((new_width, new_height), Image.LANCZOS)
                else:
                    resized_image = image
                
                # Créer un prompt pour l'animation
                prompts = {
                    "subtle": "realistic photo, natural movement, subtle animation, high quality, detailed",
                    "moderate": "realistic photo, gentle motion, smooth animation, high quality, detailed",
                    "strong": "realistic photo, dynamic movement, animated, high quality, detailed"
                }
                
                prompt = prompts.get(animation_type, prompts["subtle"])
                negative_prompt = "blurry, distorted, low quality, artifacts, deformed, ugly"
                
                # Générer une version animée
                result = self.pipeline(
                    prompt=prompt,
                    image=resized_image,
                    num_inference_steps=25,
                    guidance_scale=7.5,
                    strength=min(strength, 0.8),  # Limiter la force pour préserver l'original
                    negative_prompt=negative_prompt
                ).images[0]
                
                # Redimensionner au format original
                if result.size != original_size:
                    result = result.resize(original_size, Image.LANCZOS)
                
                # Appliquer un post-traitement pour améliorer la qualité
                result = self._post_process(result, image)
                
                return result
                
            except Exception as e:
                print(f"Erreur lors de l'animation avec diffusers: {e}")
                return self._fallback_animation(image, animation_type, strength)
        else:
            # Mode fallback: applique un effet de mouvement réaliste
            return self._fallback_animation(image, animation_type, strength)
    
    def _fallback_animation(self, image: Image.Image, animation_type: str, strength: float) -> Image.Image:
        """Méthode de fallback utilisant OpenCV et PIL pour créer un effet d'animation réaliste"""
        try:
            # Convertir PIL en numpy
            img_array = np.array(image.convert("RGB"))
            original = img_array.copy()
            
            # Créer un effet de mouvement réaliste
            if animation_type == "subtle":
                # Légère translation avec blur motion subtil
                tx, ty = int(3 * strength), int(2 * strength)
                M = np.float32([[1, 0, tx], [0, 1, ty]])
                moved = cv2.warpAffine(img_array, M, (img_array.shape[1], img_array.shape[0]), 
                                      borderMode=cv2.BORDER_REPLICATE)
                # Légère amélioration de contraste et saturation
                result_array = self._enhance_image(moved, strength * 0.3)
                
            elif animation_type == "moderate":
                # Rotation légère avec translation
                center = (img_array.shape[1] // 2, img_array.shape[0] // 2)
                angle = 0.8 * strength
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(img_array, M, (img_array.shape[1], img_array.shape[0]),
                                        borderMode=cv2.BORDER_REPLICATE)
                # Translation supplémentaire
                tx, ty = int(5 * strength), int(3 * strength)
                M2 = np.float32([[1, 0, tx], [0, 1, ty]])
                moved = cv2.warpAffine(rotated, M2, (img_array.shape[1], img_array.shape[0]),
                                      borderMode=cv2.BORDER_REPLICATE)
                result_array = self._enhance_image(moved, strength * 0.5)
                
            else:  # strong
                # Combinaison de rotation, translation et effets visuels
                center = (img_array.shape[1] // 2, img_array.shape[0] // 2)
                angle = 1.5 * strength
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(img_array, M, (img_array.shape[1], img_array.shape[0]),
                                        borderMode=cv2.BORDER_REPLICATE)
                tx, ty = int(8 * strength), int(5 * strength)
                M2 = np.float32([[1, 0, tx], [0, 1, ty]])
                moved = cv2.warpAffine(rotated, M2, (img_array.shape[1], img_array.shape[0]),
                                      borderMode=cv2.BORDER_REPLICATE)
                result_array = self._enhance_image(moved, strength * 0.7)
            
            # Mélanger avec l'original pour préserver la qualité
            blend_factor = 0.85
            result_array = (blend_factor * result_array + (1 - blend_factor) * original).astype(np.uint8)
            
            # Convertir back en PIL
            result = Image.fromarray(result_array)
            return result
            
        except Exception as e:
            print(f"Erreur dans le fallback: {e}")
            return image
    
    def _enhance_image(self, img_array: np.ndarray, factor: float) -> np.ndarray:
        """Améliore l'image avec contraste et saturation"""
        try:
            # Conversion BGR pour OpenCV
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            # Ajuster la luminosité et le contraste
            alpha = 1.0 + factor * 0.2  # Contraste
            beta = factor * 10  # Luminosité
            enhanced = cv2.convertScaleAbs(img_bgr, alpha=alpha, beta=beta)
            
            # Ajuster la saturation
            hsv = cv2.cvtColor(enhanced, cv2.COLOR_BGR2HSV)
            hsv[:, :, 1] = cv2.multiply(hsv[:, :, 1], 1.0 + factor * 0.3)
            enhanced = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
            
            # Reconvertir en RGB
            return cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        except:
            return img_array
    
    def _post_process(self, result: Image.Image, original: Image.Image) -> Image.Image:
        """Post-traitement pour améliorer la qualité"""
        try:
            # S'assurer que les tailles correspondent
            if result.size != original.size:
                original = original.resize(result.size, Image.LANCZOS)
            
            # Mélanger avec l'original pour préserver les détails
            result_array = np.array(result).astype(np.float32)
            original_array = np.array(original).astype(np.float32)
            
            # Blend 75% résultat, 25% original pour préserver les détails
            blended = (0.75 * result_array + 0.25 * original_array).astype(np.uint8)
            
            # Amélioration légère de la netteté
            result_pil = Image.fromarray(blended)
            enhancer = ImageEnhance.Sharpness(result_pil)
            result_pil = enhancer.enhance(1.1)
            
            return result_pil
        except Exception as e:
            print(f"Erreur dans post_process: {e}")
            return result


# Initialiser l'animateur
animator = PhotoAnimator()


def animate_image(
    image: Optional[Image.Image],
    animation_type: str,
    strength: float,
    num_frames: int
) -> Tuple[Image.Image, str]:
    """
    Fonction principale pour l'interface Gradio
    
    Args:
        image: Image à animer
        animation_type: Type d'animation
        strength: Force de l'animation
        num_frames: Nombre de frames
    
    Returns:
        Tuple (image animée, message de statut)
    """
    if image is None:
        return None, "⚠️ Veuillez télécharger une image"
    
    try:
        # Animer l'image
        animated = animator.animate_photo(
            image=image,
            animation_type=animation_type,
            strength=strength,
            num_frames=num_frames
        )
        
        return animated, "✅ Animation terminée avec succès!"
        
    except Exception as e:
        error_msg = f"❌ Erreur: {str(e)}"
        print(error_msg)
        return None, error_msg


# Interface Gradio
def create_interface():
    """Crée l'interface Gradio"""
    
    with gr.Blocks(title="Animation de Photos Réaliste", theme=gr.themes.Soft()) as demo:
        gr.Markdown(
            """
            # 🎬 Animation de Photos Réaliste
            
            Animez vos photos de façon réaliste en utilisant l'intelligence artificielle.
            Téléchargez une photo et choisissez le type d'animation souhaité.
            
            **Note:** Cette application utilise des modèles d'IA pour créer des animations réalistes.

            ---

            **Messages dans la console du navigateur**

            - **`bootstrap-autofill-overlay.js`** ou **`getElementById` avec une chaîne vide** : en général une **extension**
              (remplissage automatique / gestionnaire de mots de passe), pas cette application. Essayez une fenêtre privée sans extensions.
            - **`Method not implemented`** dans un fichier **`index-….js`** (code interne Gradio) : souvent une API que le navigateur
              n’implémente pas ; l’interface peut fonctionner normalement.

            ---
            """
        )
        
        with gr.Row():
            with gr.Column(scale=1):
                input_image = gr.Image(
                    label="📷 Photo à animer",
                    type="pil",
                    height=400
                )
                
                animation_type = gr.Radio(
                    choices=["subtle", "moderate", "strong"],
                    value="subtle",
                    label="Type d'animation",
                    info="Subtle: mouvement léger | Moderate: mouvement modéré | Strong: mouvement prononcé"
                )
                
                strength = gr.Slider(
                    minimum=0.1,
                    maximum=1.0,
                    value=0.5,
                    step=0.1,
                    label="Force de l'animation",
                    info="Contrôle l'intensité de l'animation"
                )
                
                num_frames = gr.Slider(
                    minimum=4,
                    maximum=16,
                    value=8,
                    step=1,
                    label="Nombre de frames",
                    info="Nombre d'images pour l'animation (pour versions futures)"
                )
                
                animate_btn = gr.Button("✨ Animer la photo", variant="primary", size="lg")
            
            with gr.Column(scale=1):
                output_image = gr.Image(
                    label="🎬 Photo animée",
                    type="pil",
                    height=400
                )
                
                status = gr.Textbox(
                    label="Statut",
                    value="En attente d'une image...",
                    interactive=False
                )
        
        gr.Markdown("### 📸 Chargez une image ci-dessus pour commencer.")
        
        # Événements
        animate_btn.click(
            fn=animate_image,
            inputs=[input_image, animation_type, strength, num_frames],
            outputs=[output_image, status]
        )
        
        def _on_upload(img):
            """Ne pas réinjecter l’image en sortie du même composant (évite effets de bord UI)."""
            return "✅ Image chargée, prêt à animer!" if img is not None else "En attente d'une image..."

        input_image.upload(fn=_on_upload, inputs=[input_image], outputs=[status])
    
    return demo


# Lancer l'application
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Demarrage de l'application d'animation de photos...")
    print("=" * 60)
    try:
        # Cette app locale utilise 7887 pour éviter tout conflit avec Photobooth et MuseTalk.
        server_port = int(os.environ.get("PHOTOBOOTH_PORT", os.environ.get("GRADIO_SERVER_PORT", "7887")))
        server_host = os.environ.get("GRADIO_SERVER_NAME", "0.0.0.0")
        demo = create_interface()
        print("\n[INFO] Interface creee avec succes")
        print("[INFO] Demarrage du serveur Gradio...")
        print(f"[INFO] L'application sera accessible sur: http://localhost:{server_port}")
        print("=" * 60 + "\n")
        demo.launch(
            server_name=server_host,
            server_port=server_port,
            share=False,
            show_error=True
        )
    except Exception as e:
        print(f"\n[ERREUR] Impossible de demarrer l'application: {e}")
        import traceback
        traceback.print_exc()
        input("\nAppuyez sur Entree pour quitter...")
