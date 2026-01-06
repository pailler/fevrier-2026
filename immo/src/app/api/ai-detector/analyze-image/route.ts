import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Convertir l'image en base64 pour l'API OpenAI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    // Utiliser GPT-4 Vision pour analyser si l'image est générée par IA
    const analysisPrompt = `Analyse cette image et détermine si elle a été générée par une intelligence artificielle (IA) comme DALL-E, Midjourney, Stable Diffusion, ou d'autres générateurs d'images IA.

    Réponds avec un score de 0 à 100 où:
    - 0-30: Très probablement une photo réelle ou une image créée par un humain
    - 31-70: Incertain, pourrait être IA ou réel
    - 71-100: Très probablement générée par IA
    
    Analyse les caractéristiques suivantes:
    - Artéfacts et incohérences (doigts mal formés, objets flous, détails étranges)
    - Perfection excessive (textures trop parfaites, éclairage uniforme)
    - Style artistique caractéristique (style Midjourney, DALL-E, etc.)
    - Détails réalistes vs artificiels
    - Cohérence des ombres et de l'éclairage
    - Qualité et netteté uniforme
    - Présence d'éléments impossibles ou surréalistes
    
    Réponds uniquement avec un JSON valide contenant:
    {
      "aiScore": nombre entre 0 et 100,
      "humanScore": nombre entre 0 et 100 (doit être 100 - aiScore),
      "confidence": nombre entre 0 et 100,
      "assessment": "description courte en français",
      "reasons": ["raison1", "raison2", "raison3"],
      "detectedStyle": "style détecté si applicable (ex: Midjourney, DALL-E, Stable Diffusion, etc.)"
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en détection d\'images générées par IA. Analyse les images de manière objective et fournis des scores précis. Réponds toujours en JSON valide.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    let analysisResult;
    try {
      const content = completion.choices[0].message.content || '{}';
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      analysisResult = {
        aiScore: 50,
        humanScore: 50,
        confidence: 50,
        assessment: 'Analyse incomplète',
        reasons: ['Erreur lors de l\'analyse'],
        detectedStyle: 'Inconnu',
      };
    }

    // S'assurer que les scores sont valides
    const aiScore = Math.min(100, Math.max(0, analysisResult.aiScore || 50));
    const humanScore = 100 - aiScore;
    const confidence = Math.min(100, Math.max(0, analysisResult.confidence || 75));

    // Déterminer l'évaluation globale
    let overallAssessment = '';
    if (aiScore >= 70) {
      overallAssessment = `Cette image présente des caractéristiques très similaires à une image générée par IA. ${analysisResult.detectedStyle ? `Style détecté: ${analysisResult.detectedStyle}.` : ''} La probabilité est élevée qu'elle ait été créée par une intelligence artificielle.`;
    } else if (aiScore >= 40) {
      overallAssessment = 'Cette image présente un mélange de caractéristiques. Il est difficile de déterminer avec certitude si elle est générée par IA ou réelle.';
    } else {
      overallAssessment = 'Cette image présente des caractéristiques typiques d\'une photo réelle ou d\'une image créée par un humain. La probabilité qu\'elle soit générée par IA est faible.';
    }

    return NextResponse.json({
      aiScore: aiScore,
      humanScore: humanScore,
      confidence: confidence,
      overallAssessment: overallAssessment,
      reasons: analysisResult.reasons || [
        aiScore >= 70 ? 'Artéfacts caractéristiques des images IA' : '',
        aiScore >= 70 ? 'Style cohérent avec les générateurs IA' : '',
        aiScore >= 70 ? 'Perfection excessive des détails' : '',
      ].filter(r => r !== ''),
      detectedStyle: analysisResult.detectedStyle || null,
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'image. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

