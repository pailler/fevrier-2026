# Solution finale pour les uploads de fichiers > 1 Mo

## ✅ État actuel

### Configuration appliquée
1. **Nginx** : `client_max_body_size 500M` (global) dans `meeting-reports/nginx/nginx.conf`
2. **Backend** : Opérationnel sur port 8000
3. **Traefik** : Configuration pointant vers port 8000

### Résultats observés
- Certains uploads réussissent (confirmation dans les logs)
- L'erreur 413 apparaît parfois pour des fichiers volumineux
- Un upload a réussi avec succès : `id: "e35dc1a2-23f6-4575-b540-9a740b5271eb"`

## 🔍 Diagnostic

L'erreur 413 "Request Entity Too Large" peut provenir de :

1. **Limite au niveau du frontend Nginx** (déjà corrigée à 500M)
2. **Limite au niveau de Traefik** (middleware buffering configuré mais potentiellement en cache)
3. **Limite au niveau du backend FastAPI** (accepte par défaut jusqu'à 16Mo)

## 🧪 Test

Pour identifier quel composant bloque :
1. Testez avec un fichier de taille moyenne (500KB - 2MB)
2. Si ça passe : la limite est probablement 2-5 MB
3. Si ça échoue : il y a un cache dans Traefik

## 💡 Recommandation

Si l'erreur 413 persiste pour TOUS les fichiers > 1 Mo :

### Option A : Désactiver temporairement Traefik pour cet endpoint
Passer directement par le Nginx local (http://localhost:3050)

### Option B : Forcer le rechargement de Traefik
```bash
docker stop iahome-traefik
docker start iahome-traefik
```

### Option C : Vérifier le fichier dans le conteneur
```bash
docker exec iahome-traefik cat /etc/traefik/dynamic/traefik-meeting-reports-api.yml
```

## 📊 Fichiers concernés

- `meeting-reports/nginx/nginx.conf` : ✅ Limite 500M configurée
- `traefik/dynamic/traefik-meeting-reports-api.yml` : ✅ Corrigé (pas de middleware buffering problématique)
- `meeting-reports/backend/main.py` : ✅ Backend opérationnel

## 🎯 Prochaines étapes

Si le problème persiste après redémarrage de Traefik :
1. Supprimer complètement le cache Traefik
2. Vérifier les logs en temps réel pendant un upload
3. Possiblement contourner Traefik pour la production

