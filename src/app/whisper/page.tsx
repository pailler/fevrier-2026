import { readFileSync } from 'fs';
import { join } from 'path';

export default function WhisperPage() {
  // Lire le fichier HTML de l'interface Whisper
  const htmlContent = readFileSync(join(process.cwd(), 'essentiels/whisper-webui/index.html'), 'utf-8');
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}