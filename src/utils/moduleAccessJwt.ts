import jwt from 'jsonwebtoken';

import { normalizeModuleIdForAccessJwt } from '@/utils/moduleAccessJwtIssue';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-jwt-secret-2024-production-secure-key';

export type DecodedModuleAccessJwt = {
  userId: string;
  userEmail?: string;
  moduleId: string;
  [key: string]: unknown;
};

/** Décode un jeton module (JWT signé ou Base64 legacy). */
export function decodeModuleAccessToken(token: string): DecodedModuleAccessJwt | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const userId = (payload.userId || payload.user_id) as string | undefined;
    if (!userId) return null;
    return {
      ...payload,
      userId,
      userEmail: (payload.userEmail || payload.user_email || payload.email) as string | undefined,
      moduleId: normalizeModuleIdForAccessJwt(String(payload.moduleId || '')),
    };
  } catch {
    try {
      const padLength = (4 - (token.length % 4)) % 4;
      const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
      const decoded = Buffer.from(padded, 'base64').toString('utf8');
      const payload = JSON.parse(decoded) as Record<string, unknown>;
      const userId = (payload.userId || payload.user_id) as string | undefined;
      if (!userId) return null;
      return {
        ...payload,
        userId,
        userEmail: (payload.userEmail || payload.user_email || payload.email) as string | undefined,
        moduleId: normalizeModuleIdForAccessJwt(String(payload.moduleId || '')),
      };
    } catch {
      return null;
    }
  }
}

export function moduleTokenSessionKey(moduleId: string): string {
  return `iahome_module_token_${(moduleId || '').trim().toLowerCase()}`;
}
