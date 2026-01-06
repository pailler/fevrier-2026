import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API test-tokens fonctionne',
    tokens: 0,
    packageName: null,
    purchaseDate: null,
    isActive: false
  }, { status: 200 });
}
