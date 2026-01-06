// Configuration des limites d'upload pour Whisper
export const UPLOAD_LIMITS = {
  // Limites par type de fichier
  AUDIO: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/aac']
  },
  VIDEO: {
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime']
  },
  IMAGE: {
    maxSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp']
  }
};

// Fonction pour valider la taille du fichier
export function validateFileSize(file: File, type: 'AUDIO' | 'VIDEO' | 'IMAGE'): { valid: boolean; error?: string } {
  const limits = UPLOAD_LIMITS[type];
  
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
    };
  }
  
  if (!limits.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Types autorisés: ${limits.allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
}
