'use client';

import { useCallback, useState } from 'react';

const DOC_URL = '/docs/ruinedfooocus-prompt.md';

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code class="rounded bg-indigo-50 px-1 text-indigo-800">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Convertisseur MD minimal (contenu de confiance IAHome) — pas de dépendance lourde. */
function mdToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeBuf: string[] = [];
  let tableBuf: string[] = [];

  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.filter((r) => !/^\|[\s\-|:]+\|$/.test(r.trim()) && !/^\|?\s*-{3,}/.test(r));
    const htmlRows = rows.map((row, idx) => {
      const cells = row
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
      const tag = idx === 0 ? 'th' : 'td';
      const cellClass =
        tag === 'th'
          ? 'border border-gray-200 bg-indigo-50 px-2.5 py-2 text-left font-semibold text-indigo-900'
          : 'border border-gray-200 px-2.5 py-2 align-top';
      return `<tr class="${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}">${cells
        .map((c) => `<${tag} class="${cellClass}">${inline(c)}</${tag}>`)
        .join('')}</tr>`;
    });
    out.push(
      `<div class="my-3 overflow-x-auto rounded-xl border border-gray-200"><table class="w-full border-collapse text-sm"><tbody>${htmlRows.join('')}</tbody></table></div>`
    );
    tableBuf = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        if (tableBuf.length) flushTable();
        inCode = true;
        codeBuf = [];
      } else {
        out.push(
          `<pre class="my-3 overflow-x-auto rounded-xl bg-slate-900 p-3.5 text-xs leading-relaxed text-slate-200"><code>${codeBuf.join('\n')}</code></pre>`
        );
        inCode = false;
        codeBuf = [];
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (line.trim().startsWith('|')) {
      tableBuf.push(line);
      i++;
      continue;
    }
    if (tableBuf.length) flushTable();

    if (/^---+$/.test(line.trim())) {
      out.push('<hr class="my-5 border-gray-200" />');
      i++;
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      const cls =
        level === 1
          ? 'mt-5 mb-3 text-xl font-bold text-gray-900'
          : level === 2
            ? 'mt-6 mb-2.5 text-lg font-bold text-indigo-900'
            : 'mt-4 mb-2 text-base font-semibold text-indigo-950';
      out.push(`<h${level} class="${cls}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    if (line.startsWith('&gt; ')) {
      out.push(
        `<blockquote class="my-3 rounded-r-lg border-l-4 border-indigo-400 bg-indigo-50 px-3 py-2 text-indigo-950">${inline(line.slice(5))}</blockquote>`
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li class="ml-4 list-disc">${inline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul class="my-2 space-y-1">${items.join('')}</ul>`);
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    out.push(`<p class="my-2.5">${inline(line)}</p>`);
    i++;
  }

  if (tableBuf.length) flushTable();
  if (inCode) {
    out.push(
      `<pre class="my-3 overflow-x-auto rounded-xl bg-slate-900 p-3.5 text-xs text-slate-200"><code>${codeBuf.join('\n')}</code></pre>`
    );
  }

  return out.join('\n');
}

/**
 * Guide prompt RuinedFooocus — chargé à la demande (ne grossit pas le bundle ni le HTML initial).
 */
export default function RuinedFooocusPromptGuide() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (html || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(DOC_URL, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setHtml(mdToHtml(text));
    } catch {
      setError('Impossible de charger le guide. Réessayez ou téléchargez le fichier.');
    } finally {
      setLoading(false);
    }
  }, [html, loading]);

  return (
    <div className="mb-12">
      <details
        className="group rounded-2xl border border-indigo-200/80 bg-white/80 shadow-sm transition-shadow open:bg-white open:shadow-md"
        onToggle={(e) => {
          if ((e.target as HTMLDetailsElement).open) void load();
        }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 select-none px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Pièce jointe
            </p>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Guide prompt RuinedFooocus
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Syntaxe réelle (styles inline, planning par steps, pièges A1111) — s’ouvre à la demande
            </p>
          </div>
          <span
            className="shrink-0 text-sm font-medium text-indigo-600 transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▼
          </span>
        </summary>

        <div className="border-t border-indigo-100 px-5 py-4 sm:px-6 sm:pb-6">
          <a
            href={DOC_URL}
            download="ruinedfooocus-prompt.md"
            className="mb-4 inline-flex text-sm font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
          >
            Télécharger le Markdown
          </a>

          {loading && <p className="text-sm text-gray-500">Chargement du guide…</p>}
          {error && (
            <p className="text-sm text-red-600">
              {error}{' '}
              <a href={DOC_URL} className="underline">
                Ouvrir le fichier
              </a>
            </p>
          )}
          {html && (
            <article
              className="max-w-none text-sm leading-relaxed text-gray-800 sm:text-[15px]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </details>
    </div>
  );
}
