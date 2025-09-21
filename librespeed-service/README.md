# Service d'authentification LibreSpeed - IAHome

Ce service implémente l'authentification centralisée pour LibreSpeed, en utilisant la même logique que le module QR codes.

## 🎯 Fonctionnalités

- **Authentification par token JWT** : Validation des tokens d'IAHome
- **Page d'erreur pour accès non autorisés** : Affichage d'une page d'erreur pour les accès directs
- **Redirection vers LibreSpeed** : Accès autorisé redirige vers le service LibreSpeed réel
- **API de validation de token** : Endpoint pour valider les tokens d'authentification

## 🏗️ Architecture

```
librespeed.iahome.fr
    ↓
Service d'authentification (port 7006)
    ↓
[Token valide] → Redirection vers LibreSpeed (port 80)
[Pas de token] → Page d'erreur HTML
```

## 📁 Structure des fichiers

```
librespeed-service/
├── librespeed_service.py    # Service Flask principal
├── Dockerfile              # Configuration Docker
├── requirements.txt        # Dépendances Python
├── docker-compose.yml      # Configuration Docker Compose
└── README.md              # Documentation
```

## 🚀 Déploiement

### Déploiement automatique
```powershell
# Depuis la racine du projet
.\deploy-librespeed-complete.ps1
```

### Déploiement manuel
```powershell
# 1. Aller dans le répertoire du service
cd librespeed-service

# 2. Construire l'image Docker
docker build -t librespeed-auth:latest .

# 3. Démarrer le service
docker-compose up -d

# 4. Vérifier la santé
curl http://localhost:7006/health
```

## 🔧 Configuration

### Variables d'environnement
- `IAHOME_JWT_SECRET` : Clé secrète pour la validation JWT (défaut: `your-super-secret-jwt-key-change-in-production`)

### Ports
- **7006** : Service d'authentification LibreSpeed

## 📡 API Endpoints

### GET /
- **Description** : Page principale avec authentification
- **Comportement** :
  - Avec token valide → Redirection vers LibreSpeed
  - Sans token → Page d'erreur HTML

### GET /health
- **Description** : Endpoint de santé
- **Réponse** : Status du service

### POST /api/validate-token
- **Description** : Validation d'un token JWT
- **Body** : `{"token": "jwt_token"}`
- **Réponse** : Informations utilisateur ou erreur

## 🔒 Workflow d'authentification

1. **Accès via module IAHome** :
   - Utilisateur clique sur le bouton LibreSpeed
   - Token JWT généré et ajouté à l'URL
   - Service valide le token
   - Redirection vers LibreSpeed

2. **Accès direct** :
   - Utilisateur accède directement à librespeed.iahome.fr
   - Aucun token présent
   - Page d'erreur affichée avec message d'authentification

## 🧪 Tests

### Test automatique
```powershell
.\test-librespeed-auth.ps1
```

### Tests manuels
```bash
# Test de santé
curl http://localhost:7006/health

# Test sans token (doit afficher la page d'erreur)
curl http://localhost:7006/

# Test avec token (doit rediriger)
curl "http://localhost:7006/?token=test_token"
```

## 📋 Logs

```bash
# Voir les logs du service
docker logs librespeed-auth

# Suivre les logs en temps réel
docker logs -f librespeed-auth
```

## 🔄 Redémarrage

```powershell
# Redémarrer le service
cd librespeed-service
docker-compose restart

# Redémarrer avec reconstruction
docker-compose down
docker-compose up -d --build
```

## 🆚 Comparaison avec le module QR codes

| Aspect | QR Codes | LibreSpeed |
|--------|----------|------------|
| Authentification | JWT + tokens d'accès | JWT + tokens d'accès |
| Page d'erreur | HTML intégré | HTML intégré |
| Redirection | Interface complète | Vers service LibreSpeed |
| Port | 7005 | 7006 |
| Audience JWT | `qr-code-service` | `librespeed-service` |

## 🐛 Dépannage

### Service ne démarre pas
```bash
# Vérifier les logs
docker logs librespeed-auth

# Vérifier la configuration
docker-compose config
```

### Page d'erreur non affichée
- Vérifier que le service répond sur le port 7006
- Vérifier la configuration Traefik
- Vérifier la configuration Cloudflare

### Redirection ne fonctionne pas
- Vérifier que le service LibreSpeed est accessible
- Vérifier les logs du service d'authentification
- Vérifier la validation des tokens

## 📝 Notes de développement

- Le service utilise Flask avec CORS activé
- La validation JWT utilise PyJWT
- Le service est conçu pour être stateless
- Les erreurs sont loggées avec le module logging Python


