import { NextRequest, NextResponse } from 'next/server';

interface PromptFormData {
  taskType: string;
  domain: string;
  objective: string;
  constraints: string;
  outputFormat: string;
  examples: string;
  technique: string;
  creativity: number;
  maxLength: string;
  language: string;
  tone: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData: PromptFormData = await request.json();

    // Vérifier que l'objectif est fourni
    if (!formData.objective || !formData.objective.trim()) {
      return NextResponse.json(
        { error: 'L\'objectif principal est requis' },
        { status: 400 }
      );
    }

    // Récupérer la clé API OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API OpenAI non configurée. Veuillez configurer OPENAI_API_KEY dans les variables d\'environnement.' },
        { status: 500 }
      );
    }

    // Construire le prompt système pour générer le prompt optimisé
    const systemPrompt = buildSystemPrompt(formData);
    
    // Construire le message utilisateur
    const userMessage = buildUserMessage(formData);

    // Appeler l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Utiliser gpt-4o-mini pour un bon équilibre qualité/coût
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: formData.creativity || 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur OpenAI:', errorData);
      return NextResponse.json(
        { error: `Erreur OpenAI: ${errorData.error?.message || 'Erreur inconnue'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0]?.message?.content;

    if (!generatedPrompt) {
      return NextResponse.json(
        { error: 'Aucun prompt généré' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Erreur lors de la génération du prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération du prompt' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(formData: PromptFormData): string {
  return `Tu es un expert en prompt engineering. Ton rôle est de créer des prompts optimisés et efficaces pour les modèles de langage (comme ChatGPT, Claude, etc.) en utilisant les meilleures pratiques du prompt engineering.

Principes à suivre:
1. Clarté et spécificité: Le prompt doit être clair, précis et sans ambiguïté
2. Structure: Utilise une structure logique avec des sections si nécessaire
3. Contexte: Inclus suffisamment de contexte pour guider le modèle
4. Instructions: Formule des instructions actionnables
5. Format: Respecte le format de sortie demandé
6. Technique: Applique la technique de prompting demandée (zero-shot, few-shot, chain-of-thought, etc.)

Génère UNIQUEMENT le prompt optimisé, sans explications supplémentaires, sans préambule, sans commentaires. Le prompt doit être prêt à être utilisé directement.`;
}

function buildUserMessage(formData: PromptFormData): string {
  let message = `Crée un prompt optimisé avec les spécifications suivantes:\n\n`;

  // Type de tâche
  if (formData.taskType) {
    message += `**Type de tâche:** ${formData.taskType}\n`;
  }

  // Domaine
  if (formData.domain) {
    message += `**Domaine/Contexte:** ${formData.domain}\n`;
  }

  // Objectif principal
  message += `**Objectif principal:** ${formData.objective}\n\n`;

  // Contraintes
  if (formData.constraints) {
    message += `**Contraintes/Exigences:** ${formData.constraints}\n\n`;
  }

  // Format de sortie
  if (formData.outputFormat) {
    message += `**Format de sortie souhaité:** ${formData.outputFormat}\n\n`;
  }

  // Technique de prompting
  message += `**Technique de prompting à utiliser:** ${formData.technique}\n`;
  
  if (formData.technique === 'few-shot' && formData.examples) {
    message += `**Exemples à inclure:**\n${formData.examples}\n\n`;
  } else if (formData.technique === 'chain-of-thought') {
    message += `(Inclus des instructions pour un raisonnement étape par étape)\n\n`;
  } else if (formData.technique === 'react') {
    message += `(Inclus des instructions pour combiner raisonnement et actions)\n\n`;
  }

  // Langue
  message += `**Langue:** ${formData.language}\n`;

  // Ton
  message += `**Ton/Style:** ${formData.tone}\n`;

  // Longueur
  const lengthMap: Record<string, string> = {
    'short': '50-100 mots',
    'medium': '200-500 mots',
    'long': '500-1000 mots',
    'very-long': '1000+ mots'
  };
  message += `**Longueur de réponse attendue:** ${lengthMap[formData.maxLength] || formData.maxLength}\n`;

  // Instructions finales
  message += `\n**Instructions importantes:**\n`;
  message += `- Le prompt doit être en ${formData.language}\n`;
  message += `- Utilise la technique ${formData.technique} de manière appropriée\n`;
  message += `- Sois précis et actionnable\n`;
  message += `- Inclus toutes les informations nécessaires pour obtenir une réponse de qualité\n`;
  
  if (formData.technique === 'few-shot' && !formData.examples) {
    message += `- Note: La technique few-shot est demandée mais aucun exemple n'a été fourni. Crée un prompt zero-shot optimisé à la place.\n`;
  }

  return message;
}


