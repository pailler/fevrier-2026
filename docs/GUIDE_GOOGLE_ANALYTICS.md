# Guide : Comment récupérer votre Google Analytics Measurement ID

## 📋 Étapes détaillées

### Étape 1 : Créer un compte Google Analytics

1. **Allez sur Google Analytics**
   - Ouvrez votre navigateur
   - Visitez : https://analytics.google.com
   - Connectez-vous avec votre compte Google (ou créez-en un si nécessaire)

2. **Créer un compte**
   - Cliquez sur **"Commencer la mesure"** ou **"Créer un compte"**
   - Remplissez le formulaire :
     - **Nom du compte** : "IA Home" (ou le nom de votre choix)
     - **Nom de la propriété** : "iahome.fr" (ou le nom de votre site)
     - **Fuseau horaire** : Europe/Paris
     - **Devise** : Euro (EUR)
   - Cliquez sur **"Suivant"**

### Étape 2 : Configurer la propriété

1. **Informations sur votre entreprise**
   - Sélectionnez votre secteur d'activité : "Technologie" ou "Services informatiques"
   - Sélectionnez la taille de votre entreprise
   - Cliquez sur **"Suivant"**

2. **Objectifs de votre entreprise**
   - Cochez les objectifs qui vous concernent :
     - ☑ Mesurer l'engagement des utilisateurs
     - ☑ Comprendre comment les utilisateurs découvrent votre site
     - ☑ Mesurer les conversions (achats, inscriptions)
   - Cliquez sur **"Créer"**

3. **Accepter les conditions**
   - Lisez et acceptez les conditions d'utilisation de Google Analytics
   - Cliquez sur **"J'accepte"**

### Étape 3 : Récupérer votre Measurement ID

1. **Accéder aux paramètres de la propriété**
   - Une fois votre compte créé, vous serez redirigé vers l'interface Google Analytics
   - En bas à gauche, cliquez sur l'icône **⚙️ (Paramètres)** (ou "Admin")

2. **Trouver le Measurement ID**
   - Dans la colonne **"Propriété"**, cliquez sur **"Informations sur la propriété"**
   - Vous verrez votre **ID de mesure** (Measurement ID)
   - Il ressemble à : `G-XXXXXXXXXX` (commence par "G-" suivi de 10 caractères)

3. **Copier le Measurement ID**
   - Cliquez sur l'ID pour le copier
   - Ou notez-le quelque part

### Étape 4 : Ajouter le Measurement ID à votre projet

1. **Ouvrir votre fichier de configuration**
   - Dans votre projet, ouvrez le fichier `.env.local` (pour le développement)
   - Ou `.env.production` (pour la production)
   - Si le fichier n'existe pas, créez-le à la racine du projet

2. **Ajouter la variable**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Remplacez `G-XXXXXXXXXX` par votre vrai Measurement ID

3. **Redémarrer votre serveur de développement**
   - Si vous utilisez `npm run dev`, arrêtez-le (Ctrl+C)
   - Relancez `npm run dev`
   - Les changements dans les fichiers `.env` nécessitent un redémarrage

### Étape 5 : Vérifier que ça fonctionne

1. **Visiter votre site**
   - Ouvrez votre site en développement : `http://localhost:3000/card/metube`
   - Ouvrez les outils de développement (F12)
   - Allez dans l'onglet **"Réseau"** (Network)

2. **Vérifier les requêtes Google Analytics**
   - Filtrez par "google-analytics" ou "gtag"
   - Vous devriez voir des requêtes vers `www.google-analytics.com`
   - Si vous voyez ces requêtes, le tracking fonctionne !

3. **Vérifier dans Google Analytics**
   - Retournez sur https://analytics.google.com
   - Allez dans **"Rapports"** > **"Temps réel"**
   - Visitez votre site et vous devriez voir votre visite apparaître en temps réel

## 🎯 Exemple concret

Si votre Measurement ID est `G-ABC123XYZ9`, votre fichier `.env.local` devrait contenir :

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ9
```

## ⚠️ Notes importantes

1. **Le préfixe "G-" est inclus** : N'oubliez pas d'inclure le "G-" au début
2. **Variables d'environnement** : Les variables `NEXT_PUBLIC_*` sont accessibles côté client
3. **Sécurité** : Le Measurement ID n'est pas secret, il peut être visible dans le code source
4. **Redémarrage nécessaire** : Après modification de `.env`, redémarrez toujours le serveur

## 🔍 Où trouver le Measurement ID dans l'interface

```
Google Analytics
└── ⚙️ Paramètres (Admin)
    └── Propriété
        └── Informations sur la propriété
            └── ID de mesure : G-XXXXXXXXXX  ← ICI
```

## 📸 Capture d'écran (description)

L'ID de mesure se trouve généralement :
- En haut de la page "Informations sur la propriété"
- Format : **ID de mesure** : `G-XXXXXXXXXX`
- Il y a souvent un bouton de copie à côté

## 🆘 Problèmes courants

### Le Measurement ID ne fonctionne pas
- ✅ Vérifiez que vous avez bien le préfixe "G-"
- ✅ Vérifiez que vous avez redémarré le serveur après modification de `.env`
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après l'ID
- ✅ Vérifiez que le fichier `.env.local` est bien à la racine du projet

### Je ne vois pas de données dans Google Analytics
- ⏱️ Attendez 24-48h pour les données historiques
- 🔴 Utilisez "Temps réel" pour voir les visites immédiatement
- ✅ Vérifiez que le tracking fonctionne (onglet Réseau du navigateur)

### Je ne trouve pas l'option "Informations sur la propriété"
- Assurez-vous d'être dans la bonne propriété (colonne du milieu)
- Cliquez sur "Paramètres" (icône ⚙️) en bas à gauche
- Cherchez dans la colonne "Propriété" (pas "Compte")

## 📚 Ressources supplémentaires

- [Documentation officielle Google Analytics](https://support.google.com/analytics/answer/9304153)
- [Guide de démarrage Google Analytics 4](https://support.google.com/analytics/answer/9304153)

