# Application de Réservation de Consoles - Version Complète

Application web complète pour la réservation de consoles de jeux avec toutes les fonctionnalités.

## 🚀 Démarrage rapide

### 1. Démarrer le backend

```bash
cd GameConsoleReservation-Web/backend
npm install  # Si pas encore fait
npm start
```

Le backend démarre sur le **port 5001**.

### 2. Démarrer le serveur frontend

Dans un autre terminal :

```bash
cd GameConsoleReservation-Web
python -m http.server 5000
```

### 3. Ouvrir l'application

Ouvrez dans votre navigateur : **http://localhost:5000**

## ✨ Fonctionnalités complètes

### 🎮 Système de réservation
- ✅ **Durées d'emprunt** : 30 minutes ou 1 heure
- ✅ **Calcul automatique** : L'heure de fin est calculée automatiquement à partir de maintenant
- ✅ **Limite de 1 heure** : Impossible de réserver plus d'1 heure
- ✅ **Affichage de l'heure de fin** : Format HH:MM (ex: 15:30)

### 📷 Scanner de code-barres
- ✅ **Scanner pour réserver** : Scanne le code-barres pour remplir automatiquement le nom
- ✅ **Scanner pour valider** : Valide une réservation en scannant le code-barres du joueur
- ✅ **Support multi-formats** : Code 128, EAN-13, QR Code, etc.

### ✅ Système de validation
- ✅ **Validation obligatoire** : Les réservations doivent être validées à l'heure de début
- ✅ **Période de grâce** : 5 minutes après l'heure de début pour valider
- ✅ **Annulation automatique** : Les réservations non validées sont annulées automatiquement

### ⏱️ Compteur en temps réel
- ✅ **Temps restant** : Affiche le temps restant (ex: "25m 30s")
- ✅ **Dépassement** : Affiche le dépassement si l'heure est passée (ex: "+5m 10s")
- ✅ **Mise à jour** : Se met à jour toutes les secondes
- ✅ **Couleurs** :
  - 🟢 Vert : Temps restant
  - 🟠 Orange : Dépassement de 15-30 min
  - 🔴 Rouge : Dépassement de plus de 30 min

### 🎨 Système de couleurs selon dépassement
- ✅ **Normal** (rouge clair) : Réservation en cours, pas de dépassement
- ✅ **Orange** : Dépassement de plus de 15 minutes
- ✅ **Rouge** : Dépassement de plus de 30 minutes
- ✅ **Animation pulse** : Attire l'attention sur les dépassements

### 👤 Affichage du joueur actuel
- ✅ **Nom du joueur** : Affiché en évidence dans chaque carte réservée
- ✅ **Style distinctif** : Encadré en bleu pour le mettre en avant
- ✅ **Temps de jeu** : Affichage de l'heure de fin théorique

### 📋 Règles du bien jouer ensemble
- ✅ **Section dédiée** : En bas de l'écran
- ✅ **4 règles essentielles** :
  1. Utiliser son vrai nom (pas d'usurpation d'identité)
  2. Respecter le temps de jeu (ne pas abuser)
  3. Être gentil et respectueux
  4. Valider sa réservation
- ✅ **Design adapté aux enfants** : Icônes, couleurs, langage simple

## 📱 Utilisation

### Créer une réservation

1. Cliquez sur une console disponible (verte)
2. Entrez votre nom ou scannez votre code-barres
3. Choisissez la durée : **30 minutes** ou **1 heure**
4. L'heure de fin est calculée automatiquement
5. Cliquez sur "Réserver"

### Valider une réservation

1. Cliquez sur une console réservée (non validée)
2. Cliquez sur "✅ Valider la réservation" ou "📷 Scanner pour valider"
3. Si vous scannez, le code-barres doit correspondre au nom de la réservation

### Observer le compteur

- Le compteur se met à jour automatiquement toutes les secondes
- Vert = temps restant
- Orange = dépassement de 15-30 min
- Rouge = dépassement de plus de 30 min

## 🔧 Configuration

### Ports
- **Frontend** : 5000
- **Backend** : 5001

### Changer les ports

**Backend** : Modifiez `backend/server.js`
```javascript
const PORT = process.env.PORT || 5001;
```

**Frontend** : Modifiez `app-backend.js`
```javascript
const API_BASE_URL = 'http://localhost:VOTRE_PORT/api';
```

## 📁 Structure

```
GameConsoleReservation-Web/
├── index.html              # Version principale (avec backend)
├── app-backend.js          # Logique JavaScript avec backend
├── barcode-scanner.js      # Gestionnaire de scan code-barres
├── styles.css              # Styles CSS
├── backend/                # Serveur backend
│   ├── server.js          # API REST
│   ├── data.json          # Données (créé automatiquement)
│   └── package.json
└── README.md              # Ce fichier
```

## 🎯 Fonctionnalités détaillées

### Durées d'emprunt
- **30 minutes** : Pour les sessions courtes
- **1 heure** : Durée maximum autorisée
- Calcul automatique de l'heure de fin à partir de maintenant

### Validation
- Les réservations sont créées avec `isValidated: false`
- Doivent être validées à l'heure de début (5 min de grâce)
- Annulation automatique si non validée

### Compteur
- Mise à jour toutes les secondes
- Affiche heures, minutes et secondes
- Change de couleur selon le statut
- Animation pulse pour les dépassements

### Couleurs de dépassement
- **0-15 min** : Normal (rouge clair)
- **15-30 min** : Orange (avertissement)
- **30+ min** : Rouge (dépassement sévère)

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que Node.js est installé
- Vérifiez que le port 5001 n'est pas utilisé
- Vérifiez les permissions d'écriture pour `data.json`

### Le scanner ne fonctionne pas
- Vérifiez que vous êtes sur HTTPS ou localhost
- Autorisez l'accès à la caméra
- Vérifiez la console du navigateur (F12) pour les erreurs

### Les compteurs ne se mettent pas à jour
- Vérifiez la console du navigateur (F12)
- Vérifiez que le backend est accessible
- Rechargez la page (F5)

## 📝 Notes importantes

- **Backend requis** : L'application nécessite le backend sur le port 5001
- **Données centralisées** : Toutes les données sont dans `backend/data.json`
- **Validation obligatoire** : Les réservations non validées sont annulées
- **Limite de 1h** : Impossible de réserver plus d'1 heure
- **Dépassement visuel** : Les couleurs changent automatiquement selon le dépassement

## 🚀 Améliorations futures possibles

- Historique des réservations
- Statistiques d'utilisation
- Notifications de rappel
- Mode administrateur
- Export des données
- Synchronisation cloud

---

**Profitez de votre application de réservation complète ! 🎮**
