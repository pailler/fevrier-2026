import { NextRequest, NextResponse } from 'next/server';
import {
  buildCoverLetterSystemPrompt,
  buildCoverLetterUserMessage,
} from '@/lib/cvPrompts';

export async function POST(request: NextRequest) {
  try {
    const { cvSummary, targetTitle, jobDescription, fullName } = await request.json();

    if (!fullName?.trim() || !targetTitle?.trim()) {
      return NextResponse.json(
        { error: 'Nom et poste visé requis.' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API OpenAI non configurée.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildCoverLetterSystemPrompt() },
          {
            role: 'user',
            content: buildCoverLetterUserMessage(
              cvSummary || '',
              targetTitle,
              jobDescription || '',
              fullName
            ),
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || 'Erreur OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const letter = data.choices[0]?.message?.content?.trim();
    if (!letter) {
      return NextResponse.json({ error: 'Lettre non générée' }, { status: 500 });
    }

    return NextResponse.json({ letter });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
