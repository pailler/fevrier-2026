import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';

export const whisperCardSeo = {
  product: {
    slug: 'whisper',
    name: 'Whisper IA - IA Home',
    description:
      'Whisper IA transforme vos fichiers audio, vidéo et images en texte avec OpenAI Whisper et Tesseract OCR. Transcription multilingue, sous-titres, OCR sur images et PDF.',
    priceTokens: 100,
    features: [
      'Transcription audio de haute qualité',
      'Transcription vidéo avec horodatage',
      'Reconnaissance de texte (OCR) sur images',
      'Support multilingue (50+ langues)',
      'Interface moderne et intuitive',
      'Confidentialité garantie',
    ],
  } satisfies CardProductInput,
  faqs: [
    {
      question: "Qu'est-ce que Whisper IA ?",
      answer:
        "Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte. Basée sur OpenAI Whisper et Tesseract OCR, elle couvre transcription et reconnaissance de texte.",
    },
    {
      question: 'Comment utiliser Whisper IA ?',
      answer:
        "Accédez au service avec 100 crédits via whisper.iahome.fr. Uploadez vos fichiers audio, vidéo ou images, sélectionnez la langue si nécessaire, et téléchargez la transcription générée.",
    },
    {
      question: 'Quels types de fichiers Whisper IA peut-il traiter ?',
      answer:
        'Audio (MP3, WAV, M4A), vidéo (MP4, AVI, MOV) et images/PDF (JPG, PNG, PDF) pour transcription ou OCR.',
    },
    {
      question: 'Whisper IA est-il gratuit ?',
      answer:
        "L'accès coûte 100 crédits par session. Toutes les fonctionnalités (transcription, OCR, multilingue) sont incluses sans frais supplémentaires.",
    },
    {
      question: 'Quelles langues sont supportées par Whisper IA ?',
      answer:
        "Plus de 50 langues pour l'audio/vidéo. L'OCR est optimisé pour le français et l'anglais, avec support étendu pour d'autres langues européennes.",
    },
    {
      question: 'Quelle est la précision de Whisper IA ?',
      answer:
        "Les modèles OpenAI Whisper offrent une transcription précise, même en conditions difficiles. Tesseract OCR extrait le texte des images et documents numérisés avec une grande fiabilité.",
    },
    {
      question: 'Pour qui est fait Whisper IA ?',
      answer:
        'Professionnels (réunions, interviews), étudiants (cours enregistrés), créateurs de contenu (sous-titres) et toute personne devant convertir du multimédia en texte éditable.',
    },
  ] satisfies FaqPair[],
};
