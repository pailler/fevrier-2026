# Service TTS iahome — Coqui XTTS v2

Synthèse vocale multilingue open source, interface type [TTV Pro](https://texttovoicepro.com/fr/tts).

## Fonctionnalités

- Saisie de texte (max 1500 caractères)
- 17 langues (FR, EN, ES, DE, IT, …)
- Voix prédéfinies Coqui + clonage vocal (upload WAV)
- Contrôles vitesse et hauteur
- Export WAV 44,1 kHz et MP3

## Démarrage rapide

```powershell
cd tts-service
.\start.ps1
```

Puis ouvrir **http://localhost:8101**

## Prérequis

- Docker Desktop
- ~4 Go RAM minimum (8 Go recommandé)
- Premier lancement : téléchargement du modèle XTTS v2 (~1.8 Go)

## Licence

Le modèle XTTS v2 est sous [Coqui Public Model License](https://coqui.ai/cpml).
La variable `COQUI_TOS_AGREED=1` est définie dans Docker pour un démarrage non interactif.

## GPU (optionnel)

Pour activer CUDA, modifiez le `Dockerfile` pour installer PyTorch CUDA et ajoutez dans `docker-compose.yml` :

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```
