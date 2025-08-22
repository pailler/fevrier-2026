const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Données de formation de test
const formationData = [
  {
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
  },
  {
    title: 'Apprendre la base de l\'Intelligence artificielle pour tout public',
    slug: 'introduction-ia',
    content: `<h2 data-duration="45 min">L'IA pour tous : comprendre et s'initier facilement</h2>
<p>L'intelligence artificielle n'est plus réservée aux experts en informatique. Cette formation vous propose une approche accessible et progressive pour comprendre les fondamentaux de l'IA, quel que soit votre niveau de départ.</p>

<h3>Ce que vous allez découvrir :</h3>
<ul>
<li><strong>Les concepts de base de l'intelligence artificielle</strong> - Définition, historique et principes fondamentaux</li>
<li><strong>Comment l'IA impacte notre quotidien</strong> - Applications concrètes dans la vie de tous les jours</li>
<li><strong>Les différentes applications de l'IA dans le monde moderne</strong> - Secteurs d'activité et innovations</li>
<li><strong>Les bases pour commencer à utiliser des outils IA</strong> - Premiers pas pratiques</li>
</ul>

<h2 data-duration="60 min">Décodez l'IA : première étape vers le futur</h2>
<p>L'intelligence artificielle façonne déjà notre avenir. Cette section vous guide à travers les technologies qui révolutionnent notre monde et vous prépare aux changements à venir.</p>

<h3>Technologies abordées :</h3>
<ul>
<li><strong>Machine Learning et ses applications pratiques</strong> - Algorithmes d'apprentissage automatique</li>
<li><strong>Deep Learning et réseaux de neurones</strong> - Intelligence artificielle profonde</li>
<li><strong>Computer Vision et reconnaissance d'images</strong> - IA qui "voit" et comprend</li>
<li><strong>Natural Language Processing et traitement du langage</strong> - IA qui comprend le langage humain</li>
</ul>

<h2 data-duration="40 min">L'IA démystifiée : osez la découvrir</h2>
<p>Brisez les mythes et les idées reçues sur l'intelligence artificielle. Cette formation vous donne les clés pour comprendre réellement ce qu'est l'IA et ce qu'elle n'est pas.</p>

<h3>Mythes déconstruits :</h3>
<ul>
<li><strong>L'IA va-t-elle vraiment remplacer tous les emplois ?</strong> - Réalité vs fiction</li>
<li><strong>Les robots vont-ils prendre le contrôle ?</strong> - Sécurité et contrôle humain</li>
<li><strong>L'IA est-elle vraiment "intelligente" ?</strong> - Comprendre les limites actuelles</li>
<li><strong>Comment l'IA peut-elle nous aider au quotidien ?</strong> - Opportunités et bénéfices</li>
</ul>

<h2 data-duration="35 min">Initiation à l'IA : votre passeport pour le monde numérique</h2>
<p>Préparez-vous à naviguer dans le monde numérique de demain. Cette formation vous équipe des connaissances essentielles pour comprendre et utiliser l'IA dans votre vie personnelle et professionnelle.</p>

<h3>Compétences acquises :</h3>
<ul>
<li><strong>Comprendre les enjeux éthiques de l'IA</strong> - Responsabilité et éthique</li>
<li><strong>Identifier les opportunités d'utilisation de l'IA</strong> - Applications dans votre domaine</li>
<li><strong>Utiliser des outils IA simples et accessibles</strong> - Mise en pratique immédiate</li>
<li><strong>Développer un esprit critique face aux technologies IA</strong> - Évaluation et discernement</li>
</ul>

<h3>Projets pratiques inclus :</h3>
<ul>
<li><strong>Création d'un chatbot simple</strong> - Première expérience avec l'IA conversationnelle</li>
<li><strong>Utilisation d'outils de reconnaissance d'images</strong> - IA visuelle en action</li>
<li><strong>Analyse de données avec des outils IA</strong> - Découverte de patterns cachés</li>
<li><strong>Découverte des assistants IA personnels</strong> - Optimisation de votre productivité</li>
</ul>

<div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #8b5cf6;">
  <h3 style="color: #1f2937; margin-top: 0;">🎯 Objectifs de la formation</h3>
  <p style="margin-bottom: 0.5rem;"><strong>Cette formation est conçue pour être accessible à tous, sans prérequis techniques.</strong></p>
  <p style="margin-bottom: 0.5rem;">Elle vous donnera les bases solides pour comprendre et utiliser l'intelligence artificielle dans votre quotidien.</p>
  <p style="margin-bottom: 0;"><strong>Durée totale : 3 heures</strong> | <strong>Niveau : Débutant</strong> | <strong>Prix : Gratuit</strong></p>
</div>`,
    excerpt: 'Découvrez les fondamentaux de l\'intelligence artificielle de manière accessible et progressive. Une formation pour tous, sans prérequis techniques.',
    category: 'ia',
    author: 'Expert IA',
    read_time: 15,
    difficulty: 'Débutant',
    duration: '3h',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
  },
  {
    title: 'Apprendre l\'IA à un public jeune',
    slug: 'machine-learning-python',
    content: '<h2 data-duration="50 min">L\'IA pour les jeunes créateurs : explorer, imaginer, inventer</h2><p>L\'intelligence artificielle n\'est plus réservée aux adultes ! Cette formation spécialement conçue pour les jeunes esprits créatifs vous invite à explorer le monde fascinant de l\'IA de manière ludique et interactive.</p><h3>Ce que vous allez découvrir :</h3><ul><li><strong>Les bases de l\'intelligence artificielle</strong> - Comprendre ce qu\'est l\'IA de manière simple et amusante</li><li><strong>Comment l\'IA peut stimuler votre créativité</strong> - Outils et techniques pour booster votre imagination</li><li><strong>Les applications de l\'IA dans la création</strong> - Art, musique, jeux vidéo et plus encore</li><li><strong>Vos premiers pas avec Python</strong> - Programmer sans se prendre au sérieux</li></ul><h2 data-duration="70 min">IA Junior : découvre, teste, invente !</h2><p>Plongez dans l\'univers du Machine Learning avec des projets concrets et amusants. Cette section vous guide à travers vos premières expériences avec l\'IA, étape par étape.</p><h3>Projets pratiques inclus :</h3><ul><li><strong>Création d\'un chatbot personnalisé</strong> - Votre premier assistant IA conversationnel</li><li><strong>Reconnaissance d\'images amusante</strong> - Faire "voir" à l\'IA vos dessins et photos</li><li><strong>Générateur de textes créatifs</strong> - L\'IA qui vous aide à écrire des histoires</li><li><strong>Jeu de prédiction simple</strong> - L\'IA qui devine vos préférences</li></ul><h2 data-duration="45 min">Ludique et futuriste : l\'IA expliquée aux jeunes</h2><p>Brisez les idées reçues sur l\'intelligence artificielle ! Cette section démystifie l\'IA et vous montre comment elle peut être un outil amusant et accessible pour tous les âges.</p><h3>Mythes déconstruits :</h3><ul><li><strong>L\'IA est-elle vraiment "intelligente" ?</strong> - Comprendre les limites et les possibilités</li><li><strong>L\'IA va-t-elle remplacer les humains ?</strong> - L\'IA comme partenaire de création</li><li><strong>Faut-il être un génie pour utiliser l\'IA ?</strong> - L\'IA accessible à tous</li><li><strong>Comment l\'IA peut-elle m\'aider au quotidien ?</strong> - Applications pratiques et amusantes</li></ul><h2 data-duration="55 min">Apprends l\'IA en t\'amusant : de l\'idée à la création</h2><p>Transformez vos idées en réalité avec l\'IA ! Cette section vous équipe des compétences nécessaires pour créer vos propres projets IA et développer votre créativité numérique.</p><h3>Compétences acquises :</h3><ul><li><strong>Penser comme un créateur IA</strong> - Développer votre esprit d\'innovation</li><li><strong>Utiliser des outils IA simples</strong> - Plateformes et applications accessibles</li><li><strong>Prototyper vos idées</strong> - Du concept au projet concret</li><li><strong>Partager vos créations</strong> - Présenter vos projets avec fierté</li></ul><h3>Outils et ressources :</h3><ul><li><strong>Python pour débutants</strong> - Apprendre à programmer en s\'amusant</li><li><strong>Bibliothèques IA accessibles</strong> - Outils simples et puissants</li><li><strong>Communautés de jeunes créateurs</strong> - Rencontrer d\'autres passionnés</li><li><strong>Ressources d\'apprentissage</strong> - Cours, tutoriels et projets gratuits</li></ul><div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #f59e0b;"><h3 style="color: #92400e; margin-top: 0;">🎯 Objectifs de la formation</h3><p style="margin-bottom: 0.5rem;"><strong>Cette formation est conçue spécialement pour les jeunes créateurs, sans prérequis techniques.</strong></p><p style="margin-bottom: 0.5rem;">Elle vous donnera les bases pour comprendre et utiliser l\'IA de manière créative et amusante.</p><p style="margin-bottom: 0;"><strong>Durée totale : 3h 40min</strong> | <strong>Niveau : Débutant</strong> | <strong>Prix : €49.99</strong></p></div>',
    excerpt: 'Découvrez l\'intelligence artificielle de manière ludique et créative. Une formation spécialement conçue pour les jeunes esprits curieux et inventifs.',
    category: 'ia',
    author: 'Data Scientist',
    read_time: 25,
    difficulty: 'Intermédiaire',
    duration: '6h',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800'
  },
  {
    title: 'Apprendre l\'IA générative',
    slug: 'react-web-development',
    content: '<h2 data-duration="65 min">Créez l\'inattendu avec l\'IA générative</h2><p>L\'IA générative révolutionne la création artistique et numérique. Cette formation vous invite à explorer les outils les plus avancés pour créer des contenus uniques et surprenants, de l\'art numérique aux applications pratiques.</p><h3>Ce que vous allez découvrir :</h3><ul><li><strong>Les fondamentaux de l\'IA générative</strong> - Comprendre les modèles de génération de contenu</li><li><strong>Les outils de création d\'images IA</strong> - Midjourney, DALL-E, Stable Diffusion et plus</li><li><strong>La génération de texte créatif</strong> - ChatGPT, Claude et autres modèles de langage</li><li><strong>Les applications pratiques de l\'IA générative</strong> - Marketing, design, développement</li></ul><h2 data-duration="80 min">IA générative : imaginez, créez, surprenez</h2><p>Plongez dans l\'univers fascinant de la création assistée par IA. Cette section vous guide à travers des projets concrets pour maîtriser les techniques de génération de contenu et développer votre créativité numérique.</p><h3>Projets pratiques inclus :</h3><ul><li><strong>Création d\'illustrations personnalisées</strong> - Générez des images uniques pour vos projets</li><li><strong>Développement de prompts efficaces</strong> - Maîtrisez l\'art de la communication avec l\'IA</li><li><strong>Génération de contenu marketing</strong> - Créez des textes et visuels percutants</li><li><strong>Intégration IA dans vos applications</strong> - Connectez l\'IA générative à vos projets web</li></ul><h2 data-duration="55 min">Libérez votre imagination avec l\'IA générative</h2><p>Brisez les limites de la création traditionnelle ! Cette section vous montre comment l\'IA générative peut amplifier votre créativité et vous permettre de réaliser des projets qui semblaient impossibles.</p><h3>Techniques avancées :</h3><ul><li><strong>Style transfer et personnalisation</strong> - Adaptez les modèles à votre style unique</li><li><strong>Génération conditionnelle</strong> - Contrôlez précisément vos créations</li><li><strong>Workflows créatifs optimisés</strong> - Maximisez l\'efficacité de votre processus</li><li><strong>Collaboration homme-machine</strong> - L\'IA comme partenaire créatif</li></ul><h2 data-duration="70 min">De l\'idée à l\'image : maîtrisez l\'IA générative</h2><p>Transformez vos concepts en réalité visuelle ! Cette section vous équipe des compétences nécessaires pour maîtriser complètement le processus de création avec l\'IA générative, de la conception à la finalisation.</p><h3>Compétences acquises :</h3><ul><li><strong>Maîtriser les outils de génération d\'images</strong> - Expertise technique approfondie</li><li><strong>Développer votre sens artistique numérique</strong> - Créativité augmentée par l\'IA</li><li><strong>Optimiser vos workflows de création</strong> - Efficacité et qualité maximisées</li><li><strong>Intégrer l\'IA dans vos projets professionnels</strong> - Applications concrètes</li></ul><h3>Outils et plateformes :</h3><ul><li><strong>Midjourney et Discord</strong> - Création d\'images artistiques de haute qualité</li><li><strong>DALL-E et ChatGPT</strong> - Suite complète de génération créative</li><li><strong>Stable Diffusion et interfaces</strong> - Contrôle total sur vos créations</li><li><strong>APIs et intégrations</strong> - Connectez l\'IA à vos applications</li></ul><div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #3b82f6;"><h3 style="color: #1e40af; margin-top: 0;">🎯 Objectifs de la formation</h3><p style="margin-bottom: 0.5rem;"><strong>Cette formation vous transforme en expert de l\'IA générative, capable de créer des contenus uniques et innovants.</strong></p><p style="margin-bottom: 0.5rem;">Elle vous donne les compétences pour maîtriser les outils les plus avancés et développer votre créativité numérique.</p><p style="margin-bottom: 0;"><strong>Durée totale : 4h 30min</strong> | <strong>Niveau : Intermédiaire</strong> | <strong>Prix : €79.99</strong></p></div>',
    excerpt: 'Maîtrisez les outils de création assistée par IA et libérez votre créativité numérique. De l\'art génératif aux applications pratiques.',
    category: 'web',
    author: 'Développeur Full-Stack',
    read_time: 20,
    difficulty: 'Débutant',
    duration: '8h',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
  },
  {
    title: 'Apprendre l\'IA créative',
    slug: 'data-science-avancee',
    content: '<h2 data-duration="60 min">L\'IA au service de votre créativité</h2><p>L\'intelligence artificielle n\'est plus seulement un outil technique, elle devient votre partenaire créatif. Cette formation vous révèle comment l\'IA peut amplifier votre imagination et transformer votre processus créatif, quel que soit votre domaine d\'expression.</p><h3>Ce que vous allez découvrir :</h3><ul><li><strong>Les fondements de l\'IA créative</strong> - Comprendre comment l\'IA peut stimuler votre imagination</li><li><strong>Les outils de création assistée par IA</strong> - Plateformes et applications pour tous les arts</li><li><strong>Les nouvelles formes d\'expression artistique</strong> - Art numérique, musique générative, écriture créative</li><li><strong>L\'IA comme muse et collaborateur</strong> - Développer une relation créative avec l\'IA</li></ul><h2 data-duration="90 min">Boostez vos projets artistiques avec l\'IA</h2><p>Transformez votre approche créative avec des outils IA spécialement conçus pour les artistes. Cette section vous guide à travers des projets concrets pour intégrer l\'IA dans votre workflow créatif et produire des œuvres uniques.</p><h3>Projets pratiques inclus :</h3><ul><li><strong>Création d\'œuvres d\'art collaboratives</strong> - L\'IA et vous, main dans la main</li><li><strong>Génération de concepts créatifs</strong> - L\'IA comme source d\'inspiration</li><li><strong>Optimisation de votre processus créatif</strong> - Workflows augmentés par l\'IA</li><li><strong>Développement de votre signature artistique</strong> - Style unique avec l\'aide de l\'IA</li></ul><h2 data-duration="75 min">Créer sans limite : l\'IA créative à portée de main</h2><p>Brisez les barrières traditionnelles de la création ! Cette section vous montre comment l\'IA peut vous permettre de réaliser des projets qui semblaient impossibles et d\'explorer de nouveaux territoires créatifs.</p><h3>Techniques avancées :</h3><ul><li><strong>Fusion homme-machine dans l\'art</strong> - Collaboration créative optimale</li><li><strong>Génération de contenu personnalisé</strong> - L\'IA qui comprend votre style</li><li><strong>Exploration de nouveaux médiums</strong> - Réalité virtuelle, art interactif</li><li><strong>Optimisation créative continue</strong> - Amélioration constante de vos œuvres</li></ul><h2 data-duration="85 min">L\'IA et vous : inventez, innovez, exprimez</h2><p>Devenez un pionnier de l\'art augmenté ! Cette section vous équipe des compétences nécessaires pour maîtriser l\'IA créative et développer votre propre approche innovante de la création artistique.</p><h3>Compétences acquises :</h3><ul><li><strong>Maîtriser les outils d\'IA créative</strong> - Expertise technique et artistique</li><li><strong>Développer votre vision créative augmentée</strong> - Imagination amplifiée par l\'IA</li><li><strong>Créer des œuvres uniques et innovantes</strong> - Signature artistique distinctive</li><li><strong>Partager et monétiser votre art IA</strong> - Valorisation de vos créations</li></ul><h3>Outils et plateformes créatives :</h3><ul><li><strong>Midjourney et DALL-E</strong> - Création d\'images artistiques révolutionnaires</li><li><strong>ChatGPT et Claude</strong> - Assistance à l\'écriture créative</li><li><strong>Stable Diffusion et interfaces avancées</strong> - Contrôle total sur vos créations</li><li><strong>Outils de musique et vidéo IA</strong> - Création multimédia augmentée</li></ul><div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #ec4899;"><h3 style="color: #be185d; margin-top: 0;">🎯 Objectifs de la formation</h3><p style="margin-bottom: 0.5rem;"><strong>Cette formation vous transforme en artiste augmenté, capable de créer des œuvres uniques avec l\'IA comme partenaire créatif.</strong></p><p style="margin-bottom: 0.5rem;">Elle vous donne les compétences pour maîtriser les outils d\'IA créative et développer votre propre approche innovante.</p><p style="margin-bottom: 0;"><strong>Durée totale : 5h 10min</strong> | <strong>Niveau : Avancé</strong> | <strong>Prix : €99.99</strong></p></div>',
    excerpt: 'Transformez votre créativité avec l\'IA comme partenaire artistique. Devenez un pionnier de l\'art augmenté et créez des œuvres uniques.',
    category: 'data',
    author: 'Data Scientist Senior',
    read_time: 30,
    difficulty: 'Avancé',
    duration: '12h',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
  },
  {
         title: 'Créer ses propres outils numériques avec Cursor',
     slug: 'react-native-mobile',
     content: '<h2 data-duration="75 min">Devenez créateur d\'outils numériques avec Cursor</h2><p>Cursor révolutionne la création d\'applications en combinant la puissance de l\'IA avec un environnement de développement intuitif. Cette formation vous transforme en créateur d\'outils numériques, capable de concevoir et développer vos propres solutions personnalisées.</p><h3>Ce que vous allez découvrir :</h3><ul><li><strong>Les fondamentaux de Cursor et de l\'IA assistée</strong> - Comprendre l\'environnement de développement augmenté</li><li><strong>Comment l\'IA peut accélérer votre développement</strong> - Génération de code, suggestions intelligentes, débogage assisté</li><li><strong>Les différentes approches de création d\'outils</strong> - Applications web, scripts automatisés, interfaces utilisateur</li><li><strong>Les bonnes pratiques pour créer des outils efficaces</strong> - Architecture, performance, maintenabilité</li></ul><h2 data-duration="90 min">Cursor en pratique : vos outils IA sur mesure</h2><p>Plongez dans l\'univers pratique de Cursor ! Cette section vous guide à travers des projets concrets pour créer des outils numériques personnalisés qui répondent exactement à vos besoins et à ceux de votre organisation.</p><h3>Projets pratiques inclus :</h3><ul><li><strong>Création d\'un assistant de productivité personnalisé</strong> - Automatisez vos tâches quotidiennes</li><li><strong>Développement d\'un dashboard de données interactif</strong> - Visualisez et analysez vos informations</li><li><strong>Conception d\'un générateur de contenu intelligent</strong> - Créez du contenu adapté à vos besoins</li><li><strong>Construction d\'un système de gestion de projet</strong> - Organisez vos workflows efficacement</li></ul><h2 data-duration="80 min">Créez vos solutions digitales grâce à l\'IA</h2><p>Transformez vos idées en réalité numérique ! Cette section vous montre comment utiliser Cursor et l\'IA pour créer des solutions digitales innovantes qui résolvent des problèmes concrets et améliorent votre productivité.</p><h3>Techniques avancées :</h3><ul><li><strong>Architecture d\'applications avec Cursor</strong> - Concevez des solutions robustes et évolutives</li><li><strong>Intégration d\'APIs et de services externes</strong> - Connectez vos outils au monde numérique</li><li><strong>Optimisation et performance</strong> - Créez des applications rapides et efficaces</li><li><strong>Tests et déploiement automatisés</strong> - Assurez la qualité de vos créations</li></ul><h2 data-duration="85 min">L\'IA entre vos mains : construisez vos propres applications</h2><p>Devenez un architecte numérique ! Cette section vous équipe des compétences nécessaires pour maîtriser Cursor et créer des applications professionnelles qui rivalisent avec les solutions commerciales.</p><h3>Compétences acquises :</h3><ul><li><strong>Maîtriser l\'environnement Cursor</strong> - Expertise complète de l\'IDE augmenté par l\'IA</li><li><strong>Développer des applications full-stack</strong> - Frontend, backend, base de données</li><li><strong>Intégrer l\'IA dans vos créations</strong> - Chatbots, analyse prédictive, automatisation</li><li><strong>Monétiser vos outils numériques</strong> - Transformez vos créations en opportunités business</li></ul><h3>Technologies et frameworks maîtrisés :</h3><ul><li><strong>Cursor et ses fonctionnalités avancées</strong> - IDE augmenté par l\'IA</li><li><strong>Frameworks web modernes</strong> - React, Vue.js, Next.js, Nuxt.js</li><li><strong>Backend et bases de données</strong> - Node.js, Python, PostgreSQL, MongoDB</li><li><strong>APIs et intégrations</strong> - REST, GraphQL, services cloud</li></ul><div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #f59e0b;"><h3 style="color: #92400e; margin-top: 0;">🎯 Objectifs de la formation</h3><p style="margin-bottom: 0.5rem;"><strong>Cette formation vous transforme en créateur d\'outils numériques autonome, capable de développer des solutions personnalisées avec Cursor et l\'IA.</strong></p><p style="margin-bottom: 0.5rem;">Elle vous donne les compétences pour créer des applications professionnelles qui répondent exactement à vos besoins et à ceux de votre organisation.</p><p style="margin-bottom: 0;"><strong>Durée totale : 5h 30min</strong> | <strong>Niveau : Intermédiaire</strong> | <strong>Prix : €94.99</strong></p></div>',
     excerpt: 'Devenez créateur d\'outils numériques avec Cursor. Apprenez à développer vos propres applications et solutions personnalisées grâce à l\'IA assistée.',
     category: 'mobile',
     author: 'Développeur Mobile',
     read_time: 18,
     difficulty: 'Intermédiaire',
     duration: '10h',
     price: 59.99,
     image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'
   },
   {
     title: 'Améliorer son quotidien avec l\'IA',
     slug: 'quotidien-ia',
     content: '<h2 data-duration="60 min">L\'IA au quotidien : gagner du temps, simplifier sa vie</h2><p>L\'intelligence artificielle n\'est plus réservée aux experts ! Cette formation vous montre comment intégrer l\'IA dans votre vie quotidienne pour gagner du temps, simplifier vos tâches et améliorer votre productivité personnelle.</p><h3>Ce que vous allez découvrir :</h3><ul><li><strong>Les outils IA accessibles à tous</strong> - Applications et services gratuits pour débuter</li><li><strong>Comment l\'IA peut vous faire gagner du temps</strong> - Automatisation des tâches répétitives</li><li><strong>L\'IA pour organiser votre vie</strong> - Gestion du temps, planning, rappels intelligents</li><li><strong>Les bonnes pratiques pour utiliser l\'IA</strong> - Conseils et astuces pour optimiser vos résultats</li></ul><h2 data-duration="75 min">Votre assistant personnel : l\'IA pour tout gérer</h2><p>Transformez votre smartphone et votre ordinateur en véritables assistants personnels ! Cette section vous guide à travers les meilleurs outils IA pour gérer vos emails, vos documents, vos rendez-vous et bien plus encore.</p><h3>Applications pratiques incluses :</h3><ul><li><strong>Gestion intelligente des emails</strong> - Tri automatique, réponses suggérées, filtres intelligents</li><li><strong>Organisation de vos documents</strong> - Classification automatique, recherche intelligente</li><li><strong>Planification et calendrier</strong> - Optimisation de votre emploi du temps</li><li><strong>Gestion des tâches et projets</strong> - Priorisation automatique et suivi intelligent</li></ul><h2 data-duration="70 min">Optimisez votre vie avec l\'IA</h2><p>Découvrez comment l\'IA peut transformer chaque aspect de votre vie quotidienne ! Cette section vous révèle des techniques avancées pour optimiser votre santé, vos finances, votre apprentissage et votre bien-être grâce à l\'intelligence artificielle.</p><h3>Domaines d\'optimisation :</h3><ul><li><strong>Santé et bien-être</strong> - Suivi nutritionnel, exercices personnalisés, sommeil optimisé</li><li><strong>Gestion financière</strong> - Budget intelligent, économies automatisées, investissements conseillés</li><li><strong>Apprentissage continu</strong> - Cours personnalisés, révision intelligente, développement de compétences</li><li><strong>Relations et communication</strong> - Amélioration de vos interactions, gestion des réseaux sociaux</li></ul><h2 data-duration="65 min">Trucs, astuces et IA : la vie facilitée</h2><p>Maîtrisez les trucs et astuces qui font la différence ! Cette section vous équipe des compétences pratiques pour tirer le meilleur parti de l\'IA dans votre vie quotidienne et résoudre des problèmes concrets.</p><h3>Compétences acquises :</h3><ul><li><strong>Personnaliser vos outils IA</strong> - Adapter les applications à vos besoins spécifiques</li><li><strong>Automatiser vos workflows</strong> - Créer des processus intelligents et efficaces</li><li><strong>Résoudre des problèmes quotidiens</strong> - Utiliser l\'IA pour des solutions pratiques</li><li><strong>Rester à jour avec les nouveautés IA</strong> - Suivre l\'évolution des technologies</li></ul><h3>Outils et applications recommandées :</h3><ul><li><strong>Assistants vocaux intelligents</strong> - Siri, Google Assistant, Alexa</li><li><strong>Applications de productivité IA</strong> - Notion AI, Grammarly, Otter.ai</li><li><strong>Outils de gestion personnelle</strong> - Todoist, Forest, Habitica</li><li><strong>Services de santé connectée</strong> - Fitbit, MyFitnessPal, Headspace</li></ul><div style="background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%); padding: 2rem; border-radius: 1rem; margin: 2rem 0; border-left: 4px solid #0288d1;"><h3 style="color: #01579b; margin-top: 0;">🎯 Objectifs de la formation</h3><p style="margin-bottom: 0.5rem;"><strong>Cette formation vous transforme en utilisateur expert de l\'IA au quotidien, capable d\'optimiser tous les aspects de votre vie personnelle.</strong></p><p style="margin-bottom: 0.5rem;">Elle vous donne les compétences pratiques pour intégrer l\'IA dans votre routine et améliorer significativement votre qualité de vie.</p><p style="margin-bottom: 0;"><strong>Durée totale : 4h 10min</strong> | <strong>Niveau : Débutant</strong> | <strong>Prix : €69.99</strong></p></div>',
     excerpt: 'Découvrez comment intégrer l\'IA dans votre vie quotidienne pour gagner du temps, simplifier vos tâches et améliorer votre productivité personnelle.',
     category: 'ia',
     author: 'Expert IA & Productivité',
     read_time: 22,
     difficulty: 'Débutant',
     duration: '4h 10min',
     price: 69.99,
     image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'
    category: 'mobile',
    author: 'Développeur Mobile',
    read_time: 18,
    difficulty: 'Intermédiaire',
    duration: '10h',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'
  }
];

async function insertFormationData() {
  console.log('🚀 Début de l\'insertion des données de formation...');
  
  try {
    // Essayer d'insérer directement
    console.log('📝 Tentative d\'insertion directe...');
    
    const { data, error } = await supabase
      .from('formation_articles')
      .insert(formationData)
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      console.log('💡 La table formation_articles n\'existe probablement pas encore.');
      console.log('💡 Vous devrez la créer manuellement dans Supabase ou via l\'interface d\'administration.');
      return;
    }
    
    console.log('✅ Données de formation insérées avec succès !');
    console.log(`📊 ${data.length} formations ajoutées :`);
    
    data.forEach((formation, index) => {
      console.log(`   ${index + 1}. ${formation.title} (${formation.category}) - ${formation.price === 0 ? 'Gratuit' : `€${formation.price}`}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
insertFormationData();
