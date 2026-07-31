import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { loadReveilUserSettings, saveReveilUserSettings } from '@/lib/reveilUserSettingsStore';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
const JWT_SECRET = process.env.JWT_SECRET || 'iahome-jwt-secret-2024-production-secure-key';
const MODULE_ID = 'reveil-intelligent';

function corsHeaders(origin: string | null): Record<string, string> {
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function decodeToken(token: string): { userId: string; moduleId?: string } | null {
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

async function assertAccess(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_applications')
    .select('id')
    .eq('user_id', userId)
    .eq('module_id', MODULE_ID)
    .maybeSingle();
  return Boolean(data);
}

function extractBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);
  const token = extractBearer(request);

  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401, headers });
  }

  const decoded = decodeToken(token);
  if (!decoded?.userId || decoded.moduleId !== MODULE_ID) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401, headers });
  }

  if (!(await assertAccess(decoded.userId))) {
    return NextResponse.json({ error: 'Acces non autorise' }, { status: 403, headers });
  }

  const data = await loadReveilUserSettings(decoded.userId);

  if (!data) {
    return NextResponse.json({ alarms: [], preferences: {} }, { headers });
  }

  return NextResponse.json(
    {
      alarms: data.alarms ?? [],
      preferences: data.preferences ?? {},
      updatedAt: data.updated_at,
    },
    { headers }
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);
  const token = extractBearer(request);

  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401, headers });
  }

  const decoded = decodeToken(token);
  if (!decoded?.userId || decoded.moduleId !== MODULE_ID) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401, headers });
  }

  if (!(await assertAccess(decoded.userId))) {
    return NextResponse.json({ error: 'Acces non autorise' }, { status: 403, headers });
  }

  const body = (await request.json()) as { alarms?: unknown; preferences?: unknown };
  const alarms = Array.isArray(body.alarms) ? body.alarms : [];
  const preferences = body.preferences && typeof body.preferences === 'object' ? body.preferences : {};

  const saved = await saveReveilUserSettings(decoded.userId, {
    alarms,
    preferences: preferences as Record<string, unknown>,
  });

  if (!saved.ok) {
    return NextResponse.json({ error: 'Erreur enregistrement', details: saved.error }, { status: 500, headers });
  }

  return NextResponse.json({ success: true }, { headers });
}
