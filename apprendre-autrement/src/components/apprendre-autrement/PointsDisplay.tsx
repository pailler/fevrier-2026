'use client';

import { useState, useEffect } from 'react';
import { loadPointsData, LEVELS, BADGES } from '../../utils/apprendre-autrement/points';

interface PointsDisplayProps {
  accessibilitySettings: any;
  showDetails?: boolean;
}

export default function PointsDisplay({ accessibilitySettings, showDetails = false }: PointsDisplayProps) {
  const [pointsData, setPointsData] = useState(loadPointsData());
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointsData(loadPointsData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentLevelInfo = LEVELS.find(l => l.level === pointsData.currentLevel) || LEVELS[0];
  const nextLevelInfo = LEVELS.find(l => l.level === pointsData.currentLevel + 1);
  const progressToNext = nextLevelInfo
    ? ((pointsData.totalPoints - (LEVELS[pointsData.currentLevel - 1]?.pointsRequired || 0)) / 
       (nextLevelInfo.pointsRequired - (LEVELS[pointsData.currentLevel - 1]?.pointsRequired || 0))) * 100
    : 100;

  return (
    <div className={`space-y-4 ${
      accessibilitySettings.colorScheme === 'dark' ? 'text-white' : ''
    }`}>
      <div className={`p-6 rounded-2xl shadow-xl border border-white/50 relative overflow-hidden ${
        accessibilitySettings.colorScheme === 'dark'
          ? 'bg-gray-800/80 backdrop-blur-md border-gray-700'
          : 'bg-white/80 backdrop-blur-md'
      }`}>
        {/* Éléments décoratifs enfantins */}
        <div className="absolute top-2 right-2 text-4xl opacity-20 animate-pulse">⭐</div>
        <div className="absolute bottom-2 left-2 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>
        
        <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className={`text-sm font-semibold mb-1 ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Niveau {pointsData.currentLevel}
            </div>
            <div className={`text-3xl font-extrabold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} style={{
              fontFamily: accessibilitySettings.fontFamily === 'dyslexic' ? 'Comic Sans MS, sans-serif' : 'inherit'
            }}>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>{currentLevelInfo.icon}</span>
              {' '}{currentLevelInfo.name}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold mb-1 ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Points totaux
            </div>
            <div className={`text-4xl font-extrabold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {pointsData.totalPoints} <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        {nextLevelInfo && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className={accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {pointsData.pointsInCurrentLevel} / {nextLevelInfo.pointsRequired - (LEVELS[pointsData.currentLevel - 1]?.pointsRequired || 0)} points
              </span>
              <span className={accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Niveau {nextLevelInfo.level}: {nextLevelInfo.name}
              </span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden ${
              accessibilitySettings.colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full transition-all duration-500 ${
                  accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      {showDetails && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : ''
        }`}>
          <div className={`p-4 rounded-xl border ${
            accessibilitySettings.colorScheme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/60 backdrop-blur-sm border-white/50'
          }`}>
            <div className={`text-2xl font-bold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{pointsData.activitiesCompleted}</div>
            <div className={`text-sm ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Activités complétées
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            accessibilitySettings.colorScheme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/60 backdrop-blur-sm border-white/50'
          }`}>
            <div className={`text-2xl font-bold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{pointsData.streaks.current}</div>
            <div className={`text-sm ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Jours consécutifs 🔥
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            accessibilitySettings.colorScheme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/60 backdrop-blur-sm border-white/50'
          }`}>
            <div className={`text-2xl font-bold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{pointsData.badges.length}</div>
            <div className={`text-sm ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Badges obtenus
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            accessibilitySettings.colorScheme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/60 backdrop-blur-sm border-white/50'
          }`}>
            <div className={`text-2xl font-bold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{pointsData.streaks.longest}</div>
            <div className={`text-sm ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Record de jours
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowBadges(!showBadges)}
          className={`w-full p-4 rounded-xl font-semibold text-base transition-all transform hover:scale-105 shadow-lg hover:shadow-xl border ${
            accessibilitySettings.colorScheme === 'dark'
              ? 'bg-gray-800/80 backdrop-blur-md hover:bg-gray-700 text-white border-gray-600'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 border-white/50'
          }`}
        >
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>🏅</span>
          {' '}Mes Badges ({pointsData.badges.length})
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🏅</span>
        </button>

        {showBadges && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(BADGES).map(([id, badge]) => {
              const hasBadge = pointsData.badges.includes(id);
              return (
                <div
                  key={id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    hasBadge
                      ? 'bg-yellow-50/80 backdrop-blur-sm border-yellow-400'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 opacity-50'
                      : 'bg-white/40 backdrop-blur-sm border-gray-300 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{hasBadge ? badge.icon : '🔒'}</div>
                  <div className={`text-xs font-semibold ${
                    hasBadge
                      ? 'text-yellow-800'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'text-gray-500'
                      : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

