# 🎬 Animation de Photos Réaliste

Application d'animation de photos utilisant l'intelligence artificielle pour créer des animations réalistes à partir de photos statiques.

## 📋 Description

Cette application permet d'animer des photos de façon réaliste en utilisant des modèles d'IA disponibles sur Hugging Face. Elle utilise des techniques avancées de génération d'images pour créer des animations naturelles et fluides.

## 🚀 Fonctionnalités

- ✨ Animation réaliste de photos
- 🎛️ Contrôle du type d'animation (subtle, moderate, strong)
- ⚙️ Réglage de la force de l'animation
- 🖼️ Interface intuitive avec Gradio
- 🎨 Post-traitement pour améliorer la qualité

## 📦 Installation

### Prérequis

- Python 3.8 ou supérieur
- CUDA (optionnel, pour l'accélération GPU)
- 8GB+ de RAM (16GB+ recommandé)

### Installation des dépendances

```bash
pip install -r requirements.txt
```

## 🎯 Utilisation

### Lancement local

```bash
python app.py
```

L'application sera accessible sur `http://localhost:7887`

### Utilisation

1. Téléchargez une photo que vous souhaitez animer
2. Choisissez le type d'animation :
   - **Subtle** : Mouvement léger et naturel
   - **Moderate** : Mouvement modéré
   - **Strong** : Mouvement prononcé
3. Ajustez la force de l'animation (0.1 à 1.0)
4. Cliquez sur "✨ Animer la photo"
5. Téléchargez le résultat

## 🐳 Déploiement sur Hugging Face Spaces

Pour déployer cette application sur Hugging Face Spaces :

1. Créez un nouveau Space sur [Hugging Face](https://huggingface.co/spaces)
2. Sélectionnez "Gradio" comme SDK
3. Uploadez tous les fichiers de ce dossier
4. L'application sera automatiquement déployée

### Structure pour Hugging Face Spaces

```
photo-animation/
├── app.py              # Application principale
├── requirements.txt    # Dépendances
├── README.md          # Documentation
└── .gitignore         # Fichiers à ignorer
```

## 🔧 Configuration

### Modèle utilisé

Par défaut, l'application utilise `runwayml/stable-diffusion-v1-5`. Vous pouvez modifier le modèle dans `app.py` :

```python
MODEL_ID = "votre-modele-huggingface"
```

### Modèles recommandés pour l'animation

- `runwayml/stable-diffusion-v1-5` (par défaut)
- `stabilityai/stable-diffusion-2-1`
- Modèles AnimateDiff (pour animations vidéo)

## 📝 Notes

- La première exécution peut prendre du temps pour télécharger le modèle
- L'utilisation du GPU accélère significativement le traitement
- Les images sont automatiquement redimensionnées pour optimiser la mémoire

## 🛠️ Développement

### Améliorations futures

- [ ] Support pour animations vidéo (GIF/MP4)
- [ ] Plus de types d'animations
- [ ] Animation basée sur des prompts textuels
- [ ] Support pour batch processing
- [ ] Intégration avec d'autres modèles d'animation

## 📄 Licence

Ce projet est open source et disponible sous licence MIT.

## 🙏 Remerciements

- Hugging Face pour les modèles et l'infrastructure
- Gradio pour l'interface utilisateur
- La communauté open source

## 📧 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub.
