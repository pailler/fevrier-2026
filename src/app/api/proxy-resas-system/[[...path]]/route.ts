import { NextRequest, NextResponse } from 'next/server';

import {
  buildResasSystemUpstreamUrl,
  rewriteResasSystemHtml,
  rewriteResasSystemJs,
} from '@/utils/resasSystemProxy';

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

async function proxyResasSystem(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const segments = pathSegments ?? [];
  const upstreamUrl = buildResasSystemUpstreamUrl(segments, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set('User-Agent', request.headers.get('user-agent') || 'IAHome-Resas-Proxy/1.0');
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
    console.error('[proxy-resas-system] upstream error:', upstreamUrl, error);
    return NextResponse.json({ error: 'Resas System indisponible' }, { status: 503 });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set('X-Proxy-By', 'IAHome-Resas-Proxy');
  responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');

  if (contentType.includes('text/html')) {
    const html = await upstream.text();
    responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
    return new NextResponse(rewriteResasSystemHtml(html), {
      status: upstream.status === 304 ? 200 : upstream.status,
      headers: responseHeaders,
    });
  }

  const isJs =
    contentType.includes('javascript') ||
    segments.some((s) => s.endsWith('.js'));
  if (isJs) {
    const js = await upstream.text();
    responseHeaders.set('Content-Type', contentType || 'application/javascript; charset=utf-8');
    return new NextResponse(rewriteResasSystemJs(js), {
      status: upstream.status === 304 ? 200 : upstream.status,
      headers: responseHeaders,
    });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status === 304 ? 200 : upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyResasSystem(request, context);
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
