import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/** Appeler une fois en GET : /api/seed-blog-six-onglets-projet */
const SLUG = 'six-onglets-un-seul-projet-outils-ia';

const ARTICLE_CONTENT = `
<article class="article-content">
  <p class="article-lede">Hier encore, je me suis retrouvé avec la barre du navigateur qui ressemblait à un clavier de piano : transcription, PDF, image, un outil pour gratter le fond d’une photo, un autre pour vérifier un texte. Un seul projet pourtant — une petite vidéo interne et son visuel — et déjà six onglets qui ne se parlent pas entre eux.</p>

  <h2>Le fameux « hop, j’ouvre un nouvel outil »</h2>
  <p>Ça commence toujours pareil. Il me faut le texte d’une réunion : j’atterris sur un site de transcription. Ensuite je dois résumer un PDF de vingt pages : nouveau service. Une vignette pour la miniature ? Encore une inscription ou un essai gratuit qui finit en file d’attente. Je ne compte même plus les mots de passe oubliés et les onglets « restés ouverts au cas où ».</p>
  <p>Le pire, ce n’est pas le temps passé dans chaque outil — souvent ils sont bons à leur manière. C’est le <strong>va-et-vient</strong> : exporter, réimporter, vérifier que le fichier a bien le bon nom, se demander si ce que j’ai uploadé quelque part va rester là six mois. Bref, de la charge mentale pour rien.</p>

  <h2>Ce que personne ne met sur la page d’accueil</h2>
  <p>Les tarifs, on finit par les comprendre à force. Ce qu’on affiche moins, c’est le <strong>coût d’usage réel</strong> : six comptes, six politiques de confidentialité à lire en diagonale, six fois la question « est-ce que je peux mettre ce document là-dedans ? ». Pour un freelance ou une asso, ce n’est pas dramatique une fois — mais quand ça devient une habitude, ça s’accumule.</p>
  <p>Moi, ce qui m’a le plus agacé, c’est quand j’ai réalisé que je passais plus de temps à <em>gerber</em> entre les services qu’à finir le boulot. Pas glorieux à avouer, mais si ça peut éviter la même chose à quelqu’un d’autre, autant le dire.</p>

  <h2>Ce que j’ai changé (sans devenir minimaliste à fond)</h2>
  <p>Je ne suis pas devenu la personne qui n’a qu’un onglet ouverte — soyons sérieux. En revanche, j’ai cherché un endroit où <strong>les briques utiles du quotidien</strong> tiennent ensemble : audio, PDF, image, un peu de texte, sans que chaque étape soit une nouvelle galère d’inscription.</p>
  <p>L’idée, ce n’est pas d’avoir « l’outil ultime » qui fait tout médiocrement. C’est d’avoir <strong>un point d’entrée</strong>, une langue et des habitudes stables, pour enchaîner les tâches sans me reprendre une demi-heure à me souvenir où j’avais mis le fichier WAV.</p>
  <p>Concrètement, sur une même journée, je peux enchaîner une <a href="/card/whisper">transcription</a>, un passage sur un <a href="/card/pdf">PDF</a> pour en tirer l’essentiel, et une image pour le visuel — sans multiplier les contextes. Ce n’est pas magique : certains fichiers lourds restent pénibles, et il y a toujours un cas limite (le scan baveux, l’audio saturé…). La différence, c’est que je ne repars pas de zéro à chaque fois.</p>

  <h2>Pourquoi j’en parle ici</h2>
  <p>On a construit <a href="https://iahome.fr">IAHome</a> avec cette frustration en tête : une <a href="/applications">plateforme d’applications</a> en français, pensée pour qu’on arrête de jongler entre dix services pour un seul livrable. Ce n’est pas une promesse de tout remplacer du jour au lendemain — plutôt une manière de <strong>recentrer</strong> le travail sur le fond plutôt que sur la logistique des onglets.</p>
  <p>Si vous vous reconnaissez dans le tableau des six onglets, le blog suivra sur le même ton : retours d’usage, limites honnêtes, trucs qui marchent (ou pas). Pas de liste « 12 astuces incroyables » — plutôt des notes de terrain.</p>

  <p class="article-note"><strong>Dernière mise à jour :</strong> 24 mars 2025 — article publié ; nous le compléterons si l’offre ou les applis évoluent.</p>
</article>
`;

export async function GET() {
  try {
    const { data: existing } = await supabaseAdmin
      .from('blog_articles')
      .select('id')
      .eq('slug', SLUG)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'L’article « six onglets » existe déjà.',
        slug: SLUG,
      });
    }

    const wordCount = ARTICLE_CONTENT.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 250));

    const article = {
      title: 'Pourquoi j’en avais marre d’ouvrir six onglets pour un seul projet',
      slug: SLUG,
      content: ARTICLE_CONTENT,
      excerpt:
        'Six onglets pour un seul livrable : transcription, PDF, image… Retour d’usage sur la fatigue des outils éclatés — et pourquoi un point d’entrée unique change le quotidien.',
      category: 'product',
      author: 'IAHome',
      read_time: readTime,
      published_at: new Date('2025-03-24T18:00:00.000Z').toISOString(),
      image_url: '/images/sentinelle-numerique.jpg',
      status: 'published' as const,
    };

    const { data, error } = await supabaseAdmin
      .from('blog_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion article six onglets:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Article « six onglets » créé et publié.',
      data,
      slug: SLUG,
      url: `/blog/${SLUG}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur seed six onglets:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
