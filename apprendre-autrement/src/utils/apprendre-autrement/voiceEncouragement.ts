export type EncouragementType = 
  | 'welcome'
  | 'activity-start'
  | 'activity-progress'
  | 'activity-complete'
  | 'points-earned'
  | 'level-up'
  | 'badge-earned'
  | 'streak'
  | 'keep-going'
  | 'almost-there'
  | 'perfect'
  | 'try-again'
  | 'good-job'
  | 'amazing';

// Fonction helper pour formater les messages avec ou sans prénom
function formatMessage(template: string, childName: string): string {
  if (!childName || childName.trim() === '') {
    // Retirer le prénom et les virgules/espaces associés
    return template
      .replace(/\$\{childName\},?\s*/g, '')
      .replace(/\$\{childName\}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return template.replace(/\$\{childName\}/g, childName);
}

export function getEncouragementMessages(childName: string): Record<EncouragementType, string[]> {
  const name = childName && childName.trim() ? childName.trim() : '';
  const nameWithComma = name ? `${name}, ` : '';
  const nameWithSpace = name ? ` ${name}` : '';
  
  return {
  welcome: [
    name ? `Salut ${name} ! Je suis content de te revoir. Prêt pour de nouvelles aventures ?` : `Salut ! Je suis content de te revoir. Prêt pour de nouvelles aventures ?`,
    name ? `Bonjour ${name} ! Tu vas faire de super activités aujourd'hui !` : `Bonjour ! Tu vas faire de super activités aujourd'hui !`,
    name ? `Coucou ${name} ! On va s'amuser ensemble !` : `Coucou ! On va s'amuser ensemble !`
  ],
  'activity-start': [
    name ? `Allez ${name}, tu vas y arriver ! C'est parti !` : `Allez, tu vas y arriver ! C'est parti !`,
    name ? `${name}, tu es prêt ? On commence cette activité ensemble !` : `Tu es prêt ? On commence cette activité ensemble !`,
    name ? `Super ${name} ! Tu as choisi une super activité. On y va !` : `Super ! Tu as choisi une super activité. On y va !`,
    name ? `Parfait ${name} ! Tu vas être génial dans cette activité !` : `Parfait ! Tu vas être génial dans cette activité !`
  ],
  'activity-progress': [
    name ? `Continue ${name}, tu es sur la bonne voie !` : `Continue, tu es sur la bonne voie !`,
    name ? `C'est bien ${name} ! Tu progresses super bien !` : `C'est bien ! Tu progresses super bien !`,
    name ? `Bravo ${name} ! Tu fais du super travail !` : `Bravo ! Tu fais du super travail !`,
    name ? `Excellent ${name} ! Continue comme ça !` : `Excellent ! Continue comme ça !`
  ],
  'activity-complete': [
    name ? `Félicitations ${name} ! Tu as terminé l'activité ! Tu es génial !` : `Félicitations ! Tu as terminé l'activité ! Tu es génial !`,
    name ? `Bravo ${name} ! Tu as réussi ! Je suis fier de toi !` : `Bravo ! Tu as réussi ! Je suis fier de toi !`,
    name ? `Super travail ${name} ! Tu as tout fait !` : `Super travail ! Tu as tout fait !`,
    name ? `Incroyable ${name} ! Tu es vraiment doué !` : `Incroyable ! Tu es vraiment doué !`
  ],
  'points-earned': [
    name ? `Wow ${name} ! Tu as gagné des points ! Continue comme ça !` : `Wow ! Tu as gagné des points ! Continue comme ça !`,
    name ? `Excellent ${name} ! Des points bien mérités !` : `Excellent ! Des points bien mérités !`,
    name ? `${name}, tu accumules les points ! Tu es fantastique !` : `Tu accumules les points ! Tu es fantastique !`,
    name ? `Bravo ${name} ! Chaque point compte, tu progresses !` : `Bravo ! Chaque point compte, tu progresses !`
  ],
  'level-up': [
    name ? `🎉 ${name}, tu as monté de niveau ! Tu es incroyable !` : `🎉 Tu as monté de niveau ! Tu es incroyable !`,
    name ? `Félicitations ${name} ! Nouveau niveau atteint ! Tu es un champion !` : `Félicitations ! Nouveau niveau atteint ! Tu es un champion !`,
    name ? `Wow ${name} ! Tu progresses tellement vite ! Nouveau niveau !` : `Wow ! Tu progresses tellement vite ! Nouveau niveau !`,
    name ? `${name}, tu es maintenant à un niveau supérieur ! Tu es génial !` : `Tu es maintenant à un niveau supérieur ! Tu es génial !`
  ],
  'badge-earned': [
    name ? `🎖️ ${name}, tu as gagné un nouveau badge ! Tu es exceptionnel !` : `🎖️ Tu as gagné un nouveau badge ! Tu es exceptionnel !`,
    name ? `Félicitations ${name} ! Nouveau badge pour toi ! Tu es formidable !` : `Félicitations ! Nouveau badge pour toi ! Tu es formidable !`,
    name ? `Bravo ${name} ! Ce badge est bien mérité !` : `Bravo ! Ce badge est bien mérité !`,
    name ? `${name}, tu collectionnes les badges ! Tu es incroyable !` : `Tu collectionnes les badges ! Tu es incroyable !`
  ],
  streak: [
    name ? `🔥 ${name}, tu es en série ! Continue comme ça !` : `🔥 Tu es en série ! Continue comme ça !`,
    name ? `Super ${name} ! Tu reviens chaque jour, c'est génial !` : `Super ! Tu reviens chaque jour, c'est génial !`,
    name ? `${name}, ta série continue ! Tu es déterminé !` : `Ta série continue ! Tu es déterminé !`,
    name ? `Bravo ${name} ! Tu ne lâches rien ! Continue !` : `Bravo ! Tu ne lâches rien ! Continue !`
  ],
  'keep-going': [
    name ? `Continue ${name}, tu peux le faire !` : `Continue, tu peux le faire !`,
    name ? `Ne lâche pas ${name}, tu es presque au bout !` : `Ne lâche pas, tu es presque au bout !`,
    name ? `Allez ${name}, encore un petit effort !` : `Allez, encore un petit effort !`,
    name ? `Tu y es presque ${name} ! Continue !` : `Tu y es presque ! Continue !`
  ],
  'almost-there': [
    name ? `Presque terminé ${name} ! Encore un peu !` : `Presque terminé ! Encore un peu !`,
    name ? `Tu y es presque ${name} ! Tu es sur le point de réussir !` : `Tu y es presque ! Tu es sur le point de réussir !`,
    name ? `Plus qu'un petit effort ${name} ! Tu vas y arriver !` : `Plus qu'un petit effort ! Tu vas y arriver !`,
    name ? `C'est bientôt fini ${name} ! Continue !` : `C'est bientôt fini ! Continue !`
  ],
  perfect: [
    name ? `Parfait ${name} ! Tu as tout réussi ! Tu es génial !` : `Parfait ! Tu as tout réussi ! Tu es génial !`,
    name ? `100% ${name} ! C'est parfait ! Tu es incroyable !` : `100% ! C'est parfait ! Tu es incroyable !`,
    name ? `Excellent ${name} ! Tu as tout fait sans erreur !` : `Excellent ! Tu as tout fait sans erreur !`,
    name ? `Wow ${name} ! C'est parfait ! Tu es vraiment doué !` : `Wow ! C'est parfait ! Tu es vraiment doué !`
  ],
  'try-again': [
    name ? `Ce n'est pas grave ${name}, on réessaie ensemble !` : `Ce n'est pas grave, on réessaie ensemble !`,
    name ? `${name}, on apprend de nos erreurs. Essayons encore !` : `On apprend de nos erreurs. Essayons encore !`,
    name ? `Pas de problème ${name}, on recommence ! Tu vas y arriver !` : `Pas de problème, on recommence ! Tu vas y arriver !`,
    name ? `${name}, c'est en essayant qu'on apprend ! On continue !` : `C'est en essayant qu'on apprend ! On continue !`
  ],
  'good-job': [
    name ? `Bien joué ${name} ! Tu fais du super travail !` : `Bien joué ! Tu fais du super travail !`,
    name ? `Bravo ${name} ! Continue comme ça !` : `Bravo ! Continue comme ça !`,
    name ? `Excellent ${name} ! Tu progresses bien !` : `Excellent ! Tu progresses bien !`,
    name ? `Super ${name} ! Je suis fier de toi !` : `Super ! Je suis fier de toi !`
  ],
  amazing: [
    name ? `Incroyable ${name} ! Tu es vraiment impressionnant !` : `Incroyable ! Tu es vraiment impressionnant !`,
    name ? `Wow ${name} ! Tu es fantastique !` : `Wow ! Tu es fantastique !`,
    name ? `${name}, tu es génial ! Continue comme ça !` : `Tu es génial ! Continue comme ça !`,
    name ? `Extraordinaire ${name} ! Tu es un champion !` : `Extraordinaire ! Tu es un champion !`
  ]
  };
}

class VoiceEncouragementManager {
  private speechSynthesis: SpeechSynthesis | null = null;
  private isEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume: number = 1.0;
  private rate: number = 0.9;
  private pitch: number = 1.1;
  private childName: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.initializeVoice();
    }
  }

  private initializeVoice() {
    if (!this.speechSynthesis) return;

    const loadVoices = () => {
      const voices = this.speechSynthesis!.getVoices();
      
      const preferredVoices = [
        'Google français',
        'Microsoft Hortense',
        'Microsoft Zira',
        'Samantha',
        'Amélie'
      ];

      let foundVoice = voices.find(voice => 
        voice.lang.startsWith('fr') && 
        (voice.name.includes('féminin') || voice.name.includes('Female') || 
         preferredVoices.some(name => voice.name.includes(name)))
      );

      if (!foundVoice && voices.length > 0) {
        foundVoice = voices.find(voice => voice.lang.startsWith('fr')) || voices[0];
      }

      this.voice = foundVoice || null;
    };

    if (this.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      this.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate: number) {
    this.rate = Math.max(0.1, Math.min(2, rate));
  }

  setPitch(pitch: number) {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  setChildName(name: string) {
    this.childName = name || '';
  }

  getChildName(): string {
    return this.childName;
  }

  private getRandomMessage(type: EncouragementType): string {
    const messages = getEncouragementMessages(this.childName)[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  speak(message: string, options?: {
    priority?: 'high' | 'normal' | 'low';
    interrupt?: boolean;
  }) {
    if (!this.isEnabled || !this.speechSynthesis) return;

    const priority = options?.priority || 'normal';
    const interrupt = options?.interrupt !== false;

    if (interrupt && this.currentUtterance) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = 'fr-FR';

    this.currentUtterance = utterance;

    utterance.onend = () => {
      this.currentUtterance = null;
    };

    utterance.onerror = (error) => {
      console.error('Erreur de synthèse vocale:', error);
      this.currentUtterance = null;
    };

    this.speechSynthesis.speak(utterance);
  }

  encourage(type: EncouragementType, options?: {
    priority?: 'high' | 'normal' | 'low';
    interrupt?: boolean;
    customMessage?: string;
  }) {
    if (!this.isEnabled) return;

    const message = options?.customMessage || this.getRandomMessage(type);
    this.speak(message, options);
  }

  correct() {
    this.encourage('good-job', { priority: 'normal', interrupt: false });
  }

  incorrect() {
    this.encourage('try-again', { priority: 'normal', interrupt: false });
  }

  stop() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.currentUtterance !== null && this.speechSynthesis !== null && this.speechSynthesis.speaking;
  }
}

export const voiceManager = new VoiceEncouragementManager();

export function createEncourage(childName: string) {
  const name = childName && childName.trim() ? childName.trim() : '';
  
  return {
    welcome: () => voiceManager.encourage('welcome', { priority: 'high' }),
    activityStart: () => voiceManager.encourage('activity-start', { priority: 'high' }),
    activityProgress: () => voiceManager.encourage('activity-progress', { priority: 'normal' }),
    activityComplete: () => voiceManager.encourage('activity-complete', { priority: 'high' }),
    pointsEarned: (points: number) => {
      const message = name ? `Bravo ${name} ! Tu as gagné ${points} points ! Continue comme ça !` : `Bravo ! Tu as gagné ${points} points ! Continue comme ça !`;
      return voiceManager.encourage('points-earned', { 
        priority: 'high',
        customMessage: message 
      });
    },
    levelUp: (level: number) => {
      const message = name ? `Félicitations ${name} ! Tu as atteint le niveau ${level} ! Tu es incroyable !` : `Félicitations ! Tu as atteint le niveau ${level} ! Tu es incroyable !`;
      return voiceManager.encourage('level-up', { 
        priority: 'high',
        customMessage: message 
      });
    },
    badgeEarned: (badgeName: string) => {
      const message = name ? `Bravo ${name} ! Tu as gagné le badge ${badgeName} ! Tu es génial !` : `Bravo ! Tu as gagné le badge ${badgeName} ! Tu es génial !`;
      return voiceManager.encourage('badge-earned', { 
        priority: 'high',
        customMessage: message 
      });
    },
    streak: (days: number) => {
      const message = name ? `Super ${name} ! ${days} jours consécutifs ! Tu es déterminé !` : `Super ! ${days} jours consécutifs ! Tu es déterminé !`;
      return voiceManager.encourage('streak', { 
        priority: 'normal',
        customMessage: message 
      });
    },
    keepGoing: () => voiceManager.encourage('keep-going', { priority: 'normal' }),
    almostThere: () => voiceManager.encourage('almost-there', { priority: 'normal' }),
    perfect: () => voiceManager.encourage('perfect', { priority: 'high' }),
    tryAgain: () => voiceManager.encourage('try-again', { priority: 'normal' }),
    goodJob: () => voiceManager.encourage('good-job', { priority: 'normal' }),
    amazing: () => voiceManager.encourage('amazing', { priority: 'normal' }),
    correct: () => voiceManager.correct(),
    incorrect: () => voiceManager.incorrect()
  };
}
