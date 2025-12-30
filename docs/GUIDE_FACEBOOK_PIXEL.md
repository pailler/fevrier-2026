# Guide : Comment récupérer votre Facebook Pixel ID

## 📋 Étapes détaillées

### Étape 1 : Créer un compte Facebook Business

1. **Allez sur Facebook Business**
   - Ouvrez votre navigateur
   - Visitez : https://business.facebook.com
   - Connectez-vous avec votre compte Facebook personnel (ou créez-en un si nécessaire)

2. **Créer un compte Business (si vous n'en avez pas)**
   - Cliquez sur **"Créer un compte"** ou **"Créer"**
   - Remplissez le formulaire :
     - **Nom de votre entreprise** : "IA Home" (ou le nom de votre choix)
     - **Votre nom** : Votre nom complet
     - **Email professionnel** : Votre email
   - Cliquez sur **"Créer un compte"**
   - Vérifiez votre email si nécessaire

### Étape 2 : Accéder au Gestionnaire d'événements

1. **Ouvrir le Gestionnaire d'événements**
   - Une fois connecté, cliquez sur le menu **☰ (Menu)** en haut à gauche
   - Dans la section **"Mesure et rapports"**, cliquez sur **"Gestionnaire d'événements"**
   - Ou allez directement sur : https://business.facebook.com/events_manager2

2. **Créer un nouveau Pixel (si vous n'en avez pas)**
   - Cliquez sur **"Connecter des données"** ou **"+"** (en haut à droite)
   - Sélectionnez **"Web"**
   - Choisissez **"Pixel Facebook"**
   - Cliquez sur **"Connecter"**

### Étape 3 : Configurer le Pixel

1. **Nommer votre Pixel**
   - **Nom du pixel** : "IA Home Pixel" (ou le nom de votre choix)
   - Cliquez sur **"Continuer"**

2. **Entrer l'URL de votre site**
   - **URL de votre site web** : `https://iahome.fr`
   - Cliquez sur **"Continuer"**

3. **Choisir la méthode d'installation**
   - Vous verrez plusieurs options :
     - ☑ **Intégrer le code manuellement** (recommandé pour Next.js)
     - ☐ Utiliser un partenaire d'intégration
     - ☐ Utiliser un tag manager
   - **Ne faites rien pour l'instant**, nous allons récupérer juste l'ID

### Étape 4 : Récupérer votre Pixel ID

1. **Trouver le Pixel ID**
   - Après avoir créé le pixel, vous serez redirigé vers la page du pixel
   - En haut de la page, vous verrez votre **Pixel ID**
   - Il ressemble à : `1234567890123456` (16 chiffres)

2. **Copier le Pixel ID**
   - Cliquez sur l'ID pour le copier
   - Ou notez-le quelque part

### Étape 5 : Vérifier le Pixel ID

1. **Méthode 1 : Dans le Gestionnaire d'événements**
   - Allez dans **Gestionnaire d'événements**
   - Cliquez sur votre pixel (nom : "IA Home Pixel" ou celui que vous avez choisi)
   - L'ID est affiché en haut de la page, à côté du nom

2. **Méthode 2 : Dans les paramètres**
   - Cliquez sur votre pixel
   - Allez dans **"Paramètres"** (onglet en haut)
   - L'ID est affiché dans la section **"Informations de base"**

### Étape 6 : Ajouter le Pixel ID à votre projet

1. **Ouvrir votre fichier de configuration**
   - Dans votre projet, ouvrez le fichier `.env.local` (pour le développement)
   - Ou `.env.production` (pour la production)
   - Si le fichier n'existe pas, créez-le à la racine du projet

2. **Ajouter la variable**
   ```env
   NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456
   ```
   Remplacez `1234567890123456` par votre vrai Pixel ID

3. **Redémarrer votre serveur de développement**
   - Si vous utilisez `npm run dev`, arrêtez-le (Ctrl+C)
   - Relancez `npm run dev`
   - Les changements dans les fichiers `.env` nécessitent un redémarrage

### Étape 7 : Vérifier que ça fonctionne

1. **Activer le Mode Test**
   - Retournez dans le **Gestionnaire d'événements**
   - Cliquez sur votre pixel
   - En haut à droite, activez le **"Mode Test"**
   - Ajoutez votre email pour recevoir les notifications de test

2. **Visiter votre site**
   - Ouvrez votre site : `https://iahome.fr`
   - Visitez quelques pages (notamment `/card/metube`)
   - Cliquez sur des boutons, inscrivez-vous, etc.

3. **Vérifier les événements**
   - Retournez dans le **Gestionnaire d'événements**
   - Cliquez sur votre pixel
   - Allez dans l'onglet **"Tester les événements"**
   - Vous devriez voir vos actions apparaître en temps réel

## 🎯 Exemple concret

Si votre Pixel ID est `9876543210987654`, votre fichier `.env.local` devrait contenir :

```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=9876543210987654
```

## ⚠️ Notes importantes

1. **Format numérique uniquement** : Le Pixel ID est composé uniquement de chiffres (16 chiffres)
2. **Pas de préfixe** : Contrairement à Google Analytics, il n'y a pas de préfixe comme "FB-"
3. **Variables d'environnement** : Les variables `NEXT_PUBLIC_*` sont accessibles côté client
4. **Redémarrage nécessaire** : Après modification de `.env`, redémarrez toujours le serveur

## 🔍 Où trouver le Pixel ID dans l'interface

```
Facebook Business Manager
└── ☰ Menu
    └── Mesure et rapports
        └── Gestionnaire d'événements
            └── [Votre Pixel]
                └── En haut de la page : ID: 1234567890123456  ← ICI
```

Ou dans les paramètres :
```
Gestionnaire d'événements
└── [Votre Pixel]
    └── Paramètres (onglet)
        └── Informations de base
            └── ID du pixel : 1234567890123456  ← ICI
```

## 📸 Capture d'écran (description)

Le Pixel ID se trouve généralement :
- En haut de la page du pixel, à côté du nom
- Format : **ID** : `1234567890123456` (16 chiffres)
- Il y a souvent un bouton de copie à côté

## 🆘 Problèmes courants

### Je ne trouve pas le Gestionnaire d'événements
- ✅ Assurez-vous d'être connecté avec un compte Facebook Business
- ✅ Utilisez le lien direct : https://business.facebook.com/events_manager2
- ✅ Vérifiez que vous avez les permissions nécessaires

### Je ne vois pas d'option pour créer un Pixel
- ✅ Assurez-vous d'avoir un compte Business Manager actif
- ✅ Vérifiez que vous êtes administrateur du compte
- ✅ Essayez de créer le pixel depuis : https://business.facebook.com/events_manager2/list

### Le Pixel ID ne fonctionne pas
- ✅ Vérifiez que vous avez bien copié les 16 chiffres (pas d'espaces)
- ✅ Vérifiez que vous avez redémarré le serveur après modification de `.env`
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après l'ID
- ✅ Utilisez le Mode Test pour vérifier que les événements sont reçus

### Je ne vois pas d'événements dans le Mode Test
- ⏱️ Attendez quelques secondes (les événements peuvent prendre 10-30 secondes)
- ✅ Vérifiez que le Mode Test est bien activé
- ✅ Vérifiez que vous avez ajouté votre email dans le Mode Test
- ✅ Vérifiez que vous visitez bien le site avec le Pixel intégré
- ✅ Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a pas d'erreurs

## 📚 Ressources supplémentaires

- [Documentation officielle Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Guide de démarrage Facebook Pixel](https://www.facebook.com/business/help/952192354843755)
- [Gestionnaire d'événements Facebook](https://business.facebook.com/events_manager2)

## 🔗 Liens utiles

- **Gestionnaire d'événements** : https://business.facebook.com/events_manager2
- **Facebook Business Manager** : https://business.facebook.com
- **Aide Facebook Business** : https://www.facebook.com/business/help

