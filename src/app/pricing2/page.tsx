'use client';
import Link from 'next/link';
import StripeButton2 from '../../components/StripeButton2';

export default function Pricing2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section avec bannière animée */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-blue-600 text-white py-20 pt-24">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          {/* Particules flottantes avec animations variées */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-green-400/35 rounded-full animate-float-fast"></div>
          <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-blue-500/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow-600/25 rounded-full animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-600/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-green-700/20 rounded-full animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/5 w-2 h-2 bg-emerald-700/25 rounded-full animate-float-fast"></div>
          
          {/* Formes géométriques flottantes */}
          <div className="absolute top-16 left-1/2 w-4 h-4 bg-yellow-300/20 transform rotate-45 animate-rotate-slow"></div>
          <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-green-300/25 transform rotate-12 animate-rotate-fast"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-blue-400/30 transform rotate-45 animate-rotate-medium"></div>
          
          {/* Ondes de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-text-glow">
              Nos Offres IA Home
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-6 animate-fade-in-up-delayed">
              Tous nos outils sont accessibles directement depuis votre navigateur, sans téléchargement.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-6 max-w-4xl mx-auto animate-fade-in-up-delayed">
              <h2 className="text-2xl font-bold text-white mb-3">
                💡 Pourquoi Choisir IA Home ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">12+ Outils IA</div>
                    <div className="text-sm text-green-100">Une plateforme complète, sans téléchargement</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">Accès Complet</div>
                    <div className="text-sm text-green-100">Toutes les applications incluses</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">Support Inclus</div>
                    <div className="text-sm text-green-100">Assistance client dédiée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Abonnement */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Abonnement (Recommandé)
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Accès complet à toutes les applications avec tokens mensuels récurrents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
              {/* Abonnement Mensuel */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    🔥 Le plus populaire
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter Mensuel</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">9,90€</div>
                  <div className="text-sm text-gray-500 mb-1">par mois</div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Support <strong>standard</strong> inclus</span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="subscription_monthly"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  S'abonner
                </StripeButton2>
              </div>

              {/* Abonnement Annuel */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    💰 Meilleur rapport
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter Annuel</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">99,00€</div>
                  <div className="text-sm text-gray-500 mb-1">par an</div>
                  <div className="mt-2 bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Économisez 19,80€ (2 mois gratuits)
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes/mois</strong> × 12 mois</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples/mois</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Support <strong>standard</strong> inclus</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600"><strong>2 mois gratuits</strong> = 10 mois payés</span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="subscription_yearly"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  S'abonner
                </StripeButton2>
              </div>
            </div>
          </div>

          {/* Section Achat Unique */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🪙 Achat Unique (Sans engagement)
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Pour ceux qui préfèrent l'achat ponctuel sans abonnement.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              {/* Pack Standard */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gray-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    💡 Achat unique
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Standard</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">19,80€</div>
                  <div className="text-sm text-gray-500 mb-2">Idéal pour tester toutes les applications sans engagement</div>
                  <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                    💡 Économisez 50% avec l'abonnement
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600"><strong>Sans engagement</strong></span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="pack_standard"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton2>
              </div>
            </div>
          </div>

          {/* Exemples d'utilisation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              💡 Exemples d'utilisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-blue-600 mb-2">Applications IA complètes</div>
                <div className="text-gray-600 space-y-1">
                  <div>• Génération d'images (StableDiffusion, ComfyUI)</div>
                  <div>• Transcription audio/vidéo (Whisper)</div>
                  <div>• Génération 3D (Hunyuan3D)</div>
                  <div>• Isolation vocale</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-blue-600 mb-2">Actions simples</div>
                <div className="text-gray-600 space-y-1">
                  <div>• Résumés et reformulations</div>
                  <div>• Traitement PDF</div>
                  <div>• QR codes dynamiques</div>
                  <div>• Téléchargements YouTube (MeTube)</div>
                  <div>• Partage de fichiers (PsiTransfer)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations importantes */}
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
                  <li>• Résiliation possible à tout moment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Animations personnalisées pour la bannière pricing */
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
