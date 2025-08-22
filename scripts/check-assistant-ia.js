const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixAssistantIA() {
  try {
    console.log('🔍 Vérification de l\'article assistant-ia...');

    // Vérifier si l'article existe
    const { data: existingArticle, error: fetchError } = await supabase
      .from('formation_articles')
      .select('*')
      .eq('slug', 'assistant-ia')
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('❌ Article assistant-ia non trouvé, création en cours...');
      
      // Créer l'article manquant
      const newArticle = {
        title: 'Créer un assistant IA',
        slug: 'assistant-ia',
        content: `<h2 data-duration="70 min">Concevez votre propre assistant intelligent</h2>
<p>L'intelligence artificielle conversationnelle révolutionne la façon dont nous interagissons avec la technologie. Cette formation vous guide à travers la création de votre propre assistant IA personnalisé, capable de comprendre et de répondre à vos besoins spécifiques.</p>

<h3>Ce que vous allez découvrir :</h3>
<ul>
<li><strong>Les fondamentaux des assistants IA</strong> - Comprendre l'architecture des chatbots intelligents</li>
<li><strong>Les technologies de traitement du langage naturel</strong> - NLP, compréhension contextuelle, génération de réponses</li>
<li><strong>Les plateformes de développement d'assistants</strong> - Dialogflow, Rasa, Botpress et plus</li>
<li><strong>L'intégration avec vos applications existantes</strong> - APIs, webhooks, connecteurs</li>
</ul>

<h2 data-duration="85 min">Votre IA personnelle : créez-la vous-même</h2>
<p>Transformez vos idées en réalité ! Cette section vous guide à travers le processus complet de création d'un assistant IA, de la conception initiale au déploiement en production.</p>

<h3>Étapes de développement :</h3>
<ul>
<li><strong>Définition des objectifs et cas d'usage</strong> - Clarifiez les besoins de votre assistant</li>
<li><strong>Conception de l'expérience utilisateur</strong> - Créez des conversations naturelles et engageantes</li>
<li><strong>Développement des capacités cognitives</strong> - Entraînez votre IA à comprendre et réagir</li>
<li><strong>Tests et optimisation</strong> - Améliorez les performances et la précision</li>
</ul>

<h2 data-duration="75 min">Assistants IA sur mesure : de l'idée à l'usage</h2>
<p>Découvrez comment créer des assistants IA spécialisés qui répondent exactement à vos besoins. Cette section vous montre comment personnaliser et optimiser votre assistant pour des domaines spécifiques.</p>

<h3>Applications spécialisées :</h3>
<ul>
<li><strong>Assistant de productivité</strong> - Gestion de tâches, rappels, planification</li>
<li><strong>Assistant commercial</strong> - Service client, vente, support technique</li>
<li><strong>Assistant éducatif</strong> - Tutorat, évaluation, apprentissage personnalisé</li>
<li><strong>Assistant santé</strong> - Suivi médical, conseils, rappels de traitement</li>
</ul>

<h2 data-duration="80 min">L'IA à votre service : construisez votre compagnon numérique</h2>
<p>Devenez un expert en création d'assistants IA ! Cette section vous équipe des compétences avancées pour développer des assistants sophistiqués et les intégrer dans votre écosystème numérique.</p>

<h3>Compétences acquises :</h3>
<ul>
<li><strong>Maîtriser les frameworks d'assistants IA</strong> - Expertise technique approfondie</li>
<li><strong>Développer des capacités cognitives avancées</strong> - Apprentissage automatique, mémoire contextuelle</li>
<li><strong>Intégrer des services externes</strong> - APIs, bases de données, services cloud</li>
<li><strong>Déployer et maintenir votre assistant</strong> - Infrastructure, monitoring, mises à jour</li>
</ul>

<h3>Technologies et outils maîtrisés :</h3>
<ul>
<li><strong>Frameworks de développement</strong> - Dialogflow, Rasa, Botpress, Microsoft Bot Framework</li>
<li><strong>Modèles de langage</strong> - GPT, BERT, Claude, modèles personnalisés</li>
<li><strong>APIs et intégrations</strong> - REST, GraphQL, webhooks, services cloud</li>
<li><strong>Outils de déploiement</strong> - Docker, Kubernetes, services cloud</li>
</ul>

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #0ea5e9;">
  <h3 style="color: #0c4a6e; margin-top: 0;">🎯 Objectifs de la formation</h3>
  <p style="margin-bottom: 0.5rem;"><strong>Cette formation vous transforme en créateur d'assistants IA autonome, capable de développer des solutions conversationnelles personnalisées.</strong></p>
  <p style="margin-bottom: 0.5rem;">Elle vous donne les compétences pour créer des assistants intelligents qui améliorent significativement l'expérience utilisateur et l'efficacité opérationnelle.</p>
  <p style="margin-bottom: 0;"><strong>Durée totale : 5h 10min</strong> | <strong>Niveau : Intermédiaire</strong> | <strong>Prix : €89.99</strong></p>
</div>`,
        excerpt: 'Apprenez à créer votre propre assistant IA personnalisé. De la conception au déploiement, maîtrisez les technologies de l\'IA conversationnelle.',
        category: 'ia',
        author: 'Expert IA Conversationnelle',
        read_time: 25,
        difficulty: 'Intermédiaire',
        duration: '5h 10min',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1673187733777-2d8b3a3b3b3b?w=800'
      };

      const { data: createdArticle, error: createError } = await supabase
        .from('formation_articles')
        .insert(newArticle)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création:', createError);
        return;
      }

      console.log('✅ Article assistant-ia créé avec succès !');
      console.log('📝 Titre:', createdArticle.title);
      console.log('🔗 Slug:', createdArticle.slug);
      console.log('💰 Prix:', createdArticle.price);

    } else if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError);
      return;
    } else {
      console.log('✅ Article assistant-ia existe déjà');
      console.log('📝 Titre:', existingArticle.title);
      console.log('🔗 Slug:', existingArticle.slug);
      console.log('💰 Prix:', existingArticle.price);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkAndFixAssistantIA();
