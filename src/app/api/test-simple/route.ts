import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'API test fonctionne' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST test fonctionne' }, { status: 200 });
}