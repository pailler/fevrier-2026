import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';

// GET - Récupérer les notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('real_estate_notifications')
      .select(`
        *,
        real_estate_properties(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ notifications: data || [] });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Marquer les notifications comme lues
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      const { error } = await supabase
        .from('real_estate_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('real_estate_notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications', message: error.message },
      { status: 500 }
    );
  }
}
