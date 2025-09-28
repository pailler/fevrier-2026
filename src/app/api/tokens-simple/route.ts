import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API tokens-simple fonctionne',
    tokens: 0,
    packageName: null,
    purchaseDate: null,
    isActive: false
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'POST tokens-simple fonctionne',
    received: body
  }, { status: 200 });
}
