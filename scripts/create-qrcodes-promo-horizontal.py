#!/usr/bin/env python3
"""IAHome QR Codes — Promo horizontal 16:9 (1920×1080, 45s) avec effets + musique."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from promo_common import ASSETS, BRAND_FILE, HEADER_BG, ACCENT_VIOLET, INTRO_FILE, INTRO_S, SLIDES, load_font, render_intro, stroke_text
from promo_music import generate_promo_music, mux_audio_video

OUT_DIR = ROOT / "public" / "videos" / "qrcodes"
OUT_FILE = OUT_DIR / "iahome-qrcodes-promo-horizontal-45s.mp4"
OUT_MUSIC = OUT_DIR / "music-promo-45s.wav"

W, H = 1920, 1080
FPS = 30
DURATION_S = 45
PAD = 32
H_HEAD = 88
LEFT_W = 1180
RIGHT_W = W - LEFT_W
TRANS = 18


def ken_burns_shot(shot: Image.Image, pw: int, ph: int, t: float, fill: tuple) -> Image.Image:
    """Zoom lent + léger pan (effet Ken Burns)."""
    zoom = 1.0 + 0.10 * t
    scale = (pw / shot.width) * zoom
    nw, nh = int(shot.width * scale), int(shot.height * scale)
    img = shot.resize((nw, nh), Image.Resampling.LANCZOS)
    pan_x = int((nw - pw) * 0.5 * t)
    pan_y = int((nh - ph) * 0.35 * math.sin(t * math.pi))
    left = max(0, min(nw - pw, (nw - pw) // 2 + pan_x - int(pw * 0.05)))
    top = max(0, min(nh - ph, (nh - ph) // 2 + pan_y))
    crop = img.crop((left, top, left + pw, top + ph))
    if crop.size != (pw, ph):
        crop = crop.resize((pw, ph), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (pw, ph), (*fill, 255))
    frame.paste(crop, (0, 0), crop if crop.mode == "RGBA" else None)
    return frame


def vignette(img: Image.Image, strength: float = 0.45) -> Image.Image:
    w, h = img.size
    vig = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vig)
    d.ellipse((-w * 0.15, -h * 0.15, w * 1.15, h * 1.15), fill=int(255 * (1 - strength)))
    base = img.convert("RGBA")
    dark = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    return Image.composite(base, dark, vig)


def _reveal_words(text: str, reveal: float, delay: float = 0.35, speed: float = 1.5) -> str:
    words = text.split()
    if not words:
        return ""
    progress = max(0.0, min(1.0, (reveal - delay) * speed))
    count = max(0, min(len(words), int(len(words) * progress) + (1 if progress > 0 else 0)))
    return " ".join(words[:count])


def _draw_words_wrapped(
    d: ImageDraw.ImageDraw,
    x: int,
    y: int,
    text: str,
    font,
    highlight: str,
    max_w: int,
    stroke: int = 2,
    line_gap: int = 44,
) -> None:
    if not text:
        return
    hi = highlight.lower()
    cx, cy = x, y
    for w in text.split():
        wb = d.textbbox((0, 0), w + " ", font=font)
        ww = wb[2] - wb[0]
        if cx + ww > x + max_w and cx > x:
            cx = x
            cy += line_gap
        col = (255, 220, 0) if hi in w.lower() else (200, 210, 220)
        stroke_text(d, (cx, cy), w + " ", font, col, stroke)
        cx += ww


def flash_overlay(base: Image.Image, alpha: float) -> Image.Image:
    if alpha <= 0:
        return base
    ov = Image.new("RGBA", base.size, (255, 255, 255, int(180 * alpha)))
    out = base.convert("RGBA")
    out.alpha_composite(ov)
    return out.convert("RGB")


def build_frame(
    canvas: Image.Image,
    slide: dict,
    screenshot: Image.Image,
    brand: Image.Image,
    slide_idx: int,
    local_t: float,
    global_prog: float,
    pulse: float,
    flash: float,
) -> Image.Image:
    d = ImageDraw.Draw(canvas)
    accent = slide["accent"]

    # Fond dégradé plein cadre
    for y in range(H):
        t = y / H
        r = int(accent[0] * (1 - t) * 0.3 + 18 * t)
        g = int(accent[1] * (1 - t) * 0.3 + 24 * t)
        b = int(accent[2] * (1 - t) * 0.3 + 38 * t)
        d.line((0, y, W, y), fill=(r, g, b))

    # Header
    d.rectangle((0, 0, W, H_HEAD), fill=(*HEADER_BG, 255))
    lh = H_HEAD - 18
    scale = min(200 / brand.width, lh / brand.height)
    lw, lhh = int(brand.width * scale), int(brand.height * scale)
    logo = brand.resize((lw, lhh), Image.Resampling.LANCZOS)
    canvas.paste(logo, ((W - lw) // 2, (H_HEAD - lhh) // 2), logo)

    bf = load_font(22, bold=True)
    bb = d.textbbox((0, 0), slide["badge"], font=bf)
    bx = W - PAD - (bb[2] - bb[0]) - 24
    d.rounded_rectangle((bx, 14, bx + bb[2] - bb[0] + 24, 42), radius=8, fill=(*slide["badge_color"], 240))
    d.text((bx + 12, 18), slide["badge"], font=bf, fill=(255, 255, 255))

    d.text((PAD, 28), "iahome.fr", font=load_font(24, bold=True), fill=(*ACCENT_VIOLET, 255))

    py = H_HEAD - 5
    d.rectangle((PAD, py, W - PAD, py + 4), fill=(255, 255, 255, 50))
    d.rectangle((PAD, py, PAD + int((W - 2 * PAD) * global_prog), py + 4), fill=(*accent, 255))

    content_y = H_HEAD
    content_h = H - H_HEAD

    # Panneau gauche — capture + Ken Burns + vignette
    pw, ph = LEFT_W, content_h
    kb = ken_burns_shot(screenshot, pw, ph, local_t, slide["screen_fill"])
    kb = vignette(kb, 0.35)
    enh = ImageEnhance.Contrast(kb.convert("RGB"))
    kb_rgb = enh.enhance(1.05 + 0.05 * math.sin(pulse * 3))
    canvas.paste(kb_rgb, (0, content_y))

    # Séparateur lumineux
    d.line((LEFT_W, content_y, LEFT_W, H), fill=(*accent, 180), width=3)

    # Panneau droit
    rx, rw = LEFT_W + PAD, RIGHT_W - 2 * PAD
    d.rectangle((LEFT_W, content_y, W, H), fill=(15, 23, 42, 255))

    reveal = min(1.0, local_t * 1.15)
    title_f = load_font(38, bold=True)
    sub_f = load_font(30, bold=True)

    ty = content_y + 36
    full1 = slide["line1"]
    shown1 = full1[: max(1, int(len(full1) * reveal))]
    stroke_text(d, (rx, ty), shown1, title_f, (255, 255, 255), 3)

    shown2 = _reveal_words(slide["line2"], reveal)
    _draw_words_wrapped(d, rx, ty + 52, shown2, sub_f, slide["highlight"], rw)

    # Face cam placeholder
    cam_r = 100
    cam_cx = rx + cam_r + 10
    cam_cy = content_y + 280
    for i in range(2):
        rr = cam_r + 8 + i * 6 + int(4 * math.sin(pulse * 5 + i))
        d.ellipse((cam_cx - rr, cam_cy - rr, cam_cx + rr, cam_cy + rr), outline=(*accent, 100 - i * 30), width=3)
    d.ellipse((cam_cx - cam_r, cam_cy - cam_r, cam_cx + cam_r, cam_cy + cam_r), fill=(30, 41, 59))
    d.ellipse((cam_cx - cam_r, cam_cy - cam_r, cam_cx + cam_r, cam_cy + cam_r), outline=(255, 255, 255), width=4)
    d.text((cam_cx - 58, cam_cy - 12), "VOTRE VIDÉO", font=load_font(18, bold=True), fill=(255, 255, 255))

    # CTA + features à droite de la cam
    info_x = cam_cx + cam_r + 28
    info_w = W - PAD - info_x
    cta_y = cam_cy - 50
    d.rounded_rectangle((info_x, cta_y, info_x + info_w, cta_y + 88), radius=14, fill=(*accent, 240))
    d.text((info_x + 14, cta_y + 10), "👉 iahome.fr", font=load_font(32, bold=True), fill=(255, 255, 255))
    d.text((info_x + 14, cta_y + 48), "QR Codes Dynamiques", font=load_font(22, bold=True), fill=(230, 235, 245))

    fy = cta_y + 100
    for feat in slide["features"]:
        d.text((info_x, fy), feat, font=load_font(22, bold=True), fill=(240, 245, 250))
        fy += 34

    bar_y = H - 52
    d.rectangle((0, bar_y, W, H), fill=(0, 0, 0, 180))
    bar_txt = "Essayez gratuitement sur iahome.fr"
    bar_f = load_font(24, bold=True)
    bt = d.textbbox((0, 0), bar_txt, font=bar_f)
    d.text(((W - (bt[2] - bt[0])) // 2, bar_y + 14), bar_txt, font=bar_f, fill=(255, 255, 255))

    out = flash_overlay(canvas.convert("RGB"), flash)
    return out


def generate_frames(brand: Image.Image, shots: list[Image.Image], intro: Image.Image) -> list[np.ndarray]:
    total = int(DURATION_S * FPS)
    intro_n = int(INTRO_S * FPS)
    content_n = total - intro_n
    per = content_n // 3
    fade_n = TRANS
    frames: list[np.ndarray] = []

    for fi in range(total):
        if fi < intro_n:
            t = fi / max(1, intro_n - 1)
            frame = render_intro(intro, W, H, t)
            if fi >= intro_n - fade_n:
                pulse = fi / FPS
                prog = (fi + 1) / total
                canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
                first = build_frame(canvas, SLIDES[0], shots[0], brand, 0, 0.0, prog, pulse, 0.0)
                a = (fi - (intro_n - fade_n)) / fade_n
                frame = Image.fromarray(
                    (np.asarray(frame, dtype=np.float32) * (1 - a) + np.asarray(first, dtype=np.float32) * a).astype(np.uint8)
                )
            frames.append(np.asarray(frame))
            continue

        ci = fi - intro_n
        si = min(ci // per, 2)
        local_fi = ci - si * per
        local_t = local_fi / per
        global_prog = (fi + 1) / total
        pulse = fi / FPS
        flash = max(0.0, 1.0 - local_fi / 10) if local_fi < 10 else 0.0

        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        curr = build_frame(canvas, SLIDES[si], shots[si], brand, si, local_t, global_prog, pulse, flash)

        if local_fi < fade_n and si > 0:
            prev_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
            prev = build_frame(prev_canvas, SLIDES[si - 1], shots[si - 1], brand, si - 1, 1.0, global_prog, pulse, 0)
            a = local_fi / fade_n
            blend = (np.asarray(prev, dtype=np.float32) * (1 - a) + np.asarray(curr, dtype=np.float32) * a).astype(np.uint8)
            frames.append(blend)
        else:
            frames.append(np.asarray(curr))

    return frames[:total]


def main() -> None:
    brand = Image.open(ASSETS / BRAND_FILE).convert("RGBA")
    intro = Image.open(ASSETS / INTRO_FILE).convert("RGB")
    shots = [Image.open(ASSETS / s["image"]).convert("RGBA") for s in SLIDES]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    generate_promo_music(OUT_MUSIC, DURATION_S, mood="modern")
    frames = generate_frames(brand, shots, intro)
    tmp = OUT_FILE.with_suffix(".tmp.mp4")
    iio.imwrite(tmp, frames, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p")
    mux_audio_video(tmp, OUT_MUSIC, OUT_FILE, music_volume=0.30)
    tmp.unlink(missing_ok=True)
    print(f"Horizontal: {OUT_FILE} ({W}×{H}, 16:9, {DURATION_S}s + musique libre de droits)")


if __name__ == "__main__":
    main()
