import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

/**
 * Liste publique des biens (carnet d'annonces), sans session utilisateur.
 * Utilise la service role côté serveur uniquement.
 *
 * Optionnel : REAL_ESTATE_CARNET_USER_ID — limite aux biens liés aux critères de cet utilisateur
 * (recommandé si plusieurs comptes alimentent la même base Supabase).
 */
export async function GET() {
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey();
    if (!key || key === 'REPLACE_WITH_REAL_VALUE') {
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (Supabase service role).' },
        { status: 503 }
      );
    }

    const admin = createClient(url, key);
    const ownerId = process.env.REAL_ESTATE_CARNET_USER_ID?.trim();

    const limit = Math.min(
      500,
      Math.max(1, parseInt(process.env.REAL_ESTATE_CARNET_LIMIT || '200', 10) || 200)
    );

    const columnsPublic =
      'id,title,description,price,surface,rooms,address,city,postal_code,region,source,url,images,is_new,first_seen_at,last_seen_at';
    const columnsScoped = `${columnsPublic},real_estate_search_criteria!inner(user_id)`;

    let query = admin
      .from('real_estate_properties')
      .select(ownerId ? columnsScoped : columnsPublic)
      .eq('is_archived', false)
      .order('first_seen_at', { ascending: false })
      .limit(limit);

    if (ownerId) {
      query = query.eq('real_estate_search_criteria.user_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('carnet-annonces:', error);
      return NextResponse.json(
        { error: 'Impossible de charger les annonces', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { properties: data ?? [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    console.error('carnet-annonces:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
