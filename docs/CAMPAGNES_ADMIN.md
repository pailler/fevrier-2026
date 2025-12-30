# 📢 Guide d'Utilisation - Gestion des Campagnes Publicitaires

## 📋 Vue d'ensemble

Le système de gestion des campagnes publicitaires permet de :
- ✅ Consulter les templates recommandés pour Facebook Ads et Google Ads
- ✅ Créer et suivre vos campagnes actives
- ✅ Mettre à jour les métriques en temps réel
- ✅ Gérer le statut des campagnes (brouillon, active, en pause, terminée)

## 🚀 Installation

### 1. Créer la table dans Supabase

Exécutez le script SQL dans Supabase SQL Editor :

```sql
-- Fichier: scripts/create-campaigns-table.sql
```

Ou via l'interface Supabase :
1. Allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `scripts/create-campaigns-table.sql`
4. Exécutez la requête

### 2. Vérifier les APIs

Les routes API suivantes sont disponibles :
- `GET /api/admin/campaigns` - Récupérer toutes les campagnes
- `POST /api/admin/campaigns` - Créer une nouvelle campagne
- `GET /api/admin/campaigns/[id]` - Récupérer une campagne spécifique
- `PUT /api/admin/campaigns/[id]` - Mettre à jour une campagne
- `DELETE /api/admin/campaigns/[id]` - Supprimer une campagne

## 📊 Utilisation

### Accéder à la section Campagnes

1. Connectez-vous en tant qu'admin
2. Allez dans **Admin** → **Campagnes**
3. Vous verrez 4 onglets :
   - **📊 Vue d'ensemble** : Statistiques globales
   - **📘 Facebook Ads** : Templates Facebook
   - **🔍 Google Ads** : Templates Google
   - **📈 Campagnes Actives** : Suivi des campagnes

### Créer une campagne

1. Cliquez sur l'onglet **📈 Campagnes Actives**
2. Cliquez sur **+ Créer une campagne**
3. Remplissez le formulaire :
   - **Nom** : Nom de la campagne (ex: "MeTube - Focus Gratuit")
   - **Plateforme** : Facebook, Google, ou Autre
   - **Template ID** (optionnel) : ID du template utilisé (ex: "metube-gratuit")
   - **Budget quotidien** : Montant en euros par jour
   - **Budget total** (optionnel) : Budget total de la campagne
   - **Dates** : Date de début et de fin (optionnel)
   - **URL de destination** : Landing page (ex: https://iahome.fr/card/metube)
   - **Notes** : Notes additionnelles
4. Cliquez sur **Créer la campagne**

### Suivre une campagne

Dans l'onglet **📈 Campagnes Actives**, vous pouvez :

#### Voir les métriques
- **Budget/Jour** : Budget quotidien alloué
- **Dépensé** : Montant déjà dépensé
- **Impressions** : Nombre d'affichages
- **Clics** : Nombre de clics
- **CTR** : Taux de clic (Clics / Impressions × 100)
- **Conversions** : Nombre d'inscriptions
- **CVR** : Taux de conversion (Conversions / Clics × 100)
- **Achats** : Nombre d'achats
- **ROI** : Retour sur investissement

#### Mettre à jour les métriques

1. Cliquez sur **✏️ Mettre à jour les métriques**
2. Entrez les nouvelles valeurs :
   - Impressions
   - Clics
   - Conversions
   - Achats
   - Dépensé (en euros)
3. Les métriques calculées (CTR, CPC, CPL, CPA, ROI) seront automatiquement mises à jour

#### Gérer le statut

- **Brouillon** → **Activer** : Lance la campagne
- **Active** → **Mettre en pause** : Met la campagne en pause
- **En pause** → **Reprendre** : Relance la campagne
- **Terminer** : Marque la campagne comme terminée

## 📘 Templates Facebook Ads

### Templates disponibles

1. **MeTube - Focus Gratuit** (`metube-gratuit`)
   - Budget : 10€/jour
   - Format : Image
   - Objectif : Maximiser les inscriptions gratuites

2. **MeTube - Focus Simplicité** (`metube-simplicite`)
   - Budget : 10€/jour
   - Format : Image
   - Objectif : Cibler les utilisateurs non techniques

3. **MeTube - Focus Performance** (`metube-performance`)
   - Budget : 15€/jour
   - Format : Vidéo
   - Objectif : Maximiser les conversions

4. **MeTube - Focus Confidentialité** (`metube-privacy`)
   - Budget : 12€/jour
   - Format : Image
   - Objectif : Cibler les utilisateurs soucieux de la confidentialité

5. **MeTube - Focus Premium** (`metube-premium`)
   - Budget : 20€/jour
   - Format : Carousel
   - Objectif : Promouvoir les packages premium

### Utiliser un template

1. Allez dans l'onglet **📘 Facebook Ads**
2. Cliquez sur un template pour voir les détails
3. Notez l'ID du template (ex: `metube-gratuit`)
4. Créez une campagne et utilisez cet ID dans le champ "Template ID"

## 🔍 Templates Google Ads

### Templates disponibles

1. **MeTube - Recherche Gratuit** (`metube-search-gratuit`)
   - Budget : 15€/jour
   - Format : Recherche (texte)
   - Objectif : Cibler les recherches "télécharger youtube"

2. **MeTube - Display Confidentialité** (`metube-display-privacy`)
   - Budget : 12€/jour
   - Format : Display (image)
   - Objectif : Cibler les sites web liés à la confidentialité

3. **MeTube - YouTube Preroll** (`metube-youtube-preroll`)
   - Budget : 20€/jour
   - Format : Vidéo (TrueView)
   - Objectif : Annonces avant les vidéos YouTube

4. **MeTube - Shopping Ads** (`metube-shopping-ads`)
   - Budget : 10€/jour
   - Format : Shopping
   - Objectif : Promouvoir les packages de tokens

### Utiliser un template

1. Allez dans l'onglet **🔍 Google Ads**
2. Cliquez sur un template pour voir les détails
3. Notez l'ID du template (ex: `metube-search-gratuit`)
4. Créez une campagne et utilisez cet ID dans le champ "Template ID"

## 📈 Métriques et Calculs

### Métriques calculées automatiquement

Lors de la mise à jour des métriques, le système calcule :

- **CTR** = (Clics / Impressions) × 100
- **CPC** = Dépensé / Clics
- **CPL** = Dépensé / Conversions
- **CPA** = Dépensé / Achats
- **ROI** = ((Revenu - Dépensé) / Dépensé) × 100

**Note** : Le revenu est estimé à 15€ par achat par défaut. Vous pouvez ajuster cette valeur dans le code si nécessaire.

## 💡 Bonnes Pratiques

### 1. Créer plusieurs campagnes de test

Testez 2-3 templates simultanément pour identifier le plus performant.

### 2. Mettre à jour les métriques régulièrement

- **Quotidiennement** pendant la première semaine
- **Hebdomadairement** ensuite
- **Après chaque optimisation** importante

### 3. Surveiller les métriques clés

- **CTR < 2%** : Améliorer le créatif ou le texte
- **CPC > 0,50€** : Affiner l'audience
- **CVR < 5%** : Optimiser la landing page
- **ROI < 200%** : Réduire le budget ou améliorer la conversion

### 4. Utiliser les templates comme référence

Les templates fournissent des objectifs réalistes basés sur l'industrie. Utilisez-les comme référence pour évaluer vos performances.

## 🔧 Dépannage

### La table n'existe pas

1. Vérifiez que le script SQL a été exécuté dans Supabase
2. Vérifiez les permissions de votre utilisateur Supabase

### Les campagnes ne s'affichent pas

1. Vérifiez que vous êtes connecté en tant qu'admin
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que les routes API fonctionnent

### Les métriques ne se mettent pas à jour

1. Vérifiez que vous avez entré des valeurs numériques valides
2. Vérifiez la console du navigateur pour les erreurs
3. Rechargez la page après la mise à jour

## 📚 Ressources

- [Documentation Facebook Ads](https://www.facebook.com/business/help)
- [Documentation Google Ads](https://support.google.com/google-ads)
- [Templates Créatifs Facebook](docs/TEMPLATES_CREATIFS_FACEBOOK.md)
- [Stratégie Campagne Facebook MeTube](docs/CAMPAGNE_FACEBOOK_METUBE.md)

