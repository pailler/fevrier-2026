# 🎨 ESRGAN Image Upscaler - Application Web

Application web autonome pour l'upscaling d'images haute qualité avec ESRGAN (Enhanced Super-Resolution Generative Adversarial Network).

## 📋 Description

Cette application permet d'upscaler des images avec un facteur d'agrandissement de 4x en utilisant des modèles ESRGAN pré-entraînés. Elle utilise les modèles existants dans votre installation StabilityMatrix sans nécessiter de téléchargement supplémentaire.

## 🚀 Démarrage Rapide

### Prérequis

- Python 3.8 ou supérieur
- PyTorch (installé automatiquement avec les dépendances)
- Modèles ESRGAN dans StabilityMatrix (déjà présents)

### Installation

1. **Installer les dépendances** :
```powershell
pip install -r requirements.txt
```

2. **Démarrer l'application** :
```powershell
.\start.ps1
```

Ou manuellement :
```powershell
python app.py
```

L'application trouvera automatiquement un port libre (commence à 8888) et démarrera le serveur web.

### Accès à l'application

Une fois démarrée, ouvrez votre navigateur et accédez à :
```
http://localhost:[PORT]
```

Le port sera affiché dans la console au démarrage.

## 🎯 Cas d'Usage Disponibles

### 1. 📷 Upscaling d'Image Unique
**Description** : Upscalez une seule image avec un facteur d'agrandissement de 4x.

**Utilisation** :
- Sélectionnez une image
- Choisissez le modèle (UltraSharp pour images générales, Anime pour images animées)
- Cliquez sur "Upscaler l'Image"

**Cas d'application** :
- Améliorer la qualité d'une photo
- Agrandir une image pour un affichage haute résolution
- Préparer une image pour un usage professionnel

---

### 2. 📦 Traitement par Lot (Batch Processing)
**Description** : Upscalez plusieurs images en une seule fois.

**Utilisation** :
- Sélectionnez plusieurs images (Ctrl+Click)
- Choisissez le modèle
- Cliquez sur "Upscaler Toutes les Images"

**Cas d'application** :
- Traiter un dossier entier d'images
- Préparer un lot de photos pour un projet
- Automatiser l'amélioration de qualité pour plusieurs images

---

### 3. 🖼️ Restauration de Photos Anciennes
**Description** : Restaurez et améliorez des photos anciennes, floues ou de faible qualité.

**Utilisation** :
- Uploadez une photo ancienne
- Cliquez sur "Restaurer la Photo"
- L'application applique un pré-traitement et un post-traitement optimisés

**Cas d'application** :
- Restaurer des photos de famille vintage
- Améliorer des photos historiques
- Corriger le flou et améliorer le contraste des vieilles photos
- Numérisation de photos anciennes

**Optimisations** :
- Pré-traitement pour les images dégradées
- Post-traitement avec amélioration du contraste léger
- Paramètres optimisés pour préserver les détails historiques

---

### 4. 💻 Amélioration de Captures d'Écran
**Description** : Améliorez la qualité des captures d'écran, particulièrement efficace pour préserver la netteté du texte et des interfaces.

**Utilisation** :
- Uploadez une capture d'écran
- Cliquez sur "Améliorer la Capture"

**Cas d'application** :
- Améliorer des captures d'écran pour documentation
- Préparer des screenshots pour présentation
- Préserver la netteté du texte dans les captures
- Créer des tutoriels avec des captures haute qualité

**Optimisations** :
- Tuiles plus petites pour préserver les détails du texte
- Paramètres optimisés pour les interfaces graphiques

---

### 5. 🖨️ Préparation d'Images pour l'Impression
**Description** : Préparez vos images pour l'impression haute qualité avec résolution adaptée.

**Utilisation** :
- Sélectionnez le format d'impression (A4, A3, A2, A1)
- Choisissez la résolution (150, 300, ou 600 DPI)
- Uploadez votre image
- Cliquez sur "Préparer pour l'Impression"

**Cas d'application** :
- Préparer des photos pour impression professionnelle
- Créer des affiches haute résolution
- Préparer des images pour brochures et flyers
- Impression de qualité musée/galerie

**Formats supportés** :
- **A4** : 210×297mm (2480×3508 pixels à 300 DPI)
- **A3** : 297×420mm (3508×4961 pixels à 300 DPI)
- **A2** : 420×594mm (4961×7016 pixels à 300 DPI)
- **A1** : 594×841mm (7016×9933 pixels à 300 DPI)

**Résolutions** :
- **150 DPI** : Qualité standard pour documents
- **300 DPI** : Haute qualité pour photos et impressions professionnelles
- **600 DPI** : Qualité professionnelle pour impressions d'art

---

### 6. 🎬 Amélioration de Vidéos (Frame par Frame)
**Description** : Upscalez des frames individuelles de vidéo pour améliorer la qualité globale.

**Utilisation** :
- Uploadez une frame de vidéo
- (Optionnel) Spécifiez le numéro de frame
- Cliquez sur "Upscaler la Frame"

**Cas d'application** :
- Améliorer la qualité de vidéos anciennes
- Upscaler des vidéos de faible résolution
- Restaurer des films vintage
- Préparer des vidéos pour diffusion haute définition

**Note** : Pour traiter une vidéo complète, vous devrez extraire les frames, les traiter individuellement, puis les réassembler avec un outil comme FFmpeg.

**Workflow recommandé** :
1. Extraire les frames avec FFmpeg : `ffmpeg -i video.mp4 frame_%04d.png`
2. Traiter chaque frame avec cette application
3. Réassembler avec FFmpeg : `ffmpeg -i upscaled_frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4`

---

## 🔧 Configuration

### Modèles Disponibles

L'application utilise automatiquement les modèles présents dans :
```
C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN\
```

**Modèles supportés** :
- `4xUltrasharp_4xUltrasharpV10.pt` : Pour images générales et photos
- `fixYourBlurHires_4xUltra4xAnimeSharp.zip` : Pour images animées

### Port

L'application trouve automatiquement un port libre à partir de 8888. Pour forcer un port spécifique, modifiez la fonction `find_free_port()` dans `app.py`.

## 📡 API Endpoints

L'application expose une API REST pour l'intégration :

### `GET /api/models`
Retourne la liste des modèles disponibles.

### `POST /api/upscale`
Upscale une image unique.
- **Body** : `multipart/form-data`
  - `image` : Fichier image
  - `model` : `ultrasharp` ou `anime`

### `POST /api/upscale-batch`
Upscale plusieurs images.
- **Body** : `multipart/form-data`
  - `images` : Fichiers images (multiple)
  - `model` : `ultrasharp` ou `anime`

### `POST /api/restore-photo`
Restaure une photo ancienne.

### `POST /api/improve-screenshot`
Améliore une capture d'écran.

### `POST /api/prepare-print`
Prépare une image pour l'impression.
- **Body** : `multipart/form-data`
  - `image` : Fichier image
  - `target_size` : `A4`, `A3`, `A2`, `A1`
  - `dpi` : `150`, `300`, `600`

### `POST /api/upscale-video-frame`
Upscale une frame de vidéo.
- **Body** : `multipart/form-data`
  - `image` : Fichier image (frame)
  - `frame_number` : Numéro de frame (optionnel)

### `GET /api/health`
Vérifie l'état de l'application.

## 🛠️ Architecture Technique

### Structure des Fichiers

```
esrgan-upscaler/
├── app.py                 # Application Flask principale
├── esrgan_model.py        # Module ESRGAN avec chargement des modèles
├── requirements.txt       # Dépendances Python
├── start.ps1              # Script de démarrage
├── README.md              # Documentation
├── templates/
│   └── index.html         # Interface web
├── uploads/               # Dossier temporaire pour uploads
└── outputs/               # Dossier pour images upscalées
```

### Technologies Utilisées

- **Flask** : Framework web
- **PyTorch** : Framework de deep learning
- **Pillow (PIL)** : Traitement d'images
- **NumPy** : Calculs numériques

## ⚙️ Performance

- **GPU** : Si CUDA est disponible, l'application l'utilisera automatiquement
- **CPU** : Fonctionne également sur CPU (plus lent)
- **Mémoire** : Utilise le traitement par tuiles pour les grandes images

## 🔒 Sécurité

- Limite de taille de fichier : 50MB
- Validation des types de fichiers
- Nettoyage automatique des fichiers temporaires (à implémenter)

## 📝 Notes

- Les modèles sont chargés à la demande (lazy loading) pour économiser la mémoire
- Le traitement par tuiles est automatique pour les grandes images
- Les images sont sauvegardées dans le dossier `outputs/` pour le batch processing

## 🐛 Dépannage

### Le modèle ne charge pas
- Vérifiez que les chemins des modèles sont corrects
- Vérifiez que PyTorch est correctement installé

### Erreur de mémoire
- Réduisez la taille des images d'entrée
- Utilisez le traitement par tuiles (automatique)

### Port déjà utilisé
- L'application trouve automatiquement un port libre
- Ou modifiez le port de départ dans `app.py`

## 📄 Licence

Cette application utilise les modèles ESRGAN qui sont sous licence Creative Commons (selon les modèles utilisés).

## 🤝 Contribution

Pour améliorer l'application, vous pouvez :
- Ajouter de nouveaux cas d'usage
- Optimiser les performances
- Améliorer l'interface utilisateur

---

**Développé pour iahome** - Application autonome d'upscaling d'images avec ESRGAN
