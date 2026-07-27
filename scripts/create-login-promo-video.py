#!/usr/bin/env python3
"""
IAHome — Vidéo promo connexion verticale 9:16 (20s).

Séquence : titre fade-in → apps en cascade → bouton « Se connecter » pulsant.
Style tech/SaaS, tons bleu-violet.

Usage:
  python scripts/create-login-promo-video.py
"""

from __future__ import annotations

import math
import sys
from dataclasses import dataclass
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from promo_music import generate_promo_music, mux_audio_video

OUT_DIR = ROOT / "public" / "videos"
OUT_VIDEO = OUT_DIR / "iahome-login-promo-20s.mp4"
OUT_MUSIC = OUT_DIR / "music-login-promo-20s.wav"
LOGO_SVG = ROOT / "public" / "iahome-logo.svg"

FPS = 30
DURATION_S = 20
W, H = 1088, 1920

# --- Personnalisation ---
TITLE = "Vos apps IA, un seul compte"
SUBTITLE = "iahome.fr"
CTA_LABEL = "Se connecter"

APPS = [
    {"name": "Photobooth", "icon": "📸", "tag": "Événements & selfies"},
    {"name": "Whisper", "icon": "🎤", "tag": "Transcription audio"},
    {"name": "ComfyUI", "icon": "🎭", "tag": "Workflows IA visuels"},
    {"name": "LibreSpeed", "icon": "⚡", "tag": "Test de débit"},
]

# Palette bleu-violet
BG_TOP = (15, 23, 42)
BG_BOTTOM = (49, 46, 129)
ACCENT_BLUE = (102, 126, 234)
ACCENT_VIOLET = (118, 75, 162)
TEXT = (248, 250, 252)
TEXT_MUTED = (148, 163, 184)

# Timing (frames)
TITLE_START = 60
TITLE_FADE = 90
APPS_START = 150
APP_STAGGER = 10
APPS_END = 420
CTA_START = 420
CTA_FADE = 15


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def ease_out_cubic(t: float) -> float:
    return 1 - (1 - min(1, max(0, t))) ** 3


def ease_out_back(t: float) -> float:
    t = min(1, max(0, t))
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def lerp_color(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_background(d: ImageDraw.ImageDraw) -> None:
    for y in range(H):
        t = y / H
        col = lerp_color(BG_TOP, BG_BOTTOM, t)
        d.line((0, y, W, y), fill=col)

    # Grille tech légère
    step = 80
    grid = (255, 255, 255, 12)
    for x in range(0, W, step):
        d.line((x, 0, x, H), fill=grid)
    for y in range(0, H, step):
        d.line((0, y, W, y), fill=grid)


def load_logo() -> Image.Image | None:
    if not LOGO_SVG.exists():
        return None
    try:
        import cairosvg

        png = cairosvg.svg2png(url=str(LOGO_SVG), output_width=256, output_height=256)
        from io import BytesIO

        return Image.open(BytesIO(png)).convert("RGBA")
    except ImportError:
        pass
    # Fallback : placeholder maison
    img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(64, 16), (112, 64), (16, 64)], outline=(*ACCENT_BLUE, 255), width=6)
    d.line((40, 64, 40, 112), fill=(*ACCENT_BLUE, 255), width=6)
    d.line((88, 64, 88, 112), fill=(*ACCENT_BLUE, 255), width=6)
    return img


def draw_title_layer(canvas: Image.Image, frame: int, logo: Image.Image | None) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    if logo and frame >= TITLE_START - 30:
        scale = 0.55
        lw, lh = int(logo.width * scale), int(logo.height * scale)
        lg = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        overlay.paste(lg, ((W - lw) // 2, 180), lg)

    if frame >= TITLE_START:
        local = (frame - TITLE_START) / TITLE_FADE
        opacity = int(255 * ease_out_cubic(local))
        if opacity > 0:
            tf = load_font(64, bold=True)
            sf = load_font(36, bold=True)
            tb = d.textbbox((0, 0), TITLE, font=tf)
            tw = tb[2] - tb[0]
            d.text(((W - tw) // 2, 420), TITLE, font=tf, fill=(*TEXT, opacity))
            sb = d.textbbox((0, 0), SUBTITLE, font=sf)
            sw = sb[2] - sb[0]
            d.text(((W - sw) // 2, 500), SUBTITLE, font=sf, fill=(*ACCENT_BLUE, opacity))

    canvas.alpha_composite(overlay)


@dataclass
class AppCard:
    name: str
    icon: str
    tag: str
    y: int


def app_cards_layout(n: int) -> list[AppCard]:
    card_h = 140
    gap = 24
    total = n * card_h + (n - 1) * gap
    y0 = (H - total) // 2 + 40
    return [
        AppCard(app["name"], app["icon"], app["tag"], y0 + i * (card_h + gap))
        for i, app in enumerate(APPS[:n])
    ]


def draw_app_card(
    d: ImageDraw.ImageDraw,
    card: AppCard,
    local_t: float,
    accent: tuple[int, int, int],
) -> None:
    opacity = int(255 * min(1, max(0, (local_t - 0.08) / 0.35)))
    if opacity <= 0:
        return

    slide = int(80 * (1 - ease_out_back(min(1, local_t * 1.2))))
    y = card.y + slide
    x, w, h = 80, W - 160, 140
    r = 20

    d.rounded_rectangle((x, y, x + w, y + h), radius=r, fill=(*accent, int(opacity * 0.25)))
    d.rounded_rectangle((x, y, x + w, y + h), radius=r, outline=(*TEXT, int(opacity * 0.35)), width=2)

    icon_f = load_font(56)
    d.text((x + 28, y + 36), card.icon, font=icon_f, fill=(*TEXT, opacity))

    name_f = load_font(38, bold=True)
    tag_f = load_font(26)
    d.text((x + 110, y + 32), card.name, font=name_f, fill=(*TEXT, opacity))
    d.text((x + 110, y + 78), card.tag, font=tag_f, fill=(*TEXT_MUTED, opacity))


def draw_apps_layer(canvas: Image.Image, frame: int) -> None:
    if frame < APPS_START or frame >= APPS_END + CTA_FADE:
        return

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cards = app_cards_layout(len(APPS))
    accents = [ACCENT_BLUE, ACCENT_VIOLET, (99, 102, 241), (139, 92, 246)]

    for i, card in enumerate(cards):
        start = APPS_START + i * APP_STAGGER
        if frame < start:
            continue
        local_t = (frame - start) / (FPS * 2.2)
        draw_app_card(d, card, local_t, accents[i % len(accents)])

    # Fondu sortie vers CTA
    if frame >= APPS_END:
        fade = (frame - APPS_END) / CTA_FADE
        overlay = Image.blend(Image.new("RGBA", canvas.size, (0, 0, 0, 0)), overlay, 1 - fade)

    canvas.alpha_composite(overlay)


def draw_cta_layer(canvas: Image.Image, frame: int, logo: Image.Image | None) -> None:
    if frame < CTA_START:
        return

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    fade = min(1, (frame - CTA_START) / CTA_FADE)
    bg_alpha = int(255 * fade)
    for y in range(H):
        t = y / H
        col = lerp_color(BG_BOTTOM, ACCENT_VIOLET, t * 0.4)
        d.line((0, y, W, y), fill=(*col, bg_alpha))

    if logo:
        scale = 0.45
        lw, lh = int(logo.width * scale), int(logo.height * scale)
        lg = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        overlay.paste(lg, ((W - lw) // 2, 320), lg)

    pulse = frame / FPS
    scale = 1 + 0.08 * math.sin(pulse * 5)
    btn_w, btn_h = int(520 * scale), int(96 * scale)
    bx = (W - btn_w) // 2
    by = 720

    # Halo pulsant
    for ring in range(3):
        rr = int(12 + ring * 14 + 6 * math.sin(pulse * 5 + ring))
        alpha = int((90 - ring * 25) * fade)
        d.rounded_rectangle(
            (bx - rr, by - rr, bx + btn_w + rr, by + btn_h + rr),
            radius=28 + rr,
            outline=(*ACCENT_BLUE, alpha),
            width=3,
        )

    # Bouton dégradé (approximation par bandes)
    for i in range(btn_h):
        t = i / btn_h
        col = lerp_color(ACCENT_BLUE, ACCENT_VIOLET, t)
        d.line((bx, by + i, bx + btn_w, by + i), fill=(*col, int(255 * fade)))

    d.rounded_rectangle((bx, by, bx + btn_w, by + btn_h), radius=24, outline=(*TEXT, int(180 * fade)), width=2)

    bf = load_font(int(42 * scale), bold=True)
    bb = d.textbbox((0, 0), CTA_LABEL, font=bf)
    bw = bb[2] - bb[0]
    d.text((bx + (btn_w - bw) // 2, by + (btn_h - 42) // 2), CTA_LABEL, font=bf, fill=(*TEXT, int(255 * fade)))

    uf = load_font(32, bold=True)
    url = "iahome.fr"
    ub = d.textbbox((0, 0), url, font=uf)
    uw = ub[2] - ub[0]
    d.text(((W - uw) // 2, by + btn_h + 48), url, font=uf, fill=(*TEXT_MUTED, int(255 * fade)))

    tag_f = load_font(28)
    tag = "Connectez-vous pour accéder à toutes vos applications"
    tb = d.textbbox((0, 0), tag, font=tag_f)
    tw = tb[2] - tb[0]
    d.text(((W - tw) // 2, by + btn_h + 100), tag, font=tag_f, fill=(*TEXT, int(200 * fade)))

    canvas.alpha_composite(overlay)


def build_frame(frame: int, logo: Image.Image | None) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(canvas)
    draw_background(d)
    draw_title_layer(canvas, frame, logo)
    draw_apps_layer(canvas, frame)
    draw_cta_layer(canvas, frame, logo)
    return canvas.convert("RGB")


def generate_frames(logo: Image.Image | None) -> list[np.ndarray]:
    total = int(DURATION_S * FPS)
    return [np.asarray(build_frame(fi, logo)) for fi in range(total)]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    logo = load_logo()
    frames = generate_frames(logo)

    tmp = OUT_VIDEO.with_suffix(".tmp.mp4")
    iio.imwrite(tmp, frames, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p")
    generate_promo_music(OUT_MUSIC, DURATION_S, mood="modern")
    mux_audio_video(tmp, OUT_MUSIC, OUT_VIDEO, music_volume=0.32)
    tmp.unlink(missing_ok=True)

    print(f"Vidéo : {OUT_VIDEO} ({W}×{H}, 9:16, {DURATION_S}s + musique)")
    print(f"Musique : {OUT_MUSIC}")


if __name__ == "__main__":
    main()
