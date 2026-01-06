import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text }: AnalysisRequest = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Le texte doit contenir au moins 50 caractères' },
        { status: 400 }
      );
    }

    // Limiter la longueur du texte pour éviter les coûts excessifs
    const maxLength = 5000;
    const textToAnalyze = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    // Utiliser GPT pour analyser les patterns et détecter le contenu généré par IA
    const analysisPrompt = `Analyse ce texte et détermine s'il a été RÉDIGÉ par une IA (comme ChatGPT, Claude, etc.).
    
    IMPORTANT: 
    - Sois ÉQUILIBRÉ : détecte précisément les textes IA même s'ils sont bien écrits
    - L'origine des DONNÉES n'importe pas : ce qui compte c'est le STYLE de RÉDACTION
    - Un texte formel et bien écrit peut être humain OU IA - analyse les patterns spécifiques
    
    Réponds avec un score de 0 à 100 où:
    - 0-30: Probablement RÉDIGÉ par un humain (style naturel avec variations, imperfections, personnalité)
    - 31-60: Incertain - pourrait être l'un ou l'autre
    - 61-85: Probablement RÉDIGÉ par une IA (style caractéristique des LLM)
    - 86-100: Très probablement RÉDIGÉ par une IA (style très caractéristique ChatGPT/Claude)
    
    Signes FORTS de RÉDACTION IA (même pour textes formels bien écrits):
    - Structure très organisée et prévisible (introduction systématique, développement structuré, conclusion)
    - Phrases bien formées de manière CONSISTANTE sur tout le texte (peu ou pas d'imperfections)
    - Vocabulaire formel et standardisé avec peu de variations personnelles
    - Transitions fluides et "parfaites" entre les idées (manque de spontanéité)
    - Absence totale d'idiosyncrasies, fautes de frappe, ou style personnel identifiable
    - Utilisation répétée et systématique de connecteurs logiques (cependant, par ailleurs, en outre, notamment, etc.)
    - Paragraphes de longueur similaire et structure homogène
    - Style "professionnel" mais uniforme et prévisible
    - Ton très poli et formel de manière constante
    - Phrases complexes mais toutes bien construites (manque de simplicité occasionnelle)
    
    Signes de RÉDACTION HUMAINE (même pour textes formels):
    - Variations naturelles dans la longueur et complexité des phrases
    - Quelques imperfections mineures ou variations dans le style
    - Personnalité et originalité dans l'expression (même subtile)
    - Nuances émotionnelles ou variations de ton
    - Quelques hésitations, répétitions, ou formulations moins "parfaites"
    - Style unique et identifiable (même dans un contexte formel)
    - Mélange de phrases simples et complexes de manière naturelle
    
    NOTE CRUCIALE: Un texte formel et bien écrit n'est PAS forcément IA. Mais un texte avec TOUS les signes ci-dessus (structure parfaite + vocabulaire standardisé + transitions fluides + absence d'imperfections) est très probablement IA.
    
    Texte à analyser:
    "${textToAnalyze}"
    
    Réponds uniquement avec un JSON valide contenant:
    {
      "aiScore": nombre entre 0 et 100 (sois précis, détecte les textes IA même bien écrits),
      "humanScore": nombre entre 0 et 100 (doit être 100 - aiScore),
      "confidence": nombre entre 0 et 100,
      "assessment": "description courte en français",
      "reasons": ["raison1", "raison2", "raison3"]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en détection de contenu RÉDIGÉ par IA. Sois ÉQUILIBRÉ : détecte précisément les textes IA même s\'ils sont bien écrits et formels. Analyse le STYLE de rédaction (structure, vocabulaire, fluidité, imperfections). Un texte formel peut être humain OU IA - analyse les patterns spécifiques. Si un texte présente une structure très organisée + vocabulaire standardisé + transitions parfaites + absence d\'imperfections, marque-le comme IA (score 60-100). Réponds toujours en JSON valide.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    let analysisResult;
    try {
      const content = completion.choices[0].message.content || '{}';
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Valeurs par défaut en cas d'erreur
      analysisResult = {
        aiScore: 50,
        humanScore: 50,
        confidence: 50,
        assessment: 'Analyse incomplète',
        reasons: ['Erreur lors de l\'analyse'],
      };
    }

    // S'assurer que les scores sont valides
    const aiScore = Math.min(100, Math.max(0, analysisResult.aiScore || 50));
    const humanScore = 100 - aiScore;
    const confidence = Math.min(100, Math.max(0, analysisResult.confidence || 75));

    // Analyser le texte par phrases pour une analyse plus détaillée (limité à 15 phrases pour éviter les coûts)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sentencesToAnalyze = sentences.slice(0, 15);
    
    let sentenceAnalyses: Array<{ text: string; aiProbability: number }> = [];
    
    // Analyser les phrases par batch pour optimiser les coûts
    if (sentencesToAnalyze.length > 0) {
      try {
        const sentenceBatchPrompt = `Évalue ces phrases sur une échelle de 0 à 100 pour la probabilité qu'elles soient RÉDIGÉES par une IA.
        
        IMPORTANT: 
        - Sois ÉQUILIBRÉ : détecte précisément les phrases IA même si elles sont bien formées
        - Analyse le STYLE (structure, vocabulaire, fluidité, imperfections), pas l'origine des données
        
        Signes de style IA (score 60-100): phrases bien formées de manière CONSISTANTE, vocabulaire standardisé et formel, structure prévisible, transitions fluides, absence d'imperfections, style uniforme.
        Signes de style humain (score 0-40): variations naturelles, imperfections mineures occasionnelles, personnalité, spontanéité, mélange de simplicité et complexité.
        
        Phrases à analyser:
        ${sentencesToAnalyze.map((s, i) => `${i + 1}. "${s.trim()}"`).join('\n')}
        
        Réponds uniquement avec un JSON valide:
        {
          "scores": [score1, score2, score3, ...]
        }`;

        const sentenceCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en détection de contenu RÉDIGÉ par IA. Sois ÉQUILIBRÉ : détecte précisément les phrases IA même si elles sont bien formées. Analyse le STYLE (structure, vocabulaire, fluidité, imperfections). Si une phrase présente un style très formel, standardisé, sans imperfections, marque-la comme IA (score 60-100). Réponds uniquement avec un JSON valide.',
            },
            {
              role: 'user',
              content: sentenceBatchPrompt,
            },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        try {
          const sentenceData = JSON.parse(sentenceCompletion.choices[0].message.content || '{}');
          const scores = sentenceData.scores || [];
          
          sentenceAnalyses = sentencesToAnalyze.map((sentence, index) => ({
            text: sentence.trim(),
            aiProbability: Math.min(100, Math.max(0, scores[index] || aiScore)),
          }));
        } catch (error) {
          // En cas d'erreur, utiliser le score global pour toutes les phrases
          sentenceAnalyses = sentencesToAnalyze.map((sentence) => ({
            text: sentence.trim(),
            aiProbability: aiScore,
          }));
        }
      } catch (error) {
        console.error('Erreur lors de l\'analyse des phrases:', error);
        // En cas d'erreur, utiliser le score global
        sentenceAnalyses = sentencesToAnalyze.map((sentence) => ({
          text: sentence.trim(),
          aiProbability: aiScore,
        }));
      }
    }

    // Calculer le score moyen des phrases si disponible
    const avgSentenceScore = sentenceAnalyses.length > 0
      ? sentenceAnalyses.reduce((sum, s) => sum + s.aiProbability, 0) / sentenceAnalyses.length
      : aiScore;

    // Combiner les résultats de manière équilibrée
    // Si l'analyse globale donne un score bas (< 30), on le privilégie (texte probablement humain)
    // Si l'analyse globale donne un score élevé (> 60), on le privilégie aussi (texte probablement IA)
    let combinedScore;
    if (aiScore < 30) {
      // Score bas = probablement humain, privilégier ce score
      combinedScore = Math.round((aiScore * 0.8 + avgSentenceScore * 0.2));
    } else if (aiScore > 60) {
      // Score élevé = probablement IA, privilégier ce score
      combinedScore = Math.round((aiScore * 0.7 + avgSentenceScore * 0.3));
    } else {
      // Zone incertaine, moyenne pondérée normale
      combinedScore = Math.round((aiScore * 0.6 + avgSentenceScore * 0.4));
    }
    
    // Ne pas appliquer de facteur de réduction - laisser le score tel quel pour être précis
    const finalAiScore = Math.min(100, Math.max(0, combinedScore));
    const finalHumanScore = 100 - finalAiScore;

    // Déterminer l'évaluation globale
    let overallAssessment = '';
    if (finalAiScore >= 70) {
      overallAssessment = 'Ce contenu présente des caractéristiques très similaires à du texte généré par IA. La probabilité est élevée qu\'il ait été créé par une intelligence artificielle.';
    } else if (finalAiScore >= 40) {
      overallAssessment = 'Ce contenu présente un mélange de caractéristiques humaines et IA. Il est difficile de déterminer avec certitude l\'origine du texte.';
    } else {
      overallAssessment = 'Ce contenu présente des caractéristiques typiques d\'un texte écrit par un humain. La probabilité qu\'il soit généré par IA est faible.';
    }

    return NextResponse.json({
      aiScore: finalAiScore,
      humanScore: finalHumanScore,
      confidence: confidence,
      overallAssessment: overallAssessment,
      sentences: sentenceAnalyses,
      reasons: analysisResult.reasons || [
        finalAiScore >= 70 ? 'Structure très régulière' : '',
        finalAiScore >= 70 ? 'Vocabulaire standardisé' : '',
        finalAiScore >= 70 ? 'Manque de nuances' : '',
      ].filter(r => r !== ''),
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du texte. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

