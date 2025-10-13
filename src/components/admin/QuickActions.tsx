'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickActionButton({ icon, title, description, onClick, color = 'blue' }: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'hover:border-blue-400 hover:bg-blue-50',
    green: 'hover:border-green-400 hover:bg-green-50',
    purple: 'hover:border-purple-400 hover:bg-purple-50',
    orange: 'hover:border-orange-400 hover:bg-orange-50'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

export default function QuickActions() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBlog = () => {
    setIsCreating(true);
    router.push('/admin/blog');
  };

  const handleCreateFormation = () => {
    setIsCreating(true);
    router.push('/admin/formation');
  };

  const handleCreateModule = () => {
    setIsCreating(true);
    router.push('/admin/applications');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton
          icon="📝"
          title="Nouvel article de blog"
          description="Créer un nouvel article"
          onClick={handleCreateBlog}
          color="blue"
        />
        
        <QuickActionButton
          icon="🎓"
          title="Nouvelle formation"
          description="Créer une nouvelle formation"
          onClick={handleCreateFormation}
          color="green"
        />
        
        <QuickActionButton
          icon="🧩"
          title="Nouvelle application"
          description="Ajouter une nouvelle application"
          onClick={handleCreateModule}
          color="purple"
        />
      </div>
      
      {isCreating && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">Redirection vers l'éditeur...</p>
        </div>
      )}
    </div>
  );
}
