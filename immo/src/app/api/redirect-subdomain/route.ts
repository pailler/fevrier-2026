import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Rediriger immédiatement vers iahome.fr
  return NextResponse.redirect('https://iahome.fr', 302);
}

