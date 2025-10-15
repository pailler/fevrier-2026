'use client';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 QR Session: Création de session...');
    
    const body = await request.json();
    const { userId, userEmail } = body;
    
    if (!userId || !userEmail) {
      return new NextResponse('Missing userId or userEmail', { status: 400 });
    }

    // Vérifier si l'utilisateur a accès au module QR codes
    const { data: userApp, error: userAppError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', 'qrcodes')
      .single();

    let userAppData = userApp;
    let isNewActivation = false;

    // Si l'utilisateur n'a pas encore accès au module QR codes, l'activer automatiquement (module gratuit)
    if (userAppError || !userApp) {
      ;
      
      const now = new Date();
      const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()); // 1 an

      const { data: activationData, error: activationError } = await supabase
        .from('user_applications')
        .insert([
          {
            user_id: userId,
            module_id: 'qrcodes',
            module_title: 'QRcodes',
            is_active: true,
            access_level: 'free',
            usage_count: 0,
            max_usage: 20, // 20 utilisations pour les modules gratuits
            expires_at: expiresAt.toISOString(),
          }
        ])
        .select()
        .single();

      if (activationError) {
        console.error('❌ QR Session: Erreur activation automatique:', activationError);
        return new NextResponse('Error activating QR codes module', { status: 500 });
      }

      userAppData = activationData;
      isNewActivation = true;
      ;
    }

    // Vérifier si la session n'est pas expirée
    if (userAppData.expires_at && new Date(userAppData.expires_at) < new Date()) {
      ;
      return new NextResponse('Session expired', { status: 403 });
    }

    // Vérifier le quota d'utilisation
    if (userAppData.max_usage && userAppData.usage_count >= userAppData.max_usage) {
      ;
      return new NextResponse('Usage quota exceeded', { status: 403 });
    }

    // Créer une session unique pour l'utilisateur
    const sessionId = `qr_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Stocker la session dans la base de données
    const { error: sessionError } = await supabase
      .from('qr_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        user_email: userEmail,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        is_active: true
      });

    if (sessionError) {
      console.error('❌ QR Session: Erreur création session:', sessionError);
      return new NextResponse('Error creating session', { status: 500 });
    }

    // Incrémenter le compteur d'utilisation
    const { error: incrementError } = await supabase
      .from('user_applications')
      .update({
        usage_count: userAppData.usage_count + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', userAppData.id);

    if (incrementError) {
      console.warn('⚠️ QR Session: Erreur incrémentation compteur:', incrementError);
    }

    console.log('✅ QR Session: Session créée avec succès:', sessionId);
    
    return new NextResponse(JSON.stringify({
      success: true,
      sessionId: sessionId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usageCount: userAppData.usage_count + 1,
      maxUsage: userAppData.max_usage,
      isNewActivation: isNewActivation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('❌ QR Session Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new NextResponse('Missing sessionId', { status: 400 });
    }

    // Vérifier la session
    const { data: session, error } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      ;
      return new NextResponse('Invalid or expired session', { status: 403 });
    }

    // Vérifier si la session n'est pas expirée
    if (new Date(session.expires_at) < new Date()) {
      ;
      return new NextResponse('Session expired', { status: 403 });
    }

    console.log('✅ QR Session: Session validée:', sessionId);
    
    return new NextResponse(JSON.stringify({
      success: true,
      session: {
        id: session.session_id,
        userId: session.user_id,
        userEmail: session.user_email,
        expiresAt: session.expires_at
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('❌ QR Session Validation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
