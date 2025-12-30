'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface NotificationSetting {
  id: string;
  event_type: string;
  name: string;
  description: string;
  is_enabled: boolean;
  email_template_subject: string;
  email_template_body: string;
  created_at: string;
  updated_at: string;
}

interface NotificationLog {
  id: string;
  event_type: string;
  user_email: string;
  event_data: any;
  email_sent: boolean;
  email_error?: string;
  email_sent_at?: string;
  created_at: string;
}

export default function AdminNotifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [resendStatus, setResendStatus] = useState<any>(null);
  const [testingNotifications, setTestingNotifications] = useState<{[key: string]: boolean}>({});

  // État pour l'envoi du mail "sans module activé"
  const [noModuleEmail, setNoModuleEmail] = useState('');
  const [noModuleUserName, setNoModuleUserName] = useState('');
  const [noModuleSending, setNoModuleSending] = useState(false);
  const [noModuleResult, setNoModuleResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    loadData();
    checkResendStatus();
  }, []);

  const loadData = async () => {
    try {
      ;
      
      const supabase = getSupabaseClient();

      // Charger les paramètres de notifications
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (settingsError) {
        console.error('❌ Erreur lors du chargement des paramètres:', settingsError);
      }

      // Charger les logs de notifications
      const { data: logsData, error: logsError } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('❌ Erreur lors du chargement des logs:', logsError);
      }

      console.log(`📊 ${settingsData?.length || 0} paramètres de notifications trouvés`);
      console.log(`📋 ${logsData?.length || 0} logs de notifications trouvés`);

      setSettings(settingsData || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkResendStatus = async () => {
    try {
      const response = await fetch('/api/test-resend-domain');
      const data = await response.json();
      setResendStatus(data);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de Resend:', error);
    }
  };

  const toggleNotification = async (id: string, enabled: boolean) => {
    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('notification_settings')
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return;
      }

      // Mettre à jour l'état local
      setSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, is_enabled: enabled } : setting
      ));

      console.log(`✅ Notification ${enabled ? 'activée' : 'désactivée'}: ${id}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;
    
    setTestSending(true);
    try {
      const response = await fetch('/api/test-resend-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Email de test envoyé avec succès !');
        setTestEmail('');
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du test:', error);
      alert('❌ Erreur lors de l\'envoi du test');
    } finally {
      setTestSending(false);
    }
  };

  const testNotification = async (eventType: string, setting: NotificationSetting) => {
    let emailToUse = testEmail;
    
    if (!emailToUse) {
      emailToUse = prompt('Veuillez saisir l\'email de test pour cette notification:');
      if (!emailToUse) {
        return;
      }
    }

    setTestingNotifications(prev => ({ ...prev, [eventType]: true }));
    
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          email: emailToUse,
          subject: setting.email_template_subject,
          body: setting.email_template_body,
          eventData: {
            user_email: emailToUse,
            user_name: 'Utilisateur Test',
            timestamp: new Date().toISOString()
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Notification de test "${setting.name}" envoyée avec succès !`);
        // Recharger les logs pour voir la nouvelle entrée
        loadData();
      } else {
        alert(`❌ Erreur lors de l'envoi de la notification "${setting.name}": ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du test de notification:', error);
      alert(`❌ Erreur lors du test de la notification "${setting.name}"`);
    } finally {
      setTestingNotifications(prev => ({ ...prev, [eventType]: false }));
    }
  };

  const sendNoModuleEmail = async () => {
    if (!noModuleEmail) {
      alert('Veuillez saisir une adresse email');
      return;
    }

    setNoModuleSending(true);
    setNoModuleResult(null);

    try {
      const response = await fetch('/api/test-no-module-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: noModuleEmail,
          userName: noModuleUserName || noModuleEmail.split('@')[0] || 'Utilisateur'
        })
      });

      const data = await response.json();

      if (data.success) {
        setNoModuleResult({
          success: true,
          message: `✅ Email envoyé avec succès à ${data.email}`
        });
        // Recharger les logs pour voir la nouvelle entrée
        loadData();
        // Réinitialiser les champs après 3 secondes
        setTimeout(() => {
          setNoModuleEmail('');
          setNoModuleUserName('');
          setNoModuleResult(null);
        }, 3000);
      } else {
        setNoModuleResult({
          success: false,
          message: `❌ Erreur: ${data.message || data.error || 'Erreur inconnue'}`
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      setNoModuleResult({
        success: false,
        message: '❌ Erreur lors de l\'envoi de l\'email'
      });
    } finally {
      setNoModuleSending(false);
    }
  };

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="mr-1">✅</span>
        Activé
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <span className="mr-1">❌</span>
        Désactivé
      </span>
    );
  };

  const getLogStatusBadge = (sent: boolean, error?: string) => {
    if (sent) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="mr-1">✅</span>
          Envoyé
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="mr-1">❌</span>
          Échec
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des notifications
        </h1>
        <p className="text-gray-600">
          Configurez et gérez les notifications email avec Resend
        </p>
      </div>

      {/* Statut Resend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Resend</h2>
        {resendStatus ? (
          <div className="space-y-4">
            {/* Configuration API */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Configuration API</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                resendStatus.config?.apiKeyConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {resendStatus.config?.apiKeyConfigured ? '✅ Configuré' : '❌ Non configuré'}
              </span>
            </div>
            
            {/* Email d'expédition */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Email d'expédition</span>
              <span className="text-sm text-gray-600 font-mono">
                {resendStatus.config?.fromEmail || 'Non configuré'}
              </span>
            </div>
            
            {/* Domaines disponibles */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Domaines disponibles</span>
              <span className="text-sm text-gray-600">
                {resendStatus.domains?.count || 0}
                {resendStatus.domains?.domains && resendStatus.domains.domains.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({resendStatus.domains.domains.map((d: any) => d.name).join(', ')})
                  </span>
                )}
              </span>
            </div>
            
            {/* Test d'email */}
            {resendStatus.emailTest && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Test d'envoi</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  resendStatus.emailTest?.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {resendStatus.emailTest?.success ? '✅ Réussi' : '❌ Échec'}
                </span>
              </div>
            )}

{/* Informations de debug */}
            {resendStatus.config && (
              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Informations de debug
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600">
                  <div>Clé API: {resendStatus.config.apiKeyPrefix || 'Non configurée'}</div>
                  <div>Longueur: {resendStatus.config.apiKeyLength || 0} caractères</div>
                  <div>Environnement: {resendStatus.config.environment || 'Non défini'}</div>
                  <div>Timestamp: {resendStatus.timestamp || 'Non disponible'}</div>
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Vérification de la configuration...</p>
          </div>
        )}
      </div>

      {/* Test d'envoi d'email */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test d'envoi d'email</h2>
        <div className="flex space-x-4">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Email de test..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400"
          />
          <button
            onClick={sendTestEmail}
            disabled={!testEmail || testSending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testSending ? 'Envoi...' : 'Envoyer test'}
          </button>
        </div>
      </div>

      {/* Envoi mail "Sans module activé" */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border-2 border-blue-200 p-6">
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Envoyer le mail "Sans module activé"
              </h2>
              <p className="text-sm text-gray-600">
                Mail de bienvenue avec tutoriel et offre de 200 tokens bonus
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="no-module-email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email *
            </label>
            <input
              id="no-module-email"
              type="email"
              value={noModuleEmail}
              onChange={(e) => setNoModuleEmail(e.target.value)}
              placeholder="utilisateur@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="no-module-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'utilisateur (optionnel)
            </label>
            <input
              id="no-module-name"
              type="text"
              value={noModuleUserName}
              onChange={(e) => setNoModuleUserName(e.target.value)}
              placeholder="Prénom ou nom d'utilisateur"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si vide, le nom sera extrait de l'adresse email
            </p>
          </div>

          {noModuleResult && (
            <div className={`p-3 rounded-lg ${
              noModuleResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{noModuleResult.message}</p>
            </div>
          )}

          <button
            onClick={sendNoModuleEmail}
            disabled={!noModuleEmail || noModuleSending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {noModuleSending ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </span>
            ) : (
              '📧 Envoyer le mail'
            )}
          </button>

          <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-900 font-semibold mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Contenu du mail :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span className="text-sm text-gray-700">Tutoriel simple en 3 étapes</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span className="text-sm text-gray-700">200 tokens bonus (3 jours)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span className="text-sm text-gray-700">Liens vers Modules/Applications</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span className="text-sm text-gray-700">Design responsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Types de notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {settings.map((setting) => (
            <div key={setting.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {setting.name}
                    </h3>
                    {getStatusBadge(setting.is_enabled)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {setting.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    <strong>Type d'événement:</strong> {setting.event_type}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    <strong>Sujet:</strong> {setting.email_template_subject}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <strong>Corps:</strong> {setting.email_template_body.substring(0, 100)}...
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => testNotification(setting.event_type, setting)}
                    disabled={testingNotifications[setting.event_type]}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Tester la notification ${setting.name}`}
                  >
                    {testingNotifications[setting.event_type] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Test...
                      </>
                    ) : (
                      <>
                        <span className="mr-1">🧪</span>
                        Tester
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => toggleNotification(setting.id, !setting.is_enabled)}
                    disabled={saving}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      setting.is_enabled
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    } disabled:opacity-50`}
                  >
                    {setting.is_enabled ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs de notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Logs récents</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erreur
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.event_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getLogStatusBadge(log.email_sent, log.email_error)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.email_error ? (
                      <span className="text-red-600" title={log.email_error}>
                        {log.email_error.substring(0, 50)}...
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}