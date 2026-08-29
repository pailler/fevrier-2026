import {
  RUINEDFOOOCUS_APP_URL,
  RUINEDFOOOCUS_CARD_URL,
  RUINEDFOOOCUS_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('ruinedfooocus');

export const ruinedFooocusLandingSeo = {
  slug: 'ruinedfooocus',
  productName: 'RuinedFooocus',
  headline: 'Créez des images IA simples et précises',
  description:
    cardSeo?.product.description ??
    'RuinedFooocus combine le meilleur de Stable Diffusion et Midjourney dans une interface fluide : décrivez votre image, ajustez le style, obtenez un résultat professionnel en quelques secondes.',
  landingPath: RUINEDFOOOCUS_PUBLIC_ORIGIN,
  cardPath: RUINEDFOOOCUS_CARD_URL.replace('https://iahome.fr', ''),
  appPath: RUINEDFOOOCUS_APP_URL.startsWith('http')
    ? RUINEDFOOOCUS_APP_URL.replace('https://iahome.fr', '')
    : RUINEDFOOOCUS_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'WebApplication',
  features: cardSeo?.product.features ?? [
    'Génération text-to-image',
    'Interface simple et intuitive',
    'Qualité professionnelle',
    'Résolution jusqu’à 1024×1024',
    '100 crédits par accès',
  ],
  faqs: (cardSeo?.faqs ?? []).map((faq) => ({
    ...faq,
    answer: faq.answer.replaceAll('ruinedfooocus.iahome.fr', 'iahome.fr/ruinedfooocus'),
  })),
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à RuinedFooocus.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits (100 crédits par accès).',
    },
    {
      name: 'Générer une image',
      text: 'Décrivez votre image, ajustez les paramètres et lancez la génération sur l’infrastructure IAHome.',
    },
  ],
};
