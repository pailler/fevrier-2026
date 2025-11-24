# Backend API - Réservation de Consoles

API REST simple pour l'application de réservation de consoles de jeux.

## 🚀 Démarrage

### Installation des dépendances

```bash
cd backend
npm install
```

### Lancer le serveur

```bash
# Mode production
npm start

# Mode développement (avec auto-reload)
npm run dev
```

Le serveur démarre sur le **port 5001** par défaut.

## 📡 Endpoints API

### Health Check
```
GET /api/health
```
Vérifie que le backend est opérationnel.

### Consoles

#### Liste toutes les consoles
```
GET /api/consoles
```
Réponse:
```json
{
  "success": true,
  "consoles": [...]
}
```

#### Obtenir une console spécifique
```
GET /api/consoles/:id
```

### Réservations

#### Liste toutes les réservations
```
GET /api/reservations
```

#### Créer une réservation
```
POST /api/reservations
Content-Type: application/json

{
  "consoleId": "1",
  "userName": "John Doe",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T18:00:00Z"
}
```

#### Annuler une réservation
```
DELETE /api/reservations/:id
```

## 💾 Stockage des données

Les données sont stockées dans `data.json` dans le dossier `backend/`.

Structure:
```json
{
  "consoles": [...],
  "reservations": [...]
}
```

## 🔧 Configuration

### Port personnalisé

Définissez la variable d'environnement `PORT`:
```bash
PORT=6000 npm start
```

## 📝 Exemples d'utilisation

### Avec curl

```bash
# Health check
curl http://localhost:5001/api/health

# Liste des consoles
curl http://localhost:5001/api/consoles

# Créer une réservation
curl -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "consoleId": "1",
    "userName": "Test User",
    "startDate": "2024-01-15T10:00:00Z",
    "endDate": "2024-01-15T18:00:00Z"
  }'

# Annuler une réservation
curl -X DELETE http://localhost:5001/api/reservations/res_1234567890
```

### Avec JavaScript (fetch)

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
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🔒 Sécurité

⚠️ **Note**: Ce backend est conçu pour un usage local/développement. Pour la production, ajoutez:
- Authentification (JWT)
- Validation des données (Joi, express-validator)
- Rate limiting
- HTTPS
- Base de données (PostgreSQL, MongoDB)

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 5001 n'est pas utilisé
- Vérifiez que Node.js est installé: `node --version`

### Erreur de permissions
- Vérifiez les permissions d'écriture pour le fichier `data.json`

### Données perdues
- Les données sont dans `backend/data.json`
- Faites des sauvegardes régulières de ce fichier

