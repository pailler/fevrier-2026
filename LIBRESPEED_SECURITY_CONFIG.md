# Configuration de Sécurisation LibreSpeed

## Vue d'ensemble

Cette configuration implémente une sécurisation complète de l'accès à LibreSpeed en utilisant :
- **Traefik** comme reverse proxy
- **Cloudflare** pour la gestion SSL et les règles de sécurité
- **Système de tokens** existant pour l'authentification
- **Vérification des modules** activés dans le tableau de bord

## Architecture de Sécurisation

### 1. Blocage de l'Accès Direct
- L'accès direct à `librespeed.iahome.fr` est **interdit**
- Toute tentative d'accès direct est redirigée vers l'API de redirection
- Page de blocage personnalisée pour les accès non autorisés

### 2. Flux d'Authentification
```
Utilisateur → iahome.fr/encours → Module LibreSpeed → Token généré → LibreSpeed sécurisé
```

### 3. Composants de Sécurité

#### APIs Créées
- `/api/redirect-librespeed` - Redirection principale avec génération de token
- `/api/librespeed-auth-check` - Vérification d'authentification
- `/api/librespeed-token-validator` - Validation des tokens
- `/api/librespeed-blocked` - Page de blocage

#### Middlewares Traefik
- `librespeed-token-redirect` - Redirection vers l'API
- `librespeed-token-validator` - Validation des tokens
- `librespeed-token-block` - Blocage des accès non autorisés

## Configuration des Fichiers

### 1. Traefik - Configuration Principale
**Fichier**: `traefik/dynamic/librespeed-cloudflare.yml`
- Redirection automatique vers l'API de génération de token
- Middleware de sécurité et compression
- Gestion des erreurs 403

### 2. Traefik - Middleware de Tokens
**Fichier**: `traefik/dynamic/librespeed-token-middleware.yml`
- Validation des tokens d'accès
- Redirection conditionnelle selon le statut du token
- Service de blocage pour les tokens invalides

### 3. Cloudflare - Configuration SSL
**Fichier**: `ssl/cloudflare/config.yml`
- Redirection vers l'API de redirection
- Règles de sécurité Cloudflare
- Gestion des timeouts

## Flux de Sécurisation

### Accès Autorisé
1. Utilisateur connecté à `iahome.fr`
2. Accès à la section "En cours"
3. Clic sur le module LibreSpeed
4. Génération d'un token temporaire (5 minutes)
5. Redirection vers `librespeed.iahome.fr?token=XXX`
6. Validation du token par Traefik
7. Accès autorisé à LibreSpeed

### Accès Non Autorisé
1. Tentative d'accès direct à `librespeed.iahome.fr`
2. Redirection vers l'API de redirection
3. Vérification de l'authentification
4. Si non connecté : redirection vers login
5. Si connecté mais module non activé : message d'erreur
6. Si token invalide : page de blocage

## Sécurité Implémentée

### 1. Authentification Multi-Niveaux
- Vérification de la session utilisateur
- Validation des modules activés
- Génération de tokens temporaires
- Expiration automatique des tokens

### 2. Protection contre les Accès Directs
- Redirection forcée vers l'API
- Page de blocage personnalisée
- Headers de sécurité
- Logs de sécurité

### 3. Intégration avec le Système Existant
- Utilisation du service `LibreSpeedAccessService`
- Intégration avec la base de données Supabase
- Compatibilité avec le système de modules

## Tests et Validation

### Script de Test
**Fichier**: `test-librespeed-security.ps1`
- Test d'accès direct bloqué
- Test de redirection vers l'API
- Test de la page de blocage
- Validation des réponses HTTP

### Script de Déploiement
**Fichier**: `deploy-librespeed-security.ps1`
- Redémarrage des services Docker
- Vérification du statut des services
- Exécution des tests de validation

## Maintenance

### Redémarrage des Services
```powershell
# Redémarrer Traefik
docker restart traefik

# Redémarrer l'application iahome
docker restart iahome-app
```

### Vérification des Logs
```powershell
# Logs Traefik
docker logs traefik

# Logs application iahome
docker logs iahome-app
```

### Test de la Configuration
```powershell
# Exécuter les tests
.\test-librespeed-security.ps1
```

## Avantages de cette Configuration

1. **Sécurité Renforcée** : Aucun accès direct possible
2. **Intégration Parfaite** : Utilise le système existant
3. **Expérience Utilisateur** : Flux transparent via le tableau de bord
4. **Maintenance Facile** : Configuration centralisée
5. **Évolutivité** : Peut être étendue à d'autres applications

## Dépannage

### Problèmes Courants
1. **Redirection en boucle** : Vérifier la configuration Traefik
2. **Token invalide** : Vérifier la base de données `librespeed_tokens`
3. **Accès refusé** : Vérifier les modules activés dans `user_applications`

### Logs à Surveiller
- `LibreSpeed Auth Check` : Vérifications d'authentification
- `LibreSpeed Token Validator` : Validation des tokens
- `LibreSpeed Redirect` : Redirections et génération de tokens
