import { NextRequest, NextResponse } from 'next/server';
import type { CvFormInput, ImportSourceType } from '@/lib/cvTypes';
import {
  buildImportProfileSystemPrompt,
  buildImportProfileUserMessage,
  parseCvJson,
} from '@/lib/cvPrompts';
import { extractTextFromFile, truncateForLlm } from '@/lib/extractDocumentText';

export const runtime = 'nodejs';
export const maxDuration = 60;

function normalizeImportedForm(raw: Record<string, unknown>): Partial<CvFormInput> {
  const experiences = Array.isArray(raw.experiences)
    ? raw.experiences.map((e: Record<string, unknown>) => ({
        company: String(e.company ?? '').trim(),
        role: String(e.role ?? '').trim(),
        startDate: String(e.startDate ?? '').trim(),
        endDate: String(e.endDate ?? '').trim(),
        description: String(e.description ?? '').trim(),
      }))
    : undefined;

  const education = Array.isArray(raw.education)
    ? raw.education.map((e: Record<string, unknown>) => ({
        school: String(e.school ?? '').trim(),
        degree: String(e.degree ?? '').trim(),
        year: String(e.year ?? '').trim(),
      }))
    : undefined;

  return {
    fullName: String(raw.fullName ?? '').trim(),
    email: String(raw.email ?? '').trim(),
    phone: String(raw.phone ?? '').trim(),
    city: String(raw.city ?? '').trim(),
    targetTitle: String(raw.targetTitle ?? '').trim(),
    experiences,
    education,
    skills: String(raw.skills ?? '').trim(),
    languages: String(raw.languages ?? '').trim(),
  };
}

async function parseProfileWithAi(
  rawText: string,
  sourceType: ImportSourceType,
  linkedinUrl?: string
) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('Clé API OpenAI non configurée (OPENAI_API_KEY).');
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
        { role: 'system', content: buildImportProfileSystemPrompt() },
        {
          role: 'user',
          content: buildImportProfileUserMessage(
            truncateForLlm(rawText),
            sourceType,
            linkedinUrl
          ),
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Erreur OpenAI lors de l\'import');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('Réponse IA vide');

  const parsed = parseCvJson(content) as Record<string, unknown>;
  const form = normalizeImportedForm(parsed);
  const importNotes = Array.isArray(parsed.importNotes)
    ? parsed.importNotes.map(String)
    : [];

  return { form, importNotes, sourceType };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
      }

      let rawText: string;
      try {
        rawText = await extractTextFromFile(file);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Extraction impossible' },
          { status: 400 }
        );
      }

      if (rawText.length < 20) {
        return NextResponse.json(
          { error: 'Contenu trop court pour être analysé.' },
          { status: 400 }
        );
      }

      const result = await parseProfileWithAi(rawText, 'cv_file');
      return NextResponse.json(result);
    }

    const body = await request.json();
    const sourceType = (body.sourceType || 'raw_text') as ImportSourceType;
    const text = String(body.text || '').trim();
    const linkedinUrl = body.linkedinUrl ? String(body.linkedinUrl).trim() : undefined;

    if (sourceType === 'linkedin_text' && linkedinUrl && !text) {
      return NextResponse.json(
        {
          error:
            'L\'import automatique depuis une URL LinkedIn n\'est pas disponible (LinkedIn bloque l\'accès). Collez le texte de votre profil ou exportez votre profil en PDF.',
        },
        { status: 400 }
      );
    }

    if (!text || text.length < 30) {
      return NextResponse.json(
        { error: 'Texte trop court. Collez au moins le contenu principal de votre profil ou CV.' },
        { status: 400 }
      );
    }

    const result = await parseProfileWithAi(text, sourceType, linkedinUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('import-profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
