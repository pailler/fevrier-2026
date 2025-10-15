export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              À propos d'IA Home
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre mission et notre vision pour démocratiser l'intelligence artificielle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-gray-600 mb-4">
                IA Home a pour mission de rendre l'intelligence artificielle accessible à tous. 
                Nous croyons que l'IA ne doit pas être réservée aux experts, mais doit être 
                un outil que chacun peut utiliser et comprendre.
              </p>
              <p className="text-gray-600">
                Notre plateforme propose des formations interactives, des outils pratiques 
                et un accompagnement personnalisé pour vous aider à maîtriser l'IA.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Vision</h2>
              <p className="text-gray-600 mb-4">
                Nous envisageons un monde où l'intelligence artificielle est intégrée 
                naturellement dans notre quotidien, où chacun peut créer, innover et 
                résoudre des problèmes complexes grâce à l'IA.
              </p>
              <p className="text-gray-600">
                Notre objectif est de former la prochaine génération d'utilisateurs 
                d'IA et de contribuer à l'évolution technologique de notre société.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Nos Valeurs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🎓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Formation</h3>
                <p className="text-gray-600">
                  Des cours adaptés à tous les niveaux, du débutant à l'expert
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🛠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outils</h3>
                <p className="text-gray-600">
                  Des applications IA pratiques et faciles à utiliser
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communauté</h3>
                <p className="text-gray-600">
                  Un environnement d'entraide et de partage de connaissances
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Rejoignez-nous
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Que vous soyez débutant ou expert, IA Home vous accompagne dans votre 
              apprentissage de l'intelligence artificielle. Découvrez nos formations 
              et commencez votre parcours IA dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/formation" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Découvrir nos formations
              </a>
              <a 
                href="/applications" 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Voir nos applications
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

