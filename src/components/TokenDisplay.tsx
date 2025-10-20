'use client';
import { useTokenContext } from '../contexts/TokenContext';

interface TokenDisplayProps {
  className?: string;
  showIcon?: boolean;
}

export default function TokenDisplay({ className = '', showIcon = true }: TokenDisplayProps) {
  const { tokens, isLoading, error } = useTokenContext();

  if (isLoading) {
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

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {showIcon && <span className="text-lg">🪙</span>}
      <span className={`font-medium ${getTokenColor(tokens || 0)}`}>
        {tokens !== null ? tokens : 0}
      </span>
      {error && (
        <span className="text-red-500 text-xs" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
}
