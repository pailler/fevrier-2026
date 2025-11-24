# 📁 Structure du projet

## ✅ Tous les fichiers sont dans `GameConsoleReservation-Web/`

### Fichiers principaux (racine)
```
GameConsoleReservation-Web/
├── index.html              ✅ Page principale
├── styles.css              ✅ Styles CSS
├── app-backend.js          ✅ Logique JavaScript (backend)
├── barcode-scanner.js      ✅ Gestionnaire de scan code-barres
└── app.js                  ⚠️  Version localStorage (non utilisée)
```

### Backend
```
GameConsoleReservation-Web/
└── backend/
    ├── server.js           ✅ Serveur Express
    ├── package.json        ✅ Dépendances Node.js
    ├── data.json           ✅ Données (créé automatiquement)
    └── node_modules/        ✅ Modules npm
```

### Documentation
```
GameConsoleReservation-Web/
├── README.md
├── README-BACKEND.md
├── README-BARCODE.md
├── BACKEND_SETUP.md
├── CHANGELOG.md
├── FONCTIONNALITES.md
├── VERSIONS.md
├── VERIFICATION.md
├── VERIFICATION_COMPLETE.md
├── TEST_AFFICHAGE.md
├── TROUBLESHOOTING_404.md
└── STRUCTURE.md (ce fichier)
```

## 🔗 Chemins dans index.html

Tous les chemins sont **relatifs** (pas de chemins absolus) :

```html
<link rel="stylesheet" href="styles.css">
<script src="barcode-scanner.js"></script>
<script src="app-backend.js"></script>
```

✅ **Tous les fichiers sont accessibles depuis la racine de `GameConsoleReservation-Web/`**

## 🚀 Démarrage

### Depuis le répertoire racine du projet
```bash
cd GameConsoleReservation-Web
python -m http.server 5000
```

### Backend
```bash
cd GameConsoleReservation-Web/backend
npm start
```

## ✅ Vérification

Tous les fichiers nécessaires sont présents :
- ✅ `index.html` - Page principale
- ✅ `styles.css` - Styles
- ✅ `app-backend.js` - Logique backend
- ✅ `barcode-scanner.js` - Scanner
- ✅ `backend/server.js` - Serveur API
- ✅ `backend/package.json` - Dépendances

## 📝 Notes

- Le fichier `app.js` est présent mais non utilisé (version localStorage)
- Le fichier `test-consoles.json` peut être supprimé (fichier de test)
- Tous les chemins dans `index.html` sont relatifs ✅

---

**Tout est bien organisé dans `GameConsoleReservation-Web/` !**

