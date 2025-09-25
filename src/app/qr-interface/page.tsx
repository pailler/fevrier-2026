'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface QRCode {
  qr_id: string;
  name: string;
  url: string;
  qr_url: string;
  created_at: string;
  size: number;
  margin: number;
  error_correction: string;
  foreground_color: string;
  background_color: string;
}

export default function QRInterfacePage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    size: 300,
    margin: 4,
    errorCorrection: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF'
  });

  useEffect(() => {
    const getSession = async () => {
      // Vérifier d'abord si on a une session QR codes dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const qrSessionId = urlParams.get('session');
      
      if (qrSessionId) {
        // Valider la session QR codes
        try {
          const response = await fetch(`/api/qr-session?sessionId=${qrSessionId}`);
          if (response.ok) {
            const sessionData = await response.json();
            console.log('✅ QR Session validée:', sessionData);
            
            // Récupérer les informations utilisateur depuis la session
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            setUser(currentSession?.user || null);
            setLoading(false);
            return;
          } else {
            console.log('❌ QR Session invalide, redirection vers login');
            window.location.href = '/login?redirect=/qr-interface';
            return;
          }
        } catch (error) {
          console.error('❌ Erreur validation QR session:', error);
          window.location.href = '/login?redirect=/qr-interface';
          return;
        }
      }

      // Si pas de session QR codes, vérifier la session normale
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadQRCodes();
    }
  }, [session]);

  const loadQRCodes = async () => {
    try {
      // Récupérer le token de session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session non trouvée');
        return;
      }

      const response = await fetch('/api/qr-proxy/dynamic/qr', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.qr_codes) {
          setQrCodes(data.qr_codes);
        }
      } else {
        console.error('Erreur API:', response.status, response.statusText);
        setError('Erreur lors du chargement des QR codes');
      }
    } catch (error) {
      console.error('Erreur chargement QR codes:', error);
      setError('Erreur de connexion');
    }
  };

  const createQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      // Récupérer le token de session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session non trouvée');
        return;
      }

      const response = await fetch('/api/qr-proxy/dynamic/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('QR Code créé avec succès !');
        setFormData({
          name: '',
          url: '',
          size: 300,
          margin: 4,
          errorCorrection: 'M',
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF'
        });
        loadQRCodes(); // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la création du QR Code');
      }
    } catch (error) {
      console.error('Erreur création QR Code:', error);
      setError('Erreur lors de la création du QR Code');
    } finally {
      setCreating(false);
    }
  };

  const deleteQRCode = async (qrId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce QR Code ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/qr-proxy/dynamic/qr/${qrId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('QR Code supprimé avec succès !');
        loadQRCodes(); // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression QR Code:', error);
      setError('Erreur lors de la suppression du QR Code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
            Accès Refusé
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Générateur de QR Codes
          </h1>
          <p className="text-gray-600">
            Créez et gérez vos QR codes dynamiques de manière sécurisée.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Connecté en tant que : {user?.email}
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de création */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Créer un nouveau QR Code
            </h2>
            
            <form onSubmit={createQRCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du QR Code
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de destination
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taille
                  </label>
                  <input
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="100"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marge
                  </label>
                  <input
                    type="number"
                    value={formData.margin}
                    onChange={(e) => setFormData({...formData, margin: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur de premier plan
                  </label>
                  <input
                    type="color"
                    value={formData.foregroundColor}
                    onChange={(e) => setFormData({...formData, foregroundColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur d'arrière-plan
                  </label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creating ? 'Création...' : 'Créer le QR Code'}
              </button>
            </form>
          </div>

          {/* Liste des QR Codes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Vos QR Codes ({qrCodes.length})
            </h2>
            
            {qrCodes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun QR Code créé pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {qrCodes.map((qrCode) => (
                  <div key={qrCode.qr_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{qrCode.name}</h3>
                      <button
                        onClick={() => deleteQRCode(qrCode.qr_id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {qrCode.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      Créé le {new Date(qrCode.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="mt-2">
                      <a
                        href={qrCode.qr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Voir le QR Code →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
