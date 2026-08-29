'use client';

import { useRef, useState } from 'react';
import type { CvFormInput } from '@/lib/cvTypes';
import { mergeFormWithImport } from '@/lib/cvTypes';

interface ImportProfileSectionProps {
  form: CvFormInput;
  onImport: (form: CvFormInput, notes: string[]) => void;
  onError: (message: string) => void;
}

export default function ImportProfileSection({
  form,
  onImport,
  onError,
}: ImportProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkedinText, setLinkedinText] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'file' | 'linkedin'>('file');
  const [lastNotes, setLastNotes] = useState<string[]>([]);

  const handleFileImport = async (file: File) => {
    setIsImporting(true);
    onError('');
    setLastNotes([]);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/import-profile', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import échoué');
      const merged = mergeFormWithImport(form, data.form);
      onImport(merged, data.importNotes || []);
      setLastNotes(data.importNotes || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erreur import');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkedinImport = async () => {
    setIsImporting(true);
    onError('');
    setLastNotes([]);
    try {
      const res = await fetch('/api/import-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'linkedin_text',
          text: linkedinText,
          linkedinUrl: linkedinUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import échoué');
      const merged = mergeFormWithImport(form, data.form);
      onImport(merged, data.importNotes || []);
      setLastNotes(data.importNotes || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erreur import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
        <span>📥</span> Importer un profil existant
      </h2>
      <p className="text-xs text-slate-600 mb-4">
        Pré-remplissez le formulaire depuis un CV (PDF, DOCX, TXT) ou le contenu de votre profil LinkedIn.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setImportMode('file')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            importMode === 'file'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          CV / document
        </button>
        <button
          type="button"
          onClick={() => setImportMode('linkedin')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            importMode === 'linkedin'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          LinkedIn
        </button>
      </div>

      {importMode === 'file' ? (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-xl bg-white/80 cursor-pointer hover:bg-white transition-colors">
            <span className="text-2xl mb-1">📎</span>
            <span className="text-sm font-medium text-slate-700">
              {isImporting ? 'Analyse en cours…' : 'Cliquez ou déposez un fichier'}
            </span>
            <span className="text-xs text-slate-500 mt-1">PDF, DOCX ou TXT — max ~10 Mo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={isImporting}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileImport(f);
              }}
            />
          </label>
          <p className="text-xs text-slate-500">
            Astuce : vous pouvez aussi exporter votre profil LinkedIn en PDF (Profil → Plus →
            Enregistrer au format PDF) et l&apos;importer ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              URL LinkedIn (optionnel, référence uniquement)
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/votre-profil"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Contenu du profil LinkedIn *
            </label>
            <textarea
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              rows={6}
              placeholder="Ouvrez votre profil LinkedIn → sélectionnez tout (Ctrl+A) → copiez (Ctrl+C) → collez ici. Incluez expériences, formation, compétences…"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white resize-y"
            />
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            L&apos;import automatique par URL n&apos;est pas possible (LinkedIn bloque l&apos;accès).
            Collez le texte visible de votre profil ou importez l&apos;export PDF LinkedIn.
          </p>
          <button
            type="button"
            onClick={handleLinkedinImport}
            disabled={isImporting || linkedinText.trim().length < 30}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isImporting ? 'Analyse IA…' : 'Analyser le profil LinkedIn'}
          </button>
        </div>
      )}

      {lastNotes.length > 0 && (
        <ul className="mt-3 text-xs text-indigo-800 bg-indigo-100/60 rounded-lg p-3 space-y-1">
          {lastNotes.map((note, i) => (
            <li key={i}>✓ {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
