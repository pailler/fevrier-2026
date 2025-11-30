# 📋 Scripts Disponibles

## 📁 Emplacement

Tous les scripts sont maintenant dans le répertoire **`scripts/`** à la racine du projet.

## 🚀 Scripts Principaux

### Démarrage de tous les services
**`scripts/start-all-services.ps1`**
- Démarre Cloudflare Tunnel, Docker, conteneurs et services consoles
- Utilisation : `.\scripts\start-all-services.ps1`
- Options : `-Status`, `-Stop`, `-InstallAutoStart`

### Installation Cloudflare comme service
**`scripts/install-cloudflare-service.ps1`**
- Installe Cloudflare Tunnel comme service Windows
- Utilisation : `.\scripts\install-cloudflare-service.ps1` (en tant qu'administrateur)
- Options : `-Status`, `-Uninstall`

### Restauration Cloudflare
**`scripts/restore-cloudflare.ps1`**
- Redémarre Cloudflare Tunnel
- Utilisation : `.\scripts\restore-cloudflare.ps1`

## 🔧 Scripts Batch (Double-clic)

### Redémarrer Cloudflare
**`restart-cloudflare.bat`** (à la racine)
- Double-cliquez pour redémarrer Cloudflare Tunnel
- Pas besoin de PowerShell

### Vérifier Cloudflare
**`check-cloudflare.bat`** (à la racine)
- Double-cliquez pour vérifier le statut
- Pas besoin de PowerShell

## 📝 Utilisation Recommandée

### Pour démarrer tous les services
```powershell
.\scripts\start-all-services.ps1
```

### Pour redémarrer Cloudflare
**Option 1** : Double-cliquez sur `restart-cloudflare.bat` (à la racine)
**Option 2** : `.\scripts\restore-cloudflare.ps1`
**Option 3** : `Restart-Service cloudflared`

### Pour installer Cloudflare comme service
```powershell
.\scripts\install-cloudflare-service.ps1
```
*(En tant qu'administrateur)*

## ✅ Scripts Disponibles dans `scripts/`

- ✅ `start-all-services.ps1` - Script principal pour tous les services
- ✅ `install-cloudflare-service.ps1` - Installation service Cloudflare
- ✅ `restore-cloudflare.ps1` - Restauration Cloudflare
- ✅ `monitor-cloudflare.ps1` - Surveillance Cloudflare
- ✅ `start-production.ps1` - Démarrage production
- ✅ `rebuild-deep.ps1` - Reconstruction complète
- ✅ `force-rebuild-production.ps1` - Reconstruction forcée
- ✅ `rebuild-commit-push.ps1` - Rebuild + commit + push
- ✅ Et d'autres scripts utilitaires...

## 📍 Scripts Batch à la racine

- ✅ `restart-cloudflare.bat` - Redémarrage Cloudflare (double-clic)
- ✅ `check-cloudflare.bat` - Vérification Cloudflare (double-clic)

## 💡 Notes

- Les scripts PowerShell sont dans `scripts/`
- Les scripts batch (double-clic) restent à la racine pour faciliter l'accès
- Utilisez `.\scripts\<nom-du-script>.ps1` pour exécuter les scripts PowerShell
