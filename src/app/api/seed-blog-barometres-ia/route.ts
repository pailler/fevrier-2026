import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

const SLUG = 'barometres-ia';

const ARTICLE_CONTENT = `
<article class="article-content">
  <h2>À quoi servent les baromètres d'IA ?</h2>
  <p>Les <strong>baromètres d'IA</strong> (ou benchmarks) sont des outils d'évaluation standardisés qui permettent de mesurer et de comparer les performances des modèles d'intelligence artificielle. Ils répondent à un besoin crucial : dans un paysage où des centaines de modèles de langage (LLM) voient le jour chaque année, comment savoir lesquels sont réellement performants, et pour quelles tâches ?</p>
  
  <p>Concrètement, un baromètre d'IA sert à :</p>
  <ul>
    <li><strong>Comparer objectivement</strong> les modèles entre eux sur des critères définis</li>
    <li><strong>Guider les choix</strong> des entreprises et des développeurs (modèle open-source vs propriétaire, coût vs qualité)</li>
    <li><strong>Suivre l'évolution</strong> des capacités (raisonnement, code, multilingue, etc.) dans le temps</li>
    <li><strong>Identifier les forces et faiblesses</strong> d'un modèle selon les domaines (santé, droit, code, créativité)</li>
  </ul>

  <h2>Les principaux critères d'évaluation</h2>
  <p>Les baromètres combinent généralement plusieurs types de critères pour donner une vision plus juste des capacités réelles des modèles.</p>

  <h3>1. Compétences générales et connaissances</h3>
  <p>Des benchmarks comme le <strong>MMLU</strong> (Measuring Massive Multitask Language Understanding) testent la compréhension et les connaissances sur un large éventail de matières (sciences, histoire, droit, etc.) via des questions à choix multiples. Plus de 16 000 questions couvrent une cinquantaine de domaines académiques. Les modèles les plus avancés approchent aujourd'hui les 90 % de précision, proches du niveau expert humain.</p>

  <h3>2. Raisonnement et logique</h3>
  <p>Des jeux de données comme <strong>BBH</strong> (Big Bench Hard) ou <strong>GPQA</strong> ciblent des tâches de raisonnement difficiles, où il ne suffit pas de « réciter » du texte appris. On mesure la capacité à enchaîner des étapes logiques, à résoudre des problèmes mathématiques ou à répondre à des questions nécessitant une vraie déduction.</p>

  <h3>3. Code et techniques</h3>
  <p>Des benchmarks dédiés (HumanEval, MBPP, etc.) évaluent la capacité à générer du code correct à partir d’une description en langage naturel. C’est un critère essentiel pour les modèles utilisés en assistance au développement.</p>

  <h3>4. Multilingue et français</h3>
  <p>Pour le français, des initiatives comme le <strong>Leaderboard francophone</strong> (le-leadboard) proposent des versions françaises de benchmarks (BBH-FR, GPQA-FR, etc.) et des évaluations vérifiées par des annotateurs humains et par des modèles de type GPT-4 pour garantir la pertinence des résultats.</p>

  <h3>5. Robustesse et cohérence</h3>
  <p>Au-delà du score brut, on s’intéresse à la <strong>robustesse</strong> : le modèle donne-t-il des réponses stables quand on reformule la question ? Résiste-t-il aux petites variations de formulation ? Des méthodologies récentes combinent des tests automatisés (LLM-as-a-judge) et des vérifications humaines ciblées lorsque les méthodes automatiques divergent.</p>

  <h2>Comment interpréter les résultats ?</h2>
  <p>Un bon baromètre ne se résume pas à un seul chiffre. Il est important de :</p>
  <ul>
    <li>Regarder les <strong>scores par domaine</strong> (un modèle excellent en code peut être moyen en culture générale)</li>
    <li>Tenir compte des <strong>conditions d’évaluation</strong> (taille du contexte, type de questions, langue)</li>
    <li>Consulter plusieurs benchmarks complémentaires pour avoir une vue d’ensemble</li>
  </ul>
  <p>Les baromètres d’IA restent des outils indispensables pour suivre l’évolution de l’intelligence artificielle et faire des choix éclairés, que ce soit pour un projet professionnel ou pour mieux comprendre l’écosystème des LLM.</p>
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
        message: 'L\'article "Les baromètres d\'IA" existe déjà.',
        slug: SLUG
      });
    }

    const wordCount = ARTICLE_CONTENT.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 250));

    const article = {
      title: 'Les baromètres d\'IA : à quoi servent-ils et quels sont les critères d\'évaluation ?',
      slug: SLUG,
      content: ARTICLE_CONTENT,
      excerpt: 'Les baromètres d\'IA permettent de mesurer et comparer les modèles de langage. Découvrez leur rôle et les principaux critères d\'évaluation : MMLU, raisonnement, code, multilingue et robustesse.',
      category: 'resources',
      author: 'IAHome',
      read_time: readTime,
      published_at: new Date().toISOString(),
      image_url: '/images/barometres-ia.jpg',
      status: 'published'
    };

    const { data, error } = await supabaseAdmin
      .from('blog_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion article baromètres IA:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article "Les baromètres d\'IA" créé avec succès.',
      data,
      slug: SLUG
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur seed baromètres IA:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
