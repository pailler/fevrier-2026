import { getCardSeo } from '@/data/card-seo';
import {
  CODE_LEARNING_APP_URL,
  CODE_LEARNING_CARD_URL,
  CODE_LEARNING_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';

const seoEntry = getCardSeo('code-learning');
const faqs = seoEntry?.faqs ?? [];
const features = seoEntry?.product.features ?? [];

export const codeLearningLandingSeo = {
  slug: 'code-learning',
  productName: 'Code Learning',
  headline: 'Apprendre le code aux enfants (6–14 ans) — exercices progressifs en ligne',
  description:
    'Initiation ludique à la programmation pour les 6–14 ans : 35 exercices en JavaScript, progression par âge, directement dans le navigateur.',
  landingPath: CODE_LEARNING_PUBLIC_ORIGIN,
  cardPath: CODE_LEARNING_CARD_URL.replace('https://iahome.fr', ''),
  appPath: CODE_LEARNING_APP_URL.replace('https://iahome.fr', ''),
  applicationCategory: 'EducationalApplication',
  features,
  faqs,
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous gratuitement sur IAHome pour accéder à Code Learning.',
    },
    {
      name: 'Ouvrir Code Learning',
      text: 'Depuis cette page, lancez l’application et choisissez un module adapté à l’âge de l’enfant.',
    },
    {
      name: 'Progresser exercice par exercice',
      text: 'L’enfant avance à son rythme sur les variables, boucles, conditions et autres notions clés.',
    },
  ],
};
