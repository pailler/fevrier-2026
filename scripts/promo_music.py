"""Musique de fond libre de droits (synthèse) + mux audio/vidéo via ffmpeg."""

from __future__ import annotations

import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from scipy.io import wavfile

SR = 44100


def _env(t: np.ndarray, attack: float, release: float, sr: int = SR) -> np.ndarray:
    n = len(t)
    a = max(1, int(attack * sr))
    r = max(1, int(release * sr))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] = np.linspace(1, 0, r)
    return e


def _note(freq: float, t: np.ndarray, amp: float = 0.2) -> np.ndarray:
    return amp * np.sin(2 * np.pi * freq * t)


def _write_track(out_path: Path, audio: np.ndarray, t: np.ndarray) -> Path:
    fade = _env(t, 1.5, 3.0)
    audio = audio * fade
    peak = np.max(np.abs(audio)) or 1.0
    audio = audio / peak * 0.68
    out_path.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(str(out_path), SR, (audio * 32767).astype(np.int16))
    return out_path


def generate_promo_music(out_path: Path, duration: float, mood: str = "modern") -> Path:
    """Génère une piste instrumentale libre de droits."""
    n = int(SR * duration)
    t = np.arange(n) / SR
    audio = np.zeros(n, dtype=np.float64)

    if mood == "upbeat":
        bpm = 108
        beat = 60 / bpm
        bar = beat * 4
        chords = [
            [261.63, 329.63, 392.00],
            [392.00, 493.88, 587.33],
            [220.00, 261.63, 329.63],
            [349.23, 440.00, 523.25],
        ]
        for i in range(n):
            freqs = chords[int(t[i] / bar) % len(chords)]
            pos = (t[i] % bar) / bar
            pad = sum(_note(f * 0.5, np.array([t[i]]), 0.09)[0] for f in freqs)
            pluck = sum(_note(f * 2, np.array([t[i]]), 0.06)[0] for f in freqs) if pos < 0.08 else 0.0
            kick = 0.12 * np.sin(2 * np.pi * 80 * (t[i] % beat)) if (t[i] % beat) < 0.04 else 0.0
            audio[i] = pad + pluck + kick
        arp = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25]
        step = beat / 2
        for k in range(int(duration / step) + 1):
            s = int(k * step * SR)
            e = min(n, s + int(0.18 * SR))
            if s >= n:
                break
            tt = np.arange(e - s) / SR
            audio[s:e] += _note(arp[k % len(arp)], tt, 0.045) * _env(tt, 0.01, 0.12)
    else:
        # modern — pads chauds + mélodie marimba (G majeur), 96 BPM
        bpm = 96
        beat = 60 / bpm
        bar = beat * 4
        chords = [
            [196.00, 246.94, 293.66],
            [164.81, 196.00, 246.94],
            [261.63, 329.63, 392.00],
            [293.66, 369.99, 440.00],
        ]
        for i in range(n):
            freqs = chords[int(t[i] / bar) % len(chords)]
            pad = sum(_note(f, np.array([t[i]]), 0.055)[0] + _note(f * 0.5, np.array([t[i]]), 0.03)[0] for f in freqs)
            bell = _note(freqs[1] * 2, np.array([t[i]]), 0.04)[0] if (t[i] % (beat * 2)) < 0.06 else 0.0
            kick = 0.07 * np.sin(2 * np.pi * 65 * (t[i] % beat)) if (t[i] % beat) < 0.025 else 0.0
            audio[i] = pad + bell + kick
        melody = [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 329.63]
        for k in range(int(duration / beat) + 2):
            s = int(k * beat * SR)
            e = min(n, s + int(0.22 * SR))
            if s >= n:
                break
            tt = np.arange(e - s) / SR
            audio[s:e] += _note(melody[k % len(melody)], tt, 0.038) * _env(tt, 0.008, 0.14)

    return _write_track(out_path, audio, t)


def extract_source_audio(
    source_path: Path,
    out_path: Path,
    duration: float,
    *,
    start: float = 0.0,
) -> Path:
    """Extrait la piste audio d'une vidéo source (ex. face cam qrcodes.mkv)."""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-ss",
        f"{start:.3f}",
        "-i",
        str(source_path),
        "-t",
        f"{duration:.3f}",
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        str(SR),
        "-ac",
        "2",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return out_path


def mux_audio_video(
    video_path: Path,
    audio_path: Path,
    out_path: Path,
    music_volume: float = 0.32,
    *,
    fade_in: float = 1.5,
    fade_out: float = 2.0,
) -> None:
    """Combine vidéo + piste audio (wav ou autre)."""
    sr, data = wavfile.read(str(audio_path))
    audio_dur = len(data) / sr
    vid_dur = _video_duration(video_path)
    fade_out_st = max(0, min(audio_dur, vid_dur) - fade_out)

    filters = [f"volume={music_volume}"]
    if fade_in > 0:
        filters.append(f"afade=t=in:st=0:d={fade_in}")
    if fade_out > 0:
        filters.append(f"afade=t=out:st={fade_out_st:.2f}:d={fade_out}")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video_path),
        "-i",
        str(audio_path),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-filter:a",
        ",".join(filters),
        "-shortest",
        "-movflags",
        "+faststart",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def _video_duration(path: Path) -> float:
    import imageio.v3 as iio

    meta = iio.immeta(path)
    if "duration" in meta:
        return float(meta["duration"])
    n = meta.get("nframes", 0)
    fps = meta.get("fps", 30)
    return n / fps if n else 20.0
