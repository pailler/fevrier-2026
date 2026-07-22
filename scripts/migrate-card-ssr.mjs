import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardDir = path.join(__dirname, '../src/app/card');

const SKIP = new Set(['[id]']);

function patchInteractive(content, slug) {
  let out = content;

  if (!out.includes('CardModuleData')) {
    out = out.replace(
      /^('use client';\n)/,
      "$1import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';\n"
    );
    if (!out.includes('CardModuleData')) {
      out = `import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';\n` + out;
    }
  }

  // default export → props initialModule
  out = out.replace(
    /export default function (\w+)\(([^)]*)\)/,
    (match, name, params) => {
      if (params.includes('initialModule')) return match;
      return `export default function ${name}({ initialModule }: CardInteractiveProps)`;
    }
  );

  // useState<Card | null>(null) or useState<any>(null) for card
  out = out.replace(
    /const \[card, setCard\] = useState(?:<[^>]+>)?\(null\);/g,
    'const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);'
  );

  // loading state — only bump when card fetch pattern exists
  if (out.includes('setCard') && out.includes('from(\'modules\')')) {
    out = out.replace(
      /const \[loading, setLoading\] = useState\(false\);/,
      'const [loading, setLoading] = useState(!initialModule);'
    );
    out = out.replace(
      /const \[loading, setLoading\] = useState\(true\);/,
      'const [loading, setLoading] = useState(!initialModule);'
    );
  }

  // Skip client fetch when SSR data present
  const fetchMarker = "from('modules')";
  if (out.includes(fetchMarker) && !out.includes('if (initialModule)')) {
    out = out.replace(
      /(useEffect\(\(\) => \{\s*\n\s*const fetchCardDetails = async \(\) => \{\s*\n\s*try \{)/,
      `$1\n        if (initialModule) {\n          setCard(initialModule);\n          setLoading(false);\n          return;\n        }`
    );
    out = out.replace(
      /(useEffect\(\(\) => \{\s*\n\s*const fetchCardDetails = async \(\) => \{\s*\n)/,
      `$1      if (initialModule) {\n        setCard(initialModule);\n        setLoading(false);\n        return;\n      }\n`
    );
  }

  // pdf/metube style: useEffect that only setCard(localModule)
  if (out.includes('setCard(pdfModule)') || out.includes('setCard(metubeModule)') || out.includes('setCard(psitransferModule)')) {
    out = out.replace(
      /useEffect\(\(\) => \{\s*\n\s*setCard\((\w+Module)\);\s*\n\s*setLoading\(false\);\s*\n\s*\}, \[\]\);/,
      `useEffect(() => {\n    if (initialModule) {\n      setCard(initialModule);\n      setLoading(false);\n      return;\n    }\n    setCard($1);\n    setLoading(false);\n  }, [initialModule]);`
    );
  }

  return out;
}

const serverPage = (slug) => `import { getCardModuleServer } from '@/utils/getCardModuleServer';
import CardInteractive from './CardInteractive';

export const revalidate = 3600;

export default async function CardPage() {
  const initialModule = await getCardModuleServer('${slug}');
  return <CardInteractive initialModule={initialModule} />;
}
`;

let migrated = 0;

for (const slug of fs.readdirSync(cardDir)) {
  if (SKIP.has(slug)) continue;
  const dir = path.join(cardDir, slug);
  if (!fs.statSync(dir).isDirectory()) continue;

  const pagePath = path.join(dir, 'page.tsx');
  const interactivePath = path.join(dir, 'CardInteractive.tsx');

  if (!fs.existsSync(pagePath)) continue;

  if (fs.existsSync(interactivePath)) {
    // Déjà scindé : mettre à jour uniquement page.tsx serveur si besoin
    const existingPage = fs.readFileSync(pagePath, 'utf8');
    if (!existingPage.includes('getCardModuleServer')) {
      fs.unlinkSync(pagePath);
      fs.writeFileSync(pagePath, serverPage(slug));
      console.log('server page updated:', slug);
    }
    continue;
  }

  const content = fs.readFileSync(pagePath, 'utf8');
  if (!content.startsWith("'use client'")) {
    console.log('skip (not client):', slug);
    continue;
  }

  const patched = patchInteractive(content, slug);
  fs.writeFileSync(interactivePath, patched);
  try {
    fs.unlinkSync(pagePath);
  } catch {
    /* ignore */
  }
  fs.writeFileSync(pagePath, serverPage(slug));
  migrated++;
  console.log('migrated:', slug);
}

console.log(`Done. Migrated ${migrated} card pages.`);
