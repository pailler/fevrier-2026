const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer un contenu HTML structuré pour une formation
function createStructuredContent(title, originalContent, duration) {
  // Extraire la durée du data-duration si elle existe
  const durationMatch = originalContent.match(/data-duration="([^"]+)"/);
  const extractedDuration = durationMatch ? durationMatch[1] : duration || '60 min';
  
  // Nettoyer le contenu original
  const cleanContent = originalContent
    .replace(/<h2[^>]*>/g, '')
    .replace(/<\/h2>/g, '')
    .replace(/data-duration="[^"]*"/g, '')
    .trim();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <p class="lede">${cleanContent.split('</p>')[0].replace('<p>', '')}</p>
    </header>

    <main>
        <div class="wrap">
            <h2>Objectifs de la formation</h2>
            <p>À la fin de cette formation, vous serez capable de :</p>
            <ul>
                <li>Maîtriser les concepts fondamentaux de ${title.toLowerCase()}</li>
                <li>Utiliser les outils et techniques présentés</li>
                <li>Appliquer vos connaissances dans des projets concrets</li>
                <li>Développer votre expertise dans ce domaine</li>
            </ul>

            <h2>Prérequis</h2>
            <p>Cette formation est accessible à tous :</p>
            <ul>
                <li>Aucune expérience technique préalable requise</li>
                <li>Curiosité et envie d'apprendre</li>
                <li>Accès à un ordinateur avec connexion internet</li>
                <li>Motivation pour explorer de nouveaux horizons</li>
            </ul>

            <h2>Contenu de la formation</h2>
            
            <h3>Module 1 : Introduction et bases (${Math.floor(parseInt(extractedDuration) * 0.2)} min)</h3>
            <ul>
                <li>Présentation des concepts fondamentaux</li>
                <li>Historique et évolution du domaine</li>
                <li>Outils et ressources essentielles</li>
                <li>Premiers pas pratiques</li>
            </ul>

            <h3>Module 2 : Approfondissement (${Math.floor(parseInt(extractedDuration) * 0.3)} min)</h3>
            <ul>
                <li>Techniques avancées</li>
                <li>Cas d'usage concrets</li>
                <li>Bonnes pratiques</li>
                <li>Optimisation et performance</li>
            </ul>

            <h3>Module 3 : Applications pratiques (${Math.floor(parseInt(extractedDuration) * 0.3)} min)</h3>
            <ul>
                <li>Projets guidés</li>
                <li>Exercices pratiques</li>
                <li>Résolution de problèmes</li>
                <li>Intégration dans vos projets</li>
            </ul>

            <h3>Module 4 : Perfectionnement (${Math.floor(parseInt(extractedDuration) * 0.2)} min)</h3>
            <ul>
                <li>Techniques avancées</li>
                <li>Automatisation</li>
                <li>Évolutions futures</li>
                <li>Ressources pour continuer</li>
            </ul>

            <h2>Exercices pratiques</h2>
            <p>Chaque module comprend des exercices pratiques :</p>
            <ul>
                <li><strong>Exercice 1 :</strong> Mise en pratique des concepts de base</li>
                <li><strong>Exercice 2 :</strong> Application des techniques apprises</li>
                <li><strong>Exercice 3 :</strong> Projet personnel guidé</li>
                <li><strong>Exercice 4 :</strong> Optimisation et amélioration</li>
                <li><strong>Projet final :</strong> Création d'un projet complet</li>
            </ul>

            <h2>Ressources et références</h2>
            <ul>
                <li>Documentation officielle des outils présentés</li>
                <li>Articles et tutoriels complémentaires</li>
                <li>Communautés en ligne pour l'apprentissage continu</li>
                <li>Outils gratuits et payants recommandés</li>
                <li>Formations avancées pour approfondir</li>
            </ul>

            <div class="callout">
                <p><strong>💡 Conseil :</strong> Cette formation est conçue pour être progressive. Prenez le temps de pratiquer entre chaque module pour maximiser votre apprentissage.</p>
            </div>

            <div class="note">
                <p><strong>📚 Support :</strong> Un support de cours complet sera fourni, incluant des fiches de révision, des templates et des liens vers des ressources supplémentaires.</p>
            </div>

            <h2>Conclusion</h2>
            <p>Cette formation vous donne toutes les clés pour maîtriser ${title.toLowerCase()} et l'intégrer efficacement dans vos projets. L'apprentissage se fait par la pratique, alors n'hésitez pas à expérimenter et à poser des questions.</p>
        </div>
    </main>
</body>
</html>`;
}

async function reformatAllFormations() {
  try {
    // Récupérer toutes les formations
    const { data: formations, error } = await supabase
      .from('formation_articles')
      .select('id, title, content, duration');
    
    if (error) {
      console.error('Erreur lors de la récupération:', error);
      return;
    }

    console.log(`Formations trouvées: ${formations.length}`);

    // Reformater chaque formation
    for (const formation of formations) {
      console.log(`\nReformatage de: ${formation.title}`);
      
      const structuredContent = createStructuredContent(
        formation.title, 
        formation.content, 
        formation.duration
      );

      // Mettre à jour la formation
      const { error: updateError } = await supabase
        .from('formation_articles')
        .update({ 
          content: structuredContent,
          difficulty: 'Débutant',
          duration: formation.duration || '60 min',
          price: 0
        })
        .eq('id', formation.id);

      if (updateError) {
        console.error(`Erreur lors de la mise à jour de ${formation.title}:`, updateError);
      } else {
        console.log(`✅ ${formation.title} reformatée avec succès`);
      }
    }

    console.log('\n🎉 Toutes les formations ont été reformatées !');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

reformatAllFormations();

