import Image from 'next/image';
import { psitransferLandingSeo } from '@/data/psitransfer-landing-seo';
import { PSITRANSFER_CARD_URL } from '@/utils/productLandingHosts';

const IAHOME_ORIGIN = 'https://iahome.fr';

const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const concepts = [
  { icon: '📤', label: 'Upload simple', detail: 'Glissez-déposez ou sélectionnez vos fichiers' },
  { icon: '🔒', label: 'Chiffrement', detail: 'Données protégées pendant le transfert' },
  { icon: '⏱️', label: 'Liens temporaires', detail: 'Durée de vie configurable pour chaque partage' },
  { icon: '🔑', label: 'Mot de passe', detail: 'Protection optionnelle de vos liens' },
  { icon: '📧', label: 'Notifications', detail: 'Alertes par e-mail pour vos destinataires' },
  { icon: '🆓', label: 'Open-source', detail: 'Alternative respectueuse de la vie privée' },
];

const useCases = [
  {
    title: 'Professionnels & équipes',
    text: 'Envoyez des documents, maquettes ou livrables sans passer par un cloud tiers.',
  },
  {
    title: 'Partage ponctuel',
    text: 'Un lien sécurisé pour un envoi unique — sans créer de compte chez un service externe.',
  },
  {
    title: 'Alternative WeTransfer',
    text: 'Open-source, sans publicité ni tracking — vos fichiers restent sous contrôle IAHome.',
  },
];

function ProductHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-teal-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Image
            src="/images/iahome-logo.png"
            alt="IAHome"
            width={104}
            height={34}
            className="h-8 w-auto shrink-0 object-contain"
            priority
          />
          <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden />
          <a href="/" className="truncate text-sm font-semibold text-white hover:text-emerald-200">
            PsiTransfer
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navigation de la page">
          <a
            href="#fonctionnalites"
            className="rounded-lg px-3 py-2 text-sm font-medium text-teal-100 transition hover:bg-white/10 hover:text-white"
          >
            Fonctionnalités
          </a>
          <a
            href="#faq"
            className="rounded-lg px-3 py-2 text-sm font-medium text-teal-100 transition hover:bg-white/10 hover:text-white"
          >
            FAQ
          </a>
          <a
            href={PSITRANSFER_CARD_URL}
            className="ml-1 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-teal-950 transition hover:bg-emerald-300"
            {...externalTab}
          >
            Commencer
          </a>
        </nav>
      </div>
    </header>
  );
}

function MinimalLegalFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10 text-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <Image
          src="/images/iahome-logo.png"
          alt="IAHome"
          width={112}
          height={36}
          className="mx-auto h-9 w-auto object-contain opacity-90"
        />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Liens légaux">
          <a href={iahomeUrl('/terms')} className="text-teal-200 hover:text-white" {...externalTab}>
            Mentions légales
          </a>
          <a href={iahomeUrl('/privacy')} className="text-teal-200 hover:text-white" {...externalTab}>
            Confidentialité
          </a>
          <a href={iahomeUrl('/contact')} className="text-teal-200 hover:text-white" {...externalTab}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function PsiTransferLanding() {
  const { faqs, description, headline } = psitransferLandingSeo;

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-gradient-to-b from-teal-950 via-teal-900 to-slate-900 text-white">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-emerald-200">
            Transfert sécurisé · Open-source · 10 crédits par accès
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">{headline}</h1>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-teal-100">{description}</p>

          <div className="flex flex-wrap gap-4">
            <a
              href={PSITRANSFER_CARD_URL}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-teal-950 shadow-lg transition hover:bg-emerald-300"
              {...externalTab}
            >
              Accéder à PsiTransfer
            </a>
            <a
              href="#faq"
              className="rounded-xl border border-white/25 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Questions fréquentes
            </a>
          </div>
        </section>

        <section id="fonctionnalites" className="border-y border-white/10 bg-white/5 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Ce que vous pouvez faire</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {concepts.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-teal-950/40 p-5"
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-teal-100">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Pour qui ?</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {useCases.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-emerald-300">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-teal-100">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-white/10 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Questions fréquentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-white/10 bg-teal-950/30 p-6">
                  <h3 className="text-lg font-semibold text-emerald-200">{faq.question}</h3>
                  <p className="mt-3 leading-relaxed text-teal-100">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-teal-950 py-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Prêt à envoyer vos fichiers ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-teal-100">
              Activez PsiTransfer depuis IAHome et partagez vos fichiers en quelques clics.
            </p>
            <a
              href={PSITRANSFER_CARD_URL}
              className="mt-6 inline-block rounded-xl bg-emerald-400 px-8 py-3 font-semibold text-teal-950 shadow-lg transition hover:bg-emerald-300"
              {...externalTab}
            >
              Ouvrir PsiTransfer
            </a>
          </div>
        </section>
      </main>
      <MinimalLegalFooter />
    </>
  );
}
