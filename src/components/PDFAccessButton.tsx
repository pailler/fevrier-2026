'use client';

import { useState } from 'react';

interface PDFAccessButtonProps {
  user: any;
  onAccessGranted: (url: string) => void;
  onAccessDenied: (reason: string) => void;
}

export default function PDFAccessButton({ user, onAccessGranted, onAccessDenied }: PDFAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async () => {
    if (!user) {
      onAccessDenied('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📄 PDF+: Début de la procédure d\'accès...');
      
      // ÉTAPE 1: Vérifier l'autorisation d'accès
      console.log('🔐 PDF+: ÉTAPE 1 - Vérification de l\'autorisation...');
      const accessResponse = await fetch('/api/check-module-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: 'pdf'
        })
      });
      
      if (!accessResponse.ok) {
        console.log('❌ PDF+: ÉTAPE 1 ÉCHEC - Pas d\'autorisation');
        onAccessDenied('Autorisation d\'accès refusée');
        return;
      }
      
      const accessData = await accessResponse.json();
      if (!accessData.hasAccess) {
        console.log('❌ PDF+: ÉTAPE 1 ÉCHEC - Accès refusé');
        onAccessDenied('Accès refusé');
        return;
      }
      
      console.log('✅ PDF+: ÉTAPE 1 RÉUSSIE - Autorisation confirmée');
      
      // ÉTAPE 2: Incrémenter le compteur d'usage
      console.log('📊 PDF+: ÉTAPE 2 - Incrémentation du compteur...');
      const incrementResponse = await fetch('/api/increment-module-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: 'pdf'
        })
      });
      
      if (incrementResponse.ok) {
        const incrementData = await incrementResponse.json();
        console.log('✅ PDF+: ÉTAPE 2 RÉUSSIE - Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          console.log('❌ PDF+: ÉTAPE 2 ÉCHEC - Quota dépassé');
          onAccessDenied('Quota d\'utilisation dépassé. Contactez l\'administrateur.');
          return;
        }
        console.log('⚠️ PDF+: ÉTAPE 2 WARNING - Erreur compteur, continuons...');
      }
      
      // ÉTAPE 3: Ouvrir PDF+ dans un nouvel onglet
      console.log('🔗 PDF+: ÉTAPE 3 - Ouverture de PDF+ dans un nouvel onglet...');
      const pdfUrl = 'https://pdf.iahome.fr';
      window.open(pdfUrl, '_blank');
      console.log('✅ PDF+: ÉTAPE 3 RÉUSSIE - URL finale:', pdfUrl);
      
      onAccessGranted(pdfUrl);
      
    } catch (error) {
      console.error('❌ PDF+: ERREUR GÉNÉRALE:', error);
      onAccessDenied('Erreur lors de l\'ouverture de PDF+. Veuillez réessayer.');
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
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Chargement...</span>
          </div>
        ) : (
          '📄 Accéder à PDF+'
        )}
      </button>
    </div>
  );
}
