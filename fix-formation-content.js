const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour nettoyer le contenu HTML malformé
function cleanFormationContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Nettoyer les HTML imbriqués et malformés
  let cleaned = content
    // Supprimer tous les DOCTYPE
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    // Supprimer toutes les balises html
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    // Supprimer tous les head
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    // Supprimer toutes les balises body
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    // Supprimer les styles et scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    // Remplacer les balises sémantiques par des divs
    .replace(/<header[^>]*>/gi, '<div class="formation-header">')
    .replace(/<\/header>/gi, '</div>')
    .replace(/<main[^>]*>/gi, '<div class="formation-main">')
    .replace(/<\/main>/gi, '</div>')
    .replace(/<footer[^>]*>/gi, '<div class="formation-footer">')
    .replace(/<\/footer>/gi, '</div>')
    // Remplacer les classes
    .replace(/class="wrap"/gi, 'class="formation-section"')
    .replace(/class="lede"/gi, 'class="formation-lede"')
    .replace(/class="note"/gi, 'class="formation-note"')
    .replace(/class="callout"/gi, 'class="formation-callout"')
    .replace(/class="glossary"/gi, 'class="formation-glossary"')
    .replace(/class="kbd"/gi, 'class="formation-kbd"')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

async function fixAllFormations() {
  try {
    // Récupérer toutes les formations
    const { data: formations, error } = await supabase
      .from('formation_articles')
      .select('id, title, content');
    
    if (error) {
      console.error('Erreur lors de la récupération:', error);
      return;
    }

    console.log(`Formations trouvées: ${formations.length}`);

    // Nettoyer chaque formation
    for (const formation of formations) {
      console.log(`\nNettoyage de: ${formation.title}`);
      
      const cleanedContent = cleanFormationContent(formation.content);
      
      // Vérifier si le contenu a changé
      if (cleanedContent !== formation.content) {
        // Mettre à jour la formation
        const { error: updateError } = await supabase
          .from('formation_articles')
          .update({ content: cleanedContent })
          .eq('id', formation.id);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour de ${formation.title}:`, updateError);
        } else {
          console.log(`✅ ${formation.title} nettoyée avec succès`);
        }
      } else {
        console.log(`ℹ️ ${formation.title} déjà propre`);
      }
    }

    console.log('\n🎉 Toutes les formations ont été vérifiées et nettoyées !');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

fixAllFormations();
