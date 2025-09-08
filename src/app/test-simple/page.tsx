'use client';

export default function TestSimple() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Test Simple - Application Fonctionnelle
        </h1>
        <p className="text-gray-600 mb-4">
          Si vous voyez cette page, l'application Next.js fonctionne correctement.
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Application Next.js : OK
        </div>
        <div className="mt-4">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Retour à la page d'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
