'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { subdomainsConfig } from '../../utils/subdomainsConfig';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';

export default function MarketingPage() {
  useEffect(() => {
    document.title = 'IA Home - Découvrez la Puissance de l\'IA | Plateforme Complète';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'IA Home : La plateforme française complète d\'intelligence artificielle. Outils IA professionnels, formations, et services de productivité. Rejoignez des milliers d\'utilisateurs qui font confiance à IA Home.');
    }
  }, []);

  const benefits = [
    {
      icon: '🚀',
      title: 'Accès Immédiat',
      description: 'Aucun téléchargement, aucune installation. Tous nos outils sont des web-services accessibles directement depuis votre navigateur. Il suffit d\'un navigateur pour les utiliser !'
    },
    {
      icon: '💰',
      title: 'Offres Transparentes',
      description: 'Système de tokens dégressif. Plus vous achetez, plus vous économisez. À partir de 4,99€.'
    },
    {
      icon: '🔒',
      title: 'Sécurité Maximale',
      description: 'Paiements sécurisés Stripe, données chiffrées, conformité RGPD. Vos données sont protégées.'
    },
    {
      icon: '⚡',
      title: 'Performance Optimale',
      description: 'Infrastructure cloud haute performance. Traitement rapide et résultats de qualité professionnelle.'
    },
    {
      icon: '🌍',
      title: '100% Français',
      description: 'Plateforme française, support en français, conformité RGPD. Une solution de confiance.'
    },
    {
      icon: '🎁',
      title: '200 tokens offerts',
      description: '200 tokens offerts pour tout nouvel utilisateur. Commencez à utiliser nos services immédiatement sans dépenser un centime.'
    }
  ];

  const useCases = [
    {
      category: 'Professionnels',
      examples: [
        'Transcrire vos réunions automatiquement',
        'Générer des visuels pour vos présentations',
        'Traiter vos documents PDF en masse',
        'Créer des QR codes pour vos campagnes'
      ]
    },
    {
      category: 'Créateurs de Contenu',
      examples: [
        'Créer des sous-titres pour vos vidéos',
        'Générer des images pour vos articles',
        'Télécharger et convertir des vidéos',
        'Automatiser vos workflows créatifs'
      ]
    },
    {
      category: 'Entreprises',
      examples: [
        'Automatiser vos comptes-rendus de réunion',
        'Traiter des documents en masse',
        'Créer des workflows IA personnalisés',
        'Optimiser votre productivité'
      ]
    }
  ];

  const stats = [
    { number: 'nos', label: 'Outils IA Disponibles' },
    { number: '100%', label: 'Satisfaction Client' },
    { number: '24/7', label: 'Disponibilité' },
    { number: 'RGPD', label: 'Conforme' }
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
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight animate-text-glow">
              La Plateforme IA Complète
              <br />
              <span className="text-yellow-300">Pour Tous Vos Besoins</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in-up-delayed">
              En plus des applis essentielles pour vos usages numériques courants, découvrez nos outils d'intelligence artificielle professionnels. 
              Transcription, génération d'images, traitement de documents et bien plus.
              <br />
              <span className="text-yellow-200 font-semibold">Tous nos services sont accessibles directement depuis votre navigateur, sans téléchargement ni installation.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed">
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
              Pourquoi Choisir IA Home ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète, sécurisée et accessible pour tous vos besoins en intelligence artificielle
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
                "IA Home a révolutionné mon travail ! J'utilise Whisper pour transcrire mes réunions et j'économise des heures chaque semaine. La qualité de transcription est excellente et les tarifs sont vraiment compétitifs."
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
                "En tant que créateur de contenu, j'utilise Stable Diffusion et ComfyUI quotidiennement. La plateforme est intuitive, rapide et les résultats sont de qualité professionnelle. Je recommande vivement !"
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
                "J'ai testé plusieurs solutions IA et IA Home est de loin la meilleure. Les outils PDF sont parfaits pour traiter mes documents, et le système de tokens est très flexible. Je ne peux plus m'en passer !"
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
                "La plateforme est vraiment complète ! J'utilise les QR codes pour mes campagnes marketing, Whisper pour mes podcasts, et Stable Diffusion pour mes visuels. Tout en un seul endroit, c'est parfait !"
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
                "En tant que développeur, j'apprécie particulièrement ComfyUI pour créer des workflows automatisés. La documentation est claire, la communauté est active, et les mises à jour sont régulières. Excellent rapport qualité-prix !"
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
              Nos Services Populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos outils les plus utilisés par des milliers d'utilisateurs. Tous accessibles directement depuis votre navigateur, sans téléchargement ni installation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subdomainsConfig.slice(0, 6).map((service, index) => (
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

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 mb-6 font-semibold">
              Vous avez un projet spécifique ? Discutons-en ensemble !
            </p>
            <Link
              href="/contact"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              📧 Demander un Devis Gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cas d'Usage Populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment nos utilisateurs utilisent IA Home au quotidien
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'utilisateurs qui font confiance à IA Home pour leurs besoins en IA.
            <br />
            Commencez dès aujourd'hui à partir de 4,99€.
          </p>
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

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi Nous Faire Confiance ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">Sécurisé</h3>
              <p className="text-sm text-gray-600">Paiements Stripe, données chiffrées</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Rapide</h3>
              <p className="text-sm text-gray-600">Infrastructure cloud optimisée</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-bold text-gray-900 mb-2">Français</h3>
              <p className="text-sm text-gray-600">Plateforme et support en français</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600">Assistance client réactive</p>
            </div>
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

