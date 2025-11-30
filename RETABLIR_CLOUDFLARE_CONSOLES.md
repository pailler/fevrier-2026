# 🔧 Rétablir Cloudflare pour consoles.regispailler.fr

## 📋 Vue d'ensemble

Ce guide vous permet de rétablir complètement la configuration Cloudflare pour `consoles.regispailler.fr` avec routage correct vers le frontend et le backend.

## ✅ État actuel

- **Backend** : Fonctionne sur `http://192.168.1.150:5001`
- **Frontend** : Fonctionne sur `http://192.168.1.150:5000`
- **Traefik** : Configure pour router `/api` → Backend, `/*` → Frontend
- **Cloudflare Tunnel** : Configuration à rétablir

## 🔧 Étape 1 : Vérifier la configuration du fichier local

Le fichier `cloudflare-active-config.yml` est déjà configuré pour pointer vers Traefik :

```yaml
- hostname: consoles.regispailler.fr
  service: http://192.168.1.150:80  # Traefik
```

## 🔧 Étape 2 : Configurer dans Cloudflare Dashboard (OBLIGATOIRE)

**La configuration dans Cloudflare Dashboard prend le dessus sur le fichier local !**

### Instructions détaillées :

1. **Connectez-vous** à : https://dash.cloudflare.com/

2. **Allez dans** : **Zero Trust** → **Networks** → **Tunnels**

3. **Sélectionnez** votre tunnel (`iahome-new`)

4. **Cliquez sur** : **Public Hostnames**

5. **Trouvez** la route pour `consoles.regispailler.fr`

6. **Modifiez** la route existante OU **Supprimez-la et créez-en une nouvelle** :

   **Configuration à appliquer :**
   - **Subdomain** : `consoles`
   - **Domain** : `regispailler.fr`
   - **Service** : `http://192.168.1.150:80` ⚠️ **IMPORTANT : Port 80 (Traefik)**
   - **Path** : (laissez **VIDE** - Traefik gère le routage)
   - **HTTP Host Header** : `consoles.regispailler.fr` (optionnel mais recommandé)

7. **Cliquez sur** : **Save**

## 🔧 Étape 3 : Redémarrer Cloudflare Tunnel

Après avoir modifié la configuration dans le dashboard :

```powershell
# Arrêter cloudflared
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"} | Stop-Process -Force

# Attendre 5 secondes
Start-Sleep -Seconds 5

# Redémarrer cloudflared
cd C:\Users\AAA\Documents\iahome
cloudflared tunnel --config cloudflare-active-config.yml run
```

Ou si cloudflared est un service Windows :
```powershell
Restart-Service cloudflared
```

## ✅ Étape 4 : Vérification

Attendez **1-2 minutes** après le redémarrage, puis testez :

### Test 1 : Frontend
```
https://consoles.regispailler.fr
```
✅ Devrait afficher l'application

### Test 2 : API Health
```
https://consoles.regispailler.fr/api/health
```
✅ Devrait retourner : `{"success":true,"message":"Backend opérationnel",...}`

### Test 3 : API Consoles
```
https://consoles.regispailler.fr/api/consoles
```
✅ Devrait retourner la liste des consoles

## 🔍 Comment ça fonctionne

1. **Cloudflare Tunnel** reçoit la requête pour `consoles.regispailler.fr`
2. **Cloudflare Tunnel** route vers `http://192.168.1.150:80` (Traefik)
3. **Traefik** analyse la requête :
   - Si `/api/*` → Route vers Backend (port 5001)
   - Sinon → Route vers Frontend (port 5000)

## ⚠️ Points importants

1. **Le port 80 est Traefik**, pas le frontend directement
2. **Traefik gère le routage** `/api` automatiquement
3. **La configuration Dashboard prend le dessus** sur le fichier local
4. **Attendez 1-2 minutes** après chaque modification

## 🆘 Dépannage

### Si l'erreur 404 persiste :

1. **Vérifiez que Traefik fonctionne** :
   ```powershell
   curl -H "Host: consoles.regispailler.fr" http://192.168.1.150:80/api/health
   ```
   Devrait retourner : `{"success":true,...}`

2. **Vérifiez que les services sont démarrés** :
   ```powershell
   .\start-consoles-complete.ps1 -Status
   ```

3. **Vérifiez les logs cloudflared** dans la fenêtre PowerShell

4. **Vérifiez la configuration dans Cloudflare Dashboard** :
   - Assurez-vous que le service pointe vers `http://192.168.1.150:80`
   - Assurez-vous que le Path est vide

## 📝 Résumé de la configuration

```
Cloudflare Tunnel → http://192.168.1.150:80 (Traefik)
                    ↓
            Traefik route :
            - /api/* → http://192.168.1.150:5001 (Backend)
            - /* → http://192.168.1.150:5000 (Frontend)
```

## ✅ Checklist finale

- [ ] Configuration dans Cloudflare Dashboard mise à jour (service = `http://192.168.1.150:80`)
- [ ] Cloudflare Tunnel redémarré
- [ ] Attendu 1-2 minutes
- [ ] Testé `https://consoles.regispailler.fr` → ✅ Fonctionne
- [ ] Testé `https://consoles.regispailler.fr/api/health` → ✅ Fonctionne

Une fois toutes ces étapes complétées, `consoles.regispailler.fr` devrait être complètement fonctionnel !







