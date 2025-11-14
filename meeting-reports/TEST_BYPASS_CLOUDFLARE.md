# Test pour bypasser Cloudflare complètement

## 🎯 Objectif

Tester si le problème vient vraiment de Cloudflare ou d'un autre composant.

## Test 1 : Accès direct via IP (bypass DNS Cloudflare)

Si vous connaissez l'IP publique de votre serveur, testez directement :

```powershell
# Remplacer IP_PUBLIQUE par l'IP de votre serveur
curl -X POST http://IP_PUBLIQUE:3050/api/upload -F "file=@test-file.bin" -v
```

## Test 2 : Modifier temporairement le frontend

Modifiez `meeting-reports/frontend/src/App.js` ligne 11 :

```javascript
// AVANT :
const API_BASE_URL = '/api';

// TEMPORAIREMENT (pour tester) :
const API_BASE_URL = 'http://localhost:8000';  // Direct backend
// OU
const API_BASE_URL = 'http://localhost:3050/api';  // Via Nginx local
```

Puis accédez à l'app via `http://localhost:3050` (bypass Cloudflare complètement).

## Test 3 : Désactiver temporairement le Worker

Dans Cloudflare Dashboard :
1. Workers & Pages → `protect-sous-domaines-iahome`
2. Triggers → Routes
3. Trouvez `meeting-reports.iahome.fr/*`
4. **Désactivez-la temporairement** (bouton toggle)
5. Testez l'upload via `https://meeting-reports.iahome.fr`
6. Si ça fonctionne → Le Worker bloque. Réactivez et modifiez le code.
7. Si ça ne fonctionne pas → Le problème vient d'ailleurs (Traefik/Nginx)

## Test 4 : Vérifier la propagation Cloudflare

La propagation peut prendre jusqu'à 5 minutes. Pour vérifier :

1. Cloudflare Dashboard → Workers → Logs
2. Faites un upload
3. Regardez les logs en temps réel
4. Si vous voyez la requête dans les logs du Worker → Le Worker intercepte encore
5. Si pas de logs → Le Worker ne capture plus les requêtes

## 📊 Résultats attendus

- **Si Test 2 fonctionne** (localhost:3050) → C'est Cloudflare qui bloque
- **Si Test 3 fonctionne** (Worker désactivé) → C'est le Worker qui bloque
- **Si aucun test ne fonctionne** → Le problème vient de Traefik/Nginx/Backend













