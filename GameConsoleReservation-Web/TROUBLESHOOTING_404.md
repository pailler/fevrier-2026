# 🔧 Résolution de l'erreur 404

## Problème
Erreur : `Failed to load resource: the server responded with a status of 404 (File not found)`

## ✅ Vérifications

### 1. Vérifier que le serveur est lancé depuis le bon répertoire

Le serveur Python doit être lancé **depuis le répertoire `GameConsoleReservation-Web`** :

```bash
# Bon chemin
cd GameConsoleReservation-Web
python -m http.server 5000
```

**❌ Ne PAS faire** :
```bash
cd iahome
python -m http.server 5000  # ❌ Mauvais répertoire
```

### 2. Vérifier que les fichiers existent

Les fichiers suivants doivent être dans `GameConsoleReservation-Web/` :
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `barcode-scanner.js`
- ✅ `app-backend.js`

### 3. Vérifier l'URL

Utilisez : **http://localhost:5000/** ou **http://localhost:5000/index.html**

**❌ Ne PAS utiliser** :
- `http://localhost:5000/GameConsoleReservation-Web/index.html` ❌

## 🔧 Solution

### Étape 1 : Arrêter le serveur actuel
Appuyez sur `Ctrl+C` dans le terminal où le serveur tourne.

### Étape 2 : Relancer depuis le bon répertoire

```bash
# Windows PowerShell
cd C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web
python -m http.server 5000
```

### Étape 3 : Vérifier dans le navigateur

1. Ouvrez : http://localhost:5000/
2. Ouvrez la console (F12)
3. Vérifiez qu'il n'y a plus d'erreur 404

## 🐛 Si le problème persiste

### Vérifier le répertoire de travail

Dans PowerShell :
```powershell
Get-Location
# Doit afficher : C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web
```

### Vérifier que les fichiers sont accessibles

```powershell
Test-Path "index.html"
Test-Path "styles.css"
Test-Path "barcode-scanner.js"
Test-Path "app-backend.js"
# Tous doivent retourner True
```

### Vider le cache du navigateur

- **Chrome/Edge** : Ctrl+Shift+Delete ou Ctrl+F5
- **Safari** : Cmd+Option+E
- Ou ouvrir en navigation privée

## 📋 Checklist

- [ ] Serveur lancé depuis `GameConsoleReservation-Web/`
- [ ] Tous les fichiers présents dans le répertoire
- [ ] URL correcte : http://localhost:5000/
- [ ] Cache du navigateur vidé
- [ ] Console du navigateur vérifiée (F12)

---

**Le problème vient généralement du fait que le serveur n'est pas lancé depuis le bon répertoire !**

