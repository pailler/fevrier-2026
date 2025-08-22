'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationService, NotificationSetting, NotificationLog } from '../../../utils/notificationService';

export default function NotificationsAdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testEventType, setTestEventType] = useState('user_created');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        setLogs(data.logs);
      } else {
        console.error('Erreur lors du chargement:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (eventType: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle',
          eventType,
          enabled
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        console.log(data.message);
      } else {
        console.error('Erreur lors de la mise à jour:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const testEmailNotification = async () => {
    if (!testEmail) return;

    try {
      setTestResult({ loading: true });
      
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          email: testEmail,
          eventType: testEventType
        }),
      });

      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        // Recharger les logs
        loadData();
      }
    } catch (error) {
      setTestResult({ error: 'Erreur lors du test' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'événement
              </label>
              <select
                value={testEventType}
                onChange={(e) => setTestEventType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user_created">Création d'utilisateur</option>
                <option value="user_login">Connexion utilisateur</option>
                <option value="module_activated">Module activé</option>
                <option value="app_accessed">Application accédée</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={testEmailNotification}
                disabled={!testEmail || testResult?.loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testResult?.loading ? 'Envoi...' : 'Envoyer un test'}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-md ${
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

        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres de notifications</h2>
          
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{setting.event_name}</h3>
                  <p className="text-sm text-gray-600">{setting.event_description}</p>
                </div>
                
                                 <div className="flex items-center space-x-4">
                   {/* Bouton On/Off moderne */}
                   <button
                     onClick={() => toggleNotification(setting.event_type, !setting.is_enabled)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                       setting.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                     }`}
                     role="switch"
                     aria-checked={setting.is_enabled}
                   >
                     <span
                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                         setting.is_enabled ? 'translate-x-6' : 'translate-x-1'
                       }`}
                     />
                   </button>
                   
                   <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                     setting.is_enabled 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {setting.is_enabled ? 'Activé' : 'Désactivé'}
                   </span>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Logs récents</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.email_sent
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.email_sent ? 'Envoyé' : 'Échec'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
