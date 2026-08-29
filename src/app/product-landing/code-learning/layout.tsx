import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { codeLearningLandingSeo } from '@/data/code-learning-landing-seo';
import { CODE_LEARNING_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur code-learning.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: codeLearningLandingSeo.headline,
  description: codeLearningLandingSeo.description,
  keywords: [
    'apprendre à coder enfant',
    'programmation enfants 6-14 ans',
    'cours code enfant gratuit',
    'initiation programmation',
    'javascript enfant',
    'exercices programmation ludiques',
    'alternative scratch',
    'apprendre le code en ligne',
  ],
  alternates: {
    canonical: CODE_LEARNING_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: codeLearningLandingSeo.headline,
    description: codeLearningLandingSeo.description,
    url: CODE_LEARNING_PUBLIC_ORIGIN,
    siteName: 'Code Learning',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/code-learning.jpg',
        width: 1200,
        height: 630,
        alt: 'Apprendre le code aux enfants — exercices de programmation 6 à 14 ans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: codeLearningLandingSeo.headline,
    description: codeLearningLandingSeo.description,
    images: ['https://iahome.fr/images/code-learning.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CodeLearningProductLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(codeLearningLandingSeo)} />
      {children}
    </>
  );
}
