# Configuration Cloudflare pour n8n.regispailler.fr

## Objectif

Rétablir le proxy Cloudflare pour `n8n.regispailler.fr` afin de bénéficier de :
- ✅ Protection DDoS
- ✅ SSL/TLS automatique
- ✅ CDN et cache
- ✅ Protection contre les attaques

## Étapes de configuration

### Étape 1 : Vérifier le DNS record dans Cloudflare

1. **Connectez-vous à Cloudflare** : https://dash.cloudflare.com/
2. **Sélectionnez votre domaine** : `regispailler.fr`
3. **Allez dans DNS → Records**
4. **Recherchez** : `n8n.regispailler.fr`

### Étape 2 : Vérifier/Configurer le DNS record

Le record doit être configuré ainsi :

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| A ou CNAME | n8n | IP de votre serveur ou domaine | 🟠 **Proxied** (orange) | Auto |

**Important** :
- **Type A** : Si vous pointez vers une IP (ex: `192.168.1.130` ou votre IP publique)
- **Type CNAME** : Si vous pointez vers un autre domaine
- **Proxy status** : Doit être **🟠 Proxied** (orange) pour activer le proxy Cloudflare

### Étape 3 : Activer le proxy Cloudflare

Si le proxy est désactivé (icône ⚪ grise) :

1. **Cliquez sur l'icône** pour la passer en 🟠 **Proxied** (orange)
2. **Cliquez sur Save**
3. **Attendez 2-5 minutes** pour la propagation DNS

### Étape 4 : Configurer SSL/TLS dans Cloudflare

1. **Allez dans SSL/TLS → Overview**
2. **Mode SSL/TLS** : Sélectionnez **"Full"** ou **"Full (strict)"**
   - **Full** : Cloudflare chiffre la connexion vers votre serveur (certificat auto-signé accepté)
   - **Full (strict)** : Nécessite un certificat valide sur votre serveur (recommandé si vous avez Let's Encrypt)

### Étape 5 : Vérifier les paramètres de sécurité

1. **Allez dans SSL/TLS → Edge Certificates**
2. **Vérifiez** :
   - ✅ "Always Use HTTPS" : **ON** (recommandé)
   - ✅ "Automatic HTTPS Rewrites" : **ON** (recommandé)
   - ✅ "Minimum TLS Version" : **1.2** ou supérieur

### Étape 6 : Vérifier que Traefik accepte les connexions Cloudflare

Traefik doit être configuré pour accepter les connexions HTTP de Cloudflare (car Cloudflare gère le SSL).

Vérifiez que `traefik/dynamic/n8n.yml` a bien :
- `entryPoints: ["web"]` pour la route HTTP (Cloudflare → Traefik en HTTP)
- Les headers `X-Forwarded-Proto: "https"` pour indiquer à n8n que la connexion est HTTPS

## Vérification

### Test 1 : Vérifier le DNS

```powershell
# Vérifier que le DNS pointe vers Cloudflare
nslookup n8n.regispailler.fr
```

**Résultat attendu** : Une IP Cloudflare (commence par `104.x.x.x`, `172.x.x.x`, ou `198.x.x.x`)

Si vous voyez votre IP publique directement, le proxy Cloudflare n'est pas activé.

### Test 2 : Vérifier l'accès HTTPS

```powershell
# Tester l'accès via Cloudflare
curl -I https://n8n.regispailler.fr/healthz
```

**Résultat attendu** : `HTTP/2 200` ou `HTTP/1.1 200`

### Test 3 : Vérifier les headers Cloudflare

```powershell
# Vérifier les headers Cloudflare
curl -I https://n8n.regispailler.fr/healthz | Select-String "cf-"
```

Vous devriez voir des headers comme :
- `cf-ray`
- `cf-request-id`
- `server: cloudflare`

## Configuration recommandée

### DNS Record

```
Type: A
Name: n8n
Content: [IP de votre serveur Traefik]
Proxy: 🟠 Proxied (ON)
TTL: Auto
```

### SSL/TLS Mode

```
Mode: Full (strict)  # Si vous avez Let's Encrypt
     ou
Mode: Full          # Si vous n'avez pas de certificat valide
```

### Always Use HTTPS

```
ON ✅
```

## Dépannage

### Le proxy Cloudflare ne fonctionne pas

1. **Vérifiez que le DNS record est bien "Proxied"** (🟠 orange)
2. **Attendez 5-10 minutes** pour la propagation DNS
3. **Videz le cache DNS** :
   ```powershell
   ipconfig /flushdns
   ```

### Erreur 502 Bad Gateway

1. **Vérifiez que Traefik est en cours d'exécution** :
   ```powershell
   docker ps | Select-String traefik
   ```

2. **Vérifiez que n8n répond** :
   ```powershell
   curl http://192.168.1.130:5678/healthz
   ```

3. **Vérifiez les logs Traefik** :
   ```powershell
   docker logs iahome-traefik --tail 50
   ```

### Erreur SSL

1. **Vérifiez le mode SSL/TLS** dans Cloudflare (doit être "Full" ou "Full (strict)")
2. **Vérifiez que Traefik accepte les connexions HTTP** (pas besoin de SSL côté serveur si Cloudflare gère le SSL)

## Notes importantes

- ⚠️ **Cloudflare proxy** : Active le proxy (🟠 orange) = protection DDoS, SSL automatique
- ⚠️ **DNS only** : Désactive le proxy (⚪ gris) = pas de protection, accès direct
- ✅ **Pour n8n** : Recommandé d'utiliser le proxy Cloudflare pour la protection

## Résultat attendu

Après configuration :
- ✅ `https://n8n.regispailler.fr` fonctionne via Cloudflare
- ✅ Protection DDoS active
- ✅ SSL/TLS automatique
- ✅ Headers Cloudflare présents dans les requêtes
