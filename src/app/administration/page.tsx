'use client';
import { useEffect } from 'react';
import Link from 'next/link';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';

interface Service {
  name: string;
  description: string;
  url: string;
  icon: string;
  popular?: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

interface Administration {
  name: string;
  icon: string;
  color: string;
  services: Service[];
}

const administrations: Administration[] = [
  {
    name: 'CAF (Caisse d\'Allocations Familiales)',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-blue-500 to-blue-600',
    services: [
      {
        name: 'Demande d\'allocations familiales',
        description: 'Faire une demande d\'allocations familiales, complément familial, allocation de rentrée scolaire',
        url: 'https://www.caf.fr',
        icon: '💰',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/caf-mon-compte/id514029142',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.caf.moncompte'
      },
      {
        name: 'Déclaration de ressources',
        description: 'Déclarer vos ressources en ligne pour le calcul de vos droits',
        url: 'https://www.caf.fr',
        icon: '📊',
        popular: true
      },
      {
        name: 'Demande d\'aide au logement',
        description: 'Demander l\'APL, l\'ALS ou l\'ALF pour votre logement',
        url: 'https://www.caf.fr',
        icon: '🏠',
        popular: true
      },
      {
        name: 'RSA (Revenu de Solidarité Active)',
        description: 'Demander le RSA et suivre votre dossier',
        url: 'https://www.caf.fr',
        icon: '💳'
      },
      {
        name: 'Prime d\'activité',
        description: 'Demander la prime d\'activité pour compléter vos revenus',
        url: 'https://www.caf.fr',
        icon: '💼'
      }
    ]
  },
  {
    name: 'Sécurité Sociale',
    icon: '🏥',
    color: 'from-green-500 to-green-600',
    services: [
      {
        name: 'Carte Vitale',
        description: 'Demander ou renouveler votre carte Vitale',
        url: 'https://www.ameli.fr',
        icon: '💳',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/ameli/id1025165528',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.ameli.assure.mobile'
      },
      {
        name: 'Remboursement de soins',
        description: 'Consulter vos remboursements et télécharger vos attestations',
        url: 'https://www.ameli.fr',
        icon: '💊',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/ameli/id1025165528',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.ameli.assure.mobile'
      },
      {
        name: 'Déclarer un changement de situation',
        description: 'Changement d\'adresse, de situation familiale, etc.',
        url: 'https://www.ameli.fr',
        icon: '📝'
      },
      {
        name: 'Trouver un professionnel de santé',
        description: 'Rechercher un médecin, dentiste, pharmacie près de chez vous',
        url: 'https://www.ameli.fr',
        icon: '🔍'
      },
      {
        name: 'Arrêt de travail',
        description: 'Déclarer un arrêt de travail et suivre vos indemnités',
        url: 'https://www.ameli.fr',
        icon: '🏥'
      }
    ]
  },
  {
    name: 'Permis de conduire',
    icon: '🚗',
    color: 'from-orange-500 to-orange-600',
    services: [
      {
        name: 'Demande de permis de conduire',
        description: 'Inscription à l\'examen du permis de conduire',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F33528',
        icon: '📋',
        popular: true
      },
      {
        name: 'Renouvellement du permis',
        description: 'Renouveler votre permis de conduire',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F33528',
        icon: '🔄'
      },
      {
        name: 'Duplicata de permis',
        description: 'Demander un duplicata en cas de perte ou vol',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F33528',
        icon: '📄'
      },
      {
        name: 'Échange permis étranger',
        description: 'Échanger un permis de conduire obtenu à l\'étranger',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F33528',
        icon: '🌍'
      }
    ]
  },
  {
    name: 'Aides sociales',
    icon: '🤝',
    color: 'from-purple-500 to-purple-600',
    services: [
      {
        name: 'Aide sociale à l\'enfance',
        description: 'Demander une aide pour la garde d\'enfants, les frais de scolarité',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F12028',
        icon: '👶'
      },
      {
        name: 'Aide au logement',
        description: 'Demander une aide pour payer votre loyer ou vos charges',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F12028',
        icon: '🏘️'
      },
      {
        name: 'Aide alimentaire',
        description: 'Demander une aide alimentaire d\'urgence',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F12028',
        icon: '🛒'
      },
      {
        name: 'Aide pour les personnes âgées',
        description: 'Demander l\'APA (Allocation Personnalisée d\'Autonomie)',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F12028',
        icon: '👴'
      }
    ]
  },
  {
    name: 'Scolarité et Éducation',
    icon: '📚',
    color: 'from-indigo-500 to-indigo-600',
    services: [
      {
        name: 'Inscription scolaire',
        description: 'Inscrire votre enfant à l\'école, au collège ou au lycée',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F13321',
        icon: '✏️',
        popular: true
      },
      {
        name: 'Bourses scolaires',
        description: 'Demander une bourse pour le collège ou le lycée',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F13321',
        icon: '🎓',
        popular: true
      },
      {
        name: 'Cantine scolaire',
        description: 'Inscrire votre enfant à la cantine',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F13321',
        icon: '🍽️'
      },
      {
        name: 'Transport scolaire',
        description: 'Demander une aide pour le transport scolaire',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F13321',
        icon: '🚌'
      }
    ]
  },
  {
    name: 'Études supérieures',
    icon: '🎓',
    color: 'from-cyan-500 to-cyan-600',
    services: [
      {
        name: 'Inscription universitaire',
        description: 'S\'inscrire à l\'université via Parcoursup',
        url: 'https://www.parcoursup.fr',
        icon: '📖',
        popular: true
      },
      {
        name: 'Bourses étudiantes',
        description: 'Demander une bourse sur critères sociaux',
        url: 'https://www.messervices.etudiant.gouv.fr',
        icon: '💰',
        popular: true
      },
      {
        name: 'Logement étudiant',
        description: 'Demander un logement en résidence universitaire',
        url: 'https://www.messervices.etudiant.gouv.fr',
        icon: '🏠'
      },
      {
        name: 'Aide à la mobilité',
        description: 'Demander une aide pour étudier à l\'étranger',
        url: 'https://www.messervices.etudiant.gouv.fr',
        icon: '✈️'
      }
    ]
  },
  {
    name: 'Retraites',
    icon: '👴',
    color: 'from-amber-500 to-amber-600',
    services: [
      {
        name: 'Demande de retraite',
        description: 'Faire une demande de retraite auprès de votre caisse',
        url: 'https://www.lassuranceretraite.fr',
        icon: '📅',
        popular: true
      },
      {
        name: 'Simulateur de retraite',
        description: 'Estimer le montant de votre future retraite',
        url: 'https://www.lassuranceretraite.fr',
        icon: '🧮',
        popular: true
      },
      {
        name: 'Suivi de dossier retraite',
        description: 'Suivre l\'avancement de votre demande de retraite',
        url: 'https://www.lassuranceretraite.fr',
        icon: '📊'
      },
      {
        name: 'Rappel de carrière',
        description: 'Consulter votre carrière et vos trimestres validés',
        url: 'https://www.lassuranceretraite.fr',
        icon: '📋'
      }
    ]
  },
  {
    name: 'Famille',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-500 to-pink-600',
    services: [
      {
        name: 'Naissance',
        description: 'Déclarer une naissance et demander les allocations',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F1560',
        icon: '👶',
        popular: true
      },
      {
        name: 'Mariage / PACS',
        description: 'Déclarer un mariage ou un PACS',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F1560',
        icon: '💍'
      },
      {
        name: 'Décès',
        description: 'Déclarer un décès et effectuer les démarches',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F1560',
        icon: '🕊️'
      },
      {
        name: 'Garde d\'enfants',
        description: 'Demander une aide pour la garde d\'enfants',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F1560',
        icon: '👨‍👩‍👦'
      }
    ]
  },
  {
    name: 'Handicap',
    icon: '♿',
    color: 'from-teal-500 to-teal-600',
    services: [
      {
        name: 'Demande d\'AAH',
        description: 'Demander l\'Allocation aux Adultes Handicapés',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F15628',
        icon: '💳',
        popular: true
      },
      {
        name: 'Reconnaissance de handicap',
        description: 'Demander la Reconnaissance de la Qualité de Travailleur Handicapé (RQTH)',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F15628',
        icon: '📋',
        popular: true
      },
      {
        name: 'Carte mobilité inclusion',
        description: 'Demander la Carte Mobilité Inclusion (CMI)',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F15628',
        icon: '🪪'
      },
      {
        name: 'Prestation de compensation du handicap',
        description: 'Demander la PCH pour financer vos besoins',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F15628',
        icon: '💼'
      }
    ]
  },
  {
    name: 'Impôts',
    icon: '📊',
    color: 'from-red-500 to-red-600',
    services: [
      {
        name: 'Déclaration d\'impôts',
        description: 'Déclarer vos revenus en ligne',
        url: 'https://www.impots.gouv.fr',
        icon: '📝',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/impots-gouv/id6443832009',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.gouv.finances.dgfip.impot'
      },
      {
        name: 'Paiement des impôts',
        description: 'Payer vos impôts en ligne',
        url: 'https://www.impots.gouv.fr',
        icon: '💳'
      },
      {
        name: 'Simulateur d\'impôts',
        description: 'Estimer le montant de vos impôts',
        url: 'https://www.impots.gouv.fr',
        icon: '🧮'
      },
      {
        name: 'Relevé de situation',
        description: 'Consulter votre situation fiscale',
        url: 'https://www.impots.gouv.fr',
        icon: '📄'
      }
    ]
  },
  {
    name: 'Papiers d\'identité',
    icon: '🪪',
    color: 'from-gray-500 to-gray-600',
    services: [
      {
        name: 'Carte d\'identité',
        description: 'Demander ou renouveler votre carte d\'identité',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F34730',
        icon: '🆔',
        popular: true
      },
      {
        name: 'Passeport',
        description: 'Demander ou renouveler votre passeport',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F34730',
        icon: '📘',
        popular: true
      },
      {
        name: 'Acte de naissance',
        description: 'Demander une copie d\'acte de naissance',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F34730',
        icon: '📜'
      },
      {
        name: 'Acte de mariage',
        description: 'Demander une copie d\'acte de mariage',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F34730',
        icon: '💍'
      }
    ]
  },
  {
    name: 'Emploi et Chômage',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    services: [
      {
        name: 'Inscription à Pôle Emploi',
        description: 'S\'inscrire comme demandeur d\'emploi',
        url: 'https://www.pole-emploi.fr',
        icon: '📋',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/pole-emploi/id1090253187',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.poleemploi.direct'
      },
      {
        name: 'Demande d\'allocation chômage',
        description: 'Demander l\'allocation chômage (ARE)',
        url: 'https://www.pole-emploi.fr',
        icon: '💳',
        popular: true,
        appStoreUrl: 'https://apps.apple.com/fr/app/pole-emploi/id1090253187',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.poleemploi.direct'
      },
      {
        name: 'Formation professionnelle',
        description: 'Trouver une formation et demander un financement',
        url: 'https://www.pole-emploi.fr',
        icon: '🎓'
      },
      {
        name: 'Aide à la création d\'entreprise',
        description: 'Bénéficier d\'aides pour créer votre entreprise',
        url: 'https://www.pole-emploi.fr',
        icon: '🚀'
      }
    ]
  }
];

// Fonction pour normaliser les noms en slugs d'ancres (gérer les accents)
const normalizeToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '') // Supprime les caractères non alphanumériques
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprime les tirets en début et fin
};

export default function AdministrationPage() {
  useEffect(() => {
    document.title = 'Services de l\'Administration - Accès Rapide aux Démarches Administratives';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Accédez rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Accédez rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.';
      document.head.appendChild(newMetaDescription);
    }

    // Gérer les ancres (avec ou sans accents)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = decodeURIComponent(window.location.hash.substring(1));
      
      // Chercher la section correspondante
      const matchingAdmin = administrations.find(admin => {
        const normalizedAdminName = normalizeToSlug(admin.name);
        const normalizedHash = normalizeToSlug(hash);
        
        // Correspondance exacte avec le slug normalisé
        if (normalizedAdminName === normalizedHash) {
          return true;
        }
        
        // Correspondance avec le nom original (pour compatibilité)
        if (admin.name.toLowerCase() === hash.toLowerCase()) {
          return true;
        }
        
        return false;
      });
      
      if (matchingAdmin) {
        const normalizedId = normalizeToSlug(matchingAdmin.name);
        const element = document.getElementById(normalizedId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Mettre à jour l'URL sans recharger la page
            window.history.replaceState(null, '', `#${normalizedId}`);
          }, 300);
        }
      }
    }
  }, []);

  // Récupérer tous les services populaires
  const popularServices = administrations.flatMap(admin => 
    admin.services.filter(service => service.popular)
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Section héros */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-float-slow"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full animate-float-medium"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white rounded-full animate-float-fast"></div>
            <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-white rounded-full animate-float-slow"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 animate-fade-in-up px-2">
                Services de l'Administration
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 opacity-90 animate-fade-in-up px-2" style={{animationDelay: '0.2s'}}>
                Accès rapide aux démarches administratives les plus courantes
              </p>
              <p className="text-sm sm:text-base md:text-lg opacity-80 max-w-3xl mx-auto animate-fade-in-up px-2" style={{animationDelay: '0.4s'}}>
                Trouvez rapidement le service dont vous avez besoin et accédez directement au site officiel ou à l'application mobile pour effectuer vos démarches en ligne.
              </p>
            </div>
          </div>
        </section>

        {/* Styles CSS pour les animations */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
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
          
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Section Services populaires */}
          {popularServices.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl">⭐</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Services les plus demandés
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {popularServices.map((service, index) => (
                  <a
                    key={index}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-3 sm:p-4 hover:shadow-lg hover:border-blue-400 transition-all group"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{service.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                          {service.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                      Accéder au service
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Navigation par administrations */}
          <nav className="mb-6 sm:mb-8 flex flex-wrap gap-2 justify-center px-2">
            {administrations.map((admin) => (
              <a
                key={admin.name}
                href={`#${normalizeToSlug(admin.name)}`}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-blue-600 border border-gray-200 text-xs sm:text-sm md:text-base"
              >
                <span className="mr-1 sm:mr-2">{admin.icon}</span>
                <span className="hidden sm:inline">{admin.name}</span>
                <span className="sm:hidden">{admin.name.split(' ')[0]}</span>
              </a>
            ))}
          </nav>

          {/* Liste des services par administration */}
          {administrations.map((admin) => (
            <section
              key={admin.name}
              id={normalizeToSlug(admin.name)}
              className="mb-8 sm:mb-12 md:mb-16 scroll-mt-16 sm:scroll-mt-8"
            >
              <div className={`bg-gradient-to-r ${admin.color} rounded-t-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6`}>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl md:text-4xl">{admin.icon}</span>
                  <span className="break-words">{admin.name}</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {admin.services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{service.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 break-words">
                            {service.name}
                            {service.popular && (
                              <span className="ml-1 sm:ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                Populaire
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Boutons d'accès */}
                    <div className="space-y-2">
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Site web
                        </span>
                      </a>

                      {/* Liens vers les applications mobiles */}
                      {(service.appStoreUrl || service.playStoreUrl) && (
                        <div className="flex gap-2">
                          {service.appStoreUrl && (
                            <a
                              href={service.appStoreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.3 7.59 9.55 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                              </svg>
                              <span className="hidden sm:inline">App Store</span>
                              <span className="sm:hidden">iOS</span>
                            </a>
                          )}
                          {service.playStoreUrl && (
                            <a
                              href={service.playStoreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                              </svg>
                              <span className="hidden sm:inline">Play Store</span>
                              <span className="sm:hidden">Android</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Section informative */}
          <section className="mt-8 sm:mt-12 md:mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              💡 Comment utiliser cette page ?
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
              <p>
                Cette page regroupe les principaux services de l'administration française pour vous faciliter l'accès aux démarches en ligne.
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
                <li>Les services sont organisés par administration (CAF, Sécurité Sociale, etc.)</li>
                <li>Les services les plus demandés sont mis en avant en haut de la page</li>
                <li>Cliquez sur un service pour accéder directement au site officiel</li>
                <li>Utilisez les applications mobiles pour un accès encore plus rapide</li>
                <li>Utilisez la navigation en haut pour accéder rapidement à une administration</li>
              </ul>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium text-xs sm:text-sm md:text-base">
                  ⚠️ Important : Cette page vous redirige vers les sites officiels de l'administration française. 
                  Assurez-vous d'être sur le bon site avant de saisir vos informations personnelles.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

