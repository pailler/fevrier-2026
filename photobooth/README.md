# Photobooth

Application web photobooth inspiree d'une experience event moderne:

- Deux pages distinctes:
  - `index.html`: gestion des evenements (creer/rejoindre)
  - `studio.html`: photobooth responsive
- `gallery.html`: galerie partageable par evenement
- Hero "Photobooth Mariage" + ambiance festive/mariage
- PIN a 4 chiffres pour ouvrir une session
- Studio photo complet:
  - camera live
  - countdown
  - templates (single, strip, collage)
  - filtres
  - props digitaux
  - galerie locale
  - export PNG
- QR code automatique vers la galerie evenement
- Acces par token `?token=...` (workflow IAHome)

## Lancer en local (sans Docker)

Depuis le dossier `photobooth`:

```powershell
python -m http.server 7885
```

Puis ouvrir `http://localhost:7885`.

Autoriser l'acces camera dans le navigateur.

## Lancer avec Docker

Depuis le dossier `photobooth`:

```powershell
docker compose up -d --build
```

Puis ouvrir `http://localhost:7885`.

## Stockage des photos (dossiers separes par evenement)

Les photos sont stockees sur disque dans:

- `photobooth/storage/events/<eventId>/photos/`

Chaque evenement a son propre dossier `<eventId>`.
Un index des evenements est stocke dans:

- `photobooth/storage/events-index.json`

Avec Docker, ce stockage est persiste via volume:

- `./storage:/app/storage`

## Arreter Docker

```powershell
docker compose down
```
