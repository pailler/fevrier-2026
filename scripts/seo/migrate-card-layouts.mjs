#!/usr/bin/env node
/**
 * Réécrit les layout.tsx des fiches /card/* pour utiliser buildToolCardMetadata.
 * Usage: node scripts/seo/migrate-card-layouts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const CARD_TOOL_SLUGS = [
  'administration', 'ai-detector', 'animagine-xl', 'apprendre-autrement', 'birefnet',
  'code-learning', 'comfyui', 'cogstudio', 'florence-2', 'hi3dgen', 'home-assistant',
  'hunyuan3d', 'librespeed', 'meeting-reports', 'metube', 'musetalk', 'photo-vivante',
  'pdf', 'photobooth', 'photomaker', 'prompt-generator', 'cv-generator', 'psitransfer',
  'qrcodes', 'ruinedfooocus', 'sentinelle-numerique', 'stablediffusion', 'voice-isolation',
  'tts', 'vote', 'reveil-intelligent', 'resas-system', 'whisper',
];
const REVEIL_ALIAS_SLUG = 'reveil';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardRoot = path.join(__dirname, '../../src/app/card');

function toLayoutName(slug) {
  return (
    slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Layout'
  );
}

function writeLayout(slug) {
  const dir = path.join(cardRoot, slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const layoutPath = path.join(dir, 'layout.tsx');
  const name = toLayoutName(slug);
  const jsonLdSlug = slug === REVEIL_ALIAS_SLUG ? 'reveil' : slug;
  const content = `import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('${slug}');

export default function ${name}({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="${jsonLdSlug}" />
      {children}
    </>
  );
}
`;
  fs.writeFileSync(layoutPath, content, 'utf8');
  console.log(`✓ ${layoutPath}`);
}

for (const slug of CARD_TOOL_SLUGS) {
  writeLayout(slug);
}
writeLayout(REVEIL_ALIAS_SLUG);

console.log(`\n${CARD_TOOL_SLUGS.length + 1} layouts mis à jour.`);
