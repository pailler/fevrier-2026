# 🔍 Erreur CORS sur qrcodes.iahome.fr

## 📝 Description de l'Erreur

L'erreur suivante apparaît sur `https://qrcodes.iahome.fr` :

```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur http://localhost:8001/upload. Raison : échec de la requête CORS. Code d'état : (null).

Error uploading file: 
Object { message: "Network Error", name: "AxiosError", code: "ERR_NETWORK" }
```

## 🔎 Diagnostic

### ✅ Service QR Codes (Port 7006)
- **Statut** : Fonctionne correctement
- **Config** : Route vers `localhost:7006` 
- **Code** : Ne fait aucun appel à `localhost:8001`
- **Logs** : Retourne 200 OK

### ❌ Port 8001
- **Service** : Meeting Reports Backend
- **Problème** : L'erreur mentionne `/upload` qui est l'endpoint meeting-reports
- **Cause probable** : Mauvais routage ou cache du navigateur

## 🎯 Conclusion

**L'erreur CORS n'est PAS causée par le service QR Codes.**

### Causes Possibles

1. **Cache du navigateur** : L'ancienne page meeting-reports est toujours en cache
2. **Mauvais routage Cloudflare** : Le mauvais service répond
3. **Autre page ouverte** : Vous avez peut-être meeting-reports ouvert dans un autre onglet

## ✅ Solution

### Solution 1 : Vider le Cache du Navigateur

1. **Ouvrez la console** (F12)
2. **Clic droit sur le bouton d'actualisation** 
3. **"Vider le cache et actualiser"**

### Solution 2 : Vérifier le Service QR Codes

```powershell
# Test direct
curl http://localhost:7006/
```

Vous devriez voir une page HTML avec "QR Code Generator - IAHome"

### Solution 3 : Vérifier Cloudflare

```powershell
# Vérifier le contenu réel
curl https://qrcodes.iahome.fr/
```

Le titre devrait être "QR Code Generator - IAHome" et PAS "Meeting Reports"

## 📋 Vérifications

```powershell
# 1. Vérifier le service local
Invoke-WebRequest -Uri http://localhost:7006/ -UseBasicParsing | Select-Object StatusCode, Content

# 2. Vérifier via Cloudflare
Invoke-WebRequest -Uri https://qrcodes.iahome.fr/ -UseBasicParsing | Select-Object StatusCode

# 3. Vérifier que le tunnel utilise la bonne config
Get-Process -Name cloudflared | Format-Table Id, StartTime
```

## 💡 Si l'Erreur Persiste

Si l'erreur provient bien de `qrcodes.iahome.fr`, il y a peut-être un routage Cloudflare incorrect.

Vérifiez dans Cloudflare Dashboard que :
- `qrcodes.iahome.fr` pointe vers le tunnel qui route vers `localhost:7006`
- Aucune Page Rule ne redirige vers `localhost:8001`

