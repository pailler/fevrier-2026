'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface Payment {
  id: string;
  userEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
  date: string;
  description: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        ;
        
        // Récupération directe des données depuis Supabase

const supabase = getSupabaseClient();

        // Récupérer les paiements depuis la table payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            *,
            profiles:user_id (
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (paymentsError) {
          console.error('❌ Erreur lors de la récupération des paiements:', paymentsError);
          return;
        }

        console.log(`📊 ${paymentsData?.length || 0} paiements trouvés dans la base de données`);

        // Mapper les paiements avec les vraies données
        const paymentsWithRealData = (paymentsData || []).map(payment => {
          // Déterminer le statut basé sur les données Stripe
          let status: 'completed' | 'pending' | 'failed' | 'refunded' = 'pending';
          if (payment.status === 'succeeded') {
            status = 'completed';
          } else if (payment.status === 'requires_payment_method' || payment.status === 'requires_confirmation') {
            status = 'pending';
          } else if (payment.status === 'canceled' || payment.status === 'requires_action') {
            status = 'failed';
          }

          // Déterminer la méthode de paiement
          let method = 'Stripe';
          if (payment.payment_method_type) {
            method = payment.payment_method_type.charAt(0).toUpperCase() + payment.payment_method_type.slice(1);
          }

          // Calculer le montant en euros (Stripe stocke en centimes)
          const amount = payment.amount ? payment.amount / 100 : 0;

          // Récupérer l'email de l'utilisateur
          const userEmail = payment.profiles?.email || payment.customer_email || 'Utilisateur inconnu';

          // Créer une description basée sur les métadonnées
          let description = 'Paiement iAhome';
          if (payment.metadata?.description) {
            description = payment.metadata.description;
          } else if (payment.metadata?.module_id) {
            description = `Module ${payment.metadata.module_id}`;
          }

          return {
            id: payment.id,
            userEmail,
            amount,
            status,
            method,
            date: payment.created_at,
            description,
            stripePaymentIntentId: payment.payment_intent_id,
            stripeCustomerId: payment.customer_id,
            currency: payment.currency || 'eur',
            createdAt: payment.created_at,
            updatedAt: payment.updated_at || payment.created_at,
            metadata: payment.metadata
          };
        });

        console.log(`✅ ${paymentsWithRealData.length} paiements chargés avec les vraies données Stripe`);
        setPayments(paymentsWithRealData);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des paiements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = payments.filter(payment => 
    filterStatus === 'all' || payment.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Complété', icon: '✅' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: '⏳' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Échoué', icon: '❌' },
      refunded: { color: 'bg-gray-100 text-gray-800', text: 'Remboursé', icon: '↩️' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

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
          Gestion des paiements
        </h1>
        <p className="text-gray-600">
          Suivez et gérez les transactions et paiements
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRevenue.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paiements réussis</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-mono text-xs">{payment.id}</div>
                      {payment.stripePaymentIntentId && (
                        <div className="text-xs text-gray-500">
                          Stripe: {payment.stripePaymentIntentId.substring(0, 20)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{payment.userEmail}</div>
                      {payment.stripeCustomerId && (
                        <div className="text-xs text-gray-500">
                          Customer: {payment.stripeCustomerId.substring(0, 20)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: payment.currency.toUpperCase() 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={payment.description}>
                      {payment.description}
                    </div>
                    {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(payment.metadata).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value).substring(0, 20)}...
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(payment.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(payment.date).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails du paiement"
                      >
                        Détails
                      </button>
                      {payment.status === 'completed' && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Rembourser ce paiement"
                        >
                          Rembourser
                        </button>
                      )}
                      {payment.stripePaymentIntentId && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="Voir dans Stripe Dashboard"
                        >
                          Stripe
                        </button>
                      )}
                    </div>
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

