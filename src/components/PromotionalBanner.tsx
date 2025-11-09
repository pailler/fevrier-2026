'use client';
import { useState } from 'react';
import Link from 'next/link';

interface PromotionalBannerProps {
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  dismissible?: boolean;
}

export default function PromotionalBanner({
  message = "🎉 Nouveau : Découvrez nos outils IA professionnels !",
  ctaText = "Voir les services",
  ctaLink = "/services",
  variant = 'default',
  dismissible = true
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantStyles = {
    default: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
    success: 'bg-gradient-to-r from-green-600 to-emerald-700 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    info: 'bg-gradient-to-r from-purple-600 to-pink-700 text-white'
  };

  return (
    <div className={`${variantStyles[variant]} py-3 px-4 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{message.split(' ')[0]}</span>
          <span className="text-sm md:text-base flex-1">{message.substring(message.indexOf(' ') + 1)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={ctaLink}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
          >
            {ctaText} →
          </Link>
          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


