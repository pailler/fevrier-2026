'use client';

import { useState } from 'react';

interface PsiTransferAccessButtonProps {
  user: any;
  onAccessGranted: (url: string) => void;
  onAccessDenied: (reason: string) => void;
}

export default function PsiTransferAccessButton({ user, onAccessGranted, onAccessDenied }: PsiTransferAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async () => {
    if (!user) {
      onAccessDenied('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📁 PsiTransfer: Début de la procédure d\'accès...');
      
      // 1. Incrémenter le compteur d'accès
      console.log('📊 PsiTransfer: Incrémentation du compteur d\'accès...');
      const incrementResponse = await fetch('/api/increment-module-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'psitransfer'
        })
      });
      
      if (incrementResponse.ok) {
        const incrementData = await incrementResponse.json();
        console.log('✅ PsiTransfer: Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          console.log('❌ PsiTransfer: Quota dépassé');
          onAccessDenied('Quota d\'utilisation dépassé. Contactez l\'administrateur.');
          return;
        }
        console.log('⚠️ PsiTransfer: Erreur incrémentation compteur, continuons...');
      }
      
      // 2. Ouvrir PsiTransfer dans un nouvel onglet
      console.log('🔗 PsiTransfer: Ouverture dans un nouvel onglet...');
      const psitransferUrl = 'https://psitransfer.iahome.fr';
      window.open(psitransferUrl, '_blank');
      console.log('✅ PsiTransfer: Ouverture de PsiTransfer');
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture
      
    } catch (error) {
      console.error('❌ PsiTransfer: ERREUR GÉNÉRALE:', error);
      onAccessDenied('Erreur lors de l\'ouverture de PsiTransfer. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg ${
          isLoading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Chargement...</span>
          </div>
        ) : (
          '📁 Accéder à PsiTransfer'
        )}
      </button>
    </div>
  );
}
