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

def separate_sources(audio_file, stem="vocals"):
    """
    Sépare les sources audio en utilisant Demucs
    
    Args:
        audio_file: Fichier audio uploadé (tuple avec (sample_rate, audio_data) ou filepath)
        stem: Source à extraire ("vocals", "drums", "bass", "other", ou "all")
    
    Returns:
        Tuple de fichiers audio séparés
    """
    if model is None:
        return None, None, None, None, "❌ Modèle non chargé. Veuillez redémarrer l'application."
    
    if audio_file is None:
        return None, None, None, None, "⚠️ Veuillez uploader un fichier audio."
    
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
        with torch.no_grad():
            # Utiliser apply_model au lieu d'un appel direct
            sources = apply_model(model, wav[None], device=DEVICE, split=True, overlap=0.25, progress=False)
            sources = sources[0]  # Retirer dimension batch
        
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
        
        # Retourner les résultats selon le stem demandé
        if stem == "all":
            return (
                results.get("vocals"),
                results.get("drums"),
                results.get("bass"),
                results.get("other"),
                "✅ Séparation complète terminée!"
            )
        else:
            result_file = results.get(stem)
            if result_file:
                return result_file, None, None, None, f"✅ {stem.capitalize()} extrait avec succès!"
            else:
                return None, None, None, None, f"❌ Erreur lors de l'extraction de {stem}"
        
    except Exception as e:
        error_msg = f"❌ Erreur: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return None, None, None, None, error_msg

# Interface Gradio
with gr.Blocks() as demo:
    
    gr.HTML("""
    <div class="main-header">
        <h1>🎤 Isolation Vocale par IA</h1>
        <p>Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio</p>
        <p style="font-size: 0.9em; opacity: 0.9;">Basé sur Demucs v4 - Modèle HTDemucs</p>
    </div>
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            audio_input = gr.Audio(
                label="📁 Fichier Audio",
                type="filepath",
                sources=["upload", "microphone"],
                format="wav"  # WAV pour meilleure compatibilité
            )
            
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
                label="Statut",
                interactive=False,
                value="⏳ Prêt à traiter un fichier audio"
            )
        
        with gr.Column(scale=1):
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
    
    # Fonction wrapper pour la séparation
    def process_separation(audio_file, stem):
        result = separate_sources(audio_file, stem)
        
        vocals, drums, bass, other, status_msg = result
        
        if stem == "all":
            return (
                vocals,
                drums,
                bass,
                other,
                status_msg,
                gr.update(visible=True),
                gr.update(visible=True),
                gr.update(visible=True),
                gr.update(visible=True),
            )
        else:
            visibility = update_outputs_visibility(stem)
            return (
                vocals if stem == "vocals" else None,
                drums if stem == "drums" else None,
                bass if stem == "bass" else None,
                other if stem == "other" else None,
                status_msg,
                *visibility
            )
    
    # Connecter les événements
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
            vocals_output,
            drums_output,
            bass_output,
            other_output
        ]
    )
    
    # Exemples
    gr.Examples(
        examples=[],
        inputs=audio_input,
        label="Exemples (à venir)"
    )
    
    # Informations
    gr.Markdown("""
    ### ℹ️ Comment ça fonctionne ?
    
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
        file_directories=[str(upload_dir), str(output_dir)],  # Dossiers accessibles via Gradio
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1200px !important;
        }
        .main-header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        """
    )
