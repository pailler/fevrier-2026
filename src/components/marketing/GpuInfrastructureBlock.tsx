import Link from 'next/link';
import {
  getGpuInfrastructure,
  GPU_INFRA_SECTION_TITLE,
  GPU_INFRA_WORKLOADS_TITLE,
  type GpuInfrastructureVariant,
} from '@/data/gpuInfrastructure';

type GpuInfrastructureBlockProps = {
  variant?: GpuInfrastructureVariant;
  /** Affiche le bandeau complet (stats + piliers + workloads + stack). compact = stats + promesse seulement. */
  density?: 'full' | 'compact';
  showCta?: boolean;
  className?: string;
};

export default function GpuInfrastructureBlock({
  variant = 'home',
  density = 'full',
  showCta = true,
  className = '',
}: GpuInfrastructureBlockProps) {
  const infra = getGpuInfrastructure(variant);
  const isCompact = density === 'compact';

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white ${className}`}
      aria-labelledby="gpu-infra-heading"
    >
      {/* Grille décorative */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 sm:py-20">
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-cyan-300/90 mb-3">
            {infra.eyebrow}
          </p>
          <h2 id="gpu-infra-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {infra.headline}
            {infra.headlineAccent && (
              <>
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {infra.headlineAccent}
                </span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-4">{infra.subheadline}</p>
          <p className="text-sm sm:text-base font-medium text-cyan-200/90 border-l-4 border-cyan-400 pl-4 text-left sm:text-center sm:border-l-0 sm:border-t-4 sm:pt-4 sm:pl-0 max-w-2xl mx-auto">
            {infra.promise}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {infra.stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-center hover:border-cyan-400/40 transition-colors"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base font-semibold text-white mb-1">{stat.label}</div>
              {stat.detail && (
                <div className="text-xs text-slate-400 leading-snug">{stat.detail}</div>
              )}
            </article>
          ))}
        </div>

        {!isCompact && (
          <>
            {/* Piliers infrastructure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 sm:mb-16">
              {infra.pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-5 hover:border-violet-400/30 transition-all"
                >
                  <div className="text-2xl mb-3" aria-hidden>
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{pillar.description}</p>
                </article>
              ))}
            </div>

            {/* Workloads GPU */}
            <div className="mb-12 sm:mb-16">
              <h3 className="text-lg sm:text-xl font-bold text-center text-white mb-2">
                {GPU_INFRA_WORKLOADS_TITLE}
              </h3>
              <p className="text-center text-sm text-slate-400 mb-6 max-w-xl mx-auto">
                Une seule station, plusieurs familles de traitement — toutes routées depuis iahome.fr
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {infra.workloads.map((w) => (
                  <div
                    key={w.label}
                    className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span aria-hidden>{w.icon}</span>
                      <span className="text-sm font-bold text-cyan-200">{w.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{w.examples}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flux + stack technique */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-6">{GPU_INFRA_SECTION_TITLE}</h3>
                <ol className="space-y-4">
                  {infra.flowSteps.map((step, i) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm sm:text-base text-slate-200 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-6">Stack de production</h3>
                <ul className="space-y-3">
                  {infra.stack.map((item) => (
                    <li
                      key={item.label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-white/5 bg-slate-900/40 px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-cyan-200">{item.label}</span>
                      <span className="text-xs text-slate-400">{item.role}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-slate-500 leading-relaxed">
                  Station Windows de production · GPU NVIDIA CUDA · modèles Hugging Face &amp; Diffusers
                  pré-installés · tunnel Cloudflare sans port forwarding
                </p>
              </div>
            </div>
          </>
        )}

        {showCta && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10 sm:mt-14">
            <Link
              href="/applications"
              className="inline-flex justify-center items-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-900/40 hover:from-cyan-400 hover:to-violet-500 transition-all"
            >
              Explorer les apps GPU →
            </Link>
            <Link
              href="/pricing2"
              className="inline-flex justify-center items-center rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Voir les crédits
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
