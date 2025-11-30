# 🔧 Réactiver le Tunnel iahome-new dans Cloudflare Dashboard

## 🎯 Problème

Le tunnel `iahome-new` est marqué comme "hors service" dans Cloudflare Dashboard, même si le service Windows fonctionne localement.

## ✅ Diagnostic Local

- ✅ Service Windows : Running
- ✅ Processus cloudflared : Actif
- ✅ Credentials : Présents
- ⚠️  Tunnel : Hors service dans Dashboard

## 🔧 Solution : Réactiver le Tunnel dans Cloudflare Dashboard

### Étape 1 : Accéder au Dashboard

1. Allez sur : **https://one.dash.cloudflare.com/**
2. Connectez-vous à votre compte
3. Allez dans **Zero Trust** → **Networks** → **Tunnels**

### Étape 2 : Vérifier le Statut du Tunnel

1. Cherchez le tunnel **`iahome-new`**
2. Vérifiez son statut :
   - ✅ **Healthy** = Tunnel connecté et fonctionnel
   - ⚠️ **Degraded** = Tunnel connecté mais avec problèmes
   - ❌ **Inactive** = Tunnel déconnecté ou hors service

### Étape 3 : Si le Tunnel est Inactif

#### Option A : Le Tunnel Existe mais est Inactif

1. **Cliquez** sur le tunnel `iahome-new`
2. Vérifiez l'onglet **"Status"** ou **"Health"**
3. Si le statut est "Inactive" ou "Disconnected" :
   - Le service local fonctionne mais Cloudflare ne le voit pas
   - Vérifiez que le token est toujours valide
   - Le tunnel devrait se reconnecter automatiquement

#### Option B : Le Tunnel a été Supprimé

Si le tunnel n'apparaît plus dans la liste :

1. **Créez un nouveau tunnel** :
   - Cliquez sur **"Create a tunnel"**
   - Choisissez **"Cloudflared"**
   - Donnez un nom : `iahome-new` (ou un autre nom)
   - Notez le **Tunnel ID** généré

2. **Installez le tunnel localement** :
   ```powershell
   # Téléchargez cloudflared si nécessaire
   # Puis exécutez la commande fournie par Cloudflare Dashboard
   # Elle ressemblera à :
   cloudflared service install <TOKEN>
   ```

3. **Configurez les routes** :
   - Allez dans **Public Hostnames**
   - Ajoutez vos domaines :
     - `iahome.fr` → `http://127.0.0.1:3000`
     - `consoles.regispailler.fr` → `http://192.168.1.150:80`
     - Etc.

### Étape 4 : Vérifier le Token

Le service utilise un token pour se connecter. Si le tunnel a été supprimé et recréé, vous devrez :

1. **Obtenir le nouveau token** depuis Cloudflare Dashboard
2. **Réinstaller le service** avec le nouveau token :
   ```powershell
   # Arrêter le service actuel
   Stop-Service cloudflared
   
   # Désinstaller l'ancien service
   sc delete cloudflared
   
   # Réinstaller avec le nouveau token
   cloudflared service install <NOUVEAU_TOKEN>
   ```

## 🔍 Vérification Rapide

### Vérifier si le Tunnel est Connecté

1. Dans Cloudflare Dashboard → Tunnels
2. Le tunnel `iahome-new` doit avoir le statut **"Healthy"**
3. La colonne **"Last seen"** doit être récente (quelques minutes)

### Si le Statut Reste "Inactive"

1. **Vérifiez les logs** :
   ```powershell
   Get-EventLog -LogName Application -Source cloudflared -Newest 10
   ```

2. **Vérifiez que le service fonctionne** :
   ```powershell
   Get-Service cloudflared
   Get-Process cloudflared
   ```

3. **Redémarrez le service** :
   ```powershell
   Restart-Service cloudflared
   ```

4. **Attendez 2-3 minutes** et vérifiez à nouveau dans le Dashboard

## 📋 Checklist de Réactivation

- [ ] Accéder à Cloudflare Dashboard → Tunnels
- [ ] Vérifier le statut du tunnel `iahome-new`
- [ ] Si "Inactive" : Attendre 2-3 minutes (reconnexion automatique)
- [ ] Si toujours "Inactive" : Vérifier le token
- [ ] Si tunnel supprimé : Créer un nouveau tunnel
- [ ] Réinstaller le service avec le nouveau token si nécessaire
- [ ] Configurer les routes Public Hostnames
- [ ] Vérifier que le statut devient "Healthy"

## 🆘 Si Rien ne Fonctionne

1. **Supprimez complètement le service** :
   ```powershell
   Stop-Service cloudflared
   sc delete cloudflared
   ```

2. **Créez un nouveau tunnel** dans Cloudflare Dashboard

3. **Installez le service** avec la commande fournie par Cloudflare

4. **Configurez les routes** dans Public Hostnames

## 💡 Note Importante

Le service Windows peut être "Running" localement, mais si le tunnel est marqué "hors service" dans Cloudflare Dashboard, cela signifie que :
- Le token peut être invalide ou expiré
- Le tunnel a été supprimé dans le Dashboard
- Il y a un problème de connectivité réseau
- Le tunnel doit être réactivé dans le Dashboard






