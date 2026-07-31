import { NextRequest, NextResponse } from 'next/server';
import { getIahomeServerUrl } from '@/lib/iahomeServerUrl';

function extractBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function GET(request: NextRequest) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  try {
    const res = await fetch(`${getIahomeServerUrl()}/api/reveil-sounds`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Liste indisponible' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  try {
    const formData = await request.formData();
    const res = await fetch(`${getIahomeServerUrl()}/api/reveil-sounds`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload indisponible' },
      { status: 502 }
    );
  }
}
