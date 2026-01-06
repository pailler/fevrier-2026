'use client';

import { useState } from 'react';

interface AddTokensModalProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    tokens?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTokensModal({ user, isOpen, onClose, onSuccess }: AddTokensModalProps) {
  const [tokensToAdd, setTokensToAdd] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const tokens = parseInt(tokensToAdd, 10);
    if (isNaN(tokens) || tokens <= 0) {
      setError('Veuillez entrer un nombre de tokens valide (supérieur à 0)');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/manual-credit-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          tokens: tokens,
          reason: reason || 'Ajout manuel par administrateur'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout des tokens');
      }

      // Succès
      setTokensToAdd('');
      setReason('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des tokens:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'ajout des tokens');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Ajouter des tokens</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Utilisateur</p>
          <p className="font-medium text-gray-900">{user.fullName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.tokens !== undefined && (
            <p className="text-sm text-gray-600 mt-2">
              Tokens actuels: <span className="font-semibold text-blue-600">{user.tokens}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de tokens à ajouter
            </label>
            <input
              type="number"
              min="1"
              value={tokensToAdd}
              onChange={(e) => setTokensToAdd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: 200"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Entrez le nombre de tokens à ajouter au solde actuel
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison (optionnel)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: Crédit manuel, Bonus, Correction..."
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ajout...
                </>
              ) : (
                'Ajouter les tokens'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
