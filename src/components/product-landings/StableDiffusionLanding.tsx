import Image from 'next/image';
import { stableDiffusionLandingSeo } from '@/data/stablediffusion-landing-seo';
import { STABLEDIFFUSION_CARD_URL } from '@/utils/productLandingHosts';

const IAHOME_ORIGIN = 'https://iahome.fr';
const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const concepts = [
  { icon: '✨', label: 'Text-to-image', detail: 'Décrivez votre idée et obtenez une image en quelques secondes' },
  { icon: '🎨', label: 'Contrôle artistique', detail: 'Style, composition et ambiance ajustables' },
  { icon: '🖼️', label: 'Haute résolution', detail: 'Jusqu’à 1024×1024 pour le web et l’impression' },
  { icon: '⚡', label: 'Interface Gradio', detail: 'Workflow clair, pensé pour la création' },
  { icon: '🔒', label: 'Accès sécurisé', detail: 'Ouverture via crédits IAHome et jeton d’accès' },
  { icon: '☁️', label: 'Sans installation', detail: 'Tout se passe dans le navigateur, sur l’infra IAHome' },
];

const useCases = [
  {
    title: 'Artistes & designers',
    text: 'Explorez des concepts visuels rapidement pour moodboards, covers ou prototypes.',
  },
  {
    title: 'Marketing & contenu',
    text: 'Générez des visuels uniques pour campagnes, posts et supports de communication.',
  },
  {
    title: 'Créateurs curieux',
    text: 'Testez la génération d’images sans installer de modèle ni configurer un GPU.',
  },
];

function ProductHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur-md">
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
          <a href="/" className="truncate text-sm font-semibold text-white hover:text-sky-200">
            Stable Diffusion
          </a>
        </div>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navigation de la page">
          <a href="#fonctionnalites" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
            Fonctionnalités
          </a>
          <a href="#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
            FAQ
          </a>
          <a href={STABLEDIFFUSION_CARD_URL} className="ml-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400" {...externalTab}>
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
        <Image src="/images/iahome-logo.png" alt="IAHome" width={112} height={36} className="mx-auto h-9 w-auto object-contain opacity-90" />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Liens légaux">
          <a href={iahomeUrl('/terms')} className="text-slate-300 hover:text-white" {...externalTab}>Mentions légales</a>
          <a href={iahomeUrl('/privacy')} className="text-slate-300 hover:text-white" {...externalTab}>Confidentialité</a>
          <a href={iahomeUrl('/contact')} className="text-slate-300 hover:text-white" {...externalTab}>Contact</a>
        </nav>
        <p className="text-slate-500">© {new Date().getFullYear()} IAHome — Stable Diffusion</p>
      </div>
    </footer>
  );
}

export default function StableDiffusionLanding() {
  const { headline, description, faqs } = stableDiffusionLandingSeo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white">
      <ProductHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.28),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">IAHome</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{headline}</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200/90 sm:text-xl">{description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={STABLEDIFFUSION_CARD_URL} className="rounded-xl bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:bg-sky-400" {...externalTab}>
              Accéder via IAHome
            </a>
            <a href="#fonctionnalites" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10">
              Voir les fonctionnalités
            </a>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="border-t border-white/10 bg-slate-950/40 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Création d’images assistée par IA</h2>
          <p className="mt-3 max-w-2xl text-slate-300/80">Un accès simple à Stable Diffusion, sécurisé par votre compte IAHome.</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c) => (
              <li key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-2xl" aria-hidden>{c.icon}</div>
                <h3 className="mt-3 font-semibold text-white">{c.label}</h3>
                <p className="mt-2 text-sm text-slate-300/75">{c.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Pour qui ?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {useCases.map((u) => (
              <article key={u.title} className="rounded-2xl border border-white/10 bg-sky-950/30 p-6">
                <h3 className="font-semibold text-white">{u.title}</h3>
                <p className="mt-2 text-sm text-slate-300/80">{u.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10 bg-slate-950/50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Questions fréquentes</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <details key={f.question} className="group rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {f.question}
                </summary>
                <p className="mt-3 text-sm text-slate-300/80">{f.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-10">
            <a href={STABLEDIFFUSION_CARD_URL} className="inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400" {...externalTab}>
              Ouvrir la fiche IAHome
            </a>
          </div>
        </div>
      </section>

      <MinimalLegalFooter />
    </div>
  );
}
