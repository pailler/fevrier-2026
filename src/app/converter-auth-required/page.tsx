import Link from 'next/link';

export default function ConverterAuthRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Convertisseur Universel
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Bannière d'erreur d'authentification */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentification requise
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Vous devez être connecté à IAHome.fr pour accéder à ce service.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bannière d'information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Service intégré
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Ce service est intégré à IAHome.fr et nécessite une authentification centralisée.</p>
                  <p className="mt-1">
                    Veuillez accéder au service via{' '}
                    <Link href="https://www.iahome.fr" className="font-medium text-blue-600 hover:text-blue-500">
                      IAHome.fr
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'accès */}
          <div className="text-center">
            <Link
              href="https://www.iahome.fr"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à IAHome.fr
            </Link>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Si vous avez un token d'accès valide, veuillez l'utiliser via l'interface IAHome.fr
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
