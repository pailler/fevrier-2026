'use client';

import { useState } from 'react';
import { NotificationServiceClient } from '../utils/notificationServiceClient';

export default function NotificationTest() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const testNotification = async () => {
    if (!email) {
      setResult('Veuillez entrer un email');
      return;
    }

    try {
      const notificationService = NotificationServiceClient.getInstance();
      const success = await notificationService.sendNotification('user_created', email, {
        userName: 'Utilisateur de test',
        timestamp: new Date().toISOString()
      });

      if (success) {
        setResult('✅ Notification envoyée avec succès !');
      } else {
        setResult('❌ Erreur lors de l\'envoi de la notification');
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🔔 Test Notifications</h2>
      
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

        <button
          onClick={testNotification}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tester Notification
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Ce test vérifie que le service de notifications fonctionne correctement.
          Si ce test fonctionne, l'onglet admin devrait aussi fonctionner.
        </p>
      </div>
    </div>
  );
}
