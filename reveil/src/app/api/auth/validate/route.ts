import { NextRequest, NextResponse } from 'next/server';
import { MODULE_ID } from '@/lib/iahomeAuth';
import { getIahomeServerUrl } from '@/lib/iahomeServerUrl';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 });
    }

    const res = await fetch(`${getIahomeServerUrl()}/api/validate-internal-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, moduleId: MODULE_ID }),
      cache: 'no-store',
    });

    const data = (await res.json().catch(() => ({}))) as {
      userId?: string;
      userEmail?: string;
      error?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? 'Acces refuse' },
        { status: res.status === 401 || res.status === 403 ? res.status : 502 }
      );
    }

    if (!data.userId) {
      return NextResponse.json({ error: 'Compte invalide' }, { status: 502 });
    }

    return NextResponse.json({ userId: data.userId, userEmail: data.userEmail });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Validation indisponible' },
      { status: 502 }
    );
  }
}
