# 📱 Guide des Versions

## Deux versions disponibles

### 🔵 Version 1 : LocalStorage (Standalone)

**Fichier** : `index.html`

**Caractéristiques** :
- ✅ Fonctionne sans serveur backend
- ✅ Données stockées dans le navigateur (localStorage)
- ✅ Fonctionne hors ligne
- ✅ Simple à déployer (juste des fichiers HTML/CSS/JS)
- ❌ Données locales uniquement (par navigateur)
- ❌ Pas de partage entre appareils

**Utilisation** :
1. Ouvrez `index.html` directement dans le navigateur
2. Ou servez avec : `python -m http.server 5000`
3. Accédez à : http://localhost:5000/index.html

**Badge** : 💾 LocalStorage (bleu, en haut à droite)

---

### 🟢 Version 2 : Backend API

**Fichier** : `index-backend.html`

**Caractéristiques** :
- ✅ Données centralisées sur le serveur
- ✅ Partageable entre plusieurs appareils
- ✅ API REST complète
- ✅ Données persistantes dans `backend/data.json`
- ❌ Nécessite le serveur backend en cours d'exécution
- ❌ Plus complexe à déployer

**Utilisation** :
1. Démarrez le backend : `cd backend && npm start`
2. Démarrez le serveur frontend : `python -m http.server 5000`
3. Accédez à : http://localhost:5000/index-backend.html

**Badge** : 
- ✅ Backend Connecté (vert) - Backend accessible
- ❌ Backend Offline (rouge) - Backend non accessible

---

## 🚀 Démarrage rapide

### Version LocalStorage

```bash
# Option 1 : Ouvrir directement
# Double-cliquez sur index.html

# Option 2 : Serveur local
cd GameConsoleReservation-Web
python -m http.server 5000
# Ouvrez : http://localhost:5000/index.html
```

### Version Backend

```bash
# Terminal 1 : Backend
cd GameConsoleReservation-Web/backend
npm install
npm start
# Backend sur http://localhost:5001

# Terminal 2 : Frontend
cd GameConsoleReservation-Web
python -m http.server 5000
# Ouvrez : http://localhost:5000/index-backend.html
```

## 📊 Comparaison

| Fonctionnalité | LocalStorage | Backend API |
|----------------|--------------|-------------|
| Installation | ✅ Simple | ⚠️ Nécessite Node.js |
| Serveur requis | ❌ Non | ✅ Oui |
| Données partagées | ❌ Non | ✅ Oui |
| Fonctionne hors ligne | ✅ Oui | ❌ Non |
| API REST | ❌ Non | ✅ Oui |
| Multi-appareils | ❌ Non | ✅ Oui |
| Base de données | ❌ Non | ✅ JSON (fichier) |

## 🎯 Quelle version choisir ?

### Choisissez LocalStorage si :
- Vous testez seul
- Vous voulez quelque chose de simple
- Vous n'avez pas besoin de partager les données
- Vous voulez que ça fonctionne hors ligne

### Choisissez Backend si :
- Vous voulez partager les données entre appareils
- Vous avez besoin d'une API
- Vous prévoyez d'ajouter des fonctionnalités avancées
- Vous voulez centraliser les données

## 📁 Structure des fichiers

```
GameConsoleReservation-Web/
├── index.html              # Version LocalStorage
├── index-backend.html      # Version Backend
├── app.js                  # Code LocalStorage
├── app-backend.js          # Code Backend
├── styles.css              # Styles (commun)
├── backend/                # Serveur backend
│   ├── server.js
│   ├── package.json
│   └── data.json          # Données (créé automatiquement)
├── README.md               # Documentation générale
├── README-BACKEND.md       # Guide backend
└── VERSIONS.md            # Ce fichier
```

## 🔄 Migration entre versions

### De LocalStorage vers Backend

Les données ne sont pas automatiquement migrées. Vous devrez :
1. Exporter les données depuis localStorage (console navigateur)
2. Les importer via l'API backend

### De Backend vers LocalStorage

Les données du backend sont dans `backend/data.json`. Vous pouvez les copier manuellement.

## 🆘 Aide

- **Problème avec LocalStorage** : Vérifiez que les cookies/localStorage ne sont pas désactivés
- **Problème avec Backend** : Vérifiez que le serveur tourne sur le port 5001
- **Badge rouge** : Le backend n'est pas accessible, vérifiez `http://localhost:5001/api/health`

---

**Bon développement ! 🎮**

