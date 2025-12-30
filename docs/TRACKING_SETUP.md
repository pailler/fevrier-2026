# Configuration du Tracking Publicitaire

Ce document explique comment configurer le tracking Google Analytics et Facebook Pixel pour les campagnes publicitaires.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` ou `.env.production` :

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456
```

## Configuration Google Analytics

1. Créez un compte Google Analytics 4 (GA4) sur [analytics.google.com](https://analytics.google.com)
2. Créez une propriété pour votre site
3. Récupérez votre **Measurement ID** (format : `G-XXXXXXXXXX`)
4. Ajoutez-le dans `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Configuration Facebook Pixel

1. Créez un compte Facebook Business sur [business.facebook.com](https://business.facebook.com)
2. Allez dans **Gestionnaire d'événements** > **Pixels**
3. Créez un nouveau Pixel ou utilisez un existant
4. Récupérez votre **Pixel ID** (format numérique, 16 chiffres)
5. Ajoutez-le dans `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`

**Guide détaillé** : Voir `docs/GUIDE_FACEBOOK_PIXEL.md` pour les instructions pas à pas

## Événements trackés automatiquement

### Page MeTube (`/card/metube`)

- **Page View** : Visite de la page MeTube
- **CTA Click** : Clic sur "Essayer gratuitement" ou "Voir les tarifs"
- **Module Activation** : Activation du module MeTube

### Inscription

- **Sign Up** : Inscription d'un nouvel utilisateur
- **Complete Registration** (Facebook) : Inscription complétée

### Achat de tokens

- **Purchase** : Achat d'un pack de tokens
- **Purchase** (Facebook) : Conversion avec valeur monétaire

## Utilisation dans le code

### Track un événement personnalisé

```typescript
import { trackGoogleEvent, trackFacebookEvent } from '@/utils/tracking';

// Track un clic sur un bouton
trackGoogleEvent('click', 'Button', 'Download Video');
trackFacebookEvent('Lead', { content_name: 'Download Video' });
```

### Track un CTA

```typescript
import { trackCTAClick } from '@/utils/tracking';

trackCTAClick('Essayer gratuitement', 'Hero Section');
```

### Track une activation de module

```typescript
import { trackModuleActivation } from '@/utils/tracking';

trackModuleActivation('metube', 'MeTube');
```

## Paramètres UTM

Les paramètres UTM sont automatiquement détectés et trackés. Exemples d'URLs avec UTM :

```
https://iahome.fr/card/metube?utm_source=google&utm_medium=cpc&utm_campaign=metube&utm_content=annonce1
https://iahome.fr/card/metube?utm_source=facebook&utm_medium=social&utm_campaign=metube&utm_content=video
```

## Vérification du tracking

### Google Analytics

1. Allez dans votre compte Google Analytics
2. **Rapports** > **Temps réel**
3. Visitez votre site et vérifiez que les événements apparaissent

### Facebook Pixel

1. Allez dans **Gestionnaire d'événements**
2. Cliquez sur votre Pixel
3. Activez le **Mode Test** pour voir les événements en temps réel
4. Visitez votre site et vérifiez que les événements apparaissent

## Campagnes publicitaires recommandées

### Google Ads

- **Mots-clés** : "télécharger vidéo youtube", "youtube downloader"
- **Annonces** : Utilisez les annonces fournies dans le guide marketing
- **Extensions** : Sitelinks vers `/card/metube`, `/pricing`, `/signup`

### Facebook Ads

- **Objectif** : Conversions (inscriptions)
- **Audience** : Intérêts YouTube, téléchargement vidéo
- **Créatifs** : Images/vidéos avec CTA "Essayer gratuitement"

## Métriques à suivre

- **Taux de clic (CTR)** : Objectif > 3%
- **Coût par clic (CPC)** : Objectif < 0,50€
- **Taux de conversion** : Objectif > 5%
- **Coût par acquisition (CAC)** : Objectif < 10€
- **Retour sur investissement (ROI)** : Objectif > 300%

## Support

Pour toute question sur le tracking, consultez :
- [Documentation Google Analytics](https://developers.google.com/analytics)
- [Documentation Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)

