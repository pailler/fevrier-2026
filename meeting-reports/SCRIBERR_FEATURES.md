# Fonctionnalités Scriberr Intégrées

Ce document décrit les fonctionnalités inspirées de [Scriberr.app](https://scriberr.app/) qui ont été intégrées dans le projet Meeting Reports Generator.

## 🎯 Fonctionnalités Ajoutées

### 1. Diarisation des Locuteurs
- **Identification automatique des locuteurs** dans les enregistrements audio
- **Statistiques de temps de parole** par locuteur
- **Visualisation des segments** avec codes couleur
- **Support pyannote.audio** pour une diarisation précise

### 2. Chat avec les Transcripts
- **Interface de chat interactive** avec l'IA
- **Questions suggérées** générées automatiquement
- **Historique des conversations** persistantes
- **Réponses contextuelles** basées sur la transcription complète

### 3. Annotations et Marqueurs
- **Marqueurs temporels** pour marquer des moments importants
- **Surlignage de sections** avec différents types
- **Éléments d'action** avec assignation et priorité
- **Système d'annotations** complet et flexible

### 4. Interface Utilisateur Améliorée
- **Composant SpeakerInfo** pour l'analyse des locuteurs
- **Composant TranscriptChat** pour l'interaction avec l'IA
- **Intégration transparente** dans l'interface existante
- **Design responsive** et moderne

## 🚀 Installation et Configuration

### Prérequis
```bash
# Installer les nouvelles dépendances
pip install pyannote.audio pyannote.core torch torchaudio speechrecognition pydub
```

### Configuration Hugging Face
1. Créez un compte sur [Hugging Face](https://huggingface.co/)
2. Générez un token d'accès dans [vos paramètres](https://huggingface.co/settings/tokens)
3. Ajoutez le token dans `backend/config.env` :
```env
HUGGINGFACE_TOKEN=votre_token_ici
```

## 📡 API Endpoints

### Diarisation des Locuteurs
```http
POST /api/diarize-speakers/{file_id}
```
Retourne les segments de locuteurs et les statistiques.

### Chat avec les Transcripts
```http
POST /api/chat/create-session/{file_id}
POST /api/chat/send-message
GET /api/chat/history/{session_id}
```

### Annotations
```http
POST /api/annotations/add/{file_id}
GET /api/annotations/{file_id}
PUT /api/annotations/{file_id}/{annotation_id}
DELETE /api/annotations/{file_id}/{annotation_id}
POST /api/annotations/timestamp-marker/{file_id}
POST /api/annotations/highlight/{file_id}
POST /api/annotations/action-item/{file_id}
```

## 🎨 Utilisation

### 1. Analyse des Locuteurs
- Ouvrez un rapport de réunion
- Le composant `SpeakerInfo` s'affiche automatiquement
- Cliquez sur "Détails" pour voir les statistiques complètes

### 2. Chat avec l'IA
- Cliquez sur l'icône de chat en bas à droite
- Posez des questions sur la transcription
- Utilisez les questions suggérées pour commencer

### 3. Annotations
- Utilisez l'API pour ajouter des annotations
- Créez des marqueurs temporels
- Surlignez des sections importantes
- Gérez les éléments d'action

## 🔧 Architecture Technique

### Backend
- **`speaker_diarization.py`** : Module de diarisation des locuteurs
- **`transcript_chat.py`** : Module de chat avec l'IA
- **`transcript_annotations.py`** : Module de gestion des annotations
- **`main-simple.py`** : Endpoints API intégrés

### Frontend
- **`TranscriptChat.js`** : Interface de chat
- **`SpeakerInfo.js`** : Affichage des informations des locuteurs
- **`ReportViewer.js`** : Intégration des nouveaux composants

## 🎯 Fonctionnalités Avancées

### Diarisation Intelligente
- Utilise le modèle `pyannote/speaker-diarization-3.1`
- Calcul automatique des statistiques de temps de parole
- Support des enregistrements multi-locuteurs

### Chat Contextuel
- Contexte complet de la transcription
- Questions suggérées intelligentes
- Historique persistant des sessions

### Annotations Flexibles
- Types d'annotations personnalisables
- Marqueurs temporels précis
- Système de priorités pour les actions

## 🚀 Améliorations Futures

- [ ] Synchronisation audio-transcription
- [ ] Export des annotations
- [ ] Collaboration en temps réel
- [ ] Modèles de résumé personnalisables
- [ ] Intégration avec d'autres outils

## 📚 Ressources

- [Scriberr.app](https://scriberr.app/) - Application originale
- [pyannote.audio](https://github.com/pyannote/pyannote-audio) - Bibliothèque de diarisation
- [OpenAI API](https://platform.openai.com/) - API d'IA
- [Hugging Face](https://huggingface.co/) - Modèles de ML

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Optimiser les performances


















































