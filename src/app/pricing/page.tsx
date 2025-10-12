import Footer from '../../components/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs IA Home
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins et commencez votre parcours IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Plan Gratuit */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">0€</div>
                <p className="text-gray-600">Parfait pour débuter</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Accès aux formations de base</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">3 générations IA par jour</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Support communautaire</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Accès aux outils de base</span>
                </li>
              </ul>
              <a 
                href="/signup" 
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Commencer gratuitement
              </a>
            </div>

            {/* Plan Premium */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Populaire
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">19€</div>
                <p className="text-gray-600">Par mois</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Toutes les formations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">100 générations IA par mois</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Support prioritaire</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Tous les outils IA</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Certificats de formation</span>
                </li>
              </ul>
              <a 
                href="/signup" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Choisir Premium
              </a>
            </div>

            {/* Plan Pro */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">49€</div>
                <p className="text-gray-600">Par mois</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Formations + mentorat</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Générations IA illimitées</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Support dédié</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">API personnalisée</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Accès aux versions beta</span>
                </li>
              </ul>
              <a 
                href="/contact" 
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions sur nos tarifs ?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider à choisir le plan qui vous convient le mieux.
            </p>
            <a 
              href="/contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


