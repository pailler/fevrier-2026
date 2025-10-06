'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: '📊' },
  { name: 'Utilisateurs', href: '/admin/users', icon: '👥' },
  { name: 'Modules', href: '/admin/modules', icon: '🧩' },
  { name: 'Paiements', href: '/admin/payments', icon: '💳' },
  { name: 'Tokens', href: '/admin/tokens', icon: '🔑' },
  { name: 'Applications', href: '/admin/applications', icon: '📱' },
  { name: 'Statistiques', href: '/admin/statistics', icon: '📈' },
  { name: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-xl">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-100 text-red-700 border-r-2 border-red-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}


