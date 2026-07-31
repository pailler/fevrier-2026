"""Constantes et helpers partagés — promos vidéo IAHome QR codes."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(r"C:\Users\AAA\.cursor\projects\c-Users-AAA-Documents-iahome\assets")
ACCENT_GREEN = (34, 197, 94)
ACCENT_VIOLET = (102, 126, 234)
BRAND_FILE = (
    "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "logo-0226b44d-9576-484c-93db-bf825fa2b97e.png"
)
INTRO_FILE = (
    "c__Users_AAA_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "qrcodes-3433ba38-1db5-4b46-8db3-da01b83897a4.png"
)
INTRO_S = 3
INTRO_S_SHORT = 4
HEADER_BG = (12, 22, 38)

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


def fit_cover(img: Image.Image, tw: int, th: int) -> Image.Image:
    """Remplit le cadre (crop centré) — idéal pour intro plein écran."""
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def render_intro(intro: Image.Image, tw: int, th: int, t: float, *, fit: str = "cover") -> Image.Image:
    """Intro plein cadre avec léger Ken Burns (t ∈ [0, 1]).

    fit=\"cover\"  — remplit le cadre (horizontal)
    fit=\"contain\" — montre l'image entière (shorts verticaux)
    """
    if fit == "contain":
        zoom = 1.0 + 0.02 * (1.0 - t)
        scale = min(tw / intro.width, th / intro.height) * zoom
        nw, nh = int(intro.width * scale), int(intro.height * scale)
        resized = intro.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (tw, th), (12, 18, 28))
        canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
        return canvas

    zoom = 1.0 + 0.08 * t
    scale = max(tw / intro.width, th / intro.height) * zoom
    nw, nh = int(intro.width * scale), int(intro.height * scale)
    resized = intro.resize((nw, nh), Image.Resampling.LANCZOS)
    pan_x = int((nw - tw) * 0.4 * t)
    left = max(0, min(nw - tw, (nw - tw) // 2 + pan_x))
    top = (nh - th) // 2
    frame = resized.crop((left, top, left + tw, top + th))
    return frame.convert("RGB")


def fit_screen(img: Image.Image, tw: int, th: int, fill: tuple[int, int, int]) -> Image.Image:
    scale = tw / img.width
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (tw, th), (*fill, 255))
    if nh >= th:
        top = (nh - th) // 2
        canvas.paste(resized.crop((0, top, nw, top + th)), (0, 0), resized)
    else:
        canvas.paste(resized, (0, (th - nh) // 2), resized)
    return canvas


# --- Face cam (découpe visage depuis qrcodes.mkv) ---
FACE_CROP_CY = 380
FACE_CROP_SIZE = 520
FACE_BG = (15, 23, 42)


def key_green_screen(img: Image.Image, bg: tuple[int, int, int] = FACE_BG) -> Image.Image:
    """Remplace le fond vert (chroma) par la couleur pied de page."""
    arr = np.array(img.convert("RGB"), dtype=np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    green = (g > 95) & (g > r + 22) & (g > b + 22)
    arr[green] = bg
    return Image.fromarray(arr.astype(np.uint8))


def crop_face_square(frame: np.ndarray, crop_cy: int = FACE_CROP_CY, crop_size: int = FACE_CROP_SIZE) -> Image.Image:
    """Découpe carrée centrée sur le visage (source paysage 1920×1080)."""
    img = Image.fromarray(frame).convert("RGB")
    w, _h = img.size
    cx = w // 2
    left = max(0, cx - crop_size // 2)
    top = max(0, crop_cy - crop_size // 2)
    crop = img.crop((left, top, min(w, left + crop_size), min(img.height, top + crop_size)))
    sq = Image.new("RGB", (crop_size, crop_size), FACE_BG)
    sq.paste(crop, ((crop_size - crop.width) // 2, (crop_size - crop.height) // 2))
    return key_green_screen(sq)


def face_circle(img: Image.Image, diameter: int) -> Image.Image:
    """Redimensionne et masque circulaire (RGBA)."""
    face = img.resize((diameter, diameter), Image.Resampling.LANCZOS)
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter - 1, diameter - 1), fill=255)
    out = Image.new("RGBA", (diameter, diameter), (*FACE_BG, 255))
    out.paste(face, (0, 0), mask)
    return out


def load_face_frames(
    video_path: Path,
    total_frames: int,
    diameter: int,
    out_fps: int = 30,
    *,
    crop_cy: int = FACE_CROP_CY,
    crop_size: int = FACE_CROP_SIZE,
) -> list[Image.Image]:
    """Extrait les frames visage synchronisées à la promo (premiers ~25 s de source)."""
    import imageio

    if not video_path.exists():
        return []

    reader = imageio.get_reader(str(video_path))
    meta = reader.get_meta_data()
    src_fps = float(meta.get("fps") or 60.0)
    step = src_fps / out_fps

    faces: list[Image.Image] = []
    src_pos = 0.0
    buf_idx = 0
    current: np.ndarray | None = None
    frame_iter = reader.iter_data()

    print(f"Face cam : {video_path.name} -> {total_frames} frames @ {out_fps} fps")
    for fi in range(total_frames):
        target = int(src_pos)
        while buf_idx <= target:
            try:
                current = next(frame_iter)
                buf_idx += 1
            except StopIteration:
                break
        if current is not None:
            sq = crop_face_square(current, crop_cy, crop_size)
            faces.append(face_circle(sq, diameter))
        src_pos += step
        if fi and fi % 120 == 0:
            print(f"  {fi}/{total_frames}")

    reader.close()
    return faces
