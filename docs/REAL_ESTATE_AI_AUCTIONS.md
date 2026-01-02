# Nouvelles Méthodes de Recherche Immobilière - IA et Ventes aux Enchères

## 🤖 Recherche par Intelligence Artificielle

### Fonctionnalités IA

#### 1. Analyse Intelligente des Critères
L'IA analyse vos critères de recherche et suggère :
- **Zones géographiques alternatives** : Propose des zones adjacentes ou similaires
- **Types de biens alternatifs** : Suggère des types de biens qui pourraient correspondre
- **Mots-clés supplémentaires** : Recommande des mots-clés à ajouter à votre recherche
- **Sites spécialisés** : Identifie des sites à explorer
- **Opportunités cachées** : Détecte des opportunités (ventes aux enchères, notaires, etc.)

#### 2. Analyse de Biens Individuels
Pour chaque bien, l'IA peut :
- **Score de correspondance** : Note de 0 à 100 selon vos critères
- **Points forts** : Mise en évidence des avantages du bien
- **Points d'attention** : Alertes sur les points à vérifier
- **Recommandations** : Conseils personnalisés

### Utilisation

#### Activer la recherche IA
Dans l'interface, cochez la case "🤖 Recherche par IA" dans les options de recherche.

#### Analyser un bien
1. Sélectionnez un bien dans la liste
2. Cliquez sur le bouton "Analyser" dans la section "Analyse IA"
3. L'IA analyse le bien et affiche :
   - Score de correspondance
   - Points forts
   - Points d'attention
   - Recommandations

### Configuration

La recherche IA nécessite une clé API OpenAI :
```env
OPENAI_API_KEY=votre_cle_api_openai
```

**Modèle utilisé** : `gpt-3.5-turbo` (optimisé pour les coûts)

## 🔨 Ventes aux Enchères Immobilières

### Sites Intégrés

#### 1. Interencheres
- **URL** : https://www.interencheres.com
- **Type** : Ventes aux enchères immobilières
- **Avantages** : Prix souvent inférieurs au marché
- **Note** : Nécessite une intégration API ou scraping

#### 2. Drouot
- **URL** : https://www.drouot.com
- **Type** : Ventes aux enchères (immobilier inclus)
- **Avantages** : Prestige et qualité
- **Note** : Nécessite une intégration API ou scraping

#### 3. Adjudic
- **URL** : https://www.adjudic.com
- **Type** : Ventes aux enchères judiciaires
- **Avantages** : Prix très compétitifs
- **Note** : Nécessite une intégration API ou scraping

### Utilisation

Cochez la case "🔨 Ventes aux enchères" dans les options de recherche.

### Avantages des Ventes aux Enchères

1. **Prix compétitifs** : Souvent 20-30% en dessous du marché
2. **Transparence** : Processus public et transparent
3. **Opportunités** : Biens uniques et rares
4. **Rapidité** : Vente rapide après adjudication

### Points d'attention

- ⚠️ **Visite limitée** : Souvent pas de visite avant la vente
- ⚠️ **État des lieux** : À faire après l'achat
- ⚠️ **Frais supplémentaires** : Frais de notaire, commission, etc.
- ⚠️ **Engagement** : Achat définitif après adjudication

## 📜 Notaires

### Recherche sur les Sites de Notaires

Les notaires proposent souvent des biens exclusifs :
- **notaires.fr** : Site officiel des notaires
- **notaires.com** : Portail des notaires

### Avantages

1. **Biens exclusifs** : Pas toujours sur les sites classiques
2. **Sécurité juridique** : Accompagnement par un notaire
3. **Fiabilité** : Informations vérifiées

## ⚖️ Saisies Immobilières

### Recherche sur les Sites de Saisies

Les saisies immobilières offrent des opportunités :
- **saisie-immobiliere.fr** : Site spécialisé
- **Autres sites** : Divers portails de saisies

### Avantages

1. **Prix très compétitifs** : Souvent 30-40% en dessous
2. **Opportunités** : Biens saisis par les banques
3. **Processus encadré** : Vente sous contrôle judiciaire

### Points d'attention

- ⚠️ **État du bien** : Peut nécessiter des travaux
- ⚠️ **Occupants** : Vérifier la vacance
- ⚠️ **Procédure** : Processus plus long

## 🔧 Intégration Technique

### Structure des Nouvelles Fonctions

Toutes les nouvelles fonctions suivent le même pattern :

```typescript
export async function searchXxx(criteria: SearchCriteria): Promise<SearchResult> {
  // Construction de l'URL de recherche
  // Appel API ou scraping
  // Retour des résultats
}
```

### Sources Disponibles

1. **Classiques** :
   - Leboncoin
   - SeLoger
   - PAP
   - Sites locaux Vendée

2. **Nouvelles** :
   - 🤖 Recherche IA
   - 🔨 Interencheres
   - 🔨 Drouot
   - 🔨 Adjudic
   - 📜 Notaires
   - ⚖️ Saisies immobilières
   - 📋 Mandats de vente

### API Endpoints

#### Recherche avec nouvelles sources
```typescript
POST /api/real-estate/search
{
  "searchCriteriaId": "...",
  "criteria": {...},
  "includeAI": true,
  "includeAuctions": true,
  "includeNotaires": true,
  "includeSaisies": true
}
```

#### Analyse IA d'un bien
```typescript
POST /api/real-estate/ai-analyze
{
  "propertyId": "..."
}
```

## 📊 Statistiques par Source

Le dashboard affiche maintenant les statistiques pour toutes les sources :
- Nombre de biens par source
- Taux de succès par source
- Évolution dans le temps

## 🚀 Prochaines Étapes

### Pour Activer Complètement

1. **Intégration API/Scraping** :
   - Implémenter le scraping pour chaque site
   - Ou utiliser des APIs officielles si disponibles
   - Ou utiliser des services tiers (ScraperAPI, Apify)

2. **Optimisation IA** :
   - Fine-tuning du modèle pour l'immobilier
   - Cache des analyses pour réduire les coûts
   - Batch processing pour plusieurs biens

3. **Notifications Intelligentes** :
   - Alertes IA pour les meilleures opportunités
   - Suggestions personnalisées
   - Analyse de tendances du marché

## 💡 Conseils d'Utilisation

### Recherche Optimale

1. **Activez toutes les sources** pour maximiser les résultats
2. **Utilisez l'IA** pour découvrir des opportunités cachées
3. **Vérifiez les ventes aux enchères** régulièrement
4. **Consultez les notaires** pour des biens exclusifs
5. **Surveillez les saisies** pour les meilleurs prix

### Analyse IA

- Analysez les biens qui vous intéressent vraiment
- Comparez les scores de plusieurs biens
- Suivez les recommandations de l'IA
- Vérifiez toujours les points d'attention

## 📝 Notes Importantes

- Les fonctions de recherche retournent actuellement des structures vides
- Une intégration API/scraping est nécessaire pour chaque site
- L'IA nécessite une clé API OpenAI configurée
- Les analyses IA sont sauvegardées dans les features de chaque bien
