import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générateur de prompts IA – ChatGPT, Claude, Gemini | IA Home',
  description: 'Créez des prompts efficaces pour ChatGPT, Claude, Gemini. Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur Prompting Guide.',
  keywords: [
    'générateur de prompts',
    'prompts ChatGPT',
    'prompt engineering',
    'exemples prompts ChatGPT',
    'prompt engineering français',
    'templates prompts IA',
    'créer prompts IA',
    'générateur prompts',
    'prompts optimisés',
    'prompts Claude Gemini',
    'techniques prompting',
    'zero-shot prompting',
    'few-shot prompting',
    'chain of thought',
    'ReAct prompting',
    'prompts français',
    'générateur prompts IA',
    'prompts professionnels',
    'prompts marketing IA',
    'générateur prompts ChatGPT'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/prompt-generator',
  },
  openGraph: {
    title: 'Générateur de prompts IA – ChatGPT, Claude, Gemini | IA Home',
    description: 'Prompts efficaces pour ChatGPT, Claude, Gemini. Zero-shot, Few-shot, Chain-of-Thought, ReAct. Prompting Guide.',
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
    title: 'Générateur de prompts IA – ChatGPT, Claude, Gemini | IA Home',
    description: 'Prompts efficaces pour ChatGPT, Claude, Gemini. Zero-shot, Few-shot, ReAct. Prompting Guide.',
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


