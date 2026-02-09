import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour recevoir les rapports de violation CSP (Content-Security-Policy).
 * Répond 204 pour éviter le 404 en console. Les rapports peuvent être loggés en dev.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (
      contentType.includes('application/csp-report') ||
      contentType.includes('application/json')
    ) {
      const body = await request.json().catch(() => ({}));
      if (process.env.NODE_ENV === 'development' && body?.['csp-report']) {
        console.warn('[CSP Report]', body['csp-report']);
      }
    }
  } catch {
    // Ignorer les erreurs de lecture du body
  }
  return new NextResponse(null, { status: 204 });
}
