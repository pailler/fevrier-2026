# Référence — animation & timing

## Constantes vidéo

| Paramètre | Valeur |
|-----------|--------|
| Résolution | 1088 × 1920 (9:16) |
| Durée | 20 s |
| FPS | 30 |
| Total frames | 600 |

## Timeline frame par frame

| Frame | Seconde | Événement |
|-------|---------|-----------|
| 0 | 0,0 | Fond dégradé + grille tech |
| 60 | 2,0 | Début fade-in titre (opacity 0 → 1 sur 90 frames) |
| 150 | 5,0 | Titre stable ; app 1 commence cascade |
| 160 | 5,33 | App 2 (décalage +10 frames ≈ 0,33s) |
| 170 | 5,67 | App 3 |
| 180 | 6,0 | App 4 |
| 420 | 14,0 | Transition fondu vers écran CTA (15 frames) |
| 435 | 14,5 | Bouton « Se connecter » visible, pulse actif |
| 600 | 20,0 | Fin |

## Courbes d'animation

**Fade-in titre** : `opacity = ease_out_cubic(t)` sur 3 s (t ∈ [0, 1]).

**Cascade app i** (i = 0…3) :
- `start = 150 + i * 10` frames
- `translate_y = 80 * (1 - ease_out_back(local_t))` px
- `opacity = clamp((local_t - 0.1) / 0.4, 0, 1)`

**Pulse CTA** (frames ≥ 435) :
- `scale = 1 + 0.08 * sin(2π * frame / 45)`
- Halo : ellipse externe, alpha `40 + 20 * sin(...)`

## Musique

Mood `modern` via `generate_promo_music(..., mood="modern")` :
- 96 BPM, pads G majeur, marimba légère
- Volume mux : 0,32 (ajuster dans `export_video`)

## Checklist qualité mobile

- Titre ≥ 52 px bold, lisible sur fond sombre
- Icônes apps ≥ 72 px
- Bouton CTA hauteur ≥ 96 px, contraste blanc sur dégradé
- Texte CTA secondaire « iahome.fr » sous le bouton
