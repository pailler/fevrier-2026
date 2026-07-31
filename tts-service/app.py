"""
Service TTS iahome — synthèse vocale XTTS v2 (Coqui).
Interface Gradio inspirée de texttovoicepro.com.
"""

from __future__ import annotations

import os
import tempfile
import threading
from pathlib import Path

os.environ.setdefault("GRADIO_SERVER_NAME", "0.0.0.0")
os.environ.setdefault("GRADIO_SERVER_PORT", "7860")
os.environ.setdefault("GRADIO_ANALYTICS_ENABLED", "False")

try:
    import patch_gradio_early  # noqa: F401
except ImportError:
    pass

import gradio as gr
import librosa
import numpy as np
import soundfile as sf
import torch
from pydub import AudioSegment
from TTS.api import TTS

MODEL_NAME = "tts_models/multilingual/multi-dataset/xtts_v2"
MAX_CHARS = 1500
OUTPUT_SAMPLE_RATE = 44100
XTTS_SAMPLE_RATE = 24000

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

LANGUAGES = {
    "fr": "Français",
    "en": "English",
    "es": "Español",
    "de": "Deutsch",
    "it": "Italiano",
    "pt": "Português",
    "pl": "Polski",
    "tr": "Türkçe",
    "ru": "Русский",
    "nl": "Nederlands",
    "cs": "Čeština",
    "ar": "العربية",
    "zh-cn": "中文",
    "ja": "日本語",
    "hu": "Magyar",
    "ko": "한국어",
    "hi": "हिन्दी",
}

LANGUAGE_FLAGS = {
    "fr": "🇫🇷",
    "en": "🇺🇸",
    "es": "🇪🇸",
    "de": "🇩🇪",
    "it": "🇮🇹",
    "pt": "🇵🇹",
    "pl": "🇵🇱",
    "tr": "🇹🇷",
    "ru": "🇷🇺",
    "nl": "🇳🇱",
    "cs": "🇨🇿",
    "ar": "🇸🇦",
    "zh-cn": "🇨🇳",
    "ja": "🇯🇵",
    "hu": "🇭🇺",
    "ko": "🇰🇷",
    "hi": "🇮🇳",
}

SAMPLE_TEXTS = {
    "fr": "Bonjour ! Bienvenue sur iahome TTS. Ceci est un exemple de synthèse vocale avec XTTS v2.",
    "en": "Hello! Welcome to iahome TTS. This is a sample of our text-to-speech technology.",
    "es": "¡Hola! Bienvenido a iahome TTS. Este es un ejemplo de síntesis de voz.",
    "de": "Hallo! Willkommen bei iahome TTS. Dies ist ein Beispiel für Sprachsynthese.",
}

SPEAKER_HINTS: dict[str, dict[str, str]] = {
    "Ana Florence": {"gender": "Féminin", "region": "Multilingue"},
    "Antoni": {"gender": "Masculin", "region": "Multilingue"},
    "Arnold": {"gender": "Masculin", "region": "Multilingue"},
    "Bella": {"gender": "Féminin", "region": "Multilingue"},
    "Claribel Dervla": {"gender": "Féminin", "region": "Multilingue"},
    "Craig Gutsy": {"gender": "Masculin", "region": "Multilingue"},
    "Daisy Studious": {"gender": "Féminin", "region": "Multilingue"},
    "Damien Black": {"gender": "Masculin", "region": "Multilingue"},
    "Denise Atkins": {"gender": "Féminin", "region": "Multilingue"},
    "Eliza Smith": {"gender": "Féminin", "region": "Multilingue"},
    "Emily Anderson": {"gender": "Féminin", "region": "Multilingue"},
    "Emma": {"gender": "Féminin", "region": "Multilingue"},
    "Eugenio Belletti": {"gender": "Masculin", "region": "Multilingue"},
    "Gitta Nikolina": {"gender": "Féminin", "region": "Multilingue"},
    "Gracie Wise": {"gender": "Féminin", "region": "Multilingue"},
    "Henriette Usha": {"gender": "Féminin", "region": "Multilingue"},
    "James": {"gender": "Masculin", "region": "Multilingue"},
    "Jamal": {"gender": "Masculin", "region": "Multilingue"},
    "Josh": {"gender": "Masculin", "region": "Multilingue"},
    "Li": {"gender": "Neutre", "region": "Multilingue"},
    "Liam": {"gender": "Masculin", "region": "Multilingue"},
    "Mario": {"gender": "Masculin", "region": "Multilingue"},
    "Michael": {"gender": "Masculin", "region": "Multilingue"},
    "Onur": {"gender": "Masculin", "region": "Multilingue"},
    "Patricia": {"gender": "Féminin", "region": "Multilingue"},
    "Rosalind": {"gender": "Féminin", "region": "Multilingue"},
    "Sarah": {"gender": "Féminin", "region": "Multilingue"},
    "Tamara": {"gender": "Féminin", "region": "Multilingue"},
    "Tanja": {"gender": "Féminin", "region": "Multilingue"},
    "Thomas": {"gender": "Masculin", "region": "Multilingue"},
    "Viktor": {"gender": "Masculin", "region": "Multilingue"},
    "William": {"gender": "Masculin", "region": "Multilingue"},
}

tts_model: TTS | None = None
model_lock = threading.Lock()
model_status = "Chargement du modèle XTTS v2 en cours…"


def format_speaker_label(name: str) -> str:
    hints = SPEAKER_HINTS.get(name, {"gender": "Voix", "region": "Multilingue"})
    return f"{name} • {hints['gender']} • {hints['region']}"


def load_model() -> None:
    global tts_model, model_status
    try:
        print(f"Chargement XTTS v2 sur {DEVICE}…")
        model_status = f"Chargement XTTS v2 ({DEVICE})…"
        tts_model = TTS(MODEL_NAME).to(DEVICE)
        speakers = tts_model.speakers or []
        model_status = f"Modèle prêt — {len(speakers)} voix disponibles ({DEVICE})"
        print(model_status)
    except Exception as exc:
        model_status = f"Erreur de chargement: {exc}"
        print(model_status)
        raise


def get_speaker_choices() -> list[str]:
    if tts_model is None or not tts_model.speakers:
        return ["Ana Florence"]
    return list(tts_model.speakers)


def count_chars(text: str) -> str:
    return f"{len(text or '')}/{MAX_CHARS}"


def validate_text(text: str) -> tuple[str | None, str]:
    cleaned = (text or "").strip()
    if not cleaned:
        return None, "Veuillez saisir du texte."
    if len(cleaned) > MAX_CHARS:
        return None, f"Texte trop long ({len(cleaned)}/{MAX_CHARS} caractères)."
    return cleaned, ""


def post_process_audio(
    audio: np.ndarray,
    sample_rate: int,
    speed: float,
    pitch: float,
) -> tuple[np.ndarray, int]:
    if audio.ndim > 1:
        audio = np.mean(audio, axis=0)

    audio = audio.astype(np.float32)
    if speed != 1.0:
        audio = librosa.effects.time_stretch(audio, rate=float(speed))
    if pitch != 1.0:
        n_steps = 12.0 * np.log2(float(pitch))
        audio = librosa.effects.pitch_shift(audio, sr=sample_rate, n_steps=n_steps)

    if sample_rate != OUTPUT_SAMPLE_RATE:
        audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=OUTPUT_SAMPLE_RATE)
        sample_rate = OUTPUT_SAMPLE_RATE

    peak = np.max(np.abs(audio)) if audio.size else 0.0
    if peak > 0:
        audio = audio / peak * 0.95

    return audio, sample_rate


OUTPUT_DIR = Path(
    os.environ.get(
        "TTS_OUTPUT_DIR",
        "/app/outputs" if Path("/app").exists() else str(Path(__file__).parent / "outputs"),
    )
)


def save_outputs(audio: np.ndarray, sample_rate: int) -> tuple[str, str]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_dir = OUTPUT_DIR

    wav_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=output_dir).name
    sf.write(wav_path, audio, sample_rate, subtype="PCM_16")

    mp3_path = wav_path.replace(".wav", ".mp3")
    segment = AudioSegment.from_wav(wav_path)
    segment.export(mp3_path, format="mp3", bitrate="192k")

    return wav_path, mp3_path


def synthesize_speech(
    text: str,
    language: str,
    speaker: str,
    speed: float,
    pitch: float,
    reference_audio: str | None,
) -> tuple[tuple[int, np.ndarray] | None, str | None, str | None, str]:
    if tts_model is None:
        return None, None, None, model_status

    cleaned, error = validate_text(text)
    if error:
        return None, None, None, error

    speaker_name = speaker.split(" • ")[0].strip() if speaker else get_speaker_choices()[0]

    try:
        with model_lock:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name

            if reference_audio:
                tts_model.tts_to_file(
                    text=cleaned,
                    speaker_wav=reference_audio,
                    language=language,
                    file_path=tmp_path,
                )
            else:
                tts_model.tts_to_file(
                    text=cleaned,
                    speaker=speaker_name,
                    language=language,
                    file_path=tmp_path,
                )

            audio, sr = librosa.load(tmp_path, sr=XTTS_SAMPLE_RATE, mono=True)
            os.unlink(tmp_path)

        processed, out_sr = post_process_audio(audio, sr, speed, pitch)
        wav_path, mp3_path = save_outputs(processed, out_sr)

        return (out_sr, processed), wav_path, mp3_path, "Synthèse terminée."
    except Exception as exc:
        return None, None, None, f"Erreur de synthèse: {exc}"


def preview_voice(language: str, speaker: str, reference_audio: str | None):
    sample = SAMPLE_TEXTS.get(language, SAMPLE_TEXTS["en"])
    return synthesize_speech(sample, language, speaker, 1.0, 1.0, reference_audio)


LANGUAGE_CHOICES = [
    f"{LANGUAGE_FLAGS.get(code, '🌐')} {label}" for code, label in LANGUAGES.items()
]
LANGUAGE_FROM_LABEL = {
    f"{LANGUAGE_FLAGS.get(code, '🌐')} {label}": code for code, label in LANGUAGES.items()
}


def parse_language(label: str) -> str:
    return LANGUAGE_FROM_LABEL.get(label, "fr")


def on_language_change(language_label: str):
    language = parse_language(language_label)
    sample = SAMPLE_TEXTS.get(language, "")
    return sample, count_chars(sample)


def run_synthesis(text, language_label, speaker, speed, pitch, reference_audio):
    return synthesize_speech(
        text,
        parse_language(language_label),
        speaker,
        speed,
        pitch,
        reference_audio,
    )


def run_preview(language_label, speaker, reference_audio):
    language = parse_language(language_label)
    return preview_voice(language, speaker, reference_audio)


CSS_PATH = Path(__file__).parent / "static" / "iahome.css"
CUSTOM_CSS = CSS_PATH.read_text(encoding="utf-8") if CSS_PATH.exists() else ""

IAHOME_HEADER_HTML = """
<div class="iahome-topbar">
  <div class="iahome-topbar-inner">
    <a href="https://iahome.fr" target="_blank" rel="noopener" class="iahome-logo">
      IA<span>Home</span>
    </a>
    <div class="iahome-nav">
      <a href="https://iahome.fr/applications" target="_blank" rel="noopener">Applications</a>
      <a href="https://iahome.fr/essentiels" target="_blank" rel="noopener">Essentiels</a>
      <span class="iahome-badge">🎤 Text-to-Speech · XTTS v2</span>
    </div>
  </div>
</div>
"""

IAHOME_HERO_HTML = """
<div class="iahome-hero">
  <span class="iahome-hero-dot"></span>
  <span class="iahome-hero-dot"></span>
  <span class="iahome-hero-dot"></span>
  <span class="iahome-hero-dot"></span>
  <div class="iahome-hero-content">
    <div class="iahome-hero-icon">🎤</div>
    <h1>Convertisseur texte-vers-parole</h1>
    <p>
      Transformez votre texte en voix naturelle avec la puissance de Coqui XTTS v2.
      Multilingue, clonage vocal et export haute qualité — sans installation.
    </p>
    <div class="iahome-hero-tags">
      <span class="iahome-hero-tag">58 voix IA</span>
      <span class="iahome-hero-tag">17 langues</span>
      <span class="iahome-hero-tag">WAV 44,1 kHz</span>
      <span class="iahome-hero-tag">Export MP3</span>
    </div>
  </div>
</div>
"""

IAHOME_FOOTER_HTML = """
<div class="iahome-footer">
  <div class="iahome-footer-inner">
    <strong>IAHome</strong> — plateforme de services IA en ligne
    <p>
      Propulsé par <a href="https://github.com/coqui-ai/TTS" target="_blank" rel="noopener">Coqui XTTS v2</a>
      · <a href="https://iahome.fr" target="_blank" rel="noopener">Retour à iahome.fr</a>
    </p>
  </div>
</div>
"""


def create_demo() -> gr.Blocks:
    speaker_choices = [format_speaker_label(name) for name in get_speaker_choices()]

    with gr.Blocks(
        title="IAHome TTS — Synthèse vocale XTTS v2",
        css=CUSTOM_CSS,
    ) as demo:
        gr.HTML(IAHOME_HEADER_HTML)
        gr.HTML(IAHOME_HERO_HTML)

        with gr.Column(elem_classes=["iahome-status-wrap"]):
            gr.Textbox(label="État du service", value=model_status, interactive=False)

        with gr.Row():
            with gr.Column(scale=2, elem_classes=["iahome-card"]):
                gr.HTML('<p class="iahome-card-title">✏️ Votre texte</p>')

                text_input = gr.Textbox(
                    label="Contenu à synthétiser",
                    placeholder="Tapez ou collez votre texte ici…",
                    lines=6,
                    max_lines=12,
                    value=SAMPLE_TEXTS["fr"],
                    show_label=False,
                )
                char_counter = gr.Textbox(
                    label="Caractères",
                    value=count_chars(SAMPLE_TEXTS["fr"]),
                    interactive=False,
                )

                gr.HTML('<p class="iahome-card-title">⚙️ Paramètres</p>')

                with gr.Row():
                    language = gr.Dropdown(
                        choices=LANGUAGE_CHOICES,
                        value=LANGUAGE_CHOICES[0],
                        label="Langue",
                    )
                    speaker = gr.Dropdown(
                        choices=speaker_choices,
                        value=speaker_choices[0],
                        label="Voix",
                        allow_custom_value=False,
                    )

                with gr.Row():
                    speed = gr.Slider(minimum=0.5, maximum=2.0, value=1.0, step=0.05, label="Vitesse")
                    pitch = gr.Slider(minimum=0.5, maximum=2.0, value=1.0, step=0.05, label="Hauteur")

                reference_audio = gr.Audio(
                    label="Cloner une voix (optionnel — WAV 3–10 s)",
                    type="filepath",
                    sources=["upload", "microphone"],
                )

                with gr.Row():
                    generate_btn = gr.Button("🎵 Convertir en voix", variant="primary", scale=2)
                    preview_btn = gr.Button("▶ Aperçu voix", variant="secondary", scale=1)

            with gr.Column(scale=1, elem_classes=["iahome-card"]):
                gr.HTML('<p class="iahome-card-title">🔊 Résultat</p>')

                audio_output = gr.Audio(label="Lecture", type="numpy")
                wav_download = gr.File(label="Télécharger WAV (44,1 kHz)")
                mp3_download = gr.File(label="Télécharger MP3")
                message = gr.Textbox(label="Message", interactive=False)

        text_input.change(fn=count_chars, inputs=[text_input], outputs=[char_counter])
        language.change(fn=on_language_change, inputs=[language], outputs=[text_input, char_counter])

        generate_btn.click(
            fn=run_synthesis,
            inputs=[text_input, language, speaker, speed, pitch, reference_audio],
            outputs=[audio_output, wav_download, mp3_download, message],
        )
        preview_btn.click(
            fn=run_preview,
            inputs=[language, speaker, reference_audio],
            outputs=[audio_output, wav_download, mp3_download, message],
        )

        with gr.Accordion("ℹ️ Spécifications techniques", open=False):
            gr.Markdown(
                """
                | | |
                |---|---|
                | **Modèle** | Coqui XTTS v2 (open source) |
                | **Langues** | FR, EN, ES, DE, IT, PT, PL, TR, RU, NL, CS, AR, ZH, JA, HU, KO, HI |
                | **Audio** | WAV 44,1 kHz / 16 bits · MP3 192 kbps |
                | **Contrôles** | Vitesse, hauteur, voix prédéfinies ou clonage |
                | **Licence** | [Coqui Public Model License](https://coqui.ai/cpml) |
                """
            )

        gr.HTML(IAHOME_FOOTER_HTML)

    return demo


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    load_model()
    demo = create_demo()

    try:
        import gradio.networking as gradio_networking

        gradio_networking.url_ok = lambda _url: True  # noqa: ARG005
    except Exception:
        pass

    demo.queue(default_concurrency_limit=1).launch(
        server_name="0.0.0.0",
        server_port=int(os.environ.get("GRADIO_SERVER_PORT", "7860")),
        share=False,
        show_error=True,
        max_threads=40,
    )
