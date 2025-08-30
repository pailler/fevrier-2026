# DragGAN - Module IAHome

## 🎨 Vue d'ensemble

DragGAN est un module révolutionnaire d'édition d'images par intelligence artificielle intégré à IAHome. Cet outil permet de modifier des images de manière interactive en déplaçant simplement des points sur l'image, l'IA recréant automatiquement l'image avec les modifications demandées.

## ✨ Fonctionnalités

### 🎯 Édition Interactive
- **Points de drag** : Cliquez et déplacez des points sur l'image
- **Prévisualisation temps réel** : Voir les modifications instantanément
- **Interface intuitive** : Interface Gradio moderne et responsive

### 🤖 Modèles Pré-entraînés
- **FFHQ** : Optimisé pour les portraits et visages
- **LSUN Car** : Pour les voitures et véhicules
- **LSUN Cat** : Pour les chats et animaux
- **LSUN Church** : Pour les bâtiments et architecture

### ⚡ Performance
- **Support GPU/CPU** : Détection automatique et optimisation
- **Traitement rapide** : Résultats en quelques secondes
- **Sauvegarde automatique** : Tous les résultats sont sauvegardés

### 🔧 Fonctionnalités Avancées
- **API REST** : Intégration facile avec d'autres applications
- **Documentation complète** : Guides détaillés et exemples
- **Support technique** : Assistance via Discord et email

## 🚀 Installation

### Prérequis
- Docker Desktop installé et démarré
- 4GB RAM minimum (8GB recommandé)
- GPU compatible CUDA (optionnel, améliore les performances)
- Connexion internet stable

### Installation Rapide

#### 1. Démarrage avec tous les services
```powershell
# Démarrer tous les services IAHome incluant DragGAN
.\start-all-services.ps1
```

#### 2. Démarrage DragGAN uniquement
```powershell
# Démarrer uniquement le service DragGAN
.\start-draggan.ps1
```

#### 3. Démarrage manuel
```bash
# Créer les répertoires nécessaires
mkdir -p docker-services/draggan/{models,outputs,uploads,cache}

# Construire et démarrer le service
docker-compose -f docker-services/docker-compose.services.yml up -d draggan
```

## 🌐 Accès

### URLs d'accès
- **Local** : http://localhost:8087
- **Production** : https://draggan.regispailler.fr

### Interface utilisateur
L'interface DragGAN est accessible via un navigateur web et propose :
- Zone de téléchargement d'images
- Sélection de modèles
- Interface d'édition interactive
- Prévisualisation des résultats
- Téléchargement des images modifiées

## 📖 Utilisation

### 1. Télécharger une image
- Cliquez sur la zone de téléchargement
- Sélectionnez une image (JPG, PNG, BMP, TIFF)
- L'image s'affiche dans l'interface

### 2. Sélectionner un modèle
- Choisissez le modèle approprié dans la liste déroulante
- FFHQ pour les portraits
- LSUN pour les scènes et objets

### 3. Définir les points de drag
- Cliquez sur l'image pour placer des points
- Déplacez les points pour indiquer les modifications souhaitées
- L'IA comprend automatiquement l'intention

### 4. Traiter l'image
- Cliquez sur "Traiter l'image"
- Attendez le traitement (quelques secondes)
- Visualisez le résultat

### 5. Télécharger le résultat
- Cliquez sur "Télécharger" pour sauvegarder l'image modifiée
- L'image est automatiquement sauvegardée sur le serveur

## 🔧 Configuration

### Variables d'environnement
```yaml
# docker-services/docker-compose.services.yml
environment:
  - PYTHONPATH=/app
  - GRADIO_SERVER_NAME=0.0.0.0
  - GRADIO_SERVER_PORT=7860
  - GRADIO_SHARE=false
  - GRADIO_ANALYTICS_ENABLED=false
```

### Volumes montés
```yaml
volumes:
  - ./draggan/models:/app/models      # Modèles pré-entraînés
  - ./draggan/outputs:/app/outputs    # Images générées
  - ./draggan/uploads:/app/uploads    # Images téléchargées
  - ./draggan/cache:/app/cache        # Cache des modèles
```

## 📁 Structure des fichiers

```
docker-services/draggan/
├── Dockerfile              # Configuration Docker
├── requirements.txt        # Dépendances Python
├── app.py                 # Application principale
├── utils.py               # Fonctions utilitaires
├── config.py              # Configuration
├── models/                # Modèles pré-entraînés
├── outputs/               # Images générées
├── uploads/               # Images téléchargées
└── cache/                 # Cache des modèles
```

## 🛠️ Développement

### Architecture
- **Backend** : Python 3.10 avec PyTorch
- **Interface** : Gradio pour l'interface web
- **Conteneurisation** : Docker avec multi-stage build
- **Réseau** : Intégration avec Traefik pour le reverse proxy

### Dépendances principales
```txt
torch>=1.12.0
gradio>=3.40.0
opencv-python>=4.5.0
numpy>=1.21.0
Pillow>=8.3.0
```

### Ajout de nouveaux modèles
1. Placez le fichier `.pkl` dans `docker-services/draggan/models/`
2. Redémarrez le service : `docker-compose restart draggan`
3. Le modèle apparaît automatiquement dans l'interface

## 🔍 Dépannage

### Problèmes courants

#### Service ne démarre pas
```bash
# Vérifier les logs
docker-compose -f docker-services/docker-compose.services.yml logs draggan

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

#### Modèles non trouvés
```bash
# Vérifier le contenu du dossier models
ls -la docker-services/draggan/models/

# Télécharger les modèles manuellement
wget -O models.zip "https://github.com/XingangPan/DragGAN/releases/download/v1.0/DragGAN_v1.0.zip"
unzip models.zip -d docker-services/draggan/models/
```

#### Performance lente
- Vérifiez que CUDA est disponible : `nvidia-smi`
- Augmentez la RAM allouée à Docker
- Utilisez des images de taille raisonnable (< 1024x1024)

### Logs et monitoring
```bash
# Voir les logs en temps réel
docker-compose -f docker-services/docker-compose.services.yml logs -f draggan

# Vérifier l'état du service
docker-compose -f docker-services/docker-compose.services.yml ps draggan

# Vérifier l'utilisation des ressources
docker stats draggan-service
```

## 📊 Métriques et monitoring

### Health check
Le service inclut un health check automatique :
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:7860/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Métriques disponibles
- Temps de traitement moyen
- Nombre d'images traitées
- Utilisation GPU/CPU
- Taux d'erreur
- Temps de réponse

## 🔒 Sécurité

### Mesures de sécurité
- **HTTPS** : Toutes les communications sont chiffrées
- **Rate limiting** : Limitation du nombre de requêtes
- **Validation des fichiers** : Vérification des types et tailles
- **Isolation** : Conteneurisation Docker
- **Authentification** : Intégration avec le système IAHome

### Bonnes pratiques
- Ne pas exposer le port 7860 directement
- Utiliser Traefik pour le reverse proxy
- Surveiller les logs pour détecter les abus
- Sauvegarder régulièrement les modèles

## 📚 Documentation

### Liens utiles
- [Documentation DragGAN officielle](https://github.com/XingangPan/DragGAN)
- [Documentation Gradio](https://gradio.app/docs/)
- [Documentation PyTorch](https://pytorch.org/docs/)
- [Communauté IAHome Discord](https://discord.gg/iahome)

### Formation
- **Formation DragGAN** : https://iahome.fr/formations/draggan
- **Tutoriels vidéo** : Disponibles sur la chaîne IAHome
- **Exemples pratiques** : Dans la documentation

## 🤝 Contribution

### Comment contribuer
1. Fork le repository IAHome
2. Créez une branche pour votre fonctionnalité
3. Développez et testez votre modification
4. Soumettez une pull request

### Standards de code
- Python : PEP 8
- Documentation : Docstrings en français
- Tests : Coverage > 80%
- Logs : Niveau INFO minimum

## 📄 Licence

Ce module est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

### Canaux de support
- **Email** : support@iahome.fr
- **Discord** : https://discord.gg/iahome
- **Documentation** : https://draggan.regispailler.fr/docs
- **Issues GitHub** : https://github.com/iahome/draggan/issues

### Niveaux de support
- **Gratuit** : Documentation et communauté
- **Premium** : Support prioritaire et assistance personnalisée
- **Entreprise** : Support dédié et SLA

---

**IAHome Team** - Révolutionner l'édition d'images avec l'IA
