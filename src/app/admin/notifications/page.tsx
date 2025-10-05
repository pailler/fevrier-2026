'use client';

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Notifications
        </h1>
        <p className="text-gray-600">
          Gérez les notifications système et utilisateurs
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Centre de notifications
          </h3>
          <p className="text-gray-600">
            Système de notifications en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
}