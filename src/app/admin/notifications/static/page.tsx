export default function StaticNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notifications</h1>
          <p className="text-gray-600 mt-2">Configurez et testez le système de notifications par email</p>
        </div>

        {/* Test Email Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test d'envoi d'email</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de test
              </label>
              <input
                type="email"
                id="testEmail"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'application
              </label>
              <input
                type="text"
                id="testAppName"
                value="Application Test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Application Test"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="testUserName"
                value="Utilisateur Test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Utilisateur Test"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={async () => {
                const email = (document.getElementById('testEmail') as HTMLInputElement)?.value;
                const appName = (document.getElementById('testAppName') as HTMLInputElement)?.value;
                const userName = (document.getElementById('testUserName') as HTMLInputElement)?.value;
                
                if (!email) {
                  alert('Veuillez saisir un email');
                  return;
                }

                try {
                  const response = await fetch('/api/test-notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email,
                      appName,
                      userName
                    }),
                  });

                  const result = await response.json();
                  
                  if (result.success) {
                    alert('✅ Email envoyé avec succès !');
                    // Recharger la page pour voir les logs
                    window.location.reload();
                  } else {
                    alert('❌ Erreur: ' + (result.message || result.error));
                  }
                } catch (error) {
                  alert('❌ Erreur lors du test: ' + error);
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Envoyer un test
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres de notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Accès à une application</h3>
                <p className="text-sm text-gray-600">Notification envoyée quand un utilisateur accède à une application</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/notifications', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'toggle',
                          eventType: 'app_accessed',
                          enabled: false
                        }),
                      });

                      const data = await response.json();
                      
                      if (data.success) {
                        alert('Paramètre mis à jour');
                        window.location.reload();
                      } else {
                        alert('Erreur: ' + data.error);
                      }
                    } catch (error) {
                      alert('Erreur: ' + error);
                    }
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
                
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                  Activé
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Connexion utilisateur</h3>
                <p className="text-sm text-gray-600">Notification envoyée quand un utilisateur se connecte</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/notifications', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'toggle',
                          eventType: 'user_login',
                          enabled: false
                        }),
                      });

                      const data = await response.json();
                      
                      if (data.success) {
                        alert('Paramètre mis à jour');
                        window.location.reload();
                      } else {
                        alert('Erreur: ' + data.error);
                      }
                    } catch (error) {
                      alert('Erreur: ' + error);
                    }
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
                
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                  Activé
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Logs récents</h2>
          
          <div className="text-center py-8">
            <p className="text-gray-500">Les logs seront affichés ici après les tests d'email</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



















