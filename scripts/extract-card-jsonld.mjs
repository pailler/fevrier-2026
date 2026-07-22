import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardDir = path.join(__dirname, '../src/app/card');
const repoRoot = path.join(__dirname, '..');

function readGitFile(relativePath) {
  const r = spawnSync('git', ['show', `HEAD:${relativePath.replace(/\\/g, '/')}`], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (r.status !== 0) return null;
  return r.stdout;
}

function loadCardSource(slug) {
  const candidates = [
    path.join(cardDir, slug, 'CardInteractive.tsx'),
    path.join(cardDir, slug, 'page.tsx'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('softwareApplicationSchema')) return c;
    }
  }
  return readGitFile(`src/app/card/${slug}/page.tsx`);
}

function extractBlock(content, varName) {
  const start = content.indexOf(`const ${varName} = `);
  if (start === -1) return null;
  const braceStart = content.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    if (depth === 0) {
      return content.slice(braceStart, i + 1);
    }
  }
  return null;
}

function parseSchema(block) {
  if (!block) return null;
  try {
    return new Function(`return ${block}`)();
  } catch {
    return null;
  }
}

const slugs = fs.readdirSync(cardDir).filter((d) => {
  const dirPath = path.join(cardDir, d);
  if (!fs.statSync(dirPath).isDirectory()) return false;
  return (
    fs.existsSync(path.join(dirPath, 'CardInteractive.tsx')) ||
    fs.existsSync(path.join(dirPath, 'page.tsx'))
  );
});

const out = {};

for (const slug of slugs.sort()) {
  const content = loadCardSource(slug);
  if (!content || !content.includes('softwareApplicationSchema')) {
    out[slug] = null;
    continue;
  }
  const swBlock = extractBlock(content, 'softwareApplicationSchema');
  const faqBlock = extractBlock(content, 'faqSchema');
  const sw = parseSchema(swBlock);
  const faq = parseSchema(faqBlock);

  const priceRaw = sw?.offers?.price;
  const priceTokens =
    sw?.offers?.priceCurrency === 'TOKENS' && priceRaw != null ? Number(priceRaw) : undefined;
  const priceEur =
    sw?.offers?.priceCurrency === 'EUR' && priceRaw != null ? Number(priceRaw) : undefined;

  out[slug] = {
    slug,
    name: sw?.name ?? slug,
    description: sw?.description ?? '',
    applicationCategory: sw?.applicationCategory,
    priceTokens,
    priceEur,
    features: sw?.featureList ?? [],
    faqs: (faq?.mainEntity ?? []).map((q) => ({
      question: q.name,
      answer: q.acceptedAnswer?.text ?? '',
    })),
  };
}

const ts = `// Généré par scripts/extract-card-jsonld.mjs — ne pas éditer à la main
import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';

export type CardSeoEntry = {
  product: CardProductInput;
  faqs?: FaqPair[];
};

export const cardSeoData: Record<string, CardSeoEntry | null> = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(out).map(([slug, data]) => {
      if (!data) return [slug, null];
      const product = {
        slug: data.slug,
        name: data.name,
        description: data.description,
        ...(data.applicationCategory ? { applicationCategory: data.applicationCategory } : {}),
        ...(data.priceTokens != null ? { priceTokens: data.priceTokens } : {}),
        ...(data.features?.length ? { features: data.features } : {}),
      };
      const entry = {
        product,
        ...(data.faqs?.length ? { faqs: data.faqs } : {}),
      };
      return [slug, entry];
    })
  ),
  null,
  2
)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/card-seo/generated.ts'), ts);
console.log('Written src/data/card-seo/generated.ts');
console.log(
  'With JSON-LD:',
  Object.values(out).filter(Boolean).length,
  '/ Without:',
  Object.values(out).filter((v) => !v).length
);
