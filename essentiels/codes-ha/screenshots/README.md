# Dossier Screenshots

Ce dossier contient les captures d'écran des codes Home Assistant.

## Comment ajouter une capture d'écran

1. Prenez une capture d'écran de votre carte Home Assistant
2. Nommez le fichier avec l'ID du code correspondant (ex: `banner-meteo.png`)
3. Placez le fichier dans ce dossier
4. Ajoutez le champ `screenshot` dans le fichier `codes-cartes.json` :

```json
{
  "id": "banner-meteo",
  "name": "Banner Card Météo",
  "description": "Bannière avec image de fond pour la section météo",
  "tags": ["banner", "météo", "image"],
  "screenshot": "banner-meteo.png",
  "code": "..."
}
```

## Formats supportés

- PNG (recommandé)
- JPG/JPEG
- WebP

## Taille recommandée

- Largeur : 800-1200px
- Format : Paysage (16:9 ou 4:3)
- Poids : < 500KB pour un chargement rapide

## Exemple de nommage

- `banner-meteo.png` pour le code avec l'ID `banner-meteo`
- `button-simple.jpg` pour le code avec l'ID `button-simple`
- `weather-chart.png` pour le code avec l'ID `weather-chart`


