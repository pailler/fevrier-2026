import { NextRequest, NextResponse } from 'next/server';

const VOICE_ISOLATION_URL = process.env.VOICE_ISOLATION_URL || 'http://localhost:8100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const url = new URL(request.url);
    const pathString = path.length > 0 ? path.join('/') : '';
    const queryString = url.search;
    
    const targetUrl = `${VOICE_ISOLATION_URL}/${pathString}${queryString}`;
    
    console.log(`🎤 Voice Isolation Proxy: GET ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'IAHome-VoiceIsolation-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur service: ${response.status}` },
        { status: response.status }
      );
    }
    
    const contentType = response.headers.get('content-type') || 'text/html';
    const content = await response.arrayBuffer();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-VoiceIsolation',
      },
    });
    
  } catch (error: any) {
    console.error('❌ Voice Isolation Proxy Error:', error);
    return NextResponse.json(
      { error: `Erreur proxy: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const url = new URL(request.url);
    const pathString = path.length > 0 ? path.join('/') : '';
    const queryString = url.search;
    
    const targetUrl = `${VOICE_ISOLATION_URL}/${pathString}${queryString}`;
    
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type');
    
    console.log(`🎤 Voice Isolation Proxy: POST ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'IAHome-VoiceIsolation-Proxy/1.0',
        'Content-Type': contentType || 'application/json',
      },
      body: body,
    });
    
    const responseContentType = response.headers.get('content-type') || 'application/json';
    const responseBody = await response.arrayBuffer();
    
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': responseContentType,
        'X-Proxy-By': 'IAHome-VoiceIsolation',
      },
    });
    
  } catch (error: any) {
    console.error('❌ Voice Isolation Proxy POST Error:', error);
    return NextResponse.json(
      { error: `Erreur proxy: ${error.message}` },
      { status: 500 }
    );
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
