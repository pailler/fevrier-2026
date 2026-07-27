---
name: iahome-login-promo-video
description: Creates vertical 9:16 20-second IAHome promo videos with modern tech/SaaS blue-violet styling to drive login. Sequence title fade-in, cascading app icons, pulsing Se connecter CTA. Use when the user asks for login promo videos, vertical reels, Shorts, connexion CTAs, or app showcase videos for iahome.fr.
---

# Vidéo promo connexion IAHome (9:16, 20s)

## Brief créatif

Crée une vidéo verticale 9:16 de 20 secondes pour inciter les visiteurs à se connecter sur ma plateforme. Style tech/SaaS moderne, tons bleu-violet. Séquence : titre accrocheur en fade-in, puis 3-4 apps qui apparaissent en cascade avec leurs icônes, puis un bouton 'Se connecter' qui pulse en fin de vidéo.

## Quick start

1. **Personnaliser** le titre et les apps dans `scripts/create-login-promo-video.py` (`TITLE`, `APPS`, `CTA_LABEL`).
2. **Générer** :
   ```bash
   python scripts/create-login-promo-video.py
   ```
3. **Vérifier** les exports dans `public/videos/` :
   - `iahome-login-promo-20s.mp4` (1088×1920, Reels/Shorts)
   - `music-login-promo-20s.wav` (piste libre de droits)

## Storyboard (20s @ 30 fps)

| Phase | Durée | Contenu |
|-------|-------|---------|
| Fond | 0–20s | Dégradé bleu nuit → violet, particules/grille tech légère |
| Titre | 2–5s | Titre accrocheur fade-in + sous-titre iahome.fr |
| Apps | 5–14s | 3–4 cartes en cascade (slide-up + fade, décalage 0,35s) |
| CTA | 14–20s | Logo, bouton « Se connecter » pulsant, URL iahome.fr |

## Palette IAHome

| Rôle | Hex | RGB |
|------|-----|-----|
| Fond haut | `#0f172a` | 15, 23, 42 |
| Fond bas | `#312e81` | 49, 46, 129 |
| Accent bleu | `#667eea` | 102, 126, 234 |
| Accent violet | `#764ba2` | 118, 75, 162 |
| Texte | `#f8fafc` | 248, 250, 252 |
| Bouton CTA | dégradé bleu → violet | — |

Logo : `public/iahome-logo.svg` (convertir en PNG si besoin via Pillow/cairosvg).

## Personnalisation

### Titre accrocheur (exemples)

- « Vos apps IA, un seul compte »
- « Tout l'écosystème IAHome, connecté »
- « 40+ outils. Une connexion. »

### Apps en cascade

Chaque entrée dans `APPS` :

```python
{"name": "Photobooth", "icon": "📸", "tag": "Événements & selfies"}
```

Prioriser 3–4 apps visibles sur iahome.fr (essentiels ou applications IA). Emojis OK ; pour une icône PNG/SVG, ajouter `"icon_path": "public/images/..."`.

### Bouton CTA

Texte par défaut : **Se connecter**. Animation : scale 1,0 → 1,08 + halo pulsant (sinusoïde).

## Dépendances

Réutilise l'infra promo existante :

- `scripts/promo_music.py` — musique + mux ffmpeg
- `Pillow`, `numpy`, `imageio`, `scipy` (même stack que `create-qrcodes-promo-video.py`)

Installer si manquant :

```bash
pip install pillow numpy imageio imageio-ffmpeg scipy
```

## Workflow agent

```
Task Progress:
- [ ] Lire TITLE / APPS / CTA dans le script ou les adapter selon la demande
- [ ] Vérifier que les icônes/assets existent
- [ ] Exécuter python scripts/create-login-promo-video.py
- [ ] Contrôler durée (20s), ratio (9:16), lisibilité mobile du titre et du CTA
- [ ] Livrer le chemin MP4 + résumé du storyboard
```

## Exports & diffusion

| Fichier | Usage |
|---------|-------|
| `iahome-login-promo-20s.mp4` | Instagram Reels, TikTok, YouTube Shorts |
| `music-login-promo-20s.wav` | Piste seule (montage externe) |

Upload Shorts/Reels : 1088×1920, H.264, AAC 192k (généré automatiquement).

## Réutiliser vs créer

- **Même format connexion/apps** → modifier `scripts/create-login-promo-video.py`
- **Promo QR codes (slides + téléprompter)** → `scripts/create-qrcodes-promo-video.py`
- **Format horizontal 45s** → `scripts/create-qrcodes-promo-horizontal.py`

## Additional resources

- Timing détaillé et courbes d'animation : [reference.md](reference.md)
