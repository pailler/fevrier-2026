import { Metadata } from 'next';
import Link from 'next/link';
import { subdomainsConfig, getSubdomainsByCategory } from '../../utils/subdomainsConfig';

export const metadata: Metadata = {
  title: 'Services IA Home - Tous nos Outils et Applications IA',
  description: 'Découvrez tous nos services et sous-domaines IA Home : Whisper pour la transcription, Stable Diffusion pour les images, outils de productivité, gestion de QR codes et bien plus. Plateforme complète d\'intelligence artificielle.',
  keywords: [
    'services iahome',
    'outils ia',
    'applications ia',
    'sous-domaines iahome',
    'plateforme ia',
    'whisper',
    'stable diffusion',
    'comfyui',
    'transcription',
    'génération image',
    'outils productivité'
  ],
  openGraph: {
    title: 'Services IA Home - Tous nos Outils et Applications IA',
    description: 'Découvrez tous nos services et sous-domaines IA Home : transcription, génération d\'images, outils de productivité et plus.',
    url: 'https://iahome.fr/services',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services IA Home - Tous nos Outils et Applications IA',
    description: 'Découvrez tous nos services et sous-domaines IA Home : transcription, génération d\'images, outils de productivité et plus.',
  },
  alternates: {
    canonical: 'https://iahome.fr/services',
  },
};

const categoryLabels: Record<string, string> = {
  ai: 'Intelligence Artificielle',
  productivity: 'Productivité',
  tools: 'Outils',
  media: 'Média',
  developer: 'Développement'
};

export default function ServicesPage() {
  const categories = ['ai', 'productivity', 'tools', 'media', 'developer'] as const;

  // Données structurées JSON-LD pour le SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Services IA Home',
    description: 'Liste complète des services et sous-domaines disponibles sur IA Home',
    itemListElement: subdomainsConfig.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebApplication',
        name: service.title,
        url: service.url,
        description: service.description,
        applicationCategory: categoryLabels[service.category],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR'
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* En-tête */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Services et Applications
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez tous nos services disponibles sur IA Home. Des outils d'intelligence artificielle 
              aux applications de productivité, explorez notre écosystème complet.
            </p>
          </header>

          {/* Navigation par catégories */}
          <nav className="mb-8 flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const count = getSubdomainsByCategory(category).length;
              if (count === 0) return null;
              return (
                <a
                  key={category}
                  href={`#${category}`}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-blue-600"
                >
                  {categoryLabels[category]} ({count})
                </a>
              );
            })}
          </nav>

          {/* Liste des services par catégorie */}
          {categories.map((category) => {
            const services = getSubdomainsByCategory(category);
            if (services.length === 0) return null;

            return (
              <section key={category} id={category} className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-4xl">{services[0]?.icon || '📦'}</span>
                  {categoryLabels[category]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.subdomain}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {service.icon && (
                            <span className="text-3xl">{service.icon}</span>
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {service.title.split(' - ')[0]}
                            </h3>
                            <a
                              href={service.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 break-all"
                            >
                              {service.subdomain}
                            </a>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {service.description}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Fonctionnalités :
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Cas d'usage :
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.useCases.slice(0, 2).map((useCase, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-500 mr-2">→</span>
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-4">
                        {service.keywords.slice(0, 4).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Accéder au service →
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Section informative */}
          <section className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comment accéder à nos services ?
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Tous nos services sont accessibles via leurs sous-domaines dédiés. Chaque service dispose 
                d'une URL unique (ex: <code className="bg-gray-100 px-2 py-1 rounded">whisper.iahome.fr</code>) 
                qui vous permet d'accéder directement à l'application.
              </p>
              <p>
                Ces services sont intégrés à notre écosystème IA Home et fonctionnent de manière 
                sécurisée avec authentification et suivi d'utilisation.
              </p>
              <div className="mt-6">
                <Link
                  href="/applications"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Voir toutes les applications →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

