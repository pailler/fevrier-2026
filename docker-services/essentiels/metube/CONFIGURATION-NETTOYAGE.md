# Configuration du nettoyage automatique des sessions MeTube

## Objectif

MeTube est destiné à être utilisé par des utilisateurs externes. Pour garantir la confidentialité et éviter l'accumulation de données, les sessions sont automatiquement vidées après chaque utilisation.

## Fonctionnement

### Nettoyage automatique après chaque action

Lorsqu'un utilisateur externe utilise MeTube via l'API `/api/metube-action`, le système :

1. **Exécute l'action demandée** (téléchargement, transcription, etc.)
2. **Nettoie automatiquement les sessions** après l'action
3. **Supprime les fichiers de session** (completed, pending, queue)
4. **Supprime les fichiers temporaires**

### Ce qui est nettoyé

- ✅ Fichiers de session MeTube (`/downloads/.metube/completed`, `pending`, `queue`)
- ✅ Fichiers temporaires (`/downloads/.metube/tmp/*`, `/tmp/metube-*`)
- ⚠️ Les fichiers téléchargés sont **conservés** par défaut (pour permettre le téléchargement)

### Ce qui n'est pas nettoyé (par défaut)

- ❌ Les fichiers téléchargés (pour permettre aux utilisateurs de télécharger leurs fichiers)
- ❌ Les cookies YouTube (si configurés)

## Configuration

### 1. Nettoyage automatique après chaque action

Le nettoyage est **automatiquement activé** dans le code. Chaque fois qu'un utilisateur utilise MeTube via l'API, les sessions sont nettoyées après l'action.

**Fichier concerné :** `src/app/api/metube-action/route.ts`

### 2. Nettoyage manuel

Vous pouvez nettoyer manuellement les sessions à tout moment :

```powershell
# Nettoyage simple (sessions seulement)
powershell -ExecutionPolicy Bypass -File docker-services\essentiels\metube\cleanup-after-download.ps1

# Nettoyage complet (sessions + fichiers téléchargés)
powershell -ExecutionPolicy Bypass -File docker-services\essentiels\metube\cleanup-after-download.ps1 -FullCleanup
```

### 3. Nettoyage via l'API

Vous pouvez appeler l'API de nettoyage directement :

```bash
# Nettoyage simple (sessions seulement)
POST /api/metube-cleanup
{
  "fullCleanup": false
}

# Nettoyage complet (sessions + fichiers téléchargés)
POST /api/metube-cleanup
{
  "fullCleanup": true
}

# Vérifier l'état
GET /api/metube-cleanup
```

### 4. Nettoyage périodique (optionnel)

Pour un nettoyage périodique automatique, vous pouvez configurer un cron job ou un script planifié :

**Windows (Task Scheduler) :**
1. Ouvrez le Planificateur de tâches
2. Créez une tâche de base
3. Déclencheur : Toutes les heures ou quotidiennement
4. Action : Exécuter `cleanup-metube.ps1`

**Linux (cron) :**
```bash
# Nettoyer toutes les heures
0 * * * * /path/to/cleanup-metube-auto.sh

# Nettoyer quotidiennement à minuit
0 0 * * * /path/to/cleanup-metube-auto.sh
```

## Scripts disponibles

### 1. `cleanup-metube.ps1`
Script interactif pour nettoyer manuellement les sessions et fichiers MeTube.

**Usage :**
```powershell
powershell -ExecutionPolicy Bypass -File docker-services\essentiels\metube\cleanup-metube.ps1
```

### 2. `cleanup-after-download.ps1`
Script pour nettoyer automatiquement après chaque téléchargement.

**Usage :**
```powershell
# Nettoyage simple
powershell -ExecutionPolicy Bypass -File docker-services\essentiels\metube\cleanup-after-download.ps1

# Nettoyage complet
powershell -ExecutionPolicy Bypass -File docker-services\essentiels\metube\cleanup-after-download.ps1 -FullCleanup
```

### 3. `cleanup-metube-auto.sh`
Script shell pour nettoyage automatique (utilisé dans le conteneur).

**Usage :**
```bash
docker exec metube-iahome /usr/local/bin/cleanup-metube.sh
```

## Vérification

### Vérifier l'état du nettoyage

```powershell
# Vérifier les fichiers de session
docker exec metube-iahome ls -la /downloads/.metube

# Vérifier l'espace disque
docker exec metube-iahome df -h /downloads

# Vérifier via l'API
curl http://localhost:3000/api/metube-cleanup
```

### Vérifier les logs

```powershell
# Logs du conteneur MeTube
docker logs metube-iahome --tail 50

# Logs de l'API Next.js
# (dans la console où Next.js est exécuté)
```

## Dépannage

### Le nettoyage ne fonctionne pas

1. **Vérifier que le conteneur est en cours d'exécution :**
   ```powershell
   docker ps --filter name=metube-iahome
   ```

2. **Vérifier les permissions :**
   ```powershell
   docker exec metube-iahome ls -la /downloads/.metube
   ```

3. **Vérifier les logs :**
   ```powershell
   docker logs metube-iahome --tail 100
   ```

### Les fichiers ne sont pas supprimés

- Vérifiez que les fichiers ne sont pas en cours d'utilisation
- Vérifiez les permissions du conteneur
- Vérifiez que le volume est correctement monté

## Sécurité

### Confidentialité des utilisateurs

- ✅ Les sessions sont automatiquement vidées après chaque utilisation
- ✅ Les fichiers temporaires sont supprimés
- ⚠️ Les fichiers téléchargés sont conservés (pour permettre le téléchargement)
- 💡 Pour un nettoyage complet, utilisez `-FullCleanup` ou configurez un nettoyage périodique

### Recommandations

1. **Nettoyage périodique :** Configurez un nettoyage quotidien ou hebdomadaire des fichiers téléchargés
2. **Surveillance de l'espace disque :** Surveillez l'espace disque utilisé par `/downloads`
3. **Rotation des logs :** Configurez une rotation des logs si nécessaire

## Notes importantes

- ⚠️ Le nettoyage automatique ne supprime **pas** les fichiers téléchargés par défaut
- 💡 Pour supprimer aussi les fichiers téléchargés, utilisez `fullCleanup: true`
- 🔄 Les sessions sont nettoyées **après chaque action** pour garantir la confidentialité
- 📊 Surveillez l'espace disque pour éviter l'accumulation de fichiers










