'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, Search, Brain, Camera, Home } from 'lucide-react';

const navigationItems = [
  {
    name: 'Accueil',
    href: '/',
    icon: Home,
    description: 'Retour à l\'accueil'
  },
  {
    name: 'Portfolio Photo',
    href: '/photo-portfolio',
    icon: Camera,
    description: 'Portfolio photo principal'
  },
  {
    name: 'Upload Photos',
    href: '/photo-upload',
    icon: Upload,
    description: 'Uploader vos photos privées'
  },
  {
    name: 'Test Reconnaissance',
    href: '/photo-recognition-test',
    icon: Brain,
    description: 'Tester la reconnaissance IA'
  },
  {
    name: 'Démo Interactive',
    href: '/demo-photo-portfolio',
    icon: Search,
    description: 'Démonstration interactive'
  }
];

export default function PhotoNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={item.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}







