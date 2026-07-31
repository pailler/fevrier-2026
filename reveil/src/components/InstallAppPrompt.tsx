'use client';

import { useState } from 'react';
import { useInstallPrompt, type InstallPromptKind } from '@/hooks/useInstallPrompt';

interface InstallAppPromptProps {
  nightMode?: boolean;
  variant?: 'banner' | 'panel';
}

function IosSteps({ nightMode }: { nightMode: boolean }) {
  const stepClass = nightMode ? 'text-slate-300' : 'text-slate-700';
  const muted = nightMode ? 'text-slate-500' : 'text-slate-500';

  return (
    <ol className={`list-decimal list-inside space-y-2 text-sm ${stepClass}`}>
      <li>
        Touchez <span className="font-medium">Partager</span>{' '}
        <span className={muted}>(icône carré avec flèche vers le haut)</span>
      </li>
      <li>
        Faites défiler et choisissez <span className="font-medium">Sur l’écran d’accueil</span>
      </li>
      <li>
        Confirmez avec <span className="font-medium">Ajouter</span>
      </li>
    </ol>
  );
}

function ManualSteps({ nightMode }: { nightMode: boolean }) {
  const stepClass = nightMode ? 'text-slate-300' : 'text-slate-700';

  return (
    <ol className={`list-decimal list-inside space-y-2 text-sm ${stepClass}`}>
      <li>Ouvrez le menu du navigateur (⋮ ou ⋯)</li>
      <li>
        Choisissez <span className="font-medium">Installer l’application</span> ou{' '}
        <span className="font-medium">Ajouter à l’écran d’accueil</span>
      </li>
      <li>Validez l’installation</li>
    </ol>
  );
}

function kindLabel(kind: InstallPromptKind): string {
  switch (kind) {
    case 'native':
      return 'Installation en un clic disponible';
    case 'ios':
      return 'Installation via Safari';
    case 'manual':
      return 'Installation manuelle';
    default:
      return '';
  }
}

export default function InstallAppPrompt({ nightMode = true, variant = 'banner' }: InstallAppPromptProps) {
  const { kind, dismissed, dismiss, install } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (kind === 'loading' || kind === 'installed') return null;
  if (variant === 'banner' && dismissed) return null;

  const cardClass =
    variant === 'banner'
      ? `rounded-2xl border px-4 py-3 mb-4 ${
          nightMode ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50'
        }`
      : `rounded-2xl border p-4 mb-6 ${
          nightMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        }`;

  const titleClass = nightMode ? 'text-indigo-200' : 'text-indigo-900';
  const textClass = nightMode ? 'text-slate-400' : 'text-slate-600';

  const handleInstall = async () => {
    if (kind === 'ios') {
      setShowIosHelp((v) => !v);
      return;
    }
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  const primaryLabel =
    kind === 'native'
      ? installing
        ? 'Installation…'
        : 'Installer sur l’écran d’accueil'
      : kind === 'ios'
        ? showIosHelp
          ? 'Masquer les instructions'
          : 'Comment installer (iPhone / iPad)'
        : 'Voir comment installer';

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3">
        <img
          src="/icons/reveil-192.png"
          alt=""
          width={48}
          height={48}
          className="rounded-xl shrink-0 shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className={`font-medium text-sm ${titleClass}`}>
            {variant === 'banner' ? 'Installer l’application' : 'Application sur l’écran d’accueil'}
          </p>
          <p className={`text-xs mt-0.5 ${textClass}`}>
            {kindLabel(kind)} — réveil plus fiable en mode veille, icône dédiée, plein écran.
          </p>

          {(kind === 'ios' && (showIosHelp || variant === 'panel')) && (
            <div className="mt-3">
              <IosSteps nightMode={nightMode} />
            </div>
          )}

          {(kind === 'manual' && variant === 'panel') && (
            <div className="mt-3">
              <ManualSteps nightMode={nightMode} />
            </div>
          )}

          <div className={`flex flex-wrap gap-2 mt-3 ${variant === 'banner' ? '' : ''}`}>
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={installing}
              className="min-h-[44px] rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {primaryLabel}
            </button>
            {variant === 'banner' && (
              <button
                type="button"
                onClick={dismiss}
                className={`min-h-[44px] rounded-xl px-3 py-2 text-sm ${
                  nightMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Plus tard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
