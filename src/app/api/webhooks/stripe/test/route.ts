import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de test pour vérifier que le webhook est accessible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: '/api/webhooks/stripe'
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint received POST request',
    bodyLength: body.length,
    timestamp: new Date().toISOString(),
    headers: {
      'stripe-signature': request.headers.get('stripe-signature') ? 'present' : 'missing'
    }
  });
}
