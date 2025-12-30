/**
 * Script de migration des données existantes vers Supabase
 * Migre les données de src/app/administration/page.tsx vers les tables Supabase
 */

require('dotenv').config({ path: '.env.production.local' });
require('dotenv').config({ path: 'env.production.local' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

console.log('🔑 Configuration Supabase:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'NON DÉFINIE'}`);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Données existantes - TOUTES les catégories
const administrations = [
  {
    name: 'CAF (Caisse d\'Allocations Familiales)',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-blue-500 to-blue-600',
    services: [
      { name: 'Demande d\'allocations familiales', description: 'Faire une demande d\'allocations familiales, complément familial, allocation de rentrée scolaire', url: 'https://www.caf.fr', icon: '💰', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/caf-mon-compte/id514029142', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.caf.moncompte' },
      { name: 'Ma situation familiale change', description: 'Déclarer un changement de situation familiale (naissance, mariage, divorce, décès)', url: 'https://www.caf.fr/allocataires/aides-et-demarches/ma-situation/vie-personnelle/ma-situation-familiale-change', icon: '🔄', popular: true },
      { name: 'Déclaration de ressources', description: 'Déclarer vos ressources en ligne pour le calcul de vos droits', url: 'https://www.caf.fr', icon: '📊', popular: true },
      { name: 'Mode d\'emploi - Déclaration trimestrielle de ressources', description: 'Guide complet pour effectuer votre déclaration trimestrielle de ressources', url: 'https://www.caf.fr/allocataires/vies-de-famille/articles/la-declaration-trimestrielle-de-ressources-mode-d-emploi', icon: '📖' },
      { name: 'Demande d\'aide au logement', description: 'Demander l\'APL, l\'ALS ou l\'ALF pour votre logement', url: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement/les-aides-personnelles-au-logement', icon: '🏠', popular: true },
      { name: 'RSA (Revenu de Solidarité Active)', description: 'Demander le RSA et suivre votre dossier', url: 'https://www.caf.fr', icon: '💳' },
      { name: 'Prime d\'activité', description: 'Demander la prime d\'activité pour compléter vos revenus', url: 'https://www.caf.fr', icon: '💼' },
      { name: 'Liste des demandes', description: 'Consulter la liste complète des services en ligne disponibles sur le site CAF', url: 'https://www.caf.fr/sites/default/files/medias/cnaf/Aides_et_demarches/Mes-demarches/Fiches-pratiques/Services-en-ligne.pdf', icon: '📋' }
    ]
  },
  {
    name: 'Sécurité Sociale',
    icon: '🏥',
    color: 'from-green-500 to-green-600',
    services: [
      { name: 'Carte Vitale', description: 'Demander ou renouveler votre carte Vitale', url: 'https://www.ameli.fr/assure/remboursements/etre-bien-rembourse/carte-vitale/carte-vitale-application/demander-sa-carte-vitale-conditions-et-demarches', icon: '💳', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/ameli/id1025165528', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.ameli.assure.mobile' },
      { name: 'Remboursement de soins', description: 'Consulter vos remboursements et télécharger vos attestations', url: 'https://www.ameli.fr/assure/adresses-et-contacts/vos-paiements-vos-remboursements/consulter-vos-derniers-remboursements', icon: '💊', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/ameli/id1025165528', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.ameli.assure.mobile' },
      { name: 'Déclarer un changement de situation', description: 'Changement d\'adresse, de situation familiale, etc.', url: 'https://www.ameli.fr', icon: '📝' },
      { name: 'Trouver un professionnel de santé', description: 'Rechercher un médecin, dentiste, pharmacie près de chez vous', url: 'https://annuairesante.ameli.fr/', icon: '🔍' },
      { name: 'Arrêt de travail', description: 'Déclarer un arrêt de travail et suivre vos indemnités', url: 'https://www.ameli.fr/assure/adresses-et-contacts/l-envoi-d-un-document/envoyer-un-arret-de-travail', icon: '🏥' }
    ]
  },
  {
    name: 'Permis de conduire',
    icon: '🚗',
    color: 'from-orange-500 to-orange-600',
    services: [
      { name: 'Demande de permis de conduire', description: 'Inscription à l\'examen du permis de conduire', url: 'https://permisdeconduire.ants.gouv.fr/demarches-en-ligne/inscription-examen-permis', icon: '📋', popular: true },
      { name: 'Renouvellement du permis', description: 'Renouveler votre permis de conduire', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/R49276', icon: '🔄' },
      { name: 'Duplicata de permis', description: 'Demander un duplicata en cas de perte ou vol', url: 'https://www.service-public.fr/particuliers/vosdroits/F33528', icon: '📄' },
      { name: 'Échange permis étranger', description: 'Échanger un permis de conduire obtenu à l\'étranger', url: 'https://www.service-public.fr/particuliers/vosdroits/F33528', icon: '🌍' }
    ]
  },
  {
    name: 'Aides sociales',
    icon: '🤝',
    color: 'from-purple-500 to-purple-600',
    services: [
      { name: 'Aide sociale à l\'enfance', description: 'Demander une aide pour la garde d\'enfants, les frais de scolarité', url: 'https://www.service-public.fr/particuliers/vosdroits/F12028', icon: '👶' },
      { name: 'Aide au logement', description: 'Demander une aide pour payer votre loyer ou vos charges', url: 'https://www.service-public.fr/particuliers/vosdroits/F12028', icon: '🏘️' },
      { name: 'Aide alimentaire', description: 'Demander une aide alimentaire d\'urgence', url: 'https://www.service-public.fr/particuliers/vosdroits/F12028', icon: '🛒' },
      { name: 'Aide pour les personnes âgées', description: 'Demander l\'APA (Allocation Personnalisée d\'Autonomie)', url: 'https://www.service-public.fr/particuliers/vosdroits/F12028', icon: '👴' }
    ]
  },
  {
    name: 'Scolarité et Éducation',
    icon: '📚',
    color: 'from-indigo-500 to-indigo-600',
    services: [
      { name: 'Inscription scolaire', description: 'Inscrire votre enfant à l\'école, au collège ou au lycée', url: 'https://www.service-public.fr/particuliers/vosdroits/F13321', icon: '✏️', popular: true },
      { name: 'Bourses scolaires', description: 'Demander une bourse pour le collège ou le lycée', url: 'https://www.service-public.fr/particuliers/vosdroits/F13321', icon: '🎓', popular: true },
      { name: 'Cantine scolaire', description: 'Inscrire votre enfant à la cantine', url: 'https://www.service-public.fr/particuliers/vosdroits/F13321', icon: '🍽️' },
      { name: 'Transport scolaire', description: 'Demander une aide pour le transport scolaire', url: 'https://www.service-public.fr/particuliers/vosdroits/F13321', icon: '🚌' }
    ]
  },
  {
    name: 'Études supérieures',
    icon: '🎓',
    color: 'from-cyan-500 to-cyan-600',
    services: [
      { name: 'Inscription universitaire', description: 'S\'inscrire à l\'université via Parcoursup', url: 'https://www.parcoursup.fr', icon: '📖', popular: true },
      { name: 'Bourses étudiantes', description: 'Demander une bourse sur critères sociaux', url: 'https://www.messervices.etudiant.gouv.fr', icon: '💰', popular: true },
      { name: 'Logement étudiant', description: 'Demander un logement en résidence universitaire', url: 'https://www.messervices.etudiant.gouv.fr', icon: '🏠' },
      { name: 'Aide à la mobilité', description: 'Demander une aide pour étudier à l\'étranger', url: 'https://www.messervices.etudiant.gouv.fr', icon: '✈️' }
    ]
  },
  {
    name: 'Retraites',
    icon: '👴',
    color: 'from-amber-500 to-amber-600',
    services: [
      { name: 'Demande de retraite', description: 'Faire une demande de retraite auprès de votre caisse', url: 'https://www.lassuranceretraite.fr', icon: '📅', popular: true },
      { name: 'Simulateur de retraite', description: 'Estimer le montant de votre future retraite', url: 'https://www.lassuranceretraite.fr', icon: '🧮', popular: true },
      { name: 'Suivi de dossier retraite', description: 'Suivre l\'avancement de votre demande de retraite', url: 'https://www.lassuranceretraite.fr', icon: '📊' },
      { name: 'Rappel de carrière', description: 'Consulter votre carrière et vos trimestres validés', url: 'https://www.lassuranceretraite.fr', icon: '📋' }
    ]
  },
  {
    name: 'Famille',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-500 to-pink-600',
    services: [
      { name: 'Naissance', description: 'Déclarer une naissance et demander les allocations', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '👶', popular: true },
      { name: 'Mariage / PACS', description: 'Déclarer un mariage ou un PACS', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1560', icon: '💍' },
      { name: 'Décès', description: 'Déclarer un décès et effectuer les démarches', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '🕊️' },
      { name: 'Garde d\'enfants', description: 'Demander une aide pour la garde d\'enfants', url: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/soutien-aux-familles/complement-libre-choix-du-mode-de-garde-cmg', icon: '👨‍👩‍👦' }
    ]
  },
  {
    name: 'Handicap',
    icon: '♿',
    color: 'from-teal-500 to-teal-600',
    services: [
      { name: 'Demande d\'AAH', description: 'Demander l\'Allocation aux Adultes Handicapés', url: 'https://www.service-public.fr/particuliers/vosdroits/F15628', icon: '💳', popular: true },
      { name: 'Reconnaissance de handicap', description: 'Demander la Reconnaissance de la Qualité de Travailleur Handicapé (RQTH)', url: 'https://www.service-public.fr/particuliers/vosdroits/F15628', icon: '📋', popular: true },
      { name: 'Carte mobilité inclusion', description: 'Demander la Carte Mobilité Inclusion (CMI)', url: 'https://www.service-public.fr/particuliers/vosdroits/F15628', icon: '🪪' },
      { name: 'Prestation de compensation du handicap', description: 'Demander la PCH pour financer vos besoins', url: 'https://www.service-public.fr/particuliers/vosdroits/F15628', icon: '💼' }
    ]
  },
  {
    name: 'Impôts',
    icon: '📊',
    color: 'from-red-500 to-red-600',
    services: [
      { name: 'Déclaration d\'impôts', description: 'Déclarer vos revenus en ligne', url: 'https://www.impots.gouv.fr', icon: '📝', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/impots-gouv/id6443832009', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.gouv.finances.dgfip.impot' },
      { name: 'Paiement des impôts', description: 'Payer vos impôts en ligne', url: 'https://www.impots.gouv.fr', icon: '💳' },
      { name: 'Simulateur d\'impôts', description: 'Estimer le montant de vos impôts', url: 'https://www.impots.gouv.fr', icon: '🧮' },
      { name: 'Relevé de situation', description: 'Consulter votre situation fiscale', url: 'https://www.impots.gouv.fr', icon: '📄' }
    ]
  },
  {
    name: 'Papiers d\'identité',
    icon: '🪪',
    color: 'from-gray-500 to-gray-600',
    services: [
      { name: 'Acte de naissance', description: 'Demander une copie d\'acte de naissance en ligne', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N359', icon: '📜', popular: true },
      { name: 'Acte de mariage', description: 'Demander une copie d\'acte de mariage en ligne', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N359', icon: '💍' },
      { name: 'Acte de décès', description: 'Demander une copie d\'acte de décès en ligne', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N359', icon: '🕊️' },
      { name: 'Livret de famille', description: 'Demander ou mettre à jour votre livret de famille', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '📖' },
      { name: 'Changement d\'état civil', description: 'Effectuer un changement d\'état civil (nom, prénom, etc.)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '✏️' },
      { name: 'Carte d\'identité', description: 'Demander ou renouveler votre carte d\'identité', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N358', icon: '🆔', popular: true },
      { name: 'Passeport', description: 'Demander ou renouveler votre passeport', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N360', icon: '📘', popular: true },
      { name: 'Changement de nom ou prénom', description: 'Demander un changement de nom ou de prénom', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '✍️' },
      { name: 'Certificat et légalisation de documents', description: 'Obtenir un certificat ou faire légaliser un document', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '📋' },
      { name: 'Inscription sur les listes électorales', description: 'S\'inscrire sur les listes électorales en ligne', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N47', icon: '🗳️', popular: true },
      { name: 'Recensement citoyen et JDC', description: 'Effectuer votre recensement citoyen et JDC', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3199', icon: '🎖️' },
      { name: 'Anciens combattants', description: 'Informations et démarches pour les anciens combattants', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '🎖️' },
      { name: 'Médailles et décorations officielles', description: 'Demander une médaille ou une décoration officielle', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '🏅' },
      { name: 'Volontariats', description: 'S\'engager dans un volontariat (service civique, etc.)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '🤝' },
      { name: 'Recours administratif et défenseur des droits', description: 'Faire un recours administratif ou saisir le défenseur des droits', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '⚖️' },
      { name: 'Agir en justice contre l\'administration', description: 'Informations pour agir en justice contre l\'administration', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '⚖️' },
      { name: 'Extrait de casier judiciaire', description: 'Demander un extrait de casier judiciaire en ligne', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N103', icon: '📄', popular: true },
      { name: 'Protection des données personnelles', description: 'Informations sur la protection de vos données personnelles', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/N19810', icon: '🔒' }
    ]
  },
  {
    name: 'Emploi et Chômage',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    services: [
      { name: 'Inscription à Pôle Emploi', description: 'S\'inscrire comme demandeur d\'emploi', url: 'https://www.pole-emploi.fr', icon: '📋', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/pole-emploi/id1090253187', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.poleemploi.direct' },
      { name: 'Demande d\'allocation chômage', description: 'Demander l\'allocation chômage (ARE)', url: 'https://www.pole-emploi.fr', icon: '💳', popular: true, appStoreUrl: 'https://apps.apple.com/fr/app/pole-emploi/id1090253187', playStoreUrl: 'https://play.google.com/store/apps/details?id=fr.poleemploi.direct' },
      { name: 'Formation professionnelle', description: 'Trouver une formation et demander un financement', url: 'https://www.pole-emploi.fr', icon: '🎓' },
      { name: 'Aide à la création d\'entreprise', description: 'Bénéficier d\'aides pour créer votre entreprise', url: 'https://www.pole-emploi.fr', icon: '🚀' }
    ]
  },
  {
    name: 'Événements de vie',
    icon: '📅',
    color: 'from-purple-500 to-purple-600',
    services: [
      { name: 'Je déménage en France', description: 'Toutes les démarches à effectuer lors d\'un déménagement', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12242', icon: '📦', popular: true },
      { name: 'Je pars de chez mes parents', description: 'Démarches pour quitter le domicile familial', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12243', icon: '🏠' },
      { name: 'J\'attends un enfant', description: 'Démarches administratives pendant la grossesse', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12244', icon: '👶', popular: true },
      { name: 'Un proche est décédé', description: 'Démarches à effectuer après un décès', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12245', icon: '🕊️' },
      { name: 'Je suis en situation de handicap', description: 'Droits et démarches pour les personnes en situation de handicap', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12246', icon: '♿' },
      { name: 'Mon enfant est en situation de handicap', description: 'Démarches et aides pour les enfants en situation de handicap', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12247', icon: '👨‍👩‍👦' },
      { name: 'Je souhaite devenir alternant', description: 'Démarches pour devenir alternant (apprentissage, professionnalisation)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12248', icon: '🎓' },
      { name: 'Je souhaite travailler dans l\'administration', description: 'Concours et recrutement dans la fonction publique', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12249', icon: '🏛️' },
      { name: 'Je prépare ma retraite', description: 'Démarches et informations pour préparer votre retraite', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12250', icon: '👴', popular: true },
      { name: 'J\'achète un logement', description: 'Démarches pour l\'achat d\'un bien immobilier', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12251', icon: '🏡', popular: true },
      { name: 'Je veux obtenir un crédit immobilier', description: 'Informations et démarches pour obtenir un crédit immobilier', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12252', icon: '💳' },
      { name: 'Je me sépare', description: 'Démarches lors d\'une séparation ou d\'un divorce', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12253', icon: '💔' },
      { name: 'J\'ai besoin de faire garder mes enfants', description: 'Aides et démarches pour la garde d\'enfants', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12254', icon: '👨‍👩‍👧‍👦' },
      { name: 'Je pars vivre à l\'étranger', description: 'Démarches pour partir vivre à l\'étranger', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12255', icon: '✈️' },
      { name: 'Je vis à l\'étranger', description: 'Droits et démarches pour les Français vivant à l\'étranger', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12256', icon: '🌍' },
      { name: 'Je rentre en France après avoir vécu à l\'étranger', description: 'Démarches pour revenir vivre en France', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12257', icon: '🇫🇷' },
      { name: 'Je recherche un emploi', description: 'Aides et démarches pour la recherche d\'emploi', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12258', icon: '💼', popular: true },
      { name: 'J\'organise ma succession', description: 'Démarches et informations pour organiser sa succession', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12259', icon: '📜' },
      { name: 'Je suis une victime ou un proche de victime d\'acte terroriste', description: 'Aides et démarches pour les victimes d\'actes terroristes', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12260', icon: '🆘' },
      { name: 'Je crée une association', description: 'Démarches pour créer une association', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12261', icon: '🤝' },
      { name: 'Mon association organise un événement', description: 'Démarches pour organiser un événement associatif', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12262', icon: '🎉' }
    ]
  }
];

async function migrateData() {
  console.log('🔄 Début de la migration des données...');
  console.log(`📊 Nombre de catégories à migrer: ${administrations.length}\n`);

  let totalCategories = 0;
  let totalServices = 0;
  let errors = 0;

  try {
    for (let catIndex = 0; catIndex < administrations.length; catIndex++) {
      const admin = administrations[catIndex];
      console.log(`\n📁 [${catIndex + 1}/${administrations.length}] Migration de la catégorie: ${admin.name}`);

      // Vérifier si la catégorie existe déjà
      const { data: existingCategory, error: checkError } = await supabase
        .from('administration_categories')
        .select('id')
        .eq('name', admin.name)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`  ❌ Erreur lors de la vérification:`, checkError);
        errors++;
        continue;
      }

      let categoryId;

      if (existingCategory) {
        console.log(`  ✅ Catégorie "${admin.name}" existe déjà (ID: ${existingCategory.id})`);
        categoryId = existingCategory.id;
      } else {
        // Créer la catégorie
        const { data: newCategory, error: categoryError } = await supabase
          .from('administration_categories')
          .insert([{
            name: admin.name,
            icon: admin.icon,
            color: admin.color,
            display_order: catIndex,
            is_active: true
          }])
          .select()
          .single();

        if (categoryError) {
          console.error(`  ❌ Erreur lors de la création de la catégorie:`, categoryError);
          errors++;
          continue;
        }

        categoryId = newCategory.id;
        totalCategories++;
        console.log(`  ✅ Catégorie "${admin.name}" créée (ID: ${categoryId})`);
      }

      // Migrer les services
      console.log(`  🔗 Migration de ${admin.services.length} service(s)...`);
      for (let i = 0; i < admin.services.length; i++) {
        const service = admin.services[i];
        
        // Vérifier si le service existe déjà
        const { data: existingService } = await supabase
          .from('administration_services')
          .select('id')
          .eq('category_id', categoryId)
          .eq('name', service.name)
          .maybeSingle();

        if (existingService) {
          console.log(`    ⏭️  Service "${service.name}" existe déjà`);
          continue;
        }

        // Créer le service
        const { error: serviceError } = await supabase
          .from('administration_services')
          .insert([{
            category_id: categoryId,
            name: service.name,
            description: service.description || null,
            url: service.url,
            icon: service.icon || '🔗',
            is_popular: service.popular || false,
            app_store_url: service.appStoreUrl || null,
            play_store_url: service.playStoreUrl || null,
            display_order: i,
            is_active: true
          }]);

        if (serviceError) {
          console.error(`    ❌ Erreur lors de la création du service "${service.name}":`, serviceError.message);
          errors++;
        } else {
          totalServices++;
          console.log(`    ✅ Service "${service.name}" créé`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration terminée!');
    console.log(`📊 Résumé:`);
    console.log(`   - Catégories créées: ${totalCategories}`);
    console.log(`   - Services créés: ${totalServices}`);
    console.log(`   - Erreurs: ${errors}`);
    console.log('='.repeat(60));
    
    if (errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erreur fatale lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateData();
