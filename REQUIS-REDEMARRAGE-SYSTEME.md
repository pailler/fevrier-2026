# ⚠️ Redémarrage Système Requis

## 🔍 Diagnostic Final

**Service local** : ✅ Fonctionne (http://localhost:7006 retourne 200 OK)
**Via Cloudflare** : ❌ Retourne 502 Bad Gateway

**Cause** : Le tunnel Cloudflare (PID 18132) utilise une ancienne configuration et ne peut pas être arrêté

## ✅ Solution

### Redémarrez votre PC

Le processus cloudflared (PID 18132) ne peut pas être arrêté car il a probablement été lancé depuis une autre session Windows ou avec des privilèges différents.

**Après redémarrage** :

1. Le tunnel Cloudflare ne démarrera pas automatiquement
2. Relancez-le avec la bonne configuration :

```powershell
cd C:\Users\AAA\Documents\iahome
.\cloudflared.exe tunnel --config cloudflare-qrcodes-fix-port.yml run
```

Ou utilisez le script :

```powershell
.\start-cloudflare-tunnel.ps1
```

## 📋 Configuration Qui Sera Appliquée

Le fichier `cloudflare-qrcodes-fix-port.yml` est correctement configuré :

```yaml
- hostname: qrcodes.iahome.fr
  service: http://localhost:7006  # ✅ Port correct
```

## 🧪 Après Redémarrage

Attendez 30 secondes puis testez :
```powershell
curl https://qrcodes.iahome.fr/
```

Cela devrait fonctionner correctement.

## 💡 Alternative (Si Redémarrage Impossible)

Si vous ne pouvez pas redémarrage maintenant :

1. **Ouvrez le Gestionnaire des tâches** (Ctrl+Shift+Esc)
2. Cherchez `cloudflared.exe`
3. Cliquez sur "Détails"
4. Trouvez le PID 18132
5. Clic droit → Terminer l'arborescence de processus

**Attention** : Cela peut arrêter d'autres services si cloudflared est utilisé ailleurs.


