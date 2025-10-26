# 📋 Résumé Problème qrcodes.iahome.fr

## 🔍 Diagnostic

**Erreur** : 502 Bad Gateway

**Cause** : 
- Le tunnel Cloudflare actif (PID 18132) ne peut pas être arrêté
- Il utilise probablement une ancienne configuration pointant vers `localhost:3000`
- Le service QR Codes fonctionne sur `localhost:7006`

## ✅ Configuration Corrigée

Le fichier `cloudflare-qrcodes-fix-port.yml` a été modifié pour pointer vers le bon port :
```yaml
- hostname: qrcodes.iahome.fr
  service: http://localhost:7006  # ✅ Port corrigé
```

## 🎯 Action Requise

### Option 1 : Redémarrer Manuellement

1. **Ouvrez le Gestionnaire des tâches** (Ctrl+Shift+Esc)
2. Trouvez **tous les processus `cloudflared.exe`**
3. **Terminez-les tous** (clic droit → Terminer la tâche)
4. Attendez 5 secondes
5. Relancez :
   ```powershell
   .\cloudflared.exe tunnel --config cloudflare-qrcodes-fix-port.yml run
   ```

### Option 2 : Redémarrage Système

Si le processus PID 18132 persiste :
1. Redémarrez votre PC
2. Relancez le tunnel Cloudflare

### Option 3 : Utiliser une Page Rule

Si le problème persiste, créez une Page Rule dans Cloudflare Dashboard :
- URL : `qrcodes.iahome.fr/*`
- Action : Forwarding URL → `http://localhost:7006`
- Status : 301

## ⏱️ Après Redémarrage

Attendez 30-60 secondes pour que Cloudflare propage les changements, puis testez :
```powershell
curl https://qrcodes.iahome.fr/
```

## ✅ Vérification

1. **Service Docker** : `docker ps | grep qrcodes` → doit être "Up"
2. **Port local** : http://localhost:7006/health → doit répondre
3. **Via Cloudflare** : https://qrcodes.iahome.fr/ → doit fonctionner


