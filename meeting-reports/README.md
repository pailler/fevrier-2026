# Meeting Reports Generator

Application open source pour la génération automatique de comptes-rendus de réunions utilisant Whisper (transcription) + LangChain (IA).

## 🚀 Fonctionnalités

- **Transcription automatique** : Utilise Whisper pour transcrire les fichiers audio
- **Génération de rapports** : LangChain génère des résumés, points clés et éléments d'action
- **Interface web moderne** : React avec Tailwind CSS
- **API REST** : Backend FastAPI avec documentation automatique
- **Docker** : Déploiement facile avec Docker Compose
- **Multi-format** : Support WAV, MP3, M4A, WEBM, OGG

## 📋 Prérequis

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optionnel)
- Clé API OpenAI

## 🛠️ Installation

### Option 1 : Installation locale

1. **Cloner le projet**
   ```bash
   cd meeting-reports
   ```

2. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp env.example .env
   # Éditer .env avec votre clé API OpenAI
   ```

3. **Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Option 2 : Docker

1. **Configuration**
   ```bash
   cp backend/env.example .env
   # Éditer .env avec votre clé API OpenAI
   ```

2. **Démarrage**
   ```bash
   docker-compose up -d
   ```

## 🚀 Démarrage

### Mode développement

1. **Backend** (Terminal 1)
   ```bash
   cd backend
   python start.py
   ```

2. **Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```

### Mode production

```bash
docker-compose up -d
```

## 📖 Utilisation

1. **Accéder à l'application**
   - Interface web : http://localhost:3001
   - API : http://localhost:8000
   - Documentation API : http://localhost:8000/docs

2. **Uploader un fichier audio**
   - Glissez-déposez ou sélectionnez un fichier audio
   - Formats supportés : WAV, MP3, M4A, WEBM, OGG
   - Taille maximale : 100 MB

3. **Consulter les rapports**
   - Liste des rapports générés
   - Visualisation détaillée
   - Téléchargement en Markdown
   - Copie des sections

## 🔧 Configuration

### Variables d'environnement

```env
# Obligatoire
OPENAI_API_KEY=your_openai_api_key_here

# Optionnel
DATABASE_URL=postgresql://user:password@localhost/meeting_reports
REDIS_URL=redis://localhost:6379
HOST=0.0.0.0
PORT=8000
DEBUG=True
MAX_FILE_SIZE=100MB
ALLOWED_EXTENSIONS=wav,mp3,m4a,webm,ogg
```

### Personnalisation des prompts

Modifiez les prompts dans `backend/main.py` :

```python
summary_prompt = PromptTemplate(
    input_variables=["text"],
    template="""
    Votre prompt personnalisé ici...
    """
)
```

## 📁 Structure du projet

```
meeting-reports/
├── backend/                 # API FastAPI
│   ├── main.py             # Application principale
│   ├── start.py            # Script de démarrage
│   ├── requirements.txt    # Dépendances Python
│   ├── Dockerfile          # Image Docker backend
│   └── env.example         # Variables d'environnement
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── App.js          # Application principale
│   │   └── index.js        # Point d'entrée
│   ├── package.json        # Dépendances Node.js
│   ├── Dockerfile          # Image Docker frontend
│   └── nginx.conf          # Configuration Nginx
├── nginx/                  # Configuration Nginx
├── uploads/                # Fichiers audio uploadés
├── reports/                # Rapports générés
├── docker-compose.yml      # Orchestration Docker
└── README.md              # Documentation
```

## 🔌 API Endpoints

### Upload
- `POST /upload` - Uploader un fichier audio
- `POST /process/{file_id}` - Démarrer le traitement

### Rapports
- `GET /reports` - Liste des rapports
- `GET /report/{file_id}` - Détails d'un rapport
- `DELETE /report/{file_id}` - Supprimer un rapport

### Statut
- `GET /status/{file_id}` - Statut du traitement
- `GET /health` - Santé de l'API

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de clé API OpenAI**
   ```
   Solution : Vérifiez que OPENAI_API_KEY est définie dans .env
   ```

2. **Erreur de port déjà utilisé**
   ```
   Solution : Changez les ports dans docker-compose.yml ou arrêtez les services
   ```

3. **Erreur de mémoire insuffisante**
   ```
   Solution : Augmentez la mémoire Docker ou utilisez un modèle Whisper plus petit
   ```

### Logs

```bash
# Docker
docker-compose logs -f

# Backend local
cd backend && python start.py

# Frontend local
cd frontend && npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [OpenAI Whisper](https://github.com/openai/whisper) pour la transcription
- [LangChain](https://github.com/langchain-ai/langchain) pour l'IA
- [FastAPI](https://fastapi.tiangolo.com/) pour l'API
- [React](https://reactjs.org/) pour l'interface
- [Tailwind CSS](https://tailwindcss.com/) pour le styling

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation API : http://localhost:8000/docs
- Vérifiez les logs pour plus d'informations
