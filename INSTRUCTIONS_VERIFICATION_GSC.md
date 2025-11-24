# Instructions détaillées - Trouver les méthodes de vérification dans Google Search Console

## 🎯 Situation actuelle

Vous êtes dans Google Search Console pour `https://iahome.fr` mais vous ne voyez pas l'option "Fichier HTML".

## 📍 Comment accéder aux méthodes de vérification

### Option 1 : Si la propriété est déjà ajoutée mais non vérifiée

1. **Dans le menu de gauche**, descendez tout en bas
2. Cliquez sur **"Paramètres"** (icône engrenage ⚙️)
3. Dans la page qui s'ouvre, cliquez sur **"Propriétés"** (ou "Properties")
4. Vous verrez votre propriété `https://iahome.fr`
5. À droite de la propriété, cliquez sur les **3 points verticaux** (⋮)
6. Sélectionnez **"Détails de la propriété"** (ou "Property details")
7. Vous verrez alors les méthodes de vérification disponibles

### Option 2 : Si vous voulez ajouter une nouvelle propriété

1. **En haut à gauche**, cliquez sur le **menu hamburger** (☰) si visible
2. Ou cliquez sur le **sélecteur de propriété** (en haut, où il y a "iahome.fr")
3. Cliquez sur **"Ajouter une propriété"** (ou "Add property")
4. Choisissez **"Préfixe d'URL"** (URL prefix)
5. Entrez : `https://iahome.fr`
6. Cliquez sur **"Continuer"**
7. Vous verrez alors TOUTES les méthodes de vérification, y compris "Fichier HTML"

## 🔍 Méthodes que vous devriez voir

### Si vous avez choisi "Préfixe d'URL" (https://iahome.fr) :

Vous devriez voir ces onglets :
- ✅ **Balise HTML** (ou "Tag HTML" ou "HTML tag")
- ✅ **Fichier HTML** (ou "HTML file")
- ✅ **Google Analytics** (si vous l'utilisez)
- ✅ **Google Tag Manager** (si vous l'utilisez)
- ✅ **Enregistrement DNS** (ou "DNS record")

### Si vous avez choisi "Domaine" (iahome.fr) :

Vous ne verrez QUE :
- ✅ **Enregistrement DNS** (ou "DNS record")

## 💡 Solution recommandée : Utiliser DNS

**La méthode DNS fonctionne TOUJOURS**, peu importe le type de propriété :

1. **Trouvez l'onglet "Enregistrement DNS"** (ou "DNS record")
2. Google vous donnera un texte comme : `google-site-verification=abc123xyz...`
3. **Copiez TOUT ce texte**
4. **Ajoutez-le dans votre DNS** (Cloudflare, OVH, etc.)
5. **Attendez 5-15 minutes** (ou jusqu'à 48h selon votre fournisseur)
6. **Retournez dans GSC** et cliquez sur "Vérifier"

## 🆘 Si vous ne voyez toujours rien

1. **Vérifiez que vous êtes bien connecté** avec le bon compte Google
2. **Essayez un autre navigateur** (Chrome, Firefox, Edge)
3. **Videz le cache** de votre navigateur
4. **Essayez en navigation privée**
5. **Contactez le support Google Search Console** si le problème persiste

## 📸 Capture d'écran - Où chercher

### Dans le menu de gauche :
```
[Menu]
├── Vue d'ensemble
├── Performances
├── Indexation
│   ├── Pages
│   └── Sitemaps
├── ...
└── Paramètres ⚙️  ← CLIQUEZ ICI
    └── Propriétés
        └── [Votre propriété] ⋮
            └── Détails de la propriété
```

### Ou en haut à gauche :
```
[Menu hamburger ☰] ou [Sélecteur de propriété]
└── Ajouter une propriété
    └── Préfixe d'URL
        └── https://iahome.fr
            └── [Méthodes de vérification apparaissent ici]
```

---

**Note :** Si votre site est déjà vérifié (ce qui semble être le cas d'après votre capture d'écran précédente), vous n'avez peut-être pas besoin de revérifier. Vous pouvez directement passer à la soumission du sitemap !




