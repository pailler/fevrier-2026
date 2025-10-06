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

  useEffect(() => {
    loadData();
    checkResendStatus();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 Chargement des paramètres de notifications...');
      
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut Resend</h2>
        {resendStatus ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Configuration API</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                resendStatus.config?.apiKeyConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {resendStatus.config?.apiKeyConfigured ? '✅ Configuré' : '❌ Non configuré'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Email d'expédition</span>
              <span className="text-sm text-gray-600">{resendStatus.config?.fromEmail || 'Non configuré'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Domaines disponibles</span>
              <span className="text-sm text-gray-600">{resendStatus.domains?.count || 0}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Vérification en cours...</p>
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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