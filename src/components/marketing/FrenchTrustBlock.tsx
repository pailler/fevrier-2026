import Link from 'next/link';
import {
  FRENCH_TRUST_COMMITMENTS_TITLE,
  getFrenchTrust,
  type FrenchTrustVariant,
} from '@/data/frenchTrust';

type FrenchTrustBlockProps = {
  variant?: FrenchTrustVariant;
  density?: 'full' | 'compact' | 'band';
  showCta?: boolean;
  className?: string;
};

export default function FrenchTrustBlock({
  variant = 'home',
  density = 'full',
  showCta = true,
  className = '',
}: FrenchTrustBlockProps) {
  const trust = getFrenchTrust(variant);
  const isBand = density === 'band';
  const isCompact = density === 'compact' || isBand;

  if (isBand) {
    return (
      <section
        className={`border-y border-blue-100 bg-gradient-to-r from-blue-50 via-white to-red-50/40 ${className}`}
        aria-label="Engagements français RGPD"
      >
        <div className="h-1 bg-gradient-to-r from-blue-700 via-white to-red-600" aria-hidden />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trust.badges.map((badge) => (
              <div key={badge.label} className="flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden>
                  {badge.icon}
                </span>
                <div>
                  <div className="text-sm font-bold text-gray-900">{badge.label}</div>
                  <div className="text-xs text-gray-600 leading-snug mt-0.5">{badge.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 border-y border-blue-100 ${className}`}
      aria-labelledby="french-trust-heading"
    >
      <div className="h-1.5 bg-gradient-to-r from-blue-700 via-white to-red-600" aria-hidden />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 sm:py-16">
        <div className={`max-w-3xl ${isCompact ? 'mx-auto text-center' : 'mx-auto text-center'} mb-10`}>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-800 mb-3">
            {trust.eyebrow}
          </p>
          <h2 id="french-trust-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {trust.headline}
            {trust.headlineAccent && (
              <>
                <br />
                <span className="text-blue-800">{trust.headlineAccent}</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3">{trust.subheadline}</p>
          <p className="text-sm font-medium text-blue-900/80">{trust.promise}</p>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {trust.badges.map((badge) => (
            <article
              key={badge.label}
              className="rounded-xl border border-blue-200/80 bg-white shadow-sm p-4 sm:p-5 text-center hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2" aria-hidden>
                {badge.icon}
              </div>
              <div className="text-sm sm:text-base font-bold text-gray-900 mb-1">{badge.label}</div>
              <p className="text-xs text-gray-600 leading-snug">{badge.detail}</p>
            </article>
          ))}
        </div>

        {!isCompact && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {trust.pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl mb-3" aria-hidden>
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-5 text-center">
                {FRENCH_TRUST_COMMITMENTS_TITLE}
              </h3>
              <ul className="space-y-3">
                {trust.commitments.map((c) => (
                  <li key={c.label} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold shrink-0 mt-0.5" aria-hidden>
                      ✓
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{c.label}</span>
                      <span className="text-sm text-gray-600"> — {c.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {showCta && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              href="/contact"
              className="inline-flex justify-center items-center rounded-xl bg-blue-700 hover:bg-blue-800 px-6 py-3.5 font-semibold text-white shadow-md transition-colors"
            >
              Contacter le support →
            </Link>
            <Link
              href="/privacy"
              className="inline-flex justify-center items-center rounded-xl border border-blue-300 text-blue-800 hover:bg-blue-50 px-6 py-3.5 font-semibold transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
