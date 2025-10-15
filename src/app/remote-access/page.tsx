'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RemoteSession {
  id: string;
  session_id: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'expired';
}

export default function RemoteAccessPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<RemoteSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadSessions();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('remote_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessionsWithStatus = data?.map(session => ({
        ...session,
        status: new Date(session.expires_at) > new Date() ? 'active' : 'expired'
      })) || [];

      setSessions(sessionsWithStatus);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  };

  const generateAccessToken = async () => {
    if (!user) return;

    setGeneratingToken(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/remote-cursor-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.accessToken);
        setConnectionInfo(data.instructions);
        await loadSessions();
      } else {
        alert('Erreur lors de la génération du token: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du token:', error);
      alert('Erreur lors de la génération du token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('remote_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      await loadSessions();
      alert('Session révoquée avec succès');
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      alert('Erreur lors de la révocation de la session');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Requis</h1>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accès Distant à Cursor
          </h1>
          <p className="text-gray-600">
            Gérez vos sessions d'accès distant sécurisées à votre environnement de développement.
          </p>
        </div>

        {/* Token Generation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Générer un nouveau token d'accès
          </h2>
          
          <button
            onClick={generateAccessToken}
            disabled={generatingToken}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generatingToken ? 'Génération...' : 'Générer un token'}
          </button>

          {accessToken && connectionInfo && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Token généré avec succès !</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token d'accès (valide 24h)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={accessToken}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(accessToken)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions de connexion
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">VNC:</span>
                      <button
                        onClick={() => copyToClipboard(connectionInfo.vnc)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {connectionInfo.vnc}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">RDP:</span>
                      <button
                        onClick={() => copyToClipboard(connectionInfo.rdp)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {connectionInfo.rdp}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">SSH:</span>
                      <button
                        onClick={() => copyToClipboard(connectionInfo.ssh)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {connectionInfo.ssh}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sessions actives ({sessions.filter(s => s.status === 'active').length})
          </h2>
          
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune session trouvée
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg ${
                    session.status === 'active' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.status === 'active' ? 'Actif' : 'Expiré'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {session.session_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>IP: {session.ip_address}</p>
                        <p>Créé: {new Date(session.created_at).toLocaleString()}</p>
                        <p>Expire: {new Date(session.expires_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {session.status === 'active' && (
                      <button
                        onClick={() => revokeSession(session.session_id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Instructions d'utilisation
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p><strong>1.</strong> Générez un token d'accès ci-dessus</p>
            <p><strong>2.</strong> Utilisez l'une des méthodes de connexion suivantes :</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>VNC:</strong> Utilisez un client VNC (TightVNC, RealVNC)</li>
              <li><strong>RDP:</strong> Utilisez le Bureau à distance Windows</li>
              <li><strong>SSH:</strong> Créez un tunnel SSH puis connectez-vous en VNC</li>
            </ul>
            <p><strong>3.</strong> Une fois connecté, lancez Cursor sur votre PC distant</p>
            <p><strong>4.</strong> Les sessions expirent automatiquement après 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
}

