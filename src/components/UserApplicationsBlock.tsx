'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { MODULE_DESCRIPTIONS, type UserApplication } from '@/utils/moduleDescriptions';
import { getModuleAppUrl, openModuleAppWithToken } from '@/utils/moduleAppUrl';

export default function UserApplicationsBlock() {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessingModuleId, setAccessingModuleId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error) {
        setApplications(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchApplications();
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, fetchApplications]);

  const handleDirectAccess = useCallback(
    async (app: UserApplication) => {
      if (!user?.id || !user?.email) {
        router.push('/login?redirect=/');
        return;
      }

      const targetUrl = getModuleAppUrl(app.module_id);
      if (!targetUrl) {
        alert(`URL d'accès introuvable pour le module ${app.module_id}`);
        return;
      }

      try {
        setAccessingModuleId(app.id);
        const tokenResponse = await fetch('/api/generate-access-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            moduleId: (app.module_id || '').trim().toLowerCase(),
          }),
        });

        if (!tokenResponse.ok) {
          const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
          throw new Error(tokenError.error || 'Erreur génération token');
        }

        const tokenData = await tokenResponse.json();
        if (!tokenData?.token) {
          throw new Error("Token d'accès manquant");
        }

        openModuleAppWithToken(app.module_id, tokenData.token, targetUrl);
        await fetchApplications();
      } catch (error) {
        alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } finally {
        setAccessingModuleId(null);
      }
    },
    [fetchApplications, router, user?.email, user?.id]
  );

  if (!isAuthenticated || !user) return null;

  return (
    <section
      id="vos-applications"
      className="relative overflow-hidden border-y border-green-200/60 bg-gradient-to-br from-white via-green-50/80 to-blue-50/60 py-10 sm:py-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
              Accès rapide
            </p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Vos applications</h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              Reprenez là où vous en étiez : vos services ouverts avec vos crédits, en un clic.
            </p>
          </div>
          {!loading && applications.length > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
              {applications.length} application{applications.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-gray-200/80 bg-white/70"
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300/80 bg-white/80 px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-800">Aucune application ouverte pour l&apos;instant</p>
            <p className="mt-2 text-gray-600">
              Explorez le catalogue et lancez un service pour le retrouver ici.
            </p>
            <Link
              href="/applications"
              className="mt-5 inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              Découvrir les applications →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <article
                key={app.id}
                className="group flex flex-col rounded-2xl border border-white/80 bg-white/90 p-5 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-green-300/80 hover:shadow-lg"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-lg text-white shadow-sm">
                    📱
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900 group-hover:text-green-800">
                      {app.module_title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {MODULE_DESCRIPTIONS[app.module_id] ||
                        'Application IA disponible avec accès direct sécurisé.'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <span className="text-xs font-medium text-gray-500">
                    {app.usage_count} utilisation{app.usage_count !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDirectAccess(app)}
                    disabled={accessingModuleId === app.id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {accessingModuleId === app.id ? 'Ouverture…' : 'Ouvrir'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
