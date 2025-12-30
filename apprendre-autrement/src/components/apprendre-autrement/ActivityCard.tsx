'use client';

import { Activity } from '../../utils/apprendre-autrement/activities';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  isCompleted: boolean;
  onSelect: () => void;
  accessibilitySettings: {
    fontSize: string;
    colorScheme: string;
    highContrast: boolean;
    fontFamily?: string;
  };
}

export default function ActivityCard({ 
  activity, 
  index, 
  isCompleted, 
  onSelect,
  accessibilitySettings 
}: ActivityCardProps) {
  const getCardStyles = () => {
    if (accessibilitySettings.highContrast) {
      return 'bg-white/90 border-4 border-black';
    }
    if (accessibilitySettings.colorScheme === 'dark') {
      return 'bg-gray-800/80 backdrop-blur-md border-gray-700';
    }
    return 'bg-white/80 backdrop-blur-md border border-white/50';
  };

  return (
    <div
      onClick={(e) => {
        // Ne déclencher que si on ne clique pas sur le bouton
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.tagName === 'BUTTON') {
          return;
        }
        onSelect();
      }}
      className={`${getCardStyles()} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer overflow-hidden relative group ${
        isCompleted ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-white' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Activité ${activity.title}`}
      style={{
        fontFamily: accessibilitySettings.fontFamily === 'dyslexic' ? 'Comic Sans MS, sans-serif' : 'inherit',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500 -skew-x-12"></div>
      
      {/* Badge de complétion avec animation */}
      {isCompleted && (
        <div className="absolute top-4 right-4 z-10 animate-bounce">
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full p-3 shadow-2xl border-4 border-white transform rotate-12 hover:rotate-0 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div 
        className={`p-6 relative overflow-hidden ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-700' 
            : `bg-gradient-to-r ${activity.colorGradient}`
        }`}
      >
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 text-6xl">{activity.icon}</div>
          <div className="absolute bottom-2 left-2 text-4xl">{activity.icon}</div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>{activity.icon}</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white/30 ${
              accessibilitySettings.colorScheme === 'dark'
                ? 'bg-gray-600 text-white'
                : 'bg-white/30 backdrop-blur-sm text-white'
            }`}>
              ⏱️ {activity.duration}
            </span>
          </div>
          <h3 className={`text-2xl font-extrabold mb-2 ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-white'
          }`} style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {activity.title}
          </h3>
          <p className={`text-base font-semibold ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-gray-200' : 'text-white'
          }`}>
            {activity.category}
          </p>
        </div>
      </div>

      <div className="p-6 bg-white relative z-10">
        <p className={`mb-5 text-base leading-relaxed ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {activity.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md border-2 ${
            accessibilitySettings.colorScheme === 'dark'
              ? 'bg-gray-700 text-gray-300 border-gray-600'
              : `${activity.categoryColor} border-white`
          }`}>
            🎨 {activity.skill}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            type="button"
            className={`px-6 py-3 rounded-xl font-bold text-base transition-all transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer relative z-50 ${
              accessibilitySettings.colorScheme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white hover:from-green-600 hover:via-blue-600 hover:to-purple-600'
            }`}
            style={{
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <span className="inline-block animate-pulse">🚀</span> Commencer →
          </button>
        </div>
      </div>

      {/* Badge numéro avec style enfantin */}
      <div className={`absolute top-3 left-3 rounded-full w-12 h-12 flex items-center justify-center font-extrabold text-lg shadow-2xl border-4 border-white transform rotate-12 hover:rotate-0 transition-transform ${
        accessibilitySettings.colorScheme === 'dark'
          ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'
          : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
      }`}>
        #{index + 1}
      </div>
    </div>
  );
}

