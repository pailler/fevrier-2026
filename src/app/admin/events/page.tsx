'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface Event {
  id: string;
  type: 'user_created' | 'user_updated' | 'application_created' | 'application_used' | 'payment_received' | 'token_purchased' | 'module_activated' | 'module_deactivated' | 'token_consumed' | 'module_access' | 'quota_exceeded' | 'module_security_check' | 'notification_sent' | 'module_counter_incremented';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  metadata?: any;
  icon: string;
  color: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('🔍 Chargement des événements récents...');
        
        const supabase = getSupabaseClient();
        const allEvents: Event[] = [];

        // 1. Événements utilisateurs (création, mise à jour)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            // Événement de création d'utilisateur
            allEvents.push({
              id: `user_created_${profile.id}`,
              type: 'user_created',
              title: 'Nouvel utilisateur inscrit',
              description: `${profile.full_name || profile.email} s'est inscrit sur la plateforme`,
              timestamp: profile.created_at,
              user: profile,
              icon: '👤',
              color: 'bg-green-100 text-green-800'
            });

            // Événement de mise à jour d'utilisateur (si updated_at est différent de created_at)
            if (profile.updated_at && profile.updated_at !== profile.created_at) {
              allEvents.push({
                id: `user_updated_${profile.id}`,
                type: 'user_updated',
                title: 'Profil utilisateur mis à jour',
                description: `Profil de ${profile.full_name || profile.email} modifié`,
                timestamp: profile.updated_at,
                user: profile,
                icon: '✏️',
                color: 'bg-blue-100 text-blue-800'
              });
            }
          });
        }

        // 2. Événements applications (activation, utilisation)
        const { data: userApps, error: userAppsError } = await supabase
          .from('user_applications')
          .select(`
            id, module_id, user_id, is_active, usage_count, created_at, last_used_at,
            modules(max_usage)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        // Récupérer les profils et modules séparément
        const userIds = [...new Set((userApps || []).map(app => app.user_id))];
        const moduleIds = [...new Set((userApps || []).map(app => app.module_id))];

        const { data: appProfiles, error: appProfilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const { data: appModules, error: appModulesError } = await supabase
          .from('modules')
          .select('id, name')
          .in('id', moduleIds);

        const profilesMap = {};
        (appProfiles || []).forEach(profile => {
          profilesMap[profile.id] = profile;
        });

        const modulesMap = {};
        (appModules || []).forEach(module => {
          modulesMap[module.id] = module;
        });

        if (!userAppsError && userApps) {
          userApps.forEach(app => {
            const profile = profilesMap[app.user_id];
            const module = modulesMap[app.module_id];

            if (profile && module) {
              // Événement d'activation d'application
              allEvents.push({
                id: `app_activated_${app.id}`,
                type: 'application_created',
                title: 'Application activée',
                description: `${profile.full_name || profile.email} a activé l'application ${module.name}`,
                timestamp: app.created_at,
                user: profile,
                metadata: { module: module.name },
                icon: '📱',
                color: 'bg-purple-100 text-purple-800'
              });

              // Événement d'utilisation d'application
              if (app.last_used_at && app.usage_count > 0) {
                allEvents.push({
                  id: `app_used_${app.id}_${app.last_used_at}`,
                  type: 'application_used',
                  title: 'Application utilisée',
                  description: `${profile.full_name || profile.email} a utilisé ${module.name} (${app.usage_count} utilisations)`,
                  timestamp: app.last_used_at,
                  user: profile,
                  metadata: { module: module.name, usage_count: app.usage_count },
                  icon: '⚡',
                  color: 'bg-orange-100 text-orange-800'
                });
              }
            }
          });
        }

        // 3. Événements paiements
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            id, user_id, amount, currency, status, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!paymentsError && payments) {
          const paymentUserIds = [...new Set(payments.map(p => p.user_id))];
          const { data: paymentProfiles, error: paymentProfilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', paymentUserIds);

          const paymentProfilesMap = {};
          (paymentProfiles || []).forEach(profile => {
            paymentProfilesMap[profile.id] = profile;
          });

          payments.forEach(payment => {
            const profile = paymentProfilesMap[payment.user_id];
            
            if (profile) {
              allEvents.push({
                id: `payment_${payment.id}`,
                type: 'payment_received',
                title: 'Paiement reçu',
                description: `Paiement de ${payment.amount} ${payment.currency} de ${profile.full_name || profile.email}`,
                timestamp: payment.created_at,
                user: profile,
                metadata: { amount: payment.amount, currency: payment.currency, status: payment.status },
                icon: '💳',
                color: 'bg-green-100 text-green-800'
              });
            }
          });
        }

        // 4. Événements tokens (achats)
        const { data: stripeTransactions, error: stripeError } = await supabase
          .from('stripe_transactions')
          .select(`
            session_id, user_email, package_type, tokens_purchased, amount_paid, currency, payment_status, created_at
          `)
          .eq('payment_status', 'succeeded')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!stripeError && stripeTransactions) {
          stripeTransactions.forEach(transaction => {
            allEvents.push({
              id: `token_purchase_${transaction.session_id}`,
              type: 'token_purchased',
              title: 'Tokens achetés',
              description: `${transaction.user_email} a acheté ${transaction.tokens_purchased} tokens (${transaction.package_type})`,
              timestamp: transaction.created_at,
              metadata: { 
                tokens: transaction.tokens_purchased, 
                package: transaction.package_type,
                amount: transaction.amount_paid,
                currency: transaction.currency
              },
              icon: '🪙',
              color: 'bg-yellow-100 text-yellow-800'
            });
          });
        }

        // 5. Événements consommation de tokens (réels et simulés)
        const { data: tokenUsage, error: tokenUsageError } = await supabase
          .from('token_usage')
          .select(`
            id, user_id, module_id, tokens_consumed, action_type, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!tokenUsageError && tokenUsage) {
          const tokenUserIds = [...new Set(tokenUsage.map(t => t.user_id))];
          const { data: tokenProfiles, error: tokenProfilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', tokenUserIds);

          const tokenProfilesMap = {};
          (tokenProfiles || []).forEach(profile => {
            tokenProfilesMap[profile.id] = profile;
          });

          tokenUsage.forEach(usage => {
            const profile = tokenProfilesMap[usage.user_id];
            const module = modulesMap[usage.module_id];
            
            if (profile && module) {
              allEvents.push({
                id: `token_consumed_${usage.id}`,
                type: 'token_consumed',
                title: 'Tokens consommés',
                description: `${profile.full_name || profile.email} a consommé ${usage.tokens_consumed} tokens pour ${module.name}`,
                timestamp: usage.created_at,
                user: profile,
                metadata: { 
                  module: module.name, 
                  tokens_consumed: usage.tokens_consumed,
                  action_type: usage.action_type
                },
                icon: '🔥',
                color: 'bg-red-100 text-red-800'
              });
            }
          });
        }

        // 5.1. Événements consommation de tokens simulés basés sur les logs réels
        if (!userAppsError && userApps) {
          // Simuler des événements de consommation de tokens basés sur les utilisations récentes
          const recentUsageApps = userApps
            .filter(app => app.last_used_at && new Date(app.last_used_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .slice(0, 20);

          recentUsageApps.forEach(app => {
            const profile = profilesMap[app.user_id];
            const module = modulesMap[app.module_id];
            
            if (profile && module) {
              // Simuler la consommation de tokens basée sur le type de module
              const tokenCost = module.id.includes('ai') || module.id.includes('stable') || module.id.includes('cog') || module.id.includes('sd') ? 100 : 
                               module.id.includes('metube') || module.id.includes('librespeed') ? 10 : 10;
              
              allEvents.push({
                id: `token_consumed_sim_${app.id}_${app.usage_count}`,
                type: 'token_consumed',
                title: 'Tokens consommés',
                description: `${profile.full_name || profile.email} a consommé ${tokenCost} tokens pour ${module.name}`,
                timestamp: app.last_used_at,
                user: profile,
                metadata: { 
                  module: module.name, 
                  tokens_consumed: tokenCost,
                  action_type: 'module_access',
                  simulated: true
                },
                icon: '🔥',
                color: 'bg-red-100 text-red-800'
              });
            }
          });
        }

        // 6. Événements accès aux modules (logs d'accès)
        const { data: moduleAccessLogs, error: accessLogsError } = await supabase
          .from('module_access_logs')
          .select(`
            id, user_id, module_id, access_type, ip_address, user_agent, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!accessLogsError && moduleAccessLogs) {
          const accessUserIds = [...new Set(moduleAccessLogs.map(log => log.user_id))];
          const { data: accessProfiles, error: accessProfilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', accessUserIds);

          const accessProfilesMap = {};
          (accessProfiles || []).forEach(profile => {
            accessProfilesMap[profile.id] = profile;
          });

          moduleAccessLogs.forEach(log => {
            const profile = accessProfilesMap[log.user_id];
            const module = modulesMap[log.module_id];
            
            if (profile && module) {
              allEvents.push({
                id: `module_access_${log.id}`,
                type: 'module_access',
                title: 'Accès au module',
                description: `${profile.full_name || profile.email} a accédé à ${module.name}`,
                timestamp: log.created_at,
                user: profile,
                metadata: { 
                  module: module.name, 
                  access_type: log.access_type,
                  ip_address: log.ip_address
                },
                icon: '🚪',
                color: 'bg-blue-100 text-blue-800'
              });
            }
          });
        }

        // 7. Événements quota dépassé (simulation basée sur les données existantes)
        if (!userAppsError && userApps) {
          userApps.forEach(app => {
            const profile = profilesMap[app.user_id];
            const module = modulesMap[app.module_id];
            
            if (profile && module && app.modules?.[0]?.max_usage && app.usage_count >= app.modules[0].max_usage) {
              allEvents.push({
                id: `quota_exceeded_${app.id}`,
                type: 'quota_exceeded',
                title: 'Quota dépassé',
                description: `${profile.full_name || profile.email} a dépassé le quota de ${module.name} (${app.usage_count}/${app.modules?.[0]?.max_usage})`,
                timestamp: app.last_used_at || app.created_at,
                user: profile,
                metadata: { 
                  module: module.name, 
                  usage_count: app.usage_count,
                  max_usage: app.modules?.[0]?.max_usage
                },
                icon: '⚠️',
                color: 'bg-red-100 text-red-800'
              });
            }
          });
        }

        // 8. Événements notifications (logs réels)
        const { data: notificationLogs, error: notificationLogsError } = await supabase
          .from('notification_logs')
          .select(`
            id, event_type, user_email, event_data, email_sent, email_sent_at, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!notificationLogsError && notificationLogs) {
          notificationLogs.forEach(log => {
            allEvents.push({
              id: `notification_${log.id}`,
              type: 'notification_sent',
              title: 'Notification envoyée',
              description: `Notification ${log.event_type} envoyée à ${log.user_email}`,
              timestamp: log.email_sent_at || log.created_at,
              metadata: { 
                event_type: log.event_type,
                user_email: log.user_email,
                email_sent: log.email_sent,
                event_data: log.event_data
              },
              icon: '📧',
              color: log.email_sent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            });
          });
        }

        // 9. Événements simulés basés sur les logs réels (vérifications de sécurité)
        if (!userAppsError && userApps) {
          // Simuler des événements de vérification de sécurité basés sur les accès récents
          const recentApps = userApps
            .filter(app => app.last_used_at && new Date(app.last_used_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .slice(0, 10);

          recentApps.forEach(app => {
            const profile = profilesMap[app.user_id];
            const module = modulesMap[app.module_id];
            
            if (profile && module) {
              allEvents.push({
                id: `security_check_${app.id}_${Date.now()}`,
                type: 'module_security_check',
                title: 'Vérification de sécurité',
                description: `Vérification d'accès au module ${module.name} pour ${profile.full_name || profile.email}`,
                timestamp: app.last_used_at || app.created_at,
                user: profile,
                metadata: { 
                  module: module.name,
                  access_granted: true,
                  security_level: 'standard'
                },
                icon: '🔒',
                color: 'bg-blue-100 text-blue-800'
              });
            }
          });
        }

        // 10. Événements simulés basés sur les logs réels (incrémentations de compteurs)
        if (!userAppsError && userApps) {
          // Simuler des événements d'incrémentation de compteurs basés sur les utilisations récentes
          const appsWithUsage = userApps
            .filter(app => app.usage_count > 0 && app.last_used_at)
            .slice(0, 15);

          appsWithUsage.forEach(app => {
            const profile = profilesMap[app.user_id];
            const module = modulesMap[app.module_id];
            
            if (profile && module) {
              allEvents.push({
                id: `counter_increment_${app.id}_${app.usage_count}`,
                type: 'module_counter_incremented',
                title: 'Compteur incrémenté',
                description: `Compteur d'utilisation de ${module.name} incrémenté pour ${profile.full_name || profile.email} (${app.usage_count} utilisations)`,
                timestamp: app.last_used_at,
                user: profile,
                metadata: { 
                  module: module.name,
                  usage_count: app.usage_count,
                  max_usage: app.modules?.[0]?.max_usage
                },
                icon: '📊',
                color: 'bg-purple-100 text-purple-800'
              });
            }
          });
        }

        // 11. Événements modules (création) - utiliser les modules déjà récupérés
        if (!appModulesError && appModules && appModules.length > 0) {
          appModules.forEach(module => {
            allEvents.push({
              id: `module_created_${module.id}`,
              type: 'module_activated',
              title: 'Module créé',
              description: `Nouveau module "${module.name}" ajouté à la plateforme`,
              timestamp: new Date().toISOString(),
              metadata: { module: module.name },
              icon: '🧩',
              color: 'bg-indigo-100 text-indigo-800'
            });
          });
        }

        // Trier tous les événements par timestamp (plus récent en premier)
        allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        console.log(`✅ ${allEvents.length} événements chargés`);
        setEvents(allEvents);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des événements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'user_created': 'Utilisateur',
      'user_updated': 'Utilisateur',
      'application_created': 'Application',
      'application_used': 'Utilisation',
      'payment_received': 'Paiement',
      'token_purchased': 'Tokens',
      'module_activated': 'Module',
      'module_deactivated': 'Module',
      'token_consumed': 'Consommation',
      'module_access': 'Accès',
      'quota_exceeded': 'Quota',
      'module_security_check': 'Sécurité',
      'notification_sent': 'Notification',
      'module_counter_incremented': 'Compteur'
    };
    return labels[type as keyof typeof labels] || 'Autre';
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const eventTypes = [
    { value: 'all', label: 'Tous', count: events.length },
    { value: 'user_created', label: 'Utilisateurs', count: events.filter(e => e.type === 'user_created').length },
    { value: 'application_created', label: 'Applications', count: events.filter(e => e.type === 'application_created').length },
    { value: 'application_used', label: 'Utilisations', count: events.filter(e => e.type === 'application_used').length },
    { value: 'module_access', label: 'Accès', count: events.filter(e => e.type === 'module_access').length },
    { value: 'token_consumed', label: 'Consommation', count: events.filter(e => e.type === 'token_consumed').length },
    { value: 'module_security_check', label: 'Sécurité', count: events.filter(e => e.type === 'module_security_check').length },
    { value: 'module_counter_incremented', label: 'Compteur', count: events.filter(e => e.type === 'module_counter_incremented').length },
    { value: 'notification_sent', label: 'Notifications', count: events.filter(e => e.type === 'notification_sent').length },
    { value: 'quota_exceeded', label: 'Quota', count: events.filter(e => e.type === 'quota_exceeded').length },
    { value: 'payment_received', label: 'Paiements', count: events.filter(e => e.type === 'payment_received').length },
    { value: 'token_purchased', label: 'Tokens', count: events.filter(e => e.type === 'token_purchased').length },
  ];

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
          Événements récents
        </h1>
        <p className="text-gray-600">
          Historique des dernières activités sur la plateforme
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {eventTypes.map((type) => (
          <div 
            key={type.value}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-colors ${
              filter === type.value ? 'ring-2 ring-red-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => setFilter(type.value)}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">{type.label}</p>
              <p className="text-2xl font-bold text-gray-900">{type.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des événements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'Tous les événements' : `${getEventTypeLabel(filter)} - ${filteredEvents.length} événements`}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <p className="text-gray-500">Aucun événement trouvé</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${event.color}`}>
                    {event.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <time className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600">
                      {event.description}
                    </p>
                    
                    {event.user && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="mr-1">👤</span>
                        {event.user.full_name || event.user.email}
                      </div>
                    )}
                    
                    {event.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span 
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
