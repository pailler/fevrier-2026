# 🔧 Solution : qrcodes.iahome.fr retourne 502

## 🐛 Problème

**Erreur** : 502 Bad Gateway sur https://qrcodes.iahome.fr/

**Cause probable** : 
- Le tunnel Cloudflare pointe vers `localhost:3000` au lieu de `localhost:7006`
- Un processus cloudflared (PID 18132) ne peut pas être arrêté

## ✅ Solution

### 1. Arrêter Tous les Tunnels

Ouvrez le **Gestionnaire des tâches** (Ctrl+Shift+Esc) :
1. Cherchez `cloudflared.exe`
2. **Terminez tous les processus** (clic droit → Terminer la tâche)

### 2. Modifier la Configuration

Le fichier `cloudflare-qrcodes-fix-port.yml` a été modifié pour pointer vers `localhost:7006`.

### 3. Redémarrer le Tunnel

```powershell
.\cloudflared.exe tunnel --config cloudflare-qrcodes-fix-port.yml run
```

### 4. Vérifier

Attendez 30 secondes puis testez :
```powershell
curl https://qrcodes.iahome.fr/
```

## 🎯 Configuration Correcte

```yaml
# QR Codes - Port corrigé (7006)
- hostname: qrcodes.iahome.fr
  service: http://localhost:7006
  originRequest:
    httpHostHeader: qrcodes.iahome.fr
    noTLSVerify: true
```

## ⚠️ Alternative : Page Rule de Redirection

Si le problème persiste, vous pouvez configurer une redirection dans Cloudflare Dashboard :

1. **Dashboard** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules
2. **Page Rules** → **Create page rule**
3. **URL** : `qrcodes.iahome.fr/*`
4. **Setting** : Forwarding URL → `http://localhost:7006`
5. **Status** : 301

## 🧪 Tests

1. **Service local** : http://localhost:7006/health
2. **Via Cloudflare** : https://qrcodes.iahome.fr/
3. **Docker** : `docker ps | grep qrcodes`


