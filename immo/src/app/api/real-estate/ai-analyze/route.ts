import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';
import { analyzePropertyWithAI } from '@/lib/real-estate/search-engines';

export async function POST(request: NextRequest) {
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
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId requis' },
        { status: 400 }
      );
    }

    // Récupérer la propriété
    const { data: property, error: propertyError } = await supabase
      .from('real_estate_properties')
      .select(`
        *,
        real_estate_search_criteria!inner(user_id)
      `)
      .eq('id', propertyId)
      .eq('real_estate_search_criteria.user_id', user.id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Propriété non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    // Analyser avec l'IA
    const analysis = await analyzePropertyWithAI({
      externalId: property.external_id,
      source: property.source,
      title: property.title,
      description: property.description || undefined,
      price: property.price,
      surface: property.surface || undefined,
      rooms: property.rooms || undefined,
      bedrooms: property.bedrooms || undefined,
      bathrooms: property.bathrooms || undefined,
      propertyType: property.property_type || undefined,
      address: property.address || undefined,
      city: property.city || undefined,
      postalCode: property.postal_code || undefined,
      department: property.department || undefined,
      region: property.region || undefined,
      latitude: property.latitude || undefined,
      longitude: property.longitude || undefined,
      url: property.url,
      images: property.images || undefined,
      energyClass: property.energy_class || undefined,
      greenhouseGasEmission: property.greenhouse_gas_emission || undefined,
      yearBuilt: property.year_built || undefined,
      features: property.features || undefined,
      contactInfo: property.contact_info || undefined
    });

    // Sauvegarder l'analyse dans les features
    const updatedFeatures = {
      ...(property.features || {}),
      aiAnalysis: {
        ...analysis,
        analyzedAt: new Date().toISOString()
      }
    };

    await supabase
      .from('real_estate_properties')
      .update({ features: updatedFeatures })
      .eq('id', propertyId);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'analyse IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse IA', message: error.message },
      { status: 500 }
    );
  }
}
