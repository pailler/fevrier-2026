require('dotenv').config({ path: '.env.production.local' });
require('dotenv').config({ path: 'env.production.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Services à ajouter par catégorie (2 services supplémentaires pour chaque catégorie qui en a moins de 6)
const servicesToAdd = {
  'Sécurité Sociale': [
    {
      name: 'Déclaration de revenus en ligne',
      description: 'Déclarez vos revenus directement en ligne sur le site de l\'URSSAF ou de la Sécurité Sociale',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F35028',
      icon: '📊',
      is_popular: false,
      display_order: 6
    }
  ],
  'Permis de conduire': [
    {
      name: 'Simulateur de code de la route',
      description: 'Entraînez-vous au code de la route avec des tests en ligne gratuits',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F1960',
      icon: '🚗',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Suivi de dossier permis',
      description: 'Consultez l\'avancement de votre demande de permis de conduire en ligne',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F1960',
      icon: '📋',
      is_popular: false,
      display_order: 6
    }
  ],
  'Aides sociales': [
    {
      name: 'Aide au logement (APL)',
      description: 'Demandez ou renouvelez votre aide personnalisée au logement',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F12010',
      icon: '🏠',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'RSA (Revenu de Solidarité Active)',
      description: 'Informations et demande de RSA, allocation pour les personnes en difficulté',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F1504',
      icon: '💰',
      is_popular: false,
      display_order: 6
    }
  ],
  'Scolarité et Éducation': [
    {
      name: 'Inscription au lycée',
      description: 'Inscrivez votre enfant dans un lycée public ou privé',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2432',
      icon: '🎓',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Bourse de lycée',
      description: 'Demandez une bourse pour les études au lycée',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2432',
      icon: '💵',
      is_popular: false,
      display_order: 6
    }
  ],
  'Études supérieures': [
    {
      name: 'Inscription en université',
      description: 'Inscrivez-vous dans une université via Parcoursup ou directement',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2433',
      icon: '🎓',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Bourse étudiante (CROUS)',
      description: 'Demandez une bourse sur critères sociaux pour vos études supérieures',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2433',
      icon: '💵',
      is_popular: false,
      display_order: 6
    }
  ],
  'Retraites': [
    {
      name: 'Simulateur de retraite',
      description: 'Estimez le montant de votre future retraite avec le simulateur officiel',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2434',
      icon: '🧮',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Demande de retraite anticipée',
      description: 'Demandez votre départ en retraite anticipée si vous remplissez les conditions',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2434',
      icon: '📅',
      is_popular: false,
      display_order: 6
    }
  ],
  'Famille': [
    {
      name: 'Déclaration de naissance',
      description: 'Déclarez la naissance de votre enfant en ligne ou à la mairie',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2435',
      icon: '👶',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Prestation d\'accueil du jeune enfant (PAJE)',
      description: 'Demandez les allocations familiales et aides pour les jeunes enfants',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2435',
      icon: '💼',
      is_popular: false,
      display_order: 6
    }
  ],
  'Handicap': [
    {
      name: 'Allocation adulte handicapé (AAH)',
      description: 'Demandez l\'allocation pour adultes handicapés',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2436',
      icon: '♿',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Carte mobilité inclusion (CMI)',
      description: 'Demandez la carte mobilité inclusion pour faciliter vos déplacements',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2436',
      icon: '🪪',
      is_popular: false,
      display_order: 6
    }
  ],
  'Impôts': [
    {
      name: 'Déclaration de revenus en ligne',
      description: 'Déclarez vos revenus directement en ligne sur impots.gouv.fr',
      url: 'https://www.impots.gouv.fr/',
      icon: '📊',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Simulateur d\'impôt',
      description: 'Estimez le montant de votre impôt sur le revenu',
      url: 'https://www.impots.gouv.fr/',
      icon: '🧮',
      is_popular: false,
      display_order: 6
    }
  ],
  'Emploi et Chômage': [
    {
      name: 'Inscription à Pôle Emploi',
      description: 'Inscrivez-vous comme demandeur d\'emploi sur pole-emploi.fr',
      url: 'https://www.pole-emploi.fr/',
      icon: '💼',
      is_popular: false,
      display_order: 5
    },
    {
      name: 'Demande d\'allocation chômage',
      description: 'Demandez votre allocation chômage (ARE) en ligne',
      url: 'https://www.pole-emploi.fr/',
      icon: '💰',
      is_popular: false,
      display_order: 6
    }
  ]
};

async function addMissingServices() {
  try {
    console.log('🔄 Récupération des catégories...');
    
    // Récupérer toutes les catégories actives
    const { data: categories, error: categoriesError } = await supabase
      .from('administration_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoriesError) {
      throw new Error(`Erreur lors de la récupération des catégories: ${categoriesError.message}`);
    }

    console.log(`✅ ${categories.length} catégories trouvées\n`);

    // Pour chaque catégorie, vérifier le nombre de services
    for (const category of categories) {
      const { data: services, error: servicesError } = await supabase
        .from('administration_services')
        .select('id')
        .eq('category_id', category.id)
        .eq('is_active', true);

      if (servicesError) {
        console.error(`❌ Erreur pour ${category.name}:`, servicesError.message);
        continue;
      }

      const serviceCount = services?.length || 0;
      const servicesToAddForCategory = servicesToAdd[category.name] || [];

      if (serviceCount < 6 && servicesToAddForCategory.length > 0) {
        const needed = 6 - serviceCount;
        const toAdd = servicesToAddForCategory.slice(0, needed);
        
        console.log(`📝 ${category.name}: ${serviceCount} services → Ajout de ${toAdd.length} service(s)`);

        for (const serviceData of toAdd) {
          // Trouver le display_order maximum pour cette catégorie
          const { data: maxOrderData } = await supabase
            .from('administration_services')
            .select('display_order')
            .eq('category_id', category.id)
            .order('display_order', { ascending: false })
            .limit(1);

          const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order : 0;
          const newOrder = serviceData.display_order || (maxOrder + 1);

          const newService = {
            category_id: category.id,
            name: serviceData.name,
            description: serviceData.description || '',
            url: serviceData.url,
            icon: serviceData.icon || '🔗',
            is_popular: serviceData.is_popular || false,
            display_order: newOrder,
            is_active: true
          };

          const { data: createdService, error: createError } = await supabase
            .from('administration_services')
            .insert(newService)
            .select()
            .single();

          if (createError) {
            console.error(`  ❌ Erreur création "${serviceData.name}":`, createError.message);
          } else {
            console.log(`  ✅ Service créé: "${serviceData.name}"`);
          }
        }
      } else if (serviceCount >= 6) {
        console.log(`✅ ${category.name}: ${serviceCount} services (déjà >= 6)`);
      } else {
        console.log(`⚠️  ${category.name}: ${serviceCount} services (pas de services à ajouter définis)`);
      }
    }

    console.log('\n✅ Terminé !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addMissingServices();

