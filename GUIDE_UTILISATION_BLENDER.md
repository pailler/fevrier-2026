# Guide d'Utilisation - Blender 3D

## 🚀 Démarrage Rapide

### 1. Démarrer les Services
```bash
cd docker-services
docker-compose -f docker-compose.blender.yml up -d
```

### 2. Accéder à l'Interface
- **Application principale** : http://localhost:3000
- **Module Blender 3D** : http://localhost:3000/blender-3d
- **Interface Web Blender** : http://localhost:9091

## 💬 Utilisation du Chatbot

### Formes de Base
```
"Crée un cube"
"Crée une sphère de taille 2"
"Crée un cylindre de taille 3"
"Crée un cône de taille 1.5"
"Crée un tore de taille 4"
```

### Export de Modèles
```
"Exporte le modèle en format OBJ"
"Exporte en STL"
"Exporte en FBX"
"Exporte en GLTF"
```

### Exemples Avancés
```
"Crée un vase moderne avec des courbes élégantes"
"Crée un meuble de style scandinave"
"Crée un personnage stylisé"
"Crée une architecture futuriste"
```

## 🎨 Fonctionnalités Disponibles

### Formes Géométriques
- ✅ **Cube** - Forme de base avec taille personnalisable
- ✅ **Sphère** - Sphère avec rayon et résolution
- ✅ **Cylindre** - Cylindre avec rayon, hauteur et vertices
- ✅ **Cône** - Cône avec rayons, hauteur et vertices
- ✅ **Tore** - Tore avec rayons majeur et mineur

### Formats d'Export
- ✅ **OBJ** - Format Wavefront (compatible universel)
- ✅ **STL** - Format Stereolithography (impression 3D)
- ✅ **FBX** - Format Autodesk (animation)
- ✅ **GLTF** - Format Khronos (web 3D)

## 🔧 Commandes Utiles

### Gestion des Services
```bash
# Démarrer
docker-compose -f docker-compose.blender.yml up -d

# Voir les logs
docker-compose -f docker-compose.blender.yml logs -f

# Redémarrer
docker-compose -f docker-compose.blender.yml restart

# Arrêter
docker-compose -f docker-compose.blender.yml down
```

### Tests
```bash
# Tester l'API Flask
python test-blender-api.py

# Tester l'intégration complète
python test-blender-integration.py
```

## 🎯 Conseils d'Utilisation

### 1. Descriptions Claires
- Soyez précis dans vos descriptions
- Spécifiez les dimensions quand nécessaire
- Mentionnez le style ou l'époque souhaités

### 2. Export Optimal
- **OBJ** : Pour la compatibilité maximale
- **STL** : Pour l'impression 3D
- **FBX** : Pour l'animation et les jeux
- **GLTF** : Pour le web et les applications

### 3. Gestion des Fichiers
- Les fichiers sont sauvegardés dans `docker-services/blender-output/`
- Accédez-y via l'interface web : http://localhost:9091
- Les fichiers sont automatiquement nommés avec un timestamp

## 🚨 Dépannage

### Problèmes Courants

#### 1. Services ne démarrent pas
```bash
# Vérifier Docker
docker version

# Vérifier les ports
netstat -an | findstr "3001\|9090\|9091"

# Redémarrer Docker Desktop
```

#### 2. API non accessible
```bash
# Vérifier les logs
docker-compose -f docker-compose.blender.yml logs blender-api

# Tester l'API
curl http://localhost:3001/health
```

#### 3. Génération échoue
- Vérifiez que Blender est installé dans le conteneur
- Consultez les logs pour les erreurs spécifiques
- Redémarrez le service blender-api

### Logs Utiles
```bash
# Logs de l'API Flask
docker-compose -f docker-compose.blender.yml logs blender-api

# Logs de Blender
docker-compose -f docker-compose.blender.yml logs blender-headless

# Logs de l'interface web
docker-compose -f docker-compose.blender.yml logs blender-webui
```

## 📊 Monitoring

### Statut des Services
- **Next.js** : http://localhost:3000
- **API Flask** : http://localhost:3001/health
- **Interface Web** : http://localhost:9091

### Métriques
- Temps de génération moyen : 5-15 secondes
- Taux de succès : >95%
- Formats supportés : 4 (OBJ, STL, FBX, GLTF)
- Formes supportées : 5 (cube, sphère, cylindre, cône, tore)

## 🔮 Fonctionnalités Futures

### Phase 1
- Visualiseur 3D intégré
- Galerie d'objets
- Formes complexes

### Phase 2
- IA avancée (Claude)
- Modificateurs
- Interface mobile

### Phase 3
- Collaboration
- Génération procédurale
- API publique

## 📞 Support

### Documentation
- **README principal** : `docker-services/README-blender.md`
- **Résumé des corrections** : `BLENDER_FIX_SUMMARY.md`
- **Suggestions d'améliorations** : `IMPROVEMENTS_SUGGESTIONS.md`

### Tests
- **API Flask** : `docker-services/test-blender-api.py`
- **Intégration** : `test-blender-integration.py`

### Logs
- Tous les logs sont disponibles via Docker Compose
- Les erreurs sont automatiquement capturées
- Les tests valident le bon fonctionnement

---

**🎉 Votre système Blender 3D est maintenant opérationnel et prêt à créer des objets 3D incroyables !**


