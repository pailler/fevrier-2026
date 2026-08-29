'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const IAHOME_ORIGIN = 'https://iahome.fr';
const CV_CARD_URL = `${IAHOME_ORIGIN}/card/cv-generator`;
const externalTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

function iahomeUrl(path: string) {
  return `${IAHOME_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const FEATURES = [
  {
    icon: '📥',
    label: 'Import CV ou LinkedIn',
    detail: 'Uploadez un PDF/DOCX ou collez votre profil LinkedIn — l’IA pré-remplit le formulaire.',
  },
  {
    icon: '🎯',
    label: 'Optimisation ATS',
    detail: 'Adaptez votre CV à une offre avec mots-clés et score de compatibilité recruteur.',
  },
  {
    icon: '✨',
    label: 'Rédaction IA',
    detail: 'Bullet points percutants, résumé professionnel et compétences alignées sur le poste.',
  },
  {
    icon: '📄',
    label: 'Modèles & export PDF',
    detail: 'Moderne, classique ou minimal — aperçu instantané et export PDF en un clic.',
  },
  {
    icon: '✉️',
    label: 'Lettre de motivation',
    detail: 'Générez une lettre assortie à votre CV et à l’annonce, en quelques secondes.',
  },
  {
    icon: '🔒',
    label: 'Données non conservées',
    detail: 'Vos informations ne sont pas stockées sur nos serveurs après la session.',
  },
];

const USE_CASES = [
  {
    title: 'Candidats en recherche',
    text: 'Structurez un CV clair, adapté aux ATS et prêt à envoyer en quelques minutes.',
  },
  {
    title: 'Reconversion & évolution',
    text: 'Reformulez votre parcours pour mettre en avant les compétences transférables.',
  },
  {
    title: 'Candidature ciblée',
    text: 'Collez une offre d’emploi et laissez l’IA aligner le contenu sur les attentes du recruteur.',
  },
];

const STEPS = [
  { n: '1', title: 'Importez ou saisissez', text: 'CV existant, profil LinkedIn ou formulaire guidé.' },
  { n: '2', title: 'Collez l’offre (optionnel)', text: 'L’IA aligne le contenu sur les attentes du recruteur.' },
  { n: '3', title: 'Générez & exportez', text: 'CV optimisé, score ATS, lettre de motivation, PDF.' },
];

const FAQS = [
  {
    question: 'Qu’est-ce que le Générateur de CV IA ?',
    answer:
      'Un outil IAHome qui vous aide à créer un CV professionnel optimisé pour les logiciels ATS (Applicant Tracking Systems), avec import depuis PDF/DOCX ou LinkedIn, adaptation à une offre et export PDF.',
  },
  {
    question: 'Comment accéder au générateur ?',
    answer:
      'Depuis IAHome, activez le module « Générateur de CV IA » (100 crédits par accès). Vous obtenez ensuite un accès à l’éditeur sur cv.iahome.fr pour toute la session.',
  },
  {
    question: 'Mes données sont-elles conservées ?',
    answer:
      'Non. Vos informations ne sont pas stockées durablement sur nos serveurs après la session. Vous gardez le contrôle via l’export PDF.',
  },
  {
    question: 'Puis-je générer une lettre de motivation ?',
    answer:
      'Oui. L’éditeur inclut la génération d’une lettre de motivation cohérente avec votre CV et l’offre d’emploi visée.',
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
          <a href="/" className="truncate text-sm font-semibold text-white hover:text-blue-200">
            Générateur de CV IA
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navigation de la page">
          <a
            href="#fonctionnalites"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            Fonctionnalités
          </a>
          <a
            href="#comment-ca-marche"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            Comment ça marche
          </a>
          <a
            href="#faq"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            FAQ
          </a>
          <a
            href={CV_CARD_URL}
            className="ml-1 rounded-lg bg-blue-400 px-4 py-2 text-sm font-semibold text-indigo-950 transition hover:bg-blue-300"
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

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      router.replace(`/cv?token=${encodeURIComponent(token)}`);
    }
  }, [token, router]);

  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-400" />
          <p className="text-sm text-indigo-200">Ouverture de l’application…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-900 text-white">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-200">
            CV optimisé ATS · GPT-4o-mini · 100 crédits par accès
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            Votre CV professionnel, optimisé ATS, en quelques minutes
          </h1>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-indigo-100">
            Importez un CV existant ou votre profil LinkedIn, adaptez-le à une offre d’emploi et
            exportez un document prêt à envoyer — avec lettre de motivation incluse.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={CV_CARD_URL}
              className="rounded-xl bg-blue-400 px-6 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-blue-300"
              {...externalTab}
            >
              Accéder via IAHome
            </a>
            <Link
              href="/cv"
              className="rounded-xl border border-white/25 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Ouvrir l’éditeur
            </Link>
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
              {FEATURES.map((item) => (
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

        <section id="comment-ca-marche" className="py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Comment ça marche</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((item) => (
                <article key={item.n} className="rounded-2xl border border-white/10 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-lg font-bold text-indigo-950">
                    {item.n}
                  </div>
                  <h3 className="text-lg font-semibold text-blue-200">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-indigo-100">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">Pour qui ?</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {USE_CASES.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-blue-300">{item.title}</h3>
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
              {FAQS.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-white/10 bg-indigo-950/30 p-6">
                  <h3 className="text-lg font-semibold text-blue-200">{faq.question}</h3>
                  <p className="mt-3 leading-relaxed text-indigo-100">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-indigo-950 py-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Prêt à booster votre candidature ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Activez le Générateur de CV IA depuis IAHome et structurez un CV clair et convaincant.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href={CV_CARD_URL}
                className="inline-block rounded-xl bg-blue-400 px-8 py-3 font-semibold text-indigo-950 shadow-lg transition hover:bg-blue-300"
                {...externalTab}
              >
                Ouvrir sur IAHome
              </a>
              <Link
                href="/cv"
                className="inline-block rounded-xl border border-white/25 px-8 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Lancer l’éditeur
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MinimalLegalFooter />
    </>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-400" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
