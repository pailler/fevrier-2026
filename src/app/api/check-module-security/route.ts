import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ModuleSecurityService from '../../../utils/moduleSecurityService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moduleIdentifier = url.searchParams.get('module');
    const userId = url.searchParams.get('userId');

    if (!moduleIdentifier || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants: module et userId requis' },
        { status: 400 }
      );
    }

    const securityService = ModuleSecurityService.getInstance();
    const result = await securityService.checkModuleVisibilityInEncours(userId, moduleIdentifier);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur API check-module-security:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleIdentifier, userId } = body;

    if (!moduleIdentifier || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants: moduleIdentifier et userId requis' },
        { status: 400 }
      );
    }

    const securityService = ModuleSecurityService.getInstance();
    const result = await securityService.checkModuleVisibilityInEncours(userId, moduleIdentifier);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur API check-module-security POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}



















