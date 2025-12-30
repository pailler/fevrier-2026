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

export function getEncouragementMessages(childName: string): Record<EncouragementType, string[]> {
  return {
  welcome: [
    `Salut ${childName} ! Je suis content de te revoir. Prêt pour de nouvelles aventures ?`,
    `Bonjour ${childName} ! Tu vas faire de super activités aujourd'hui !`,
    `Coucou ${childName} ! On va s'amuser ensemble !`
  ],
  'activity-start': [
    `Allez ${childName}, tu vas y arriver ! C'est parti !`,
    `${childName}, tu es prêt ? On commence cette activité ensemble !`,
    `Super ${childName} ! Tu as choisi une super activité. On y va !`,
    `Parfait ${childName} ! Tu vas être génial dans cette activité !`
  ],
  'activity-progress': [
    `Continue ${childName}, tu es sur la bonne voie !`,
    `C'est bien ${childName} ! Tu progresses super bien !`,
    `Bravo ${childName} ! Tu fais du super travail !`,
    `Excellent ${childName} ! Continue comme ça !`
  ],
  'activity-complete': [
    `Félicitations ${childName} ! Tu as terminé l'activité ! Tu es génial !`,
    `Bravo ${childName} ! Tu as réussi ! Je suis fier de toi !`,
    `Super travail ${childName} ! Tu as tout fait !`,
    `Incroyable ${childName} ! Tu es vraiment doué !`
  ],
  'points-earned': [
    `Wow ${childName} ! Tu as gagné des points ! Continue comme ça !`,
    `Excellent ${childName} ! Des points bien mérités !`,
    `${childName}, tu accumules les points ! Tu es fantastique !`,
    `Bravo ${childName} ! Chaque point compte, tu progresses !`
  ],
  'level-up': [
    `🎉 ${childName}, tu as monté de niveau ! Tu es incroyable !`,
    `Félicitations ${childName} ! Nouveau niveau atteint ! Tu es un champion !`,
    `Wow ${childName} ! Tu progresses tellement vite ! Nouveau niveau !`,
    `${childName}, tu es maintenant à un niveau supérieur ! Tu es génial !`
  ],
  'badge-earned': [
    `🎖️ ${childName}, tu as gagné un nouveau badge ! Tu es exceptionnel !`,
    `Félicitations ${childName} ! Un nouveau badge pour toi ! Tu es formidable !`,
    `Bravo ${childName} ! Ce badge est bien mérité !`,
    `${childName}, tu collectionnes les badges ! Tu es incroyable !`
  ],
  streak: [
    `🔥 ${childName}, tu es en série ! Continue comme ça !`,
    `Super ${childName} ! Tu reviens chaque jour, c'est génial !`,
    `${childName}, ta série continue ! Tu es déterminé !`,
    `Bravo ${childName} ! Tu ne lâches rien ! Continue !`
  ],
  'keep-going': [
    `Continue ${childName}, tu peux le faire !`,
    `Ne lâche pas ${childName}, tu es presque au bout !`,
    `Allez ${childName}, encore un petit effort !`,
    `Tu y es presque ${childName} ! Continue !`
  ],
  'almost-there': [
    `Presque terminé ${childName} ! Encore un peu !`,
    `Tu y es presque ${childName} ! Tu es sur le point de réussir !`,
    `Plus qu'un petit effort ${childName} ! Tu vas y arriver !`,
    `C'est bientôt fini ${childName} ! Continue !`
  ],
  perfect: [
    `Parfait ${childName} ! Tu as tout réussi ! Tu es génial !`,
    `100% ${childName} ! C'est parfait ! Tu es incroyable !`,
    `Excellent ${childName} ! Tu as tout fait sans erreur !`,
    `Wow ${childName} ! C'est parfait ! Tu es vraiment doué !`
  ],
  'try-again': [
    `Ce n'est pas grave ${childName}, on réessaie ensemble !`,
    `${childName}, on apprend de nos erreurs. Essayons encore !`,
    `Pas de problème ${childName}, on recommence ! Tu vas y arriver !`,
    `${childName}, c'est en essayant qu'on apprend ! On continue !`
  ],
  'good-job': [
    `Bien joué ${childName} ! Tu fais du super travail !`,
    `Bravo ${childName} ! Continue comme ça !`,
    `Excellent ${childName} ! Tu progresses bien !`,
    `Super ${childName} ! Je suis fier de toi !`
  ],
  amazing: [
    `Incroyable ${childName} ! Tu es vraiment impressionnant !`,
    `Wow ${childName} ! Tu es fantastique !`,
    `${childName}, tu es génial ! Continue comme ça !`,
    `Extraordinaire ${childName} ! Tu es un champion !`
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
  private childName: string = 'Adent';

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
    this.childName = name || 'Adent';
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
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled || !this.speechSynthesis) {
        resolve();
        return;
      }

      if (options?.interrupt && this.currentUtterance) {
        this.speechSynthesis.cancel();
      }

      if (this.speechSynthesis.speaking && options?.priority === 'low') {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.voice = this.voice;
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = 'fr-FR';

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (error) => {
        this.currentUtterance = null;
        console.error('Erreur synthèse vocale:', error);
        reject(error);
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    });
  }

  encourage(type: EncouragementType, options?: {
    priority?: 'high' | 'normal' | 'low';
    interrupt?: boolean;
    customMessage?: string;
  }): Promise<void> {
    if (!this.isEnabled) return Promise.resolve();

    const message = options?.customMessage || this.getRandomMessage(type);
    return this.speak(message, options);
  }

  stop() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.speechSynthesis?.speaking || false;
  }
}

export const voiceManager = new VoiceEncouragementManager();

export function createEncourage(childName: string) {
  return {
    welcome: () => voiceManager.encourage('welcome', { priority: 'high' }),
    activityStart: () => voiceManager.encourage('activity-start', { priority: 'high' }),
    activityProgress: () => voiceManager.encourage('activity-progress', { priority: 'normal' }),
    activityComplete: () => voiceManager.encourage('activity-complete', { priority: 'high' }),
    pointsEarned: (points: number) => {
      const message = `Bravo ${childName} ! Tu as gagné ${points} points ! Continue comme ça !`;
      return voiceManager.encourage('points-earned', { 
        priority: 'high',
        customMessage: message 
      });
    },
    levelUp: (level: number) => {
      const message = `Félicitations ${childName} ! Tu as atteint le niveau ${level} ! Tu es incroyable !`;
      return voiceManager.encourage('level-up', { 
        priority: 'high',
        customMessage: message 
      });
    },
    badgeEarned: (badgeName: string) => {
      const message = `Bravo ${childName} ! Tu as gagné le badge ${badgeName} ! Tu es génial !`;
      return voiceManager.encourage('badge-earned', { 
        priority: 'high',
        customMessage: message 
      });
    },
    streak: (days: number) => {
      const message = `Super ${childName} ! ${days} jours consécutifs ! Tu es déterminé !`;
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
    amazing: () => voiceManager.encourage('amazing', { priority: 'high' }),
    correct: () => voiceManager.encourage('good-job', { priority: 'high' }),
    incorrect: () => voiceManager.encourage('try-again', { priority: 'normal' })
  };
}

// Export pour compatibilité avec le code existant
export const encourage = createEncourage('Adent');

