import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: process.env.METUBE_URL || 'http://localhost:8081', // Port exposé sur localhost
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const targetUrl = `${METUBE_CONFIG.url}/socket.io/?${queryString}`;

    // Pass-through headers important for Engine.IO
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'IAHome-Metube-Proxy/1.0',
      'Accept': request.headers.get('accept') || '*/*',
      'Connection': 'keep-alive',
      'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
    };

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: upstreamHeaders,
    });

    const contentType = response.headers.get('content-type') || 'text/plain; charset=UTF-8';
    const status = response.status;

    const body = response.body ?? (await response.text());

    return new NextResponse(body as any, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const targetUrl = `${METUBE_CONFIG.url}/socket.io/?${queryString}`;

    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'IAHome-Metube-Proxy/1.0',
      'Accept': request.headers.get('accept') || '*/*',
      'Connection': 'keep-alive',
      'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
      'Content-Type': request.headers.get('content-type') || 'text/plain;charset=UTF-8',
    };

    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body,
    });

    const contentType = response.headers.get('content-type') || 'text/plain; charset=UTF-8';
    const status = response.status;
    const respBody = response.body ?? (await response.text());

    return new NextResponse(respBody as any, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Duplicate POST/OPTIONS removed
