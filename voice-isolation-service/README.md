# 🎤 Application d'Isolation Vocale par IA

Application basée sur **Demucs v4** et **Gradio** pour isoler la voix et séparer les sources audio, similaire à [Hugging Face Spaces - Music Separation](https://huggingface.co/spaces/abidlabs/music-separation).

## 🚀 Fonctionnalités

- 🎤 **Isolation vocale** : Extrait uniquement la voix d'un enregistrement
- 🥁 **Isolation de batterie** : Sépare la batterie du reste
- 🎸 **Isolation de basse** : Extrait la ligne de basse
- 🎹 **Autres instruments** : Isole les autres instruments (guitares, synthés, etc.)
- 🎵 **Séparation complète** : Extrait toutes les sources en une fois

## 📋 Prérequis

- Docker et Docker Compose
- Python 3.11+ (pour développement local)
- GPU recommandé (CUDA) pour de meilleures performances

## 🔧 Installation

### 1. Démarrer le service

```powershell
cd voice-isolation-service
.\start.ps1
```

Le service sera accessible sur `http://localhost:8100`

### 2. Accéder à l'application

- **Directement** : http://localhost:8100
- **Via Next.js** : http://localhost:3000/voice-isolation

## 🐳 Déploiement Docker

### Construction de l'image

```bash
docker-compose build
```

### Démarrage du service

```bash
docker-compose up -d
```

### Arrêt du service

```bash
docker-compose down
```

Ou utiliser le script PowerShell :

```powershell
.\stop.ps1
```

## 📊 Architecture

```
voice-isolation-service/
├── app.py                 # Application Gradio principale
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Configuration Docker
├── docker-compose.yml    # Configuration Docker Compose
├── start.ps1            # Script de démarrage
├── stop.ps1             # Script d'arrêt
└── README.md            # Documentation
```

## 🔌 Intégration Next.js

L'application est intégrée dans Next.js via :

- **Page** : `/src/app/voice-isolation/page.tsx`
- **API Proxy** : `/src/app/api/voice-isolation-proxy/[...path]/route.ts`

## ⚙️ Configuration

### Variables d'environnement

- `VOICE_ISOLATION_URL` : URL du service (défaut: `http://localhost:8100`)
- `CUDA_VISIBLE_DEVICES` : Device GPU à utiliser (défaut: `0`)

### Ports

- **Gradio** : 7860 (interne) → 8100 (externe)

## 🎯 Utilisation

1. **Uploader un fichier audio** (MP3, WAV, M4A, OGG, FLAC)
2. **Choisir la source à extraire** :
   - 🎤 Voix uniquement
   - 🥁 Batterie uniquement
   - 🎸 Basse uniquement
   - 🎹 Autres instruments
   - 🎵 Toutes les sources
3. **Cliquer sur "Séparer les sources"**
4. **Télécharger le résultat**

## 🔍 Dépannage

### Le modèle ne charge pas

- Vérifier les logs : `docker logs voice-isolation-service`
- Le modèle peut prendre 2-3 minutes à charger au premier démarrage
- Vérifier l'espace disque disponible (le modèle fait ~1.5GB)

### Erreur CUDA

- Si pas de GPU, le service utilisera automatiquement le CPU
- Pour forcer le CPU, modifier `CUDA_VISIBLE_DEVICES=""` dans docker-compose.yml

### Service non accessible

- Vérifier que le port 8100 n'est pas utilisé
- Vérifier les réseaux Docker : `docker network ls`
- Vérifier les logs : `docker logs voice-isolation-service`

## 📚 Technologies

- **Gradio** : Interface utilisateur web
- **Demucs v4** : Modèle de séparation de sources audio
- **PyTorch** : Framework d'apprentissage automatique
- **TorchAudio** : Traitement audio

## 🔗 Références

- [Demucs GitHub](https://github.com/facebookresearch/demucs)
- [Hugging Face Spaces - Music Separation](https://huggingface.co/spaces/abidlabs/music-separation)
- [Gradio Documentation](https://gradio.app/docs/)

## 📝 Notes

- Le traitement peut prendre plusieurs minutes selon la longueur du fichier
- Les fichiers temporaires sont automatiquement nettoyés
- Pour de meilleures performances, utilisez un GPU avec CUDA
