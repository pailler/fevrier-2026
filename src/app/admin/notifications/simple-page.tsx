'use client';

import { useState, useEffect } from 'react';

export default function SimpleNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  console.log('🔍 SimpleNotificationsPage rendu, loading:', loading);

  useEffect(() => {
    console.log('🔍 useEffect déclenché');
    // Simuler un chargement
    setTimeout(() => {
      console.log('🔍 Chargement terminé');
      setLoading(false);
    }, 2000);
  }, []);

  const testEmailNotification = async () => {
    if (!testEmail) {
      setTestResult({ error: 'Veuillez saisir un email' });
      return;
    }

    try {
      setTestResult({ loading: true });
      
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          appName: 'Test Admin',
          userName: 'Admin Test'
        }),
      });

      const result = await response.json();
      setTestResult(result);
      
    } catch (error) {
      setTestResult({ error: 'Erreur lors du test' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement simple...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Simple Notifications</h1>
          <p className="text-gray-600 mt-2">Version simplifiée pour tester</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test d'envoi d'email</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de test
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={testEmailNotification}
              disabled={!testEmail || testResult?.loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testResult?.loading ? 'Envoi...' : 'Envoyer un test'}
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 p-4 rounded-md ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">
                {testResult.success ? '✅ Succès' : '❌ Erreur'}
              </p>
              <p className="text-sm mt-1">{testResult.message || testResult.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






