import type { Metadata } from 'next';
import Link from 'next/link';
import CarnetAnnoncesClient from './CarnetAnnoncesClient';

export const metadata: Metadata = {
  title: 'Carnet des annonces | Recherche immobilière',
  description: 'Liste des biens immobiliers enregistrés dans la base.',
};

export default function CarnetAnnoncesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Carnet des annonces</h1>
            <p className="text-slate-600 text-sm mt-1">
              Biens ajoutés à la base (mise à jour automatique après les recherches).
            </p>
          </div>
          <Link
            href="/real-estate"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shrink-0"
          >
            Recherche & critères (compte)
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CarnetAnnoncesClient />
      </main>
    </div>
  );
}
