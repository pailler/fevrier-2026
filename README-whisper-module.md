# Module Whisper IA - iahome.fr

## 🎯 Description

Le module Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle.

## 🚀 Fonctionnalités

### 🎵 Transcription Audio
- Conversion de fichiers audio en texte
- Support des formats : MP3, WAV, M4A, OGG, FLAC, AAC, WMA
- Précision élevée grâce à OpenAI Whisper
- Optimisé pour le français

### 🎬 Transcription Vidéo
- Extraction du texte des vidéos
- Horodatage des mots
- Support des formats : MP4, AVI, MOV, MKV, WMV, FLV
- Traitement avec FFmpeg + Whisper

### 🖼️ Reconnaissance de Texte (OCR)
- Extraction de texte depuis les images
- Support des formats : JPG, PNG, GIF, BMP, TIFF, PDF
- Utilisation de Tesseract OCR
- Support multilingue (français + anglais)

## 🏗️ Architecture

### Services Docker
- **whisper-api-prod** : API principale Whisper (port 8092)
- **whisper-webui-prod** : Interface web moderne (port 8093)
- **whisper-ocr-prod** : Service OCR Tesseract (port 8094)
- **whisper-video-prod** : Service transcription vidéo (port 8095)
- **whisper-cloudflared-prod** : Tunnel sécurisé Cloudflare

### Technologies
- **OpenAI Whisper** : Reconnaissance vocale
- **Tesseract OCR** : Reconnaissance de caractères
- **FFmpeg** : Traitement vidéo/audio
- **FastAPI** : API OCR Python
- **Nginx** : Reverse proxy
- **Docker** : Containerisation
- **Cloudflared** : Tunnel sécurisé

## 📁 Structure des Fichiers

```
src/app/card/whisper/
├── page.tsx                    # Page détaillée du module
public/images/module-visuals/
├── whisper-module.svg          # Image de la carte
docker-services/
├── docker-compose.whisper.yml  # Configuration Docker
├── whisper-webui/
│   └── index.html              # Interface web
├── whisper-ocr/
│   └── ocr_server.py           # Service OCR Python
└── nginx/
    └── whisper.conf            # Configuration Nginx
```

## 🚀 Déploiement

### 1. Démarrer le service Docker
```powershell
cd docker-services
.\start-whisper-production.ps1
```

### 2. Insérer le module dans la base de données
```powershell
# Démarrer Next.js d'abord
npm run dev

# Dans un autre terminal
.\deploy-whisper-module.ps1
```

### 3. Vérifier le déploiement
```powershell
.\test-whisper-module.ps1
```

## 🌐 URLs d'Accès

- **Interface Web** : https://whisper.iahome.fr
- **Page Module** : http://localhost:3000/card/whisper
- **Carte Applications** : http://localhost:3000/applications

## 🔧 Configuration

### Variables d'Environnement
```env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMWRiY2ZiNzQtNDI4Yi00ZGMxLTg4YTYtNzc1NjVhOThkOGYwIiwicyI6Ik9EYzNabUUxWVRrdE1URTBOaTAwTVRnekxUazVOVGt0WXpBeE5HVTNOekJtTm1ZeiJ9
```

### Ports Utilisés
- **8092** : API Whisper Audio
- **8093** : Interface Web
- **8094** : API OCR
- **8095** : API Vidéo

## 📊 Monitoring

### Vérifier le statut des services
```powershell
docker-compose -f docker-compose.whisper.yml ps
```

### Logs des services
```powershell
# Logs généraux
docker-compose -f docker-compose.whisper.yml logs

# Logs d'un service spécifique
docker-compose -f docker-compose.whisper.yml logs whisper-api-prod
```

## 🎨 Interface Utilisateur

### Fonctionnalités de l'Interface
- **Sélecteur de type** : Audio, Vidéo, Image
- **Upload drag & drop** : Glisser-déposer des fichiers
- **Traitement en temps réel** : Barre de progression
- **Résultats formatés** : Texte avec confiance
- **Design responsive** : Mobile et desktop

### Design
- **Couleurs** : Dégradé bleu-violet
- **Icônes** : Font Awesome
- **Typographie** : Moderne et lisible
- **Animations** : Transitions fluides

## 🔒 Sécurité

- **Tunnel Cloudflare** : Accès sécurisé via cloudflared
- **Validation des fichiers** : Types et tailles limités
- **Isolation Docker** : Services containerisés
- **Proxy Nginx** : Protection des APIs

## 🐛 Dépannage

### Service non accessible
```powershell
# Redémarrer tous les services
.\stop-whisper-production.ps1
.\start-whisper-production.ps1
```

### Erreur de base de données
```powershell
# Vérifier la connexion Supabase
# Relancer l'insertion du module
.\insert-whisper-module.ps1
```

### Problème d'image
- Vérifier que `/images/module-visuals/whisper-module.svg` existe
- Redémarrer le serveur Next.js

## 📈 Améliorations Futures

- [ ] Support de plus de langues
- [ ] Amélioration de la précision OCR
- [ ] Traitement par lots
- [ ] API REST complète
- [ ] Intégration avec d'autres modules

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs Docker
2. Tester l'API directement
3. Vérifier la configuration Cloudflare
4. Consulter la documentation Whisper

---

**Module Whisper IA** - Intelligence artificielle multimédia pour iahome.fr
