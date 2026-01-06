import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';
import { searchAllSites, geocodeAddress, type SearchCriteria } from '@/lib/real-estate/search-engines';

/**
 * Route pour exécuter des recherches automatiques programmées
 * À appeler via un cron job ou un service de planification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Vérifier l'authentification ou utiliser une clé API pour les cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer tous les critères de recherche actifs
    const { data: allCriteria, error: criteriaError } = await supabase
      .from('real_estate_search_criteria')
      .select('*')
      .eq('is_active', true);

    if (criteriaError) {
      throw criteriaError;
    }

    if (!allCriteria || allCriteria.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun critère de recherche actif',
        searchesExecuted: 0
      });
    }

    const results = [];

    // Exécuter une recherche pour chaque critère
    for (const criteria of allCriteria) {
      const searchCriteria: SearchCriteria = {
        minPrice: criteria.min_price,
        maxPrice: criteria.max_price,
        minSurface: criteria.min_surface || undefined,
        maxSurface: criteria.max_surface || undefined,
        region: criteria.region,
        department: criteria.department || undefined,
        city: criteria.city || undefined,
        propertyType: criteria.property_type || undefined,
        keywords: criteria.keywords || undefined
      };

      const searchResults = await searchAllSites(searchCriteria);
      const startTime = Date.now();

      // Traiter les résultats
      let newPropertiesCount = 0;
      let totalFound = 0;

      for (const result of searchResults) {
        if (result.success && result.properties.length > 0) {
          totalFound += result.properties.length;

          for (const property of result.properties) {
            // Géocoder si nécessaire
            if (!property.latitude || !property.longitude) {
              const address = property.address || `${property.city} ${property.postalCode || ''} ${property.region || ''}`;
              if (address) {
                const coords = await geocodeAddress(address);
                if (coords) {
                  property.latitude = coords.lat;
                  property.longitude = coords.lng;
                }
              }
            }

            const dbProperty = {
              search_criteria_id: criteria.id,
              external_id: property.externalId,
              source: property.source,
              title: property.title,
              description: property.description || null,
              price: property.price,
              surface: property.surface || null,
              rooms: property.rooms || null,
              bedrooms: property.bedrooms || null,
              bathrooms: property.bathrooms || null,
              property_type: property.propertyType || null,
              address: property.address || null,
              city: property.city || null,
              postal_code: property.postalCode || null,
              department: property.department || null,
              region: property.region || null,
              latitude: property.latitude || null,
              longitude: property.longitude || null,
              url: property.url,
              images: property.images || [],
              energy_class: property.energyClass || null,
              greenhouse_gas_emission: property.greenhouseGasEmission || null,
              year_built: property.yearBuilt || null,
              features: property.features || {},
              contact_info: property.contactInfo || {},
              is_new: true,
              first_seen_at: new Date().toISOString(),
              last_seen_at: new Date().toISOString()
            };

            // Vérifier si le bien existe déjà
            const { data: existing } = await supabase
              .from('real_estate_properties')
              .select('id')
              .eq('external_id', property.externalId)
              .eq('source', property.source)
              .single();

            if (existing) {
              // Mettre à jour
              await supabase
                .from('real_estate_properties')
                .update({
                  ...dbProperty,
                  is_new: false,
                  last_seen_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            } else {
              // Nouveau bien
              const { data: newProperty } = await supabase
                .from('real_estate_properties')
                .insert(dbProperty)
                .select()
                .single();

              if (newProperty) {
                newPropertiesCount++;

                // Créer une notification pour le nouveau bien
                await supabase
                  .from('real_estate_notifications')
                  .insert({
                    user_id: criteria.user_id,
                    property_id: newProperty.id,
                    notification_type: 'new_property',
                    title: 'Nouveau bien trouvé',
                    message: `Un nouveau bien correspondant à vos critères a été trouvé: ${property.title}`
                  });
              }
            }
          }
        }

        // Enregistrer l'historique
        await supabase
          .from('real_estate_search_history')
          .insert({
            search_criteria_id: criteria.id,
            source: result.source,
            properties_found: result.properties.length,
            new_properties: result.properties.filter((p: any) => 
              result.properties.some((rp: any) => rp.externalId === p.externalId)
            ).length,
            search_duration_ms: Date.now() - startTime,
            search_status: result.success ? 'success' : 'error',
            error_message: result.error || null,
            search_params: searchCriteria
          });
      }

      results.push({
        criteriaId: criteria.id,
        criteriaName: criteria.name,
        totalFound,
        newProperties: newPropertiesCount
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Recherches automatiques exécutées',
      searchesExecuted: allCriteria.length,
      results
    });

  } catch (error: any) {
    console.error('Erreur lors de la recherche automatique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche automatique', message: error.message },
      { status: 500 }
    );
  }
}
