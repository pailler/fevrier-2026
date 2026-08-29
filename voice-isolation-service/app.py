"""
Application Gradio pour l'isolation vocale avec Demucs
Inspirée de https://huggingface.co/spaces/abidlabs/music-separation
"""

import os
import tempfile
import shutil
from pathlib import Path
import mimetypes

# IMPORTANT: Appliquer le patch AVANT l'import de gradio
# Le patch corrige le bug gradio_client TypeError: argument of type 'bool' is not iterable
try:
    import patch_gradio_early  # Ce module applique le patch
except ImportError:
    # Si le module n'existe pas, appliquer le patch directement
    try:
        import gradio_client.utils as client_utils
        _original_get_type = client_utils.get_type
        
        def patched_get_type(schema):
            if isinstance(schema, bool):
                return "boolean"
            return _original_get_type(schema)
        
        client_utils.get_type = patched_get_type
        print("✅ Patch gradio_client appliqué (fallback)")
    except Exception as e:
        print(f"⚠️ Impossible d'appliquer le patch: {e}")

import gradio as gr
import torch
import torchaudio
from demucs.pretrained import get_model
from demucs.audio import convert_audio
from demucs.apply import apply_model
import numpy as np
from pydub import AudioSegment
import soundfile as sf
import matplotlib
matplotlib.use('Agg')  # Backend non-interactif pour éviter les problèmes
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
import base64
from io import BytesIO
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# --- MIME types ---
# Sur certains environnements/proxys, les réponses peuvent retomber sur
# `application/octet-stream`. Avec `X-Content-Type-Options: nosniff`,
# certains navigateurs (notamment Firefox) refusent alors de décoder l'audio.
# On force ici les types courants pour que les fichiers servis (ex: /file=...wav)
# aient un Content-Type correct.
mimetypes.add_type("audio/wav", ".wav")
mimetypes.add_type("audio/x-wav", ".wav")
mimetypes.add_type("audio/flac", ".flac")
mimetypes.add_type("audio/mpeg", ".mp3")
mimetypes.add_type("audio/mp4", ".m4a")
mimetypes.add_type("audio/ogg", ".ogg")

# Configuration
MODEL_NAME = "htdemucs"  # Modèle Demucs v4 (HT = Hybrid Transformer)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# S'assurer que le modèle utilise le cache existant (pas de re-téléchargement)
# Le cache est monte depuis Stability Matrix (Models/IaHome-Services-Cache/torch)
torch_cache_dir = os.environ.get("TORCH_HOME", "/root/.cache/torch")
print(f"📁 Cache PyTorch: {torch_cache_dir}")

# Charger le modèle au démarrage (utilise automatiquement le cache si disponible)
print(f"🔄 Chargement du modèle Demucs ({MODEL_NAME}) depuis le cache sur {DEVICE}...")
try:
    # get_model() utilise automatiquement le cache PyTorch
    # Le modèle existant dans /root/.cache/torch/hub/checkpoints/ sera utilisé
    model = get_model(MODEL_NAME)
    model.to(DEVICE)
    model.eval()
    
    # Obtenir le sample_rate du modèle (gérer BagOfModels et HTDemucs)
    MODEL_SAMPLE_RATE = 44100  # Valeur par défaut pour htdemucs
    MODEL_CHANNELS = 2  # Valeur par défaut (stéréo)
    
    if hasattr(model, 'sample_rate'):
        MODEL_SAMPLE_RATE = model.sample_rate
    elif hasattr(model, 'models') and len(model.models) > 0:
        # Si c'est un BagOfModels, prendre le sample_rate du premier modèle
        if hasattr(model.models[0], 'sample_rate'):
            MODEL_SAMPLE_RATE = model.models[0].sample_rate
    elif hasattr(model, 'sr'):
        # Certains modèles utilisent 'sr' au lieu de 'sample_rate'
        MODEL_SAMPLE_RATE = model.sr
    
    # Obtenir le nombre de canaux audio (pas les canaux internes du modèle)
    # Pour htdemucs, c'est toujours 2 (stéréo)
    if hasattr(model, 'audio_channels'):
        channels = model.audio_channels
        if channels in [1, 2]:  # Mono ou stéréo seulement
            MODEL_CHANNELS = channels
    elif hasattr(model, 'models') and len(model.models) > 0:
        if hasattr(model.models[0], 'audio_channels'):
            channels = model.models[0].audio_channels
            if channels in [1, 2]:
                MODEL_CHANNELS = channels
    # Sinon, utiliser la valeur par défaut de 2 (stéréo)
    
    print(f"✅ Modèle chargé avec succès sur {DEVICE}")
    print(f"   Sample rate: {MODEL_SAMPLE_RATE} Hz, Channels: {MODEL_CHANNELS}")
except Exception as e:
    print(f"❌ Erreur lors du chargement du modèle: {e}")
    model = None
    MODEL_SAMPLE_RATE = 44100
    MODEL_CHANNELS = 2

def get_audio_info(audio_file):
    """
    Récupère les informations sur le fichier audio (durée, format, taille)
    """
    if audio_file is None:
        return "Aucun fichier sélectionné"
    
    try:
        if isinstance(audio_file, tuple):
            sr, audio_data = audio_file
            duration = len(audio_data) / sr if isinstance(audio_data, np.ndarray) else 0
            format_info = "WAV (upload)"
            size_info = f"{len(audio_data) * 4 / 1024 / 1024:.2f} MB" if isinstance(audio_data, np.ndarray) else "N/A"
        else:
            file_path = Path(audio_file)
            size_info = f"{file_path.stat().st_size / 1024 / 1024:.2f} MB"
            format_info = file_path.suffix.upper().replace('.', '') or "WAV"
            
            # Obtenir la durée
            try:
                import librosa
                duration = librosa.get_duration(path=audio_file)
            except:
                try:
                    wav, sr = torchaudio.load(audio_file, backend="soundfile")
                    duration = wav.shape[1] / sr
                except:
                    duration = 0
        
        duration_str = f"{int(duration // 60)}:{int(duration % 60):02d}" if duration > 0 else "N/A"
        return f"📊 Format: {format_info} | Durée: {duration_str} | Taille: {size_info}"
    except Exception as e:
        return f"ℹ️ Informations non disponibles: {str(e)}"

def generate_waveform_image(audio_file_path, title="Waveform", color="#9333ea"):
    """
    Génère une visualisation waveform d'un fichier audio
    """
    if audio_file_path is None or not Path(audio_file_path).exists():
        return None
    
    try:
        # Charger l'audio
        wav, sr = torchaudio.load(audio_file_path, backend="soundfile")
        audio_data = wav.numpy()
        
        # Convertir en mono si stéréo
        if len(audio_data.shape) > 1:
            audio_data = audio_data.mean(axis=0)
        
        # Limiter le nombre d'échantillons pour la visualisation (max 10000 points)
        max_samples = 10000
        if len(audio_data) > max_samples:
            step = len(audio_data) // max_samples
            audio_data = audio_data[::step]
        
        # Créer la figure
        fig = Figure(figsize=(12, 3), facecolor='white')
        ax = fig.add_subplot(111)
        
        # Tracer la waveform
        time_axis = np.linspace(0, len(audio_data) / sr, len(audio_data))
        ax.plot(time_axis, audio_data, color=color, linewidth=0.5, alpha=0.8)
        ax.fill_between(time_axis, audio_data, 0, color=color, alpha=0.3)
        
        # Configuration
        ax.set_xlabel('Temps (s)', fontsize=10)
        ax.set_ylabel('Amplitude', fontsize=10)
        ax.set_title(title, fontsize=12, fontweight='bold')
        ax.grid(True, alpha=0.3, linestyle='--')
        ax.set_xlim(0, len(audio_data) / sr)
        
        # Convertir en base64 pour l'affichage HTML
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()
        plt.close(fig)
        
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        print(f"Erreur lors de la génération de la waveform: {e}")
        return None

def create_track_html(audio_file, title, icon, color, waveform_img=None):
    """
    Crée le HTML pour afficher une piste avec waveform et lecteur audio
    """
    if audio_file is None:
        return f"""
        <div style="padding: 20px; text-align: center; color: #666;">
            <p>{icon} {title} - Aucun fichier disponible</p>
        </div>
        """
    
    # Gradio utilise /file= pour servir les fichiers depuis les dossiers configurés
    # Le chemin doit être relatif au dossier outputs
    audio_path = Path(audio_file)
    if audio_path.is_absolute():
        # Extraire le chemin relatif depuis /app/outputs
        if '/app/outputs' in str(audio_path):
            relative_path = str(audio_path).split('/app/outputs/')[-1]
            audio_url = f"/file=outputs/{relative_path}"
        else:
            # Utiliser le nom du fichier seulement
            audio_url = f"/file=outputs/{audio_path.name}"
    else:
        audio_url = f"/file={audio_file}"
    
    # Obtenir le nom du fichier pour l'attribut download
    filename = audio_path.name if audio_path.name else "audio.wav"
    
    waveform_html = f'<img src="{waveform_img}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />' if waveform_img else ""
    
    return f"""
    <div style="background: linear-gradient(135deg, {color}15, {color}05); border: 2px solid {color}30; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: {color}; margin-top: 0; display: flex; align-items: center; gap: 10px; font-size: 18px;">
            <span style="font-size: 28px;">{icon}</span>
            <span>{title}</span>
        </h3>
        {waveform_html}
        <div style="margin-top: 15px; background: white; padding: 10px; border-radius: 8px;">
            <audio controls style="width: 100%;" preload="metadata">
                <source src="{audio_url}" type="audio/wav">
                Votre navigateur ne supporte pas l'élément audio.
            </audio>
        </div>
    </div>
    """

def separate_sources(audio_file, stem="vocals", progress=None):
    """
    Sépare les sources audio en utilisant Demucs
    
    Args:
        audio_file: Fichier audio uploadé (tuple avec (sample_rate, audio_data) ou filepath)
        stem: Source à extraire ("vocals", "drums", "bass", "other", ou "all")
        progress: Objet de progression Gradio (optionnel)
    
    Returns:
        Tuple de fichiers audio séparés
    """
    if model is None:
        return None, None, None, None, "❌ Modèle non chargé. Veuillez redémarrer l'application.", ""
    
    if audio_file is None:
        return None, None, None, None, "⚠️ Veuillez uploader un fichier audio.", ""
    
    try:
        # Dossier pour stocker les fichiers uploadés
        upload_dir = Path("/app/uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Gérer les différents formats d'entrée Gradio
        if isinstance(audio_file, tuple):
            # Format (sample_rate, audio_data)
            sr, audio_data = audio_file
            # Convertir numpy array en tensor
            if isinstance(audio_data, np.ndarray):
                wav = torch.from_numpy(audio_data).float()
                if len(wav.shape) == 1:
                    wav = wav.unsqueeze(0)  # Ajouter dimension channel
                elif wav.shape[0] > 1:
                    wav = wav.mean(dim=0, keepdim=True)  # Convertir en mono
            else:
                wav = torch.tensor(audio_data).float()
                if len(wav.shape) == 1:
                    wav = wav.unsqueeze(0)
            
            # Sauvegarder le fichier uploadé dans /app/uploads pour traçabilité
            import time
            timestamp = int(time.time())
            uploaded_file_path = upload_dir / f"uploaded_{timestamp}.wav"
            # Convertir le tensor en numpy pour sauvegarder
            audio_np = wav.cpu().numpy()
            if len(audio_np.shape) == 2:
                audio_np = audio_np.T  # Transposer pour soundfile
            elif len(audio_np.shape) == 1:
                audio_np = audio_np.reshape(-1, 1)
            sf.write(str(uploaded_file_path), audio_np, sr)
            print(f"💾 Fichier uploadé sauvegardé: {uploaded_file_path}")
        else:
            # Format filepath
            print(f"🎵 Traitement du fichier: {audio_file}")
            
            # Copier le fichier uploadé dans /app/uploads pour traçabilité
            import time
            timestamp = int(time.time())
            source_file = Path(audio_file)
            file_ext = source_file.suffix or ".wav"
            uploaded_file_path = upload_dir / f"uploaded_{timestamp}{file_ext}"
            
            # Copier le fichier
            shutil.copy2(str(audio_file), str(uploaded_file_path))
            print(f"💾 Fichier uploadé copié: {uploaded_file_path}")
            
            # Vérifier l'extension du fichier
            file_ext = Path(audio_file).suffix.lower()
            formats_supported_by_torchaudio = ['.wav', '.mp3', '.flac', '.ogg', '.m4a', '.aac']
            
            # Si le format n'est pas directement supporté (ex: WMA), convertir avec pydub
            if file_ext not in formats_supported_by_torchaudio:
                print(f"⚠️ Format {file_ext} détecté, conversion en WAV temporaire...")
                try:
                    # Charger avec pydub (supporte plus de formats)
                    audio = AudioSegment.from_file(audio_file)
                    # Créer un fichier temporaire WAV
                    temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
                    audio.export(temp_wav.name, format='wav')
                    audio_file = temp_wav.name
                    print(f"✅ Fichier converti en WAV: {audio_file}")
                except Exception as e:
                    print(f"❌ Erreur lors de la conversion: {e}")
                    return None, None, None, None, f"❌ Format {file_ext} non supporté. Veuillez convertir en MP3, WAV, FLAC, OGG ou M4A."
            
            try:
                # Essayer de charger avec torchaudio (sans torchcodec)
                # Pour les gros fichiers, torchaudio est plus efficace en mémoire
                print(f"📂 Chargement du fichier avec torchaudio...")
                
                # Obtenir la taille du fichier pour estimer la mémoire nécessaire
                file_size_bytes = Path(audio_file).stat().st_size
                file_size_mb = file_size_bytes / (1024 * 1024)
                print(f"📊 Taille du fichier: {file_size_mb:.2f} MB")
                
                # Charger le fichier
                wav, sr = torchaudio.load(audio_file, backend="soundfile")
                print(f"✅ Fichier chargé: {wav.shape}, sample_rate: {sr} Hz")
                
                # Libérer la mémoire immédiatement après chargement si possible
                import gc
                gc.collect()
            except Exception as e:
                # Si échec, utiliser librosa comme fallback
                print(f"⚠️ torchaudio échoué, utilisation de librosa: {e}")
                import librosa
                # Pour les gros fichiers, charger avec offset et duration si nécessaire
                # Mais d'abord essayer le chargement normal
                try:
                    audio_data, sr = librosa.load(audio_file, sr=None, mono=False)
                    print(f"✅ Fichier chargé avec librosa: {audio_data.shape}, sample_rate: {sr} Hz")
                except MemoryError:
                    print(f"⚠️ Mémoire insuffisante pour charger le fichier complet. Tentative de traitement par chunks...")
                    # Pour les très gros fichiers, on pourrait implémenter un traitement par chunks
                    # Pour l'instant, on retourne une erreur explicite
                    return None, None, None, None, f"❌ Fichier trop volumineux pour être traité en une fois. Veuillez diviser le fichier en segments plus petits (< 50 MB).", ""
                if len(audio_data.shape) == 1:
                    audio_data = audio_data.reshape(1, -1)  # Ajouter dimension channel
                wav = torch.from_numpy(audio_data).float()
            
            # Vérifier la taille du fichier en mémoire
            file_size_mb = wav.numel() * wav.element_size() / (1024 * 1024)
            duration_seconds = wav.shape[-1] / sr if len(wav.shape) > 1 else 0
            print(f"📊 Taille du fichier en mémoire: {file_size_mb:.2f} MB")
            print(f"⏱️ Durée estimée: {duration_seconds:.2f} secondes ({duration_seconds/60:.2f} minutes)")
            
            # Avertissement pour les très gros fichiers
            if file_size_mb > 200:
                print(f"⚠️ Fichier volumineux détecté ({file_size_mb:.1f} MB). Le traitement peut prendre du temps et nécessiter beaucoup de mémoire.")
            
            if file_size_mb > 1000:  # 1 GB en mémoire
                return None, None, None, None, f"❌ Fichier trop volumineux en mémoire ({file_size_mb:.1f} MB). Limite: 1000 MB. Veuillez utiliser un fichier plus petit ou diviser en segments.", ""
            
            if wav.shape[0] > 1:
                wav = wav.mean(dim=0, keepdim=True)  # Convertir en mono si stéréo
        
        # Convertir au format attendu par Demucs
        print(f"🔄 Conversion audio au format Demucs (SR: {MODEL_SAMPLE_RATE} Hz, Channels: {MODEL_CHANNELS})...")
        
        # Sauvegarder l'ancien tensor pour libérer la mémoire après conversion
        original_wav = wav
        wav = convert_audio(wav, sr, MODEL_SAMPLE_RATE, MODEL_CHANNELS)
        
        # Libérer la mémoire de l'original
        del original_wav
        import gc
        gc.collect()
        
        # Calculer la durée en secondes pour estimer la complexité
        duration_seconds = wav.shape[-1] / MODEL_SAMPLE_RATE
        print(f"⏱️ Durée du fichier: {duration_seconds:.2f} secondes ({duration_seconds/60:.2f} minutes)")
        
        # Déterminer la taille de segment optimale pour les gros fichiers
        # Pour les fichiers > 10 minutes, utiliser des segments plus petits pour économiser la mémoire
        # Demucs utilise automatiquement des segments avec split=True, mais on peut optimiser
        segment_size = None  # Utiliser la valeur par défaut de Demucs (généralement ~11 secondes)
        
        if duration_seconds > 600:  # > 10 minutes
            print(f"📦 Fichier long détecté ({duration_seconds/60:.1f} min), Demucs utilisera des segments automatiques")
        elif duration_seconds > 300:  # > 5 minutes
            print(f"📦 Fichier moyen détecté ({duration_seconds/60:.1f} min)")
        
        # Libérer la mémoire du CPU avant de transférer sur GPU
        if DEVICE == "cuda":
            print(f"🚀 Transfert vers GPU...")
            wav = wav.to(DEVICE)
            # Nettoyer le cache CPU
            import gc
            gc.collect()
        else:
            wav = wav.to(DEVICE)
        
        print(f"🔊 Audio prêt pour traitement: {wav.shape}, device: {DEVICE}")
        
        # Séparer les sources
        print("🔄 Séparation des sources en cours...")
        try:
            if progress is not None:
                progress(0.3, desc="🔄 Chargement et préparation de l'audio...")
        except:
            pass  # Ignorer les erreurs de progress
        
        try:
            with torch.no_grad():
                # Utiliser apply_model avec split=True pour traiter par chunks
                # overlap=0.25 pour éviter les artefacts aux frontières
                try:
                    if progress is not None:
                        progress(0.5, desc="🎵 Séparation des sources avec Demucs (cela peut prendre du temps pour les gros fichiers)...")
                except:
                    pass  # Ignorer les erreurs de progress
                
                # Demucs gère automatiquement le découpage avec split=True
                # Il utilise des segments d'environ 11 secondes par défaut pour économiser la mémoire
                # overlap=0.25 (25%) évite les artefacts aux frontières entre segments
                print(f"🎵 Démarrage de la séparation avec Demucs (split=True pour traitement par chunks)...")
                
                sources = apply_model(
                    model, 
                    wav[None], 
                    device=DEVICE, 
                    split=True,  # Traitement par chunks automatique
                    overlap=0.25,  # 25% de chevauchement entre chunks
                    progress=False
                )
                
                print(f"✅ Séparation terminée")
                
                sources = sources[0]  # Retirer dimension batch
                
                # Libérer la mémoire GPU immédiatement après traitement
                if DEVICE == "cuda":
                    torch.cuda.empty_cache()
                    print("🧹 Cache GPU nettoyé")
                
        except RuntimeError as e:
            error_msg = str(e)
            if "out of memory" in error_msg.lower() or "cuda" in error_msg.lower():
                print(f"❌ Erreur mémoire GPU: {e}")
                return None, None, None, None, f"❌ Mémoire GPU insuffisante pour traiter ce fichier ({duration_seconds/60:.1f} min). Essayez un fichier plus court ou utilisez CPU.", ""
            else:
                print(f"❌ Erreur lors de la séparation: {e}")
                import traceback
                traceback.print_exc()
                return None, None, None, None, f"❌ Erreur lors de la séparation: {str(e)}", ""
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
            import traceback
            traceback.print_exc()
            return None, None, None, None, f"❌ Erreur lors du traitement: {str(e)}", ""
        
        try:
            if progress is not None:
                progress(0.8, desc="💾 Sauvegarde des fichiers séparés...")
        except:
            pass  # Ignorer les erreurs de progress
        
        # Les sources sont dans l'ordre: [drums, bass, other, vocals]
        drums, bass, other, vocals = sources
        
        # Utiliser le dossier outputs configuré dans Docker
        output_dir = Path("/app/outputs")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Créer un sous-dossier avec timestamp pour cette séparation
        import time
        timestamp = int(time.time())
        session_dir = output_dir / f"session_{timestamp}"
        session_dir.mkdir(parents=True, exist_ok=True)
        
        results = {}
        
        # Fonction helper pour sauvegarder avec soundfile (évite TorchCodec)
        def save_audio_safe(path, audio_tensor, sample_rate):
            """Sauvegarde un tensor audio en WAV en utilisant soundfile directement"""
            # Convertir en numpy array et transposer si nécessaire
            audio_np = audio_tensor.cpu().numpy()
            if len(audio_np.shape) == 3:
                audio_np = audio_np[0]  # Retirer dimension batch
            if len(audio_np.shape) == 2:
                # Transposer de (channels, samples) à (samples, channels)
                audio_np = audio_np.T
            elif len(audio_np.shape) == 1:
                # Mono: ajouter dimension channel
                audio_np = audio_np.reshape(-1, 1)
            sf.write(str(path), audio_np, sample_rate)
        
        if stem == "all" or stem == "vocals":
            vocals_path = session_dir / "vocals.wav"
            save_audio_safe(vocals_path, vocals, MODEL_SAMPLE_RATE)
            results["vocals"] = str(vocals_path)
        
        if stem == "all" or stem == "drums":
            drums_path = session_dir / "drums.wav"
            save_audio_safe(drums_path, drums, MODEL_SAMPLE_RATE)
            results["drums"] = str(drums_path)
        
        if stem == "all" or stem == "bass":
            bass_path = session_dir / "bass.wav"
            save_audio_safe(bass_path, bass, MODEL_SAMPLE_RATE)
            results["bass"] = str(bass_path)
        
        if stem == "all" or stem == "other":
            other_path = session_dir / "other.wav"
            save_audio_safe(other_path, other, MODEL_SAMPLE_RATE)
            results["other"] = str(other_path)
        
        # Obtenir les informations du fichier
        file_info = get_audio_info(audio_file)
        
        try:
            if progress is not None:
                progress(1.0, desc="✅ Traitement terminé!")
        except:
            pass  # Ignorer les erreurs de progress
        
        # Retourner les résultats selon le stem demandé
        if stem == "all":
            return (
                results.get("vocals"),
                results.get("drums"),
                results.get("bass"),
                results.get("other"),
                "✅ Séparation complète terminée! Tous les fichiers sont prêts au téléchargement.",
                file_info
            )
        else:
            result_file = results.get(stem)
            if result_file:
                return result_file, None, None, None, f"✅ {stem.capitalize()} extrait avec succès!", file_info
            else:
                return None, None, None, None, f"❌ Erreur lors de l'extraction de {stem}", file_info
        
    except Exception as e:
        error_msg = f"❌ Erreur: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        file_info = get_audio_info(audio_file) if audio_file else ""
        return None, None, None, None, error_msg, file_info

# Interface Gradio
# CSS personnalisé pour le style de l'application
custom_css = """
.gradio-container {
    max-width: 1400px !important;
}
.main-header {
    text-align: center;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.main-header h1 {
    margin: 0 0 10px 0;
    font-size: 2.5em;
}
.main-header p {
    margin: 5px 0;
}
"""

with gr.Blocks(theme=gr.themes.Soft(), css=custom_css) as demo:
    
    gr.HTML("""
    <div class="main-header">
        <h1>🎤 Isolation Vocale par IA</h1>
        <p>Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio</p>
        <p style="font-size: 0.9em; opacity: 0.9;">Basé sur Demucs v4 - Modèle HTDemucs | Qualité professionnelle</p>
    </div>
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 📤 Upload et Configuration")
            
            audio_input = gr.Audio(
                label="📁 Fichier Audio",
                type="filepath",
                sources=["upload", "microphone"],
                format="wav",
                show_label=True
            )
            
            # Informations sur le fichier
            file_info_display = gr.Textbox(
                label="ℹ️ Informations du fichier",
                interactive=False,
                value="Aucun fichier sélectionné",
                visible=True
            )
            
            # Prévisualisation de l'original
            original_preview = gr.Audio(
                label="🎵 Prévisualisation (Original)",
                type="filepath",
                visible=True,
                interactive=False
            )
            
            gr.Markdown("### ⚙️ Options de séparation")
            
            stem_choice = gr.Radio(
                choices=[
                    ("🎤 Voix uniquement", "vocals"),
                    ("🥁 Batterie uniquement", "drums"),
                    ("🎸 Basse uniquement", "bass"),
                    ("🎹 Autres instruments", "other"),
                    ("🎵 Toutes les sources", "all")
                ],
                value="vocals",
                label="Source à extraire",
                info="Choisissez quelle source vous souhaitez isoler"
            )
            
            separate_btn = gr.Button(
                "🎯 Séparer les sources",
                variant="primary",
                size="lg"
            )
            
            status = gr.Textbox(
                label="📊 Statut",
                interactive=False,
                value="⏳ Prêt à traiter un fichier audio"
            )
        
        with gr.Column(scale=1):
            gr.Markdown("### 🎧 Résultats de la séparation")
            
            # Visualisation des pistes avec waveforms et lecteurs audio
            tracks_visualization = gr.HTML(
                value="<div style='padding: 20px; text-align: center; color: #666;'><p>Les pistes traitées apparaîtront ici avec leurs visualisations</p></div>",
                label="📊 Visualisation des pistes",
                visible=True
            )
            
            if True:  # Pour permettre plusieurs outputs conditionnels
                vocals_output = gr.Audio(
                    label="🎤 Voix isolée",
                    type="filepath",
                    visible=False  # Toujours invisible - la carte HTML "Voix isolée" n'est pas affichée
                )
                drums_output = gr.Audio(
                    label="🥁 Batterie isolée",
                    type="filepath",
                    visible=False
                )
                bass_output = gr.Audio(
                    label="🎸 Basse isolée",
                    type="filepath",
                    visible=False
                )
                other_output = gr.Audio(
                    label="🎹 Autres instruments isolés",
                    type="filepath",
                    visible=False
                )
            
            # Bouton de téléchargement en lot (visible seulement si "all")
            download_all_btn = gr.File(
                label="📦 Télécharger toutes les sources",
                visible=False,
                file_count="multiple"
            )
    
    # Fonction pour gérer la visibilité des outputs
    def update_outputs_visibility(stem):
        if stem == "all":
            return (
                gr.update(visible=False),  # vocals - toujours invisible
                gr.update(visible=True),  # drums
                gr.update(visible=True),  # bass
                gr.update(visible=True),  # other
            )
        else:
            return (
                gr.update(visible=(stem == "vocals")),  # vocals - visible seulement si stem == "vocals"
                gr.update(visible=(stem == "drums")),  # drums
                gr.update(visible=(stem == "bass")),  # bass
                gr.update(visible=(stem == "other")),  # other
            )
    
    # Fonction pour mettre à jour les informations du fichier
    def update_file_info(audio_file):
        info = get_audio_info(audio_file)
        return info, audio_file if audio_file else None
    
    # Fonction wrapper pour la séparation avec visualisation
    def process_separation(audio_file, stem, progress=gr.Progress()):
        # Gradio injecte automatiquement l'objet progress
        result = separate_sources(audio_file, stem, progress)
        
        vocals, drums, bass, other, status_msg, file_info = result
        
        # Générer les waveforms pour chaque piste
        waveforms = {}
        if vocals:
            waveforms['vocals'] = generate_waveform_image(vocals, "🎤 Voix isolée", "#9333ea")
        if drums:
            waveforms['drums'] = generate_waveform_image(drums, "🥁 Batterie isolée", "#ef4444")
        if bass:
            waveforms['bass'] = generate_waveform_image(bass, "🎸 Basse isolée", "#3b82f6")
        if other:
            waveforms['other'] = generate_waveform_image(other, "🎹 Autres instruments", "#10b981")
        
        # Créer le HTML de visualisation (waveforms uniquement, pas de boutons colorés)
        # Les boutons de téléchargement natifs des composants Gradio Audio sont utilisés à la place
        tracks_html = ""
        if stem == "all":
            # Pour "all", on affiche les waveforms pour toutes les pistes SAUF vocals
            if drums:
                tracks_html += create_track_html(drums, "Batterie isolée", "🥁", "#ef4444", waveforms.get('drums'))
            if bass:
                tracks_html += create_track_html(bass, "Basse isolée", "🎸", "#3b82f6", waveforms.get('bass'))
            if other:
                tracks_html += create_track_html(other, "Autres instruments", "🎹", "#10b981", waveforms.get('other'))
        else:
            # Pour chaque stem individuel, générer la carte HTML avec waveform (sans bouton coloré)
            # Le bouton de téléchargement natif du composant Gradio Audio sera utilisé
            if stem == "vocals" and vocals:
                tracks_html = create_track_html(vocals, "Voix isolée", "🎤", "#9333ea", waveforms.get('vocals'))
            elif stem == "drums" and drums:
                tracks_html = create_track_html(drums, "Batterie isolée", "🥁", "#ef4444", waveforms.get('drums'))
            elif stem == "bass" and bass:
                tracks_html = create_track_html(bass, "Basse isolée", "🎸", "#3b82f6", waveforms.get('bass'))
            elif stem == "other" and other:
                tracks_html = create_track_html(other, "Autres instruments", "🎹", "#10b981", waveforms.get('other'))
        
        # Préparer les fichiers pour le téléchargement en lot
        download_files = []
        if stem == "all":
            if vocals: download_files.append(vocals)
            if drums: download_files.append(drums)
            if bass: download_files.append(bass)
            if other: download_files.append(other)
        
        if stem == "all":
            return (
                None,  # vocals - jamais retourné pour éviter l'affichage du composant
                drums,
                bass,
                other,
                status_msg,
                file_info,
                gr.update(visible=False),  # vocals - toujours invisible (carte HTML supprimée)
                gr.update(visible=True),  # drums
                gr.update(visible=True),  # bass
                gr.update(visible=True),  # other
                gr.update(value=download_files, visible=True) if download_files else gr.update(visible=False),
                gr.HTML(tracks_html) if tracks_html else gr.HTML(""),
            )
        else:
            visibility = update_outputs_visibility(stem)
            return (
                vocals if stem == "vocals" else None,  # vocals - retourné si stem == "vocals" pour le bouton natif
                drums if stem == "drums" else None,
                bass if stem == "bass" else None,
                other if stem == "other" else None,
                status_msg,
                file_info,
                *visibility,
                gr.update(visible=False),
                gr.HTML(tracks_html) if tracks_html else gr.HTML(""),
            )
    
    # Connecter les événements
    # Mettre à jour les informations du fichier quand un fichier est uploadé
    audio_input.change(
        fn=update_file_info,
        inputs=[audio_input],
        outputs=[file_info_display, original_preview]
    )
    
    stem_choice.change(
        fn=update_outputs_visibility,
        inputs=[stem_choice],
        outputs=[vocals_output, drums_output, bass_output, other_output]
    )
    
    separate_btn.click(
        fn=process_separation,
        inputs=[audio_input, stem_choice],
        outputs=[
            vocals_output,
            drums_output,
            bass_output,
            other_output,
            status,
            file_info_display,
            vocals_output,
            drums_output,
            bass_output,
            other_output,
            download_all_btn,
            tracks_visualization
        ]
    )
    
    # Exemples
    gr.Examples(
        examples=[],
        inputs=audio_input,
        label="Exemples (à venir)"
    )
    
    # Informations et aide
    with gr.Accordion("ℹ️ Comment ça fonctionne ?", open=False):
        gr.Markdown("""
        Cette application utilise **Demucs v4** (Hybrid Transformer), un modèle d'IA de pointe pour la séparation de sources audio.
        
        **Fonctionnalités :**
        - 🎤 **Isolation vocale** : Extrait uniquement la voix d'un enregistrement
        - 🥁 **Isolation de batterie** : Sépare la batterie du reste
        - 🎸 **Isolation de basse** : Extrait la ligne de basse
        - 🎹 **Autres instruments** : Isole les autres instruments (guitares, synthés, etc.)
        - 🎵 **Séparation complète** : Extrait toutes les sources en une fois
        
        **Formats supportés :** MP3, WAV, M4A, OGG, FLAC, WMA (converti automatiquement)
        
        **Note :** 
        - Le traitement peut prendre quelques minutes selon la longueur du fichier audio
        - Les formats non supportés par les navigateurs (comme WMA) sont automatiquement convertis
        - Les fichiers de sortie sont toujours en format WAV pour une compatibilité maximale
        - Vous pouvez prévisualiser l'original avant de traiter
        - Utilisez "Toutes les sources" pour obtenir tous les stems en une fois
        """)
    
    with gr.Accordion("💡 Conseils d'utilisation", open=False):
        gr.Markdown("""
        **Pour de meilleurs résultats :**
        1. 📤 Uploadez un fichier audio de bonne qualité (WAV ou FLAC recommandé)
        2. 🎵 Prévisualisez l'original pour vérifier la qualité
        3. 🎯 Choisissez la source à extraire ou sélectionnez "Toutes les sources"
        4. ⏳ Attendez la fin du traitement (barre de progression affichée)
        5. 🎧 Écoutez les résultats et téléchargez ce dont vous avez besoin
        
        **Comparaison avec d'autres outils :**
        - **Demucs v4** offre une meilleure qualité que Spleeter
        - **HTDemucs** est optimisé pour la séparation vocale
        - Les résultats sont de qualité professionnelle, prêts pour le mixage
        """)

# Lancer l'application
if __name__ == "__main__":
    # Configurer les dossiers pour Gradio
    upload_dir = Path("/app/uploads")
    output_dir = Path("/app/outputs")
    upload_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Démarrer Gradio
    # Note: L'endpoint /gradio_api/upload_progress peut retourner 404 dans certaines versions
    # mais cela n'empêche pas le fonctionnement de l'application
    # Pour Gradio 4.44.0, utiliser la syntaxe correcte
    # Le CSS doit être défini dans gr.Blocks() avec le paramètre css, pas dans launch()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        max_file_size=500 * 1024 * 1024,  # Limite de 500 MB (524288000 bytes) pour les uploads
        max_threads=40  # Augmenter le nombre de threads pour gérer les gros fichiers
    )
