# 🚀 Système de démarrage radical - Game Console Reservation

## 📋 Vue d'ensemble

Script PowerShell complet qui gère automatiquement :
- ✅ Arrêt des processus existants
- ✅ Vérification des dépendances
- ✅ Démarrage des services
- ✅ Vérification de santé
- ✅ Gestion des erreurs

## 🎯 Utilisation

### Démarrage complet
```powershell
.\start-consoles-complete.ps1
```

### Vérifier le statut
```powershell
.\start-consoles-complete.ps1 -Status
```

### Arrêter tous les services
```powershell
.\start-consoles-complete.ps1 -Stop
```

### Redémarrer tout
```powershell
.\start-consoles-complete.ps1 -Restart
```

## ✨ Fonctionnalités

### 🔧 Gestion automatique
- Arrête automatiquement les processus sur les ports 5000 et 5001
- Vérifie que les ports sont libres avant de démarrer
- Installe les dépendances npm si nécessaire
- Vérifie que Python est disponible

### 🏥 Vérification de santé
- Teste automatiquement que le backend répond (`/api/health`)
- Teste automatiquement que le frontend répond
- Affiche le statut détaillé de chaque service

### 📊 Affichage du statut
- Affiche les URLs disponibles
- Montre les messages de santé du backend
- Indique les ports utilisés

## 🔄 Workflow automatique

1. **Arrêt des processus existants** sur les ports 5000 et 5001
2. **Vérification des dépendances** (npm install si nécessaire)
3. **Démarrage du backend** sur le port 5001
4. **Vérification** que le backend répond (10 tentatives)
5. **Démarrage du frontend** sur le port 5000
6. **Vérification** que le frontend répond (5 tentatives)
7. **Affichage du statut** final

## 🆘 En cas de problème

### Le backend ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Vérifiez les dépendances : `cd GameConsoleReservation-Web\backend && npm install`
- Vérifiez les logs dans la fenêtre PowerShell du backend

### Le frontend ne démarre pas
- Vérifiez que Python est installé : `python --version`
- Vérifiez que le port 5000 est libre : `netstat -an | findstr ":5000"`

### Ports occupés
Le script arrête automatiquement les processus, mais si ça ne fonctionne pas :
```powershell
# Trouver le processus sur le port 5000
netstat -ano | findstr ":5000"

# Arrêter le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

## 📝 Notes

- Les services démarrent dans des fenêtres PowerShell séparées
- Pour arrêter les services, fermez les fenêtres PowerShell ou utilisez `-Stop`
- Le script attend jusqu'à 10 secondes pour que le backend démarre
- Le script attend jusqu'à 5 secondes pour que le frontend démarre

## 🎯 Avantages

✅ **Robuste** : Gère automatiquement les conflits de ports
✅ **Intelligent** : Vérifie la santé des services
✅ **Informatif** : Affiche le statut détaillé
✅ **Simple** : Une seule commande pour tout démarrer
✅ **Fiable** : Vérifie les dépendances avant de démarrer








