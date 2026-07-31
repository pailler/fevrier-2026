import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
const JWT_SECRET = process.env.JWT_SECRET || 'iahome-jwt-secret-2024-production-secure-key';
export const REVEIL_MODULE_ID = 'reveil-intelligent';

export function reveilCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = [
    'https://reveil-intelligent.iahome.fr',
    'http://localhost:7891',
    'http://127.0.0.1:7891',
    'https://iahome.fr',
    'http://localhost:3000',
  ];
  const normalized = origin?.replace(/\/$/, '') ?? '';
  const allowOrigin = normalized && allowed.includes(normalized) ? normalized : '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function decodeReveilToken(token: string): { userId: string; moduleId?: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: string; user_id?: string; moduleId?: string };
    const userId = payload.userId ?? payload.user_id;
    if (!userId) return null;
    return { userId, moduleId: payload.moduleId };
  } catch {
    try {
      const padLength = (4 - (token.length % 4)) % 4;
      const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
        userId?: string;
        user_id?: string;
        moduleId?: string;
      };
      const userId = payload.userId ?? payload.user_id;
      if (!userId) return null;
      return { userId, moduleId: payload.moduleId };
    } catch {
      return null;
    }
  }
}

export async function assertReveilAccess(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_applications')
    .select('id')
    .eq('user_id', userId)
    .eq('module_id', REVEIL_MODULE_ID)
    .maybeSingle();
  return Boolean(data);
}

export function extractBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function authorizeReveilRequest(
  request: NextRequest
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const token = extractBearer(request);
  if (!token) return { ok: false, status: 401, error: 'Token requis' };

  const decoded = decodeReveilToken(token);
  if (!decoded?.userId || decoded.moduleId !== REVEIL_MODULE_ID) {
    return { ok: false, status: 401, error: 'Token invalide' };
  }

  if (!(await assertReveilAccess(decoded.userId))) {
    return { ok: false, status: 403, error: 'Acces non autorise' };
  }

  return { ok: true, userId: decoded.userId };
}
