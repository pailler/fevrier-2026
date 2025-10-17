# 🚀 Guide de Démarrage Manuel - Meeting Reports Generator

## ✅ **État Actuel**
- **Backend**: ✅ Fonctionnel sur http://localhost:8001
- **Frontend**: ⚠️ Nécessite un démarrage manuel
- **Cloudflare**: ✅ Actif et configuré
- **Domaine**: ⚠️ Erreur 502 (frontend non accessible sur IP locale)

## 🛠️ **Démarrage Manuel - Étapes Détaillées**

### **Étape 1: Démarrer le Backend**

Ouvrez un **Terminal 1** et exécutez :

```powershell
cd C:\Users\AAA\Documents\iahome\meeting-reports\backend
python main-simple-working.py
```

**Vérification** : Ouvrez http://localhost:8001/health dans votre navigateur
- ✅ Doit afficher : `{"status":"healthy","whisper_loaded":true,"llm_loaded":false}`

### **Étape 2: Démarrer le Frontend**

Ouvrez un **Terminal 2** et exécutez :

```powershell
cd C:\Users\AAA\Documents\iahome\meeting-reports\frontend
$env:PORT = "3001"
$env:HOST = "0.0.0.0"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
npm start
```

**Vérification** : Ouvrez http://localhost:3001 dans votre navigateur
- ✅ Doit afficher l'interface Meeting Reports

### **Étape 3: Vérifier l'Accès IP Locale**

Testez l'accès via l'IP locale :
- Ouvrez http://192.168.1.150:3001 dans votre navigateur
- ✅ Doit afficher la même interface

### **Étape 4: Tester le Domaine HTTPS**

Une fois les étapes 1-3 réussies :
- Ouvrez https://meeting-reports.iahome.fr dans votre navigateur
- ✅ Doit afficher l'interface Meeting Reports

## 🔧 **Script de Démarrage Automatique**

Utilisez le fichier `start-manual.bat` :

```batch
# Double-cliquez sur start-manual.bat
# Ou exécutez dans un terminal :
C:\Users\AAA\Documents\iahome\meeting-reports\start-manual.bat
```

## 🐛 **Résolution des Problèmes**

### **Problème : Backend ne démarre pas**
```powershell
# Vérifiez Python
python --version

# Installez les dépendances
pip install -r requirements.txt

# Utilisez la version simplifiée
python main-simple-working.py
```

### **Problème : Frontend ne démarre pas**
```powershell
# Vérifiez Node.js
node --version
npm --version

# Installez les dépendances
npm install

# Démarrez avec la configuration correcte
$env:HOST = "0.0.0.0"
$env:PORT = "3001"
npm start
```

### **Problème : Erreur 502 sur le domaine**
- Vérifiez que le frontend est accessible sur http://192.168.1.150:3001
- Vérifiez que Cloudflare est actif
- Redémarrez les services

## 📋 **Checklist de Vérification**

- [ ] Backend accessible sur http://localhost:8001/health
- [ ] Frontend accessible sur http://localhost:3001
- [ ] Frontend accessible sur http://192.168.1.150:3001
- [ ] Domaine accessible sur https://meeting-reports.iahome.fr
- [ ] API accessible sur https://meeting-reports.iahome.fr/api

## 🌐 **URLs d'Accès**

| Service | URL Locale | URL Domaine |
|---------|------------|-------------|
| Frontend | http://localhost:3001 | https://meeting-reports.iahome.fr |
| Backend API | http://localhost:8001 | https://meeting-reports.iahome.fr/api |
| Documentation | http://localhost:8001/docs | https://meeting-reports.iahome.fr/api/docs |

## ⚡ **Démarrage Rapide**

1. **Ouvrez 2 terminaux**
2. **Terminal 1** : `cd backend && python main-simple-working.py`
3. **Terminal 2** : `cd frontend && $env:HOST="0.0.0.0"; $env:PORT="3001"; npm start`
4. **Attendez 30 secondes**
5. **Testez** : https://meeting-reports.iahome.fr

## 🎯 **État Actuel du Projet**

- ✅ **Configuration** : Complète
- ✅ **Backend** : Fonctionnel
- ⚠️ **Frontend** : Nécessite démarrage manuel
- ✅ **Cloudflare** : Actif
- ⚠️ **Domaine** : Erreur 502 (frontend non accessible sur IP)

---

**Note** : Le projet est configuré correctement. Le seul problème est que le frontend doit être démarré manuellement et doit être accessible sur l'IP locale `192.168.1.150:3001` pour que Cloudflare puisse le joindre.
