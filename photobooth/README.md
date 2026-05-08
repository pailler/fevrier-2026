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
- **Son du compte à rebours** : placez `countdown.mp3` dans `sounds/` pour un décompte audio festif (voir `sounds/README.md`)

## Lancer en local (sans Docker)

Depuis le dossier `photobooth`:

```powershell
npm install
npm start
```

Le serveur Express ecoute le port **7885** par defaut (variable d'environnement `PHOTOBOOTH_PORT`) — le **3050** local est reserve au compte rendu (Meeting Reports).

Puis ouvrir `http://localhost:7885`.

Autoriser l'acces camera dans le navigateur.

## Lancer avec Docker

Depuis le dossier `photobooth`:

```powershell
docker compose up -d --build
```

Puis ouvrir `http://localhost:7885` (même port qu’en local hors Docker, pour ne pas empieter sur le compte rendu en **3050**).

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
