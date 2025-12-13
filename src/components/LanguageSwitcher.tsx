'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Utiliser le router de next-intl qui gère automatiquement les locales
      // Avec localePrefix: 'as-needed', le français n'a pas de préfixe mais l'anglais utilise /en
      const currentPath = pathname || '/';
      router.replace(currentPath, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 border border-white/20 rounded-lg p-1 bg-white/5 backdrop-blur-sm shadow-sm">
      <button
        onClick={() => switchLocale('fr')}
        className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${
          locale === 'fr'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        disabled={isPending}
        title="Version française"
        aria-label="Switch to French"
      >
        🇫🇷 FR
      </button>
      <div className="w-px h-5 bg-white/20"></div>
      <button
        onClick={() => switchLocale('en')}
        className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${
          locale === 'en'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        disabled={isPending}
        title="English version"
        aria-label="Switch to English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
}

