# 🔧 Résolution Erreur 502 Bad Gateway

## ❌ Problèmes détectés

1. **Resolver 'letsencrypt' non trouvé** - Traefik ne trouve pas le resolver Let's Encrypt
2. **Health check failed** - Le backend meeting-reports-api ne répond pas
3. **Erreur de parsing** - Règle librespeed avec fonction `Port` non supportée

## 🚀 Solutions rapides

### Solution 1 : Redémarrer Traefik (le plus rapide)

```powershell
# Redémarrer Traefik pour recharger la configuration
docker restart iahome-traefik

# Attendre 30 secondes puis vérifier les logs
docker logs iahome-traefik --tail 20
```

### Solution 2 : Vérifier le volume Let's Encrypt

```powershell
# Vérifier que le volume existe
docker volume ls | Select-String "letsencrypt"

# Si le volume n'existe pas, le créer
docker volume create letsencrypt-data

# Vérifier les permissions
docker exec iahome-traefik ls -la /letsencrypt
```

### Solution 3 : Corriger la configuration librespeed

Le fichier `traefik/dynamic/librespeed-cloudflare.yml` contient une règle invalide avec `Port()`.

**Action :** Supprimer ou commenter la règle avec `Port()` dans la configuration librespeed.

### Solution 4 : Vérifier le backend meeting-reports

```powershell
# Vérifier que le service backend répond
curl http://localhost:8000/health

# Si pas de réponse, redémarrer
docker restart meeting-reports-backend-1

# Vérifier les logs
docker logs meeting-reports-backend-1 --tail 50
```

## 🔍 Diagnostic détaillé

### Étape 1 : Identifier le domaine concerné

Quelle URL génère l'erreur 502 ?
- `https://iahome.fr` ?
- `https://meeting-reports.iahome.fr` ?
- `https://prompt-generator.iahome.fr` ?
- Autre ?

### Étape 2 : Vérifier les logs Traefik

```powershell
# Logs en temps réel
docker logs -f iahome-traefik

# Filtrer les erreurs
docker logs iahome-traefik 2>&1 | Select-String "error|502|bad.gateway"
```

### Étape 3 : Vérifier la connectivité backend

```powershell
# Tester depuis Traefik vers le backend
docker exec iahome-traefik wget -O- http://host.docker.internal:8000/health

# Tester depuis l'extérieur
curl http://localhost:8000/health
```

### Étape 4 : Vérifier Cloudflare Worker

Si l'erreur vient de Cloudflare, vérifier le Worker :

1. **Ouvrir** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Vérifier les logs** : Workers → Logs

3. **Vérifier les routes** : Workers → Triggers → Routes

## 🛠️ Solutions selon le domaine

### Si c'est `iahome.fr` (site principal)

```powershell
# Vérifier que l'app Next.js répond
curl http://localhost:3000

# Redémarrer si nécessaire
docker restart iahome-app
```

### Si c'est `meeting-reports.iahome.fr`

```powershell
# Vérifier le backend
docker restart meeting-reports-backend-1
docker restart meeting-reports-nginx-1

# Attendre 30 secondes
Start-Sleep -Seconds 30

# Tester
curl http://localhost:3050
```

### Si c'est `prompt-generator.iahome.fr`

```powershell
# Vérifier le service
docker restart apprendre-autrement

# Tester
curl http://localhost:9001/prompt-generator
```

## ⚡ Solution d'urgence : Désactiver temporairement le Worker Cloudflare

Si le Worker Cloudflare bloque, désactiver temporairement la route :

1. **Ouvrir** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Aller dans** : Triggers → Routes

3. **Désactiver temporairement** la route du domaine concerné

4. **Tester** l'accès direct

5. **Réactiver** après correction

## 📋 Checklist de vérification

- [ ] Traefik est démarré et healthy
- [ ] Le backend concerné répond sur son port local
- [ ] Le volume letsencrypt existe et est monté
- [ ] Les routes Traefik sont correctement configurées
- [ ] Le Worker Cloudflare ne bloque pas les requêtes
- [ ] Les certificats SSL sont valides
- [ ] Les health checks passent

## 🔄 Redémarrage complet (si rien ne fonctionne)

```powershell
# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📞 Informations à fournir pour diagnostic

Si l'erreur persiste, fournir :
1. **L'URL exacte** qui génère l'erreur 502
2. **Les logs Traefik** : `docker logs iahome-traefik --tail 100`
3. **Les logs du backend concerné**
4. **Le résultat de** : `docker ps` (état des services)


