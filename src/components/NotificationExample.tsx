'use client';

import { useNotifications } from '../utils/useNotifications';
import { useState } from 'react';

export default function NotificationExample() {
  const { notifyUserCreated, notifyUserLogin, notifyModuleActivated, notifyUserLogout } = useNotifications();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [moduleName, setModuleName] = useState('');

  const handleTestUserCreated = async () => {
    if (!email) {
      alert('Veuillez entrer un email');
      return;
    }
    await notifyUserCreated(email, userName || 'Utilisateur de test');
    alert('Notification de création d\'utilisateur envoyée');
  };

  const handleTestUserLogin = async () => {
    if (!email) {
      alert('Veuillez entrer un email');
      return;
    }
    await notifyUserLogin(email, userName || 'Utilisateur de test');
    alert('Notification de connexion envoyée');
  };

  const handleTestModuleActivated = async () => {
    if (!email || !moduleName) {
      alert('Veuillez entrer un email et un nom de module');
      return;
    }
    await notifyModuleActivated(email, moduleName, userName || 'Utilisateur de test');
    alert('Notification d\'activation de module envoyée');
  };

  const handleTestUserLogout = async () => {
    if (!email) {
      alert('Veuillez entrer un email');
      return;
    }
    await notifyUserLogout(email, userName || 'Utilisateur de test');
    alert('Notification de déconnexion envoyée');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🔔 Test des Notifications</h2>
      <p className="text-gray-600 mb-6">Testez les différents types de notifications</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de test
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="test@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur (optionnel)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom d'utilisateur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du module (pour activation)
          </label>
          <input
            type="text"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom du module"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleTestUserCreated}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Test Création d'utilisateur
          </button>

          <button
            onClick={handleTestUserLogin}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Connexion
          </button>

          <button
            onClick={handleTestModuleActivated}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Test Activation Module
          </button>

          <button
            onClick={handleTestUserLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Test Déconnexion
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions :</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Entrez un email valide pour recevoir les notifications</li>
          <li>• Les notifications seront envoyées via Resend</li>
          <li>• Vérifiez les logs dans l'onglet admin "Notifications"</li>
          <li>• Assurez-vous que Resend est configuré dans les variables d'environnement</li>
        </ul>
      </div>
    </div>
  );
}
