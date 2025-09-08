import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [publicUrls, setPublicUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Fonction utilitaire pour s'assurer que les URLs sont complètes
  const getApiUrl = (endpoint) => {
    // Forcer l'utilisation de l'URL complète du backend
    const apiUrl = 'http://localhost:7001';
    // S'assurer que l'endpoint commence par /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${apiUrl}${cleanEndpoint}`;
  };

  // Charger les URLs publiques au démarrage
  useEffect(() => {
    loadPublicUrls();
    // Vérifier s'il y a une session en localStorage
    const savedSessionId = localStorage.getItem('qrlink_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      validateSession(savedSessionId);
    }
  }, []);

  const loadPublicUrls = async () => {
    try {
      const apiUrl = getApiUrl('/api/urls/public');
      console.log('🔍 Chargement URLs publiques depuis:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ URLs chargées:', data.shortUrls?.length || 0);
        setPublicUrls(data.shortUrls || []);
      } else {
        console.error('❌ Erreur API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const createSession = async () => {
    setSessionLoading(true);
    setError('');
    
    try {
      const response = await fetch(getApiUrl('/api/sessions/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration_hours: 24
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newSessionId = data.session.session_id;
        setSessionId(newSessionId);
        setSessionInfo(data.session);
        localStorage.setItem('qrlink_session_id', newSessionId);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création de la session');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setSessionLoading(false);
    }
  };

  const validateSession = async (sessionId) => {
    try {
      const response = await fetch(getApiUrl(`/api/sessions/validate/${sessionId}`));
      
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data.session);
        setError('');
      } else {
        // Session invalide, la supprimer
        localStorage.removeItem('qrlink_session_id');
        setSessionId('');
        setSessionInfo(null);
      }
    } catch (error) {
      console.error('Erreur validation session:', error);
      localStorage.removeItem('qrlink_session_id');
      setSessionId('');
      setSessionInfo(null);
    }
  };

  const createShortUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter l'ID de session si disponible
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(getApiUrl('/api/urls'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          original_url: originalUrl,
          title: 'Lien court créé',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShortUrl(`http://localhost:7000/${data.shortUrl.short_code}`);
        setOriginalUrl('');
        // Recharger les URLs publiques
        await loadPublicUrls();
              } else {
          const errorData = await response.json();
          if (response.status === 401) {
            setError('Veuillez créer une session temporaire pour créer un lien court');
          } else {
            setError(errorData.error || 'Erreur lors de la création du lien court');
          }
        }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>QR Link Manager</title>
        <meta name="description" content="Gestionnaire de QR codes et liens courts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            QR Link Manager
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gestion de session */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Session temporaire</h2>
              
              {sessionInfo ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="text-sm font-medium text-green-800">Session active</h3>
                    <p className="text-xs text-green-700 mt-1">
                      ID: {sessionId.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-green-700">
                      Expire le: {new Date(sessionInfo.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('qrlink_session_id');
                      setSessionId('');
                      setSessionInfo(null);
                    }}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Terminer la session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Créez une session temporaire pour pouvoir créer des liens courts sans compte permanent.
                  </p>
                  <button
                    type="button"
                    onClick={createSession}
                    disabled={sessionLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {sessionLoading ? 'Création...' : 'Créer une session temporaire'}
                  </button>
                </div>
              )}
            </div>

            {/* Formulaire de création */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Créer un lien court</h2>
              <form onSubmit={createShortUrl} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    URL originale
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer un lien court'}
                </button>
              </form>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {shortUrl && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800">Lien court créé :</h3>
                  <p className="mt-1 text-sm text-green-700 break-all">{shortUrl}</p>
                </div>
              )}
            </div>

            {/* Liste des URLs publiques */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Liens courts publics</h2>
              
              {loadingUrls ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
              ) : publicUrls.length > 0 ? (
                <div className="space-y-3">
                  {publicUrls.map((url) => (
                    <div key={url.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {url.title || 'Lien court'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {url.original_url}
                          </p>
                                                     <p className="text-xs text-blue-600 mt-1">
                             http://localhost:7000/{url.short_code}
                           </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {url.total_clicks || 0} clics
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun lien court public pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
