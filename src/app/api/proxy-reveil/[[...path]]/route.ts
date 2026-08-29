import { NextRequest, NextResponse } from 'next/server';

import {
  buildReveilUpstreamUrl,
  rewriteReveilHtml,
  rewriteReveilPayload,
} from '@/utils/reveilProxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type RouteContext = { params: Promise<{ path?: string[] }> };

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

async function proxyReveil(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const segments = pathSegments ?? [];
  const upstreamUrl = buildReveilUpstreamUrl(segments, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set('User-Agent', request.headers.get('user-agent') || 'IAHome-Reveil-Proxy/1.0');
  headers.delete('host');

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
    console.error('[proxy-reveil] upstream error:', upstreamUrl, error);
    return NextResponse.json({ error: 'Réveil Intelligent indisponible' }, { status: 503 });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set('X-Proxy-By', 'IAHome-Reveil-Proxy');
  responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');

  if (contentType.includes('text/html')) {
    const html = await upstream.text();
    responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
    return new NextResponse(rewriteReveilHtml(html), {
      status: upstream.status === 304 ? 200 : upstream.status,
      headers: responseHeaders,
    });
  }

  if (
    contentType.includes('text/') ||
    contentType.includes('json') ||
    contentType.includes('javascript') ||
    contentType.includes('rsc')
  ) {
    const text = await upstream.text();
    return new NextResponse(rewriteReveilPayload(text), {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function POST(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyReveil(request, context);
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
