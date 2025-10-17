# 🚀 Guide de démarrage rapide

## Installation en 3 étapes

### 1. Configuration
```bash
cd meeting-reports
cp env.example .env
# Éditer .env avec votre clé API OpenAI
```

### 2. Installation des dépendances
```bash
# Windows
.\start.ps1 install

# Linux/Mac
./start.sh install
```

### 3. Démarrage
```bash
# Mode développement
.\start.ps1 dev    # Windows
./start.sh dev     # Linux/Mac

# Ou avec Docker
.\start.ps1 docker # Windows
./start.sh docker  # Linux/Mac
```

## 🌐 Accès à l'application

- **Interface web** : http://localhost:3001
- **API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

## 📝 Utilisation

1. **Uploader un fichier audio** (WAV, MP3, M4A, WEBM, OGG)
2. **Attendre le traitement** (quelques minutes)
3. **Consulter le rapport** généré automatiquement

## ⚠️ Prérequis

- Python 3.11+ (mode dev)
- Node.js 18+ (mode dev)
- Docker & Docker Compose (mode docker)
- Clé API OpenAI (obligatoire)

## 🆘 Problèmes courants

### Erreur de clé API
```
Solution : Vérifiez que OPENAI_API_KEY est définie dans .env
```

### Port déjà utilisé
```
Solution : Arrêtez les services ou changez les ports
```

### Mémoire insuffisante
```
Solution : Augmentez la mémoire Docker ou utilisez un modèle Whisper plus petit
```

## 📞 Support

- Documentation complète : `README.md`
- API docs : http://localhost:8000/docs
- Logs : `docker-compose logs -f` (mode Docker)
