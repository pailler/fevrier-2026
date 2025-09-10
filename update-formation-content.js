const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFormationContent() {
  try {
    // Contenu structuré pour une formation
    const structuredContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apprendre la base de l'Intelligence artificielle</title>
</head>
<body>
    <header>
        <h1>Apprendre la base de l'Intelligence artificielle pour tout public</h1>
        <p class="lede">Découvrez les concepts fondamentaux de l'intelligence artificielle et apprenez à utiliser les outils modernes d'IA dans votre quotidien professionnel et personnel.</p>
    </header>

    <main>
        <div class="wrap">
            <h2>Objectifs de la formation</h2>
            <p>À la fin de cette formation, vous serez capable de :</p>
            <ul>
                <li>Comprendre les concepts de base de l'intelligence artificielle</li>
                <li>Identifier les différents types d'IA et leurs applications</li>
                <li>Utiliser des outils d'IA pour améliorer votre productivité</li>
                <li>Évaluer les opportunités et les défis de l'IA</li>
                <li>Intégrer l'IA dans vos projets professionnels</li>
            </ul>

            <h2>Prérequis</h2>
            <p>Cette formation ne nécessite aucune connaissance technique préalable :</p>
            <ul>
                <li>Aucune expérience en programmation requise</li>
                <li>Connaissance de base de l'informatique</li>
                <li>Curiosité et envie d'apprendre</li>
                <li>Accès à un ordinateur avec connexion internet</li>
            </ul>

            <h2>Contenu de la formation</h2>
            
            <h3>Module 1 : Introduction à l'IA (2h)</h3>
            <ul>
                <li>Qu'est-ce que l'intelligence artificielle ?</li>
                <li>Histoire et évolution de l'IA</li>
                <li>Différence entre IA faible et IA forte</li>
                <li>Exemples concrets d'applications</li>
            </ul>

            <h3>Module 2 : Types d'IA et technologies (2h)</h3>
            <ul>
                <li>Machine Learning et Deep Learning</li>
                <li>Réseaux de neurones</li>
                <li>Traitement du langage naturel (NLP)</li>
                <li>Vision par ordinateur</li>
            </ul>

            <h3>Module 3 : Outils et applications pratiques (3h)</h3>
            <ul>
                <li>ChatGPT et assistants conversationnels</li>
                <li>Outils de génération d'images</li>
                <li>Automatisation de tâches</li>
                <li>Analyse de données avec l'IA</li>
            </ul>

            <h3>Module 4 : Éthique et enjeux (1h)</h3>
            <ul>
                <li>Biais algorithmiques</li>
                <li>Protection des données</li>
                <li>Impact sur l'emploi</li>
                <li>Réglementation et conformité</li>
            </ul>

            <h2>Exercices pratiques</h2>
            <p>Chaque module comprend des exercices pratiques :</p>
            <ul>
                <li><strong>Exercice 1 :</strong> Créer votre premier prompt ChatGPT efficace</li>
                <li><strong>Exercice 2 :</strong> Générer des images avec DALL-E ou Midjourney</li>
                <li><strong>Exercice 3 :</strong> Automatiser une tâche répétitive</li>
                <li><strong>Exercice 4 :</strong> Analyser des données avec des outils d'IA</li>
                <li><strong>Projet final :</strong> Créer un assistant IA personnalisé</li>
            </ul>

            <h2>Ressources et références</h2>
            <ul>
                <li>Documentation officielle des outils présentés</li>
                <li>Articles et études de cas récents</li>
                <li>Communautés en ligne pour l'apprentissage continu</li>
                <li>Outils gratuits et payants recommandés</li>
                <li>Certifications et formations avancées</li>
            </ul>

            <div class="callout">
                <p><strong>💡 Conseil :</strong> Cette formation est conçue pour être progressive. Prenez le temps de pratiquer entre chaque module pour maximiser votre apprentissage.</p>
            </div>

            <div class="note">
                <p><strong>📚 Support :</strong> Un support de cours complet sera fourni, incluant des fiches de révision, des templates et des liens vers des ressources supplémentaires.</p>
            </div>
        </div>
    </main>
</body>
</html>`;

    // Mettre à jour la première formation
    const { data, error } = await supabase
      .from('formation_articles')
      .update({ 
        content: structuredContent,
        difficulty: 'Débutant',
        duration: '8 heures',
        price: 0
      })
      .eq('title', 'Apprendre la base de l\'Intelligence artificielle pour tout public')
      .select();

    if (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return;
    }

    console.log('Formation mise à jour avec succès:', data[0]?.title);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

updateFormationContent();
