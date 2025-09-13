# Convertisseur Universel v1 - IAHome

## Vue d'ensemble

Le **Convertisseur Universel v1** est un service Docker complet qui permet de convertir différents types de fichiers directement depuis votre navigateur web. Il intègre les meilleurs outils de conversion open source dans une interface web moderne et intuitive.

## 🚀 Fonctionnalités

### ✨ **Interface Web Moderne**
- **Drag & Drop** : Glissez-déposez vos fichiers facilement
- **Interface responsive** : Compatible mobile et desktop
- **Conversion en temps réel** : Barre de progression et feedback visuel
- **Téléchargement automatique** : Fichiers convertis prêts à télécharger

### 🔧 **Outils Intégrés**
- **ImageMagick** : Conversion d'images haute qualité
- **LibreOffice** : Conversion de documents Office
- **FFmpeg** : Conversion audio et vidéo
- **API REST** : Intégration facile avec d'autres services

### 📁 **Formats Supportés**

#### Images
- **Entrée** : JPG, JPEG, PNG, GIF, BMP, TIFF, WEBP, SVG
- **Sortie** : JPG, PNG, GIF, BMP, TIFF, WEBP, SVG, ICO
- **Fonctionnalités** : Redimensionnement, optimisation, conversion de format

#### Documents
- **Entrée** : PDF, DOCX, DOC, ODT, RTF, TXT, HTML, MD
- **Sortie** : PDF, DOCX, DOC, ODT, RTF, TXT, HTML, MD
- **Fonctionnalités** : Préservation de la mise en forme, conversion bidirectionnelle

#### Audio
- **Entrée** : MP3, WAV, FLAC, AAC, OGG, M4A, WMA
- **Sortie** : MP3, WAV, FLAC, AAC, OGG, M4A, WMA
- **Fonctionnalités** : Compression, optimisation, conversion de codec

#### Vidéo
- **Entrée** : MP4, AVI, MOV, MKV, WMV, FLV, WEBM
- **Sortie** : MP4, AVI, MOV, MKV, WMV, FLV, WEBM
- **Fonctionnalités** : Compression, redimensionnement, conversion de codec

## 📁 Structure des fichiers

```
docker-services/
├── docker-compose.universal-converter.yml    # Configuration Docker Compose
├── start-universal-converter.ps1             # Script de démarrage
├── stop-universal-converter.ps1              # Script d'arrêt
├── README-universal-converter.md             # Cette documentation
└── universal-converter/                      # Code source du convertisseur
    ├── Dockerfile                            # Image Docker personnalisée
    ├── converter_app.py                      # Application Flask principale
    ├── requirements.txt                      # Dépendances Python
    ├── templates/
    │   └── index.html                        # Interface web
    ├── uploads/                              # Fichiers uploadés
    └── downloads/                            # Fichiers convertis
```

## 🚀 Installation et Utilisation

### Prérequis
- Docker Desktop installé et en cours d'exécution
- PowerShell (Windows) ou Bash (Linux/Mac)
- Port 8096 disponible

### Démarrage

```powershell
# Depuis le dossier docker-services
.\start-universal-converter.ps1
```

### Arrêt

```powershell
# Arrêter le service
.\stop-universal-converter.ps1
```

### Accès

- **Interface Web** : http://localhost:8096
- **Domaine** : https://converter.iahome.fr (avec Traefik)
- **API Health** : http://localhost:8096/api/health
- **API Formats** : http://localhost:8096/api/formats

## 🔧 Configuration

### Variables d'environnement

```yaml
environment:
  - PYTHONUNBUFFERED=1
  - FLASK_APP=converter_app.py
  - FLASK_ENV=production
  - CONVERTER_PORT=8080
  - CONVERTER_HOST=0.0.0.0
```

### Volumes

- `universal-converter/uploads` : Fichiers uploadés temporaires
- `universal-converter/downloads` : Fichiers convertis

### Ports

- **8096** : Port externe (interface web)
- **8080** : Port interne (conteneur)

## 🌐 API REST

### Endpoints disponibles

#### GET /
Interface web principale

#### POST /api/convert
Convertit un fichier

**Paramètres :**
- `file` : Fichier à convertir (multipart/form-data)
- `output_format` : Format de sortie souhaité

**Réponse :**
```json
{
  "success": true,
  "output_file": "converted_file.pdf",
  "download_url": "/download/converted_file.pdf"
}
```

#### GET /api/formats
Liste des formats supportés

**Réponse :**
```json
{
  "images": {
    "input": [".jpg", ".png", ".gif"],
    "output": [".jpg", ".png", ".gif"],
    "converter": "imagemagick"
  },
  "documents": {
    "input": [".pdf", ".docx", ".odt"],
    "output": [".pdf", ".docx", ".odt"],
    "converter": "libreoffice"
  }
}
```

#### GET /api/health
Vérification de santé du service

**Réponse :**
```json
{
  "status": "healthy",
  "service": "universal-converter-v1",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

#### GET /download/<filename>
Téléchargement de fichier converti

## 🎯 Utilisation

### Interface Web

1. **Accédez** à http://localhost:8096
2. **Glissez-déposez** ou **sélectionnez** un fichier
3. **Choisissez** le format de sortie
4. **Cliquez** sur "Convertir"
5. **Téléchargez** le fichier converti

### API

```bash
# Conversion via API
curl -X POST http://localhost:8096/api/convert \
  -F "file=@document.pdf" \
  -F "output_format=docx"

# Vérification de santé
curl http://localhost:8096/api/health

# Formats supportés
curl http://localhost:8096/api/formats
```

## 🔒 Sécurité

### Bonnes pratiques
- **Isolation** : Service conteneurisé
- **Validation** : Vérification des types de fichiers
- **Nettoyage** : Suppression automatique des fichiers temporaires
- **Limites** : Taille maximale de 100MB par fichier
- **Timeout** : Limitation du temps de conversion

### Limitations
- **Accès local** : Service accessible uniquement en local par défaut
- **Ressources** : Limitation des ressources par conteneur
- **Formats** : Seuls les formats listés sont supportés

## 📊 Monitoring et Logs

### Voir les logs

```powershell
# Logs en temps réel
docker-compose -f docker-compose.universal-converter.yml logs -f

# Logs du service uniquement
docker-compose -f docker-compose.universal-converter.yml logs universal-converter
```

### Statut du service

```powershell
# Statut des conteneurs
docker-compose -f docker-compose.universal-converter.yml ps

# Vérification de santé
curl http://localhost:8096/api/health
```

## 🚨 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```powershell
   # Vérifier les ports utilisés
   netstat -an | findstr "8096"
   ```

2. **Service non accessible**
   ```powershell
   # Vérifier les conteneurs
   docker ps | findstr "universal-converter"
   ```

3. **Erreur de conversion**
   ```powershell
   # Voir les logs détaillés
   docker-compose -f docker-compose.universal-converter.yml logs universal-converter
   ```

4. **Fichier trop volumineux**
   - Limite : 100MB par fichier
   - Solution : Compresser le fichier avant conversion

### Tests de diagnostic

```powershell
# Test de santé
curl http://localhost:8096/api/health

# Test de formats
curl http://localhost:8096/api/formats

# Test de conversion (exemple)
# Upload un fichier via l'interface web
```

## 📈 Performance

### Optimisations
- **Cache** : Réutilisation des outils installés
- **Compression** : Optimisation automatique des fichiers
- **Nettoyage** : Suppression automatique des fichiers temporaires
- **Timeout** : Limitation du temps de traitement

### Recommandations
- **RAM** : Minimum 2GB, recommandé 4GB+
- **CPU** : Multi-cœurs pour les conversions
- **Stockage** : SSD pour les fichiers temporaires
- **Réseau** : Connexion stable pour les uploads

## 🔄 Mise à jour

### Mise à jour du service

```powershell
# Arrêter le service
.\stop-universal-converter.ps1

# Reconstruire l'image
docker-compose -f docker-compose.universal-converter.yml build --no-cache

# Redémarrer
.\start-universal-converter.ps1
```

### Sauvegarde des données

```powershell
# Sauvegarder les fichiers convertis
Compress-Archive -Path "universal-converter\downloads" -DestinationPath "backup-converter-$(Get-Date -Format 'yyyy-MM-dd').zip"
```

## 🛠️ Développement

### Structure du code

- `converter_app.py` : Application Flask principale
- `templates/index.html` : Interface web
- `requirements.txt` : Dépendances Python
- `Dockerfile` : Configuration de l'image

### Ajouter de nouveaux formats

1. Modifier `SUPPORTED_FORMATS` dans `converter_app.py`
2. Ajouter la logique de conversion si nécessaire
3. Reconstruire l'image Docker

### Personnaliser l'interface

1. Modifier `templates/index.html`
2. Redémarrer le service

## 📚 Ressources

### Documentation des outils
- **ImageMagick** : https://imagemagick.org/
- **LibreOffice** : https://www.libreoffice.org/
- **FFmpeg** : https://ffmpeg.org/
- **Flask** : https://flask.palletsprojects.com/

### Support
- **Issues** : Créer une issue sur le repository
- **Documentation** : Ce fichier README
- **Logs** : Consulter les logs pour le diagnostic

## 🎉 Fonctionnalités Futures

### Version 2.0 (Prévue)
- **Conversion par lot** : Traitement de plusieurs fichiers
- **API avancée** : Endpoints pour l'intégration
- **Authentification** : Sécurisation des conversions
- **Historique** : Suivi des conversions
- **Formats étendus** : Support de plus de formats
- **Compression** : Optimisation automatique

### Améliorations Techniques
- **Cache Redis** : Mise en cache des conversions
- **Queue système** : Traitement asynchrone
- **Monitoring** : Métriques de performance
- **Backup** : Sauvegarde automatique

---

**Version** : 1.0  
**Dernière mise à jour** : 2024  
**Auteur** : Équipe IAHome  
**Licence** : MIT  
**Statut** : ✅ Fonctionnel et prêt à l'emploi
