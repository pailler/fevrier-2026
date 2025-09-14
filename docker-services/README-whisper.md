# 🎤 Service Whisper IA - Reconnaissance Vocale

Service Docker complet pour la reconnaissance vocale utilisant le modèle Whisper d'OpenAI, avec interface web moderne et sécurisation via cloudflared.

## ✨ Fonctionnalités

- **🎯 API REST** complète pour la transcription audio
- **🎨 Interface web moderne** avec design responsive et animations
- **🔒 Sécurisation cloudflared** pour l'accès sécurisé
- **🌍 Support multi-formats** (audio et vidéo)
- **🇫🇷 Optimisé français** avec modèles configurables
- **📱 Design responsive** pour mobile et desktop
- **⚡ Performance optimisée** avec health checks

## 🚀 Installation Rapide

### Prérequis
- Docker et Docker Compose installés
- Token cloudflared configuré
- 4GB RAM minimum recommandés

### 1. Configuration cloudflared

```powershell
# Définir le token cloudflared
$env:CLOUDFLARE_TUNNEL_TOKEN = "votre-token-ici"

# Ou créer un fichier .env
echo "CLOUDFLARE_TUNNEL_TOKEN=votre-token-ici" > .env
```

### 2. Démarrage du service

```powershell
# Dans le répertoire iahome
cd docker-services
.\start-whisper.ps1
```

### 3. Accès aux services

- **Interface Web** : http://localhost:8093
- **API REST** : http://localhost:8092
- **Tunnel cloudflared** : Configuré automatiquement

## 🎯 Utilisation

### Interface Web
1. Ouvrez http://localhost:8093
2. Glissez-déposez un fichier audio ou cliquez pour sélectionner
3. Cliquez sur "Transcrire l'audio"
4. Attendez la transcription (quelques secondes à minutes)
5. Copiez, téléchargez ou partagez le résultat

### API REST

#### Endpoint de transcription
```http
POST /asr
Content-Type: multipart/form-data

Form data:
- audio_file: [fichier audio]
```

#### Réponse
```json
{
    "text": "Texte transcrit depuis l'audio",
    "confidence": 0.95,
    "duration": 120.5
}
```

#### Exemple avec curl
```bash
curl -X POST \
  http://localhost:8092/asr \
  -H 'Content-Type: multipart/form-data' \
  -F 'audio_file=@mon_audio.mp3'
```

#### Exemple avec PowerShell
```powershell
$filePath = "C:\chemin\vers\mon_audio.mp3"
$form = @{
    audio_file = Get-Item $filePath
}
Invoke-RestMethod -Uri "http://localhost:8092/asr" -Method Post -Form $form
```

## 🔧 Configuration

### Modèles Whisper disponibles

| Modèle | Taille | Vitesse | Précision | RAM requise |
|--------|--------|---------|-----------|-------------|
| `tiny` | 39 MB | Très rapide | Faible | 1 GB |
| `base` | 74 MB | Rapide | Bonne | 1 GB |
| `small` | 244 MB | Moyen | Très bonne | 2 GB |
| `medium` | 769 MB | Lent | Excellente | 5 GB |
| `large` | 1550 MB | Très lent | Maximum | 10 GB |

### Variables d'environnement

Modifiez `docker-compose.whisper.yml` pour personnaliser :

```yaml
environment:
  - ASR_MODEL=base                    # Modèle à utiliser
  - ASR_MODEL_LANG=fr                 # Langue de préférence
  - ASR_MODEL_TEMPERATURE=0           # Créativité (0-1)
  - ASR_MODEL_BEAM_SIZE=1             # Nombre de beams
  - ASR_MODEL_BEST_OF=1               # Nombre de candidats
  - ASR_MODEL_PATIENCE=1              # Patience pour la recherche
  - ASR_MODEL_LENGTH_PENALTY=1        # Pénalité de longueur
  - ASR_MODEL_COMPRESSION_RATIO_THRESHOLD=2.4
  - ASR_MODEL_LOG_PROB_THRESHOLD=-1
  - ASR_MODEL_NO_SPEECH_THRESHOLD=0.6
  - ASR_MODEL_CONDITION_ON_PREVIOUS_TEXT=true
  - ASR_MODEL_VAD_FILTER=true         # Filtre de détection de voix
  - ASR_MODEL_VAD_THRESHOLD=0.35
  - ASR_MODEL_MIN_SILENCE_DURATION_MS=100
```

## 📋 Formats Supportés

### Audio
- **MP3** - Format le plus courant
- **WAV** - Qualité non compressée
- **M4A** - Apple iTunes
- **OGG** - Open source
- **FLAC** - Compression sans perte
- **AAC** - Haute qualité
- **WMA** - Windows Media

### Vidéo
- **MP4** - Standard moderne
- **AVI** - Format classique
- **MOV** - Apple QuickTime
- **MKV** - Conteneur open source

## 🛠️ Gestion du Service

### Commandes de base

```powershell
# Démarrer
.\start-whisper.ps1

# Arrêter
.\stop-whisper.ps1

# Voir le statut
docker-compose -f docker-compose.whisper.yml ps

# Voir les logs
docker-compose -f docker-compose.whisper.yml logs -f

# Redémarrer
docker-compose -f docker-compose.whisper.yml restart

# Mise à jour
docker-compose -f docker-compose.whisper.yml pull
docker-compose -f docker-compose.whisper.yml up -d
```

### Commandes avancées

```powershell
# Nettoyer complètement
docker-compose -f docker-compose.whisper.yml down --volumes --remove-orphans

# Reconstruire l'interface web
docker-compose -f docker-compose.whisper.yml up -d --build whisper-webui

# Voir l'utilisation des ressources
docker stats whisper-api whisper-webui whisper-cloudflared

# Accéder au shell du container API
docker exec -it whisper-api /bin/bash
```

## 🔍 Dépannage

### Problèmes courants

#### 1. Service ne démarre pas
```powershell
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier les logs
docker-compose -f docker-compose.whisper.yml logs

# Vérifier les ports
netstat -an | findstr :8092
netstat -an | findstr :8093
```

#### 2. Erreur de mémoire
```yaml
# Utiliser un modèle plus petit
- ASR_MODEL=tiny

# Ou augmenter la RAM allouée à Docker
# Docker Desktop > Settings > Resources > Memory
```

#### 3. Transcription lente
- Le premier appel est toujours lent (téléchargement du modèle)
- Utilisez un modèle plus petit (`tiny` ou `base`)
- Vérifiez la charge CPU avec `docker stats`

#### 4. Erreur cloudflared
```powershell
# Vérifier le token
echo $env:CLOUDFLARE_TUNNEL_TOKEN

# Tester la connexion
docker exec whisper-cloudflared cloudflared tunnel info
```

#### 5. Interface web ne se charge pas
```powershell
# Vérifier le container nginx
docker logs whisper-webui

# Redémarrer l'interface
docker-compose -f docker-compose.whisper.yml restart whisper-webui
```

### Logs détaillés

```powershell
# Logs de l'API
docker logs whisper-api -f

# Logs de l'interface web
docker logs whisper-webui -f

# Logs de cloudflared
docker logs whisper-cloudflared -f

# Tous les logs
docker-compose -f docker-compose.whisper.yml logs -f
```

## 📊 Monitoring

### Health Checks
```bash
# API
curl http://localhost:8092/health

# Interface web
curl http://localhost:8093
```

### Métriques
```powershell
# Utilisation des ressources
docker stats whisper-api whisper-webui whisper-cloudflared

# Espace disque
docker system df

# Volumes
docker volume ls | findstr whisper
```

## 🔒 Sécurité

### Configuration cloudflared
1. Créez un tunnel sur https://one.dash.cloudflare.com/
2. Configurez les règles d'accès
3. Définissez le token dans les variables d'environnement

### Bonnes pratiques
- Utilisez HTTPS via cloudflared
- Limitez l'accès par IP si nécessaire
- Surveillez les logs d'accès
- Mettez à jour régulièrement les images

## 🤝 Intégration

### Avec d'autres services
```javascript
// Exemple d'intégration Node.js
const FormData = require('form-data');
const fs = require('fs');

async function transcribeAudio(filePath) {
    const form = new FormData();
    form.append('audio_file', fs.createReadStream(filePath));
    
    const response = await fetch('http://localhost:8092/asr', {
        method: 'POST',
        body: form
    });
    
    return await response.json();
}
```

### Webhook (à implémenter)
```yaml
# Ajouter dans docker-compose.whisper.yml
environment:
  - WEBHOOK_URL=https://votre-service.com/webhook
  - WEBHOOK_SECRET=votre-secret
```

## 📚 Ressources

- [Documentation Whisper OpenAI](https://github.com/openai/whisper)
- [Image Docker utilisée](https://hub.docker.com/r/onerahmet/openai-whisper-asr-webservice)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🆘 Support

### Logs utiles
```powershell
# Collecter tous les logs
docker-compose -f docker-compose.whisper.yml logs > whisper-logs.txt

# Informations système
docker system info > docker-info.txt
docker-compose -f docker-compose.whisper.yml config > docker-config.txt
```

### Informations de debug
- Version Docker : `docker --version`
- Version Docker Compose : `docker-compose --version`
- OS : `$PSVersionTable.OS`
- Architecture : `$env:PROCESSOR_ARCHITECTURE`

---

**🎉 Profitez de votre service Whisper IA !**
