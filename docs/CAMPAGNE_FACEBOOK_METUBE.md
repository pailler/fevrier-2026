# Guide Complet : Campagne Facebook Ads pour MeTube

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour créer une campagne Facebook Ads efficace pour promouvoir MeTube et générer vos premiers clients payants.

## 🎯 Objectifs de la campagne

- **Objectif principal** : Générer des inscriptions et des utilisations de MeTube
- **Objectif secondaire** : Convertir les utilisateurs en clients payants (achat de tokens)
- **Budget recommandé** : 10-20€/jour pour commencer (300-600€/mois)
- **Durée** : 1 mois minimum pour avoir des données significatives

---

## 📝 Étape 1 : Préparation avant la campagne

### 1.1 Vérifications préalables

- [ ] Compte Facebook Business créé
- [ ] Facebook Pixel installé et testé (ID dans `.env.local`)
- [ ] Page Facebook Business créée (optionnel mais recommandé)
- [ ] Budget alloué (minimum 300€ pour 1 mois)
- [ ] Landing page optimisée : https://iahome.fr/card/metube

### 1.2 Création de la Page Facebook Business (optionnel)

1. Allez sur https://www.facebook.com/pages/create
2. Choisissez "Entreprise ou marque"
3. Remplissez :
   - **Nom** : "IA Home" ou "MeTube - Téléchargeur YouTube"
   - **Catégorie** : "Service informatique" ou "Technologie"
4. Ajoutez une photo de profil et une bannière
5. Remplissez la description avec les mots-clés : "Téléchargeur YouTube", "MeTube", etc.

---

## 🚀 Étape 2 : Création de la campagne

### 2.1 Accéder au Gestionnaire de publicités

1. Allez sur https://business.facebook.com/adsmanager
2. Cliquez sur **"Créer"** (bouton vert en haut à droite)

### 2.2 Choisir l'objectif

**Objectif recommandé** : **Conversions**

Pourquoi ?
- Meilleur pour générer des actions concrètes (inscriptions, achats)
- Facebook optimise automatiquement pour les conversions
- Permet de suivre le ROI précisément

**Alternatives** :
- **Trafic** : Si vous voulez juste des visites (moins efficace pour les conversions)
- **Engagement** : Si vous voulez d'abord construire une audience

### 2.3 Nommer la campagne

**Nom suggéré** : `MeTube - Conversions - [Date]`

Exemple : `MeTube - Conversions - Jan 2025`

---

## 🎯 Étape 3 : Configuration de la campagne

### 3.1 Paramètres de la campagne

#### Budget de la campagne
- **Type** : Budget quotidien (recommandé pour commencer)
- **Montant** : 10-20€/jour
- **Durée** : 30 jours minimum

#### Optimisation des enchères
- **Objectif d'optimisation** : Conversions
- **Type d'enchère** : Coût par résultat (CPR) - Facebook optimise automatiquement

#### Attribution
- **Fenêtre d'attribution** : 7 jours après le clic, 1 jour après la visualisation
- Cela permet de suivre les conversions même si l'utilisateur revient plus tard

### 3.2 Paramètres A/B (optionnel mais recommandé)

Créez 2-3 variantes pour tester :
- **Variante 1** : Focus "Gratuit" (100 tokens offerts)
- **Variante 2** : Focus "Privé" (sans tracking, sans pub)
- **Variante 3** : Focus "Simple" (sans logiciel à installer)

---

## 👥 Étape 4 : Configuration de l'audience

### 4.1 Audience personnalisée (recommandée)

**Nom de l'audience** : `MeTube - Intéressés YouTube`

#### Critères démographiques
- **Localisation** : France, Belgique, Suisse
- **Âge** : 18-55 ans
- **Sexe** : Tous

#### Intérêts (sélectionnez 3-5)
- ✅ YouTube
- ✅ Téléchargement de vidéos
- ✅ Technologie
- ✅ Informatique
- ✅ Création de contenu

#### Comportements
- ✅ Utilisateurs de YouTube
- ✅ Acheteurs en ligne
- ✅ Utilisateurs de smartphones

#### Taille de l'audience
- **Objectif** : 500 000 - 2 000 000 personnes
- Si trop petit (< 200k) : Ajoutez des intérêts similaires
- Si trop grand (> 5M) : Affinez avec des critères supplémentaires

### 4.2 Audience similaire (Lookalike) - Phase 2

**À créer après avoir 100+ conversions** :
1. Allez dans **Gestionnaire d'audiences**
2. Créez une audience similaire basée sur :
   - Vos visiteurs de la page MeTube (via Pixel)
   - Vos clients qui ont acheté des tokens
3. **Pourcentage** : 1-3% (plus précis mais plus petit)

### 4.3 Exclusions

Excluez :
- ❌ Vos employés/partenaires (si vous avez leurs emails)
- ❌ Utilisateurs qui ont déjà visité `/card/metube` (retargeting séparé)

---

## 🎨 Étape 5 : Création des créatifs

### 5.1 Format recommandé : Carrousel ou Image unique

#### Option 1 : Image unique (plus simple)

**Spécifications** :
- **Format** : 1080 x 1080 px (carré) ou 1200 x 628 px (paysage)
- **Taille** : < 30 MB
- **Format** : JPG ou PNG

**Exemple de design** :
```
┌─────────────────────────┐
│   [Capture MeTube]      │
│                         │
│  Téléchargez YouTube    │
│     GRATUITEMENT        │
│                         │
│  100 tokens offerts     │
│   Sans logiciel         │
└─────────────────────────┘
```

**Texte de l'annonce** :
```
🎥 Téléchargez vos vidéos YouTube préférées

✅ Gratuit pour commencer (100 tokens offerts)
✅ Sans logiciel à installer
✅ Sans publicité
✅ 100% Privé

MeTube - La solution open-source pour télécharger YouTube

👉 Essayez gratuitement maintenant
```

#### Option 2 : Carrousel (plus engageant)

**Spécifications** :
- **Nombre d'images** : 3-5 cartes
- **Format** : 1080 x 1080 px chacune
- **Taille** : < 30 MB par image

**Structure du carrousel** :
1. **Carte 1** : Titre "Téléchargez YouTube gratuitement"
2. **Carte 2** : Avantage "Sans logiciel à installer"
3. **Carte 3** : Avantage "100% Privé et sécurisé"
4. **Carte 4** : CTA "100 tokens offerts"
5. **Carte 5** : Capture d'écran de l'interface MeTube

### 5.2 Vidéo (optionnel mais très efficace)

**Spécifications** :
- **Durée** : 15-60 secondes
- **Format** : MP4, MOV
- **Résolution** : 1080p minimum
- **Ratio** : 1:1 (carré) ou 16:9 (paysage)

**Script vidéo suggéré** :
```
[0-5s]   : "Vous voulez télécharger des vidéos YouTube ?"
[5-10s]  : "MeTube vous permet de le faire gratuitement"
[10-15s] : "Sans logiciel, sans publicité, 100% privé"
[15-20s] : "100 tokens offerts pour commencer"
[20-25s] : "Essayez maintenant sur iahome.fr"
```

### 5.3 Texte de l'annonce (copie)

#### Version 1 : Focus Gratuit
```
🎥 Téléchargez vos vidéos YouTube préférées GRATUITEMENT

MeTube vous permet de télécharger n'importe quelle vidéo YouTube en MP4, MP3, ou autres formats.

✨ Pourquoi choisir MeTube ?
✅ 100 tokens offerts à l'inscription
✅ Sans logiciel à installer
✅ Sans publicité
✅ 100% Privé et sécurisé
✅ Open-source

👉 Essayez maintenant : iahome.fr/card/metube
```

#### Version 2 : Focus Privé
```
🔒 Téléchargez YouTube en toute PRIVACITÉ

Contrairement aux autres services, MeTube :
✅ Ne collecte AUCUNE donnée
✅ N'affiche AUCUNE publicité
✅ Fonctionne sur VOS serveurs
✅ Open-source et transparent

100 tokens offerts pour tester gratuitement.

👉 Découvrez MeTube : iahome.fr/card/metube
```

#### Version 3 : Focus Simplicité
```
📹 Téléchargez YouTube en 1 CLIC

Pas besoin de logiciel compliqué. MeTube fonctionne directement dans votre navigateur.

✅ Collez l'URL YouTube
✅ Choisissez le format (MP4, MP3...)
✅ Téléchargez !

100 tokens offerts pour commencer.

👉 Essayez maintenant : iahome.fr/card/metube
```

### 5.4 Liens et CTA

**URL de destination** :
```
https://iahome.fr/card/metube?utm_source=facebook&utm_medium=social&utm_campaign=metube&utm_content=annonce1
```

**Bouton CTA** :
- **Option 1** : "En savoir plus" (si focus éducation)
- **Option 2** : "S'inscrire" (si focus conversion directe)
- **Option 3** : "Essayer maintenant" (recommandé)

---

## 📊 Étape 6 : Configuration du Pixel et des événements

### 6.1 Vérifier le Pixel

1. Allez dans **Gestionnaire d'événements**
2. Vérifiez que votre Pixel est actif
3. Activez le **Mode Test** pour vérifier

### 6.2 Événements à tracker

#### Événement principal : PageView
- **Déclencheur** : Visite de `/card/metube`
- **Valeur** : 0€ (pas de valeur monétaire)
- **Action** : Automatique via Pixel

#### Événement de conversion : Lead
- **Déclencheur** : Clic sur "Essayer gratuitement"
- **Valeur** : 0€ (inscription gratuite)
- **Action** : Configuré dans le code (déjà fait)

#### Événement de conversion : Purchase
- **Déclencheur** : Achat de tokens
- **Valeur** : Montant de l'achat en euros
- **Action** : Configuré dans le code (déjà fait)

### 6.3 Configuration dans Facebook Ads

Dans la section **Optimisation et livraison** :
- **Optimiser pour** : Conversions
- **Événement de conversion** : "Lead" (inscription) ou "Purchase" (achat)
- **Valeur** : Si "Purchase", utilisez la valeur de l'achat

---

## 💰 Étape 7 : Budget et enchères

### 7.1 Budget quotidien recommandé

**Phase 1 - Test (Semaine 1-2)** :
- **Budget** : 10€/jour = 70€/semaine
- **Objectif** : Tester les créatifs et audiences

**Phase 2 - Optimisation (Semaine 3-4)** :
- **Budget** : 15-20€/jour = 105-140€/semaine
- **Objectif** : Augmenter les budgets des variantes performantes

**Phase 3 - Scale (Mois 2+)** :
- **Budget** : 20-50€/jour selon les résultats
- **Objectif** : Maximiser les conversions

### 7.2 Stratégie d'enchères

**Recommandation** : **Coût par résultat (CPR)**

Facebook optimise automatiquement pour :
- Trouver les personnes les plus susceptibles de convertir
- Réduire le coût par conversion
- Maximiser le nombre de conversions

**Alternatives** :
- **CPC (Coût par clic)** : Si vous voulez contrôler le coût par clic
- **CPM (Coût par mille)** : Si vous voulez maximiser la portée

### 7.3 Plannification (optionnel)

**Heures recommandées** :
- **Lundi-Vendredi** : 9h-12h, 18h-22h (pics d'activité)
- **Week-end** : 10h-14h, 19h-23h

**Jours recommandés** :
- Tous les jours (Facebook optimise automatiquement)

---

## 📈 Étape 8 : Lancement et suivi

### 8.1 Avant de lancer

Checklist finale :
- [ ] Pixel installé et testé
- [ ] Créatifs créés (au moins 2 variantes)
- [ ] Audience configurée (500k-2M personnes)
- [ ] Budget défini (10-20€/jour)
- [ ] URL avec paramètres UTM
- [ ] Landing page optimisée
- [ ] Mode Test activé pour vérifier

### 8.2 Lancement

1. **Activez le Mode Test** (24-48h)
   - Vérifiez que les événements sont trackés
   - Testez le parcours complet (clic → inscription)

2. **Lancez la campagne en réel**
   - Désactivez le Mode Test
   - Activez la campagne
   - Surveillez les premières heures

### 8.3 Suivi quotidien (première semaine)

**Métriques à surveiller** :

| Métrique | Objectif | Action si < objectif |
|----------|----------|----------------------|
| **CTR (Taux de clic)** | > 2% | Améliorer le créatif ou le texte |
| **CPC (Coût par clic)** | < 0,50€ | Affiner l'audience |
| **Taux de conversion** | > 5% | Optimiser la landing page |
| **CPL (Coût par lead)** | < 5€ | Continuer, c'est bon |
| **CPA (Coût par achat)** | < 15€ | Excellent ROI |

**Actions quotidiennes** :
- Vérifiez les performances toutes les 24h
- Arrêtez les variantes qui ne performant pas (< 1% CTR)
- Augmentez le budget des variantes performantes (+20-30%)

### 8.4 Optimisation (après 1 semaine)

**Si CTR < 2%** :
- Testez de nouveaux créatifs
- Modifiez le texte de l'annonce
- Changez le CTA

**Si CPC > 0,50€** :
- Affinez l'audience (plus spécifique)
- Testez une audience similaire
- Réduisez la taille de l'audience

**Si Taux de conversion < 5%** :
- Vérifiez la landing page
- Testez différents CTAs
- Simplifiez le parcours d'inscription

---

## 🎯 Exemple de campagne complète

### Configuration type

```
Campagne : MeTube - Conversions - Jan 2025
├── Budget : 15€/jour
├── Durée : 30 jours
├── Objectif : Conversions (Lead)
│
├── Groupe d'annonces 1 : Audience large
│   ├── Audience : Intéressés YouTube (1,2M personnes)
│   ├── Budget : 10€/jour
│   ├── Créatif 1 : Image "Gratuit" (CTR: 2.3%)
│   ├── Créatif 2 : Image "Privé" (CTR: 1.8%)
│   └── Créatif 3 : Vidéo 30s (CTR: 3.1%) ← Gagnant
│
└── Groupe d'annonces 2 : Audience ciblée
    ├── Audience : Créateurs de contenu (400k personnes)
    ├── Budget : 5€/jour
    ├── Créatif 1 : Carrousel "Avantages"
    └── Créatif 2 : Image "Simple"
```

---

## 📊 Tableau de bord de suivi

### Métriques clés à suivre

| Métrique | Semaine 1 | Semaine 2 | Objectif |
|----------|-----------|-----------|----------|
| **Impressions** | 50 000 | 60 000 | - |
| **Clics** | 1 000 | 1 500 | > 2% CTR |
| **CTR** | 2,0% | 2,5% | > 2% |
| **CPC** | 0,45€ | 0,40€ | < 0,50€ |
| **Inscriptions** | 50 | 80 | > 5% conversion |
| **CPL** | 3,00€ | 2,50€ | < 5€ |
| **Achats** | 5 | 12 | > 10% des inscrits |
| **CPA** | 30€ | 12,50€ | < 15€ |
| **ROI** | 200% | 400% | > 300% |

---

## 💡 Conseils avancés

### 1. Test A/B systématique

Testez toujours 2-3 variantes :
- **Créatifs** : Image vs Vidéo vs Carrousel
- **Textes** : Focus gratuit vs Focus privé
- **Audiences** : Large vs Ciblée
- **CTAs** : "Essayer" vs "S'inscrire" vs "Découvrir"

### 2. Retargeting automatique

Après 1 semaine, créez une campagne de retargeting :
- **Audience** : Visiteurs de `/card/metube` qui n'ont pas créé de compte
- **Budget** : 5€/jour
- **Message** : "Vous avez visité MeTube ? Profitez de 100 tokens gratuits !"

### 3. Exclusion des convertis

Excluez de vos campagnes :
- Les utilisateurs qui ont déjà créé un compte
- Les utilisateurs qui ont déjà acheté des tokens

### 4. Optimisation continue

**Toutes les semaines** :
- Analysez les performances
- Arrêtez les variantes non performantes
- Augmentez le budget des gagnantes
- Testez de nouvelles variantes

---

## 🚨 Problèmes courants et solutions

### Problème 1 : CTR trop bas (< 1%)

**Solutions** :
- Changez le créatif (testez une vidéo)
- Simplifiez le texte (moins de mots)
- Changez le CTA
- Testez une audience différente

### Problème 2 : CPC trop élevé (> 1€)

**Solutions** :
- Affinez l'audience (plus spécifique)
- Réduisez la taille de l'audience
- Testez une audience similaire
- Changez la stratégie d'enchères

### Problème 3 : Conversions faibles (< 2%)

**Solutions** :
- Vérifiez que le Pixel fonctionne
- Optimisez la landing page
- Simplifiez le parcours d'inscription
- Testez différents CTAs sur la page

### Problème 4 : Budget épuisé trop vite

**Solutions** :
- Réduisez le budget quotidien
- Affinez l'audience (moins de personnes = moins cher)
- Changez la stratégie d'enchères (CPC au lieu de CPR)

---

## 📝 Checklist de lancement

### Avant de lancer
- [ ] Compte Facebook Business créé
- [ ] Facebook Pixel installé et testé
- [ ] Page Facebook Business créée (optionnel)
- [ ] Budget alloué (minimum 300€)
- [ ] Landing page optimisée
- [ ] Créatifs créés (au moins 2 variantes)
- [ ] Audience configurée
- [ ] URL avec paramètres UTM
- [ ] Mode Test activé pour vérifier

### Après le lancement
- [ ] Surveiller les performances quotidiennement
- [ ] Vérifier que le Pixel track les événements
- [ ] Analyser les métriques après 3 jours
- [ ] Optimiser selon les résultats
- [ ] Créer une campagne de retargeting après 1 semaine

---

## 🎯 Objectifs réalistes

### Semaine 1-2 (Test)
- **Budget** : 140€ (10€/jour)
- **Objectif** : 50-100 inscriptions
- **CPL** : 2-3€
- **Achats** : 5-10 (10% de conversion)

### Semaine 3-4 (Optimisation)
- **Budget** : 210€ (15€/jour)
- **Objectif** : 100-150 inscriptions
- **CPL** : 1,5-2€
- **Achats** : 15-25 (15% de conversion)

### Mois 2+ (Scale)
- **Budget** : 600-900€/mois (20-30€/jour)
- **Objectif** : 300-500 inscriptions/mois
- **CPL** : 1-2€
- **Achats** : 50-100/mois (20% de conversion)

---

## 📚 Ressources supplémentaires

- [Guide Facebook Ads](https://www.facebook.com/business/help)
- [Gestionnaire d'événements](https://business.facebook.com/events_manager2)
- [Créateur d'annonces](https://www.facebook.com/ads/creation)
- [Centre d'aide Facebook Business](https://www.facebook.com/business/help)

---

## ✅ Résumé

**Pour lancer votre première campagne** :

1. **Créez** une campagne "Conversions"
2. **Configurez** une audience de 500k-2M personnes intéressées par YouTube
3. **Créez** 2-3 créatifs différents (image + vidéo)
4. **Lancez** avec 10€/jour
5. **Surveillez** quotidiennement et optimisez

**Temps estimé** : 2-3 heures pour la configuration initiale

**Budget recommandé** : 300€ minimum pour 1 mois de test

**Résultats attendus** : 50-100 inscriptions la première semaine, 5-10 clients payants

Bon courage avec votre campagne ! 🚀

