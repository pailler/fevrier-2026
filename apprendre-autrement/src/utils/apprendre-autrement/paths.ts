import { Path } from './points';
import { activities } from './activities';

export const LEARNING_PATHS: Path[] = [
  {
    id: 'beginner',
    name: 'Parcours Débutant',
    description: 'Découvre les bases avec des activités simples et amusantes',
    icon: '🌱',
    color: 'green',
    activities: ['colors-shapes', 'number-fun', 'emotion-cards'],
    unlocked: true,
    completed: false
  },
  {
    id: 'visual-learner',
    name: 'Parcours Visuel',
    description: 'Apprends avec des images, des couleurs et des formes',
    icon: '🎨',
    color: 'purple',
    activities: ['colors-shapes', 'pattern-recognition', 'memory-game'],
    unlocked: true,
    completed: false,
    requiredLevel: 2
  },
  {
    id: 'family-time',
    name: 'Parcours Famille',
    description: 'Renforce les liens avec ta famille',
    icon: '👨‍👩‍👧‍👦',
    color: 'pink',
    activities: ['family-photos', 'family-voices', 'family-stories', 'family-tree'],
    unlocked: true,
    completed: false,
    requiredPoints: 100
  },
  {
    id: 'organization',
    name: 'Parcours Organisation',
    description: 'Apprends à organiser ta journée et tes routines',
    icon: '📅',
    color: 'orange',
    activities: ['daily-schedule', 'routine-builder', 'task-checklist'],
    unlocked: true,
    completed: false,
    requiredLevel: 1
  },
  {
    id: 'advanced',
    name: 'Parcours Avancé',
    description: 'Défis pour les champions !',
    icon: '🏆',
    color: 'gold',
    activities: ['sequence-story', 'pattern-recognition', 'memory-game'],
    unlocked: false,
    completed: false,
    requiredLevel: 5,
    requiredPoints: 500
  },
  {
    id: 'complete',
    name: 'Parcours Complet',
    description: 'Toutes les activités pour devenir un maître !',
    icon: '👑',
    color: 'blue',
    activities: activities.map(a => a.id),
    unlocked: false,
    completed: false,
    requiredLevel: 7,
    requiredPoints: 1000
  }
];

export function loadPaths(): Path[] {
  if (typeof window === 'undefined') return LEARNING_PATHS;
  
  try {
    const saved = localStorage.getItem('learn-differently-paths');
    if (saved) {
      const savedPaths = JSON.parse(saved);
      return LEARNING_PATHS.map(defaultPath => {
        const saved = savedPaths.find((p: Path) => p.id === defaultPath.id);
        return saved ? { ...defaultPath, ...saved } : defaultPath;
      });
    }
  } catch (error) {
    console.error('Erreur chargement parcours:', error);
  }
  
  return LEARNING_PATHS;
}

export function savePaths(paths: Path[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('learn-differently-paths', JSON.stringify(paths));
  } catch (error) {
    console.error('Erreur sauvegarde parcours:', error);
  }
}

export function updatePathProgress(pathId: string, activityId: string): void {
  const paths = loadPaths();
  const path = paths.find(p => p.id === pathId);
  
  if (!path) return;
  
  if (!path.activities.includes(activityId)) return;
  
  const { loadActivityResults } = require('./points');
  const results = loadActivityResults();
  const completedActivities = results
    .filter((r: any) => r.completed)
    .map((r: any) => r.activityId);
  
  const allCompleted = path.activities.every(a => completedActivities.includes(a));
  
  if (allCompleted && !path.completed) {
    path.completed = true;
    unlockPaths(paths);
    savePaths(paths);
  }
}

export function unlockPaths(paths: Path[]): void {
  const { loadPointsData } = require('./points');
  const pointsData = loadPointsData();
  
  paths.forEach(path => {
    if (path.unlocked) return;
    
    const levelOk = !path.requiredLevel || pointsData.currentLevel >= path.requiredLevel;
    const pointsOk = !path.requiredPoints || pointsData.totalPoints >= path.requiredPoints;
    
    if (levelOk && pointsOk) {
      path.unlocked = true;
    }
  });
}

export function getPathProgress(pathId: string): { completed: number; total: number; percentage: number } {
  const paths = loadPaths();
  const path = paths.find(p => p.id === pathId);
  
  if (!path) return { completed: 0, total: 0, percentage: 0 };
  
  const { loadActivityResults } = require('./points');
  const results = loadActivityResults();
  const completedActivities = results
    .filter((r: any) => r.completed)
    .map((r: any) => r.activityId);
  
  const completed = path.activities.filter(a => completedActivities.includes(a)).length;
  const total = path.activities.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return { completed, total, percentage };
}







