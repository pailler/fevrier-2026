import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

// GET - Récupérer toutes les catégories et services pour l'affichage public
export async function GET(request: NextRequest) {
  try {
    // Récupérer les catégories actives
    const { data: categories, error: categoriesError } = await supabase
      .from('administration_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoriesError) {
      console.error('Erreur lors de la récupération des catégories:', categoriesError);
      // Retourner un tableau vide plutôt que d'échouer
      return NextResponse.json({
        success: true,
        data: []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Récupérer les services actifs avec leurs catégories
    const { data: services, error: servicesError } = await supabase
      .from('administration_services')
      .select(`
        *,
        category:administration_categories(id, name, icon, color)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (servicesError) {
      console.error('Erreur lors de la récupération des services:', servicesError);
      // Si erreur sur les services, on continue avec un tableau vide
    }

    // Grouper les services par catégorie
    // S'assurer que categories et services sont des tableaux
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeServices = Array.isArray(services) ? services : [];
    const administrations = safeCategories.map((category) => {
      const categoryServices = safeServices
        .filter((service: any) => service.category_id === category.id)
        .map((service: any) => ({
          name: service.name,
          description: service.description || '',
          url: service.url,
          icon: service.icon || '🔗',
          popular: service.is_popular || false,
          appStoreUrl: service.app_store_url || undefined,
          playStoreUrl: service.play_store_url || undefined
        }));

      return {
        name: category.name,
        icon: category.icon,
        color: category.color,
        services: categoryServices
      };
    }).filter((admin) => admin.services.length > 0); // Ne garder que les catégories avec des services

    return NextResponse.json({
      success: true,
      data: administrations
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur inconnue',
      data: []
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

