# Guide d'utilisation - Version avec Backend

## 📋 Deux versions disponibles

### Version 1 : Frontend seul (localStorage)
- **Fichier** : `index.html`
- **Stockage** : localStorage du navigateur
- **Avantages** : Fonctionne sans serveur, simple
- **Inconvénients** : Données locales uniquement, pas de partage

### Version 2 : Frontend + Backend (API)
- **Fichier** : `index-backend.html`
- **Stockage** : Fichier JSON sur le serveur (`backend/data.json`)
- **Avantages** : Données centralisées, partageable entre appareils
- **Inconvénients** : Nécessite le serveur backend

## 🚀 Démarrage rapide (Version Backend)

### 1. Démarrer le backend

```bash
cd GameConsoleReservation-Web/backend
npm install  # Si pas encore fait
npm start
```

Le backend démarre sur **http://localhost:5001**

### 2. Démarrer le serveur frontend

Dans un autre terminal :

```bash
cd GameConsoleReservation-Web
python -m http.server 5000
```

### 3. Ouvrir l'application

Ouvrez dans votre navigateur :
- **Version Backend** : http://localhost:5000/index-backend.html
- **Version LocalStorage** : http://localhost:5000/index.html

## 🔍 Différences visuelles

La version backend (`index-backend.html`) affiche :
- Un badge en haut à droite indiquant le statut du backend
- ✅ "Backend Connecté" (vert) si le backend fonctionne
- ❌ "Backend Offline" (rouge) si le backend n'est pas accessible

## 📡 API Backend

### Endpoints disponibles

- `GET /api/health` - Vérifier le statut
- `GET /api/consoles` - Liste des consoles
- `GET /api/consoles/:id` - Détails d'une console
- `GET /api/reservations` - Liste des réservations
- `POST /api/reservations` - Créer une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

### Exemple d'utilisation

```javascript
// Liste des consoles
fetch('http://localhost:5001/api/consoles')
  .then(res => res.json())
  .then(data => console.log(data));

// Créer une réservation
fetch('http://localhost:5001/api/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consoleId: '1',
    userName: 'John Doe',
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-15T18:00:00Z'
  })
});
```

## 💾 Stockage des données

### Version Backend
- **Fichier** : `backend/data.json`
- **Avantage** : Données centralisées, accessible depuis plusieurs appareils
- **Sauvegarde** : Faites des copies régulières de `data.json`

### Version LocalStorage
- **Stockage** : Navigateur (localStorage)
- **Avantage** : Fonctionne hors ligne
- **Inconvénient** : Données par navigateur/appareil

## 🔧 Configuration

### Changer le port du backend

Modifiez `app-backend.js` :
```javascript
const API_BASE_URL = 'http://localhost:VOTRE_PORT/api';
```

Puis modifiez `backend/server.js` :
```javascript
const PORT = process.env.PORT || VOTRE_PORT;
```

### Accéder depuis un autre appareil (iPad)

1. Trouvez l'IP de votre PC :
   ```powershell
   ipconfig
   ```

2. Modifiez `app-backend.js` :
   ```javascript
   const API_BASE_URL = 'http://VOTRE_IP:5001/api';
   ```

3. Sur l'iPad, ouvrez : `http://VOTRE_IP:5000/index-backend.html`

## ⚠️ Dépannage

### Le badge affiche "Backend Offline"

1. Vérifiez que le backend tourne :
   ```bash
   # Testez dans le navigateur
   http://localhost:5001/api/health
   ```

2. Vérifiez la console du navigateur (F12) pour les erreurs CORS

3. Vérifiez que le port 5001 n'est pas bloqué par le firewall

### Erreurs CORS

Le backend est configuré pour accepter toutes les origines. Si vous avez des problèmes :
- Vérifiez que `cors()` est bien utilisé dans `server.js`
- Vérifiez que vous accédez via `http://localhost` et non `file://`

### Les données ne se sauvegardent pas

- Vérifiez les permissions d'écriture sur `backend/data.json`
- Vérifiez les logs du serveur backend

## 📝 Recommandations

- **Développement local** : Utilisez `index.html` (localStorage)
- **Test multi-appareils** : Utilisez `index-backend.html` (API)
- **Production** : Utilisez le backend avec une vraie base de données

## 🎯 Prochaines étapes

Pour améliorer le backend :
1. Ajouter une base de données (PostgreSQL, MongoDB)
2. Ajouter l'authentification (JWT)
3. Ajouter la validation des données
4. Ajouter le rate limiting
5. Déployer sur un serveur cloud

---

**Profitez de votre application avec backend ! 🚀**

