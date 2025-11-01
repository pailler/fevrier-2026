# 📍 Comment Ajouter une Route dans Cloudflare Workers (Interface Française)

## 🎯 Où Trouver "Routes" (Itinéraires)

Dans l'interface française de Cloudflare, les **Routes** sont appelées **"Itinéraires"**.

### Localisation dans le Dashboard

1. **Sur la page de votre Worker** (celle que vous voyez actuellement)
2. **Regardez la barre latérale DROITE**
3. **Cherchez la section** : **"Domaines et itinéraires"** (Domains and Routes)

### Étapes Détaillées

#### Étape 1 : Trouver la Section

Dans la barre latérale droite, vous devriez voir :

```
┌─────────────────────────────────────┐
│ Domaines et itinéraires             │
│                                     │
│ workers.dev                         │
│ orange-art-165d...workers.dev       │
│                                     │
│ URL de l'aperçu: Désactivé          │
│                                     │
│ Domaines personnalisés               │
│ [vide ou liste de domaines]         │
│                                     │
│ ⚡ Itinéraires ⚠️ C'EST ICI !        │
│ [vide ou liste d'itinéraires]      │
│                                     │
│ + Ajouter un itinéraire             │
└─────────────────────────────────────┘
```

#### Étape 2 : Ajouter une Route

1. **Dans la section "Itinéraires"**, cliquez sur :
   - **"+ Ajouter un itinéraire"** (Add route)
   - OU **"Itinéraires"** pour développer la section puis **"+ Ajouter un itinéraire"**

2. **Un formulaire s'ouvre**, remplissez :
   - **Route** : `librespeed.iahome.fr/*`
   - **Zone** : `iahome.fr` (sélectionnez dans le menu déroulant)

3. **Cliquez sur "Ajouter"** (Add)

## 🔄 Alternative : Via l'Onglet "Triggers"

Si vous ne trouvez pas la section "Domaines et itinéraires", essayez :

1. **Regardez les onglets en haut** de la page du Worker
2. **Cherchez l'onglet "Triggers"** ou **"Déclencheurs"**
3. **Cliquez dessus**
4. **Dans la section "Routes"**, cliquez sur **"Add route"**

## 📋 Configuration de la Route

Lorsque vous cliquez sur "Ajouter un itinéraire", remplissez :

```
┌─────────────────────────────────────┐
│ Ajouter un itinéraire                │
│                                     │
│ Route: librespeed.iahome.fr/*      │
│ Zone: iahome.fr [▼]                │
│                                     │
│ [Ajouter]  [Annuler]               │
└─────────────────────────────────────┘
```

**Route** : `librespeed.iahome.fr/*`
- Le `/*` signifie "toutes les routes de ce sous-domaine"

**Zone** : `iahome.fr`
- Sélectionnez votre domaine dans le menu déroulant

## ✅ Vérification

Après avoir ajouté la route, vous devriez voir dans "Itinéraires" :

```
Itinéraires:
  ✅ librespeed.iahome.fr/*
    Zone: iahome.fr
```

## 🧪 Test

Une fois la route ajoutée, testez avec :

```powershell
.\test-cloudflare-worker.ps1
```

## ⚠️ Si Vous Ne Trouvez Toujours Pas

Si vous ne voyez pas la section "Itinéraires" :

1. **Vérifiez que vous êtes bien sur la page du Worker** :
   - L'URL devrait être : `https://dash.cloudflare.com/[account]/workers/services/[worker-name]`

2. **Essayez l'onglet "Triggers"** :
   - Regardez les onglets en haut : Vue d'ensemble, Mesures, Déploiements, **Liaisons**, **Triggers**, Paramètres
   - Cliquez sur **"Triggers"**

3. **Ou utilisez la recherche** :
   - Appuyez sur `Ctrl+F` (ou `Cmd+F` sur Mac)
   - Cherchez : "route" ou "itinéraire"

---

**Besoin d'aide ?** Dites-moi ce que vous voyez exactement dans la barre latérale droite, et je vous guiderai plus précisément.


