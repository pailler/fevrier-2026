'use client';

export default function AdminStatistics() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Statistiques
        </h1>
        <p className="text-gray-600">
          Analysez les performances et l'utilisation de la plateforme
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tableaux de bord analytiques
          </h3>
          <p className="text-gray-600">
            Outils d'analyse en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
}


