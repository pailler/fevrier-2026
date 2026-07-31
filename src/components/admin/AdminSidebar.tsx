'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import TokenBalance from '../TokenBalance';

const navigation = [
  { name: 'Utilisateurs', href: '/admin/users', icon: '👥' },
  { name: 'Applications', href: '/admin/applications', icon: '📱' },
  { name: 'Paiements', href: '/admin/payments', icon: '💳' },
  { name: 'Crédits', href: '/admin/credits', icon: '🪙' },
  { name: 'Contenu', href: '/admin/content', icon: '📝' },
  { name: 'LinkedIn', href: '/admin/linkedin', icon: '💼' },
  { name: 'Campagnes', href: '/admin/campaigns', icon: '📢' },
  { name: 'Événements', href: '/admin/events', icon: '📋' },
  { name: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  { name: 'Fichiers volumineux', href: '/admin/large-files', icon: '📁' },
  { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useCustomAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 relative ${
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
      
      <nav className="px-4 pb-32">
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

      {/* Section utilisateur en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        {!isCollapsed && user && (
          <div className="space-y-3">
            {/* Tokens */}
            <div className="flex items-center justify-between">
              <TokenBalance className="text-base" />
            </div>

            {/* Bouton Mes applis */}
            <Link
              href="/account"
              className="w-full bg-blue-600 text-white font-semibold px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>📱</span>
              <span>Mes applis</span>
            </Link>

            {/* Bouton déconnexion */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        )}

        {/* Version collapsed */}
        {isCollapsed && user && (
          <div className="flex flex-col items-center space-y-2">
            <TokenBalance className="text-sm" />
            <Link
              href="/account"
              className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
              title="Mes applis"
            >
              📱
            </Link>
            <button
              onClick={handleSignOut}
              className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
              title="Se déconnecter"
            >
              🚪
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


