# 🐳 Docker pour Hunyuan3D-2

## 📋 Prérequis

1. **Docker Desktop** installé et en cours d'exécution
2. **NVIDIA GPU** avec support CUDA
3. **NVIDIA Container Toolkit** installé (pour l'accès GPU dans Docker)
   - Windows : Installé automatiquement avec Docker Desktop si vous avez un GPU NVIDIA
   - Linux : Suivez les instructions : https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

## 🚀 Démarrage rapide

### Option 1 : Avec Docker Compose (Recommandé)

```bash
cd hunyuan2-spz
docker-compose up -d
```

### Option 2 : Avec Docker Compose Standalone

Si vous n'avez pas le réseau `iahome-network` :

```bash
cd hunyuan2-spz
docker-compose -f docker-compose.standalone.yml up -d
```

### Option 3 : Build et run manuel

```bash
cd hunyuan2-spz
docker build -t hunyuan3d:latest .
docker run -d \
  --name hunyuan3d \
  --gpus all \
  -p 8888:8888 \
  -v hunyuan3d-models:/root/.cache/huggingface \
  -v hunyuan3d-output:/app/code/temp \
  -v hunyuan3d-cache:/app/code/gradio_cache \
  --restart unless-stopped \
  hunyuan3d:latest
```

## 🌐 Accès

Une fois le conteneur démarré, l'interface sera accessible sur :
- **Local** : http://localhost:8888
- **Production** : https://hunyuan3d.iahome.fr (si Cloudflared configuré)

## 📊 Commandes utiles

### Voir les logs
```bash
docker-compose logs -f hunyuan3d
```

### Arrêter le conteneur
```bash
docker-compose down
```

### Redémarrer le conteneur
```bash
docker-compose restart
```

### Vérifier l'état
```bash
docker-compose ps
```

### Vérifier l'utilisation GPU
```bash
docker exec hunyuan3d nvidia-smi
```

## 🔧 Configuration

### Variables d'environnement

Vous pouvez modifier les paramètres dans `docker-compose.yml` :

```yaml
environment:
  - CUDA_VISIBLE_DEVICES=0  # ID du GPU à utiliser
```

### Modèles

Les modèles sont téléchargés automatiquement au premier démarrage et stockés dans le volume `hunyuan3d-models`.

### Ports

Le port par défaut est **8888**. Pour changer :

```yaml
ports:
  - "8888:8888"  # Changez le premier nombre pour le port hôte
```

## ⚠️ Notes importantes

1. **Premier démarrage** : Le téléchargement des modèles peut prendre 10-30 minutes selon votre connexion
2. **GPU requis** : L'application nécessite un GPU NVIDIA avec au moins 8GB VRAM
3. **Espace disque** : Les modèles nécessitent environ 10-15 GB d'espace
4. **Mémoire** : Le conteneur peut utiliser jusqu'à 12-16 GB de RAM

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker-compose logs hunyuan3d

# Vérifier que Docker Desktop utilise le GPU
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
```

### Erreur GPU non disponible

Sur Windows avec Docker Desktop :
1. Ouvrez Docker Desktop
2. Allez dans Settings > Resources > WSL Integration
3. Activez l'intégration WSL si nécessaire
4. Redémarrez Docker Desktop

### Le service est lent

- Vérifiez que le GPU est bien utilisé : `docker exec hunyuan3d nvidia-smi`
- Vérifiez les logs pour les erreurs de mémoire
- Réduisez la qualité dans les paramètres de l'interface

## 📦 Volumes

Les volumes Docker persistent :
- **hunyuan3d-models** : Modèles Hugging Face téléchargés
- **hunyuan3d-output** : Générations 3D créées
- **hunyuan3d-cache** : Cache Gradio

Pour supprimer les volumes (libérer de l'espace) :
```bash
docker-compose down -v
```

## 🔄 Mise à jour

Pour mettre à jour l'image :

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

*Documentation créée le : $(Get-Date -Format "yyyy-MM-dd")*




