# 🔧 Guide de Dépannage - Meeting Reports Generator

## 🚨 **Problèmes Identifiés**

### **1. Services ne démarrent pas correctement**
- **Symptôme**: Les processus Python et Node.js ne se lancent pas
- **Cause possible**: Problème de permissions ou de configuration
- **Solution**: Démarrage manuel dans des terminaux séparés

### **2. Erreur 502 via le domaine HTTPS**
- **Symptôme**: `https://meeting-reports.iahome.fr` retourne une erreur 502
- **Cause**: Cloudflare pointe vers `192.168.1.150:3001` mais le frontend n'est pas accessible sur cette IP
- **Solution**: Configurer le frontend pour écouter sur toutes les interfaces

### **3. Frontend instable**
- **Symptôme**: Le frontend se ferme ou ne répond pas
- **Cause**: Problème de stabilité avec React Scripts
- **Solution**: Redémarrage périodique nécessaire

## 🛠️ **Solutions Recommandées**

### **Solution 1: Démarrage Manuel des Services**

#### **Terminal 1 - Backend**
```powershell
cd C:\Users\AAA\Documents\iahome\meeting-reports\backend
python main-simple.py
```

#### **Terminal 2 - Frontend**
```powershell
cd C:\Users\AAA\Documents\iahome\meeting-reports\frontend
$env:PORT = "3001"
$env:HOST = "0.0.0.0"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
npm start
```

### **Solution 2: Configuration IP Locale**

Le frontend doit être accessible sur l'IP locale `192.168.1.150:3001` pour que Cloudflare puisse le joindre.

#### **Vérifier l'IP locale**
```powershell
ipconfig | findstr "IPv4"
```

#### **Configurer le frontend pour toutes les interfaces**
```powershell
$env:HOST = "0.0.0.0"  # Écoute sur toutes les interfaces
$env:PORT = "3001"
```

### **Solution 3: Test de Connectivité**

#### **Test Backend Local**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/health"
```

#### **Test Frontend Local**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001"
```

#### **Test Frontend IP Locale**
```powershell
Invoke-WebRequest -Uri "http://192.168.1.150:3001"
```

#### **Test Domaine HTTPS**
```powershell
Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr"
```

## 🔍 **Diagnostic Avancé**

### **Vérifier les Ports Utilisés**
```powershell
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 8001 -or $_.LocalPort -eq 3001}
```

### **Vérifier les Processus**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "python" -or $_.ProcessName -eq "node"}
```

### **Vérifier les Logs Cloudflare**
Les logs montrent que Cloudflare est configuré pour pointer vers `192.168.1.150:3001`

## 📋 **Checklist de Démarrage**

- [ ] Backend démarré sur le port 8001
- [ ] Frontend démarré sur le port 3001 avec HOST=0.0.0.0
- [ ] Frontend accessible sur localhost:3001
- [ ] Frontend accessible sur 192.168.1.150:3001
- [ ] Cloudflare tunnel actif
- [ ] Domaine HTTPS accessible

## 🚀 **Script de Démarrage Automatique**

Créer un fichier `start.bat` pour Windows :

```batch
@echo off
echo Démarrage des services Meeting Reports...

start "Backend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple.py"

timeout /t 10

start "Frontend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && set PORT=3001 && set HOST=0.0.0.0 && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && npm start"

echo Services démarrés !
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3001
echo Domaine: https://meeting-reports.iahome.fr
pause
```

## 🎯 **État Actuel**

- ✅ **Configuration Traefik**: Déployée
- ✅ **Configuration Backend**: Port 8001
- ✅ **Configuration Frontend**: Port 3001
- ✅ **Configuration Cloudflare**: Pointant vers 192.168.1.150:3001
- ⚠️ **Services**: Nécessitent un démarrage manuel
- ❌ **Accès HTTPS**: Erreur 502 (services non accessibles)

## 🔄 **Prochaines Actions**

1. **Démarrer manuellement** les services dans des terminaux séparés
2. **Vérifier** que le frontend est accessible sur 192.168.1.150:3001
3. **Tester** l'accès via le domaine HTTPS
4. **Créer** un script de démarrage automatique
5. **Implémenter** un système de monitoring

---

**Note**: Le projet est configuré correctement, mais nécessite un démarrage manuel des services pour fonctionner.
