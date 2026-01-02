import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';
import { searchAllSites, geocodeAddress, type SearchCriteria } from '@/lib/real-estate/search-engines';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      searchCriteriaId,
      criteria,
      includeAI = false,
      includeAuctions = true,
      includeNotaires = true,
      includeSaisies = true
    }: {
      searchCriteriaId?: string;
      criteria: SearchCriteria;
      includeAI?: boolean;
      includeAuctions?: boolean;
      includeNotaires?: boolean;
      includeSaisies?: boolean;
    } = body;

    if (!criteria) {
      return NextResponse.json(
        { error: 'Critères de recherche requis' },
        { status: 400 }
      );
    }

    // Récupérer les propriétés existantes pour l'IA si nécessaire
    let existingProperties = [];
    if (includeAI && searchCriteriaId) {
      const { data: existing } = await supabase
        .from('real_estate_properties')
        .select('*')
        .eq('search_criteria_id', searchCriteriaId)
        .limit(50);
      existingProperties = existing || [];
    }

    // Lancer la recherche sur tous les sites
    const searchResults = await searchAllSites(criteria, includeAI, existingProperties);

    // Traiter les résultats et les sauvegarder en base
    const allProperties: any[] = [];
    const startTime = Date.now();

    for (const result of searchResults) {
      if (result.success && result.properties.length > 0) {
        for (const property of result.properties) {
          // Géocoder l'adresse si nécessaire
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

          // Préparer l'objet pour la base de données
          const dbProperty = {
            search_criteria_id: searchCriteriaId || null,
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
            .select('id, is_new')
            .eq('external_id', property.externalId)
            .eq('source', property.source)
            .single();

          if (existing) {
            // Mettre à jour le bien existant
            const { error: updateError } = await supabase
              .from('real_estate_properties')
              .update({
                ...dbProperty,
                is_new: false, // Ce n'est plus un nouveau bien
                last_seen_at: new Date().toISOString()
              })
              .eq('id', existing.id);

            if (!updateError) {
              allProperties.push({ ...dbProperty, id: existing.id, is_new: existing.is_new });
            }
          } else {
            // Insérer le nouveau bien
            const { data: newProperty, error: insertError } = await supabase
              .from('real_estate_properties')
              .insert(dbProperty)
              .select()
              .single();

            if (!insertError && newProperty) {
              allProperties.push({ ...newProperty, is_new: true });
            }
          }
        }
      }
    }

    const searchDuration = Date.now() - startTime;
    const totalFound = allProperties.length;
    const newProperties = allProperties.filter(p => p.is_new).length;

    // Enregistrer l'historique de recherche
    if (searchCriteriaId) {
      for (const result of searchResults) {
        await supabase
          .from('real_estate_search_history')
          .insert({
            search_criteria_id: searchCriteriaId,
            source: result.source,
            properties_found: result.properties.length,
            new_properties: result.properties.filter((p: any) => 
              allProperties.some(ap => ap.external_id === p.externalId && ap.is_new)
            ).length,
            search_duration_ms: searchDuration,
            search_status: result.success ? 'success' : 'error',
            error_message: result.error || null,
            search_params: criteria
          });
      }
    }

    return NextResponse.json({
      success: true,
      properties: allProperties,
      statistics: {
        totalFound,
        newProperties,
        searchDuration,
        sources: searchResults.map(r => ({
          source: r.source,
          found: r.properties.length,
          success: r.success
        }))
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la recherche:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche', message: error.message },
      { status: 500 }
    );
  }
}
