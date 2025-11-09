# Solution : ERR_CONNECTION_TIMED_OUT pour meeting-reports.iahome.fr

## 🔍 Problème identifié

L'erreur `ERR_CONNECTION_TIMED_OUT` était causée par un **conflit de routes Traefik** :

1. **Route de redirection** (`meeting-reports-redirect-rule`) avec priorité 1
   - Capturait toutes les requêtes vers `meeting-reports.iahome.fr`
   - Les redirigeait vers `iahome.fr`

2. **Route de service** (`meeting-reports`) sans priorité définie
   - Ne pouvait pas répondre car la route de redirection interceptait tout

## ✅ Solution appliquée

### 1. Modification de `traefik-meeting-reports.yml`

- ✅ Ajout de `priority: 200` (supérieure à la route de redirection)
- ✅ Ajout d'`entryPoints` explicites (`websecure`, `web`)
- ✅ Exclusion de `/api` et `/.well-known/acme-challenge` dans la règle

### 2. Désactivation de la route de redirection

- ✅ Commentaire de `meeting-reports-redirect-rule` dans `subdomain-page-rules.yml`
- ✅ Le service meeting-reports gère maintenant directement les requêtes

## 📊 Configuration finale

### Route active (priorité 200)
```yaml
meeting-reports:
  rule: "Host(`meeting-reports.iahome.fr`) && !PathPrefix(`/api`) && !PathPrefix(`/.well-known/acme-challenge`)"
  priority: 200
  service: meeting-reports-service
  entryPoints: ["websecure", "web"]
```

### Route de redirection (désactivée)
```yaml
# meeting-reports-redirect-rule: # Désactivée
```

## 🔄 Redémarrage

Le service Traefik a été redémarré pour appliquer les changements :
```powershell
docker restart iahome-traefik
```

## ✅ Résultat attendu

Après le redémarrage de Traefik :
- ✅ `https://meeting-reports.iahome.fr/?token=...` devrait fonctionner
- ✅ Les requêtes API `/api/*` continuent de fonctionner via `meeting-reports-api.yml`
- ✅ Plus de timeout ou de redirection vers iahome.fr

## 🧪 Test

1. Attendez 30 secondes après le redémarrage de Traefik
2. Accédez à `https://meeting-reports.iahome.fr/?token=VOTRE_TOKEN`
3. La page devrait se charger normalement

## 📝 Notes

- Les routes `/api/*` sont toujours gérées par `meeting-reports-api.yml` avec priorité 100
- Le frontend est servi par `traefik-meeting-reports.yml` avec priorité 200
- La protection par token est gérée par le Worker Cloudflare





