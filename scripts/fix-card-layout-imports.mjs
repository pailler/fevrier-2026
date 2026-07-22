import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardDir = path.join(__dirname, '../src/app/card');
const IMPORT = "import { CardPageJsonLd } from '@/components/CardPageJsonLd'\n";

for (const slug of fs.readdirSync(cardDir)) {
  const layoutPath = path.join(cardDir, slug, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) continue;
  let layout = fs.readFileSync(layoutPath, 'utf8');
  if (!layout.includes('CardPageJsonLd') || layout.includes("import { CardPageJsonLd }")) continue;

  if (layout.startsWith("import type { Metadata } from 'next'\n")) {
    layout = layout.replace(
      "import type { Metadata } from 'next'\n",
      `import type { Metadata } from 'next'\n${IMPORT}`
    );
  } else if (layout.includes("import type { Metadata } from 'next';\n")) {
    layout = layout.replace(
      "import type { Metadata } from 'next';\n",
      `import type { Metadata } from 'next';\n${IMPORT}`
    );
  } else {
    layout = IMPORT + layout;
  }

  fs.writeFileSync(layoutPath, layout);
  console.log('import added:', slug);
}
