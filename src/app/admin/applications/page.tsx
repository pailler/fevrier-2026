'use client';

export default function AdminApplications() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Applications actives
        </h1>
        <p className="text-gray-600">
          Surveillez les applications et services en cours d'exécution
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Monitoring des applications
          </h3>
          <p className="text-gray-600">
            Interface de surveillance en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
}


