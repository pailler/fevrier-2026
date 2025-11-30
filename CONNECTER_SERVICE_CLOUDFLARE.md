# 🔗 Connecter le Service Local à Cloudflare Dashboard

## 🎯 Objectif

Connecter le service Windows Cloudflare Tunnel au tunnel `iahome-new` dans Cloudflare Dashboard.

## 📋 Vérifications Préalables

### 1. Vérifier que le Tunnel Existe dans Cloudflare Dashboard

1. Allez sur : **https://one.dash.cloudflare.com/**
2. **Zero Trust** → **Networks** → **Tunnels**
3. Vérifiez que le tunnel **`iahome-new`** existe
4. Notez son **Tunnel ID** (format : `02a960c5-edd6-4b3f-844f-410b16247262`)

### 2. Obtenir le Token de Connexion

Si le tunnel existe mais est inactif :

1. **Cliquez** sur le tunnel `iahome-new`
2. Allez dans l'onglet **"Configure"** ou **"Overview"**
3. Cherchez **"Install connector"** ou **"Reinstall connector"**
4. Cloudflare vous donnera une commande comme :
   ```
   cloudflared service install <TOKEN>
   ```
5. **Copiez le token** (longue chaîne de caractères)

## 🔧 Méthode 1 : Réinstaller le Service avec le Token

### Si vous avez un Nouveau Token

1. **Arrêtez le service actuel** :
   ```powershell
   Stop-Service cloudflared
   ```

2. **Désinstallez l'ancien service** :
   ```powershell
   sc delete cloudflared
   ```

3. **Installez avec le nouveau token** :
   ```powershell
   cloudflared service install <NOUVEAU_TOKEN>
   ```

4. **Démarrez le service** :
   ```powershell
   Start-Service cloudflared
   ```

5. **Vérifiez le statut** :
   ```powershell
   Get-Service cloudflared
   ```

6. **Attendez 2-3 minutes** et vérifiez dans Cloudflare Dashboard que le tunnel devient "Healthy"

## 🔧 Méthode 2 : Utiliser le Token Existant

### Si le Token est Toujours Valide

Le service utilise déjà un token. Pour vérifier :

1. **Vérifiez le token utilisé** :
   ```powershell
   Get-WmiObject Win32_Service | Where-Object {$_.Name -eq "cloudflared"} | Select-Object PathName
   ```

2. **Redémarrez le service** pour forcer la reconnexion :
   ```powershell
   Restart-Service cloudflared
   ```

3. **Attendez 2-3 minutes** et vérifiez dans Cloudflare Dashboard

## 🔧 Méthode 3 : Créer un Nouveau Tunnel

### Si le Tunnel a été Supprimé

1. **Dans Cloudflare Dashboard** :
   - Allez dans **Zero Trust** → **Networks** → **Tunnels**
   - Cliquez sur **"Create a tunnel"**
   - Choisissez **"Cloudflared"**
   - Donnez un nom : `iahome-new`

2. **Installez le connecteur** :
   - Cloudflare vous donnera une commande avec un token
   - Exécutez cette commande dans PowerShell (en tant qu'administrateur)

3. **Configurez les routes** :
   - Allez dans **Public Hostnames**
   - Ajoutez vos domaines :
     - `iahome.fr` → `http://127.0.0.1:3000`
     - `www.iahome.fr` → `http://127.0.0.1:3000`
     - `consoles.regispailler.fr` → `http://192.168.1.150:80`
     - Etc.

## ✅ Vérification de la Connexion

### Dans Cloudflare Dashboard

1. Allez dans **Tunnels**
2. Le tunnel `iahome-new` doit avoir :
   - ✅ Statut : **"Healthy"** (vert)
   - ✅ Last seen : **Récent** (quelques minutes)
   - ✅ Connectors : **1 active**

### Localement

```powershell
# Vérifier le service
Get-Service cloudflared

# Vérifier les processus
Get-Process cloudflared

# Vérifier les logs
Get-EventLog -LogName Application -Source cloudflared -Newest 5
```

## 🆘 Dépannage

### Le Tunnel Reste "Inactive"

1. **Vérifiez le token** :
   - Le token peut être expiré
   - Obtenez un nouveau token depuis Cloudflare Dashboard

2. **Vérifiez la connectivité réseau** :
   - Le service doit pouvoir se connecter à Cloudflare
   - Vérifiez votre pare-feu

3. **Vérifiez les logs** :
   ```powershell
   Get-EventLog -LogName Application -Source cloudflared -Newest 20
   ```

### Le Service ne Démarre Pas

1. **Vérifiez les permissions** :
   - Le service doit être installé en tant qu'administrateur

2. **Réinstallez le service** :
   ```powershell
   sc delete cloudflared
   cloudflared service install <TOKEN>
   ```

### Le Token est Invalide

1. **Obtenez un nouveau token** depuis Cloudflare Dashboard
2. **Réinstallez le service** avec le nouveau token
3. **Redémarrez le service**

## 📝 Checklist

- [ ] Tunnel `iahome-new` existe dans Cloudflare Dashboard
- [ ] Token obtenu depuis Cloudflare Dashboard
- [ ] Service Windows installé avec le token
- [ ] Service démarré et Running
- [ ] Statut "Healthy" dans Cloudflare Dashboard (après 2-3 minutes)
- [ ] Routes Public Hostnames configurées
- [ ] Test de connectivité réussi

## 💡 Note Importante

Le service Windows peut être "Running" localement, mais pour que Cloudflare Dashboard le reconnaisse, il faut :
1. ✅ Un token valide
2. ✅ Le tunnel doit exister dans Cloudflare Dashboard
3. ✅ Le service doit pouvoir se connecter à Internet
4. ✅ Attendre 2-3 minutes pour la synchronisation

Une fois connecté, le statut dans Cloudflare Dashboard devrait passer de "Inactive" à "Healthy" automatiquement.






