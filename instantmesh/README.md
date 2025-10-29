# InstantMesh API

API pour la génération de modèles 3D à partir d'images via InstantMesh.

## 🌐 Interface Web

Une interface graphique inspirée de ComfyUI est disponible à :
- **Local** : `http://localhost:3000/instantmesh`
- **Production** : `https://iahome.fr/instantmesh`

### Fonctionnalités de l'interface
- **Upload visuel** : Drag & drop d'images
- **Prévisualisation** : Aperçu de l'image sélectionnée
- **Génération en temps réel** : Barre de progression animée
- **Gestion des fichiers** : Liste des modèles générés
- **Téléchargement direct** : Bouton de téléchargement pour chaque fichier
- **Design moderne** : Interface sombre avec effets glassmorphism

### Navigation
```
/instantmesh → Interface de génération 3D
```

## 🚀 Installation et démarrage

```bash
# Démarrer le service
docker-compose -f docker-compose.prod.yml up -d instantmesh

# Vérifier les logs
docker logs iahome-instantmesh --tail 50
```

## 📡 Endpoints API

### 1. Documentation
```bash
curl http://localhost:8003
```

### 2. Health Check
```bash
curl http://localhost:8003/health
```

### 3. Générer un modèle 3D
```bash
curl -X POST -F "file=@votre_portrait.jpg" http://localhost:8003/generate
```

**Réponse:**
```json
{
  "success": true,
  "message": "3D model generated successfully",
  "input_file": "abc123_portrait.jpg",
  "output_file": "portrait.obj",
  "download_url": "/download/portrait.obj"
}
```

### 4. Télécharger le modèle généré
```bash
curl http://localhost:8003/download/portrait.obj -o resultat.obj
```

### 5. Lister les modèles générés
```bash
curl http://localhost:8003/list-outputs
```

### 6. Télécharger les modèles HuggingFace
```bash
curl -X POST http://localhost:8003/download-models
```

## 📁 Structure des fichiers

```
instantmesh/
├── docker/
│   ├── Dockerfile          # Image Docker
│   └── api.py              # API Flask
├── inputs/                 # Images d'entrée
├── outputs/                # Modèles générés
│   └── instant-mesh-large/
│       ├── images/         # Vues multiples générées
│       ├── meshes/         # Fichiers .obj
│       └── videos/         # Vidéos de preview
└── ckpts/                  # Modèles téléchargés
```

## 💡 Paramètres de génération

Le pipeline InstantMesh utilise les paramètres suivants par défaut :
- **diffusion_steps**: 75 (étapes de diffusion)
- **seed**: 42 (graine aléatoire)
- **scale**: 1.0 (échelle du modèle)
- **view**: 6 (nombre de vues pour la reconstruction)
- **no_rembg**: background non retiré automatiquement

## 🔧 Configuration

Les modèles sont automatiquement téléchargés depuis HuggingFace au premier usage :
- `diffusion_pytorch_model.bin` (UNet)
- `instant_mesh_large.ckpt` (modèle de reconstruction)

Ils sont stockés dans `/app/ckpts` et persistés via le volume `instantmesh/ckpts/`.

## ⚙️ GPU

Le service utilise la GPU nvidia via Docker. Vérifiez que votre système est configuré correctement :

```bash
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
```

## 📊 Utilisation via l'API

L'API est accessible via Traefik à : `https://instantmesh.iahome.fr`

**Note**: Les modèles sont volumineux (~2-3 GB). Le téléchargement initial peut prendre quelques minutes.