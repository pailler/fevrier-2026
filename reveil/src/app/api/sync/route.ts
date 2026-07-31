import { NextRequest, NextResponse } from 'next/server';
import { getIahomeServerUrl } from '@/lib/iahomeServerUrl';

function extractBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

async function proxySync(request: NextRequest, method: 'GET' | 'POST') {
  const token = extractBearer(request);
  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let body: string | undefined;
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    body = await request.text();
  }

  const res = await fetch(`${getIahomeServerUrl()}/api/reveil-sync`, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: NextRequest) {
  try {
    return await proxySync(request, 'GET');
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync indisponible' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await proxySync(request, 'POST');
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync indisponible' },
      { status: 502 }
    );
  }
}
