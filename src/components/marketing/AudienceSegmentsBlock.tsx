import Link from 'next/link';
import {
  AUDIENCE_SEGMENTS,
  AUDIENCE_SEGMENTS_SECTION_SUBTITLE,
  AUDIENCE_SEGMENTS_SECTION_TITLE,
  type AudienceSegmentId,
} from '@/data/audienceSegments';

type AudienceSegmentsBlockProps = {
  /** Mettre en avant un segment (ex. page applications → professionnels) */
  highlight?: AudienceSegmentId;
  showCatalogLinks?: boolean;
  className?: string;
};

export default function AudienceSegmentsBlock({
  highlight,
  showCatalogLinks = true,
  className = '',
}: AudienceSegmentsBlockProps) {
  return (
    <section
      className={`py-14 sm:py-16 bg-white border-y border-gray-100 ${className}`}
      aria-labelledby="audience-segments-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-green-800 mb-2">
            Grand public · Professionnels · Événementiel
          </p>
          <h2 id="audience-segments-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {AUDIENCE_SEGMENTS_SECTION_TITLE}
          </h2>
          <p className="text-base text-gray-600">{AUDIENCE_SEGMENTS_SECTION_SUBTITLE}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {AUDIENCE_SEGMENTS.map((segment) => {
            const isHighlight = highlight === segment.id;
            return (
              <article
                key={segment.id}
                className={`flex flex-col rounded-2xl border-2 p-6 sm:p-7 transition-all ${segment.accent} ${
                  isHighlight ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" aria-hidden>
                    {segment.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-75">{segment.badge}</p>
                    <h3 className="text-xl font-bold">{segment.title}</h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4 opacity-90">{segment.description}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {segment.useCases.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-bold shrink-0" aria-hidden>
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {showCatalogLinks && (
                  <Link
                    href={segment.primaryHref}
                    className="inline-flex justify-center items-center rounded-xl bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors mt-auto"
                  >
                    {segment.shortTitle} — voir les outils →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
