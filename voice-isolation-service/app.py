"""
Application Gradio pour l'isolation vocale avec Demucs
Inspirée de https://huggingface.co/spaces/abidlabs/music-separation
"""

import os
import tempfile
import shutil
from pathlib import Path
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

# Configuration
MODEL_NAME = "htdemucs"  # Modèle Demucs v4 (HT = Hybrid Transformer)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Charger le modèle au démarrage
print(f"🔄 Chargement du modèle Demucs ({MODEL_NAME}) sur {DEVICE}...")
try:
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
        <div style="margin-top: 10px; text-align: center;">
            <a href="{audio_url}" download style="display: inline-block; padding: 10px 20px; background: {color}; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                📥 Télécharger cette piste
            </a>
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
                wav, sr = torchaudio.load(audio_file, backend="soundfile")
            except Exception as e:
                # Si échec, utiliser librosa comme fallback
                print(f"⚠️ torchaudio échoué, utilisation de librosa: {e}")
                import librosa
                audio_data, sr = librosa.load(audio_file, sr=None, mono=False)
                if len(audio_data.shape) == 1:
                    audio_data = audio_data.reshape(1, -1)  # Ajouter dimension channel
                wav = torch.from_numpy(audio_data).float()
            
            if wav.shape[0] > 1:
                wav = wav.mean(dim=0, keepdim=True)  # Convertir en mono si stéréo
        
        # Convertir au format attendu par Demucs
        wav = convert_audio(wav, sr, MODEL_SAMPLE_RATE, MODEL_CHANNELS)
        wav = wav.to(DEVICE)
        
        print(f"🔊 Audio chargé: {wav.shape}, sample_rate: {MODEL_SAMPLE_RATE}")
        
        # Séparer les sources
        print("🔄 Séparation des sources en cours...")
        if progress:
            progress(0.3, desc="🔄 Chargement et préparation de l'audio...")
        
        with torch.no_grad():
            # Utiliser apply_model au lieu d'un appel direct
            if progress:
                progress(0.5, desc="🎵 Séparation des sources avec Demucs...")
            sources = apply_model(model, wav[None], device=DEVICE, split=True, overlap=0.25, progress=False)
            sources = sources[0]  # Retirer dimension batch
        
        if progress:
            progress(0.8, desc="💾 Sauvegarde des fichiers séparés...")
        
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
        
        if progress:
            progress(1.0, desc="✅ Traitement terminé!")
        
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
with gr.Blocks() as demo:
    
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
                    visible=True
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
                gr.update(visible=True),  # vocals
                gr.update(visible=True),  # drums
                gr.update(visible=True),  # bass
                gr.update(visible=True),  # other
            )
        else:
            return (
                gr.update(visible=(stem == "vocals")),  # vocals
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
        
        # Créer le HTML de visualisation
        tracks_html = ""
        if stem == "all":
            if vocals:
                tracks_html += create_track_html(vocals, "Voix isolée", "🎤", "#9333ea", waveforms.get('vocals'))
            if drums:
                tracks_html += create_track_html(drums, "Batterie isolée", "🥁", "#ef4444", waveforms.get('drums'))
            if bass:
                tracks_html += create_track_html(bass, "Basse isolée", "🎸", "#3b82f6", waveforms.get('bass'))
            if other:
                tracks_html += create_track_html(other, "Autres instruments", "🎹", "#10b981", waveforms.get('other'))
        else:
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
                vocals,
                drums,
                bass,
                other,
                status_msg,
                file_info,
                gr.update(visible=True),
                gr.update(visible=True),
                gr.update(visible=True),
                gr.update(visible=True),
                gr.update(value=download_files, visible=True) if download_files else gr.update(visible=False),
                gr.HTML(tracks_html) if tracks_html else gr.HTML(""),
            )
        else:
            visibility = update_outputs_visibility(stem)
            return (
                vocals if stem == "vocals" else None,
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
    
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        theme=gr.themes.Soft(),
        css="""
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
    )
