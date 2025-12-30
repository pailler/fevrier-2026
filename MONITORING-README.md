# Système de Monitoring localhost:3000

Ce système surveille en permanence le serveur Next.js sur localhost:3000 et envoie une alerte par email à `formateur_tic@hotmail.com` si le serveur ne répond plus.

## Composants

### 1. API de Monitoring (`src/app/api/monitor-localhost/route.ts`)
- Route API qui vérifie si localhost:3000 répond
- Envoie automatiquement un email d'alerte si le serveur est hors ligne
- Accessible via: `GET http://localhost:3000/api/monitor-localhost`

### 2. Script PowerShell (`monitor-localhost.ps1`)
- Script de monitoring qui peut être exécuté manuellement ou en tâche planifiée
- Vérifie le serveur toutes les 60 secondes
- Envoie une alerte après 2 échecs consécutifs
- Évite le spam d'emails (maximum 1 alerte toutes les 5 minutes)

### 3. Installation en Tâche Planifiée (`install-monitor-task.ps1`)
- Installe le monitoring comme une tâche Windows planifiée
- Démarre automatiquement au démarrage de Windows
- Vérifie toutes les 5 minutes

## Utilisation

### Option 1: Monitoring manuel (temporaire)

```powershell
# Démarrer le monitoring en continu
.\monitor-localhost.ps1

# Ou faire une vérification unique
.\monitor-localhost.ps1 -Once
```

### Option 2: Tâche planifiée (recommandé)

```powershell
# Installer la tâche planifiée (nécessite les droits administrateur)
.\install-monitor-task.ps1
```

La tâche sera automatiquement:
- Démarrée au démarrage de Windows
- Exécutée toutes les 5 minutes
- Configurée pour fonctionner même si l'ordinateur est sur batterie

### Option 3: Vérification via l'API

```powershell
# Vérifier manuellement via l'API
Invoke-WebRequest -Uri "http://localhost:3000/api/monitor-localhost" -UseBasicParsing
```

## Gestion de la tâche planifiée

```powershell
# Démarrer la tâche
Start-ScheduledTask -TaskName "IAHome-Monitor-Localhost"

# Arrêter la tâche
Stop-ScheduledTask -TaskName "IAHome-Monitor-Localhost"

# Vérifier le statut
Get-ScheduledTask -TaskName "IAHome-Monitor-Localhost"

# Supprimer la tâche
Unregister-ScheduledTask -TaskName "IAHome-Monitor-Localhost" -Confirm:$false
```

## Configuration

### Email d'alerte
L'email d'alerte est configuré dans:
- `src/app/api/monitor-localhost/route.ts` (ligne 5): `ALERT_EMAIL = 'formateur_tic@hotmail.com'`
- `monitor-localhost.ps1` (ligne 6): `$ALERT_EMAIL = "formateur_tic@hotmail.com"`

Pour changer l'email, modifiez ces deux fichiers.

### Intervalle de vérification
- Script PowerShell: 60 secondes (ligne 7: `$CHECK_INTERVAL = 60`)
- Tâche planifiée: 5 minutes (défini dans `install-monitor-task.ps1`)

## Logs

Les logs sont enregistrés dans:
- `monitor-localhost.log` (dans le répertoire du script)

## Email d'alerte

L'email d'alerte contient:
- Date et heure de l'incident
- URL surveillée
- Détails de l'erreur
- Actions recommandées

## Dépannage

### Le monitoring ne fonctionne pas
1. Vérifiez que l'API `/api/monitor-localhost` est accessible
2. Vérifiez que `RESEND_API_KEY` est configuré dans `env.production.local`
3. Vérifiez les logs dans `monitor-localhost.log`

### Les emails ne sont pas envoyés
1. Vérifiez la configuration Resend dans `env.production.local`
2. Testez l'envoi d'email via `/api/test-resend-domain`
3. Vérifiez que le domaine `iahome.fr` est vérifié dans Resend

### La tâche planifiée ne démarre pas
1. Vérifiez que vous avez les droits administrateur
2. Vérifiez le statut de la tâche: `Get-ScheduledTask -TaskName "IAHome-Monitor-Localhost"`
3. Consultez l'historique de la tâche dans le Planificateur de tâches Windows

## Notes importantes

- Le monitoring nécessite que le serveur Next.js soit en cours d'exécution pour fonctionner
- Si le serveur est complètement hors ligne, l'API de monitoring ne pourra pas être appelée
- Dans ce cas, le script PowerShell utilisera un fallback pour tenter d'envoyer l'email directement
- Le système évite le spam en limitant les alertes à 1 toutes les 5 minutes maximum


