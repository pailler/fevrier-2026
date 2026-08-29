import Image from 'next/image';
import { getCardSeo } from '@/data/card-seo';
import {
  CODE_LEARNING_CARD_URL,
} from '@/utils/productLandingHosts';

const IAHOME_ORIGIN = 'https://iahome.fr';

const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const concepts = [
  { icon: '📦', label: 'Variables', detail: 'Stocker une valeur et la réutiliser' },
  { icon: '🔁', label: 'Boucles', detail: 'Répéter une action plusieurs fois' },
  { icon: '❓', label: 'Conditions', detail: 'Faire un choix selon une situation' },
  { icon: '🧠', label: 'Logique', detail: 'Combiner ET / OU pour décider' },
  { icon: '⚙️', label: 'Fonctions', detail: 'Regrouper des instructions réutilisables' },
  { icon: '📋', label: 'Tableaux & objets', detail: 'Organiser plusieurs données' },
];

const useCases = [
  {
    title: 'À la maison',
    text: 'Un parcours guidé pour initier un enfant au code sans installer de logiciel.',
  },
  {
    title: 'En classe ou en club',
    text: '35 exercices progressifs adaptés aux tranches 6–8, 9–11 et 12–14 ans.',
  },
  {
    title: 'Avant Scratch ou Python',
    text: 'Des notions universelles qui servent de base à tous les langages.',
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
          <a
            href="/"
            className="truncate text-sm font-semibold text-white hover:text-amber-200"
          >
            Code Learning
          </a>
        </div>

        <nav
          className="flex flex-wrap items-center gap-1 sm:gap-2"
          aria-label="Navigation de la page"
        >
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
            href={CODE_LEARNING_CARD_URL}
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

export default function CodeLearningLanding() {
  const seoEntry = getCardSeo('code-learning');
  const faqs = seoEntry?.faqs ?? [];
  const description =
    seoEntry?.product.description ??
    'Application éducative pour apprendre la programmation aux enfants de 6 à 14 ans.';

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 text-white">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-indigo-200">
            6–14 ans · 35 exercices · Gratuit en ligne
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            Apprendre le code en s&apos;amusant
          </h1>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-indigo-100">{description}</p>

          <div className="flex flex-wrap gap-4">
            <a
              href={CODE_LEARNING_CARD_URL}
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-amber-300"
              {...externalTab}
            >
              Commencer gratuitement
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
            <h2 className="mb-8 text-2xl font-bold text-white">Ce que l&apos;enfant apprend</h2>
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
            <h2 className="text-2xl font-bold text-white">Prêt à commencer ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Lancez le premier exercice en quelques clics — gratuit pour les utilisateurs IAHome.
            </p>
            <a
              href={CODE_LEARNING_CARD_URL}
              className="mt-6 inline-block rounded-xl bg-amber-400 px-8 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-amber-300"
              {...externalTab}
            >
              Ouvrir Code Learning
            </a>
          </div>
        </section>
      </main>
      <MinimalLegalFooter />
    </>
  );
}
