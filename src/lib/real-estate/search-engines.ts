/**
 * Services de recherche immobilière multi-sites
 * Recherche sur Leboncoin, SeLoger, PAP et sites locaux de la Vendée
 */

export interface SearchCriteria {
  minPrice: number;
  maxPrice: number;
  minSurface?: number;
  maxSurface?: number;
  region: string;
  department?: string;
  city?: string;
  postalCode?: string;
  propertyType?: string;
  keywords?: string[];
}

export interface Property {
  externalId: string;
  source: string;
  title: string;
  description?: string;
  price: number;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  department?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  url: string;
  images?: string[];
  energyClass?: string;
  greenhouseGasEmission?: string;
  yearBuilt?: number;
  features?: Record<string, any>;
  contactInfo?: Record<string, any>;
}

export interface SearchResult {
  properties: Property[];
  totalFound: number;
  source: string;
  success: boolean;
  error?: string;
}

/**
 * Recherche sur Leboncoin via leur API publique ou scraping
 */
export async function searchLeboncoin(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Leboncoin utilise une API interne, on va construire l'URL de recherche
    const params = new URLSearchParams({
      text: criteria.keywords?.join(' ') || '',
      category: '9', // Immobilier
      real_estate_type: criteria.propertyType === 'house' ? '1' : '2', // 1 = Maison, 2 = Appartement
      price: `${criteria.minPrice}-${criteria.maxPrice}`,
      square: criteria.minSurface ? `${criteria.minSurface}-` : '',
      location: criteria.city || criteria.region || 'Vendée',
      sort: 'time',
      order: 'desc'
    });

    const searchUrl = `https://www.leboncoin.fr/recherche?${params.toString()}`;
    
    // Note: Leboncoin bloque souvent le scraping, il faudra utiliser leur API officielle
    // ou un service proxy. Pour l'instant, on retourne une structure vide.
    
    return {
      properties: [],
      totalFound: 0,
      source: 'leboncoin',
      success: true,
      error: 'Leboncoin nécessite une intégration API officielle ou un service de scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'leboncoin',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur SeLoger
 */
export async function searchSeLoger(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // SeLoger API - construction de l'URL de recherche
    const params = new URLSearchParams({
      types: criteria.propertyType === 'house' ? '2' : '1', // 2 = Maison, 1 = Appartement
      projects: '2', // Vente
      priceMin: criteria.minPrice.toString(),
      priceMax: criteria.maxPrice.toString(),
      surfaceMin: criteria.minSurface?.toString() || '',
      rooms: '',
      zipCodes: criteria.postalCode || '',
      locations: criteria.city || criteria.department || 'Vendée'
    });

    const searchUrl = `https://www.seloger.com/list.htm?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'seloger',
      success: true,
      error: 'SeLoger nécessite une intégration API ou scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'seloger',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur PAP (Particulier à Particulier)
 */
export async function searchPAP(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // PAP utilise une API, construction de l'URL
    const params = new URLSearchParams({
      transaction: 'vente',
      type: criteria.propertyType === 'house' ? 'maison' : 'appartement',
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      surfaceMin: criteria.minSurface?.toString() || '',
      codePostal: criteria.postalCode || '',
      ville: criteria.city || '',
      departement: criteria.department || '85' // 85 = Vendée
    });

    const searchUrl = `https://www.pap.fr/annonces/vente-${criteria.propertyType || 'maison'}-vendee?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'pap',
      success: true,
      error: 'PAP nécessite une intégration API ou scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'pap',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur les sites locaux de la Vendée
 */
export async function searchLocalVendee(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Sites locaux de la Vendée
    const localSites = [
      'https://www.century21.fr/',
      'https://www.orpi.com/',
      'https://www.guy-hoquet.com/',
      'https://www.laforet.com/',
      'https://www.foncia.fr/'
    ];

    // Pour chaque site, on pourrait faire une recherche
    // Pour l'instant, on retourne une structure vide
    
    return {
      properties: [],
      totalFound: 0,
      source: 'local_vendee',
      success: true,
      error: 'Sites locaux nécessitent une intégration spécifique par site'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'local_vendee',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche par IA - Analyse intelligente des biens existants et suggestions
 */
export async function searchByAI(criteria: SearchCriteria, existingProperties?: Property[]): Promise<SearchResult> {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return {
        properties: [],
        totalFound: 0,
        source: 'ai_search',
        success: false,
        error: 'Clé API OpenAI non configurée'
      };
    }

    // Construire le prompt pour l'IA
    const prompt = `Tu es un expert en immobilier. Analyse ces critères de recherche et suggère des biens correspondants :

Critères :
- Prix : ${criteria.minPrice}€ - ${criteria.maxPrice}€
- Surface : ${criteria.minSurface ? criteria.minSurface + ' m² minimum' : 'Non spécifié'}
- Région : ${criteria.region}
- Type : ${criteria.propertyType || 'Maison'}
- Mots-clés : ${criteria.keywords?.join(', ') || 'Aucun'}

${existingProperties && existingProperties.length > 0 ? `
Biens existants déjà trouvés (${existingProperties.length}) :
${existingProperties.slice(0, 10).map(p => `- ${p.title} (${p.price}€, ${p.surface || 'N/A'} m²)`).join('\n')}
` : ''}

Suggère des stratégies de recherche alternatives :
1. Zones géographiques similaires ou adjacentes
2. Types de biens alternatifs qui pourraient correspondre
3. Mots-clés supplémentaires à rechercher
4. Sites spécialisés à explorer
5. Opportunités cachées (ventes aux enchères, notaires, etc.)

Réponds en JSON avec cette structure :
{
  "suggestions": [
    {
      "type": "zone_alternative" | "type_alternatif" | "mots_cles" | "site_specialise" | "opportunite",
      "title": "Titre de la suggestion",
      "description": "Description détaillée",
      "action": "Action à effectuer",
      "priority": "high" | "medium" | "low"
    }
  ],
  "analysis": "Analyse générale de la recherche"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en immobilier français. Tu analyses les critères de recherche et suggères des stratégies intelligentes pour trouver des biens.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parser la réponse JSON
    let suggestions;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = { suggestions: [], analysis: aiResponse };
      }
    } catch (e) {
      suggestions = { suggestions: [], analysis: aiResponse };
    }

    // Convertir les suggestions en propriétés potentielles à rechercher
    const properties: Property[] = suggestions.suggestions
      .filter((s: any) => s.type === 'opportunite' || s.type === 'zone_alternative')
      .map((suggestion: any, index: number) => ({
        externalId: `ai-suggestion-${Date.now()}-${index}`,
        source: 'ai_search',
        title: suggestion.title,
        description: suggestion.description,
        price: criteria.minPrice + (criteria.maxPrice - criteria.minPrice) / 2, // Prix moyen estimé
        surface: criteria.minSurface || undefined,
        region: criteria.region,
        url: '#',
        features: {
          suggestionType: suggestion.type,
          priority: suggestion.priority,
          action: suggestion.action
        }
      }));

    return {
      properties,
      totalFound: properties.length,
      source: 'ai_search',
      success: true,
      error: undefined
    };

  } catch (error: any) {
    console.error('Erreur recherche IA:', error);
    return {
      properties: [],
      totalFound: 0,
      source: 'ai_search',
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyse IA d'une description de bien pour extraire les informations
 */
export async function analyzePropertyWithAI(property: Property): Promise<{
  matchScore: number;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}> {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return {
        matchScore: 0.5,
        highlights: [],
        concerns: [],
        recommendations: []
      };
    }

    const prompt = `Analyse ce bien immobilier et donne un score de correspondance (0-100), les points forts, les points d'attention et des recommandations :

Bien :
- Titre : ${property.title}
- Description : ${property.description || 'Non disponible'}
- Prix : ${property.price}€
- Surface : ${property.surface || 'N/A'} m²
- Localisation : ${property.city || ''} ${property.region || ''}

Réponds en JSON :
{
  "matchScore": 85,
  "highlights": ["Point fort 1", "Point fort 2"],
  "concerns": ["Point d'attention 1"],
  "recommendations": ["Recommandation 1"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en immobilier. Analyse les biens et donne des scores et recommandations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback
    }

    return {
      matchScore: 50,
      highlights: [],
      concerns: [],
      recommendations: []
    };

  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return {
      matchScore: 50,
      highlights: [],
      concerns: [],
      recommendations: []
    };
  }
}

/**
 * Recherche sur Interencheres (ventes aux enchères immobilières)
 */
export async function searchAuctionsInterencheres(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Interencheres - site de ventes aux enchères
    const params = new URLSearchParams({
      type: 'immobilier',
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      surfaceMin: criteria.minSurface?.toString() || '',
      departement: criteria.department || '85', // 85 = Vendée
      region: criteria.region || 'Vendée'
    });

    const searchUrl = `https://www.interencheres.com/immobilier/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'interencheres',
      success: true,
      error: 'Interencheres nécessite une intégration API ou scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'interencheres',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur Drouot (ventes aux enchères)
 */
export async function searchAuctionsDrouot(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Drouot - ventes aux enchères immobilières
    const params = new URLSearchParams({
      category: 'immobilier',
      priceMin: criteria.minPrice.toString(),
      priceMax: criteria.maxPrice.toString(),
      location: criteria.city || criteria.region || 'Vendée'
    });

    const searchUrl = `https://www.drouot.com/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'drouot',
      success: true,
      error: 'Drouot nécessite une intégration API ou scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'drouot',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur Adjudic (ventes aux enchères judiciaires)
 */
export async function searchAuctionsAdjudic(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Adjudic - ventes aux enchères judiciaires
    const params = new URLSearchParams({
      type: 'immobilier',
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      departement: criteria.department || '85'
    });

    const searchUrl = `https://www.adjudic.com/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'adjudic',
      success: true,
      error: 'Adjudic nécessite une intégration API ou scraping'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'adjudic',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur les sites de notaires
 */
export async function searchNotaires(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Sites de notaires (ex: notaires.fr, notaires.com)
    const params = new URLSearchParams({
      type: 'vente',
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      surfaceMin: criteria.minSurface?.toString() || '',
      departement: criteria.department || '85',
      region: criteria.region || 'Vendée'
    });

    const searchUrl = `https://www.notaires.fr/immobilier/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'notaires',
      success: true,
      error: 'Sites de notaires nécessitent une intégration spécifique'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'notaires',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur les sites de saisies immobilières
 */
export async function searchSaisiesImmobilieres(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Sites de saisies immobilières (ex: saisie-immobiliere.fr)
    const params = new URLSearchParams({
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      surfaceMin: criteria.minSurface?.toString() || '',
      departement: criteria.department || '85'
    });

    const searchUrl = `https://www.saisie-immobiliere.fr/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'saisies',
      success: true,
      error: 'Saisies immobilières nécessitent une intégration spécifique'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'saisies',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche sur les sites de mandats de vente
 */
export async function searchMandatsVente(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Sites de mandats de vente (ex: mandat-vente.fr)
    const params = new URLSearchParams({
      type: 'maison',
      prixMin: criteria.minPrice.toString(),
      prixMax: criteria.maxPrice.toString(),
      departement: criteria.department || '85'
    });

    const searchUrl = `https://www.mandat-vente.fr/recherche?${params.toString()}`;
    
    return {
      properties: [],
      totalFound: 0,
      source: 'mandats',
      success: true,
      error: 'Mandats de vente nécessitent une intégration spécifique'
    };
  } catch (error: any) {
    return {
      properties: [],
      totalFound: 0,
      source: 'mandats',
      success: false,
      error: error.message
    };
  }
}

/**
 * Recherche globale sur tous les sites (incluant les nouvelles sources)
 */
export async function searchAllSites(criteria: SearchCriteria, includeAI: boolean = false, existingProperties?: Property[]): Promise<SearchResult[]> {
  const searchFunctions = [
    searchLeboncoin(criteria),
    searchSeLoger(criteria),
    searchPAP(criteria),
    searchLocalVendee(criteria),
    searchAuctionsInterencheres(criteria),
    searchAuctionsDrouot(criteria),
    searchAuctionsAdjudic(criteria),
    searchNotaires(criteria),
    searchSaisiesImmobilieres(criteria),
    searchMandatsVente(criteria)
  ];

  // Ajouter la recherche IA si demandée
  if (includeAI) {
    searchFunctions.push(searchByAI(criteria, existingProperties));
  }

  const results = await Promise.allSettled(searchFunctions);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const sources = [
        'leboncoin', 'seloger', 'pap', 'local_vendee',
        'interencheres', 'drouot', 'adjudic',
        'notaires', 'saisies', 'mandats',
        ...(includeAI ? ['ai_search'] : [])
      ];
      return {
        properties: [],
        totalFound: 0,
        source: sources[index] || 'unknown',
        success: false,
        error: result.reason?.message || 'Erreur inconnue'
      };
    }
  });
}

/**
 * Géocodage d'une adresse pour obtenir les coordonnées GPS
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Utiliser Nominatim (OpenStreetMap) pour le géocodage gratuit
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'IAHome-RealEstate/1.0'
        }
      }
    );

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}
