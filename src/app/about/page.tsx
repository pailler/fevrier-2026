import Link from 'next/link';
import EcosystemValueBlock from '@/components/marketing/EcosystemValueBlock';
import GpuInfrastructureBlock from '@/components/marketing/GpuInfrastructureBlock';
import FrenchTrustBlock from '@/components/marketing/FrenchTrustBlock';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12 rounded-2xl bg-gradient-to-br from-yellow-50 via-green-50 to-green-100 p-8 sm:p-12 border border-green-100">
            <EcosystemValueBlock
              variant="about"
              layout="section"
              showPillars={false}
              showAudiences={true}
              primaryCta={{ href: '/signup', label: 'Créer un compte gratuit' }}
              secondaryCta={{ href: '/formation', label: 'Découvrir les formations' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-gray-600 mb-4">
                IAHome rend l&apos;intelligence artificielle accessible à tous — pas seulement aux développeurs.
                Nous regroupons des outils concrets dans un écosystème unique, propulsé par une station GPU NVIDIA
                CUDA maintenue en France : un compte, un accès, zéro barrière technique.
              </p>
              <p className="text-gray-600">
                Formations interactives, applications prêtes à l&apos;emploi et accompagnement personnalisé :
                chaque utilisateur avance à son rythme, du premier essai au projet sur mesure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Vision</h2>
              <p className="text-gray-600 mb-4">
                Un monde où l&apos;IA s&apos;intègre naturellement au quotidien — pour créer, travailler,
                apprendre et résoudre des problèmes concrets, sans dépendre de solutions étrangères
                opaques ou difficiles à maîtriser.
              </p>
              <p className="text-gray-600">
                IAHome construit cette alternative française : transparente, formée et tournée vers
                l&apos;action.
              </p>
            </div>
          </div>

          <GpuInfrastructureBlock variant="about" className="rounded-2xl mb-16" />

          <FrenchTrustBlock variant="about" className="rounded-2xl mb-16" />

          <EcosystemValueBlock variant="about" useCasesOnly className="rounded-2xl overflow-hidden mb-16" />

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rejoignez l&apos;écosystème</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Débutant ou expert, particulier ou professionnel : IAHome vous donne les outils et la
              formation pour passer à l&apos;action dès aujourd&apos;hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/formation"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Découvrir nos formations
              </Link>
              <Link
                href="/applications"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Voir nos applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
