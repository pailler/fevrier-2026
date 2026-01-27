# Résolution : Erreur 502 Bad Gateway pour n8n

## Problème

L'erreur 502 Bad Gateway signifie que Traefik ne peut pas atteindre n8n. Cela se produit généralement quand :

1. **n8n n'est pas en cours d'exécution** sur le NAS
2. **Traefik ne peut pas atteindre n8n** (problème de réseau/IP)
3. **Le port 5678 n'est pas accessible** depuis Traefik

## Diagnostic

### Étape 1 : Vérifier que n8n est en cours d'exécution

**Sur le NAS (via SSH)** :

```bash
sudo docker ps | grep n8n
```

Vous devriez voir :
```
n8n            Up X minutes    0.0.0.0:5678->5678/tcp
n8n-postgres   Up X minutes    5432/tcp
```

### Étape 2 : Vérifier que n8n répond localement

**Sur le NAS** :

```bash
curl http://localhost:5678/healthz
```

Si cela fonctionne, n8n est accessible localement.

### Étape 3 : Trouver l'IP du NAS

**Sur le NAS** :

```bash
hostname -I
```

Ou :

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Notez l'IP (ex: `192.168.1.100`).

### Étape 4 : Tester depuis Traefik

**Sur votre machine Windows** (où Traefik tourne) :

```powershell
# Remplacez IP_DU_NAS par l'IP trouvée à l'étape 3
curl http://IP_DU_NAS:5678/healthz
```

Si cela fonctionne, Traefik devrait pouvoir atteindre n8n via cette IP.

## Solution : Modifier la configuration Traefik

### Option 1 : Utiliser l'IP du NAS (Recommandé)

Modifiez `traefik/dynamic/n8n.yml` :

```yaml
services:
  n8n-service:
    loadBalancer:
      servers:
        # Remplacez IP_DU_NAS par l'IP de votre NAS
        - url: "http://192.168.1.100:5678"  # Exemple
      passHostHeader: true
```

### Option 2 : Utiliser host.docker.internal (si Traefik et n8n sont sur la même machine)

Si Traefik et n8n sont sur la même machine, `host.docker.internal` devrait fonctionner :

```yaml
services:
  n8n-service:
    loadBalancer:
      servers:
        - url: "http://host.docker.internal:5678"
      passHostHeader: true
```

## Configuration complète corrigée

Voici la configuration complète avec l'IP du NAS :

```yaml
# traefik/dynamic/n8n.yml
http:
  routers:
    n8n-main:
      rule: "Host(`n8n.regispailler.fr`)"
      entryPoints: ["web"]
      service: n8n-service
      middlewares: ["security-headers@file", "n8n-proxy-headers@file"]
      priority: 10

  services:
    n8n-service:
      loadBalancer:
        servers:
          # IMPORTANT : Remplacez par l'IP de votre NAS
          - url: "http://192.168.1.100:5678"  # IP_DU_NAS:5678
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
          X-Forwarded-For: ""
          X-Real-IP: ""
          X-Forwarded-Ssl: "on"
```

## Étapes de correction

### 1. Trouver l'IP du NAS

```bash
# Sur le NAS
hostname -I
```

### 2. Modifier traefik/dynamic/n8n.yml

Remplacez `host.docker.internal:5678` par `IP_DU_NAS:5678`.

### 3. Redémarrer Traefik

```powershell
docker restart iahome-traefik
```

### 4. Vérifier

Attendez 30 secondes, puis testez :

```powershell
curl https://n8n.regispailler.fr/healthz
```

## Alternative : Utiliser un tunnel SSH ou VPN

Si le NAS est sur un réseau différent, vous pouvez :

1. **Créer un tunnel SSH** :
   ```bash
   ssh -L 5678:localhost:5678 admin@IP_DU_NAS
   ```

2. **Utiliser l'IP locale** dans Traefik :
   ```yaml
   - url: "http://localhost:5678"
   ```

## Vérifications supplémentaires

### Vérifier que le port est ouvert

**Sur le NAS** :

```bash
sudo netstat -tlnp | grep 5678
```

Vous devriez voir :
```
tcp6       0      0 :::5678                 :::*                    LISTEN
```

### Vérifier le firewall

Assurez-vous que le port 5678 n'est pas bloqué par le firewall du NAS.

### Vérifier les logs Traefik

```powershell
docker logs iahome-traefik --tail 50 | Select-String "n8n"
```

Recherchez des erreurs de connexion.

## Test de connectivité

### Depuis votre machine Windows

```powershell
# Test 1 : n8n directement sur le NAS
curl http://IP_DU_NAS:5678/healthz

# Test 2 : Via Traefik
curl -H "Host: n8n.regispailler.fr" http://localhost/healthz

# Test 3 : Via le domaine
curl https://n8n.regispailler.fr/healthz
```

## Notes importantes

- ⚠️ **IP statique** : Assurez-vous que le NAS a une IP statique ou utilisez un nom DNS local
- 🔒 **Sécurité** : Si le NAS est sur un réseau différent, utilisez un VPN ou un tunnel SSH
- 🌐 **Réseau** : `host.docker.internal` ne fonctionne que si Traefik et n8n sont sur la même machine
- 🔄 **Redémarrage** : Après chaque modification, redémarrez Traefik
