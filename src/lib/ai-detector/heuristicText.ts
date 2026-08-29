export interface SentenceAnalysis {
  text: string;
  aiProbability: number;
}

export interface TextAnalysisResult {
  aiScore: number;
  humanScore: number;
  confidence: number;
  overallAssessment: string;
  sentences: SentenceAnalysis[];
  reasons: string[];
  analysisSource: 'llm' | 'local';
}

const AI_PHRASES_FR = [
  'il est important de noter',
  'il convient de',
  'il est essentiel',
  'il est crucial',
  'dans un monde',
  'en conclusion',
  'pour conclure',
  'en d’autres termes',
  "en d'autres termes",
  'dans le cadre de',
  'n’hésitez pas',
  "n'hésitez pas",
  'mettre en lumière',
  'met en lumière',
  'au cœur de',
  'au coeur de',
  'que ce soit',
  'non seulement',
  'mais également',
  'il s’agit de',
  "il s'agit de",
  'en tant que',
  'afin de garantir',
  'jouer un rôle clé',
  'joue un rôle clé',
  'ouvre la voie',
  'sans précédent',
];

const AI_PHRASES_EN = [
  'it is important to note',
  "it's important to note",
  'in conclusion',
  'in today\'s world',
  'delve into',
  'landscape of',
  'underscores',
  'leverage',
  'as an ai',
  'i hope this helps',
  'furthermore',
  'moreover',
  'in summary',
  'tapestry',
  'multifaceted',
  'cutting-edge',
];

const CONNECTORS = [
  'cependant',
  'néanmoins',
  'par ailleurs',
  'en outre',
  'de plus',
  'ainsi',
  'notamment',
  'toutefois',
  'en revanche',
  'par conséquent',
  'donc',
  'enfin',
  'ensuite',
  'premièrement',
  'deuxièmement',
  'however',
  'therefore',
  'moreover',
  'furthermore',
  'additionally',
  'consequently',
  'meanwhile',
];

const HUMAN_MARKERS = [
  'franchement',
  'bon ben',
  'voilà',
  'mdr',
  'lol',
  'ptdr',
  'j’suis',
  "j'suis",
  'y’a',
  "y'a",
  't’as',
  "t'as",
  'ouais',
  'nan',
  'euh',
  'heu',
  'wtf',
  'pfff',
  'bof',
  'grave',
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

function countOccurrences(haystack: string, needles: string[]): number {
  let count = 0;
  for (const needle of needles) {
    const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = haystack.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)));
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

export function analyzeTextHeuristically(text: string): TextAnalysisResult {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  const sentences = splitSentences(normalized);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);

  const sentenceWordCounts = (sentences.length > 0 ? sentences : [normalized]).map(
    (s) => s.split(/\s+/).filter(Boolean).length
  );
  const avgLen = mean(sentenceWordCounts);
  const burstiness = avgLen > 0 ? stddev(sentenceWordCounts) / avgLen : 0;

  const aiPhraseHits =
    countOccurrences(lower, AI_PHRASES_FR) + countOccurrences(lower, AI_PHRASES_EN);
  const connectorHits = countOccurrences(lower, CONNECTORS);
  const humanHits = countOccurrences(lower, HUMAN_MARKERS);

  const ellipsis = (normalized.match(/\.{3}|…/g) || []).length;
  const informalPunct = (normalized.match(/!{2,}|\?{2,}/g) || []).length;
  const firstPerson = (lower.match(/\b(je|j’|j'|moi|mon|ma|mes)\b/g) || []).length;
  const secondPerson = (lower.match(/\b(tu|toi|ton|ta|tes|vous|votre|vos)\b/g) || []).length;

  let score = 48;
  const reasons: string[] = [];

  const phraseDensity = aiPhraseHits / Math.max(wordCount / 80, 1);
  if (phraseDensity >= 1) {
    score += Math.min(22, 8 + phraseDensity * 4);
    reasons.push('Formules typiques des modèles de langage détectées');
  }

  const connectorDensity = connectorHits / sentenceCount;
  if (connectorDensity >= 0.45) {
    score += Math.min(16, connectorDensity * 12);
    reasons.push('Connecteurs logiques nombreux et réguliers (cependant, par ailleurs, notamment…)');
  } else if (connectorDensity < 0.15 && sentenceCount >= 3) {
    score -= 8;
  }

  if (burstiness < 0.22 && sentenceCount >= 3) {
    score += 14;
    reasons.push('Longueur de phrases très homogène (faible « burstiness »)');
  } else if (burstiness > 0.55) {
    score -= 14;
    reasons.push('Variations naturelles de longueur de phrases');
  }

  if (avgLen >= 18 && avgLen <= 32 && burstiness < 0.35 && sentenceCount >= 2) {
    score += 8;
    reasons.push('Phrases de longueur moyenne, régulière, caractéristique des LLM');
  }

  if (humanHits > 0) {
    score -= Math.min(20, humanHits * 8);
    reasons.push('Marqueurs oraux ou informels plutôt humains');
  }
  if (ellipsis > 0 || informalPunct > 0) {
    score -= Math.min(12, ellipsis * 3 + informalPunct * 4);
  }

  if (firstPerson >= 2 && wordCount > 40) {
    score -= 8;
    reasons.push('Présence d’un je / vécu personnel');
  }
  if (secondPerson >= 3 && aiPhraseHits === 0) {
    score -= 4;
  }

  const uniqueRatio = new Set(words.map((w) => w.toLowerCase().replace(/[^a-zA-ZÀ-ÿ0-9]/g, ''))).size / Math.max(wordCount, 1);
  if (uniqueRatio < 0.42 && wordCount > 80) {
    score += 8;
    reasons.push('Vocabulaire assez répétitif et standardisé');
  } else if (uniqueRatio > 0.72 && wordCount > 50) {
    score -= 6;
  }

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
  if (paragraphs.length >= 3) {
    const paraLens = paragraphs.map((p) => p.trim().length);
    const paraCv = mean(paraLens) > 0 ? stddev(paraLens) / mean(paraLens) : 1;
    if (paraCv < 0.18) {
      score += 10;
      reasons.push('Paragraphes de longueur très similaire');
    }
  }

  const finalAiScore = clamp(score);
  const confidence = clamp(
    55 +
      Math.min(25, wordCount / 12) +
      (Math.abs(finalAiScore - 50) > 20 ? 10 : 0) -
      (wordCount < 80 ? 15 : 0)
  );

  const sentenceAnalyses: SentenceAnalysis[] = (sentences.length > 0 ? sentences : [normalized])
    .slice(0, 15)
    .map((sentence) => {
      const sLower = sentence.toLowerCase();
      let p = finalAiScore;
      if (countOccurrences(sLower, CONNECTORS) > 0) p += 8;
      if (countOccurrences(sLower, AI_PHRASES_FR) + countOccurrences(sLower, AI_PHRASES_EN) > 0) p += 12;
      if (countOccurrences(sLower, HUMAN_MARKERS) > 0) p -= 18;
      const wc = sentence.split(/\s+/).length;
      if (wc >= 22 && wc <= 40) p += 4;
      if (wc < 8) p -= 10;
      return { text: sentence.trim(), aiProbability: clamp(p) };
    });

  if (reasons.length === 0) {
    reasons.push(
      finalAiScore >= 55
        ? 'Style globalement régulier et formel'
        : 'Peu de signatures caractéristiques des LLM'
    );
  }

  return {
    aiScore: finalAiScore,
    humanScore: 100 - finalAiScore,
    confidence,
    overallAssessment: assessmentFor(finalAiScore),
    sentences: sentenceAnalyses,
    reasons: reasons.slice(0, 5),
    analysisSource: 'local',
  };
}
