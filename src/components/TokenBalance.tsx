'use client';
import Link from 'next/link';
import { useTokenContext } from '../contexts/TokenContext';

interface TokenBalanceProps {
  className?: string;
  showIcon?: boolean;
  linkToPricing?: boolean;
}

export default function TokenBalance({ className = '', showIcon = true, linkToPricing = true }: TokenBalanceProps) {
  const { tokens, isLoading: loading, error } = useTokenContext();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const getTokenColor = (tokenCount: number) => {
    if (tokenCount === 0) return 'text-red-200';
    if (tokenCount < 50) return 'text-yellow-200';
    return 'text-green-200';
  };

  const content = (
    <>
      {showIcon && <span className="text-2xl">🪙</span>}
      <span className={`font-bold ${getTokenColor(tokens || 0)}`}>
        {tokens !== null ? tokens : 0}
      </span>
      {error && (
        <span className="text-red-500 text-xs" title={error}>
          ⚠️
        </span>
      )}
      {!loading && !error && tokens === 0 && (
        <span className="text-yellow-500 text-xs" title="Aucun token disponible">
          ⚠️
        </span>
      )}
    </>
  );

  if (linkToPricing) {
    return (
      <Link
        href="/pricing2"
        className={`inline-flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer ${className}`}
        title="Acheter des tokens"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {content}
    </div>
  );
}