'use client';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '../../../utils/notificationService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId, moduleTitle, moduleDescription, moduleCategory, moduleUrl } = await request.json();
    
    if (!moduleId || !userId || !moduleTitle) {
      return NextResponse.json({ 
        success: false, 
        error: 'moduleId, userId et moduleTitle requis' 
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Module déjà activé',
        accessId: existingAccess.id
      });
    }

    // Créer l'accès module dans user_applications
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expire dans 1 an

    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        access_level: 'basic',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accessError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès' 
      }, { status: 500 });
    }

    // Envoyer une notification d'activation de module
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendModuleActivatedNotification(
        userData.email,
        userData.email.split('@')[0] || 'Utilisateur',
        moduleTitle
      );
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
      // Ne pas faire échouer l'activation si la notification échoue
    }

    // Note: La création automatique de token est désactivée car il y a une incohérence
    // entre les types de module_id (string dans modules vs integer dans access_tokens)
    // Les tokens d'accès doivent être créés manuellement par les administrateurs

    return NextResponse.json({
      success: true,
      message: 'Module activé avec succès',
      accessId: accessData.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
