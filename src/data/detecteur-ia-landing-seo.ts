import {
  DETECTEUR_IA_APP_URL,
  DETECTEUR_IA_CARD_URL,
  DETECTEUR_IA_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('ai-detector');

export const detecteurIaLandingSeo = {
  slug: 'detecteur-ia',
  productName: 'Détecteur de contenu IA',
  headline: 'Détectez un texte ou une image générés par l’IA',
  description:
    cardSeo?.product.description ??
    'Estimez la probabilité qu’un contenu ait été généré par une intelligence artificielle. Texte, fichier ou image — outil en français sur IAHome.',
  landingPath: DETECTEUR_IA_PUBLIC_ORIGIN,
  cardPath: DETECTEUR_IA_CARD_URL.replace('https://iahome.fr', ''),
  appPath: DETECTEUR_IA_APP_URL.startsWith('http')
    ? DETECTEUR_IA_APP_URL.replace('https://iahome.fr', '')
    : DETECTEUR_IA_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'WebApplication',
  features: cardSeo?.product.features ?? [
    'Analyse de texte',
    'Analyse de fichiers',
    'Analyse d’images',
    'Score IA / humain',
    'Interface en français',
  ],
  faqs: cardSeo?.faqs ?? [
    {
      question: 'Comment accéder au Détecteur IA ?',
      answer:
        'Ouvrez la fiche produit sur IAHome, activez le module avec vos crédits, puis lancez l’application via le bouton d’accès sécurisé (token).',
    },
    {
      question: 'Quels contenus puis-je analyser ?',
      answer:
        'Vous pouvez coller un texte, importer un fichier, ou analyser une image pour estimer la part de contenu généré par IA.',
    },
    {
      question: 'Le résultat est-il une preuve absolue ?',
      answer:
        'Non : il s’agit d’une estimation probabiliste utile pour la vérification ou la pédagogie, pas d’une certification juridique.',
    },
  ],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder au Détecteur de contenu IA.',
    },
    {
      name: 'Ouvrir la fiche produit',
      text: 'Depuis la fiche, lancez l’application avec le bouton d’accès (token sécurisé).',
    },
    {
      name: 'Analyser un contenu',
      text: 'Collez un texte, importez un fichier ou une image, puis consultez le score IA / humain.',
    },
  ],
};
