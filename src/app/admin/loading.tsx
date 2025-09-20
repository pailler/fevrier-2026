export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a className="text-xl font-bold text-gray-900" href="/admin/dashboard">
                  🏠 Admin Panel
                </a>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" href="/admin/dashboard">
                  <span className="mr-2">📊</span>Tableau de bord
                </a>
                <a className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" href="/admin">
                  <span className="mr-2">⚙️</span>Gestion
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <a className="text-sm text-gray-500 hover:text-gray-700" href="/">
                ← Retour au site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de chargement */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement de l'interface admin...
          </h2>
          
          <p className="text-gray-600 mb-4">
            Veuillez patienter pendant le chargement des données d'administration.
          </p>

          {/* Barre de progression animée */}
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>

          {/* Indicateurs de chargement */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Message d'aide */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Si le chargement prend plus de 30 secondes,</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              cliquez ici pour recharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

