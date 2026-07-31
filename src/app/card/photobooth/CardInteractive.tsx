'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import Breadcrumb from '../../../components/Breadcrumb';
import CardPageActivationSection from '../../../components/CardPageActivationSection';
import { useHydrated } from '../../../hooks/useHydrated';
import { getTokenCostForModuleId } from '../../../utils/tokenActionService';
import { PHOTOBOOTH_PRODUCT_NAME, PHOTOBOOTH_MODULE_TITLE } from '../../../utils/photoboothProductName';

const PHOTOBOOTH_DISCOVER_CANONICAL =
  'https://iahome.fr/photobooth-decouverte.html';

export default function PhotoboothPage({ initialModule }: CardInteractiveProps) {
  const hydrated = useHydrated();
  const photoboothAppUrl =
    hydrated && window.location.hostname === 'localhost'
      ? 'http://localhost:7885'
      : 'https://photobooth.iahome.fr';
  /** Même valeur SSR + 1er rendu client → pas d’écart d’hydratation ; puis origine réelle (localhost, preview, etc.). */
  const discoverPageHref = hydrated
    ? `${window.location.origin}/photobooth-decouverte.html`
    : PHOTOBOOTH_DISCOVER_CANONICAL;
  const moduleData = {
    id: 'photobooth',
    title: PHOTOBOOTH_MODULE_TITLE,
    subtitle: 'Le Photobooth/Videobooth connecté pour tous vos événements',
    description:
      'Créez un espace photo simple et fun pour vos événements (mariage, anniversaire, soirée pro). ' +
      'Les participants prennent leurs photos instantanément depuis le navigateur, avec une expérience fluide et moderne.',
    category: 'MEDIA TOOLS',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-fuchsia-50 to-pink-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: moduleData.title },
            ]}
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-fuchsia-600 via-pink-600 to-rose-700 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Photobooth/Videobooth connecté : vos souvenirs en un clic
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-pink-100 mb-6">{moduleData.description}</p>
              <p className="text-pink-100 mb-6">{moduleData.subtitle}</p>
              <a
                href={discoverPageHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-6 py-3 rounded-full bg-white text-fuchsia-800 font-bold text-base shadow-lg hover:bg-pink-50 hover:shadow-xl transition-all border-2 border-white/80"
              >
                <span>Vous avez testé la borne en invité·e ?</span>
                <span className="text-fuchsia-600 font-semibold text-sm sm:text-base">
                  Découvrir l&apos;offre Photobooth/Videobooth connecté →
                </span>
              </a>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que vous pouvez faire</h2>
              <ul className="space-y-3 text-gray-700">
                <li>📸 Prise de photos instantanee depuis le navigateur</li>
                <li>🖼️ Galerie evenement centralisee</li>
                <li>🔒 Accès sécurisé par connexion + code d&apos;accès</li>
                <li>⚡ Ouverture rapide sans installation</li>
              </ul>
              <div className="mt-6 text-sm text-gray-500">
                URL applicative: <span className="font-medium">photobooth.iahome.fr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="photobooth"
        moduleName={PHOTOBOOTH_PRODUCT_NAME}
        tokenCost={getTokenCostForModuleId('photobooth')}
        tokenUnit="par acces. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        accessUrl={photoboothAppUrl}
        gradientColors="from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
        icon="📸"
      />
    </div>
  );
}
