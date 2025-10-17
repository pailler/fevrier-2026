'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [packageInfo, setPackageInfo] = useState<{
    type: string;
    tokens: number;
    price: number;
  } | null>(null);

  const packageDetails = {
    basic: { tokens: 100, price: 4.99, name: 'Pack Basique' },
    standard: { tokens: 500, price: 19.99, name: 'Pack Standard' },
    premium: { tokens: 1000, price: 29.99, name: 'Pack Premium' },
    enterprise: { tokens: 10000, price: 199, name: 'Pack Entreprise' }
  };

  useEffect(() => {
    const packageType = searchParams.get('package');
    if (packageType && packageDetails[packageType as keyof typeof packageDetails]) {
      const details = packageDetails[packageType as keyof typeof packageDetails];
      setPackageInfo({
        type: details.name,
        tokens: details.tokens,
        price: details.price
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Merci pour votre achat. Vos tokens ont été crédités sur votre compte.
            </p>

            {packageInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  {packageInfo.type}
                </h2>
                <div className="space-y-1 text-green-700">
                  <p>💰 Montant payé : {packageInfo.price}€</p>
                  <p>🪙 Tokens crédités : {packageInfo.tokens}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Link
                href="/encours"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Voir mes tokens
              </Link>
              <div className="text-sm text-gray-500">
                <Link href="/pricing" className="text-blue-600 hover:underline">
                  Retour aux tarifs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}