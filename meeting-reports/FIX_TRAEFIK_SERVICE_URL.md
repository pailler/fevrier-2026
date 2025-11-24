# Fix : URL du service Traefik pour meeting-reports

## 🔍 Problème identifié

Traefik ne pouvait pas accéder au service `meeting-reports-service` car :
- ❌ L'URL utilisait `http://localhost:3001`
- ❌ Depuis un conteneur Docker, `localhost` pointe vers le conteneur lui-même, pas vers l'hôte
- ❌ Traefik ne peut donc pas atteindre le service sur l'hôte

## ✅ Solution appliquée

### Modification de l'URL du service

**Avant :**
```yaml
servers:
  - url: "http://localhost:3001"
```

**Après :**
```yaml
servers:
  - url: "http://host.docker.internal:3050"  # Utiliser Nginx qui fait déjà le reverse proxy
```

### Pourquoi utiliser le port 3050 (Nginx) ?

1. ✅ Nginx fait déjà le reverse proxy vers frontend (3001) et backend (8000)
2. ✅ Une seule URL à configurer dans Traefik
3. ✅ Nginx gère déjà les headers CORS et la configuration
4. ✅ Plus simple et plus robuste

### Alternative : Utiliser host.docker.internal:3001

Si vous préférez pointer directement vers le frontend :
```yaml
servers:
  - url: "http://host.docker.internal:3001"
```

## 🔄 Redémarrage

Traefik a été redémarré pour appliquer les changements :
```powershell
docker restart iahome-traefik
```

## ✅ Résultat attendu

Après le redémarrage :
- ✅ Traefik peut maintenant accéder au service via `host.docker.internal:3050`
- ✅ Les requêtes vers `https://meeting-reports.iahome.fr` devraient fonctionner
- ✅ Plus de timeout

## 🧪 Test

1. Attendez 30 secondes après le redémarrage
2. Testez : `https://meeting-reports.iahome.fr/?token=VOTRE_TOKEN`
3. La page devrait se charger normalement

## 📝 Notes

- `host.docker.internal` est un nom DNS spécial qui résout vers l'IP de l'hôte depuis Docker
- Le port 3050 est celui exposé par Nginx dans `docker-compose.yml`
- Nginx fait déjà le reverse proxy vers frontend (port 3000) et backend (port 8000)
















