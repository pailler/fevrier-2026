# Redémarrage Cloudflare Tunnel - consoles.regispailler.fr

## ✅ Configuration mise à jour

La configuration Cloudflare Tunnel a été mise à jour pour pointer vers Traefik :
- **Avant** : `http://localhost:5000` (frontend directement)
- **Après** : `http://127.0.0.1:80` (Traefik qui route vers frontend et backend)

## 🔄 Redémarrage

Cloudflare Tunnel a été redémarré avec la nouvelle configuration.

## ⏳ Attente de connexion

Attendez **1-2 minutes** pour que Cloudflare Tunnel se reconnecte complètement.

## 🧪 Test

Après l'attente, testez :
1. **Frontend** : https://consoles.regispailler.fr
2. **API Health** : https://consoles.regispailler.fr/api/health
3. **API Consoles** : https://consoles.regispailler.fr/api/consoles

## 📝 Vérification

Si l'erreur 404 persiste après 2-3 minutes :

1. **Vérifiez la fenêtre PowerShell** où cloudflared tourne pour voir les logs
2. **Vérifiez que Traefik fonctionne** :
   ```powershell
   curl -H "Host: consoles.regispailler.fr" http://127.0.0.1/api/health
   ```
   Devrait retourner : `{"success":true,"message":"Backend opérationnel",...}`

3. **Vérifiez que les services sont démarrés** :
   ```powershell
   .\start-consoles-complete.ps1 -Status
   ```

## 🔧 Si le problème persiste

Si après 3 minutes l'erreur 404 persiste toujours :

1. Vérifiez que cloudflared utilise bien la bonne config :
   - Ouvrez la fenêtre PowerShell où cloudflared tourne
   - Vérifiez qu'il n'y a pas d'erreurs de connexion
   - Vérifiez qu'il se connecte bien à `127.0.0.1:80`

2. Vérifiez que Traefik reçoit les requêtes :
   ```powershell
   docker logs iahome-traefik --tail 50 --follow
   ```
   Puis testez https://consoles.regispailler.fr/api/health et regardez les logs

3. Vérifiez la configuration DNS dans Cloudflare :
   - Allez sur https://dash.cloudflare.com/
   - DNS → Records
   - Vérifiez que `consoles` (CNAME) pointe bien vers votre tunnel Cloudflare








