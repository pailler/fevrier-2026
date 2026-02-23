'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function ReactivateQRCodesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/check-qrcodes-status');
      const data = await response.json();
      setStatus(data);
      setMessage('');
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const reactivate = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await fetch('/api/check-qrcodes-status', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ ' + data.message);
        await checkStatus(); // Rafraîchir le statut
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setMessage('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors de la restauration d\'accès');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            restauration d'accès QR Codes Dynamiques
          </h1>

          {status && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">État actuel:</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Existe:</span>{' '}
                  {status.exists ? '✅ Oui' : '❌ Non'}
                </div>
                <div>
                  <span className="font-medium">Actif:</span>{' '}
                  {status.is_active ? '✅ Oui' : '❌ Non'}
                </div>
                <div>
                  <span className="font-medium">Expiré:</span>{' '}
                  {status.is_expired ? '❌ Oui' : '✅ Non'}
                </div>
                {status.data && (
                  <>
                    <div>
                      <span className="font-medium">Date d'expiration:</span>{' '}
                      {status.data.expires_at ? new Date(status.data.expires_at).toLocaleString('fr-FR') : 'Aucune'}
                    </div>
                    <div>
                      <span className="font-medium">Utilisation:</span>{' '}
                      {status.data.usage_count || 0} / {status.data.max_usage || '∞'}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Vérifier le statut'}
            </button>
            
            {(status?.needs_reactivation || !status?.exists) && (
              <button
                onClick={reactivate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'restauration d\'accès...' : 'restaurer l\'accès QR Codes'}
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => router.push('/account')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Retour à /account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}









