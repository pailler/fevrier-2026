# 📷 Fonctionnalité de Scan de Code-barres

## 🎯 Utilisation

### 1. Scanner pour créer une réservation

1. Cliquez sur une console disponible
2. Dans le formulaire, cliquez sur le bouton **"📷 Scanner"** à côté du champ "Votre nom"
3. Autorisez l'accès à la caméra si demandé
4. Positionnez le code-barres devant la caméra
5. Le code-barres est automatiquement détecté et rempli dans le champ nom
6. Complétez les dates et validez la réservation

### 2. Scanner pour valider une réservation

1. Cliquez sur une console réservée (non validée)
2. Cliquez sur **"📷 Scanner pour valider"**
3. Scannez le code-barres de la carte de l'utilisateur
4. Si le code-barres correspond au nom de la réservation, elle est validée automatiquement
5. Sinon, un message d'erreur s'affiche et vous pouvez réessayer

## 🔧 Fonctionnement technique

### API utilisée

1. **BarcodeDetector natif** (si disponible)
   - Supporté sur Chrome/Edge récents
   - Plus rapide et précis

2. **ZXing-js** (fallback)
   - Chargé automatiquement si BarcodeDetector n'est pas disponible
   - Compatible avec tous les navigateurs modernes

### Formats supportés

- Code 128
- EAN-13
- EAN-8
- Code 39
- QR Code

## 📱 Compatibilité

### ✅ Supporté
- iPad avec Safari (iOS 11+)
- iPhone avec Safari
- Chrome/Edge (desktop et mobile)
- Firefox (desktop et mobile)

### ⚠️ Limitations
- Nécessite HTTPS ou localhost pour l'accès caméra
- Nécessite les permissions caméra
- Certains anciens navigateurs peuvent ne pas supporter

## 🔒 Sécurité

- L'accès à la caméra est demandé explicitement
- La caméra s'arrête automatiquement après le scan
- Aucune image n'est stockée ou envoyée au serveur
- Le traitement se fait entièrement côté client

## 🐛 Dépannage

### La caméra ne démarre pas

1. Vérifiez que vous êtes sur HTTPS ou localhost
2. Autorisez l'accès à la caméra dans les paramètres du navigateur
3. Vérifiez que la caméra n'est pas utilisée par une autre application

### Le code-barres n'est pas détecté

1. Assurez-vous que le code-barres est bien visible
2. Éclairez correctement le code-barres
3. Tenez la caméra à une distance appropriée (10-30 cm)
4. Essayez de scanner un code-barres de bonne qualité

### Erreur "BarcodeDetector non disponible"

- C'est normal sur certains navigateurs
- ZXing sera utilisé automatiquement en fallback
- Le scan fonctionnera quand même

## 💡 Astuces

1. **Meilleure détection** : Tenez la caméra stable et éclairez bien le code-barres
2. **Validation rapide** : Utilisez le scan pour valider rapidement les réservations
3. **Identification automatique** : Le code-barres devient automatiquement le nom d'utilisateur

## 🔄 Améliorations futures possibles

- Support de plus de formats de code-barres
- Historique des scans
- Génération de codes-barres pour les utilisateurs
- Scan en continu (mode automatique)
- Son de confirmation lors du scan

---

**Profitez du scan de code-barres ! 📷**

