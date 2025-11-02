import Link from 'next/link';
import StripeButton from '../../components/StripeButton';

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
              Système de tokens dégressif : plus vous achetez, plus vous économisez par token
            </p>
          </div>

          {/* Section Tokens */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🪙 Packages de Tokens
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Achetez des tokens pour utiliser nos applications IA. Plus vous en achetez, plus vous économisez !
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Pack Basique */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Basique</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">4,99€</div>
                  <p className="text-sm text-gray-600">100 tokens</p>
                  <p className="text-xs text-gray-500">0,049€ par token</p>
                  
                  {/* Dates de début et fin */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="mb-1">
                        <span className="font-medium">Début :</span> Immédiat
                      </div>
                      <div>
                        <span className="font-medium">Fin :</span> 3 mois après activation
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Idéal pour débuter</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">2 utilisations IA (200 tokens)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">10 utilisations Applis essentielles</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">3 mois d'utilisation</span>
                  </li>
                </ul>
                <StripeButton 
                  packageType="basic"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton>
              </div>

              {/* Pack Standard */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Populaire
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Standard</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">19,99€</div>
                  <p className="text-sm text-gray-600">1000 tokens</p>
                  <p className="text-xs text-gray-500">0,020€ par token</p>
                  <p className="text-xs text-green-600 font-medium">59% d'économie</p>
                  
                  {/* Dates de début et fin */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="mb-1">
                        <span className="font-medium">Début :</span> Immédiat
                      </div>
                      <div>
                        <span className="font-medium">Fin :</span> 3 mois après activation
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Le plus populaire</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">10 utilisations IA</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">100 utilisations Applis essentielles</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">3 mois d'utilisation</span>
                  </li>
                </ul>
                <StripeButton 
                  packageType="standard"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton>
              </div>

              {/* Pack Premium */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Premium</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">49,9€</div>
                  <p className="text-sm text-gray-600">3000 tokens</p>
                  <p className="text-xs text-gray-500">0,017€ par token</p>
                  <p className="text-xs text-green-600 font-medium">65% d'économie</p>
                  
                  {/* Dates de début et fin */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="mb-1">
                        <span className="font-medium">Début :</span> Immédiat
                      </div>
                      <div>
                        <span className="font-medium">Fin :</span> 3 mois après activation
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Pour utilisateurs intensifs</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">30 utilisations IA</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">300 utilisations Applis essentielles</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">3 mois d'utilisation</span>
                  </li>
                </ul>
                <StripeButton 
                  packageType="premium"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton>
              </div>

              {/* Pack Entreprise */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Entreprise</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">199€</div>
                  <p className="text-sm text-gray-600">20000 tokens</p>
                  <p className="text-xs text-gray-500">0,010€ par token</p>
                  <p className="text-xs text-green-600 font-medium">80% d'économie</p>
                  
                  {/* Dates de début et fin */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="mb-1">
                        <span className="font-medium">Début :</span> Immédiat
                      </div>
                      <div>
                        <span className="font-medium">Fin :</span> 3 mois après activation
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Pour les équipes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">200 utilisations IA</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">2000 utilisations Applis essentielles</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">3 mois d'utilisation</span>
                  </li>
                </ul>
                <StripeButton 
                  packageType="enterprise"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton>
              </div>
            </div>

            {/* Coûts par application */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                💰 Coûts par application
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-blue-600 mb-1">100 tokens</div>
                  <div className="text-gray-600">Applications IA</div>
                  <div className="text-gray-600">(StableDiffusion, ComfyUI, etc.)</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-blue-600 mb-1">10 tokens</div>
                  <div className="text-gray-600">Applis essentielles</div>
                  <div className="text-gray-600">(MeTube, PDF+, LibreSpeed, etc.)</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-blue-600 mb-1">10 tokens</div>
                  <div className="text-gray-600">QR Codes</div>
                  <div className="text-gray-600">PsiTransfer</div>
                </div>
              </div>
            </div>

            {/* Comparaison des tarifs */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                📊 Comparaison des tarifs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-gray-700 mb-1">Basique</div>
                  <div className="text-gray-600">Prix de référence</div>
                  <div className="text-blue-600 font-semibold">0,049€/token</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-gray-700 mb-1">Standard</div>
                  <div className="text-green-600 font-semibold">59% d'économie</div>
                  <div className="text-blue-600 font-semibold">0,020€/token</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-gray-700 mb-1">Premium</div>
                  <div className="text-green-600 font-semibold">65% d'économie</div>
                  <div className="text-blue-600 font-semibold">0,017€/token</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-gray-700 mb-1">Entreprise</div>
                  <div className="text-green-600 font-semibold">80% d'économie</div>
                  <div className="text-blue-600 font-semibold">0,010€/token</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ℹ️ Informations importantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Sécurité</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Paiements sécurisés par Stripe</li>
                  <li>• Aucune donnée bancaire stockée</li>
                  <li>• Conformité PCI DSS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Utilisation</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tokens crédités instantanément</li>
                  <li>• Support client inclus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}