import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export interface GradioToken {
  userId: string;
  userEmail: string;
  moduleId: string;
  moduleTitle: string;
  accessLevel: string;
  expiresAt: number;
  permissions: string[];
  issuedAt: number;
  iat: number;
  exp: number;
}

export function verifyGradioToken(token: string): GradioToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as GradioToken;
    
    // Vérifier si le token n'est pas expiré
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return null;
  }
}









































