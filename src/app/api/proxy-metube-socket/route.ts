import { NextRequest, NextResponse } from 'next/server';

import { METUBE_INTERNAL_URL } from '@/utils/metubeProxy';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function buildSocketUpstreamUrl(request: NextRequest): string {
  const base = METUBE_INTERNAL_URL.replace(/\/$/, '');
  const search = request.nextUrl.search;
  return `${base}/socket.io/${search || ''}`;
}

async function proxyMetubeSocket(request: NextRequest) {
  const upstreamUrl = buildSocketUpstreamUrl(request);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set('User-Agent', request.headers.get('user-agent') || 'IAHome-MeTube-Socket-Proxy/1.0');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, init);
  } catch (error) {
    console.error('[proxy-metube-socket] upstream error:', upstreamUrl, error);
    return NextResponse.json({ error: 'MeTube Socket.IO indisponible' }, { status: 503 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set('X-Proxy-By', 'IAHome-MeTube-Socket-Proxy');
  responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxyMetubeSocket(request);
}

export async function POST(request: NextRequest) {
  return proxyMetubeSocket(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
