# Restoration du service Whisper IA

## Problème
Le service Whisper IA (https://whisper.iahome.fr/) ne fonctionnait pas correctement.

## Cause
- Le container `whisper-proxy` n'était pas démarré
- La configuration Traefik pour whisper.iahome.fr n'existait pas
- Les containers whisper n'étaient pas sur le même réseau Docker que Traefik

## Solution mise en place

### 1. Redémarrage du container whisper-proxy
- Le container était configuré dans docker-compose mais n'était pas démarré
- Modifié `whisper-service/docker-compose.yml` pour connecter whisper-proxy au réseau iahome-network

### 2. Création de la configuration Traefik
- Créé le fichier `traefik/dynamic/whisper-cloudflare.yml`
- Configuration de 3 routes :
  - Route pour les challenges Let's Encrypt (ACME)
  - Route API pour les endpoints `/asr`, `/video-asr`, `/ocr`, `/documents`, `/extract-audio`
  - Route principale pour le WebUI

### 3. Correction du réseau Docker
- Problème : Traefik était sur `iahome_iahome-network` mais les containers whisper sur `iahome-network`
- Solution : Connecté les containers whisper au réseau `iahome_iahome-network`
- Modifié `traefik/traefik.yml` pour utiliser le réseau correct : `iahome_iahome-network`

### 4. Modification du docker-compose.yml
- Ajouté `iahome-network` au service `whisper-proxy`
- Défini `iahome-network` comme réseau externe

## Résultat
✅ Le service Whisper IA est maintenant accessible via https://whisper.iahome.fr/

### Problème résolu
L'erreur "404 Not Found" venait d'une incompatibilité entre les endpoints dans l'interface web et les routes nginx :
- L'interface utilisait `/api/whisper-audio/asr` 
- Mais nginx attendait `/asr`

**Solution** : Modification du fichier `whisper-service/whisper-webui/index.html` pour utiliser les endpoints corrects :
- Audio : `/asr` au lieu de `/api/whisper-audio/asr`
- Vidéo : `/video-asr` au lieu de `/api/whisper-video/asr`
- OCR : `/ocr` au lieu de `/api/whisper-ocr/ocr`
- Documents : `/documents` au lieu de `/api/whisper-documents/process`

## Services disponibles
- **WebUI** : Interface web pour l'upload de fichiers
- **API Audio** : Transcription de fichiers audio
- **API Vidéo** : Transcription de vidéos
- **API OCR** : Extraction de texte depuis images
- **API Documents** : Traitement de documents PDF, DOCX, etc.

## Containers en cours d'exécution
- whisper-webui-prod : Interface web (port 8093)
- whisper-proxy : Proxy pour les APIs
- whisper-api-prod : API pour les fichiers audio
- whisper-video-prod : API pour les vidéos
- whisper-ocr-prod : API pour l'OCR
- whisper-documents-prod : API pour les documents

## Configuration technique
- **Traefik** : Reverse proxy et routage
- **Networks** : iahome_iahome-network (principal), whisper-service_whisper-network (interne)
- **Endpoints API** :
  - `/asr` → API Whisper Audio
  - `/video-asr` → API Whisper Vidéo
  - `/ocr` → API OCR
  - `/documents` → API Documents
  - `/extract-audio` → Extraction audio

