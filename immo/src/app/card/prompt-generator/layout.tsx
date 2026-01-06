import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générateur de prompts IA : créez des prompts optimisés pour ChatGPT et autres modèles | IA Home',
  description: 'Créez des prompts optimisés pour ChatGPT, Claude, Gemini et autres modèles de langage avec le Générateur de prompts IA. Techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur Prompting Guide. Remplacez une agence marketing à 3000€/mois.',
  keywords: [
    'générateur de prompts',
    'créer prompts IA',
    'prompts ChatGPT',
    'prompt engineering',
    'générateur prompts',
    'prompts optimisés',
    'prompts marketing',
    'techniques prompting',
    'zero-shot prompting',
    'few-shot prompting',
    'chain of thought',
    'ReAct prompting',
    'prompts français',
    'générateur prompts IA',
    'créer prompts efficaces',
    'prompts professionnels',
    'prompts marketing IA',
    'prompt engineering français',
    'générateur prompts ChatGPT',
    'prompts Claude Gemini'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/prompt-generator',
  },
  openGraph: {
    title: 'Générateur de prompts IA : créez des prompts optimisés pour ChatGPT et autres modèles | IA Home',
    description: 'Créez des prompts optimisés pour ChatGPT, Claude, Gemini avec techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur Prompting Guide.',
    url: 'https://iahome.fr/card/prompt-generator',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/prompt-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'Générateur de prompts IA - Créez des prompts optimisés pour ChatGPT et autres modèles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Générateur de prompts IA : créez des prompts optimisés pour ChatGPT et autres modèles | IA Home',
    description: 'Créez des prompts optimisés pour ChatGPT, Claude, Gemini avec techniques avancées. Basé sur Prompting Guide.',
    images: ['https://iahome.fr/images/prompt-generator.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function PromptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


