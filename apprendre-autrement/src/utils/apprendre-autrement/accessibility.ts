export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'sans-serif' | 'dyslexic' | 'mono';
  colorScheme: 'default' | 'pastel' | 'dark';
  highContrast: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  voiceVolume?: number;
  voiceRate?: number;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  fontFamily: 'sans-serif',
  colorScheme: 'default',
  highContrast: false,
  soundEnabled: true,
  animationsEnabled: true,
  reducedMotion: false,
  voiceVolume: 1.0,
  voiceRate: 0.9
};

export function getAccessibilitySettings(): AccessibilitySettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('learn-differently-accessibility');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
  }
  
  return DEFAULT_SETTINGS;
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('learn-differently-accessibility', JSON.stringify(settings));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
  }
}







