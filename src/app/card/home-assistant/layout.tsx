import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Assistant : domotique et maison connectée gratuite | IA Home',
  description: 'Pilotez votre maison avec Home Assistant. Automatisations, dashboards Lovelace, open source. Guide et exemples pour installer et configurer.',
  keywords: [
    'Home Assistant',
    'domotique',
    'maison connectée',
    'automatisation maison',
    'Home Assistant installation',
    'Lovelace dashboard',
    'smart home',
    'installation Home Assistant',
    'configuration Home Assistant',
    'codes Lovelace',
    'automatisation domotique',
    'domotique open source',
    'domotique gratuite',
    'Home Assistant français',
    'manuel Home Assistant',
    'tutoriel Home Assistant',
    'domotiser sa maison',
    'maison intelligente',
    'domotique Raspberry Pi',
    'Home Assistant Docker'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/home-assistant',
  },
  openGraph: {
    title: 'Home Assistant : domotique et maison connectée gratuite | IA Home',
    description: 'Pilotez votre maison avec Home Assistant. Automatisations, Lovelace, open source. Guide et exemples.',
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
    title: 'Home Assistant : domotique et maison connectée gratuite | IA Home',
    description: 'Pilotez votre maison avec Home Assistant. Automatisations, Lovelace, open source.',
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


