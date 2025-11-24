# Guide d'installation du Backend

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
cd GameConsoleReservation-Web/backend
npm install
```

### 2. Démarrer le serveur backend

```bash
npm start
```

Le backend démarre sur le **port 5001**.

### 3. Modifier le frontend pour utiliser le backend

Dans `index.html`, remplacez:
```html
<script src="app.js"></script>
```

Par:
```html
<script src="app-backend.js"></script>
```

### 4. Démarrer le serveur frontend

Dans un autre terminal:
```bash
cd GameConsoleReservation-Web
python -m http.server 5000
```

## 📡 Accès au backend

### URLs importantes

- **API Backend**: http://localhost:5001
- **Frontend**: http://localhost:5000
- **Health Check**: http://localhost:5001/api/health

### Endpoints disponibles

- `GET /api/health` - Vérifier que le backend fonctionne
- `GET /api/consoles` - Liste toutes les consoles
- `GET /api/consoles/:id` - Obtenir une console
- `GET /api/reservations` - Liste toutes les réservations
- `POST /api/reservations` - Créer une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

## 🧪 Tester le backend

### Avec le navigateur

Ouvrez: http://localhost:5001/api/health

Vous devriez voir:
```json
{
  "success": true,
  "message": "Backend opérationnel",
  "timestamp": "...",
  "port": 5001
}
```

### Avec curl

```bash
# Health check
curl http://localhost:5001/api/health

# Liste des consoles
curl http://localhost:5001/api/consoles

# Créer une réservation
curl -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d "{\"consoleId\":\"1\",\"userName\":\"Test\",\"startDate\":\"2024-01-15T10:00:00Z\",\"endDate\":\"2024-01-15T18:00:00Z\"}"
```

## 📁 Fichiers de données

Les données sont stockées dans:
```
GameConsoleReservation-Web/backend/data.json
```

Ce fichier est créé automatiquement au premier démarrage.

## 🔧 Configuration

### Changer le port

Modifiez `server.js` ou définissez la variable d'environnement:
```bash
PORT=6000 npm start
```

### Mode développement (auto-reload)

```bash
npm run dev
```

## ⚠️ Problèmes courants

### Port déjà utilisé

Si le port 5001 est occupé:
1. Changez le port dans `server.js`
2. Ou tuez le processus: `netstat -ano | findstr :5001`

### CORS errors

Le backend est configuré pour accepter toutes les origines. Si vous avez des problèmes:
- Vérifiez que le backend tourne
- Vérifiez l'URL dans `app-backend.js` (API_BASE_URL)

### Données perdues

Les données sont dans `backend/data.json`. Faites des sauvegardes régulières.

## 📝 Notes

- Le backend utilise un fichier JSON simple (pas de base de données)
- Parfait pour le développement et les petits projets
- Pour la production, considérez une vraie base de données (PostgreSQL, MongoDB)

