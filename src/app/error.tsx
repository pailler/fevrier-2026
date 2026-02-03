'use client';

import { useEffect } from 'react';

/**
 * Boundary d'erreur au niveau racine.
 * Ne pas utiliser global-error.tsx ici : son chunk déclenche "originalFactory is undefined"
 * avec le next-flight-client-entry-loader. Ce error.tsx est rendu dans le layout normal.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error?.message);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      }}
    >
      <div
        style={{
          maxWidth: 448,
          width: '100%',
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>
          Une erreur est survenue
        </h2>
        <p style={{ color: '#4b5563', marginBottom: 24 }}>
          {error?.message || 'Erreur inattendue.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              color: '#374151',
              borderRadius: 8,
              fontWeight: 500,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
