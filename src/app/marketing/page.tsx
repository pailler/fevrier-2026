'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { getFeaturedSubdomains } from '../../utils/subdomainsConfig';
import EcosystemValueBlock from '../../components/marketing/EcosystemValueBlock';
import GpuInfrastructureBlock from '../../components/marketing/GpuInfrastructureBlock';
import FrenchTrustBlock from '../../components/marketing/FrenchTrustBlock';
import AudienceSegmentsBlock from '../../components/marketing/AudienceSegmentsBlock';
import { getValueProposition } from '../../data/ecosystemValueProposition';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';

export default function MarketingPage() {
  useEffect(() => {
    const vp = getValueProposition('marketing');
    document.title = 'IAHome — Un compte, 30+ outils IA, zéro installation';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `${vp.subheadline} ${vp.oneLiner}`
      );
    }
  }, []);

  const benefits = [
    {
      icon: '🎙️',
      title: 'Synthétiser une réunion',
      description:
        'Enregistrement ou fichier audio → texte structuré. Idéal pour les comptes rendus, interviews et prises de notes.',
    },
    {
      icon: '🎨',
      title: 'Produire un visuel',
      description:
        'Affiche, illustration, photo stylisée : partez d’une idée, obtenez une image utilisable tout de suite.',
    },
    {
      icon: '📄',
      title: 'Finaliser un dossier PDF',
      description:
        'Fusion, conversion, préparation à l’envoi — sans ouvrir cinq logiciels différents.',
    },
    {
      icon: '📤',
      title: 'Partager un gros fichier',
      description:
        'Envoi sécurisé à un client ou un proche, depuis le PC ou le smartphone, sans limite de messagerie.',
    },
    {
      icon: '🎉',
      title: 'Animer un événement',
      description:
        'QR codes, photobooth, votes en direct : des outils pensés pour l’instant présent, pas pour la vitrine tech.',
    },
    {
      icon: '🎁',
      title: 'Tester sans risque',
      description:
        '200 crédits offerts à l’inscription : essayez un cas d’usage réel avant de vous engager.',
    },
  ];

  const useCases = [
    {
      category: 'Grand public',
      examples: [
        'Créer une illustration pour les réseaux sociaux',
        'Transcrire un podcast ou un cours',
        'Télécharger ou convertir une vidéo',
        'Initier un enfant au code',
      ],
    },
    {
      category: 'Professionnels',
      examples: [
        'Automatiser vos comptes-rendus de réunion',
        'Produire un visuel pour une présentation client',
        'Préparer un CV optimisé et une candidature',
        'Workflow créatif ou prototype 3D sur mesure',
      ],
    },
    {
      category: 'Événementiel',
      examples: [
        'Photobooth avec galerie et QR de récupération',
        'Vote ou sondage en AG avec PIN',
        'QR codes pour un salon ou une campagne',
        'Réserver du matériel pour un événement',
      ],
    },
  ];

  const stats = [
    { number: '100%', label: 'Interface en français' },
    { number: 'RGPD', label: 'Conforme UE' },
    { number: '💬', label: 'Support en français' },
    { number: '🇫🇷', label: 'Hébergé en France' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          {/* Particules flottantes avec animations variées */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400/35 rounded-full animate-float-fast"></div>
          <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-purple-500/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-yellow-500/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-indigo-600/25 rounded-full animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-600/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-purple-700/20 rounded-full animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/5 w-2 h-2 bg-yellow-700/25 rounded-full animate-float-fast"></div>
          
          {/* Formes géométriques flottantes */}
          <div className="absolute top-16 left-1/2 w-4 h-4 bg-yellow-300/20 transform rotate-45 animate-rotate-slow"></div>
          <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-blue-300/25 transform rotate-12 animate-rotate-fast"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-purple-400/30 transform rotate-45 animate-rotate-medium"></div>
          
          {/* Ondes de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up text-white">
            <EcosystemValueBlock
              variant="marketing"
              layout="hero"
              theme="dark"
              showPillars={false}
              showAudiences={true}
              showProof={true}
              className="max-w-4xl mx-auto text-center [&_p]:mx-auto"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed mt-4">
              <Link
                href="https://iahome.fr/applications"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Commencer Maintenant →
              </Link>
              <Link
                href="/applications"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Voir Tous les Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EcosystemValueBlock variant="marketing" useCasesOnly />

      <AudienceSegmentsBlock />

      <GpuInfrastructureBlock variant="marketing" />

      <FrenchTrustBlock variant="marketing" />

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Des situations concrètes, des outils adaptés
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque carte ci-dessous part d’un besoin réel — pas d’une fiche technique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce Que Disent Nos Clients
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Après chaque réunion, je récupère un compte rendu structuré en quelques minutes. J'économise des heures chaque semaine — et je peux le faire depuis mon téléphone entre deux rendez-vous."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-lg">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sophie Martin</div>
                  <div className="text-sm text-gray-600">Chef de Projet, Paris</div>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Pour mes vidéos et articles, je produis visuels et sous-titres sans quitter le navigateur. Résultat pro, interface simple — exactement ce qu'il me fallait pour tenir mon rythme de publication."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-lg">TD</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Thomas Dubois</div>
                  <div className="text-sm text-gray-600">Créateur YouTube, Lyon</div>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Notre équipe utilise Meeting Reports pour automatiser nos comptes-rendus. C'est un gain de temps énorme ! Le support client est réactif et la plateforme est très fiable. Une vraie valeur ajoutée."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-lg">ML</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marie Leclerc</div>
                  <div className="text-sm text-gray-600">Directrice Marketing, Marseille</div>
                </div>
              </div>
            </div>

            {/* Témoignage 4 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "J'ai testé plusieurs solutions IA et IA Home est de loin la meilleure. Les outils PDF sont parfaits pour traiter mes documents, et le système de crédits est très flexible. Je ne peux plus m'en passer !"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-bold text-lg">PB</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pierre Bernard</div>
                  <div className="text-sm text-gray-600">Avocat, Bordeaux</div>
                </div>
              </div>
            </div>

            {/* Témoignage 5 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "QR codes pour mes campagnes, transcription pour mes podcasts, visuels pour mes posts : tout part du même compte. Je pars d'un besoin précis, pas d'une liste d'outils à assembler."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-pink-600 font-bold text-lg">CL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Camille Leroy</div>
                  <div className="text-sm text-gray-600">Entrepreneuse, Nantes</div>
                </div>
              </div>
            </div>

            {/* Témoignage 6 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Pour un projet client, j'ai enchaîné génération d'images et préparation de livrables sans installer quoi que ce soit. Documentation claire, tarifs lisibles — excellent rapport qualité-prix."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-lg">JL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Julien Laurent</div>
                  <div className="text-sm text-gray-600">Développeur Full-Stack, Toulouse</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quelques situations que nous couvrons
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Partez de votre besoin du moment — réunion, visuel, dossier, événement — et ouvrez l’outil adapté en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedSubdomains().map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{service.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {service.title.split(' - ')[0]}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.slice(0, 2).map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/card/${service.subdomain.replace('.iahome.fr', '')}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center"
                >
                  En savoir plus →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/applications"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Voir Tous les Services
            </Link>
          </div>
        </div>
      </section>

      {/* Section Développement */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              💻 Services de Développement Personnalisé
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Faites développer votre application web sur mesure par IAHome. Des solutions professionnelles adaptées à vos besoins spécifiques.
            </p>
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              ⚡ Livraison de l'application en temps record
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Exemple 1: Boutique en ligne */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-green-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">🛒</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Boutique en Ligne
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Créez votre e-commerce personnalisé avec gestion des produits, panier, paiements sécurisés et suivi des commandes. Interface moderne et responsive.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  E-commerce
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  Paiement sécurisé
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  Gestion stock
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  Catalogue produits avec images
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  Panier d'achat et checkout
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  Intégration paiements (Stripe, PayPal)
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  Dashboard administrateur
                </li>
              </ul>
            </div>

            {/* Exemple 2: Portfolio professionnel */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-blue-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">🎨</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Portfolio Professionnel
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Présentez vos réalisations avec style. Portfolio élégant et moderne pour photographes, designers, développeurs ou créateurs de contenu.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  Portfolio
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  Galerie
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  Responsive
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">✓</span>
                  Galerie photos/vidéos interactive
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">✓</span>
                  Présentation de vos projets
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">✓</span>
                  Formulaire de contact intégré
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">✓</span>
                  Design sur mesure et SEO optimisé
                </li>
              </ul>
            </div>

            {/* Exemple 3: Système de réservation */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-purple-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">🎮</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Système de Réservation
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gérez la réservation de matériels (jeux vidéo en médiathèque, équipements, salles, etc.). Interface intuitive avec calendrier et notifications.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                  Réservation
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                  Calendrier
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                  Gestion
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 font-bold">✓</span>
                  Réservation de matériels (jeux vidéo, équipements)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 font-bold">✓</span>
                  Calendrier de disponibilité en temps réel
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 font-bold">✓</span>
                  Notifications automatiques (email/SMS)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 font-bold">✓</span>
                  Suivi des emprunts et retours
                </li>
              </ul>
              <a
                href="https://resas.iahome.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Voir la démo →
              </a>
            </div>

            {/* Exemple 4: Application de gestion */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-orange-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">📊</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Application de Gestion
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Outils de gestion personnalisés : inventaire, planning, suivi de projets, gestion de clients. Adapté à votre activité.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                  Gestion
                </span>
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                  Dashboard
                </span>
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                  Automatisation
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">✓</span>
                  Gestion d'inventaire et stock
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">✓</span>
                  Planning et calendrier partagé
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">✓</span>
                  Suivi de projets et tâches
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">✓</span>
                  Rapports et statistiques
                </li>
              </ul>
            </div>

            {/* Exemple 5: Plateforme de cours en ligne */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-indigo-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">📚</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Plateforme de Cours
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Créez votre plateforme d'apprentissage en ligne avec vidéos, quiz, certificats et suivi de progression des étudiants.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  E-learning
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Vidéos
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Certificats
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">✓</span>
                  Catalogue de cours avec vidéos
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">✓</span>
                  Quiz et évaluations interactives
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">✓</span>
                  Suivi de progression des apprenants
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">✓</span>
                  Génération de certificats
                </li>
              </ul>
            </div>

            {/* Exemple 6: Application de livraison */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-red-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3">🚚</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Application de Livraison
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gérez vos livraisons avec suivi en temps réel, notifications clients, planification d'itinéraires et gestion des livreurs.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                  Livraison
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                  Suivi GPS
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                  Notifications
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">✓</span>
                  Suivi de commandes en temps réel
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">✓</span>
                  Géolocalisation et itinéraires
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">✓</span>
                  Notifications SMS/Email automatiques
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">✓</span>
                  Interface livreur et client
                </li>
              </ul>
            </div>

            {/* Réveil Intelligent */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-indigo-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3" aria-hidden="true">
                  ⏰
                </span>
                <h3 className="text-xl font-bold text-gray-900">Réveil Intelligent</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Réveil mobile synchronisé avec votre compte IAHome : alarmes récurrentes, musiques de réveil,
                prévisions météo du jour et messages adaptés aux jours fériés et vacances scolaires (zones A, B, C).
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Météo locale
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Mobile-first
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Accès gratuit
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  Alarmes multiples, récurrence et musiques de réveil
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  Prévisions horaires et messages contextuels au réveil
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  Synchronisation de vos réglages avec votre compte IAHome
                </li>
              </ul>
              <Link
                href="/card/reveil"
                className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-900 hover:bg-indigo-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Découvrir le Réveil Intelligent →
              </Link>
            </div>

            {/* Photobooth : application + borne physique */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-fuchsia-100">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3" aria-hidden="true">
                  📸
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Application &amp; objet Photobooth
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                L&apos;application web IA Home pour créer des événements, capturer les clichés et partager une galerie
                en ligne — couplée à une borne physique chaleureuse (finition bois, ambiance festive) pour mariages,
                anniversaires et soirées pro.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-fuchsia-100 text-fuchsia-800 text-xs px-3 py-1 rounded-full font-medium">
                  Événementiel
                </span>
                <span className="bg-fuchsia-100 text-fuchsia-800 text-xs px-3 py-1 rounded-full font-medium">
                  Galerie en ligne
                </span>
                <span className="bg-fuchsia-100 text-fuchsia-800 text-xs px-3 py-1 rounded-full font-medium">
                  Sans Wi‑Fi requis
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-fuchsia-600 mr-2 font-bold">✓</span>
                  Studio tactile : compte à rebours, filtres, templates et galerie événement
                </li>
                <li className="flex items-start">
                  <span className="text-fuchsia-600 mr-2 font-bold">✓</span>
                  Borne « objet » pensée déco, pas un simple écran dans un coin
                </li>
                <li className="flex items-start">
                  <span className="text-fuchsia-600 mr-2 font-bold">✓</span>
                  Partage des photos par lien — idéal carton « photos en direct »
                </li>
                <li className="flex items-start">
                  <span className="text-fuchsia-600 mr-2 font-bold">✓</span>
                  Activation via votre compte iahome.fr (offre et jetons selon formule)
                </li>
              </ul>
              <a
                href="https://iahome.fr/photobooth-decouverte.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-fuchsia-100 text-fuchsia-900 hover:bg-fuchsia-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Découvrir le Photobooth →
              </a>
            </div>
          </div>

          {/* Section Avantages */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Pourquoi Choisir IAHome pour votre Développement ?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="font-bold text-lg mb-2">Livraison Rapide</h4>
                <p className="text-green-100 text-sm">Applications livrées en temps record selon vos besoins</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💻</div>
                <h4 className="font-bold text-lg mb-2">100% Web</h4>
                <p className="text-green-100 text-sm">Accessible depuis n'importe quel navigateur, sans téléchargement</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="font-bold text-lg mb-2">Sur Mesure</h4>
                <p className="text-green-100 text-sm">Solutions personnalisées adaptées à votre activité</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h4 className="font-bold text-lg mb-2">Support Inclus</h4>
                <p className="text-green-100 text-sm">Maintenance et support technique après livraison</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Qui en profite, et pour quoi faire ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des profils différents, les mêmes types de situations — transcrire, créer, organiser, partager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {useCase.category}
                </h3>
                <ul className="space-y-4">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-10">
            Prêt à Commencer ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing2"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Voir nos Offres
            </Link>
            <Link
              href="/signup"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Créer un Compte Gratuit
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Animations personnalisées pour la bannière marketing */
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
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up-delayed {
          0% { opacity: 0; transform: translateY(30px); }
          50% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
          50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(34, 197, 94, 0.4); }
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
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in-up-delayed {
          animation: fade-in-up-delayed 1.5s ease-out;
        }
        
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

