# Résolution : Erreur 502 Bad Gateway avec Cloudflare pour n8n

## Problème

Cloudflare retourne une erreur **502 Bad Gateway** pour `https://n8n.regispailler.fr`.

## Causes possibles

1. **Traefik ne peut pas atteindre n8n** (problème de réseau/IP)
2. **Le middleware référencé n'existe pas** (`security-headers@file`)
3. **Cloudflare pointe vers la mauvaise IP** (pas l'IP de votre serveur Traefik)
4. **Le port 80/443 n'est pas accessible** depuis Internet

## Diagnostic étape par étape

### Étape 1 : Vérifier que n8n répond sur le NAS

**Sur le NAS** :

```bash
curl http://localhost:5678/healthz
```

**Depuis votre machine Windows** :

```powershell
curl http://192.168.1.130:5678/healthz
```

Si cela fonctionne, n8n est accessible.

### Étape 2 : Vérifier que Traefik peut atteindre n8n

```powershell
docker exec iahome-traefik wget -qO- http://192.168.1.130:5678/healthz
```

Si cela fonctionne, Traefik peut atteindre n8n.

### Étape 3 : Vérifier la configuration Traefik

Vérifiez que `traefik/dynamic/n8n.yml` contient bien :

```yaml
services:
  n8n-service:
    loadBalancer:
      servers:
        - url: "http://192.168.1.130:5678"
```

### Étape 4 : Vérifier le middleware

Le fichier `traefik/dynamic/n8n.yml` référence `security-headers@file`. Vérifiez que ce middleware existe dans `traefik/dynamic/middlewares.yml`.

Si le middleware n'existe pas, **supprimez-le de la configuration n8n** :

```yaml
middlewares: ["n8n-proxy-headers@file"]  # Supprimez security-headers@file
```

### Étape 5 : Vérifier l'IP Cloudflare

Dans Cloudflare Dashboard :

1. Allez dans **DNS → Records**
2. Vérifiez que `n8n.regispailler.fr` pointe vers **l'IP publique de votre serveur Traefik**
3. Vérifiez que le proxy est activé (🟠 orange)

### Étape 6 : Vérifier que le port 80 est accessible

Vérifiez que le port 80 (HTTP) est accessible depuis Internet vers votre serveur Traefik.

## Solution : Corriger la configuration

### Solution 1 : Supprimer le middleware manquant

Si `security-headers@file` n'existe pas, modifiez `traefik/dynamic/n8n.yml` :

**Avant :**
```yaml
middlewares: ["security-headers@file", "n8n-proxy-headers@file"]
```

**Après :**
```yaml
middlewares: ["n8n-proxy-headers@file"]
```

### Solution 2 : Créer le middleware manquant

Si vous voulez garder le middleware, créez-le dans `traefik/dynamic/middlewares.yml` :

```yaml
http:
  middlewares:
    security-headers:
      headers:
        customResponseHeaders:
          X-Frame-Options: "SAMEORIGIN"
          X-Content-Type-Options: "nosniff"
          Referrer-Policy: "strict-origin-when-cross-origin"
```

### Solution 3 : Vérifier l'IP Cloudflare

Dans Cloudflare Dashboard :

1. **DNS → Records**
2. Trouvez `n8n.regispailler.fr`
3. Vérifiez que **Content** pointe vers l'IP publique de votre serveur Traefik
4. Vérifiez que **Proxy** est activé (🟠 orange)

### Solution 4 : Redémarrer Traefik

Après chaque modification :

```powershell
docker restart iahome-traefik
```

Attendez 30 secondes, puis testez.

## Configuration corrigée

Voici la configuration minimale qui devrait fonctionner :

```yaml
# traefik/dynamic/n8n.yml
http:
  routers:
    n8n-main:
      rule: "Host(`n8n.regispailler.fr`)"
      entryPoints: ["web"]
      service: n8n-service
      middlewares: ["n8n-proxy-headers@file"]  # Supprimez security-headers si absent
      priority: 10

  services:
    n8n-service:
      loadBalancer:
        servers:
          - url: "http://192.168.1.130:5678"
        passHostHeader: true
        healthCheck:
          path: "/healthz"
          interval: "30s"
          timeout: "10s"

  middlewares:
    n8n-proxy-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
          X-Forwarded-Host: "n8n.regispailler.fr"
          X-Forwarded-Ssl: "on"
```

## Vérification finale

1. **Redémarrez Traefik** :
   ```powershell
   docker restart iahome-traefik
   ```

2. **Attendez 30 secondes**

3. **Testez localement** :
   ```powershell
   curl -H "Host: n8n.regispailler.fr" http://localhost/healthz
   ```

4. **Testez via Cloudflare** :
   ```powershell
   curl https://n8n.regispailler.fr/healthz
   ```

## Si le problème persiste

1. **Vérifiez les logs Traefik** :
   ```powershell
   docker logs iahome-traefik --tail 100
   ```

2. **Vérifiez que le port 80 est ouvert** dans votre firewall/router

3. **Vérifiez l'IP publique** de votre serveur :
   ```powershell
   curl ifconfig.me
   ```

4. **Vérifiez dans Cloudflare** que le DNS pointe vers cette IP
