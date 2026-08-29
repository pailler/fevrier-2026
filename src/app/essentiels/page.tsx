'use client';
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useCustomAuth } from '../../hooks/useCustomAuth';
import ModuleCard from '../../components/ModuleCard';
import EcosystemValueBlock from '../../components/marketing/EcosystemValueBlock';
import FrenchTrustBlock from '../../components/marketing/FrenchTrustBlock';
import AudienceSegmentsBlock from '../../components/marketing/AudienceSegmentsBlock';
import {
  AUDIENCE_SEGMENTS,
  getEssentialAudienceSegment,
  isAudienceSegmentId,
  type AudienceSegmentId,
} from '../../data/audienceSegments';

const ESSENTIAL_OFFER_NOTES: Record<string, string> = {
  librespeed: 'Lancez le test et interprétez directement le débit et la latence.',
  metube: 'Collez un lien, choisissez le format et récupérez votre fichier.',
  psitransfer: 'Déposez vos fichiers et partagez immédiatement un lien sécurisé.',
  pdf: 'Fusionnez, compressez, convertissez ou signez vos documents en autonomie.',
  'code-learning': 'Progressez avec des exercices interactifs accessibles sans accompagnement.',
  administration: 'Retrouvez directement les services publics et démarches utiles.',
  'reveil-intelligent': 'Configurez vos alarmes, la météo et le calendrier depuis votre compte.',
  'apprendre-autrement': 'Un accompagnement peut aider à construire un parcours adapté à l’enfant.',
  'sentinelle-numerique': 'Une prise en main guidée aide à organiser les priorités et le plan d’action.',
  vote: 'Un accompagnement est utile pour préparer le scrutin, les participants et le partage par QR code.',
  'resas-system': 'La mise en place peut être guidée selon le matériel, les règles et les utilisateurs.',
  qrcodes: 'IAHome peut préparer un QR code dynamique et son support physique personnalisé.',
  photobooth: 'Prestation adaptée aux mariages et événements : personnalisation, galerie et mise en service.',
  'home-assistant': 'Les ressources sont accessibles directement ; l’expertise avancée est assurée avec un partenaire spécialisé.',
};

function getEssentialOfferNote(module: { id?: unknown; title?: string }): string {
  const id = String(module.id ?? '').trim().toLowerCase();
  return ESSENTIAL_OFFER_NOTES[id] ?? 'Une prise en main peut être proposée selon votre objectif et votre contexte.';
}

export default function Essentiels() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<'all' | AudienceSegmentId>('all');

  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const segment = searchParams.get('segment');
    if (isAudienceSegmentId(segment)) {
      setSegmentFilter(segment);
    }
  }, [searchParams]);

  const essentialModules = [
    'librespeed',
    'metube',
    'psitransfer',
    'qrcodes',
    'pdf',
    'code-learning',
    'apprendre-autrement',
    'home-assistant',
    'administration',
    'photobooth',
    'sentinelle-numerique',
    'vote',
    'reveil-intelligent',
    'resas-system',
  ];

  useEffect(() => {
    if (authLoading) return;
  }, [isAuthenticated, user, authLoading]);

  useEffect(() => {
    if (!user) return;
    setRole(user.role || 'user');
  }, [user]);

  useEffect(() => {
    const checkUserSubscriptions = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_applications')
          .select('module_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Erreur lors de la récupération des applications:', error);
          return;
        }

        const subscriptions: {[key: string]: boolean} = {};
        data?.forEach((sub: any) => {
          subscriptions[sub.module_id] = true;
        });

        setUserSubscriptions(subscriptions);
      } catch (err) {
        console.error('Erreur lors de la vérification des abonnements:', err);
      }
    };

    checkUserSubscriptions();
  }, [user]);

  useEffect(() => {
    const globalTimeout = setTimeout(() => {
      console.warn('⏱️ Timeout global: arrêt forcé du chargement après 15 secondes');
      setLoading(false);
      setError('Le chargement a pris trop de temps. Veuillez rafraîchir la page.');
    }, 15000);

    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabaseQuery = supabase
          .from('modules')
          .select('*')
          .order('title');

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: La requête Supabase a pris plus de 10 secondes')), 10000)
        );

        let result: any;
        try {
          result = await Promise.race([supabaseQuery, timeoutPromise]);
        } catch (error) {
          console.error('❌ Erreur lors de la requête Supabase (timeout ou erreur):', error);
          result = { data: null, error: error };
        }

        const { data, error } = result || { data: null, error: new Error('Résultat Supabase indéfini') };

        if (error) {
          console.error('Erreur lors de la récupération des modules:', error);
          setError('Erreur lors du chargement des modules');
          setModules([]);
          return;
        }

        const idMatchesEssential = (rawId: unknown) => {
          const idNorm = String(rawId ?? '').trim().toLowerCase();
          return essentialModules.some((eid) => idNorm === eid.toLowerCase());
        };

        let essentialModulesData =
          data?.filter((module: { id?: unknown; title?: string }) => {
            const title = (module.title || '').toLowerCase();
            const includedByTitle = essentialModules.some(
              (essentialId) =>
                title.includes(essentialId.toLowerCase()) ||
                title.includes(essentialId.replace('-', ' ').toLowerCase())
            );
            return (
              (idMatchesEssential(module.id) || includedByTitle) &&
              String(module.id || '').toLowerCase() !== 'whisper'
            );
          }) || [];

        const listHasId = (needle: string) =>
          essentialModulesData.some(
            (m: { id?: unknown }) =>
              String(m.id ?? '').trim().toLowerCase() === needle.toLowerCase()
          );

        if (!listHasId('sentinelle-numerique')) {
          essentialModulesData = [
            {
              id: 'sentinelle-numerique',
              title: 'Sentinelle Numérique',
              subtitle: 'Cybersécurité personnelle et processus de fin de vie numérique',
              description:
                'Cybersécurité personnelle et processus de fin de vie numérique: audit sécurité, plan de transmission et actions post-événement.',
              category: 'Cybersécurité',
              price: 10,
              image_url: '/images/sentinelle-numerique.jpg',
            },
            ...essentialModulesData,
          ];
        }

        if (!listHasId('vote')) {
          essentialModulesData = [
            ...essentialModulesData,
            {
              id: 'vote',
              title: 'Vote en ligne',
              subtitle: 'Votes avec code PIN organisateur et QR code',
              description:
                'Créez un vote simple : nom du scrutin, liste des participants. Code PIN à 4 chiffres pour l’administration, lien public et QR pour voter. Stockage Supabase.',
              category: 'OUTILS ÉVÉNEMENT',
              price: 10,
              url: '/card/vote',
              image_url: '/iahome-logo.svg',
            },
          ];
        }

        if (!listHasId('reveil-intelligent')) {
          essentialModulesData = [
            ...essentialModulesData,
            {
              id: 'reveil-intelligent',
              title: 'Réveil Intelligent',
              subtitle: 'Météo, jours fériés et vacances scolaires',
              description:
                'Réveil mobile responsive : alarmes multiples, messages adaptés à la météo, au jour de la semaine, aux jours fériés et aux vacances scolaires (zones A, B, C).',
              category: 'OUTILS QUOTIDIEN',
              price: 0,
              url: '/card/reveil',
              image_url: '/images/reveil-intelligent.svg',
            },
          ];
        }

        if (!listHasId('resas-system')) {
          essentialModulesData = [
            ...essentialModulesData,
            {
              id: 'resas-system',
              title: 'Réservation matériel',
              subtitle: 'Calendrier, notifications et suivi des emprunts',
              description:
                'Réservation de matériels (jeux vidéo, équipements), calendrier de disponibilité, notifications et suivi des emprunts.',
              category: 'OUTILS ÉVÉNEMENT',
              price: 100,
              image_url: '/images/resas-system.svg',
            },
          ];
        }

        essentialModulesData = essentialModulesData.map((m: { id?: unknown; url?: string }) => {
          const id = String(m.id ?? '').trim().toLowerCase();
          if (id === 'vote') return { ...m, url: '/card/vote' };
          if (id === 'reveil-intelligent') return { ...m, url: '/card/reveil' };
          return m;
        });

        setModules(essentialModulesData);
      } catch (err) {
        console.error('Erreur lors de la récupération des modules:', err);
        setError('Erreur lors du chargement des modules');
        setModules([]);
      } finally {
        clearTimeout(globalTimeout);
        setLoading(false);
      }
    };

    fetchModules();

    return () => {
      clearTimeout(globalTimeout);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      !search ||
      module.title.toLowerCase().includes(search.toLowerCase()) ||
      module.description?.toLowerCase().includes(search.toLowerCase()) ||
      (module.categories || [module.category]).some((cat: string) =>
        cat.toLowerCase().includes(search.toLowerCase())
      );

    return matchesSearch;
  });

  const displayedModules = useMemo(
    () => [...filteredModules].sort((a, b) => a.title.localeCompare(b.title, 'fr')),
    [filteredModules.map((m) => m.id).sort().join(',')]
  );

  const groupedModules = useMemo(
    () =>
      AUDIENCE_SEGMENTS.map((segment) => ({
        ...segment,
        modules: displayedModules.filter(
          (module) =>
            getEssentialAudienceSegment(module) === segment.id &&
            (segmentFilter === 'all' || segmentFilter === segment.id)
        ),
      })).filter((segment) => segment.modules.length > 0),
    [displayedModules, segmentFilter]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-yellow-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-green-500/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-yellow-600/15 rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <EcosystemValueBlock
                variant="essentiels"
                layout="hero"
                showPillars={false}
                showAudiences={false}
                showProof={true}
              />

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Outils essentiels"
                    className="w-full px-6 py-4 pl-12 pr-16 rounded-xl border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </div>
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-green-700 transition-all font-medium">
                    Rechercher
                  </button>
                </div>

                {user && (
                  <Link
                    href="/account"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px]"
                  >
                    <span className="text-lg">📱</span>
                    <span className="hidden sm:inline">Mes applications</span>
                    <span className="sm:hidden">Mes applications</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-green-700 bg-clip-text text-transparent mb-3">IAHome</div>
                    <div className="text-xs text-gray-600">Intelligence Artificielle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EcosystemValueBlock variant="essentiels" useCasesOnly />

      <AudienceSegmentsBlock highlight="evenementiel" />

      <FrenchTrustBlock variant="compact" density="band" showCta={false} />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full">
            {segmentFilter !== 'all' && (
              <div className="mb-8">
                <Link
                  href="/essentiels"
                  className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  ← Afficher les trois univers
                </Link>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : displayedModules.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Aucune application essentielle trouvée</div>
              </div>
            ) : (
              <div className="space-y-14">
                {groupedModules.map((segment) => (
                  <section key={segment.id} aria-labelledby={`segment-${segment.id}`}>
                    <div className={`rounded-xl border-l-4 p-5 mb-6 ${segment.accent}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide opacity-75 mb-1">{segment.badge}</p>
                          <h2 id={`segment-${segment.id}`} className="text-2xl font-bold">{segment.title}</h2>
                        </div>
                        <p className="text-sm max-w-xl sm:text-right opacity-85">{segment.catalogHint}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {segment.modules.map((module) => (
                        <div key={module.id} className="flex flex-col">
                          <ModuleCard module={module} userEmail={user?.email} />
                          <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${segment.accent}`}>
                            {getEssentialOfferNote(module)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {segment.id === 'evenementiel' && (
                      <div className="mt-5 text-sm text-gray-600">
                        Photobooth et QR codes : prestation personnalisable pour mariages, AG et stands —{' '}
                        <Link href="/contact?type=project" className="font-semibold text-purple-800 underline">
                          demander un devis
                        </Link>
                        .
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Retour en haut"
          aria-label="Retour en haut de page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
