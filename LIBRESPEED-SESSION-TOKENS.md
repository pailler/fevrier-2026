# LibreSpeed - Système de Tokens de Session

## Vue d'ensemble

Le système de tokens de session pour LibreSpeed permet de gérer l'authentification de manière sécurisée avec révocation automatique lors de la déconnexion.

## Fonctionnalités

### ✅ Tokens de Session
- **Création automatique** lors de la connexion
- **Validation en temps réel** avec vérification de base de données
- **Expiration configurable** (par défaut 24h)
- **Révocation immédiate** lors de la déconnexion
- **Nettoyage automatique** des tokens expirés

### ✅ Sécurité
- **Tokens uniques** générés avec UUID
- **Validation côté serveur** avec base de données PostgreSQL
- **Révocation par utilisateur** (tous les tokens d'un utilisateur)
- **Révocation individuelle** (token spécifique)
- **Logs détaillés** pour audit

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   IAHome.fr     │───▶│  LibreSpeed Auth │───▶│   PostgreSQL    │
│  (Application)  │    │   (Port 7006)    │    │  (Port 5432)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Création Token │    │  Validation      │    │  librespeed_    │
│  Révocation     │    │  Révocation      │    │  session_tokens │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Endpoints

### 1. Créer un Token de Session
```http
POST /api/create-session-token
Content-Type: application/json

{
  "userId": "user123",
  "userEmail": "user@example.com",
  "duration_hours": 24
}
```

**Réponse:**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6g7h8i9j0",
  "userId": "user123",
  "userEmail": "user@example.com",
  "expires_in_hours": 24,
  "timestamp": "2025-09-21T22:29:32.123456"
}
```

### 2. Révoquer un Token Spécifique
```http
POST /api/revoke-session-token
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6g7h8i9j0"
}
```

### 3. Révoquer Tous les Tokens d'un Utilisateur
```http
POST /api/revoke-user-tokens
Content-Type: application/json

{
  "userId": "user123"
}
```

## Scripts PowerShell

### Créer un Token de Session
```powershell
.\create-librespeed-session-token.ps1 "user123" "user@example.com" 24
```

### Révoquer les Tokens lors de la Déconnexion
```powershell
.\revoke-librespeed-tokens-on-logout.ps1 "user123"
```

### Tester le Système
```powershell
.\test-session-tokens.ps1
```

## Base de Données

### Table: `librespeed_session_tokens`
```sql
CREATE TABLE librespeed_session_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Index pour Performance
- `idx_librespeed_tokens_token` - Recherche par token
- `idx_librespeed_tokens_user_id` - Recherche par utilisateur
- `idx_librespeed_tokens_expires_at` - Nettoyage des tokens expirés
- `idx_librespeed_tokens_active` - Filtrage des tokens actifs

## Intégration avec IAHome.fr

### 1. Lors de la Connexion
```javascript
// Créer un token de session pour LibreSpeed
const response = await fetch('/api/create-librespeed-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    userEmail: user.email,
    duration_hours: 24
  })
});

const { token } = await response.json();
// Rediriger vers LibreSpeed avec le token
window.location.href = `https://librespeed.iahome.fr/?token=${token}`;
```

### 2. Lors de la Déconnexion
```javascript
// Révoquer tous les tokens LibreSpeed de l'utilisateur
await fetch('/api/revoke-librespeed-tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id })
});
```

## Déploiement

### 1. Initialiser la Base de Données
```powershell
cd librespeed-service
.\init-database.ps1
```

### 2. Démarrer les Services
```powershell
.\deploy-librespeed-session-tokens.ps1
```

### 3. Vérifier le Fonctionnement
```powershell
.\test-session-tokens.ps1
```

## Configuration

### Variables d'Environnement
```bash
IAHOME_JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
```

### Docker Compose
```yaml
services:
  librespeed-auth:
    build: .
    ports:
      - "7006:7006"
    environment:
      - IAHOME_JWT_SECRET=${IAHOME_JWT_SECRET}
      - DATABASE_URL=postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=qrcode_db
      - POSTGRES_USER=qrcode_user
      - POSTGRES_PASSWORD=qrcode_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init_session_tokens.sql:/docker-entrypoint-initdb.d/init_session_tokens.sql
```

## Sécurité

### ✅ Bonnes Pratiques Implémentées
- **Tokens uniques** générés avec UUID
- **Expiration automatique** des tokens
- **Validation côté serveur** avec base de données
- **Révocation immédiate** lors de la déconnexion
- **Nettoyage automatique** des tokens expirés
- **Logs détaillés** pour audit et debugging

### ⚠️ Recommandations
- **Changer le secret JWT** en production
- **Utiliser HTTPS** pour toutes les communications
- **Configurer des durées d'expiration** appropriées
- **Monitorer les logs** pour détecter les anomalies
- **Sauvegarder régulièrement** la base de données

## Monitoring

### Logs Importants
- Création de tokens
- Validation de tokens
- Révocation de tokens
- Erreurs de validation
- Nettoyage des tokens expirés

### Métriques à Surveiller
- Nombre de tokens actifs par utilisateur
- Durée moyenne d'utilisation des tokens
- Taux d'échec de validation
- Fréquence de révocation

## Dépannage

### Problèmes Courants

1. **Token invalide après création**
   - Vérifier la connexion à la base de données
   - Vérifier les logs du service LibreSpeed Auth

2. **Token non révoqué après déconnexion**
   - Vérifier l'appel à l'API de révocation
   - Vérifier les logs de la base de données

3. **Service LibreSpeed Auth inaccessible**
   - Vérifier que Docker est en cours d'exécution
   - Vérifier les logs du conteneur
   - Vérifier la configuration du réseau

### Commandes de Diagnostic
```powershell
# Vérifier l'état des services
docker-compose ps

# Voir les logs
docker-compose logs librespeed-auth
docker-compose logs postgres

# Tester l'API
Invoke-RestMethod -Uri "http://localhost:7006/health"
```

## Conclusion

Le système de tokens de session pour LibreSpeed est maintenant entièrement fonctionnel et sécurisé. Il permet une gestion fine de l'authentification avec révocation automatique lors de la déconnexion, garantissant que les utilisateurs ne peuvent plus accéder à LibreSpeed une fois déconnectés d'IAHome.fr.
