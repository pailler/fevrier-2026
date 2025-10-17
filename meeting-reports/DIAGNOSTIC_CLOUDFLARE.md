# 🔧 Diagnostic Cloudflare - Meeting Reports Generator

## 📊 **État Actuel**

### **Services Locaux**
- ✅ **Frontend** : http://localhost:3050 - Fonctionne
- ❌ **Backend** : http://localhost:8001 - Problème de démarrage
- ✅ **Cloudflare** : Tunnel actif

### **Accès Domaine**
- ❌ **https://meeting-reports.iahome.fr** - Erreur 502

## 🔍 **Problèmes Identifiés**

### **1. Backend Non Accessible**
- **Symptôme** : Connexion refusée sur port 8001
- **Cause** : Problème de démarrage du serveur Python
- **Impact** : API non disponible

### **2. Erreur 502 Bad Gateway**
- **Symptôme** : Cloudflare ne peut pas atteindre le service
- **Cause** : Backend non accessible
- **Impact** : Domaine de production non fonctionnel

### **3. Configuration Host Header**
- **Symptôme** : "Invalid Host header" (résolu)
- **Solution** : `DANGEROUSLY_DISABLE_HOST_CHECK=true`

## 🛠️ **Plan de Réparation**

### **Étape 1 : Réparer le Backend**
```bash
cd C:\Users\AAA\Documents\iahome\meeting-reports\backend
python -m uvicorn main-simple:app --host 0.0.0.0 --port 8001 --reload
```

### **Étape 2 : Vérifier la Configuration**
- ✅ **Cloudflare** : Port 3050 configuré
- ✅ **Frontend** : Configuration domaine OK
- ❌ **Backend** : À réparer

### **Étape 3 : Tester l'Accès**
1. **Backend local** : http://localhost:8001/health
2. **Frontend local** : http://localhost:3050
3. **Domaine** : https://meeting-reports.iahome.fr

## 📋 **Scripts de Démarrage**

### **Script de Réparation Complète**
```cmd
@echo off
echo 1. Arrêt des processus...
taskkill /f /im node.exe 2>nul
taskkill /f /im cloudflared.exe 2>nul
taskkill /f /im python.exe 2>nul

echo 2. Démarrage Backend...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend
start "Backend" cmd /k "python -m uvicorn main-simple:app --host 0.0.0.0 --port 8001 --reload"

echo 3. Attente 15s...
timeout /t 15 /nobreak >nul

echo 4. Démarrage Frontend...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend
start "Frontend" cmd /k "npm run start:domain"

echo 5. Attente 20s...
timeout /t 20 /nobreak >nul

echo 6. Démarrage Cloudflare...
cd /d C:\Users\AAA\Documents\iahome
start "Cloudflare" cmd /k "cloudflared tunnel --config cloudflare-complete-config.yml run"

echo 7. Attente 15s...
timeout /t 15 /nobreak >nul

echo Services démarrés !
pause
```

## 🌐 **URLs de Test**

### **Développement**
- **Frontend** : http://localhost:3050
- **Backend** : http://localhost:8001/health

### **Production**
- **Domaine** : https://meeting-reports.iahome.fr

## 🎯 **Objectif**

**Rétablir l'accès complet à https://meeting-reports.iahome.fr/ avec :**
- ✅ Frontend accessible
- ✅ Backend fonctionnel
- ✅ API opérationnelle
- ✅ Cloudflare tunnel actif

## 📊 **Configuration des Ports**

| Port | Service | URL | Statut |
|------|---------|-----|--------|
| 3000 | iahome.fr | http://localhost:3000 | ✅ |
| 3050 | meeting-reports.iahome.fr | http://localhost:3050 | ✅ |
| 8001 | API Backend | http://localhost:8001 | ❌ |

## 🚨 **Actions Immédiates**

1. **Réparer le backend** avec uvicorn direct
2. **Vérifier les logs** pour identifier l'erreur
3. **Tester l'accès** étape par étape
4. **Redémarrer Cloudflare** si nécessaire
