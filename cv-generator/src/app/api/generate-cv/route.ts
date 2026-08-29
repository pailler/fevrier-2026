import { NextRequest, NextResponse } from 'next/server';
import type { CvFormInput, GeneratedCv } from '@/lib/cvTypes';
import {
  buildCvSystemPrompt,
  buildCvUserMessage,
  parseCvJson,
} from '@/lib/cvPrompts';

export async function POST(request: NextRequest) {
  try {
    const form: CvFormInput = await request.json();

    if (!form.fullName?.trim() || !form.targetTitle?.trim()) {
      return NextResponse.json(
        { error: 'Le nom complet et le poste visé sont requis.' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API OpenAI non configurée (OPENAI_API_KEY).' },
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
          { role: 'system', content: buildCvSystemPrompt() },
          { role: 'user', content: buildCvUserMessage(form) },
        ],
        temperature: 0.6,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Erreur OpenAI: ${errorData.error?.message || 'Erreur inconnue'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Aucun contenu généré' }, { status: 500 });
    }

    const parsed = parseCvJson(content) as GeneratedCv;
    parsed.personalInfo = {
      ...parsed.personalInfo,
      fullName: parsed.personalInfo?.fullName || form.fullName,
      email: parsed.personalInfo?.email || form.email,
      phone: parsed.personalInfo?.phone || form.phone,
      city: parsed.personalInfo?.city || form.city,
      title: parsed.personalInfo?.title || form.targetTitle,
    };

    return NextResponse.json({ cv: parsed, template: form.template });
  } catch (error) {
    console.error('Erreur generate-cv:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
