# 🚀 Fonctionnalités Avancées - Gestion des Campagnes

## 📋 Vue d'ensemble

Le système de gestion des campagnes a été enrichi avec de nombreuses fonctionnalités avancées pour améliorer le suivi, l'analyse et l'optimisation des campagnes publicitaires.

## ✨ Nouvelles Fonctionnalités

### 1. 📊 Graphiques de Performance

**Description** : Visualisation des métriques dans le temps avec des graphiques interactifs.

**Fonctionnalités** :
- Graphique d'évolution des métriques (Impressions, Clics, Conversions)
- Graphique d'évolution du ROI
- Affichage pour chaque campagne active
- Données basées sur l'historique des modifications

**Utilisation** :
1. Allez dans **Campagnes Actives**
2. Cliquez sur **📊 Graphiques**
3. Les graphiques s'affichent automatiquement pour les campagnes actives

**Technologie** : Chart.js avec React

---

### 2. 📥 Export CSV

**Description** : Export de toutes les campagnes et leurs métriques au format CSV.

**Fonctionnalités** :
- Export complet avec toutes les métriques
- Format compatible Excel/Google Sheets
- Encodage UTF-8 avec BOM pour Excel
- Nom de fichier avec date

**Utilisation** :
1. Allez dans **Campagnes Actives**
2. Cliquez sur **📥 Export CSV**
3. Le fichier se télécharge automatiquement

**Colonnes exportées** :
- Nom, Plateforme, Statut
- Budget/Jour, Dépensé, Budget Total
- Impressions, Clics, CTR, CPC
- Conversions, CPL, Achats, CPA, ROI, Revenu
- Dates, Tags, Catégorie

---

### 3. ⚖️ Comparaison de Campagnes

**Description** : Comparer plusieurs campagnes côte à côte pour identifier les meilleures performances.

**Fonctionnalités** :
- Sélection multiple de campagnes (2-4)
- Tableau comparatif avec toutes les métriques clés
- Vue détaillée côte à côte
- Mise en évidence des meilleures performances

**Utilisation** :
1. Allez dans **Campagnes Actives**
2. Cliquez sur **⚖️ Comparer**
3. Cochez les campagnes à comparer (2 minimum)
4. Consultez la comparaison détaillée

**Métriques comparées** :
- Budget/Jour, Dépensé
- CTR, CPC
- Conversions, CPL
- ROI

---

### 4. ⚠️ Alertes Visuelles

**Description** : Alertes automatiques pour identifier les problèmes et opportunités.

**Types d'alertes** :

#### 🔴 Erreur (Rouge)
- **Budget dépassé** : Budget total complètement épuisé
- **ROI négatif** : La campagne génère des pertes

#### ⚡ Avertissement (Jaune)
- **Budget presque épuisé** : 90% du budget total utilisé
- **CTR faible** : < 1% avec plus de 100 clics
- **CPC élevé** : > 0,50€ avec plus de 50 clics
- **Objectif non atteint** : Conversions < 50% de l'objectif

#### ℹ️ Information (Bleu)
- À venir (extensible)

**Utilisation** :
- Les alertes s'affichent automatiquement en haut de chaque carte de campagne
- Cliquez sur l'alerte pour plus de détails

---

### 5. 🏷️ Tags et Catégories

**Description** : Organiser et filtrer les campagnes avec des tags et catégories.

**Fonctionnalités** :
- Ajout de tags multiples (séparés par des virgules)
- Attribution d'une catégorie
- Filtrage par tag ou catégorie
- Affichage visuel des tags/catégories sur les cartes

**Utilisation** :

#### Ajouter des tags/catégories lors de la création :
1. Créez une nouvelle campagne
2. Remplissez les champs "Tags" et "Catégorie"
3. Les tags seront automatiquement séparés et stockés

#### Modifier les tags/catégories d'une campagne existante :
1. Allez dans **Campagnes Actives**
2. Cliquez sur **🏷️ Gérer tags/catégorie** sur une campagne
3. Entrez les nouveaux tags et/ou catégorie

#### Filtrer par tag/catégorie :
1. Utilisez les menus déroulants en haut de la liste
2. Sélectionnez un tag ou une catégorie
3. Seules les campagnes correspondantes s'affichent

**Exemples de tags** :
- `metube`, `gratuit`, `test`, `production`
- `facebook`, `google`, `retargeting`
- `q1-2024`, `acquisition`, `retention`

**Exemples de catégories** :
- `Acquisition`
- `Retention`
- `Test`
- `Production`

---

### 6. 📊 Historique des Modifications

**Description** : Suivi automatique de l'évolution des métriques dans le temps.

**Fonctionnalités** :
- Enregistrement automatique à chaque modification
- Historique des 10 dernières modifications
- Tableau avec toutes les métriques à chaque point
- Date et heure de chaque modification

**Utilisation** :
1. Allez dans **Campagnes Actives**
2. Cliquez sur **📊 Voir l'historique** sur une campagne
3. Consultez le tableau d'historique

**Données enregistrées** :
- Impressions, Clics, Conversions, Achats
- Dépensé, Revenu
- CTR, CPC, CPL, CPA, ROI
- Date et heure

**Note** : L'historique est enregistré automatiquement via un trigger SQL dans Supabase.

---

## 🗄️ Base de Données

### Tables créées

#### `advertising_campaigns`
Table principale des campagnes avec les nouveaux champs :
- `tags` : Tableau de tags (TEXT[])
- `category` : Catégorie (VARCHAR)
- `target_impressions`, `target_clicks`, `target_conversions`, `target_purchases`, `target_roi` : Objectifs

#### `advertising_campaigns_history`
Table d'historique avec :
- Toutes les métriques à chaque point
- Date et heure
- Lien vers la campagne
- Utilisateur qui a fait la modification

### Scripts SQL

1. **`scripts/create-campaigns-table.sql`** : Table principale (mise à jour)
2. **`scripts/create-campaigns-history-table.sql`** : Table d'historique (nouveau)

**⚠️ Important** : Exécutez les deux scripts dans Supabase SQL Editor pour activer toutes les fonctionnalités.

---

## 🎨 Modes d'Affichage

### 📋 Liste (par défaut)
- Vue classique avec toutes les campagnes
- Alertes visuelles
- Tags et catégories affichés
- Actions rapides

### ⚖️ Comparaison
- Tableau comparatif
- Sélection multiple
- Vue détaillée côte à côte

### 📊 Graphiques
- Graphiques d'évolution
- Données basées sur l'historique
- Visualisation du ROI

---

## 🔧 Configuration

### Activer l'historique automatique

L'historique est activé automatiquement via un trigger SQL. Pour vérifier :

```sql
SELECT * FROM advertising_campaigns_history 
WHERE campaign_id = 'VOTRE_CAMPAIGN_ID' 
ORDER BY created_at DESC;
```

### Personnaliser les alertes

Les seuils d'alertes peuvent être modifiés dans la fonction `getAlerts()` dans `src/app/admin/campaigns/page.tsx` :

```typescript
// CTR faible
if (campaign.ctr < 1 && campaign.clicks > 100) {
  // Seuil modifiable
}

// CPC élevé
if (campaign.cpc > 0.5 && campaign.clicks > 50) {
  // Seuil modifiable
}
```

---

## 📈 Bonnes Pratiques

### 1. Utiliser les tags de manière cohérente
- Créez une convention de nommage (ex: `metube`, `facebook`, `test`)
- Utilisez des tags descriptifs
- Évitez les doublons (ex: `test` et `Test`)

### 2. Mettre à jour les métriques régulièrement
- Quotidiennement pendant la première semaine
- Hebdomadairement ensuite
- L'historique permet de voir l'évolution

### 3. Surveiller les alertes
- Vérifiez les alertes quotidiennement
- Agissez rapidement sur les alertes d'erreur
- Optimisez en fonction des avertissements

### 4. Comparer les campagnes
- Comparez les campagnes similaires
- Identifiez les meilleures pratiques
- Répliquez les stratégies performantes

### 5. Utiliser les graphiques pour l'analyse
- Identifiez les tendances
- Détectez les problèmes tôt
- Optimisez en fonction des données

---

## 🐛 Dépannage

### Les graphiques ne s'affichent pas
- Vérifiez que la campagne est active
- Vérifiez que l'historique existe (au moins une modification)
- Rechargez la page

### L'export CSV ne fonctionne pas
- Vérifiez que votre navigateur autorise les téléchargements
- Vérifiez la console pour les erreurs
- Essayez avec un autre navigateur

### L'historique ne s'enregistre pas
- Vérifiez que le trigger SQL est installé
- Vérifiez les permissions Supabase
- Vérifiez la console pour les erreurs

### Les filtres ne fonctionnent pas
- Vérifiez que les tags/catégories sont bien enregistrés
- Rechargez la page
- Vérifiez la console pour les erreurs

---

## 🔮 Fonctionnalités Futures

- [ ] Import automatique depuis Facebook Ads API
- [ ] Import automatique depuis Google Ads API
- [ ] Rapports automatiques par email
- [ ] Prévisions basées sur les données historiques
- [ ] A/B testing intégré
- [ ] Notifications en temps réel
- [ ] Dashboard personnalisable
- [ ] Export PDF des rapports

---

## 📚 Ressources

- [Documentation principale](CAMPAGNES_ADMIN.md)
- [Templates Facebook](TEMPLATES_CREATIFS_FACEBOOK.md)
- [Stratégie MeTube](CAMPAGNE_FACEBOOK_METUBE.md)

