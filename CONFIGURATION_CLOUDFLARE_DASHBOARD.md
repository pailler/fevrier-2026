# Configuration Cloudflare Dashboard pour consoles.regispailler.fr

## 🔧 Configuration requise dans Cloudflare Dashboard

Si cloudflared utilise la configuration du dashboard plutôt que le fichier local, vous devez configurer les routes directement dans le dashboard :

### Étapes dans Cloudflare Dashboard

1. **Allez sur** : https://dash.cloudflare.com/
2. **Zero Trust** → **Networks** → **Tunnels**
3. **Sélectionnez** votre tunnel (`iahome-new`)
4. **Public Hostnames** → **Add a public hostname**

#### Route 1 : API (priorité haute)

- **Subdomain** : `consoles`
- **Domain** : `regispailler.fr`
- **Service** : `http://192.168.1.150:5001`
- **Path** : `/api/*`
- Cliquez sur **Save**

#### Route 2 : Frontend (catch-all)

- **Subdomain** : `consoles`
- **Domain** : `regispailler.fr`
- **Service** : `http://192.168.1.150:5000`
- **Path** : Laissez vide (pour toutes les autres routes)
- Cliquez sur **Save**

## ⚠️ Important

L'ordre des routes est important ! La route `/api/*` doit être **avant** la route générale pour avoir la priorité.

## ✅ Vérification

Après configuration, attendez 1-2 minutes puis testez :
- https://consoles.regispailler.fr/api/health
- https://consoles.regispailler.fr

## 📝 Configuration actuelle dans le fichier

```yaml
# cloudflare-active-config.yml
- hostname: consoles.regispailler.fr
  path: /api/*
  service: http://192.168.1.150:5001

- hostname: consoles.regispailler.fr
  service: http://192.168.1.150:5000
```

Si cloudflared utilise le dashboard, cette configuration dans le fichier sera ignorée. Vous devez configurer dans le dashboard.








