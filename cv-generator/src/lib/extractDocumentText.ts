import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const data = await pdfParse(buffer, { max: 0 });
    const text = (data.text || '').trim();
    if (!text) {
      throw new Error(
        'Impossible d\'extraire le texte de ce PDF. Utilisez un PDF avec texte sélectionnable (pas une simple scan).'
      );
    }
    return text;
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    if (!text) {
      throw new Error('Fichier DOCX vide ou illisible.');
    }
    return text;
  }

  if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    throw new Error('Format .doc non supporté. Convertissez en .docx ou .pdf.');
  }

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return buffer.toString('utf-8').trim();
  }

  throw new Error('Format non supporté. Utilisez PDF, DOCX ou TXT.');
}

export function truncateForLlm(text: string, maxChars = 14000): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n\n[… contenu tronqué …]`;
}
