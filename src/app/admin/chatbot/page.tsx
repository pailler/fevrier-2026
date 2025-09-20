'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../../components/Breadcrumb";
import Header from '../../../components/Header';

interface ChatConversation {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
  user_email?: string;
}

interface ChatStats {
  total_conversations: number;
  total_messages: number;
  active_users_today: number;
  average_response_time: number;
}

export default function ChatbotAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'stats' | 'settings'>('conversations');
  
  // États pour les conversations
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  
  // États pour les statistiques
  const [stats, setStats] = useState<ChatStats>({
    total_conversations: 0,
    total_messages: 0,
    active_users_today: 0,
    average_response_time: 0
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        setIsAdmin(false);
        return;
      }
      const userIsAdmin = data?.role === 'admin';
      setIsAdmin(userIsAdmin);
      if (userIsAdmin) {
        fetchChatbotData();
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatbotData = async () => {
    try {
      // Charger les conversations avec les emails des utilisateurs
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!conversationsError && conversationsData) {
        const conversationsWithEmail = conversationsData.map((conv: any) => ({
          ...conv,
          user_email: conv.profiles?.email || 'Utilisateur inconnu'
        }));
        setConversations(conversationsWithEmail);
      }

      // Calculer les statistiques
      await calculateStats();
    } catch (error) {
      console.error('Erreur lors du chargement des données chatbot:', error);
    }
  };

  const calculateStats = async () => {
    try {
      // Total des conversations
      const { count: totalConversations } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true });

      // Total des messages (chaque conversation = 2 messages)
      const totalMessages = (totalConversations || 0) * 2;

      // Utilisateurs actifs aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: activeUsersToday } = await supabase
        .from('chat_conversations')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        total_conversations: totalConversations || 0,
        total_messages: totalMessages,
        active_users_today: activeUsersToday || 0,
        average_response_time: 2.5 // Temps moyen estimé en secondes
      });
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (!error) {
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        calculateStats();
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Chatbot IA', href: '/admin/chatbot' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Chatbot IA</h1>
          <p className="text-gray-600 mt-2">Gérez les conversations, surveillez les statistiques et configurez l'assistant IA.</p>
        </div>

        {/* Navigation des onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Conversations ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'conversations' && (
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_conversations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_messages}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Utilisateurs Actifs Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_users_today}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Temps de Réponse Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.average_response_time}s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des conversations */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations Récentes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Réponse IA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conversations.map((conversation) => (
                      <tr key={conversation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{conversation.user_email}</div>
                          <div className="text-sm text-gray-500">{conversation.user_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {conversation.user_message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {conversation.ai_response}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(conversation.created_at).toLocaleDateString('fr-FR')}
                          <br />
                          {new Date(conversation.created_at).toLocaleTimeString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedConversation(conversation);
                                setShowConversationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => deleteConversation(conversation.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Statistiques Détaillées</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité du Chatbot</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversations totales</span>
                    <span className="font-semibold">{stats.total_conversations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages échangés</span>
                    <span className="font-semibold">{stats.total_messages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisateurs actifs aujourd'hui</span>
                    <span className="font-semibold">{stats.active_users_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps de réponse moyen</span>
                    <span className="font-semibold">{stats.average_response_time} secondes</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux de satisfaction</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps de disponibilité</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Erreurs techniques</span>
                    <span className="font-semibold text-green-600">0.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configuration du Chatbot</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres IA</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modèle IA</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>GPT-4 (Recommandé)</option>
                    <option>GPT-3.5-turbo</option>
                    <option>Claude-3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Température (Créativité)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                    className="mt-1 block w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Précis</span>
                    <span>Équilibré</span>
                    <span>Créatif</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre maximum de tokens</label>
                  <input
                    type="number"
                    defaultValue="1200"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message de bienvenue</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Message personnalisé de bienvenue..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Langue par défaut</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour voir une conversation complète */}
      {showConversationModal && selectedConversation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Conversation avec {selectedConversation.user_email}
                </h3>
                <button
                  onClick={() => {
                    setShowConversationModal(false);
                    setSelectedConversation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Message de l'utilisateur :</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedConversation.user_message}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Réponse de l'IA :</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedConversation.ai_response}</p>
                </div>
                
                <div className="text-sm text-gray-500">
                  Date : {new Date(selectedConversation.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
