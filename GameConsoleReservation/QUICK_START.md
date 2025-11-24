vé'w g  é"&éèté"s-gg(e# Guide de Démarrage Rapide

## 🚀 Installation en 5 minutes

### Étape 1: Ouvrir dans Xcode
1. Double-cliquez sur `GameConsoleReservation.xcodeproj`
2. Ou ouvrez Xcode > File > Open > Sélectionnez le dossier

### Étape 2: Configurer pour iPad
1. Dans Xcode, cliquez sur le projet (icône bleue en haut)
2. Sélectionnez la cible "GameConsoleReservation"
3. Onglet **General**:
   - **Devices**: iPad
   - **Deployment Target**: iOS 9.0

### Étape 3: Tester
1. Dans la barre d'outils, sélectionnez un simulateur iPad (ex: "iPad Air")
2. Cliquez sur ▶️ (Run) ou appuyez sur `Cmd + R`
3. L'application devrait s'ouvrir dans le simulateur

## 📱 Test sur iPad physique

1. Connectez votre iPad 2015 via USB
2. Déverrouillez l'iPad
3. Dans Xcode, sélectionnez votre iPad dans la liste des appareils
4. Cliquez sur ▶️
5. Sur l'iPad: **Settings > General > Device Management** > Faites confiance au développeur

## ✅ Vérification

L'application devrait afficher:
- Une liste de 5 consoles par défaut
- Des cellules vertes (disponibles) ou rouges (réservées)
- Un bouton de rafraîchissement en haut à droite

## 🎮 Première réservation

1. Appuyez sur une console disponible (verte)
2. Cliquez sur "Réserver cette console"
3. Entrez:
   - Nom: Votre nom
   - Date début: `2024-01-15 10:00`
   - Date fin: `2024-01-15 18:00`
4. Cliquez sur "Réserver"

La console devrait maintenant apparaître en rouge dans la liste!

## ⚠️ Problèmes courants

**Erreur de compilation**: Vérifiez que le Deployment Target est iOS 9.0

**L'app ne s'installe pas**: Configurez votre compte développeur dans Xcode Settings > Accounts

**Les données disparaissent**: Normal si vous supprimez l'app. Les données sont stockées localement.

---

Pour plus de détails, consultez le [README.md](README.md)

