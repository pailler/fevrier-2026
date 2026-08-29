import OpenAI from 'openai';
import sharp from 'sharp';

export interface ImageAnalysisResult {
  aiScore: number;
  humanScore: number;
  confidence: number;
  overallAssessment: string;
  reasons: string[];
  detectedStyle: string | null;
  analysisSource: 'llm' | 'local';
}

const AI_SIZE_SET = new Set([
  '256x256',
  '512x512',
  '768x768',
  '1024x1024',
  '1024x1792',
  '1792x1024',
  '1280x1280',
  '1536x1536',
  '1456x816',
  '816x1456',
  '2048x2048',
]);

const GENERATOR_HINTS: Array<{ pattern: RegExp; style: string; score: number }> = [
  { pattern: /midjourney/i, style: 'Midjourney', score: 92 },
  { pattern: /dall-?e/i, style: 'DALL-E', score: 92 },
  { pattern: /stable[\s_-]?diffusion/i, style: 'Stable Diffusion', score: 90 },
  { pattern: /firefly/i, style: 'Adobe Firefly', score: 88 },
  { pattern: /leonardo/i, style: 'Leonardo AI', score: 88 },
  { pattern: /flux\.1|black forest labs/i, style: 'Flux', score: 88 },
  { pattern: /ideogram/i, style: 'Ideogram', score: 88 },
  { pattern: /this image was generated/i, style: 'Générateur IA', score: 85 },
];

const CAMERA_HINTS = [
  /canon/i,
  /nikon/i,
  /sony/i,
  /fujifilm/i,
  /olympus/i,
  /leica/i,
  /panasonic/i,
  /hasselblad/i,
  /iphone/i,
  /pixel \d/i,
  /galaxy s\d/i,
  /exposureTime/i,
  /DateTimeOriginal/i,
  /FocalLength/i,
  /FNumber/i,
  /ISOSpeed/i,
  /Make\0/i,
];

function looksLikeKey(value: string | undefined, prefix: string): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.endsWith('...') || trimmed.includes('your_')) return false;
  return trimmed.startsWith(prefix);
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function assessmentFor(score: number, style: string | null): string {
  if (score >= 70) {
    return `Cette image présente des caractéristiques très similaires à une image générée par IA.${style ? ` Style détecté: ${style}.` : ''} La probabilité est élevée qu'elle ait été créée par une intelligence artificielle.`;
  }
  if (score >= 40) {
    return 'Cette image présente un mélange de caractéristiques. Il est difficile de déterminer avec certitude si elle est générée par IA ou réelle.';
  }
  return "Cette image présente des caractéristiques typiques d'une photo réelle ou d'une image créée par un humain. La probabilité qu'elle soit générée par IA est faible.";
}

export async function analyzeImageHeuristically(
  buffer: Buffer,
  mimeType: string
): Promise<ImageAnalysisResult> {
  const reasons: string[] = [];
  let score = 50;
  let detectedStyle: string | null = null;
  let confidence = 45;

  let width = 0;
  let height = 0;
  let metaText = '';

  try {
    const meta = await sharp(buffer).metadata();
    width = meta.width || 0;
    height = meta.height || 0;
    const chunks = [
      meta.exif?.toString('latin1') || '',
      meta.iptc?.toString('latin1') || '',
      meta.xmp?.toString('utf8') || '',
      meta.icc?.toString('latin1') || '',
    ];
    metaText = chunks.join('\n');
  } catch (error) {
    console.warn('Métadonnées image illisibles:', error instanceof Error ? error.message : error);
  }

  for (const hint of GENERATOR_HINTS) {
    if (hint.pattern.test(metaText)) {
      score = Math.max(score, hint.score);
      detectedStyle = hint.style;
      reasons.push(`Métadonnées du générateur « ${hint.style} » détectées`);
      confidence = 88;
      break;
    }
  }

  const hasCamera = CAMERA_HINTS.some((re) => re.test(metaText));
  if (hasCamera && !detectedStyle) {
    score = Math.min(score, 22);
    reasons.push('Métadonnées d’appareil photo / EXIF caméra présentes');
    confidence = 78;
  }

  const sizeKey = `${width}x${height}`;
  if (width > 0 && height > 0 && AI_SIZE_SET.has(sizeKey) && !hasCamera) {
    score = Math.max(score, 68);
    reasons.push(`Résolution ${sizeKey} fréquente chez les générateurs d’images IA`);
    confidence = Math.max(confidence, 60);
  }

  if (!metaText.trim() && !hasCamera) {
    score = Math.max(score, 58);
    reasons.push('Aucune métadonnée caméra : fréquent sur les images générées ou fortement exportées');
    confidence = Math.max(confidence, 50);
  }

  if (mimeType.includes('webp') && !hasCamera && !detectedStyle) {
    score += 4;
  }

  if (reasons.length === 0) {
    reasons.push('Pas de signature IA évidente dans les métadonnées ; score incertain');
    confidence = Math.min(confidence, 42);
  }

  const aiScore = clamp(score);
  return {
    aiScore,
    humanScore: 100 - aiScore,
    confidence: clamp(confidence),
    overallAssessment: assessmentFor(aiScore, detectedStyle),
    reasons: reasons.slice(0, 5),
    detectedStyle,
    analysisSource: 'local',
  };
}

async function analyzeImageWithOpenAI(
  dataUrl: string,
  fallback: ImageAnalysisResult
): Promise<ImageAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!looksLikeKey(apiKey, 'sk-')) {
    throw new Error('OPENAI_API_KEY absente ou placeholder');
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          "Tu es un expert en détection d'images générées par IA. Analyse de manière objective. Réponds toujours en JSON valide.",
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyse cette image et détermine si elle a été générée par une IA (DALL-E, Midjourney, Stable Diffusion, etc.).
Réponds uniquement avec un JSON:
{
  "aiScore": nombre 0-100,
  "humanScore": nombre 0-100,
  "confidence": nombre 0-100,
  "assessment": "description courte en français",
  "reasons": ["raison1", "raison2"],
  "detectedStyle": "style ou null"
}`,
          },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 500,
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as {
    aiScore?: number;
    confidence?: number;
    assessment?: string;
    reasons?: string[];
    detectedStyle?: string | null;
  };
  const aiScore = clamp(parsed.aiScore ?? fallback.aiScore);
  const detectedStyle = parsed.detectedStyle || fallback.detectedStyle;
  return {
    aiScore,
    humanScore: 100 - aiScore,
    confidence: clamp(parsed.confidence ?? 75),
    overallAssessment: parsed.assessment || assessmentFor(aiScore, detectedStyle),
    reasons: parsed.reasons?.filter(Boolean).slice(0, 6) || fallback.reasons,
    detectedStyle,
    analysisSource: 'llm',
  };
}

export async function analyzeImageContent(
  buffer: Buffer,
  mimeType: string
): Promise<ImageAnalysisResult> {
  const local = await analyzeImageHeuristically(buffer, mimeType);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  try {
    return await analyzeImageWithOpenAI(dataUrl, local);
  } catch (error) {
    console.warn(
      'Analyse vision OpenAI indisponible, fallback métadonnées:',
      error instanceof Error ? error.message : error
    );
    return local;
  }
}
