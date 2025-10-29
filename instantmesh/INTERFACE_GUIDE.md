# 🎨 Guide d'utilisation de l'interface InstantMesh

## 📍 Accès

- **Développement local** : `http://localhost:3000/instantmesh`
- **Production** : `https://iahome.fr/instantmesh`

## 🎯 Fonctionnalités principales

### 1. **Upload d'image**
- Cliquez sur la zone de drop pour sélectionner une image
- Formats supportés : JPG, PNG, WEBP
- Prévisualisation instantanée après sélection

### 2. **Génération 3D**
- Cliquez sur "Générer le modèle 3D"
- Barre de progression en temps réel
- Durée : 2-5 minutes environ

### 3. **Résultats**
- Liste des fichiers générés avec taille et date
- Bouton de téléchargement direct
- Format : `.obj` (compatible Blender, C4D, Unity)

## 🎨 Design inspiré de ComfyUI

### Interface moderne
- **Thème sombre** : Fond gris-noir avec effets glassmorphism
- **Couleurs** : Dégradés violet-rose-cyan
- **Effets visuels** : Backdrop blur, bordures lumineuses
- **Animations** : Transitions fluides sur les interactions

### Layout
- **Colonne gauche** : Upload et contrôles
- **Colonne droite** : Fichiers générés et informations

## 🔧 Fonctionnalités techniques

### Barre de progression
- Affichage en temps réel (0-100%)
- Mise à jour toutes les secondes
- Message informatif sur la durée estimée

### Gestion des fichiers
- Liste automatique des fichiers générés
- Affichage de la taille (MB)
- Date de création
- Bouton de téléchargement

### Messages d'aide
- **Instructions d'utilisation** : Étapes pour générer un modèle
- **Conseils** : Meilleures pratiques pour les portraits

## 📋 Exemple de workflow

1. **Sélectionnez une image**
   ```
   📸 Cliquez sur "Cliquez pour sélectionner une image"
   → Choisissez un portrait de haute qualité
   ```

2. **Prévisualisez**
   ```
   👁️ L'image apparaît en aperçu
   ✅ Vous pouvez réinitialiser ou changer d'image
   ```

3. **Générez**
   ```
   ✨ Cliquez sur "Générer le modèle 3D"
   → Barre de progression s'affiche
   → Attendez 2-5 minutes
   ```

4. **Téléchargez**
   ```
   📥 Le fichier apparaît dans la liste
   → Cliquez sur "Télécharger"
   → Importez dans votre logiciel 3D
   ```

## 🎨 Conseils pour de meilleurs résultats

### ✅ À faire
- Utilisez des portraits de haute qualité (>1000px)
- Sujet centré et bien cadré
- Fond uni (blanc ou coloré)
- Visage de face ou légèrement de profil
- Bonne lumière sur le visage

### ❌ À éviter
- Images trop floues
- Multiples personnes
- Fond complexe/busy
- Visages de profil extrême
- Éclairage trop contrasté

## 🔄 États de l'interface

### État initial
```
📭 Aucun fichier généré
→ Zone de drop visible
→ Message informatif
```

### Image sélectionnée
```
📷 Prévisualisation affichée
→ Bouton "Générer" apparaît
→ Peut changer ou réinitialiser
```

### Génération en cours
```
⏳ Barre de progression animée
→ Messages informatifs
→ Bouton désactivé
```

### Succès
```
✅ Message de confirmation
→ Bouton de téléchargement
→ Fichier dans la liste
```

### Erreur
```
❌ Message d'erreur
→ Détails du problème
→ Possibilité de réessayer
```

## 🚀 Prochaines améliorations

- [ ] Preview 3D directement dans le navigateur
- [ ] Historique des générations
- [ ] Paramètres avancés (résolution, qualité)
- [ ] Partage de fichiers entre utilisateurs
- [ ] Export vers formats supplémentaires (GLB, STL)

---

**Note** : L'interface est entièrement responsive et fonctionne sur mobile, tablette et desktop.

