'use client';

import { useState } from 'react';
import CvPreview from '@/components/CvPreview';
import ImportProfileSection from '@/components/ImportProfileSection';
import {
  EMPTY_FORM,
  type CvFormInput,
  type CvTemplate,
  type GeneratedCv,
} from '@/lib/cvTypes';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
    />
  );
}

export default function CvGeneratorPage() {
  const [form, setForm] = useState<CvFormInput>(EMPTY_FORM);
  const [cv, setCv] = useState<GeneratedCv | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [error, setError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'letter'>('form');

  const updateForm = <K extends keyof CvFormInput>(key: K, value: CvFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);
    setCoverLetter(null);
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');
      setCv(data.cv);
      setActiveTab('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!cv) return;
    setIsGeneratingLetter(true);
    setError('');
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cv.personalInfo.fullName,
          targetTitle: cv.personalInfo.title,
          jobDescription: form.jobDescription,
          cvSummary: cv.personalInfo.summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lettre');
      setCoverLetter(data.letter);
      setActiveTab('letter');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="no-print bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span>📄</span> Générateur de CV IA
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Import CV / LinkedIn · CV optimisé ATS · Export PDF
            </p>
          </div>
          <a
            href="https://iahome.fr"
            className="text-sm text-blue-100 hover:text-white underline"
          >
            ← Retour IAHome
          </a>
        </div>
      </header>

      {/* Tabs mobile */}
      <div className="no-print lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 flex">
        {(['form', 'preview', 'letter'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === tab
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-slate-500'
            }`}
          >
            {tab === 'form' ? 'Formulaire' : tab === 'preview' ? 'Aperçu CV' : 'Lettre'}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <section
          className={`no-print space-y-5 ${activeTab !== 'form' ? 'hidden lg:block' : ''}`}
        >
          <ImportProfileSection
            form={form}
            onImport={(merged, notes) => {
              setForm(merged);
              setImportSuccess(
                notes.length > 0
                  ? `Profil importé. ${notes[0]}`
                  : 'Profil importé — vérifiez et complétez le formulaire.'
              );
              setError('');
            }}
            onError={(msg) => {
              setError(msg);
              setImportSuccess('');
            }}
          />

          {importSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3">
              {importSuccess}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations personnelles</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <FieldLabel>Nom complet *</FieldLabel>
                <TextInput
                  value={form.fullName}
                  onChange={(v) => updateForm('fullName', v)}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="jean@email.fr"
                />
              </div>
              <div>
                <FieldLabel>Téléphone</FieldLabel>
                <TextInput
                  value={form.phone}
                  onChange={(v) => updateForm('phone', v)}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <FieldLabel>Ville</FieldLabel>
                <TextInput
                  value={form.city}
                  onChange={(v) => updateForm('city', v)}
                  placeholder="Paris"
                />
              </div>
              <div>
                <FieldLabel>Poste visé *</FieldLabel>
                <TextInput
                  value={form.targetTitle}
                  onChange={(v) => updateForm('targetTitle', v)}
                  placeholder="Développeur Full Stack"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Offre d&apos;emploi (optionnel)</h2>
            <p className="text-xs text-slate-500 mb-3">
              Collez l&apos;annonce pour optimiser le CV aux mots-clés ATS.
            </p>
            <TextArea
              value={form.jobDescription}
              onChange={(v) => updateForm('jobDescription', v)}
              placeholder="Description du poste, compétences recherchées..."
              rows={4}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Expériences</h2>
              <button
                type="button"
                onClick={() =>
                  updateForm('experiences', [
                    ...form.experiences,
                    { company: '', role: '', startDate: '', endDate: '', description: '' },
                  ])
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Ajouter
              </button>
            </div>
            {form.experiences.map((exp, i) => (
              <div key={i} className="mb-4 pb-4 border-b border-slate-100 last:border-0 space-y-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  <TextInput
                    value={exp.company}
                    onChange={(v) => {
                      const next = [...form.experiences];
                      next[i] = { ...next[i], company: v };
                      updateForm('experiences', next);
                    }}
                    placeholder="Entreprise"
                  />
                  <TextInput
                    value={exp.role}
                    onChange={(v) => {
                      const next = [...form.experiences];
                      next[i] = { ...next[i], role: v };
                      updateForm('experiences', next);
                    }}
                    placeholder="Poste"
                  />
                  <TextInput
                    value={exp.startDate}
                    onChange={(v) => {
                      const next = [...form.experiences];
                      next[i] = { ...next[i], startDate: v };
                      updateForm('experiences', next);
                    }}
                    placeholder="Début (ex. 2020)"
                  />
                  <TextInput
                    value={exp.endDate}
                    onChange={(v) => {
                      const next = [...form.experiences];
                      next[i] = { ...next[i], endDate: v };
                      updateForm('experiences', next);
                    }}
                    placeholder="Fin (ou Aujourd'hui)"
                  />
                </div>
                <TextArea
                  value={exp.description}
                  onChange={(v) => {
                    const next = [...form.experiences];
                    next[i] = { ...next[i], description: v };
                    updateForm('experiences', next);
                  }}
                  placeholder="Missions, réalisations, chiffres..."
                  rows={2}
                />
                {form.experiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateForm(
                        'experiences',
                        form.experiences.filter((_, j) => j !== i)
                      )
                    }
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Formation</h2>
              <button
                type="button"
                onClick={() =>
                  updateForm('education', [...form.education, { school: '', degree: '', year: '' }])
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Ajouter
              </button>
            </div>
            {form.education.map((edu, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-2 mb-3">
                <TextInput
                  value={edu.degree}
                  onChange={(v) => {
                    const next = [...form.education];
                    next[i] = { ...next[i], degree: v };
                    updateForm('education', next);
                  }}
                  placeholder="Diplôme"
                />
                <TextInput
                  value={edu.school}
                  onChange={(v) => {
                    const next = [...form.education];
                    next[i] = { ...next[i], school: v };
                    updateForm('education', next);
                  }}
                  placeholder="Établissement"
                />
                <TextInput
                  value={edu.year}
                  onChange={(v) => {
                    const next = [...form.education];
                    next[i] = { ...next[i], year: v };
                    updateForm('education', next);
                  }}
                  placeholder="Année"
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <div>
              <FieldLabel>Compétences (séparées par des virgules)</FieldLabel>
              <TextInput
                value={form.skills}
                onChange={(v) => updateForm('skills', v)}
                placeholder="React, Node.js, gestion de projet..."
              />
            </div>
            <div>
              <FieldLabel>Langues</FieldLabel>
              <TextInput
                value={form.languages}
                onChange={(v) => updateForm('languages', v)}
                placeholder="Français (natif), Anglais (courant)..."
              />
            </div>
            <div>
              <FieldLabel>Modèle visuel</FieldLabel>
              <div className="flex gap-2 mt-1">
                {(['modern', 'classic', 'minimal'] as CvTemplate[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateForm('template', t)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                      form.template === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'modern' ? 'Moderne' : t === 'classic' ? 'Classique' : 'Minimal'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !form.fullName.trim() || !form.targetTitle.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? 'Génération en cours…' : '✨ Générer mon CV avec l\'IA'}
          </button>
        </section>

        {/* Aperçu */}
        <section
          className={`space-y-4 ${activeTab !== 'preview' && activeTab !== 'letter' ? 'hidden lg:block' : ''}`}
        >
          {activeTab === 'letter' && coverLetter ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:shadow-none">
              <h2 className="text-lg font-semibold mb-4 no-print">Lettre de motivation</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-serif">
                {coverLetter}
              </div>
            </div>
          ) : cv ? (
            <>
              {cv.atsScore != null && (
                <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Score ATS estimé</span>
                    <span
                      className={`text-2xl font-bold ${
                        cv.atsScore >= 75
                          ? 'text-green-600'
                          : cv.atsScore >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {cv.atsScore}/100
                    </span>
                  </div>
                  {cv.atsTips && cv.atsTips.length > 0 && (
                    <ul className="mt-2 text-xs text-slate-600 space-y-1">
                      {cv.atsTips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <CvPreview cv={cv} template={form.template} />
              <div className="no-print flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 min-w-[140px] py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900"
                >
                  📥 Exporter en PDF
                </button>
                <button
                  type="button"
                  onClick={handleGenerateLetter}
                  disabled={isGeneratingLetter}
                  className="flex-1 min-w-[140px] py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isGeneratingLetter ? 'Génération…' : '✉️ Lettre de motivation'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 min-w-[140px] py-2.5 border border-blue-600 text-blue-700 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50"
                >
                  🔄 Régénérer
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center text-slate-500">
              <div className="text-4xl mb-3">📄</div>
              <p className="font-medium">Votre CV apparaîtra ici</p>
              <p className="text-sm mt-2">
                Remplissez le formulaire et cliquez sur « Générer mon CV avec l&apos;IA »
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="no-print text-center text-xs text-slate-400 py-6">
        Générateur de CV IA · Propulsé par IAHome · Données non conservées sur nos serveurs
      </footer>
    </div>
  );
}
