import { NextRequest, NextResponse } from 'next/server';
import { getIahomeServerUrl } from '@/lib/iahomeServerUrl';

function extractBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  const { id } = await context.params;

  try {
    const res = await fetch(`${getIahomeServerUrl()}/api/reveil-sounds/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'audio/mpeg';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lecture indisponible' },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  const { id } = await context.params;

  try {
    const res = await fetch(`${getIahomeServerUrl()}/api/reveil-sounds/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Suppression indisponible' },
      { status: 502 }
    );
  }
}
