# Blender 3D Virtualisé - Documentation v2.0

## Vue d'ensemble

Ce dossier contient les services Docker pour Blender 3D virtualisé **version 2.0**, permettant la génération d'objets 3D avancés via une interface web et une API avec support des matériaux, animations et nouvelles formes.

## 🆕 Nouvelles fonctionnalités v2.0

### 🎨 **Matériaux et couleurs**
- **Matériaux** : métal, verre, bois, plastique, caoutchouc, tissu, pierre, céramique
- **Couleurs** : rouge, vert, bleu, jaune, orange, violet, rose, marron, noir, blanc, gris
- **Extraction intelligente** : détection automatique des matériaux et couleurs dans les descriptions

### 🏛️ **Formes avancées**
- **Formes de base** : cube, sphère, cylindre, cône, tore
- **Formes avancées** : pyramide, icosphère, monkey Suzanne (mascotte Blender)
- **Paramètres** : taille, position, rotation, segments, subdivisions

### 🎬 **Animations**
- **Rotation** : animation de rotation continue
- **Redimensionnement** : animation de mise à l'échelle
- **Rebond** : animation de mouvement vertical
- **Paramètres** : durée, axe, facteur d'échelle

### 📦 **Export multi-formats**
- **Formats supportés** : OBJ, STL, FBX, GLTF, DAE, BLEND
- **Export automatique** avec matériaux et textures
- **Gestion des fichiers** avec noms uniques

### 🎭 **Scènes complexes**
- **Création de scènes** avec plusieurs objets
- **Layouts** : grille, cercle, aléatoire
- **Éclairage automatique** et configuration caméra

### 💡 **Système d'aide intégré**
- **Aide contextuelle** avec exemples
- **Liste des fonctionnalités** disponibles
- **Guide d'utilisation** interactif

## Structure des fichiers

```
docker-services/
├── docker-compose.blender.yml        # Configuration Docker Compose
├── start-blender-enhanced.ps1        # Script de démarrage v2.0
├── stop-blender.ps1                  # Script d'arrêt
├── blender-scripts/                  # Scripts Python pour Blender
│   ├── blender_api.py               # API de base
│   └── blender_api_enhanced.py      # API améliorée v2.0
├── blender-api/                      # API Python Flask
│   ├── api_server.py                # API principale
│   ├── api_server_enhanced.py       # API améliorée v2.0
│   └── requirements.txt             # Dépendances Python
├── blender-webui/                   # Interface web
│   └── index.html                  # Interface de visualisation
├── blender-output/                  # Fichiers 3D générés
├── blender-temp/                    # Fichiers temporaires
├── test-blender-api.py              # Tests de base
└── test-blender-enhanced.py         # Tests complets v2.0
```

## Services disponibles

### 1. blender-headless
- **Image**: `nytimes/blender:latest`
- **Port**: 9090 (externe) -> 8080 (interne)
- **Fonction**: Blender en mode headless pour la génération 3D

### 2. blender-api
- **Image**: `python:3.11-slim`
- **Port**: 3001
- **Fonction**: API Flask v2.0 avec nouvelles fonctionnalités

### 3. blender-webui
- **Image**: `nginx:alpine`
- **Port**: 9091
- **Fonction**: Interface web pour visualiser et télécharger les fichiers 3D

## Utilisation

### Démarrage depuis la racine du projet
```powershell
.\start-blender-virtualized.ps1
```

### Démarrage depuis le dossier docker-services
```powershell
cd docker-services
.\start-blender-enhanced.ps1
```

### Arrêt
```powershell
cd docker-services
.\stop-blender.ps1
```

## URLs disponibles

- **Interface Web Blender**: http://localhost:9091
- **API Flask Blender**: http://localhost:3001
- **Next.js App**: http://localhost:3000/blender-3d
- **Test API simple**: `python test-blender-api.py`
- **Test API complet**: `python test-blender-enhanced.py`

## Fonctionnalités détaillées

### 🎨 Formes 3D supportées

#### Formes de base
- **Cube** : `"crée un cube rouge métallique de 2cm"`
- **Sphère** : `"une sphère bleue en verre"`
- **Cylindre** : `"cylindre vert en bois de 3cm"`
- **Cône** : `"cône orange transparent"`
- **Tore** : `"tore violet brillant"`

#### Formes avancées
- **Pyramide** : `"pyramide dorée en céramique"`
- **Icosphère** : `"icosphère violette lisse"`
- **Monkey Suzanne** : `"monkey Suzanne rose"`

### 💎 Matériaux disponibles
- **Métal** : brillant, réfléchissant
- **Verre** : transparent, réfractif
- **Bois** : mat, texturé
- **Plastique** : lisse, coloré
- **Caoutchouc** : mat, élastique
- **Tissu** : très mat, absorbant
- **Pierre** : rugueux, naturel
- **Céramique** : lisse, brillant

### 🎨 Couleurs supportées
- **Couleurs primaires** : rouge, vert, bleu
- **Couleurs secondaires** : jaune, orange, violet
- **Couleurs neutres** : noir, blanc, gris
- **Couleurs spéciales** : rose, marron

### 🎬 Animations disponibles
- **Rotation** : `"cube qui tourne"`
- **Redimensionnement** : `"sphère qui grandit"`
- **Rebond** : `"objet qui rebondit"`

### 📦 Formats d'export
- **OBJ** : Wavefront (avec matériaux)
- **STL** : Stereolithography
- **FBX** : Autodesk
- **GLTF** : Khronos Group
- **DAE** : Collada
- **BLEND** : Format natif Blender

## Exemples d'utilisation

### Création d'objets simples
```bash
# Cube rouge métallique
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "crée un cube rouge métallique de 2cm"}'

# Sphère bleue en verre
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "une sphère bleue en verre"}'
```

### Création d'objets complexes
```bash
# Pyramide dorée en céramique
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "pyramide dorée en céramique"}'

# Icosphère violette brillante
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "icosphère violette brillante"}'
```

### Animations
```bash
# Animation de rotation
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "cube qui tourne"}'

# Animation de redimensionnement
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "sphère qui grandit"}'
```

### Export
```bash
# Export en STL
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "exporter en STL"}'

# Export en FBX
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "exporter en FBX"}'
```

## API Endpoints

### GET /health
Vérification de santé de l'API
```json
{
  "status": "healthy",
  "service": "blender-3d-api",
  "version": "2.0",
  "timestamp": 1234567890
}
```

### POST /process_message
Traitement d'un message utilisateur
```json
{
  "message": "crée un cube rouge métallique",
  "conversation": []
}
```

### POST /create_shape
Création directe d'une forme
```json
{
  "shape": "cube",
  "size": 2.0,
  "color": [1.0, 0.0, 0.0],
  "material": "metal"
}
```

### POST /export
Export d'un modèle
```json
{
  "format": "stl",
  "filename": "mon_modele.stl"
}
```

### GET /list_files
Liste des fichiers générés
```json
{
  "success": true,
  "files": [
    {
      "name": "model_abc123.obj",
      "size": 1024,
      "created": 1234567890,
      "type": "OBJ"
    }
  ]
}
```

## Intégration avec IAHome

Le module Blender 3D v2.0 est intégré dans l'application IAHome via :
- **Page dédiée** : `/blender-3d`
- **API Next.js** : `/api/blender-3d` (communique avec l'API Flask)
- **Interface de chat** pour la génération 3D
- **Composant Chat3DMCP** avec support des nouvelles fonctionnalités

## Commandes utiles

```powershell
# Voir les logs
docker-compose -f docker-compose.blender.yml logs -f

# Redémarrer les services
docker-compose -f docker-compose.blender.yml restart

# Voir le statut
docker-compose -f docker-compose.blender.yml ps

# Arrêter les services
docker-compose -f docker-compose.blender.yml down

# Tester l'API
python test-blender-enhanced.py

# Tester simple
python test-blender-api.py
```

## Développement

### Ajouter de nouvelles formes
Modifiez le fichier `blender-scripts/blender_api_enhanced.py` pour ajouter de nouvelles fonctions de génération.

### Ajouter de nouveaux matériaux
Ajoutez de nouveaux types de matériaux dans la fonction `create_material()`.

### Modifier l'interface web
Éditez `blender-webui/index.html` pour personnaliser l'interface.

### Développer l'API Flask
Travaillez dans le dossier `blender-api/` pour modifier l'API Flask.
- `api_server_enhanced.py` : API principale v2.0
- `requirements.txt` : Dépendances Python
- `test-blender-enhanced.py` : Script de test complet

## Dépannage

### Problèmes courants
1. **Ports déjà utilisés** : Vérifiez qu'aucun autre service n'utilise les ports 9090, 9091, 3001
2. **Docker non démarré** : Assurez-vous que Docker Desktop est en cours d'exécution
3. **Permissions** : Exécutez PowerShell en tant qu'administrateur si nécessaire
4. **API Flask non accessible** : Vérifiez que l'API Flask est démarrée sur le port 3001
5. **Blender non installé** : L'API Flask installe Blender automatiquement dans le conteneur

### Logs
```powershell
# Logs de Blender
docker-compose -f docker-compose.blender.yml logs blender-headless

# Logs de l'API
docker-compose -f docker-compose.blender.yml logs blender-api

# Logs de l'interface web
docker-compose -f docker-compose.blender.yml logs blender-webui
```

### Tests de diagnostic
```powershell
# Test de santé de l'API
curl http://localhost:3001/health

# Test de création d'objet
curl -X POST http://localhost:3001/process_message \
  -H "Content-Type: application/json" \
  -d '{"message": "aide"}'

# Test de liste des fichiers
curl http://localhost:3001/list_files
```

## Performance

### Optimisations v2.0
- **Rendu GPU** : Utilisation de Cycles avec support GPU
- **Cache des matériaux** : Réutilisation des matériaux créés
- **Export optimisé** : Export direct sans interface graphique
- **Gestion mémoire** : Nettoyage automatique des objets temporaires

### Recommandations
- **RAM** : Minimum 4GB, recommandé 8GB+
- **GPU** : Support CUDA/OpenCL pour le rendu
- **Stockage** : SSD recommandé pour les fichiers temporaires
- **CPU** : Multi-cœurs pour le traitement parallèle

## Sécurité

### Bonnes pratiques
- **Isolation** : Services conteneurisés
- **Permissions** : Accès limité aux dossiers nécessaires
- **Validation** : Validation des entrées utilisateur
- **Logs** : Surveillance des activités

### Limitations
- **Accès réseau** : Services accessibles uniquement en local
- **Ressources** : Limitation des ressources par conteneur
- **Fichiers** : Validation des types de fichiers d'export

## Support

### Documentation
- **README** : Ce fichier
- **Code** : Commentaires détaillés dans les scripts
- **Tests** : Exemples d'utilisation dans les scripts de test

### Développement
- **GitHub** : Issues et pull requests
- **Email** : Support technique
- **Chat** : Support en temps réel

---

**Version** : 2.0  
**Dernière mise à jour** : 2024  
**Auteur** : Équipe IAHome  
**Licence** : MIT

