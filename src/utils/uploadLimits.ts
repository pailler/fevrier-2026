// Configuration des limites d'upload pour Whisper
export const UPLOAD_LIMITS = {
  // Limites par type de fichier
  AUDIO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/aac']
  },
  VIDEO: {
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime']
  },
  IMAGE: {
    maxSize: 50 * 1024 * 1024, // 50MB
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
