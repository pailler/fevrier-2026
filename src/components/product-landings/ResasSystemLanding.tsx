import Image from 'next/image';
import { resasSystemLandingSeo } from '@/data/resas-system-landing-seo';
import { RESAS_SYSTEM_CARD_URL } from '@/utils/productLandingHosts';

const IAHOME_ORIGIN = 'https://iahome.fr';

const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const concepts = [
  { icon: '📅', label: 'Calendrier temps réel', detail: 'Visualisez les disponibilités et réservez un créneau en un clin d’œil' },
  { icon: '🎮', label: 'Jeux & équipements', detail: 'Matériel événementiel, jeux vidéo et accessoires gérés au même endroit' },
  { icon: '🔔', label: 'Notifications', detail: 'Rappels automatiques pour les emprunts, retours et confirmations' },
  { icon: '📋', label: 'Suivi des emprunts', detail: 'Historez qui a quoi, jusqu’à quand, et historisez les mouvements' },
  { icon: '🔐', label: 'Accès sécurisé', detail: 'Ouverture via token IAHome — pas d’accès public à l’application' },
  { icon: '💳', label: 'Crédits IAHome', detail: 'Activation simple depuis votre compte, sans abonnement séparé' },
];

const useCases = [
  {
    title: 'Labs & médiathèques',
    text: 'Gérez le prêt de matériel pédagogique ou ludique avec un calendrier clair.',
  },
  {
    title: 'Événements & ateliers',
    text: 'Réservez consoles, caméras ou kits techniques pour vos sessions.',
  },
  {
    title: 'Structures associatives',
    text: 'Centralisez les emprunts et évitez les doubles réservations.',
  },
];

function ProductHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-violet-950/95 backdrop-blur-md">
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
          <a href="/" className="truncate text-sm font-semibold text-white hover:text-violet-200">
            Réservation matériel
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navigation de la page">
          <a
            href="#fonctionnalites"
            className="rounded-lg px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-white/10 hover:text-white"
          >
            Fonctionnalités
          </a>
          <a
            href="#faq"
            className="rounded-lg px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-white/10 hover:text-white"
          >
            FAQ
          </a>
          <a
            href={RESAS_SYSTEM_CARD_URL}
            className="ml-1 rounded-lg bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
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
          <a href={iahomeUrl('/terms')} className="text-violet-200 hover:text-white" {...externalTab}>
            Mentions légales
          </a>
          <a href={iahomeUrl('/privacy')} className="text-violet-200 hover:text-white" {...externalTab}>
            Confidentialité
          </a>
          <a href={iahomeUrl('/contact')} className="text-violet-200 hover:text-white" {...externalTab}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function ResasSystemLanding() {
  const { faqs, description, headline } = resasSystemLandingSeo;

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-gradient-to-b from-violet-950 via-purple-900 to-slate-900 text-white">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-violet-200">
            Réservation · Calendrier · Crédits IAHome
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">{headline}</h1>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-violet-100">{description}</p>

          <div className="flex flex-wrap gap-4">
            <a
              href={RESAS_SYSTEM_CARD_URL}
              className="rounded-xl bg-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-fuchsia-400"
              {...externalTab}
            >
              Accéder à Réservation matériel
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
                  className="rounded-2xl border border-white/10 bg-violet-950/40 p-5"
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-violet-100">{item.detail}</p>
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
                  <h3 className="text-lg font-semibold text-fuchsia-300">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-violet-100">{item.text}</p>
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
                <article key={faq.question} className="rounded-2xl border border-white/10 bg-violet-950/30 p-6">
                  <h3 className="text-lg font-semibold text-violet-200">{faq.question}</h3>
                  <p className="mt-3 leading-relaxed text-violet-100">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-violet-950 py-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Prêt à réserver ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-violet-100">
              Activez le module depuis IAHome et ouvrez l’application avec un accès sécurisé par token.
            </p>
            <a
              href={RESAS_SYSTEM_CARD_URL}
              className="mt-6 inline-block rounded-xl bg-fuchsia-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-fuchsia-400"
              {...externalTab}
            >
              Ouvrir la fiche produit
            </a>
          </div>
        </section>
      </main>
      <MinimalLegalFooter />
    </>
  );
}
