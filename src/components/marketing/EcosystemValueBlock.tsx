import Link from 'next/link';
import {
  getValueProposition,
  USE_CASES_SECTION_SUBTITLE,
  USE_CASES_SECTION_TITLE,
  type ValuePropositionVariant,
} from '@/data/ecosystemValueProposition';
import { AUDIENCE_SEGMENTS } from '@/data/audienceSegments';

type EcosystemValueBlockProps = {
  variant?: ValuePropositionVariant;
  /** hero = titre principal de page ; strip = bandeau sous le hero ; section = bloc autonome */
  layout?: 'hero' | 'strip' | 'section';
  theme?: 'light' | 'dark';
  showPillars?: boolean;
  showAudiences?: boolean;
  showProof?: boolean;
  /** Affiche uniquement la grille des piliers (sous le hero catalogue). */
  pillarsOnly?: boolean;
  /** Cas d'utilisation concrets — prioritaire sur pillarsOnly pour le marketing. */
  useCasesOnly?: boolean;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  className?: string;
  children?: React.ReactNode;
};

export default function EcosystemValueBlock({
  variant = 'home',
  layout = 'section',
  theme = 'light',
  showPillars = true,
  showAudiences = true,
  showProof = true,
  pillarsOnly = false,
  useCasesOnly = false,
  primaryCta,
  secondaryCta,
  className = '',
  children,
}: EcosystemValueBlockProps) {
  const vp = getValueProposition(variant);

  if (useCasesOnly || pillarsOnly) {
    const items = useCasesOnly ? vp.useCases : vp.pillars;
    const sectionTitle = useCasesOnly ? USE_CASES_SECTION_TITLE : 'Pourquoi choisir l\'écosystème IAHome ?';
    const sectionSubtitle = useCasesOnly ? USE_CASES_SECTION_SUBTITLE : vp.proofLine;

    return (
      <section className={`py-10 bg-white border-y border-green-100 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-green-800 mb-2">
            {useCasesOnly ? vp.proofLine : sectionSubtitle}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2">
            {sectionTitle}
          </h2>
          {useCasesOnly && (
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
              {sectionSubtitle}
            </p>
          )}
          {!useCasesOnly && <div className="mb-8" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <article
                key={item.title}
                className={`rounded-xl border p-5 shadow-sm ${
                  useCasesOnly
                    ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md transition-all'
                    : 'bg-gradient-to-br from-green-50 to-yellow-50 border-green-100'
                }`}
              >
                <div className="text-2xl mb-2" aria-hidden>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'strip') {
    return (
      <div
        className={`rounded-2xl border border-green-200/80 bg-white/90 backdrop-blur-sm shadow-sm px-6 py-5 ${className}`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-2">{vp.eyebrow}</p>
        <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">{vp.oneLiner}</p>
        {showProof && (
          <p className="mt-2 text-sm text-gray-600 font-medium">{vp.proofLine}</p>
        )}
      </div>
    );
  }

  const isHero = layout === 'hero';
  const isDark = theme === 'dark';

  const titleClass = isHero
    ? 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 ' +
      (isDark
        ? 'text-white'
        : 'bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent')
    : 'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 leading-tight ' +
      (isDark ? 'text-white' : 'text-gray-900');

  const accentClass = isDark ? 'text-yellow-300' : 'text-green-800';
  const subClass = isHero
    ? `text-lg sm:text-xl mb-4 max-w-2xl ${isDark ? 'text-blue-100' : 'text-gray-700'}`
    : `text-lg text-center max-w-3xl mx-auto mb-4 ${isDark ? 'text-blue-100' : 'text-gray-600'}`;
  const oneLinerClass = isDark
    ? 'text-sm sm:text-base text-yellow-100 font-medium mb-6 max-w-2xl border-l-4 border-yellow-400 pl-4 py-1 mx-auto'
    : isHero
      ? 'text-sm sm:text-base text-gray-600 font-medium mb-6 max-w-2xl border-l-4 border-green-500 pl-4 py-1'
      : 'text-base text-gray-800 font-medium text-center max-w-2xl mx-auto mb-6 border-l-4 border-green-500 pl-4 py-1';
  const proofClass = isDark
    ? 'text-sm text-yellow-200/90 font-semibold mb-6 text-center'
    : isHero
      ? 'text-sm text-green-900/80 font-semibold mb-6'
      : 'text-sm text-center text-green-900/80 font-semibold mb-8';
  const eyebrowClass = isDark
    ? 'text-sm font-semibold uppercase tracking-wider text-yellow-200 mb-3 text-center'
    : isHero
      ? 'text-sm font-semibold uppercase tracking-wider text-green-800 mb-3'
      : 'text-center text-sm font-semibold uppercase tracking-wider text-green-800 mb-3';
  const audienceClass = isDark
    ? 'inline-flex items-center rounded-full bg-white/15 text-white text-xs font-medium px-3 py-1'
    : 'inline-flex items-center rounded-full bg-green-100 text-green-900 text-xs font-medium px-3 py-1';

  return (
    <div className={className}>
      <p className={eyebrowClass}>{vp.eyebrow}</p>

      {isHero ? (
        <h1 className={titleClass}>
          {vp.headline}
          {vp.headlineAccent && (
            <>
              <br />
              <span className={accentClass}>{vp.headlineAccent}</span>
            </>
          )}
        </h1>
      ) : (
        <h2 className={titleClass}>
          {vp.headline}{' '}
          {vp.headlineAccent && <span className={accentClass}>{vp.headlineAccent}</span>}
        </h2>
      )}

      <p className={isHero ? subClass : subClass + ' mx-auto'}>{vp.subheadline}</p>

      <p className={oneLinerClass + (isHero || isDark ? '' : '')}>{vp.oneLiner}</p>

      {showProof && <p className={proofClass}>{vp.proofLine}</p>}

      {(primaryCta || secondaryCta) && (
        <div
          className={`flex flex-col sm:flex-row gap-3 mb-6 ${isHero ? '' : 'justify-center'}`}
        >
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="bg-gradient-to-r from-yellow-500 to-green-600 text-white px-6 py-3.5 rounded-xl hover:from-yellow-600 hover:to-green-700 transition-all font-semibold text-center shadow-md"
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="border-2 border-green-600 text-green-800 hover:bg-green-50 px-6 py-3.5 rounded-xl font-semibold text-center transition-colors"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      )}

      {children}

      {showAudiences && (
        <div className={`flex flex-wrap gap-2 mb-6 ${isHero && !isDark ? '' : 'justify-center'}`}>
          {AUDIENCE_SEGMENTS.map((segment) => (
            <Link
              key={segment.id}
              href={segment.primaryHref}
              className={`${audienceClass} hover:opacity-90 transition-opacity`}
            >
              {segment.icon} {segment.shortTitle}
            </Link>
          ))}
        </div>
      )}

      {showPillars && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {vp.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-xl bg-white/80 border border-green-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2" aria-hidden>
                {pillar.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
