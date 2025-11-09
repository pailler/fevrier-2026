'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { subdomainsConfig, getSubdomainsByCategory } from '../../utils/subdomainsConfig';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const categoryLabels: Record<string, string> = {
  ai: 'Intelligence Artificielle',
  productivity: 'Productivité',
  tools: 'Outils',
  media: 'Média',
  developer: 'Développement'
};

// Fonction pour mapper un subdomain vers sa page de détails /card/[id]
const getCardPageUrl = (subdomain: string): string | null => {
  // Extraire le nom du service depuis le subdomain (ex: "whisper.iahome.fr" -> "whisper")
  const serviceName = subdomain.replace('.iahome.fr', '').toLowerCase();
  
  // Mapping des services vers leurs pages de détails
  const serviceToCardMapping: Record<string, string> = {
    'whisper': '/card/whisper',
    'qrcodes': '/card/qrcodes',
    'stablediffusion': '/card/stablediffusion',
    'comfyui': '/card/comfyui',
    'ruinedfooocus': '/card/ruinedfooocus',
    'cogstudio': '/card/cogstudio',
    'meeting-reports': '/card/meeting-reports',
    'metube': '/card/metube',
    'pdf': '/card/pdf',
    'psitransfer': '/card/psitransfer',
    'librespeed': '/card/librespeed',
    'hunyuan3d': '/card/hunyuan3d'
  };
  
  return serviceToCardMapping[serviceName] || null;
};

export default function ServicesPage() {
  const categories = ['ai', 'productivity', 'tools', 'media', 'developer'] as const;

  // Mettre à jour les métadonnées de la page
  useEffect(() => {
    document.title = 'Services IA Home - Tous nos Outils et Applications IA';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Découvrez tous nos services et sous-domaines IA Home : Whisper pour la transcription, Stable Diffusion pour les images, outils de productivité, QR codes dynamiques modifiables et bien plus.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Découvrez tous nos services et sous-domaines IA Home : Whisper pour la transcription, Stable Diffusion pour les images, outils de productivité, QR codes dynamiques modifiables et bien plus.';
      document.head.appendChild(newMetaDescription);
    }
  }, []);

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
        {/* Section héros avec grande bannière */}
        <section className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-12 relative overflow-hidden">
          {/* Effet de particules en arrière-plan */}
          <div className="absolute inset-0">
            {/* Particules flottantes avec animations variées */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400/40 rounded-full animate-float-slow"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-indigo-400/35 rounded-full animate-float-fast"></div>
            <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-purple-500/30 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-blue-500/40 rounded-full animate-float-slow"></div>
            <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-indigo-600/25 rounded-full animate-float-fast"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-600/30 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-blue-700/20 rounded-full animate-float-slow"></div>
            <div className="absolute top-3/4 right-1/5 w-2 h-2 bg-indigo-700/25 rounded-full animate-float-fast"></div>
            
            {/* Formes géométriques flottantes */}
            <div className="absolute top-16 left-1/2 w-4 h-4 bg-blue-300/20 transform rotate-45 animate-rotate-slow"></div>
            <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-indigo-300/25 transform rotate-12 animate-rotate-fast"></div>
            <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-purple-400/30 transform rotate-45 animate-rotate-medium"></div>
            
            {/* Ondes de fond */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-blue-200/30 via-transparent to-transparent animate-pulse-slow"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-indigo-200/30 via-transparent to-transparent animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Contenu texte */}
              <div className="flex-1 max-w-2xl animate-fade-in-up">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 bg-clip-text text-transparent leading-tight mb-4">
                  Services IAHome
                </h1>
                <p className="text-xl text-gray-700 mb-6">
                  Découvrez tous nos services disponibles sur IA Home. Des outils d'intelligence artificielle 
                  aux applications de productivité, explorez notre écosystème complet.
                </p>
              </div>
              
              {/* Illustration */}
              <div className="flex-1 flex justify-center animate-fade-in-right">
                <div className="relative w-80 h-64 animate-float-gentle">
                  {/* Formes géométriques abstraites avec animations */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400 rounded-full opacity-60 animate-float-slow hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 rounded-lg opacity-60 animate-float-medium hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-60 animate-float-fast hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-500 rounded-full opacity-60 animate-float-slow hover:scale-110 transition-transform duration-300"></div>
                  
                  {/* Nouvelles formes flottantes */}
                  <div className="absolute top-8 right-8 w-12 h-12 bg-indigo-500 rounded-full opacity-50 animate-float-medium"></div>
                  <div className="absolute bottom-8 left-8 w-14 h-14 bg-purple-500 transform rotate-12 opacity-50 animate-float-fast"></div>
                  
                  {/* Éléments centraux avec animation */}
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse-gentle">
                    <div className="text-left">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3">IAHome</div>
                      <div className="text-xs text-gray-600">Services et Applications</div>
                    </div>
                  </div>
                  
                  {/* Petites particules décoratives */}
                  <div className="absolute top-4 left-4 w-1 h-1 bg-blue-300 rounded-full opacity-60 animate-pulse-gentle"></div>
                  <div className="absolute top-12 right-4 w-1 h-1 bg-indigo-300 rounded-full opacity-60 animate-pulse-gentle" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-4 right-8 w-1 h-1 bg-purple-300 rounded-full opacity-60 animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-12 left-8 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse-gentle" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Styles CSS pour les animations */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-3deg); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes rotate-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes rotate-medium {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(180deg); }
          }
          
          @keyframes rotate-fast {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(90deg); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          
          @keyframes pulse-gentle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
          
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fade-in-right {
            0% { opacity: 0; transform: translateX(30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          
          .animate-float-medium {
            animation: float-medium 4s ease-in-out infinite;
          }
          
          .animate-float-fast {
            animation: float-fast 3s ease-in-out infinite;
          }
          
          .animate-float-gentle {
            animation: float-gentle 5s ease-in-out infinite;
          }
          
          .animate-rotate-slow {
            animation: rotate-slow 20s linear infinite;
          }
          
          .animate-rotate-medium {
            animation: rotate-medium 15s linear infinite;
          }
          
          .animate-rotate-fast {
            animation: rotate-fast 10s linear infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          
          .animate-pulse-gentle {
            animation: pulse-gentle 3s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out;
          }
          
          .animate-fade-in-right {
            animation: fade-in-right 1s ease-out;
          }
          
          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-stops));
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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

                      {(() => {
                        const cardUrl = getCardPageUrl(service.subdomain);
                        if (cardUrl) {
                          return (
                            <Link
                              href={cardUrl}
                              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              En savoir +
                            </Link>
                          );
                        }
                        // Fallback si pas de page card disponible
                        return (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Accéder au service →
                          </a>
                        );
                      })()}
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
                Pour l'utilisation d'une application IAHome, vous devez d'abord l'activer, puis l'utiliser en cliquant sur "Mes applis" dans la bannière de IAHome.fr.
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

