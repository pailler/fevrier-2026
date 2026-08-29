import {
  STABLEDIFFUSION_APP_URL,
  STABLEDIFFUSION_CARD_URL,
  STABLEDIFFUSION_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('stablediffusion');

export const stableDiffusionLandingSeo = {
  slug: 'stablediffusion',
  productName: 'Stable Diffusion',
  headline: 'Générez des images IA de haute qualité',
  description:
    cardSeo?.product.description ??
    'Transformez vos descriptions textuelles en images photoréalistes ou artistiques. Résolution jusqu’à 1024×1024, contrôle avancé, accès via crédits IAHome.',
  landingPath: STABLEDIFFUSION_PUBLIC_ORIGIN,
  cardPath: STABLEDIFFUSION_CARD_URL.replace('https://iahome.fr', ''),
  appPath: STABLEDIFFUSION_APP_URL.startsWith('http')
    ? STABLEDIFFUSION_APP_URL.replace('https://iahome.fr', '')
    : STABLEDIFFUSION_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'WebApplication',
  features: cardSeo?.product.features ?? [
    'Génération text-to-image',
    'Résolution jusqu’à 1024×1024',
    'Contrôle artistique avancé',
    'Interface Gradio',
    '100 crédits par accès',
  ],
  faqs: (cardSeo?.faqs ?? []).map((faq) => ({
    ...faq,
    answer: faq.answer
      .replaceAll('stablediffusion.iahome.fr', 'iahome.fr/stablediffusion')
      .replaceAll('https://stablediffusion.iahome.fr', 'https://iahome.fr/stablediffusion'),
  })),
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à Stable Diffusion.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits (100 crédits par accès).',
    },
    {
      name: 'Générer une image',
      text: 'Décrivez votre image, ajustez les paramètres et lancez la génération.',
    },
  ],
};
