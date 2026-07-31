#!/usr/bin/env python3
"""
IAHome QR Codes — Promos vidéo avec musique libre de droits.

Exports verticaux 9:16 (20s) → public/videos/qrcodes/ :
  - iahome-qrcodes-promo-20s.mp4
  - iahome-qrcodes-youtube-short-20s.mp4

Export horizontal 16:9 (45s) → public/videos/qrcodes/ :
  python scripts/create-qrcodes-promo-horizontal.py
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from promo_common import INTRO_FILE, INTRO_S_SHORT, load_face_frames, render_intro
from promo_music import extract_source_audio, generate_promo_music, mux_audio_video

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\AAA\.cursor\projects\c-Users-AAA-Documents-iahome\assets")
OUT_DIR = ROOT / "public" / "videos" / "qrcodes"
OUT_REELS = OUT_DIR / "iahome-qrcodes-promo-20s.mp4"
OUT_YOUTUBE = OUT_DIR / "iahome-qrcodes-youtube-short-20s.mp4"
OUT_HORIZONTAL = OUT_DIR / "iahome-qrcodes-promo-horizontal-45s.mp4"
OUT_MUSIC_20 = OUT_DIR / "music-promo-20s.wav"
OUT_VOICE_20 = OUT_DIR / "voice-qrcodes-20s.wav"
OUT_MUSIC_45 = OUT_DIR / "music-promo-45s.wav"
OUT_TELEPROMPTER = OUT_DIR / "iahome-qrcodes-promo-teleprompter.txt"
FACE_VIDEO = OUT_DIR / "qrcodes.mkv"

FPS = 30
DURATION_S = 20

ACCENT_GREEN = (34, 197, 94)
ACCENT_VIOLET = (102, 126, 234)

BRAND_FILE = (
    "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "logo-0226b44d-9576-484c-93db-bf825fa2b97e.png"
)
HEADER_BG = (12, 22, 38)


@dataclass
class Layout:
    width: int
    height: int = 1920
    pad: int = 16
    h_header: int = 210
    h_screen: int = 910
    h_subs: int = 200
    camera_r: int = 145

    @property
    def h_footer(self) -> int:
        return self.height - self.h_header - self.h_screen - self.h_subs

    @property
    def y_header(self) -> int:
        return 0

    @property
    def y_screen(self) -> int:
        return self.h_header

    @property
    def y_subs(self) -> int:
        return self.y_screen + self.h_screen

    @property
    def y_footer(self) -> int:
        return self.y_subs + self.h_subs

    @property
    def camera_cx(self) -> int:
        return self.pad + self.camera_r + 20

    @property
    def camera_cy(self) -> int:
        return self.y_footer + self.h_footer // 2 + 20


LAYOUT_REELS = Layout(width=1088)
LAYOUT_YOUTUBE = Layout(width=1080, pad=15, camera_r=142)

# Layout actif (mis à jour par apply_layout)
L: Layout = LAYOUT_REELS

SLIDES = [
    {
        "image": (
            "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
            "Capture_d__cran_2026-07-24_122510-bb7c51c3-3a54-4e9c-9107-981f195f11ac.png"
        ),
        "badge": "NOUVEAU",
        "badge_color": (34, 160, 90),
        "accent": (34, 160, 90),
        "screen_fill": (34, 160, 90),
        "line1": "Enfin un tableau de bord complet",
        "line2": "pour créer vos qrcodes, et c'est sur iahome.fr",
        "highlight": "iahome.fr",
        "bullet": "Analytics en temps réel",
        "features": ["✓ QR codes dynamiques", "✓ Stats en direct", "✓ Export HD"],
    },
    {
        "image": (
            "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
            "Capture_d__cran_2026-07-24_122752-7b2599dc-edda-4ec8-afb0-5d937dfc89b4.png"
        ),
        "badge": "ASTUCE",
        "badge_color": ACCENT_VIOLET,
        "accent": ACCENT_VIOLET,
        "screen_fill": (255, 255, 255),
        "line1": "Ne jetez pas vos QR codes",
        "line2": "Modifiez sans réimprimer",
        "highlight": "réimprimer",
        "bullet": "Même support, nouveau lien",
        "features": ["✓ URL modifiable", "✓ Token sécurisé", "✓ Zéro réimpression"],
    },
    {
        "image": (
            "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
            "Capture_d__cran_2026-07-24_122531-a2ccdc69-80a7-475d-9610-ef4125c4c42f.png"
        ),
        "badge": "3 EN 1",
        "badge_color": (236, 72, 153),
        "accent": (118, 75, 162),
        "screen_fill": (255, 255, 255),
        "line1": "Utilisez l'appli QR code",
        "line2": "sur iahome.fr",
        "highlight": "iahome.fr",
        "bullet": "Statique · Dynamique · Modifier",
        "features": ["✓ Création rapide", "✓ Personnalisation", "✓ Gestion centralisée"],
    },
]


def apply_layout(layout: Layout) -> None:
    global L
    L = layout


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


def stroke_text(d: ImageDraw.ImageDraw, pos: tuple, text: str, font, fill, stroke: int = 3) -> None:
    d.text(pos, text, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))


def fit_screen(img: Image.Image, tw: int, th: int, fill: tuple[int, int, int]) -> Image.Image:
    """Pleine largeur + remplissage vertical — aucune bande vide, texte non coupé."""
    scale = tw / img.width
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (tw, th), (*fill, 255))
    if nh >= th:
        top = (nh - th) // 2
        cropped = resized.crop((0, top, nw, top + th))
        canvas.paste(cropped, (0, 0), cropped)
    else:
        py = (th - nh) // 2
        canvas.paste(resized, (0, py), resized)
    return canvas


def draw_full_background(canvas: Image.Image, accent: tuple[int, int, int]) -> None:
    d = ImageDraw.Draw(canvas)
    for y in range(L.height):
        t = y / L.height
        r = int(accent[0] * (1 - t) + 248 * t)
        g = int(accent[1] * (1 - t) + 250 * t)
        b = int(accent[2] * (1 - t) + 252 * t)
        d.line((0, y, L.width, y), fill=(r, g, b))


def draw_header(canvas: Image.Image, brand: Image.Image, slide_idx: int, progress: float, badge: str, badge_color: tuple, accent: tuple) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, L.y_header, L.width, L.y_header + L.h_header), fill=(*HEADER_BG, 255))

    logo_max_h = L.h_header - 52
    logo_max_w = int(420 * L.width / 1088)
    scale = min(logo_max_w / brand.width, logo_max_h / brand.height)
    lw, lh = int(brand.width * scale), int(brand.height * scale)
    logo = brand.resize((lw, lh), Image.Resampling.LANCZOS)
    lx = (L.width - lw) // 2
    ly = L.y_header + 28 + (logo_max_h - lh) // 2
    overlay.paste(logo, (lx, ly), logo)

    uf = load_font(22, bold=True)
    url = "iahome.fr"
    ub = d.textbbox((0, 0), url, font=uf)
    uw = ub[2] - ub[0]
    ux = (L.width - uw) // 2
    uy = ly + lh + 4
    if uy + 20 < L.y_header + L.h_header - 14:
        d.text((ux, uy), url, font=uf, fill=(148, 163, 184, 255))

    bf = load_font(20, bold=True)
    bb = d.textbbox((0, 0), badge, font=bf)
    bx = L.width - L.pad - (bb[2] - bb[0]) - 20
    by = L.y_header + 12
    d.rounded_rectangle((bx, by, bx + bb[2] - bb[0] + 20, by + 28), radius=8, fill=(*badge_color, 230))
    d.text((bx + 10, by + 4), badge, font=bf, fill=(255, 255, 255, 255))

    for i in range(3):
        cx = L.pad + 12 + i * 18
        cy = L.y_header + 18
        r = 5 if i == slide_idx else 3
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 255 if i == slide_idx else 80))

    py = L.y_header + L.h_header - 6
    d.rectangle((L.pad, py, L.width - L.pad, py + 4), fill=(255, 255, 255, 40))
    d.rectangle((L.pad, py, L.pad + int((L.width - 2 * L.pad) * progress), py + 4), fill=(*accent, 255))

    canvas.alpha_composite(overlay)


def draw_screen(canvas: Image.Image, screenshot: Image.Image, fill: tuple[int, int, int]) -> None:
    """Capture pleine largeur — remplit toute la bande centrale."""
    frame = fit_screen(screenshot, L.width, L.h_screen, fill)
    canvas.paste(frame, (0, L.y_screen))


def draw_subtitles(canvas: Image.Image, line1: str, line2: str, highlight: str, reveal: float) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, L.y_subs, L.width, L.y_subs + L.h_subs), fill=(10, 15, 30, 245))
    d.text((L.pad, L.y_subs + 8), "🎙 LISEZ À VOIX HAUTE", font=load_font(17, bold=True), fill=(255, 220, 80, 255))

    f1, f2 = load_font(30, bold=True), load_font(28, bold=True)
    full = f"{line1} {line2}"
    shown = full[: max(1, int(len(full) * min(1.0, reveal * 1.1)))]

    def draw_wrapped(text: str, y: int, font, max_lines: int = 2) -> int:
        words, lines, cur = text.split(), [], ""
        for w in words:
            test = (cur + " " + w).strip()
            tb = d.textbbox((0, 0), test, font=font)
            if tb[2] - tb[0] > L.width - 2 * L.pad and cur:
                lines.append(cur)
                cur = w
            else:
                cur = test
        if cur:
            lines.append(cur)
        lines = lines[:max_lines]
        cy = y
        for line in lines:
            cx = L.pad
            for w in line.split():
                col = (255, 220, 0, 255) if highlight.lower() in w.lower() else (255, 255, 255, 255)
                wb = d.textbbox((0, 0), w + " ", font=font)
                stroke_text(d, (cx, cy), w + " ", font, col, 3)
                cx += wb[2] - wb[0]
            cy += 40
        return cy

    mid = len(line1)
    if len(shown) <= mid:
        draw_wrapped(shown, L.y_subs + 38, f1, 1)
    else:
        draw_wrapped(line1, L.y_subs + 38, f1, 1)
        draw_wrapped(shown[mid:].strip(), L.y_subs + 78, f2, 1)

    canvas.alpha_composite(overlay)


def draw_footer(canvas: Image.Image, slide: dict, pulse: float, face_img: Image.Image | None = None) -> None:
    """Pied de page plein cadre jusqu'au bas — face cam + CTA + features."""
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    accent = slide["accent"]

    for y in range(L.h_footer):
        t = y / L.h_footer
        r = int(accent[0] * (1 - t) + 20 * t)
        g = int(accent[1] * (1 - t) + 30 * t)
        b = int(accent[2] * (1 - t) + 45 * t)
        d.line((0, L.y_footer + y, L.width, L.y_footer + y), fill=(r, g, b, 255))

    cx, cy, r = L.camera_cx, L.camera_cy, L.camera_r
    diam = 2 * r
    for i in range(2):
        rr = r + 12 + i * 10 + int(5 * math.sin(pulse * 5 + i))
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(255, 255, 255, 90 - i * 30), width=4)

    if face_img is not None:
        face = face_img.resize((diam, diam), Image.Resampling.LANCZOS)
        canvas.alpha_composite(overlay)
        overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(overlay)
        canvas.paste(face, (cx - r, cy - r), face)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(255, 255, 255, 255), width=5)
    else:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(15, 23, 42, 255))
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(255, 255, 255, 255), width=5)
        cf = load_font(22, bold=True)
        d.text((cx - 62, cy - 14), "VOTRE VIDÉO", font=cf, fill=(255, 255, 255, 255))
        d.text((cx - 72, cy + 14), "face caméra ici", font=load_font(17), fill=(200, 215, 230, 230))
        d.ellipse((cx - 38, cy - 88, cx + 38, cy - 12), fill=(*ACCENT_VIOLET, 220))
        d.rounded_rectangle((cx - 54, cy - 4, cx + 54, cy + 72), radius=24, fill=(*ACCENT_VIOLET, 170))

    col_x = cx + r + L.pad + 8
    col_w = L.width - col_x - L.pad

    cta_f, sub_f = load_font(34, bold=True), load_font(26, bold=True)
    cta_y = L.y_footer + 36
    d.rounded_rectangle((col_x, cta_y, col_x + col_w, cta_y + 96), radius=18, fill=(255, 255, 255, 245))
    d.text((col_x + 16, cta_y + 10), "👉 iahome.fr", font=cta_f, fill=(*accent, 255))
    d.text((col_x + 16, cta_y + 52), "QR Codes Dynamiques", font=sub_f, fill=(51, 65, 85, 255))

    pill_f = load_font(21, bold=True)
    pb = d.textbbox((0, 0), slide["bullet"], font=pill_f)
    pw = pb[2] - pb[0]
    py = cta_y + 108
    d.rounded_rectangle((col_x, py, col_x + col_w, py + 40), radius=12, fill=(255, 255, 255, 60))
    d.text((col_x + (col_w - pw) // 2, py + 8), slide["bullet"], font=pill_f, fill=(255, 255, 255, 255))

    ff = load_font(24, bold=True)
    fy = py + 56
    for feat in slide["features"]:
        d.text((col_x + 8, fy), feat, font=ff, fill=(255, 255, 255, 240))
        fy += 38

    bar_y = L.height - 52
    d.rectangle((0, bar_y, L.width, L.height), fill=(0, 0, 0, 60))
    bar_f = load_font(22, bold=True)
    bar_txt = "Essayez gratuitement sur iahome.fr"
    bt = d.textbbox((0, 0), bar_txt, font=bar_f)
    d.text(((L.width - (bt[2] - bt[0])) // 2, bar_y + 14), bar_txt, font=bar_f, fill=(255, 255, 255, 255))

    canvas.alpha_composite(overlay)


def build_frame(
    slide: dict,
    screenshot: Image.Image,
    brand: Image.Image,
    slide_idx: int,
    local_t: float,
    progress: float,
    pulse: float,
    face_img: Image.Image | None = None,
) -> Image.Image:
    canvas = Image.new("RGBA", (L.width, L.height), (255, 255, 255, 255))
    draw_full_background(canvas, slide["accent"])
    draw_header(canvas, brand, slide_idx, progress, slide["badge"], slide["badge_color"], slide["accent"])
    draw_screen(canvas, screenshot, slide["screen_fill"])
    reveal = min(1.0, 0.08 + local_t * 1.2)
    draw_subtitles(canvas, slide["line1"], slide["line2"], slide["highlight"], reveal)
    draw_footer(canvas, slide, pulse, face_img)
    return canvas.convert("RGB")


def generate_frames(
    brand: Image.Image,
    shots: list[Image.Image],
    intro: Image.Image,
    face_frames: list[Image.Image] | None = None,
) -> list[np.ndarray]:
    total = int(DURATION_S * FPS)
    intro_n = int(INTRO_S_SHORT * FPS)
    content_n = total - intro_n
    per = content_n // 3
    fade_n = 8
    out: list[np.ndarray] = []

    def face_at(fi: int) -> Image.Image | None:
        if not face_frames:
            return None
        return face_frames[min(fi, len(face_frames) - 1)]

    for fi in range(total):
        if fi < intro_n:
            t = fi / max(1, intro_n - 1)
            frame = render_intro(intro, L.width, L.height, t, fit="contain")
            if fi >= intro_n - fade_n:
                lt = 0.0
                prog = (fi + 1) / total
                pulse = fi / FPS
                first = build_frame(SLIDES[0], shots[0], brand, 0, lt, prog, pulse, face_at(fi))
                a = (fi - (intro_n - fade_n)) / fade_n
                frame = Image.fromarray(
                    (np.asarray(frame, dtype=np.float32) * (1 - a) + np.asarray(first, dtype=np.float32) * a).astype(np.uint8)
                )
            out.append(np.asarray(frame))
            continue

        ci = fi - intro_n
        si = min(ci // per, 2)
        lt = (ci - si * per) / per
        prog = (fi + 1) / total
        pulse = fi / FPS
        if ci % per < fade_n and si > 0:
            prev = build_frame(SLIDES[si - 1], shots[si - 1], brand, si - 1, 1.0, prog, pulse, face_at(fi))
            curr = build_frame(SLIDES[si], shots[si], brand, si, lt, prog, pulse, face_at(fi))
            a = (ci % per) / fade_n
            out.append((np.asarray(prev, dtype=np.float32) * (1 - a) + np.asarray(curr, dtype=np.float32) * a).astype(np.uint8))
        else:
            out.append(np.asarray(build_frame(SLIDES[si], shots[si], brand, si, lt, prog, pulse, face_at(fi))))
    return out[:total]


def write_teleprompter() -> None:
    OUT_TELEPROMPTER.write_text(
        f"""TELEPROMPTEUR — Reels ({LAYOUT_REELS.width}×1920) & YouTube Short ({LAYOUT_YOUTUBE.width}×1920)
Face caméra : cercle ~{LAYOUT_REELS.camera_r * 2}px

INTRO ({INTRO_S_SHORT}s) : visuel « QR codes partout, connectés » — pas de voix off
SLIDE 1 : Enfin un tableau de bord complet pour créer vos qrcodes, et c'est sur iahome.fr
SLIDE 2 : Ne jetez pas vos QR codes. Modifiez sans réimprimer
SLIDE 3 : Utilisez l'appli QR code sur iahome.fr

YOUTUBE SHORTS — upload : iahome-qrcodes-youtube-short-20s.mp4
HORIZONTAL YouTube — upload : iahome-qrcodes-promo-horizontal-45s.mp4 (16:9, 45s)

Musique : voix extraite de qrcodes.mkv (voice-qrcodes-20s.wav) ou synthèse (music-promo-20s.wav)
""",
        encoding="utf-8",
    )


def export_video(
    brand: Image.Image,
    shots: list[Image.Image],
    intro: Image.Image,
    layout: Layout,
    out_path: Path,
    label: str,
    music_path: Path,
    music_volume: float = 0.32,
    *,
    audio_fade_in: float = 1.5,
    audio_fade_out: float = 2.0,
) -> None:
    apply_layout(layout)
    total = int(DURATION_S * FPS)
    max_diam = max(LAYOUT_REELS.camera_r, LAYOUT_YOUTUBE.camera_r) * 2
    face_frames = load_face_frames(FACE_VIDEO, total, max_diam, FPS) if FACE_VIDEO.exists() else None
    if face_frames:
        # Redimensionner par layout si diamètre caméra différent
        need_diam = layout.camera_r * 2
        if need_diam != max_diam:
            face_frames = [f.resize((need_diam, need_diam), Image.Resampling.LANCZOS) for f in face_frames]
    frames = generate_frames(brand, shots, intro, face_frames)
    tmp = out_path.with_suffix(".tmp.mp4")
    iio.imwrite(tmp, frames, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p")
    mux_audio_video(
        tmp,
        music_path,
        out_path,
        music_volume=music_volume,
        fade_in=audio_fade_in,
        fade_out=audio_fade_out,
    )
    tmp.unlink(missing_ok=True)
    print(f"{label}: {out_path} ({layout.width}x{layout.height}, 9:16, {len(frames)/FPS:.0f}s + audio)")


def main() -> None:
    brand = Image.open(ASSETS / BRAND_FILE).convert("RGBA")
    intro = Image.open(ASSETS / INTRO_FILE).convert("RGB")
    shots = [Image.open(ASSETS / s["image"]).convert("RGBA") for s in SLIDES]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_teleprompter()

    if FACE_VIDEO.exists():
        extract_source_audio(FACE_VIDEO, OUT_VOICE_20, DURATION_S)
        audio_path = OUT_VOICE_20
        audio_volume = 1.0
        audio_fade_in = 0.3
        audio_fade_out = 1.5
        print(f"Audio : voix source {FACE_VIDEO.name} -> {OUT_VOICE_20}")
    else:
        generate_promo_music(OUT_MUSIC_20, DURATION_S, mood="modern")
        audio_path = OUT_MUSIC_20
        audio_volume = 0.32
        audio_fade_in = 1.5
        audio_fade_out = 2.0

    export_video(
        brand, shots, intro, LAYOUT_REELS, OUT_REELS, "Reels / multi",
        audio_path, audio_volume, audio_fade_in=audio_fade_in, audio_fade_out=audio_fade_out,
    )
    export_video(
        brand, shots, intro, LAYOUT_YOUTUBE, OUT_YOUTUBE, "YouTube Short",
        audio_path, audio_volume, audio_fade_in=audio_fade_in, audio_fade_out=audio_fade_out,
    )


if __name__ == "__main__":
    main()
