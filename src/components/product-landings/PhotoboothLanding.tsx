import Image from 'next/image';
import PhotoboothReelEmbed from '@/components/product-landings/PhotoboothReelEmbed';
import { photoboothLandingSeo, PHOTOBOOTH_LANDING_REEL_URL } from '@/data/photobooth-landing-seo';
import { PHOTOBOOTH_CARD_URL } from '@/utils/productLandingHosts';
import { PHOTOBOOTH_MODULE_TITLE } from '@/utils/photoboothProductName';

const IAHOME_ORIGIN = 'https://iahome.fr';
const DISCOVER_URL = `${IAHOME_ORIGIN}/photobooth-decouverte.html`;

const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const concepts = [
  { icon: '📸', label: 'Photos instantanées', detail: 'Selfies et portraits directement dans le navigateur' },
  { icon: '🎬', label: 'Courtes vidéos', detail: 'Souvenirs animés jusqu’à 15 secondes' },
  { icon: '🖼️', label: 'Galerie événement', detail: 'Toutes les photos centralisées par code PIN' },
  { icon: '🔒', label: 'Accès sécurisé', detail: 'Connexion IAHome et jeton d’accès' },
  { icon: '⚡', label: 'Sans installation', detail: 'Fonctionne sur tablette, PC ou smartphone' },
  { icon: '🎉', label: 'Mode invité', detail: 'Testez la borne avant d’activer le module' },
];

const useCases = [
  {
    title: 'Mariages & fêtes',
    text: 'Une animation photo mémorable pour vos invités, sans matériel complexe.',
  },
  {
    title: 'Entreprise & séminaires',
    text: 'Collectez les photos d’un événement pro dans une galerie centralisée.',
  },
  {
    title: 'Prestation & borne',
    text: 'Découvrez nos offres matériel et prestation pour équiper vos événements.',
  },
];

function ProductHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-indigo-950/95 backdrop-blur-md">
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
          <a href="/" className="truncate text-sm font-semibold text-white hover:text-amber-200">
            {PHOTOBOOTH_MODULE_TITLE}
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navigation de la page">
          <a
            href="#reel"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            Vidéo
          </a>
          <a
            href="#fonctionnalites"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            Fonctionnalités
          </a>
          <a
            href="#faq"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            FAQ
          </a>
          <a
            href={PHOTOBOOTH_CARD_URL}
            className="ml-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-indigo-950 transition hover:bg-amber-300"
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
          <a href={iahomeUrl('/terms')} className="text-indigo-200 hover:text-white" {...externalTab}>
            Mentions légales
          </a>
          <a href={iahomeUrl('/privacy')} className="text-indigo-200 hover:text-white" {...externalTab}>
            Confidentialité
          </a>
          <a href={iahomeUrl('/contact')} className="text-indigo-200 hover:text-white" {...externalTab}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function PhotoboothLanding() {
  const { description, faqs } = photoboothLandingSeo;

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 text-white">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-indigo-200">
            Mariages · Entreprises · Sans installation
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            Vos souvenirs photo en un clic
          </h1>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-indigo-100">{description}</p>

          <div className="flex flex-wrap gap-4">
            <a
              href={PHOTOBOOTH_CARD_URL}
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-amber-300"
              {...externalTab}
            >
              Commencer
            </a>
            <a
              href="#faq"
              className="rounded-xl border border-white/25 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Questions fréquentes
            </a>
          </div>
        </section>

        <section id="reel" className="border-y border-white/10 bg-white/5 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl text-center lg:text-left">
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-300">
                  En action
                </p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Le Photobooth en situation réelle
                </h2>
                <p className="mt-4 leading-relaxed text-indigo-100">
                  Découvrez l&apos;ambiance et le rendu de la borne connectée IAHome lors d&apos;un
                  événement — photos instantanées, galerie et partage en quelques gestes.
                </p>
              </div>
              <div className="shrink-0" style={{ width: '100%', maxWidth: 300 }}>
                <PhotoboothReelEmbed />
                <p className="mt-3 text-center text-xs text-indigo-300/80">
                  <a
                    href={PHOTOBOOTH_LANDING_REEL_URL}
                    className="underline decoration-indigo-400/40 underline-offset-2 hover:text-white"
                    {...externalTab}
                  >
                    Voir sur YouTube
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="border-y border-white/10 bg-white/5 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Ce que vous pouvez faire</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {concepts.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-indigo-950/40 p-5"
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-100">{item.detail}</p>
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
                  <h3 className="text-lg font-semibold text-amber-300">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-indigo-100">{item.text}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-center">
              <a
                href={DISCOVER_URL}
                className="text-indigo-200 underline decoration-indigo-400/50 underline-offset-4 transition hover:text-white"
                {...externalTab}
              >
                Voir l&apos;offre Photobooth / borne connectée →
              </a>
            </p>
          </div>
        </section>

        <section id="faq" className="border-t border-white/10 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Questions fréquentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-white/10 bg-indigo-950/30 p-6">
                  <h3 className="text-lg font-semibold text-amber-200">{faq.question}</h3>
                  <p className="mt-3 leading-relaxed text-indigo-100">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-indigo-950 py-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Prêt à animer votre événement ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Activez le module depuis IAHome et lancez votre photobooth en quelques clics.
            </p>
            <a
              href={PHOTOBOOTH_CARD_URL}
              className="mt-6 inline-block rounded-xl bg-amber-400 px-8 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-amber-300"
              {...externalTab}
            >
              Ouvrir {PHOTOBOOTH_MODULE_TITLE}
            </a>
          </div>
        </section>
      </main>
      <MinimalLegalFooter />
    </>
  );
}
