import Link from 'next/link';

export default function AdminNotFound() {
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

      {/* Contenu 404 */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Admin Non Trouvée
          </h1>
          
          <p className="text-gray-600 mb-6">
            La page d'administration que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Suggestions de navigation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Pages d'administration disponibles :
            </h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div>• <Link href="/admin/dashboard" className="hover:underline">Tableau de bord</Link></div>
              <div>• <Link href="/admin/notifications" className="hover:underline">Gestion des notifications</Link></div>
              <div>• <Link href="/admin" className="hover:underline">Gestion générale</Link></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/admin/dashboard"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📊 Tableau de bord
            </Link>
            
            <Link
              href="/admin"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ⚙️ Gestion générale
            </Link>
            
            <Link
              href="/"
              className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🏠 Retour au site
            </Link>
          </div>

          {/* Recherche dans l'admin */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rechercher dans l'admin</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une page..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query) {
                      window.location.href = `/admin?search=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  const query = input.value;
                  if (query) {
                    window.location.href = `/admin?search=${encodeURIComponent(query)}`;
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





















