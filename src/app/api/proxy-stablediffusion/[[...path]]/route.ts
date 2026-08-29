import { NextRequest, NextResponse } from 'next/server';

import {
  buildStableDiffusionUpstreamUrl,
  rewriteStableDiffusionHtml,
  rewriteStableDiffusionPayload,
} from '@/utils/stableDiffusionProxy';

export const runtime = 'nodejs';
/** SSE Gradio (generate) peut rester ouvert plusieurs minutes */
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

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

/** CSP permissif : Gradio charge gradio.js depuis le CDN S3 (bloqué par le CSP global IAHome). */
const GRADIO_EMBED_CSP = [
  "default-src 'self' https://iahome.fr https://*.iahome.fr https://gradio.s3-us-west-2.amazonaws.com https://*.amazonaws.com blob: data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://gradio.s3-us-west-2.amazonaws.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://iahome.fr https://*.iahome.fr",
  "style-src 'self' 'unsafe-inline' https: data:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https://iahome.fr https://*.iahome.fr wss://iahome.fr wss://*.iahome.fr https://gradio.s3-us-west-2.amazonaws.com https://*.amazonaws.com blob: data:",
  "worker-src 'self' blob:",
  "media-src 'self' blob: data: https:",
  "frame-ancestors 'self' https://iahome.fr",
].join('; ');

function applyGradioEmbedHeaders(headers: Headers) {
  headers.set('Content-Security-Policy', GRADIO_EMBED_CSP);
  headers.delete('content-security-policy-report-only');
  headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
}

async function proxyStableDiffusion(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const segments = pathSegments ?? [];
  const pathJoined = segments.join('/');
  const upstreamUrl = buildStableDiffusionUpstreamUrl(segments, request.nextUrl.search);

  const headers = new Headers();
  const stripForwarded = new Set([
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for',
    'x-forwarded-port',
    'x-real-ip',
    'forwarded',
    'cf-connecting-ip',
    'cf-ray',
    'cf-visitor',
    'cdn-loop',
  ]);
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || stripForwarded.has(lower)) return;
    headers.set(key, value);
  });
  headers.set('User-Agent', request.headers.get('user-agent') || 'IAHome-StableDiffusion-Proxy/1.0');
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
    console.error('[proxy-stablediffusion] upstream error:', upstreamUrl, error);
    return NextResponse.json({ error: 'Stable Diffusion indisponible' }, { status: 503 });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set('X-Proxy-By', 'IAHome-StableDiffusion-Proxy');
  responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  applyGradioEmbedHeaders(responseHeaders);

  const isStreaming =
    pathJoined.includes('queue/data') ||
    pathJoined.includes('heartbeat') ||
    contentType.includes('text/event-stream') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('multipart/') ||
    (request.headers.get('accept') || '').includes('text/event-stream');

  if (isStreaming) {
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.set('Cache-Control', 'no-cache, no-transform');
    responseHeaders.set('X-Accel-Buffering', 'no');
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  if (contentType.includes('text/html')) {
    const html = await upstream.text();
    responseHeaders.delete('content-type');
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
    applyGradioEmbedHeaders(responseHeaders);
    return new NextResponse(rewriteStableDiffusionHtml(html), {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  if (
    contentType.includes('json') ||
    contentType.includes('text/') ||
    contentType.includes('javascript')
  ) {
    const text = await upstream.text();
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    return new NextResponse(rewriteStableDiffusionPayload(text), {
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
  return proxyStableDiffusion(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyStableDiffusion(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyStableDiffusion(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyStableDiffusion(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyStableDiffusion(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyStableDiffusion(request, context);
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
