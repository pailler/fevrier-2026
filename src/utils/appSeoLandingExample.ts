import { SITE_URL } from '@/utils/pageMetadata';
import { getBreadcrumbListJsonLd, getFaqPageJsonLd, type FaqPair } from '@/utils/searchRanking';

export type AppSeoLandingInput = {
  slug: string;
  productName: string;
  headline: string;
  description: string;
  landingPath: string;
  cardPath: string;
  applicationCategory?: string;
  features: string[];
  faqs: FaqPair[];
  howToSteps: { name: string; text: string }[];
};

function resolveSeoUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

/** JSON-LD orienté « produit autonome » pour une landing SEO (exemple, sans remplacer /card/). */
export function getAppSeoLandingJsonLd(input: AppSeoLandingInput) {
  const landingUrl = resolveSeoUrl(input.landingPath);
  const cardUrl = resolveSeoUrl(input.cardPath);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${landingUrl}#webpage`,
        url: landingUrl,
        name: input.headline,
        description: input.description,
        inLanguage: 'fr-FR',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${landingUrl}#software` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/code-learning.jpg`,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${landingUrl}#software`,
        name: input.productName,
        applicationCategory: input.applicationCategory ?? 'EducationalApplication',
        operatingSystem: 'Web',
        url: cardUrl,
        description: input.description,
        inLanguage: 'fr-FR',
        featureList: input.features,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: cardUrl,
        },
        provider: { '@id': `${SITE_URL}/#organization` },
      },
      getBreadcrumbListJsonLd([
        { name: 'Accueil', path: '/' },
        { name: input.productName, path: input.landingPath },
      ]),
      {
        '@type': 'HowTo',
        name: `Comment démarrer avec ${input.productName}`,
        description: input.description,
        step: input.howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      getFaqPageJsonLd(input.faqs),
    ],
  };
}
