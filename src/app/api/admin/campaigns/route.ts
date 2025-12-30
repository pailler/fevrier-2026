import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';

// GET - Récupérer toutes les campagnes
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: campaigns, error } = await supabase
      .from('advertising_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération campagnes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des campagnes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (error) {
    console.error('❌ Erreur API campaigns:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle campagne
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    const {
      name,
      platform,
      template_id,
      budget_daily,
      budget_total,
      start_date,
      end_date,
      audience_size,
      audience_location,
      creative_type,
      landing_page_url,
      notes,
      created_by
    } = body;

    if (!name || !platform || !budget_daily) {
      return NextResponse.json(
        { error: 'Nom, plateforme et budget quotidien sont requis' },
        { status: 400 }
      );
    }

    const { data: campaign, error } = await supabase
      .from('advertising_campaigns')
      .insert([{
        name,
        platform,
        template_id,
        status: 'draft',
        budget_daily: parseFloat(budget_daily),
        budget_total: budget_total ? parseFloat(budget_total) : null,
        start_date: start_date || null,
        end_date: end_date || null,
        audience_size,
        audience_location,
        creative_type,
        landing_page_url,
        notes,
        created_by
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création campagne:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la campagne' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('❌ Erreur API campaigns POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

