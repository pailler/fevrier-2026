'use client';

import type { CvTemplate, GeneratedCv } from '@/lib/cvTypes';

interface CvPreviewProps {
  cv: GeneratedCv;
  template: CvTemplate;
}

export default function CvPreview({ cv, template }: CvPreviewProps) {
  const { personalInfo, experiences, education, skills, languages } = cv;

  const headerClass =
    template === 'modern'
      ? 'bg-slate-800 text-white px-8 py-6'
      : template === 'classic'
        ? 'border-b-4 border-slate-800 px-8 py-6'
        : 'px-8 py-6 border-b border-slate-200';

  const titleClass =
    template === 'modern'
      ? 'text-2xl font-bold tracking-tight'
      : 'text-2xl font-serif font-bold text-slate-900';

  const sectionTitleClass =
    template === 'modern'
      ? 'text-sm font-bold uppercase tracking-wider text-slate-700 border-b-2 border-slate-300 pb-1 mb-3'
      : 'text-sm font-semibold uppercase tracking-wide text-slate-600 mb-2';

  return (
    <div
      id="cv-preview-print"
      className={`bg-white text-slate-900 shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none ${
        template === 'minimal' ? 'font-sans' : template === 'classic' ? 'font-serif' : 'font-sans'
      }`}
    >
      <header className={headerClass}>
        <h1 className={titleClass}>{personalInfo.fullName}</h1>
        <p
          className={`mt-1 text-lg ${
            template === 'modern' ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {personalInfo.title}
        </p>
        <div
          className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm ${
            template === 'modern' ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.city && <span>{personalInfo.city}</span>}
        </div>
      </header>

      <div className="px-8 py-6 space-y-6">
        {personalInfo.summary && (
          <section>
            <h2 className={sectionTitleClass}>Profil</h2>
            <p className="text-sm leading-relaxed text-slate-700">{personalInfo.summary}</p>
          </section>
        )}

        {experiences?.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Expérience professionnelle</h2>
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="font-semibold text-slate-900">{exp.role}</span>
                    <span className="text-sm text-slate-500">{exp.period}</span>
                  </div>
                  <div className="text-sm text-slate-600 italic">{exp.company}</div>
                  {exp.bullets?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-700 space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education?.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Formation</h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold">{edu.degree}</span>
                  <span className="text-slate-600"> — {edu.school}</span>
                  {edu.year && <span className="text-slate-500"> ({edu.year})</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills?.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded print:border print:border-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages?.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Langues</h2>
            <div className="text-sm text-slate-700 space-y-1">
              {languages.map((lang, i) => (
                <div key={i}>
                  <span className="font-medium">{lang.name}</span>
                  {lang.level && <span className="text-slate-500"> — {lang.level}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
