'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { subdomainsConfig } from '../../utils/subdomainsConfig';
import EcosystemValueBlock from '../../components/marketing/EcosystemValueBlock';
import GpuInfrastructureBlock from '../../components/marketing/GpuInfrastructureBlock';
import FrenchTrustBlock from '../../components/marketing/FrenchTrustBlock';
import { getValueProposition } from '../../data/ecosystemValueProposition';

export default function AvantagesPage() {
  useEffect(() => {
    const vp = getValueProposition('marketing');
    document.title = 'Avantages IAHome — Pourquoi choisir notre écosystème IA';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', vp.oneLiner);
    }
  }, []);

  const competitiveAdvantages = [
    {
      title: 'vs Solutions Cloud Génériques',
      advantages: [
        'Infrastructure GPU NVIDIA dédiée — pas un revendeur d’API opaque',
        'Pas de limite cachée',
        'Support en français',
        'Conformité RGPD garantie'
      ]
    },
    {
      title: 'vs Solutions Locales',
      advantages: [
        'Aucune installation requise',
        'Accès depuis n\'importe où',
        'Mises à jour automatiques',
        'Infrastructure optimisée'
      ]
    },
    {
      title: 'vs Solutions Gratuites',
      advantages: [
        'Qualité professionnelle',
        'Pas de publicité',
        'Support client dédié',
        'Données privées et sécurisées'
      ]
    }
  ];

  const valuePropositions = [
    {
      icon: '🎙️',
      title: 'Synthétiser l’oral',
      description: 'Réunion, cours, podcast : obtenez un texte exploitable sans retranscrire à la main.',
      details: 'Compte rendu structuré en quelques minutes, depuis le PC ou le smartphone',
    },
    {
      icon: '🎨',
      title: 'Produire un visuel',
      description: 'Affiche, illustration, photo stylisée — à partir d’une idée, pas d’un logiciel complexe.',
      details: 'Livrable prêt à publier ou à intégrer dans une présentation',
    },
    {
      icon: '📄',
      title: 'Finaliser un dossier',
      description: 'Fusion, conversion, préparation à l’envoi : le PDF devient simple.',
      details: 'Une seule interface pour les tâches que vous repoussez d’habitude',
    },
    {
      icon: '📱',
      title: 'Agir en déplacement',
      description: 'Même compte, mêmes actions sur smartphone — sans app à installer.',
      details: 'Partager un fichier, générer un QR code ou consulter un résultat où que vous soyez',
    },
    {
      icon: '📚',
      title: 'Apprendre en faisant',
      description: 'Formations et guides pour chaque situation — pas pour chaque moteur technique.',
      details: 'Tutoriels orientés résultat : « je veux transcrire », « je veux créer un visuel »',
    },
    {
      icon: '🇫🇷',
      title: 'Une plateforme de confiance',
      description: 'Français, RGPD, paiements Stripe, support réactif.',
      details: 'Vous savez où vont vos fichiers et combien coûte chaque action',
    },
  ];

  const serviceComparison = [
    {
      service: 'Transcrire une réunion (1 h)',
      iahome: '100 crédits (0,49€ - 1,99€ selon pack)',
      competitors: '5-20€ par fichier',
      savings: 'Économisez jusqu\'à 90%',
    },
    {
      service: 'Créer un visuel professionnel',
      iahome: '100 crédits (0,49€ - 1,99€ selon pack)',
      competitors: '10-50€ par mois',
      savings: 'Payez uniquement ce que vous utilisez',
    },
    {
      service: 'Traiter un lot de PDF',
      iahome: '10 crédits (0,10€ - 0,20€ selon pack)',
      competitors: '15-30€ par mois',
      savings: 'Jusqu\'à 99% d\'économie',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <EcosystemValueBlock
              variant="marketing"
              layout="hero"
              theme="dark"
              showPillars={false}
              showAudiences={false}
              showProof={true}
              className="text-center [&_p]:mx-auto"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Link
                href="/pricing2"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Voir nos Offres
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Essai Gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EcosystemValueBlock variant="marketing" useCasesOnly />

      <GpuInfrastructureBlock variant="marketing" density="compact" showCta={false} />

      <FrenchTrustBlock variant="marketing" density="compact" />

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que vous faites concrètement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque avantage part d’une situation réelle — pas d’une fiche technique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valuePropositions.map((prop, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{prop.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {prop.title}
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {prop.description}
                </p>
                <p className="text-sm text-gray-600 italic">
                  {prop.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              IA Home vs La Concurrence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez pourquoi IA Home est le meilleur choix
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {competitiveAdvantages.map((comparison, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  {comparison.title}
                </h3>
                <ul className="space-y-4">
                  {comparison.advantages.map((advantage, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comparaison des Offres
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Voyez combien vous économisez avec IA Home
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Service</th>
                  <th className="px-6 py-4 text-left font-bold">IA Home</th>
                  <th className="px-6 py-4 text-left font-bold">Concurrence</th>
                  <th className="px-6 py-4 text-left font-bold">Économie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {serviceComparison.map((service, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {service.service}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-semibold">
                      {service.iahome}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {service.competitors}
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-bold">
                      {service.savings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez pourquoi nos clients nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "J'ai comparé plusieurs plateformes IA et IA Home est clairement la meilleure en termes de rapport qualité-prix. Le pack Premium me permet d'économiser énormément par rapport à mes anciens abonnements."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">AB</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alexandre Bouchard</div>
                  <div className="text-sm text-gray-600">Freelance Designer</div>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "La sécurité des données était ma principale préoccupation. Avec IA Home, je suis rassuré : plateforme française, RGPD, paiements Stripe. Je peux travailler en toute sérénité."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">EF</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Émilie Fournier</div>
                  <div className="text-sm text-gray-600">Consultante RH</div>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Le support client est exceptionnel ! Réponse rapide, en français, et toujours de bon conseil. C'est rare de trouver un service aussi professionnel à ce prix."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">NG</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Nicolas Girard</div>
                  <div className="text-sm text-gray-600">Directeur Technique</div>
                </div>
              </div>
            </div>

            {/* Témoignage 4 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "J'utilise IA Home depuis 6 mois et je suis toujours impressionné par la qualité des outils. Les mises à jour régulières montrent que l'équipe est vraiment investie dans le projet."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-bold">VR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Valérie Rousseau</div>
                  <div className="text-sm text-gray-600">Responsable Communication</div>
                </div>
              </div>
            </div>

            {/* Témoignage 5 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-pink-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Le système de crédits est génial ! Je paye uniquement ce que j'utilise, sans engagement. C'est exactement ce que je cherchais. Et avec le pack Standard, j'économise vraiment beaucoup."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-pink-600 font-bold">FD</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">François Durand</div>
                  <div className="text-sm text-gray-600">Photographe Professionnel</div>
                </div>
              </div>
            </div>

            {/* Témoignage 6 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 border-indigo-500">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Notre équipe de 15 personnes utilise le pack Entreprise. C'est parfait pour nous : tous les outils en un seul endroit, tarifs dégressifs, et support dédié. Un investissement qui se rentabilise rapidement !"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold">SC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Stéphane Chen</div>
                  <div className="text-sm text-gray-600">CEO, Startup Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à Économiser ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'utilisateurs satisfaits.
            <br />
            Commencez dès aujourd'hui à partir de 9,90€.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing2"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Voir les Tarifs
            </Link>
            <Link
              href="/signup"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Créer un Compte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

