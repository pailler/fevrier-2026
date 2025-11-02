# Diagnostic Complet : ERR_CONNECTION_TIMED_OUT

## 🔍 Problèmes identifiés

### 1. Erreur Traefik : "non-existent resolver: letsencrypt"
- ❌ Traefik dit que le resolver `letsencrypt` n'existe pas
- ✅ Mais il est bien défini dans `traefik.yml`
- ⚠️ **Possible cause** : Fichier `traefik.yml` non chargé ou erreur de configuration

### 2. Conflits de configuration
- ⚠️ Plusieurs fichiers pour meeting-reports :
  - `meeting-reports.yml`
  - `traefik-meeting-reports.yml`
  - `meeting-reports-api.yml`
  - `traefik-meeting-reports-api.yml`
- ⚠️ Traefik dit "HTTP router already configured, skipping"

### 3. DNS non résolu
- ❌ `curl: (6) Could not resolve host: meeting-reports.iahome.fr`
- ⚠️ Le domaine n'est pas résolu depuis l'hôte local
- ✅ Mais le service répond sur `host.docker.internal:3050`

## ✅ Actions à effectuer

### Étape 1 : Vérifier la configuration Traefik

```powershell
# Vérifier que traefik.yml est bien monté
docker exec iahome-traefik cat /etc/traefik/traefik.yml | Select-String "letsencrypt"

# Vérifier les fichiers chargés
docker exec iahome-traefik ls -la /etc/traefik/dynamic/ | Select-String "meeting-reports"
```

### Étape 2 : Supprimer les doublons

Il faut choisir UNE configuration et supprimer les autres :

**Option A : Utiliser `traefik-meeting-reports.yml` et `traefik-meeting-reports-api.yml`**
- Supprimer ou renommer `meeting-reports.yml` et `meeting-reports-api.yml`

**Option B : Utiliser `meeting-reports.yml` et `meeting-reports-api.yml`**
- Supprimer ou renommer `traefik-meeting-reports.yml` et `traefik-meeting-reports-api.yml`

### Étape 3 : Vérifier Cloudflare Worker

Le Worker Cloudflare pourrait bloquer les connexions. Vérifier :
1. Cloudflare Dashboard → Workers → Logs
2. Voir si les requêtes arrivent
3. Voir si elles sont bloquées

### Étape 4 : Vérifier DNS Cloudflare

1. Cloudflare Dashboard → DNS → Records
2. Vérifier que `meeting-reports.iahome.fr` pointe vers :
   - **Proxied** (orange cloud) → IP du serveur
   - **DNS only** (gris cloud) → IP du serveur

### Étape 5 : Tester depuis l'extérieur

Le problème pourrait être que le domaine n'est pas accessible depuis l'extérieur :
- Tester depuis un autre réseau
- Vérifier le pare-feu
- Vérifier que le port 443 est ouvert

## 🎯 Cause probable

Le problème semble être une **combinaison** de :
1. Conflits de configuration Traefik (plusieurs fichiers)
2. Resolver letsencrypt non reconnu (peut bloquer HTTPS)
3. Possible blocage Cloudflare Worker
4. DNS/Network configuration

## 🔧 Solution recommandée

1. **Nettoyer les fichiers** : Garder UNE seule série de fichiers
2. **Vérifier Traefik** : S'assurer que letsencrypt est bien configuré
3. **Tester sans Worker** : Désactiver temporairement le Worker Cloudflare
4. **Vérifier DNS** : S'assurer que le domaine pointe vers le bon serveur

