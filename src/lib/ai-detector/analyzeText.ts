import OpenAI from 'openai';
import type { TextAnalysisResult } from './heuristicText';
import { analyzeTextHeuristically } from './heuristicText';

function looksLikeKey(value: string | undefined, prefix: string): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.endsWith('...') || trimmed.includes('your_') || trimmed.includes('changez')) return false;
  return trimmed.startsWith(prefix);
}

function assessmentFor(score: number): string {
  if (score >= 70) {
    return 'Ce contenu présente des caractéristiques très similaires à du texte généré par IA. La probabilité est élevée qu’il ait été créé par une intelligence artificielle.';
  }
  if (score >= 40) {
    return 'Ce contenu présente un mélange de caractéristiques humaines et IA. Il est difficile de déterminer avec certitude l’origine du texte.';
  }
  return 'Ce contenu présente des caractéristiques typiques d’un texte écrit par un humain. La probabilité qu’il soit généré par IA est faible.';
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeLlmResult(raw: Record<string, unknown>, fallback: TextAnalysisResult): TextAnalysisResult {
  const aiScore = clamp(typeof raw.aiScore === 'number' ? raw.aiScore : fallback.aiScore);
  const reasons = Array.isArray(raw.reasons)
    ? raw.reasons.filter((r): r is string => typeof r === 'string' && r.trim().length > 0).slice(0, 6)
    : fallback.reasons;
  const rawSentences = Array.isArray(raw.sentences) ? raw.sentences : [];
  const sentences =
    rawSentences.length > 0
      ? rawSentences
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const rec = item as { text?: unknown; aiProbability?: unknown };
            if (typeof rec.text !== 'string') return null;
            return {
              text: rec.text.trim(),
              aiProbability: clamp(typeof rec.aiProbability === 'number' ? rec.aiProbability : aiScore),
            };
          })
          .filter((s): s is { text: string; aiProbability: number } => s !== null)
          .slice(0, 15)
      : fallback.sentences;

  return {
    aiScore,
    humanScore: 100 - aiScore,
    confidence: clamp(typeof raw.confidence === 'number' ? raw.confidence : 75),
    overallAssessment:
      typeof raw.assessment === 'string' && raw.assessment.trim()
        ? raw.assessment
        : assessmentFor(aiScore),
    sentences,
    reasons,
    analysisSource: 'llm',
  };
}

const SYSTEM_PROMPT =
  'Tu es un expert en détection de contenu RÉDIGÉ par IA. Sois ÉQUILIBRÉ : détecte précisément les textes IA même s\'ils sont bien écrits et formels. Analyse le STYLE de rédaction (structure, vocabulaire, fluidité, imperfections). Un texte formel peut être humain OU IA. Réponds toujours en JSON valide.';

function buildUserPrompt(text: string): string {
  const textToAnalyze = text.length > 5000 ? `${text.slice(0, 5000)}...` : text;
  return `Analyse ce texte et détermine s'il a été RÉDIGÉ par une IA (comme ChatGPT, Claude, etc.).

Réponds avec un score de 0 à 100 où:
- 0-30: Probablement RÉDIGÉ par un humain
- 31-60: Incertain
- 61-85: Probablement RÉDIGÉ par une IA
- 86-100: Très probablement RÉDIGÉ par une IA

Texte à analyser:
${JSON.stringify(textToAnalyze)}

Réponds uniquement avec un JSON valide:
{
  "aiScore": nombre entre 0 et 100,
  "humanScore": nombre entre 0 et 100,
  "confidence": nombre entre 0 et 100,
  "assessment": "description courte en français",
  "reasons": ["raison1", "raison2", "raison3"],
  "sentences": [{"text": "phrase", "aiProbability": 0}]
}`;
}

async function analyzeWithOpenAI(text: string): Promise<TextAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!looksLikeKey(apiKey, 'sk-')) {
    throw new Error('OPENAI_API_KEY absente ou placeholder');
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(text) },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as Record<string, unknown>;
  return normalizeLlmResult(parsed, analyzeTextHeuristically(text));
}

async function analyzeWithAnthropic(text: string): Promise<TextAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!looksLikeKey(apiKey, 'sk-ant-')) {
    throw new Error('ANTHROPIC_API_KEY absente ou placeholder');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(text) }],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Anthropic ${response.status}: ${details.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content = data.content?.find((block) => block.type === 'text')?.text || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content) as Record<string, unknown>;
  return normalizeLlmResult(parsed, analyzeTextHeuristically(text));
}

export async function analyzeTextContent(text: string): Promise<TextAnalysisResult> {
  const local = analyzeTextHeuristically(text);

  try {
    return await analyzeWithOpenAI(text);
  } catch (error) {
    console.warn(
      'Analyse OpenAI indisponible, tentative Anthropic / locale:',
      error instanceof Error ? error.message : error
    );
  }

  try {
    return await analyzeWithAnthropic(text);
  } catch (error) {
    console.warn(
      'Analyse Anthropic indisponible, fallback heuristique locale:',
      error instanceof Error ? error.message : error
    );
  }

  return local;
}
