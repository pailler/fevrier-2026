import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';

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
    const searchCriteriaId = searchParams.get('searchCriteriaId');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Statistiques générales
    let propertiesQuery = supabase
      .from('real_estate_properties')
      .select(`
        *,
        real_estate_search_criteria!inner(user_id)
      `)
      .eq('real_estate_search_criteria.user_id', user.id)
      .eq('is_archived', false);

    if (searchCriteriaId) {
      propertiesQuery = propertiesQuery.eq('search_criteria_id', searchCriteriaId);
    }

    const { data: properties, error: propertiesError } = await propertiesQuery;

    if (propertiesError) {
      throw propertiesError;
    }

    // Statistiques par source
    const bySource = properties?.reduce((acc: any, prop: any) => {
      const source = prop.source || 'unknown';
      if (!acc[source]) {
        acc[source] = { total: 0, new: 0, favorites: 0, avgPrice: 0, totalPrice: 0 };
      }
      acc[source].total++;
      if (prop.is_new) acc[source].new++;
      if (prop.is_favorite) acc[source].favorites++;
      acc[source].totalPrice += prop.price;
      acc[source].avgPrice = acc[source].totalPrice / acc[source].total;
      return acc;
    }, {}) || {};

    // Statistiques par mois
    const byMonth = properties?.reduce((acc: any, prop: any) => {
      const date = new Date(prop.first_seen_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, new: 0 };
      }
      acc[monthKey].total++;
      if (prop.is_new) acc[monthKey].new++;
      return acc;
    }, {}) || {};

    // Historique des recherches
    let historyQuery = supabase
      .from('real_estate_search_history')
      .select(`
        *,
        real_estate_search_criteria!inner(user_id)
      `)
      .eq('real_estate_search_criteria.user_id', user.id)
      .gte('executed_at', startDate.toISOString())
      .order('executed_at', { ascending: false });

    if (searchCriteriaId) {
      historyQuery = historyQuery.eq('search_criteria_id', searchCriteriaId);
    }

    const { data: history, error: historyError } = await historyQuery;

    if (historyError) {
      throw historyError;
    }

    // Statistiques de recherche
    const searchStats = history?.reduce((acc: any, h: any) => {
      acc.totalSearches++;
      acc.totalPropertiesFound += h.properties_found || 0;
      acc.totalNewProperties += h.new_properties || 0;
      if (h.search_status === 'success') acc.successfulSearches++;
      return acc;
    }, {
      totalSearches: 0,
      totalPropertiesFound: 0,
      totalNewProperties: 0,
      successfulSearches: 0
    }) || {
      totalSearches: 0,
      totalPropertiesFound: 0,
      totalNewProperties: 0,
      successfulSearches: 0
    };

    return NextResponse.json({
      statistics: {
        totalProperties: properties?.length || 0,
        newProperties: properties?.filter((p: any) => p.is_new).length || 0,
        favoriteProperties: properties?.filter((p: any) => p.is_favorite).length || 0,
        averagePrice: properties?.length > 0
          ? properties.reduce((sum: number, p: any) => sum + p.price, 0) / properties.length
          : 0,
        minPrice: properties?.length > 0
          ? Math.min(...properties.map((p: any) => p.price))
          : 0,
        maxPrice: properties?.length > 0
          ? Math.max(...properties.map((p: any) => p.price))
          : 0,
        bySource,
        byMonth,
        searchStats
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques', message: error.message },
      { status: 500 }
    );
  }
}
