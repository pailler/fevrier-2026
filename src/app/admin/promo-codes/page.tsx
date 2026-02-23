'use client';

import { useState, useEffect } from 'react';

interface PromoCodeItem {
  id: string;
  code: string;
  active: boolean;
  created: number;
  expires_at: number | null;
  max_redemptions: number | null;
  times_redeemed: number;
  amount_off: number | null;
  percent_off: number | null;
  currency: string | null;
}

export default function AdminPromoCodesPage() {
  const [list, setList] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activating, setActivating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/promo-codes');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setList(data.promotion_codes || []);
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Impossible de charger les codes promo',
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleActivateBienvenue10 = async () => {
    setActivating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ensure_bienvenue10' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.details || `Erreur ${res.status}`);
      }
      setMessage({ type: 'success', text: data.message || 'Code BIENVENUE10 accessible.' });
      await load();
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Erreur lors de l’accès',
      });
    } finally {
      setActivating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotion_code_id: id, active: !currentActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.details || `Erreur ${res.status}`);
      }
      setMessage({
        type: 'success',
        text: data.active ? `${data.code} accessible` : `${data.code} suspendu`,
      });
      await load();
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Erreur',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const bienvenue10 = list.find((p) => (p.code || '').toUpperCase() === 'BIENVENUE10');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Codes promo Stripe</h1>
        <button
          type="button"
          onClick={handleActivateBienvenue10}
          disabled={activating || (bienvenue10?.active === true)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activating
            ? 'accès...'
            : bienvenue10?.active
              ? 'BIENVENUE10 déjà actif'
              : 'accéder à le code BIENVENUE10 (-2€)'}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500">Aucun code promo. Cliquez sur « accéder à le code BIENVENUE10 » pour en créer un.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Réduction</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Utilisations</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {list.map((p) => (
                <tr key={p.id} className="bg-white">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {p.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {p.amount_off != null && p.amount_off > 0
                      ? `-${p.amount_off.toFixed(2)} ${p.currency?.toUpperCase() || '€'}`
                      : p.percent_off != null
                        ? `-${p.percent_off}%`
                        : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {p.times_redeemed}
                    {p.max_redemptions != null ? ` / ${p.max_redemptions}` : ''}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p.id, p.active)}
                      disabled={togglingId === p.id}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {togglingId === p.id ? '...' : p.active ? 'suspendre' : 'accéder à'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Les codes sont gérés dans Stripe. BIENVENUE10 applique une réduction de 2€ (ex. 9,90€ → 7,90€).
      </p>
    </div>
  );
}


