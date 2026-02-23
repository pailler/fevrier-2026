'use client';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/"
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          
          <Link 
            href="/account"
            className="inline-block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Mes applications
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    </div>
  );
}

