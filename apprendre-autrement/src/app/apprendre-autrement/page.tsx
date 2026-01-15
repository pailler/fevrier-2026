'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActivityCard from '../../components/apprendre-autrement/ActivityCard';
import ProgressTracker from '../../components/apprendre-autrement/ProgressTracker';
import AccessibilitySettings from '../../components/apprendre-autrement/AccessibilitySettings';
import PointsDisplay from '../../components/apprendre-autrement/PointsDisplay';
import RewardModal from '../../components/apprendre-autrement/RewardModal';
import { activities } from '../../utils/apprendre-autrement/activities';
import { getAccessibilitySettings, saveAccessibilitySettings, AccessibilitySettings as AccessibilitySettingsType } from '../../utils/apprendre-autrement/accessibility';
import { addActivityPoints, loadPointsData } from '../../utils/apprendre-autrement/points';
import { updatePathProgress, loadPaths } from '../../utils/apprendre-autrement/paths';
import { useVoiceEncouragement } from '../../hooks/useVoiceEncouragement';
import { getChildName, setChildName } from '../../utils/apprendre-autrement/childName';
import { BUILD_TAG } from '../../buildInfo.generated';

export default function ApprendreAutrementPage() {
  const router = useRouter();
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettingsType>({
    fontSize: 'medium',
    fontFamily: 'sans-serif',
    colorScheme: 'default',
    highContrast: false,
    soundEnabled: true,
    animationsEnabled: true,
    reducedMotion: false,
    voiceVolume: 1.0,
    voiceRate: 0.9
  });
  const [showSettings, setShowSettings] = useState(false);
  const [pointsData, setPointsData] = useState(loadPointsData());
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{
    points: number;
    badges: string[];
    levelUp: boolean;
    newLevel?: number;
  } | null>(null);
  const [childName, setChildNameState] = useState<string>('');
  // Token optionnel (préservé si présent), mais l'app doit rester accessible sans token
  const [optionalToken, setOptionalToken] = useState<string | null>(null);

  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9,
    childName: childName
  });

  // Token optionnel au chargement (URL ou sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const tokenFromSession = sessionStorage.getItem('apprendre-autrement-token');
    const token = tokenFromUrl || tokenFromSession;
    if (token) {
      sessionStorage.setItem('apprendre-autrement-token', token);
    }
    setOptionalToken(token);
  }, []);

  useEffect(() => {
    // Charger le reste de l'application (aucune restriction par token)

    const savedSettings = getAccessibilitySettings();
    if (savedSettings) {
      setAccessibilitySettings(savedSettings);
    }

    // Charger le prénom sauvegardé
    const savedChildName = getChildName();
    setChildNameState(savedChildName);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learn-differently-progress');
      if (saved) {
        try {
          setCompletedActivities(JSON.parse(saved));
        } catch {
          setCompletedActivities([]);
        }
      }

      // Vérifier si on revient d'une activité complétée
      const urlParams = new URLSearchParams(window.location.search);
      const completedId = urlParams.get('completed');
      const accuracy = urlParams.get('accuracy');
      const time = urlParams.get('time');
      const perfect = urlParams.get('perfect');

      if (completedId && accuracy && time) {
        handleActivityComplete(completedId, {
          accuracy: parseFloat(accuracy),
          timeSpent: parseInt(time),
          isPerfect: perfect === '1',
          isFast: parseInt(time) < 60
        });

        // Nettoyer l'URL mais préserver le token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const cleanUrl = token 
          ? `/apprendre-autrement?token=${encodeURIComponent(token)}`
          : '/apprendre-autrement';
        window.history.replaceState({}, '', cleanUrl);
      }
    }

    // Message de bienvenue
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.welcome();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionalToken]);

  const handleActivityComplete = async (
    activityId: string,
    result: {
      accuracy?: number;
      timeSpent?: number;
      isPerfect?: boolean;
      isFast?: boolean;
    }
  ) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const { points, newData, badges, levelUp } = addActivityPoints(
      activityId,
      activity.difficulty,
      {
        ...result,
        isFirstTime: !completedActivities.includes(activityId)
      }
    );

    setPointsData(newData);
    
    if (!completedActivities.includes(activityId)) {
      const newCompleted = [...completedActivities, activityId];
      setCompletedActivities(newCompleted);
      localStorage.setItem('learn-differently-progress', JSON.stringify(newCompleted));
    }

    const paths = loadPaths();
    paths.forEach(path => {
      if (path.activities.includes(activityId)) {
        updatePathProgress(path.id, activityId);
      }
    });

    // Messages vocaux
    if (accessibilitySettings.soundEnabled) {
      if (result.isPerfect) {
        await encourage.perfect();
      } else {
        await encourage.activityComplete();
      }
      
      if (levelUp && newData.currentLevel) {
        await encourage.levelUp(newData.currentLevel);
      }
      
      if (badges.length > 0) {
        const { BADGES } = require('../../utils/apprendre-autrement/points');
        await encourage.badgeEarned(BADGES[badges[0] as keyof typeof BADGES]?.name || 'Nouveau badge');
      }
      
      if (points > 0) {
        await encourage.pointsEarned(points);
      }
    }

    setRewardData({
      points,
      badges,
      levelUp,
      newLevel: levelUp ? newData.currentLevel : undefined
    });
    setShowReward(true);
  };

  const handleSettingsChange = (newSettings: AccessibilitySettingsType) => {
    setAccessibilitySettings(newSettings);
    saveAccessibilitySettings(newSettings);
  };

  const totalActivities = activities.length;
  const progress = (completedActivities.length / totalActivities) * 100;

  // Plus de blocage d'accès: l'app est accessible sans token (subdomain public).

  const getStyles = () => {
    const baseStyles: React.CSSProperties = {
      fontFamily: accessibilitySettings.fontFamily === 'dyslexic' 
        ? 'Comic Sans MS, sans-serif' 
        : accessibilitySettings.fontFamily === 'mono'
        ? 'Courier New, monospace'
        : 'system-ui, sans-serif',
      fontSize: accessibilitySettings.fontSize === 'large' 
        ? '1.25rem' 
        : accessibilitySettings.fontSize === 'extra-large'
        ? '1.5rem'
        : '1rem'
    };

    return baseStyles;
  };

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-300 ${
        accessibilitySettings.colorScheme === 'pastel'
          ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
          : accessibilitySettings.colorScheme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
      }`}
      style={getStyles()}
    >
      {/* Badge version (temporaire) */}
      <div className="fixed bottom-3 right-3 z-[9999] select-none rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
        Version: {BUILD_TAG}
      </div>

      {/* Bannière spéciale (style code-learning exact) */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                🌟 Apprendre Autrement
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                ÉDUCATION ADAPTÉE
              </span>
              <p className="text-xl text-white/90 mb-6">
                Des activités super amusantes pour apprendre au rythme d'Adam ! 
                Parfait pour les enfants avec des besoins spécifiques.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Multi-sensoriel
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⭐ Système de points
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏆 Badges et niveaux
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔊 Encouragement vocal
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-pink-300 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-orange-300 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-purple-500/20">
                    <span className="text-8xl">🌈</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note sur le développement de nouvelles activités */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={`bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-md ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 border-blue-400' 
            : ''
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                accessibilitySettings.colorScheme === 'dark' 
                  ? 'text-gray-200' 
                  : 'text-gray-800'
              }`}>
                <strong>Nouvelle activité ?</strong> Vous souhaitez demander le développement d'une nouvelle activité parmi celles déjà proposées ? 
                C'est possible grâce à la partie développement de iahome.{' '}
                <a 
                  href="https://iahome.fr/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
                >
                  Contactez-nous
                </a>
                {' '}pour en discuter !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Configuration du Prénom */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="child-name" className="block text-lg font-semibold text-gray-900 mb-2">
                👤 Ton prénom (utilisé dans les messages vocaux)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Ce prénom sera prononcé dans tous les messages d'encouragement vocaux.
              </p>
              <div className="flex gap-3">
                <input
                  id="child-name"
                  type="text"
                  value={childName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setChildNameState(newName);
                    setChildName(newName);
                  }}
                  placeholder="Entrez votre prénom"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  style={{
                    fontFamily: accessibilitySettings.fontFamily === 'dyslexic' ? 'Comic Sans MS, sans-serif' : 'inherit',
                    fontSize: accessibilitySettings.fontSize === 'large' ? '1.25rem' : accessibilitySettings.fontSize === 'small' ? '1rem' : '1.125rem'
                  }}
                />
                <button
                  onClick={() => {
                    if (accessibilitySettings.soundEnabled) {
                      encourage.welcome();
                    }
                  }}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                  aria-label="Tester la prononciation"
                >
                  🔊 Tester
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Points et Statistiques */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Mes Progrès
              </h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/30 hover:bg-white/40 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm transition-all backdrop-blur-md border border-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Paramètres d'accessibilité"
              >
                <span className="inline-block mr-2">⚙️</span>
                Paramètres
              </button>
            </div>
            <PointsDisplay 
              accessibilitySettings={accessibilitySettings}
              showDetails={true}
            />
            {/* Barre de progression globale */}
            <div className="mt-6">
              <div className="bg-gray-100 rounded-full p-2">
                <ProgressTracker 
                  progress={progress} 
                  completed={completedActivities.length}
                  total={totalActivities}
                  colorScheme={accessibilitySettings.colorScheme}
                />
              </div>
            </div>
          </div>
          
          {/* Colonne 2 - À propos */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              À propos de l'application
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                Cette application propose des activités interactives et amusantes pour apprendre 
                différemment. Chaque activité est conçue pour être courte, concrète 
                et adaptée aux enfants avec des besoins spécifiques. Découvrez plus de 16 activités 
                éducatives incluant le vocabulaire en images avec synthèse vocale pour enrichir 
                le langage de votre enfant.
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="font-semibold text-purple-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>16+ activités progressives et variées</li>
                  <li>Vocabulaire en images avec 100 mots essentiels (5 ans)</li>
                  <li>Synthèse vocale pour apprendre la prononciation</li>
                  <li>Interface colorée et ludique</li>
                  <li>Système de progression avec récompenses</li>
                  <li>Encouragement vocal personnalisé</li>
                  <li>Paramètres d'accessibilité adaptables</li>
                </ul>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <AccessibilitySettings
              settings={accessibilitySettings}
              onChange={handleSettingsChange}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}

      {/* Section Activités (style code-learning) */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 text-center">
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              accessibilitySettings.colorScheme === 'dark' 
                ? 'text-white' 
                : 'text-gray-900'
            }`} style={{
              fontFamily: accessibilitySettings.fontFamily === 'dyslexic' ? 'Comic Sans MS, sans-serif' : 'inherit'
            }}>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>🎯</span>
              {' '}Choisis une activité{' '}
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</span>
            </h2>
            <p className={`text-xl ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              ✨ Toutes les activités sont courtes et super amusantes ! ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                isCompleted={completedActivities.includes(activity.id)}
                onSelect={() => {
                  // Rediriger vers la page d'activité en préservant le token
                  const activityUrl = optionalToken 
                    ? `/apprendre-autrement/activity/${activity.id}?token=${encodeURIComponent(optionalToken)}`
                    : `/apprendre-autrement/activity/${activity.id}`;
                  
                  // Utiliser window.location.href pour garantir que le token est préservé
                  window.location.href = activityUrl;
                }}
                accessibilitySettings={accessibilitySettings}
              />
            ))}
          </div>
        </div>
      </section>

      {showReward && rewardData && (
        <RewardModal
          points={rewardData.points}
          badges={rewardData.badges}
          levelUp={rewardData.levelUp}
          newLevel={rewardData.newLevel}
          onClose={() => {
            setShowReward(false);
            setRewardData(null);
          }}
          accessibilitySettings={accessibilitySettings}
        />
      )}

    </div>
  );
}

