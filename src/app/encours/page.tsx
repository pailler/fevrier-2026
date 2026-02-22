'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { useCustomAuth } from '../../hooks/useCustomAuth';

interface UserModule {
  id: string;
  module_id: string;
  module_title: string;
  module_description: string;
  module_category: string;
  module_url: string;
  last_used_at?: string | null;
  created_at: string;
  current_usage: number;
  max_usage?: number;
  is_free?: boolean;
  access_type?: string;
}

const moduleSlugMapping: Record<string, string> = {
  '1': 'pdf',
  '2': 'metube',
  '3': 'librespeed',
  '4': 'psitransfer',
  '5': 'qrcodes',
  '7': 'stablediffusion',
  '8': 'ruinedfooocus',
  '10': 'comfyui',
  '11': 'cogstudio'
};

const directModuleUrls: Record<string, string> = {
  metube: 'https://iahome.fr/card/metube',
  librespeed: 'https://librespeed.iahome.fr',
  pdf: 'https://iahome.fr/card/pdf',
  psitransfer: 'https://iahome.fr/card/psitransfer',
  qrcodes: 'https://qrcodes.iahome.fr',
  'qrcodes-statiques': 'https://iahome.fr/card/qrcodes',
  whisper: 'https://iahome.fr/card/whisper',
  stablediffusion: 'https://iahome.fr/card/stablediffusion',
  ruinedfooocus: 'https://iahome.fr/card/ruinedfooocus',
  comfyui: 'https://iahome.fr/card/comfyui',
  cogstudio: 'https://iahome.fr/card/cogstudio',
  'meeting-reports': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:3050'
    : 'https://meeting-reports.iahome.fr',
  hunyuan3d: (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:8888'
    : 'https://hunyuan3d.iahome.fr',
  'home-assistant': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:8123'
    : 'https://homeassistant.iahome.fr',
  administration: '/administration',
  'apprendre-autrement': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:9001'
    : 'https://apprendre-autrement.iahome.fr',
  'prompt-generator': 'https://prompt-generator.iahome.fr',
  'ai-detector': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:3000/ai-detector'
    : 'https://iahome.fr/ai-detector',
  'voice-isolation': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:8100'
    : 'https://voice-isolation.iahome.fr',
  photomaker: (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:7881'
    : 'https://photomaker.iahome.fr',
  'animagine-xl': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:7881'
    : 'https://animaginexl.iahome.fr',
  'florence-2': 'https://florence2.iahome.fr',
  birefnet: 'https://birefnet.iahome.fr'
};

const formatDurationSince = (dateString: string) => {
  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) {
    return 'Date inconnue';
  }
  const now = Date.now();
  const diffMs = Math.max(now - target, 0);
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return 'moins d’1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return `${hours} h${remainingMinutes ? ` ${remainingMinutes} min` : ''}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days} j${remainingHours ? ` ${remainingHours} h` : ''}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date invalide';
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getModuleSlug = (moduleId?: string) => {
  if (!moduleId) return '';
  const normalized = moduleId.toString().toLowerCase();
  return moduleSlugMapping[normalized] || normalized;
};

const getModuleLink = (module: UserModule) => {
  if (module.module_url) {
    return module.module_url;
  }
  const slug = getModuleSlug(module.module_id);
  return slug ? directModuleUrls[slug] || '' : '';
};

const getSessionLabel = (lastUsed?: string | null) => {
  if (!lastUsed) return 'Aucune session récente';
  return `Session dernière : il y a ${formatDurationSince(lastUsed)}`;
};

export default function EncoursPage() {
  const router = useRouter();
  const authState = useCustomAuth();
  const user = authState?.user ?? null;
  const isAuthenticated = authState?.isAuthenticated ?? false;
  const authLoading = authState?.loading ?? true;

  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserModules = useCallback(async ({ skipLoading = false } = {}) => {
    if (!user?.id) {
      setUserModules([]);
      setError(null);
      if (!skipLoading) setLoading(false);
      return;
    }

    if (!skipLoading) {
      setLoading(true);
    }

    try {
      const { data: accessRows, error: accessError } = await supabase
        .from('user_applications')
        .select(`
          id,
          module_id,
          module_title,
          access_level,
          expires_at,
          is_active,
          created_at,
          last_used_at,
          usage_count,
          max_usage
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (accessError) {
        throw accessError;
      }

      const moduleIds = Array.from(
        new Set((accessRows || []).map(row => row.module_id).filter(Boolean))
      );

      let modulesData: any[] = [];
      if (moduleIds.length) {
        const { data: modulesInfo, error: modulesError } = await supabase
          .from('modules')
          .select('id, title, description, category, url')
          .in('id', moduleIds);

        if (!modulesError) {
          modulesData = modulesInfo || [];
        }
      }

      const moduleMap = new Map<string, UserModule>();

      (accessRows || []).forEach((access) => {
        const slug = getModuleSlug(access.module_id);
        const key = slug || access.module_id || access.id;
        if (!key) return;

        const moduleInfo = modulesData.find(
          (info) => (info.id || '').toString() === (access.module_id || '').toString()
        );

        const prepared: UserModule = {
          id: access.id || `${access.module_id}-${access.created_at}`,
          module_id: access.module_id || slug,
          module_title: access.module_title || moduleInfo?.title || slug || 'Module',
          module_description: moduleInfo?.description || '—',
          module_category: moduleInfo?.category || 'Application',
          module_url: moduleInfo?.url || '',
          last_used_at: access.last_used_at,
          created_at: access.created_at,
          current_usage: access.usage_count || 0,
          max_usage: access.max_usage || undefined,
          is_free: Boolean(
            moduleInfo?.price === 0 ||
              moduleInfo?.price === '0' ||
              ['metube', 'librespeed', 'pdf', 'psitransfer'].includes(slug ?? '')
          ),
          access_type: access.access_level || 'basic'
        };

        moduleMap.set(key, prepared);
      });

      setUserModules(Array.from(moduleMap.values()));
      setError(null);
    } catch (fetchError) {
      console.error('Erreur chargement des modules :', fetchError);
      setError('Impossible de charger vos applications pour le moment.');
      setUserModules([]);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/encours');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserModules();
    } else {
      setUserModules([]);
      setLoading(false);
    }
  }, [user?.id, fetchUserModules]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserModules({ skipLoading: true });
    setRefreshing(false);
  };

  const totalUsage = useMemo(
    () => userModules.reduce((sum, module) => sum + (module.current_usage || 0), 0),
    [userModules]
  );

  const recentModulesCount = useMemo(() => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return userModules.filter((module) => {
      if (!module.last_used_at) return false;
      const value = new Date(module.last_used_at).getTime();
      return !Number.isNaN(value) && value >= threshold;
    }).length;
  }, [userModules]);

  const lastActivityLabel = useMemo(() => {
    const lastTimestamp = userModules.reduce((max, module) => {
      if (!module.last_used_at) return max;
      const value = new Date(module.last_used_at).getTime();
      if (Number.isNaN(value)) return max;
      return Math.max(max, value);
    }, 0);
    if (!lastTimestamp) return 'Aucune session récente';
    return `Dernière session : il y a ${formatDurationSince(new Date(lastTimestamp).toISOString())}`;
  }, [userModules]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos applications...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès réservé</h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour consulter l'historique et les statistiques de vos applications IAHome.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition hover:bg-blue-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Bonjour {user.full_name || user.email}</p>
            <h1 className="text-3xl font-bold text-gray-900">Mes applications IAHome</h1>
            <p className="text-gray-600 mt-1">
              Suivez l’utilisation de chaque module sans la contrainte du système d’activation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-white transition disabled:opacity-60"
          >
            {refreshing ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                Actualisation...
              </>
            ) : (
              <>
                <span>Actualiser</span>
              </>
            )}
          </button>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-gray-500">Modules actifs</p>
            <p className="text-3xl font-semibold text-gray-900">{userModules.length}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-gray-500">Utilisations totales</p>
            <p className="text-3xl font-semibold text-gray-900">{totalUsage}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-gray-500">Sessions récentes (7j)</p>
            <p className="text-3xl font-semibold text-gray-900">{recentModulesCount}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-gray-500">Dernière activité</p>
            <p className="text-sm text-gray-600">{lastActivityLabel}</p>
          </article>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {userModules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Aucune application</p>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Vous n’avez pas encore utilisé nos services</h2>
            <p className="mt-2 text-gray-600">
              Découvrez toutes les applications IAHome et lancez votre première session sans les contraintes d’activation.
            </p>
            <Link
              href="/applications"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700"
            >
              Explorer les applications
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {userModules.map((module) => {
              const moduleLink = getModuleLink(module);
              return (
                <article key={module.id} className="rounded-3xl border border-gray-200 bg-white shadow-lg">
                  <div className={`rounded-t-3xl bg-gradient-to-r ${module.is_free ? 'from-emerald-500 to-teal-600' : 'from-blue-600 to-indigo-600'} p-6 text-white`}>
                    <p className="text-xs uppercase tracking-wider text-white/80">{module.module_category}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{module.module_title}</h3>
                    <p className="text-sm text-white/90">{module.access_type}</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <p className="text-sm text-gray-600 line-clamp-3">{module.module_description}</p>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>
                          Utilisations : <span className="font-semibold text-gray-900">{module.current_usage}</span>
                          {module.max_usage ? ` / ${module.max_usage}` : ''}
                        </span>
                        <span className="font-semibold text-gray-900">{getSessionLabel(module.last_used_at)}</span>
                      </div>
                      {module.last_used_at && (
                        <p className="text-xs text-gray-500 mt-2">Dernière activité : {formatDate(module.last_used_at)}</p>
                      )}
                    </div>
                    <div>
                      {moduleLink ? (
                        <a
                          href={moduleLink}
                          target={moduleLink.startsWith('http') ? '_blank' : undefined}
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700"
                        >
                          Accéder à {module.module_title}
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500"
                        >
                          Lien indisponible — contactez le support
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
