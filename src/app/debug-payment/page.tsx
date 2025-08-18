'use client';

import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

export default function DebugPaymentPage() {
  const session = useSession();
  const [userEmail, setUserEmail] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceActivating, setForceActivating] = useState(false);

  const debugPayment = async () => {
    if (!userEmail) {
      alert('Veuillez entrer un email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          moduleId: moduleId || undefined
        }),
      });

      const result = await response.json();
      setDebugResult(result);
    } catch (error) {
      console.error('Erreur debug:', error);
      setDebugResult({ error: 'Erreur lors du debug' });
    } finally {
      setLoading(false);
    }
  };

  const forceActivateModule = async () => {
    if (!userEmail || !moduleId || !moduleTitle) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setForceActivating(true);
    try {
      const response = await fetch('/api/force-activate-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          moduleId,
          moduleTitle
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Module activé avec succès !');
        // Refaire le debug pour voir les changements
        await debugPayment();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur force activation:', error);
      alert('Erreur lors de l\'activation forcée');
    } finally {
      setForceActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Paiement</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Vérification Paiement</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email utilisateur
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Module (optionnel)
              </label>
              <input
                type="text"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du Module (pour force activation)
              </label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="RuinedFooocus"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={debugPayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Vérification...' : 'Vérifier le paiement'}
              </button>
              
              <button
                onClick={forceActivateModule}
                disabled={forceActivating || !userEmail || !moduleId || !moduleTitle}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {forceActivating ? 'Activation...' : '🔧 Force Activation'}
              </button>
            </div>
          </div>
        </div>

        {debugResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats</h2>
            
            {debugResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">❌ {debugResult.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Résumé</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Paiements</p>
                      <p className="text-lg font-bold text-blue-900">{debugResult.summary.totalPayments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Applications</p>
                      <p className="text-lg font-bold text-blue-900">{debugResult.summary.totalApplications}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Tokens</p>
                      <p className="text-lg font-bold text-blue-900">{debugResult.summary.totalTokens}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Accès spécifique</p>
                      <p className="text-lg font-bold text-blue-900">
                        {debugResult.summary.hasSpecificAccess ? '✅ OUI' : '❌ NON'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Utilisateur */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">👤 Utilisateur</h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p><strong>ID:</strong> {debugResult.user.id}</p>
                    <p><strong>Email:</strong> {debugResult.user.email}</p>
                  </div>
                </div>

                {/* Paiements */}
                {debugResult.payments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">💳 Paiements</h3>
                    <div className="space-y-2">
                      {debugResult.payments.map((payment: any, index: number) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p><strong>Session ID:</strong> {payment.session_id}</p>
                          <p><strong>Montant:</strong> {payment.amount} {payment.currency}</p>
                          <p><strong>Module ID:</strong> {payment.module_id}</p>
                          <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications utilisateur */}
                {debugResult.userApplications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📱 Applications Utilisateur</h3>
                    <div className="space-y-2">
                      {debugResult.userApplications.map((app: any, index: number) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <p><strong>ID:</strong> {app.id}</p>
                          <p><strong>Module ID:</strong> {app.module_id}</p>
                          <p><strong>Titre:</strong> {app.module_title}</p>
                          <p><strong>Niveau:</strong> {app.access_level}</p>
                          <p><strong>Expire:</strong> {new Date(app.expires_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tokens d'accès */}
                {debugResult.accessTokens.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🔑 Tokens d'Accès</h3>
                    <div className="space-y-2">
                      {debugResult.accessTokens.map((token: any, index: number) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-md p-3">
                          <p><strong>ID:</strong> {token.id}</p>
                          <p><strong>Nom:</strong> {token.name}</p>
                          <p><strong>Module:</strong> {token.module_name}</p>
                          <p><strong>Usage:</strong> {token.current_usage}/{token.max_usage}</p>
                          <p><strong>Expire:</strong> {new Date(token.expires_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accès spécifique */}
                {debugResult.specificAccess && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🎯 Accès Spécifique au Module</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p><strong>ID:</strong> {debugResult.specificAccess.id}</p>
                      <p><strong>Module ID:</strong> {debugResult.specificAccess.module_id}</p>
                      <p><strong>Titre:</strong> {debugResult.specificAccess.module_title}</p>
                      <p><strong>Niveau:</strong> {debugResult.specificAccess.access_level}</p>
                      <p><strong>Actif:</strong> {debugResult.specificAccess.is_active ? 'OUI' : 'NON'}</p>
                      <p><strong>Expire:</strong> {new Date(debugResult.specificAccess.expires_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
