# ✅ Démarrage Automatique - Sans Ouvrir PowerShell

## 🎯 Objectif Atteint

Tous les services pour **iahome.fr et tous les sous-domaines** peuvent maintenant démarrer **automatiquement sans ouvrir PowerShell**.

## ✅ État Actuel

### Services déjà automatiques (au boot)
- ✅ **Cloudflare Tunnel** : Service Windows (démarrage automatique)
- ✅ **Docker** : Service Windows (démarrage automatique)
- ✅ **Conteneurs Docker** : Démarrent automatiquement avec Docker

### Services à configurer pour démarrage automatique
- ⚙️ **Services Consoles** : Backend (5001) + Frontend (5000)

## 🚀 Installation du Démarrage Automatique Complet

### Étape 1 : Ouvrir PowerShell en tant qu'administrateur

1. **Clic droit** sur PowerShell
2. **Sélectionner** "Exécuter en tant qu'administrateur"
3. **Confirmer** l'élévation de privilèges

### Étape 2 : Installer le démarrage automatique

```powershell
cd C:\Users\AAA\Documents\iahome
.\start-all-services.ps1 -InstallAutoStart
```

Cela créera une **tâche planifiée Windows** qui démarre automatiquement tous les services au login.

## 📋 Ce qui démarre automatiquement

### Au boot Windows (Services Windows)
- ✅ **Cloudflare Tunnel** → Démarre automatiquement
- ✅ **Docker** → Démarre automatiquement
- ✅ **Conteneurs Docker** → Démarrent automatiquement avec Docker

### Au login utilisateur (Tâche planifiée)
- ✅ **Conteneurs Docker** → Vérification et démarrage si nécessaire
- ✅ **Backend Consoles** → Port 5001
- ✅ **Frontend Consoles** → Port 5000

## 🎉 Résultat Final

Après installation du démarrage automatique :

- ✅ **Pas besoin d'ouvrir PowerShell** pour démarrer les services
- ✅ **Tout démarre automatiquement** au boot/login
- ✅ **Tous les domaines fonctionnent** :
  - iahome.fr ✅
  - www.iahome.fr ✅
  - qrcodes.iahome.fr ✅
  - librespeed.iahome.fr ✅
  - whisper.iahome.fr ✅
  - psitransfer.iahome.fr ✅
  - metube.iahome.fr ✅
  - pdf.iahome.fr ✅
  - stablediffusion.iahome.fr ✅
  - comfyui.iahome.fr ✅
  - ruinedfooocus.iahome.fr ✅
  - cogstudio.iahome.fr ✅
  - meeting-reports.iahome.fr ✅
  - hunyuan3d.iahome.fr ✅
  - consoles.regispailler.fr ✅

## 📝 Commandes Utiles

### Démarrer tous les services maintenant
```powershell
.\start-all-services.ps1
```

### Vérifier le statut
```powershell
.\start-all-services.ps1 -Status
```

### Arrêter tous les services
```powershell
.\start-all-services.ps1 -Stop
```

### Vérifier la tâche planifiée
```powershell
Get-ScheduledTask -TaskName "IAHome-StartAllServices"
```

## 🔍 Vérification

Après avoir installé le démarrage automatique, testez :

1. **Redémarrez** votre ordinateur
2. **Connectez-vous** à Windows
3. **Attendez 1-2 minutes** pour que tout démarre
4. **Vérifiez** : `.\start-all-services.ps1 -Status`
5. **Testez** : https://iahome.fr et https://consoles.regispailler.fr

Tout devrait fonctionner **sans avoir ouvert PowerShell** !

## ✅ Checklist

- [x] Cloudflare Tunnel installé comme service Windows ✅
- [x] Docker installé et configuré ✅
- [x] Script `start-all-services.ps1` créé ✅
- [ ] Démarrage automatique installé (`-InstallAutoStart`) ⚙️ **À FAIRE**
- [ ] Testé après redémarrage ✅

## 🎯 Action Requise

**Pour finaliser** : Exécutez `.\start-all-services.ps1 -InstallAutoStart` en tant qu'administrateur, et **tout démarrera automatiquement sans ouvrir PowerShell** !






