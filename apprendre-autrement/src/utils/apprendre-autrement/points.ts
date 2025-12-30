export interface PointsData {
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  pointsForNextLevel: number;
  activitiesCompleted: number;
  badges: string[];
  streaks: {
    current: number;
    longest: number;
    lastActivityDate: string | null;
  };
}

export interface ActivityResult {
  activityId: string;
  points: number;
  completed: boolean;
  timestamp: string;
  accuracy?: number;
  timeSpent?: number;
}

export interface Path {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  activities: string[];
  unlocked: boolean;
  completed: boolean;
  requiredLevel?: number;
  requiredPoints?: number;
}

export const POINTS_CONFIG = {
  facile: 10,
  moyen: 20,
  difficile: 30,
  bonus: {
    perfect: 5,
    speed: 3,
    streak: 10,
    firstTime: 5
  }
};

export const LEVELS = [
  { level: 1, pointsRequired: 0, name: 'Débutant', icon: '🌱' },
  { level: 2, pointsRequired: 50, name: 'Explorateur', icon: '🌟' },
  { level: 3, pointsRequired: 150, name: 'Aventurier', icon: '⭐' },
  { level: 4, pointsRequired: 300, name: 'Champion', icon: '🏆' },
  { level: 5, pointsRequired: 500, name: 'Maître', icon: '👑' },
  { level: 6, pointsRequired: 750, name: 'Expert', icon: '💎' },
  { level: 7, pointsRequired: 1000, name: 'Légende', icon: '✨' },
  { level: 8, pointsRequired: 1500, name: 'Héros', icon: '🦸' },
  { level: 9, pointsRequired: 2000, name: 'Génie', icon: '🧠' },
  { level: 10, pointsRequired: 3000, name: 'Légende Absolue', icon: '🌟' }
];

export const BADGES = {
  'first-step': { name: 'Premier Pas', icon: '👣', description: 'Compléter ta première activité', points: 10 },
  'streak-3': { name: 'En Forme', icon: '🔥', description: '3 jours consécutifs', points: 20 },
  'streak-7': { name: 'Déterminé', icon: '💪', description: '7 jours consécutifs', points: 50 },
  'streak-30': { name: 'Inarrêtable', icon: '⚡', description: '30 jours consécutifs', points: 200 },
  'perfect-10': { name: 'Perfectionniste', icon: '💯', description: '10 activités parfaites', points: 100 },
  'speed-demon': { name: 'Rapide', icon: '⚡', description: 'Terminer 5 activités rapidement', points: 50 },
  'explorer': { name: 'Explorateur', icon: '🗺️', description: 'Compléter tous les types d\'activités', points: 75 },
  'family-lover': { name: 'Amoureux de la Famille', icon: '❤️', description: 'Compléter toutes les activités familiales', points: 80 },
  'organizer': { name: 'Organisé', icon: '📅', description: 'Compléter toutes les activités d\'organisation', points: 70 },
  'level-5': { name: 'Maître', icon: '👑', description: 'Atteindre le niveau 5', points: 150 },
  'level-10': { name: 'Légende', icon: '🌟', description: 'Atteindre le niveau 10', points: 500 },
  'points-1000': { name: 'Millionnaire', icon: '💰', description: 'Atteindre 1000 points', points: 200 },
  'completionist': { name: 'Complétionniste', icon: '🎯', description: 'Compléter toutes les activités', points: 300 }
};

export function getInitialPointsData(): PointsData {
  return {
    totalPoints: 0,
    currentLevel: 1,
    pointsInCurrentLevel: 0,
    pointsForNextLevel: LEVELS[1].pointsRequired,
    activitiesCompleted: 0,
    badges: [],
    streaks: {
      current: 0,
      longest: 0,
      lastActivityDate: null
    }
  };
}

export function loadPointsData(): PointsData {
  if (typeof window === 'undefined') return getInitialPointsData();
  
  try {
    const saved = localStorage.getItem('learn-differently-points');
    if (saved) {
      const data = JSON.parse(saved);
      return calculateLevel(data);
    }
  } catch (error) {
    console.error('Erreur chargement points:', error);
  }
  
  return getInitialPointsData();
}

export function savePointsData(data: PointsData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('learn-differently-points', JSON.stringify(data));
  } catch (error) {
    console.error('Erreur sauvegarde points:', error);
  }
}

export function calculateLevel(data: PointsData): PointsData {
  let newLevel = 1;
  let pointsForNext = LEVELS[1]?.pointsRequired || 50;
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (data.totalPoints >= LEVELS[i].pointsRequired) {
      newLevel = LEVELS[i].level;
      pointsForNext = LEVELS[i + 1]?.pointsRequired || LEVELS[LEVELS.length - 1].pointsRequired;
      break;
    }
  }
  
  const pointsInCurrentLevel = data.totalPoints - (LEVELS[newLevel - 1]?.pointsRequired || 0);
  const pointsNeededForNext = pointsForNext - data.totalPoints;
  
  return {
    ...data,
    currentLevel: newLevel,
    pointsInCurrentLevel,
    pointsForNextLevel: pointsNeededForNext
  };
}

export function calculateActivityPoints(
  activityId: string,
  difficulty: 'facile' | 'moyen' | 'difficile',
  result: {
    accuracy?: number;
    timeSpent?: number;
    isFirstTime?: boolean;
    isPerfect?: boolean;
    isFast?: boolean;
  }
): number {
  let points = POINTS_CONFIG[difficulty];
  
  if (result.isFirstTime) {
    points += POINTS_CONFIG.bonus.firstTime;
  }
  
  if (result.isPerfect && result.accuracy === 100) {
    points += POINTS_CONFIG.bonus.perfect;
  }
  
  if (result.isFast) {
    points += POINTS_CONFIG.bonus.speed;
  }
  
  return points;
}

export function updateStreak(data: PointsData): PointsData {
  const today = new Date().toDateString();
  const lastDate = data.streaks.lastActivityDate;
  
  if (!lastDate) {
    return {
      ...data,
      streaks: {
        current: 1,
        longest: 1,
        lastActivityDate: today
      }
    };
  }
  
  const lastDateObj = new Date(lastDate);
  const todayObj = new Date(today);
  const daysDiff = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return data;
  } else if (daysDiff === 1) {
    const newCurrent = data.streaks.current + 1;
    return {
      ...data,
      streaks: {
        current: newCurrent,
        longest: Math.max(newCurrent, data.streaks.longest),
        lastActivityDate: today
      }
    };
  } else {
    return {
      ...data,
      streaks: {
        current: 1,
        longest: data.streaks.longest,
        lastActivityDate: today
      }
    };
  }
}

export function checkBadges(data: PointsData, activityResult: ActivityResult): string[] {
  const newBadges: string[] = [];
  const currentBadges = new Set(data.badges);
  
  if (data.activitiesCompleted === 1 && !currentBadges.has('first-step')) {
    newBadges.push('first-step');
  }
  
  if (data.streaks.current === 3 && !currentBadges.has('streak-3')) {
    newBadges.push('streak-3');
  }
  if (data.streaks.current === 7 && !currentBadges.has('streak-7')) {
    newBadges.push('streak-7');
  }
  if (data.streaks.current === 30 && !currentBadges.has('streak-30')) {
    newBadges.push('streak-30');
  }
  
  if (data.currentLevel === 5 && !currentBadges.has('level-5')) {
    newBadges.push('level-5');
  }
  if (data.currentLevel === 10 && !currentBadges.has('level-10')) {
    newBadges.push('level-10');
  }
  
  if (data.totalPoints >= 1000 && !currentBadges.has('points-1000')) {
    newBadges.push('points-1000');
  }
  
  return newBadges;
}

export function addActivityPoints(
  activityId: string,
  difficulty: 'facile' | 'moyen' | 'difficile',
  result: {
    accuracy?: number;
    timeSpent?: number;
    isFirstTime?: boolean;
    isPerfect?: boolean;
    isFast?: boolean;
  }
): { points: number; newData: PointsData; badges: string[]; levelUp: boolean } {
  const currentData = loadPointsData();
  const points = calculateActivityPoints(activityId, difficulty, result);
  
  let newData: PointsData = {
    ...currentData,
    totalPoints: currentData.totalPoints + points,
    activitiesCompleted: currentData.activitiesCompleted + 1
  };
  
  newData = updateStreak(newData);
  
  const oldLevel = newData.currentLevel;
  newData = calculateLevel(newData);
  const levelUp = newData.currentLevel > oldLevel;
  
  const activityResult: ActivityResult = {
    activityId,
    points,
    completed: true,
    timestamp: new Date().toISOString(),
    accuracy: result.accuracy,
    timeSpent: result.timeSpent
  };
  
  const newBadges = checkBadges(newData, activityResult);
  newData.badges = [...newData.badges, ...newBadges];
  
  savePointsData(newData);
  saveActivityResult(activityResult);
  
  return { points, newData, badges: newBadges, levelUp };
}

export function loadActivityResults(): ActivityResult[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('learn-differently-results');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erreur chargement résultats:', error);
  }
  
  return [];
}

export function saveActivityResult(result: ActivityResult): void {
  if (typeof window === 'undefined') return;
  
  try {
    const results = loadActivityResults();
    results.push(result);
    localStorage.setItem('learn-differently-results', JSON.stringify(results));
  } catch (error) {
    console.error('Erreur sauvegarde résultat:', error);
  }
}







