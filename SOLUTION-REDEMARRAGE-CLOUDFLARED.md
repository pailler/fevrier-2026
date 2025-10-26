# ✅ Solution : Redémarrer cloudflared

## 🔍 Problème

Deux tunnels cloudflared sont actifs :
- **PID 27840** (ancien) : responsable des 502 Bad Gateway
- **PID 35104** (nouveau) : configuration correcte mais pas utilisé par Cloudflare

**Service local** : ✅ Fonctionne parfaitement sur `localhost:7006`

## ❌ Impossibilité D'Arrêter L'Ancien Tunnel

Les méthodes suivantes ont échoué :
- `Stop-Process` (Accès refusé)
- `taskkill /F /IM cloudflared.exe` (Accès refusé)
- Le processus a probablement été lancé par un autre utilisateur ou service

## ✅ SOLUTION : Redémarrage Système

### Option 1 : Redémarrage Complet (RECOMMANDÉ)

1. **Sauvegardez votre travail**
2. **Redémarrez Windows** :
   - Menu Démarrer → Redémarrer
   - OU PowerShell (en admin) : `Restart-Computer -Force`
3. **Après redémarrage** :
   ```powershell
   cd C:\Users\AAA\Documents\iahome
   .\cloudflared.exe tunnel --config cloudflare-qrcodes-fix-port.yml run
   ```

### Option 2 : Arrêt Manuel via Gestionnaire des Tâches

1. **Ouvrez le Gestionnaire des tâches** (Ctrl+Shift+Esc)
2. **Onglet "Détails"**
3. **Cherchez `cloudflared.exe`**
4. **Clic droit sur PID 27840** → Terminer l'arborescence de processus
5. **Attendez 5 secondes**, puis :
   ```powershell
   .\cloudflared.exe tunnel --config cloudflare-qrcodes-fix-port.yml run
   ```

### Option 3 : Désactiver le Service Automatique (Si Applicable)

Si cloudflared démarre automatiquement :

```powershell
# Lister les services cloudflared
Get-Service | Where-Object {$_.DisplayName -like "*cloudflared*"}

# Désactiver le service (si trouvé)
Stop-Service -Name "cloudflared" -Force
Set-Service -Name "cloudflared" -StartupType Disabled
```

## 🧪 Après Redémarrage / Arrêt

Attendez 30 secondes puis testez :

```powershell
curl -I https://qrcodes.iahome.fr/
```

Vous devriez obtenir :
```
HTTP/1.1 200 OK
```

## 📋 Configuration Actuelle

Le fichier `cloudflare-qrcodes-fix-port.yml` est correctement configuré :

```yaml
- hostname: qrcodes.iahome.fr
  service: http://localhost:7006  # ✅ Port correct
```

## 💡 Pourquoi Redémarrer ?

L'ancien processus (PID 27840) utilise probablement une configuration obsolète pointant vers le mauvais port. Un redémarrage système est le moyen le plus sûr de le tuer et de démarrer avec la bonne configuration.

## ⚡ Alternative Rapide

Si vous ne pouvez pas redémarrer maintenant, vous pouvez :
1. Vérifier que le service Docker `qrcodes-iahome` fonctionne
2. Attendre que l'ancien tunnel se relance naturellement
3. Ou modifier le routage DNS directement dans Cloudflare Dashboard

Mais la solution la plus propre reste **le redémarrage**.

