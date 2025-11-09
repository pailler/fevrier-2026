# Guide d'Utilisation - Stratégie Marketing IA Home

## 🚀 Pages Créées

### 1. Page Marketing (`/marketing`)
**URL** : `https://iahome.fr/marketing`

**Objectif** : Page de landing principale pour attirer et convertir les visiteurs

**Contenu** :
- Hero section avec CTA "Commencer Maintenant"
- Statistiques de la plateforme
- 6 avantages clés
- Showcase des 6 services populaires
- Cas d'usage par catégorie (Professionnels, Créateurs, Entreprises)
- Section de confiance

**Utilisation** :
- Lien dans le header : "Découvrir"
- Page d'entrée pour les campagnes publicitaires
- Partage sur les réseaux sociaux

### 2. Page Avantages (`/avantages`)
**URL** : `https://iahome.fr/avantages`

**Objectif** : Convaincre en comparant avec la concurrence

**Contenu** :
- 6 propositions de valeur détaillées
- Comparaison avec 3 types de concurrents
- Tableau comparatif des tarifs
- Section CTA finale

**Utilisation** :
- Lien depuis la page marketing
- Page de comparaison pour les prospects
- Arguments de vente pour l'équipe commerciale

### 3. Page Pricing Améliorée (`/pricing`)
**URL** : `https://iahome.fr/pricing`

**Améliorations** :
- Section "Pourquoi Choisir IA Home" en haut de page
- 3 arguments clés mis en avant
- Design amélioré pour la conversion

**Utilisation** :
- Bouton "Tarifs" visible dans le header
- Point d'entrée direct pour les utilisateurs intéressés

### 4. Composant Bannière Promotionnelle
**Fichier** : `src/components/PromotionalBanner.tsx`

**Utilisation** :
```tsx
import PromotionalBanner from '../components/PromotionalBanner';

<PromotionalBanner
  message="🎉 Nouveau : Découvrez nos outils IA professionnels !"
  ctaText="Voir les services"
  ctaLink="/services"
  variant="default"
  dismissible={true}
/>
```

**Variantes** :
- `default` : Bleu/Indigo
- `success` : Vert/Emeraude
- `warning` : Jaune/Orange
- `info` : Violet/Rose

## 📍 Navigation Mise à Jour

### Header Principal
- ✅ Lien "Découvrir" → `/marketing`
- ✅ Bouton "Tarifs" en évidence → `/pricing`
- ✅ Liens existants conservés

### Points d'Entrée
1. **Page d'accueil** (`/`) → Lien vers `/marketing`
2. **Header** → "Découvrir" et "Tarifs"
3. **Footer** → Liens vers toutes les pages

## 🎯 Funnel de Conversion

### Étape 1 : Découverte
- **Page** : `/marketing`
- **Action** : Clic sur "Commencer Maintenant" ou "Voir les Services"

### Étape 2 : Intérêt
- **Page** : `/avantages` ou `/services`
- **Action** : Comparaison et exploration

### Étape 3 : Considération
- **Page** : `/pricing`
- **Action** : Choix d'un pack de tokens

### Étape 4 : Action
- **Page** : `/signup` puis paiement
- **Action** : Création de compte et achat

## 💡 Messages Clés à Utiliser

### Pour les Réseaux Sociaux
- "Découvrez 12+ outils IA professionnels sur une seule plateforme 🇫🇷"
- "Économisez jusqu'à 80% avec nos packs de tokens dégressifs"
- "Plateforme IA française : Sécurité, Performance, Support"

### Pour les Emails
- "Pourquoi choisir IA Home ? Découvrez nos avantages"
- "Comparez nos tarifs : Jusqu'à 80% d'économie"
- "12+ outils IA en un seul endroit"

### Pour le Blog
- Articles sur les cas d'usage
- Tutoriels d'utilisation
- Comparaisons avec alternatives

## 📊 Métriques à Suivre

### Conversion
- Taux de clic sur `/marketing` → `/pricing`
- Taux de conversion `/pricing` → Achat
- Taux de rebond sur les pages marketing

### Engagement
- Temps passé sur `/marketing`
- Nombre de clics sur les services
- Taux de partage social

### Acquisition
- Trafic vers `/marketing`
- Sources de trafic
- Coût par acquisition

## 🔧 Personnalisation

### Modifier les Messages
1. Ouvrir `src/app/marketing/page.tsx`
2. Modifier les textes dans les sections
3. Ajuster les couleurs si nécessaire

### Ajouter des Services
1. Modifier `src/utils/subdomainsConfig.ts`
2. Les services apparaîtront automatiquement sur `/marketing`

### Changer les Tarifs
1. Modifier `src/app/api/stripe/create-checkout-session/route.ts`
2. Mettre à jour `src/app/pricing/page.tsx`

## 🎨 Design System

### Couleurs Principales
- **Bleu** (`blue-600`) : Confiance, professionnalisme
- **Jaune** (`yellow-400`) : Urgence, CTA
- **Vert** (`green-600`) : Succès, économies
- **Indigo** (`indigo-700`) : Premium, qualité

### Typographie
- **Titres** : Font-bold, text-4xl à text-6xl
- **Sous-titres** : Font-semibold, text-xl à text-2xl
- **Corps** : text-base à text-lg

## ✅ Checklist de Déploiement

- [x] Pages créées et testées
- [x] Navigation mise à jour
- [x] SEO optimisé
- [ ] Analytics configuré
- [ ] Tests sur différents navigateurs
- [ ] Tests responsive (mobile/tablette)
- [ ] Vérification des liens
- [ ] Optimisation des images
- [ ] Tests de performance

## 🚀 Prochaines Étapes

1. **Analytics** : Configurer Google Analytics ou équivalent
2. **A/B Testing** : Tester différents messages
3. **SEO** : Créer du contenu blog régulier
4. **Email Marketing** : Campagnes ciblées
5. **Social Media** : Partager les pages sur les réseaux
6. **Partenariats** : Collaborer avec des influenceurs/blogueurs

## 📞 Support

Pour toute question ou modification :
- Consulter `STRATEGIE_MARKETING_IAHOME.md` pour la stratégie complète
- Modifier les fichiers dans `src/app/marketing/` et `src/app/avantages/`
- Utiliser le composant `PromotionalBanner` pour les promotions

---

**Bon marketing ! 🎉**


