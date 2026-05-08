'use client';

import Breadcrumb from '../../../components/Breadcrumb';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function PhotoVivantePage() {
  const appUrl =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:7887'
      : 'https://photo-vivante.iahome.fr';

  const moduleData = {
    id: 'photo-vivante',
    title: 'Photo Vivante',
    subtitle: 'Transformez un portrait ou une photo souvenir en visuel plus vivant, plus expressif et plus impactant',
    description:
      'Photo Vivante applique un effet d animation realiste a vos images pour leur donner plus de presence, de relief et d emotion. ' +
      'Importez votre photo, choisissez l intensite du rendu, puis obtenez une version retravaillee ideale pour portrait, communication visuelle, souvenir ou contenu reseaux sociaux.',
    category: 'AI PHOTO',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-sky-50">
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

      <section className="bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Photo Vivante : donnez plus de vie a vos photos
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-cyan-100 mb-6">{moduleData.description}</p>
              <p className="text-cyan-100 mb-6">{moduleData.subtitle}</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que vous pouvez faire</h2>
              <ul className="space-y-3 text-gray-700">
                <li>🖼️ Importer une photo et generer un rendu plus vivant en quelques secondes</li>
                <li>🎚️ Ajuster le style de transformation selon l effet souhaite : leger, modere ou plus marque</li>
                <li>👤 Sublimer un portrait, une photo souvenir ou un visuel social media</li>
                <li>🔒 Acceder a l application via un lien securise avec token IAHome</li>
              </ul>
              <div className="mt-6 text-sm text-gray-500">
                URL applicative: <span className="font-medium">photo-vivante.iahome.fr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="photo-vivante"
        moduleName="Photo Vivante"
        tokenCost={100}
        tokenUnit="par acces. Utilisez l'application aussi longtemps que vous souhaitez"
        showCostSummaryOnButton={false}
        apiEndpoint="/api/activate-module"
        accessUrl={appUrl}
        gradientColors="from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        icon="🎞️"
      />
    </div>
  );
}
