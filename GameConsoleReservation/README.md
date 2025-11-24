# Application de Réservation de Consoles de Jeux - iPad 2015

Application iOS simple pour la réservation de consoles de jeux, compatible avec iPad 2015 (iOS 9.0+).

## 📋 Fonctionnalités

- ✅ Liste des consoles disponibles
- ✅ Affichage du statut de disponibilité (disponible/réservée)
- ✅ Création de réservations avec nom d'utilisateur et dates
- ✅ Annulation de réservations
- ✅ Stockage local des données (UserDefaults)
- ✅ Interface adaptée pour iPad

## 🛠️ Prérequis

- **Xcode 7.0 ou supérieur** (pour iOS 9.0)
- **macOS** (Xcode ne fonctionne que sur Mac)
- **iPad 2015** ou simulateur iPad dans Xcode

## 📦 Installation

### Option 1: Ouvrir le projet dans Xcode

1. Ouvrez Xcode
2. Sélectionnez `File > Open...`
3. Naviguez vers le dossier `GameConsoleReservation`
4. Ouvrez `GameConsoleReservation.xcodeproj`

### Option 2: Créer un nouveau projet (si le fichier .xcodeproj ne fonctionne pas)

1. Ouvrez Xcode
2. Créez un nouveau projet iOS > Single View Application
3. Nommez-le "GameConsoleReservation"
4. Sélectionnez Swift comme langage
5. Définissez le Deployment Target à **iOS 9.0**
6. Copiez tous les fichiers Swift du dossier `GameConsoleReservation/GameConsoleReservation/` dans votre nouveau projet

## 🚀 Configuration pour iPad

1. Dans Xcode, sélectionnez le projet dans le navigateur
2. Sélectionnez la cible "GameConsoleReservation"
3. Dans l'onglet "General", sous "Deployment Info":
   - **Devices**: iPad uniquement
   - **Deployment Target**: iOS 9.0
4. Dans l'onglet "Signing & Capabilities":
   - Configurez votre équipe de développement Apple (si vous avez un compte développeur)
   - Ou laissez "Automatically manage signing" activé

## 📱 Test sur iPad

### Via le Simulateur (recommandé pour commencer)

1. Dans Xcode, sélectionnez un simulateur iPad dans la barre d'outils
2. Choisissez "iPad Air" ou "iPad Pro" (compatible iOS 9.0+)
3. Cliquez sur le bouton "Run" (▶️) ou appuyez sur `Cmd + R`

### Via un iPad physique (2015)

1. Connectez votre iPad à votre Mac via USB
2. Déverrouillez l'iPad et acceptez la confiance de l'ordinateur si demandé
3. Dans Xcode, sélectionnez votre iPad dans la liste des appareils
4. Si c'est la première fois, vous devrez peut-être:
   - Aller dans **Settings > General > Device Management** sur l'iPad
   - Faire confiance à votre certificat de développeur
5. Cliquez sur "Run" dans Xcode

**Note**: Pour tester sur un appareil physique, vous devez avoir un compte développeur Apple (gratuit ou payant).

## 🎮 Utilisation de l'application

1. **Liste des consoles**: L'écran principal affiche toutes les consoles disponibles
   - Vert = Disponible
   - Rouge = Réservée

2. **Créer une réservation**:
   - Appuyez sur une console disponible
   - Cliquez sur "Réserver cette console"
   - Entrez votre nom
   - Entrez la date de début (format: YYYY-MM-DD HH:MM)
   - Entrez la date de fin (format: YYYY-MM-DD HH:MM)

3. **Annuler une réservation**:
   - Appuyez sur une console réservée
   - Cliquez sur "Annuler la réservation"
   - Confirmez l'annulation

## 📁 Structure du projet

```
GameConsoleReservation/
├── GameConsoleReservation/
│   ├── AppDelegate.swift                    # Point d'entrée de l'application
│   ├── ViewControllers/
│   │   ├── ConsoleListViewController.swift # Liste des consoles
│   │   └── ConsoleDetailViewController.swift # Détails et réservation
│   ├── Models/
│   │   ├── GameConsole.swift               # Modèle de données console
│   │   └── ReservationManager.swift        # Gestionnaire de réservations
│   ├── Assets.xcassets/                    # Ressources (icônes)
│   ├── Base.lproj/
│   │   └── LaunchScreen.storyboard         # Écran de lancement
│   └── Info.plist                          # Configuration de l'app
└── README.md
```

## 🔧 Personnalisation

### Ajouter des consoles par défaut

Modifiez la fonction `initializeDefaultConsolesIfNeeded()` dans `ReservationManager.swift`:

```swift
let defaultConsoles = [
    GameConsole(name: "Votre Console", type: "Type de console"),
    // Ajoutez d'autres consoles ici
]
```

### Modifier le format de date

Dans `ConsoleDetailViewController.swift`, modifiez le `DateFormatter`:

```swift
dateFormatter.dateFormat = "yyyy-MM-dd HH:mm" // Format actuel
```

## ⚠️ Notes importantes

- **iOS 9.0**: Cette application cible iOS 9.0 pour compatibilité avec iPad 2015
- **Swift 3.0**: Le code utilise Swift 3.0 (compatible avec Xcode 7/8)
- **Stockage local**: Les données sont stockées localement avec UserDefaults. Si vous supprimez l'application, les données seront perdues.
- **Pas de réseau**: Cette version simple fonctionne entièrement en local, sans connexion réseau.

## 🚧 Améliorations futures possibles

- Interface plus moderne avec SwiftUI (nécessiterait iOS 13+)
- Synchronisation cloud (iCloud, Firebase)
- Notifications de rappel
- Historique des réservations
- Statistiques d'utilisation
- Support multi-utilisateurs avec authentification

## 📝 Licence

Ce projet est fourni à titre éducatif et de démonstration.

## 🆘 Dépannage

### L'application ne compile pas
- Vérifiez que vous utilisez Xcode 7.0 ou supérieur
- Assurez-vous que le Deployment Target est défini à iOS 9.0
- Vérifiez que tous les fichiers Swift sont ajoutés au target

### L'application ne s'installe pas sur l'iPad
- Vérifiez que votre iPad est déverrouillé
- Acceptez la confiance de l'ordinateur sur l'iPad
- Configurez un compte développeur dans Xcode (Settings > Accounts)

### Les données ne se sauvegardent pas
- Vérifiez les permissions de l'application
- Les données sont stockées dans UserDefaults, elles persistent entre les sessions

---

**Bon développement! 🎮**

