# Monitoring localhost avec notifications Resend

Recevez un email quand localhost:3000 (IAHome) est down.

## Configuration

Ajoutez dans `.env.local` ou `.env` :

```env
# Obligatoire pour Resend
RESEND_API_KEY=re_xxx

# Email qui reçoit les alertes (optionnel, défaut: formateur_tic@hotmail.com)
MONITOR_ALERT_EMAIL=votre@email.com

# Optionnel
RESEND_FROM_EMAIL=noreply@iahome.fr
MONITOR_URL=http://localhost:3000
MONITOR_INTERVAL_MS=120000
```

## Utilisation

**Surveillance continue** (vérification toutes les 2 minutes) :
```bash
npm run monitor
```

**Vérification unique** :
```bash
npm run monitor:check
```

## Principe

Le script `scripts/monitor-localhost.js` s'exécute **indépendamment de Next.js**.  
Si l'app crash, le script continue de tourner et peut envoyer l'alerte via Resend.

Lancez-le dans un **second terminal** pendant vos sessions de dev :

```bash
# Terminal 1 : l'app
npm run dev

# Terminal 2 : le moniteur
npm run monitor
```

## Planification (optionnel)

Sous Windows, vous pouvez planifier une vérification toutes les 5 minutes via **Planificateur de tâches** :

1. Créer une tâche déclenchée toutes les 5 min
2. Action : `node C:\Users\AAA\Documents\iahome\scripts\monitor-localhost.js --once`
