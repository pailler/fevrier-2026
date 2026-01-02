# 🎤 Guide de Déploiement - Application d'Isolation Vocale

## Vue d'ensemble

Application d'isolation vocale basée sur **Demucs v4** et **Gradio**, similaire au modèle [Hugging Face Spaces - Music Separation](https://huggingface.co/spaces/abidlabs/music-separation).

## 📋 Prérequis

- Docker et Docker Compose installés
- Au moins 4GB de RAM disponible
- Espace disque : ~5GB (pour le modèle et les dépendances)
- GPU recommandé (CUDA) pour de meilleures performances

## 🚀 Installation Rapide

### 1. Démarrer le service

```powershell
cd voice-isolation-service
.\start.ps1
```

### 2. Accéder à l'application

- **Interface Gradio directe** : http://localhost:8100
- **Via Next.js** : http://localhost:3000/voice-isolation

## 🔧 Configuration

### Variables d'environnement

Ajouter dans `.env.local` ou `.env.production.local` :

```env
VOICE_ISOLATION_URL=http://localhost:8100
NEXT_PUBLIC_VOICE_ISOLATION_URL=http://localhost:8100
```

### Ports

- **Gradio interne** : 7860
- **Gradio externe** : 8100
- Modifier dans `docker-compose.yml` si nécessaire

## 📊 Architecture

```
voice-isolation-service/
├── app.py                 # Application Gradio avec Demucs
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Image Docker
├── docker-compose.yml    # Configuration Docker Compose
├── start.ps1            # Script de démarrage Windows
├── stop.ps1             # Script d'arrêt
└── README.md            # Documentation complète
```

## 🎯 Fonctionnalités

### Sources extractibles

1. **🎤 Voix uniquement** (`vocals`)
2. **🥁 Batterie uniquement** (`drums`)
3. **🎸 Basse uniquement** (`bass`)
4. **🎹 Autres instruments** (`other`)
5. **🎵 Toutes les sources** (`all`)

### Formats supportés

- MP3
- WAV
- M4A
- OGG
- FLAC

## 🔍 Dépannage

### Le modèle ne charge pas

```bash
# Vérifier les logs
docker logs voice-isolation-service

# Vérifier l'espace disque
docker system df

# Redémarrer le service
docker-compose restart
```

### Erreur CUDA / GPU

Si pas de GPU disponible, le service utilisera automatiquement le CPU (plus lent mais fonctionnel).

Pour forcer le CPU, modifier `docker-compose.yml` :

```yaml
environment:
  - CUDA_VISIBLE_DEVICES=""  # Force CPU
```

### Service non accessible

1. Vérifier que le port 8100 n'est pas utilisé :
   ```powershell
   netstat -ano | findstr :8100
   ```

2. Vérifier les réseaux Docker :
   ```bash
   docker network ls
   docker network inspect whisper-network
   docker network inspect iahome-network
   ```

3. Vérifier les logs :
   ```bash
   docker logs voice-isolation-service --tail 50
   ```

### Performance lente

- **Avec GPU** : Traitement ~30-60 secondes pour 3 minutes d'audio
- **Sans GPU (CPU)** : Traitement ~5-10 minutes pour 3 minutes d'audio

## 🔗 Intégration avec Next.js

### Page d'accès

- **Route** : `/src/app/voice-isolation/page.tsx`
- **Redirection** : Vers le service Gradio sur le port 8100

### API Proxy

- **Route** : `/src/app/api/voice-isolation-proxy/[...path]/route.ts`
- **Usage** : Proxy pour les requêtes vers le service Gradio

## 📈 Monitoring

### Vérifier le statut du service

```bash
# Health check
curl http://localhost:8100/

# Logs en temps réel
docker logs -f voice-isolation-service
```

### Métriques

- **Temps de chargement du modèle** : ~2-3 minutes au premier démarrage
- **Mémoire utilisée** : ~2-3GB avec GPU, ~1-2GB avec CPU
- **Taille du modèle** : ~1.5GB

## 🔄 Mise à jour

```powershell
# Arrêter le service
.\stop.ps1

# Reconstruire l'image
docker-compose build --no-cache

# Redémarrer
.\start.ps1
```

## 🐛 Problèmes connus

### Fichiers temporaires

Les fichiers temporaires sont automatiquement nettoyés après traitement. Si vous avez des problèmes d'espace disque, vérifiez :

```bash
docker system prune -a
```

### Timeout sur gros fichiers

Pour les fichiers très volumineux (>100MB), le traitement peut prendre du temps. Le service Gradio gère automatiquement les timeouts.

## 📚 Références

- [Demucs GitHub](https://github.com/facebookresearch/demucs)
- [Hugging Face Spaces - Music Separation](https://huggingface.co/spaces/abidlabs/music-separation)
- [Gradio Documentation](https://gradio.app/docs/)

## ✅ Checklist de déploiement

- [ ] Docker et Docker Compose installés
- [ ] Réseaux Docker créés (`whisper-network`, `iahome-network`)
- [ ] Port 8100 disponible
- [ ] Variables d'environnement configurées
- [ ] Service démarré avec `start.ps1`
- [ ] Service accessible sur http://localhost:8100
- [ ] Intégration Next.js fonctionnelle
- [ ] Test avec un fichier audio

## 🎉 Utilisation

1. Accéder à http://localhost:8100
2. Uploader un fichier audio
3. Choisir la source à extraire
4. Cliquer sur "Séparer les sources"
5. Télécharger le résultat

---

**Note** : Cette application est similaire au modèle Hugging Face Spaces mais déployée localement avec Docker pour un contrôle total et une meilleure confidentialité.
