'use client';

import Link from 'next/link';
import Breadcrumb from '../../../components/Breadcrumb';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function PhotoboothPage() {
  const moduleData = {
    id: 'photobooth',
    title: 'Photobooth',
    subtitle: 'Le photobooth intelligent pour vos evenements',
    description:
      'Creez un espace photo simple et fun pour mariage, anniversaire ou evenement pro. ' +
      'Les participants prennent leurs photos instantanement depuis le navigateur, avec une experience fluide et moderne.',
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
                Photobooth : vos souvenirs en un clic
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-pink-100 mb-6">{moduleData.description}</p>
              <p className="text-pink-100">{moduleData.subtitle}</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que vous pouvez faire</h2>
              <ul className="space-y-3 text-gray-700">
                <li>📸 Prise de photos instantanee depuis le navigateur</li>
                <li>🖼️ Galerie evenement centralisee</li>
                <li>🔒 Acces securise par connexion + token</li>
                <li>⚡ Ouverture rapide sans installation</li>
              </ul>
              <div className="mt-6 text-sm text-gray-500">
                URL applicative: <span className="font-medium">photobooth.iahome.fr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white/95 rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Comment acceder</h3>
          <p className="text-gray-700 mb-4">
            L&apos;acces a Photobooth suit le workflow habituel IAHome: connexion, verification des tokens, generation
            de token d&apos;acces puis ouverture de l&apos;application.
          </p>
          <p className="text-gray-700">
            Besoin d&apos;aide ? Consultez vos applications depuis{' '}
            <Link href="/account" className="text-fuchsia-700 hover:text-fuchsia-900 font-medium underline">
              Mon compte
            </Link>
            .
          </p>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="photobooth"
        moduleName="Photobooth"
        tokenCost={100}
        tokenUnit="par acces. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        accessUrl="https://photobooth.iahome.fr"
        gradientColors="from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
        icon="📸"
      />
    </div>
  );
}
