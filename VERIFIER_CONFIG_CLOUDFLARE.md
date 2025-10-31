# ✅ Vérification de la configuration Cloudflare Access

## 📋 Configuration actuelle (d'après l'image)

### Informations de base ✅
- **Nom de l'application** : IAHome ✅
- **Durée de session** : 24 hours ✅
- **Nom d'hôte public** : `*.iahome.fr/*` ✅ (wildcard pour tous les sous-domaines)
- **AUD** : `274cbdc2721dc9ca27fb17c5bfc0dc761eff8c4152df8f7f5ed4dc32b8b83c82` ✅

## ⚠️ Ce qu'il faut vérifier : Les politiques (Stratégies)

### 1. Accéder aux politiques

1. Dans la page de configuration "IAHome", clique sur l'onglet **"Stratégies"** (ou **"Policies"**)
2. Tu devrais voir la liste des politiques

### 2. Vérifier l'ordre des politiques

**L'ordre DOIT être** (de haut en bas) :

```
1. Service-token-access (Allow) ← EN PREMIER
   - Action: Allow
   - Include: Service Token = IAHome-Server-Token

2. Allow-Normal-Access (Allow) ← Si elle existe
   - Action: Allow
   - Include: Everyone ou Email Domain

3. Block-default (Block) ← EN DERNIER
   - Action: Block
```

### 3. Vérifier que "Service-token-access" existe et est en premier

Si "Service-token-access" n'existe pas :
- Clique sur **"Ajouter une stratégie"** (ou **"Add a policy"**)
- Configure comme indiqué dans `CONFIG_LIBRESPEED_RAPIDE.md`

Si "Service-token-access" existe mais n'est pas en premier :
- Supprime-la
- Recrée-la (elle sera automatiquement en premier)

### 4. Vérifier le nom du Service Token

Dans la politique "Service-token-access", vérifie que :
- **Selector** : `Service Token`
- **Value** : `IAHome-Server-Token` (nom exact du Service Token)

## 🔍 Autres vérifications

### Vérifier que le Service Token existe

1. Va dans **Access** > **Service Tokens**
2. Vérifie que `IAHome-Server-Token` existe
3. Le nom doit correspondre **exactement** à celui dans la politique

### Vérifier les variables d'environnement

Dans `env.production.local`, vérifie :
```env
CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID=339b5489e670a801bb1b3292e50fee3b.access
CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET=113a7dbd04c3c048e833d15982e7a575ed92e33196e8b3647de8e1b740e49aaf
```

## ✅ Configuration complète

Une fois tout vérifié, la configuration devrait être :

1. **Application Cloudflare** : IAHome avec `*.iahome.fr/*` ✅
2. **Service Token** : IAHome-Server-Token existe ✅
3. **Politique** : Service-token-access en PREMIER ✅
4. **Variables d'environnement** : Configurées dans `env.production.local` ✅
5. **Code** : Déployé dans le container Docker ✅

## 🆘 Si le container Docker ne démarre pas

L'erreur "port 3000 déjà utilisé" signifie qu'un autre processus utilise le port. Il faut :

1. **Arrêter tous les processus Node.js** :
   ```powershell
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Vérifier que le port est libre** :
   ```powershell
   netstat -ano | findstr ":3000"
   ```

3. **Redémarrer le container** :
   ```powershell
   docker-compose -f docker-compose.prod.yml up -d iahome-app
   ```



