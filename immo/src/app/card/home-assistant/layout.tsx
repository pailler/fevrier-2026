import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Assistant : domotisez votre habitat gratuitement et facilement | IA Home',
  description: 'Domotisez votre habitat avec Home Assistant : manuel complet, codes Lovelace prêts à l\'emploi, automatisations. Installation open-source gratuite pour maison, garage, lieu de vacances. Guide pas à pas avec centaines de codes.',
  keywords: [
    'Home Assistant',
    'domotique',
    'automatisation maison',
    'smart home',
    'contrôle domotique',
    'installation Home Assistant',
    'configuration Home Assistant',
    'dashboard Home Assistant',
    'codes Lovelace',
    'automatisation domotique',
    'domotique open source',
    'domotique gratuite',
    'Home Assistant français',
    'manuel Home Assistant',
    'tutoriel Home Assistant',
    'domotiser sa maison',
    'automatisation habitat',
    'maison intelligente',
    'domotique Raspberry Pi',
    'Home Assistant Docker'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/home-assistant',
  },
  openGraph: {
    title: 'Home Assistant : domotisez votre habitat gratuitement et facilement | IA Home',
    description: 'Domotisez votre habitat avec Home Assistant : manuel complet, codes Lovelace prêts à l\'emploi, automatisations. Installation open-source gratuite pour maison, garage, lieu de vacances.',
    url: 'https://iahome.fr/card/home-assistant',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/home-assistant-module.jpg',
        width: 1200,
        height: 630,
        alt: 'Home Assistant - Domotisez votre habitat avec un système open-source gratuit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Home Assistant : domotisez votre habitat gratuitement et facilement | IA Home',
    description: 'Domotisez votre habitat avec Home Assistant : manuel complet, codes Lovelace prêts à l\'emploi, automatisations.',
    images: ['https://iahome.fr/images/home-assistant-module.jpg'],
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

export default function HomeAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


