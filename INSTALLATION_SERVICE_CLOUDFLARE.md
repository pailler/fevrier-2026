# 🔧 Installation de Cloudflare Tunnel comme service Windows

## 🎯 Objectif

Installer Cloudflare Tunnel comme service Windows pour qu'il démarre automatiquement en arrière-plan, **sans avoir besoin d'ouvrir une console PowerShell**.

## ✅ Avantages

- ✅ Démarrage automatique au boot
- ✅ Fonctionne en arrière-plan (pas de fenêtres)
- ✅ Redémarrage automatique en cas d'erreur
- ✅ Gestion via les services Windows
- ✅ Pas besoin d'ouvrir PowerShell manuellement

## 🚀 Installation

### Étape 1 : Ouvrir PowerShell en tant qu'administrateur

1. **Clic droit** sur PowerShell
2. **Sélectionner** "Exécuter en tant qu'administrateur"
3. **Confirmer** l'élévation de privilèges

### Étape 2 : Exécuter le script d'installation

```powershell
cd C:\Users\AAA\Documents\iahome
.\install-cloudflare-service.ps1
```

Le script va :
1. Vérifier que vous êtes administrateur
2. Arrêter les processus cloudflared existants
3. Installer cloudflared comme service Windows
4. Configurer le démarrage automatique
5. Démarrer le service

### Étape 3 : Vérifier l'installation

```powershell
.\install-cloudflare-service.ps1 -Status
```

Ou via les services Windows :
```powershell
Get-Service cloudflared
```

## 📋 Gestion du service

### Vérifier le statut
```powershell
.\install-cloudflare-service.ps1 -Status
```

### Démarrer le service
```powershell
Start-Service cloudflared
```

### Arrêter le service
```powershell
Stop-Service cloudflared
```

### Redémarrer le service
```powershell
Restart-Service cloudflared
```

### Voir les logs
```powershell
Get-EventLog -LogName Application -Source cloudflared -Newest 20
```

### Désinstaller le service
```powershell
.\install-cloudflare-service.ps1 -Uninstall
```

## 🔍 Vérification via l'interface Windows

1. **Ouvrir** "Services" (Win+R → `services.msc`)
2. **Trouver** "cloudflared"
3. **Vérifier** :
   - Statut : En cours d'exécution
   - Type de démarrage : Automatique

## ⚙️ Configuration

Le service utilise automatiquement le fichier `cloudflare-active-config.yml` dans le répertoire du script.

Pour modifier la configuration :
1. Modifiez `cloudflare-active-config.yml`
2. Redémarrez le service : `Restart-Service cloudflared`

## 🆘 Dépannage

### Le service ne démarre pas

1. Vérifiez les logs :
   ```powershell
   Get-EventLog -LogName Application -Source cloudflared -Newest 10
   ```

2. Vérifiez que cloudflared est dans le PATH :
   ```powershell
   cloudflared --version
   ```

3. Vérifiez que le fichier de configuration existe :
   ```powershell
   Test-Path cloudflare-active-config.yml
   ```

### Le service démarre mais ne fonctionne pas

1. Vérifiez la configuration dans Cloudflare Dashboard
2. Vérifiez que les services locaux sont démarrés :
   ```powershell
   .\start-consoles-background.ps1 -Status
   ```

### Réinstaller le service

```powershell
.\install-cloudflare-service.ps1 -Uninstall
.\install-cloudflare-service.ps1
```

## ✅ Après installation

Une fois le service installé :
- ✅ Cloudflare Tunnel démarre automatiquement au boot
- ✅ Pas besoin d'ouvrir PowerShell
- ✅ Fonctionne en arrière-plan
- ✅ Redémarre automatiquement en cas d'erreur

Vous pouvez maintenant fermer toutes les fenêtres PowerShell. Le service continuera de fonctionner !






