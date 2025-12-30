'use client';

import { useEffect, useState } from 'react';
import { BADGES, LEVELS } from '../../utils/apprendre-autrement/points';

interface RewardModalProps {
  points: number;
  badges: string[];
  levelUp: boolean;
  newLevel?: number;
  onClose: () => void;
  accessibilitySettings: any;
}

export default function RewardModal({
  points,
  badges,
  levelUp,
  newLevel,
  onClose,
  accessibilitySettings
}: RewardModalProps) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      // Le son sera géré par le système vocal
    }

    const timer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose, accessibilitySettings.soundEnabled]);

  const newBadgesInfo = badges.map(id => BADGES[id as keyof typeof BADGES]).filter(Boolean);
  const levelInfo = newLevel ? LEVELS.find(l => l.level === newLevel) : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center ${
        accessibilitySettings.colorScheme === 'dark' ? 'bg-gray-800' : ''
      }`}>
        {showAnimation && (
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <div className={`text-4xl font-bold mb-2 ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              +{points} points !
            </div>
          </div>
        )}

        {levelUp && levelInfo && (
          <div className={`mb-6 p-6 rounded-lg ${
            accessibilitySettings.colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }`}>
            <div className="text-5xl mb-2">{levelInfo.icon}</div>
            <div className={`text-2xl font-bold ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Niveau {newLevel} atteint !
            </div>
            <div className={`text-lg ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-white/90'
            }`}>
              {levelInfo.name}
            </div>
          </div>
        )}

        {newBadgesInfo.length > 0 && (
          <div className="mb-6">
            <div className={`text-xl font-bold mb-4 ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              🏅 Nouveaux badges obtenus !
            </div>
            <div className="space-y-3">
              {newBadgesInfo.map((badge, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    accessibilitySettings.colorScheme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className={`font-bold ${
                    accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {badge.name}
                  </div>
                  <div className={`text-sm ${
                    accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`text-lg mb-6 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {points > 0 && 'Bravo ! Continue comme ça ! 🌟'}
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}







