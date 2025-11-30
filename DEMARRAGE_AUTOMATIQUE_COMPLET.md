# 🚀 Démarrage Automatique Complet - iahome.fr et tous les sous-domaines

## 🎯 Objectif

Démarrer automatiquement **tous les services** nécessaires pour iahome.fr et ses sous-domaines **sans avoir besoin d'ouvrir PowerShell**.

## ✅ Services inclus

1. **Cloudflare Tunnel** : Service Windows (démarrage automatique au boot)
2. **Docker** : Service Windows (démarrage automatique au boot)
3. **Conteneurs Docker** : iahome-app, Traefik, etc.
4. **Services Consoles** : Backend (5001) + Frontend (5000)

## 🚀 Installation du démarrage automatique

### Étape 1 : Ouvrir PowerShell en tant qu'administrateur

1. **Clic droit** sur PowerShell
2. **Sélectionner** "Exécuter en tant qu'administrateur"
3. **Confirmer** l'élévation de privilèges

### Étape 2 : Installer le démarrage automatique

```powershell
cd C:\Users\AAA\Documents\iahome
.\start-all-services.ps1 -InstallAutoStart
```

Cela créera une tâche planifiée Windows qui démarre automatiquement tous les services au login.

## 📋 Utilisation

### Démarrer tous les services maintenant
```powershell
.\start-all-services.ps1
```

### Vérifier le statut de tous les services
```powershell
.\start-all-services.ps1 -Status
```

### Arrêter tous les services
```powershell
.\start-all-services.ps1 -Stop
```

## 🔄 Après installation du démarrage automatique

Une fois installé, **tous les services démarreront automatiquement** :
- ✅ Au démarrage de Windows (Cloudflare Tunnel, Docker)
- ✅ Au login utilisateur (services consoles, conteneurs Docker)
- ✅ **Sans avoir besoin d'ouvrir PowerShell**

## 📝 Ce qui démarre automatiquement

### Au boot Windows (Services Windows)
- ✅ **Cloudflare Tunnel** : Service Windows configuré
- ✅ **Docker** : Service Windows configuré

### Au login utilisateur (Tâche planifiée)
- ✅ **Conteneurs Docker** : iahome-app, Traefik, etc.
- ✅ **Backend Consoles** : Port 5001
- ✅ **Frontend Consoles** : Port 5000

## 🎯 Résultat Final

Après installation :
- ✅ **Pas besoin d'ouvrir PowerShell** pour démarrer les services
- ✅ **Tout démarre automatiquement** au boot/login
- ✅ **Tous les sous-domaines fonctionnent** :
  - iahome.fr
  - www.iahome.fr
  - qrcodes.iahome.fr
  - librespeed.iahome.fr
  - whisper.iahome.fr
  - psitransfer.iahome.fr
  - metube.iahome.fr
  - pdf.iahome.fr
  - stablediffusion.iahome.fr
  - comfyui.iahome.fr
  - ruinedfooocus.iahome.fr
  - cogstudio.iahome.fr
  - meeting-reports.iahome.fr
  - hunyuan3d.iahome.fr
  - consoles.regispailler.fr

## 🔍 Vérification

### Vérifier la tâche planifiée
```powershell
Get-ScheduledTask -TaskName "IAHome-StartAllServices"
```

### Vérifier le statut de tous les services
```powershell
.\start-all-services.ps1 -Status
```

### Vérifier les services Windows
```powershell
Get-Service cloudflared, docker
```

## 🆘 Dépannage

### Les services ne démarrent pas automatiquement

1. **Vérifiez la tâche planifiée** :
   ```powershell
   Get-ScheduledTask -TaskName "IAHome-StartAllServices" | Format-List
   ```

2. **Vérifiez les logs** :
   ```powershell
   Get-EventLog -LogName Application -Source "Task Scheduler" -Newest 10
   ```

3. **Réinstallez le démarrage automatique** :
   ```powershell
   .\start-all-services.ps1 -InstallAutoStart
   ```

### Désinstaller le démarrage automatique

```powershell
Unregister-ScheduledTask -TaskName "IAHome-StartAllServices" -Confirm:$false
```

## ✅ Checklist finale

- [ ] Cloudflare Tunnel installé comme service Windows
- [ ] Docker installé et configuré
- [ ] Démarrage automatique installé (`-InstallAutoStart`)
- [ ] Testé le démarrage manuel (`.\start-all-services.ps1`)
- [ ] Vérifié le statut (`.\start-all-services.ps1 -Status`)
- [ ] Redémarré l'ordinateur pour tester le démarrage automatique

Une fois tout configuré, **vous n'aurez plus jamais besoin d'ouvrir PowerShell** pour démarrer les services !






