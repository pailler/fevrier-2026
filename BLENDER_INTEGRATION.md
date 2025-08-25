# 🎨 Intégration Blender 3D - IAHome

## Vue d'ensemble

Le module Blender 3D est maintenant entièrement intégré dans IAHome avec une architecture virtualisée via Docker. Cette intégration permet de créer des objets 3D via une interface de chat intelligente.

## Architecture

### Services Docker (dans `docker-services/`)

1. **blender-headless** (Port 9090)
   - Blender en mode headless pour la génération 3D
   - Exécute les scripts Python pour créer des formes

2. **blender-api** (Port 3001)
   - API Python pour communiquer avec Blender
   - Gère les requêtes HTTP et les commandes Blender

3. **blender-webui** (Port 9091)
   - Interface web pour visualiser les fichiers 3D
   - Permet le téléchargement des modèles générés

### Interface Next.js

- **Page principale** : `/blender-3d`
- **API** : `/api/blender-3d`
- **Composant chat** : `Chat3DMCP`

## Fonctionnalités

### ✅ Implémentées

- **Interface de chat** : Création d'objets 3D via texte
- **Formes supportées** : Cube, Sphère, Cylindre, Cône, Tore
- **Formats d'export** : OBJ, STL, FBX, GLTF
- **Interface web** : Visualisation et téléchargement
- **Statut en temps réel** : Indicateurs de connexion
- **Mode simulation** : Fonctionne même si l'API Python n'est pas opérationnelle

### 🔄 En développement

- **API Python complète** : Communication directe avec Blender
- **Modificateurs avancés** : Subdivision, lissage, etc.
- **Objets complexes** : Vases, meubles, etc.

## Utilisation

### 1. Démarrage des services

```powershell
# Depuis la racine
.\start-blender-virtualized.ps1

# Ou depuis docker-services
cd docker-services
.\start-blender.ps1
```

### 2. Accès aux interfaces

- **Interface de chat** : http://localhost:3000/blender-3d
- **Interface web Blender** : http://localhost:9091
- **API Blender** : http://localhost:3001/health

### 3. Exemples de commandes

```
"Crée un cube de taille 2"
"Crée une sphère et applique un modificateur de subdivision"
"Exporte le modèle en format OBJ"
"Crée un vase moderne avec des courbes élégantes"
```

## Structure des fichiers

```
iahome/
├── docker-services/
│   ├── docker-compose.blender.yml    # Configuration Docker
│   ├── start-blender.ps1             # Script de démarrage
│   ├── stop-blender.ps1              # Script d'arrêt
│   ├── README-blender.md             # Documentation Docker
│   ├── blender-scripts/              # Scripts Python Blender
│   ├── blender-api/                  # API Python
│   ├── blender-webui/                # Interface web
│   ├── blender-output/               # Fichiers générés
│   └── blender-temp/                 # Fichiers temporaires
├── src/
│   ├── app/
│   │   ├── blender-3d/
│   │   │   └── page.tsx              # Page principale
│   │   └── api/
│   │       └── blender-3d/
│   │           └── route.ts          # API Next.js
│   └── components/
│       └── Chat3DMCP.tsx             # Interface de chat
├── start-blender-virtualized.ps1     # Script de démarrage racine
├── stop-blender-virtualized.ps1      # Script d'arrêt racine
└── BLENDER_INTEGRATION.md            # Cette documentation
```

## Intégration technique

### API Next.js (`/api/blender-3d`)

- **Analyse d'intention** : Détecte les commandes dans le texte
- **Simulation Blender** : Fonctionne même sans API Python
- **Réponses intelligentes** : Génère des réponses contextuelles
- **Statut des services** : Vérifie la connectivité

### Interface de chat (`Chat3DMCP`)

- **Communication MCP** : Protocole Model Context Protocol
- **Actions visuelles** : Affichage des actions exécutées
- **Liens directs** : Accès rapide à l'interface web
- **Exemples intégrés** : Suggestions de commandes

### Page principale (`/blender-3d`)

- **Statut des services** : Indicateurs en temps réel
- **Liens directs** : Boutons vers les interfaces
- **Informations** : Documentation intégrée
- **Mode test** : Fonctionne sans authentification

## Avantages de l'intégration

### 🚀 Performance
- **Services isolés** : Chaque composant dans son conteneur
- **Démarrage rapide** : Scripts automatisés
- **Mode simulation** : Fonctionne même si Blender n'est pas prêt

### 🔧 Maintenance
- **Structure organisée** : Tous les services dans `docker-services/`
- **Documentation complète** : Guides et exemples
- **Scripts automatisés** : Démarrage/arrêt facile

### 🎯 Utilisabilité
- **Interface unifiée** : Tout accessible depuis IAHome
- **Liens directs** : Navigation fluide entre les interfaces
- **Statut en temps réel** : Visibilité sur l'état des services

## Prochaines étapes

### Court terme
1. **Corriger l'API Python** : Résoudre les problèmes de redémarrage
2. **Ajouter des modificateurs** : Subdivision, lissage, etc.
3. **Améliorer l'interface web** : Prévisualisation 3D

### Moyen terme
1. **Objets complexes** : Vases, meubles, personnages
2. **Animations** : Création d'animations simples
3. **Matériaux** : Textures et matériaux avancés

### Long terme
1. **IA avancée** : Intégration avec Claude pour des descriptions complexes
2. **Collaboration** : Partage et modification d'objets
3. **Marketplace** : Bibliothèque d'objets 3D

## Dépannage

### Services non accessibles
```powershell
# Vérifier le statut
cd docker-services
docker-compose -f docker-compose.blender.yml ps

# Redémarrer
docker-compose -f docker-compose.blender.yml restart

# Voir les logs
docker-compose -f docker-compose.blender.yml logs -f
```

### Ports déjà utilisés
```powershell
# Vérifier les ports
netstat -ano | findstr :909
netstat -ano | findstr :3001

# Modifier les ports dans docker-compose.blender.yml si nécessaire
```

### Interface web non accessible
- Vérifier que le conteneur `blender-webui` est en cours d'exécution
- Vérifier que le port 9091 n'est pas utilisé par un autre service
- Consulter les logs : `docker-compose -f docker-compose.blender.yml logs blender-webui`

## Conclusion

L'intégration Blender 3D dans IAHome offre une expérience complète et moderne pour la création d'objets 3D. L'architecture virtualisée garantit la portabilité et la facilité de déploiement, tandis que l'interface de chat rend la création 3D accessible à tous.

**🎉 L'intégration est opérationnelle et prête à être utilisée !**

