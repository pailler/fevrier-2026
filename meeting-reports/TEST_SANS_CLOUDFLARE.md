# Test sans Cloudflare - Diagnostic

## 🎯 Objectif

Tester l'upload en bypassant complètement Cloudflare pour confirmer que c'est bien le Worker qui bloque.

## Test rapide

### Option 1 : Modifier temporairement le frontend

1. **Ouvrez** `meeting-reports/frontend/src/App.js`
2. **Ligne 11**, remplacez :
   ```javascript
   const API_BASE_URL = '/api';
   ```
   Par :
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';  // Direct backend
   ```

3. **Reconstruisez le frontend** :
   ```powershell
   cd meeting-reports
   docker-compose build frontend
   docker-compose up -d frontend
   ```

4. **Accédez à l'app via** : `http://localhost:3050` (sans passer par Cloudflare)

5. **Testez l'upload** d'un fichier de 34 MB

### Option 2 : Test direct avec curl

```powershell
# Créer un fichier de test de 34 MB
$testFile = New-Item -Path "test-34mb.bin" -ItemType File -Force
$testFile.SetLength(34MB)

# Tester directement le backend (bypass tout)
curl -X POST http://localhost:8000/upload -F "file=@test-34mb.bin" -v
```

### Option 3 : Désactiver temporairement le Worker

Dans Cloudflare Dashboard :
1. Workers & Pages → `protect-sous-domaines-iahome`
2. Triggers → Routes
3. Trouvez `meeting-reports.iahome.fr/*`
4. **Désactivez** la route (toggle OFF)
5. Testez via `https://meeting-reports.iahome.fr`
6. Si ça fonctionne → Le Worker bloque. Réactivez et modifiez le code.

## 📊 Interprétation des résultats

| Test | Résultat | Conclusion |
|------|----------|------------|
| **Option 1** fonctionne | ✅ Upload réussi | C'est Cloudflare qui bloque |
| **Option 2** fonctionne | ✅ Upload réussi | C'est Cloudflare qui bloque |
| **Option 3** fonctionne | ✅ Upload réussi | C'est le Worker qui bloque |
| **Aucun test** ne fonctionne | ❌ Erreur 413 | Problème ailleurs (Traefik/Nginx) |

## ⏱️ Propagation Cloudflare

- **Normal** : 1-2 minutes
- **Maximum** : 5-10 minutes
- **Pour accélérer** : Modifiez/sauvegardez à nouveau la route dans Cloudflare Dashboard

## ✅ Après les tests

Si les tests **Option 1, 2 ou 3** fonctionnent :
- ✅ Confirme que c'est Cloudflare qui bloque
- ✅ Modifiez le Worker dans Cloudflare Dashboard
- ✅ Attendez 5 minutes après le déploiement
- ✅ Retestez

Si aucun test ne fonctionne :
- ❌ Le problème vient de Traefik/Nginx/Backend
- ❌ Vérifiez les logs : `docker logs meeting-reports-nginx-1 --tail=50`
















