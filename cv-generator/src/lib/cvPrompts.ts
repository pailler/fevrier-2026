import type { CvFormInput } from './cvTypes';

export function buildCvSystemPrompt(): string {
  return `Tu es un expert en rédaction de CV et en recrutement (marché français et européen).
Tu optimises les CV pour les ATS (Applicant Tracking Systems) et les recruteurs humains.

Règles strictes :
1. Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans commentaire, sans préambule.
2. Langue : français (sauf si le poste cible indique clairement une autre langue).
3. Bullet points : verbes d'action au passé, résultats chiffrés si possible, 3 à 5 bullets par expérience.
4. Résumé professionnel : 2 à 4 phrases percutantes.
5. Compétences : liste de 8 à 15 mots-clés pertinents pour le poste visé.
6. Si une offre d'emploi est fournie, aligne le CV (mots-clés ATS, compétences, titre).
7. atsScore : entier 0-100 estimant la compatibilité ATS avec le poste (100 = excellent).
8. atsTips : 2 à 4 conseils courts pour améliorer le CV.

Structure JSON attendue :
{
  "personalInfo": { "fullName", "email", "phone", "city", "title", "summary" },
  "experiences": [{ "company", "role", "period", "bullets": string[] }],
  "education": [{ "school", "degree", "year" }],
  "skills": string[],
  "languages": [{ "name", "level" }],
  "atsScore": number,
  "atsTips": string[]
}`;
}

export function buildCvUserMessage(form: CvFormInput): string {
  const experiences = form.experiences
    .filter((e) => e.company.trim() || e.role.trim())
    .map(
      (e, i) =>
        `Expérience ${i + 1}:
- Entreprise: ${e.company}
- Poste: ${e.role}
- Période: ${e.startDate} – ${e.endDate || 'Aujourd\'hui'}
- Description brute: ${e.description || '(non renseignée)'}`
    )
    .join('\n\n');

  const education = form.education
    .filter((e) => e.school.trim() || e.degree.trim())
    .map(
      (e, i) =>
        `Formation ${i + 1}: ${e.degree} – ${e.school} (${e.year})`
    )
    .join('\n');

  return `Génère un CV optimisé à partir des informations suivantes :

**Identité**
- Nom: ${form.fullName}
- Email: ${form.email}
- Téléphone: ${form.phone}
- Ville: ${form.city}
- Poste visé: ${form.targetTitle}

**Offre d'emploi / contexte (pour optimisation ATS)**
${form.jobDescription.trim() || '(non fourni — optimiser pour le poste visé)'}

**Expériences**
${experiences || '(aucune expérience renseignée)'}

**Formations**
${education || '(aucune formation renseignée)'}

**Compétences brutes**
${form.skills.trim() || '(à déduire des expériences)'}

**Langues brutes**
${form.languages.trim() || 'Français — langue maternelle'}`;
}

export function buildCoverLetterSystemPrompt(): string {
  return `Tu es un expert en rédaction de lettres de motivation pour le marché français.
Rédige une lettre professionnelle, personnalisée, concise (250-350 mots).
Réponds UNIQUEMENT avec le texte de la lettre, sans objet JSON, sans markdown.`;
}

export function buildCoverLetterUserMessage(
  cvSummary: string,
  targetTitle: string,
  jobDescription: string,
  fullName: string
): string {
  return `Rédige une lettre de motivation pour ${fullName}, postulant au poste de « ${targetTitle} ».

Profil / résumé CV :
${cvSummary}

${jobDescription.trim() ? `Offre d'emploi :\n${jobDescription}` : 'Pas d\'offre détaillée — lettre générique mais professionnelle.'}

Format : formule d'appel, motivation, compétences clés, disponibilité, formule de politesse.`;
}

export function parseCvJson(raw: string): unknown {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Réponse IA invalide : JSON introuvable');
  }
  return JSON.parse(jsonMatch[0]);
}

export function buildImportProfileSystemPrompt(): string {
  return `Tu es un expert en extraction de données de profils professionnels (CV, LinkedIn).
Analyse le texte fourni et extrais les informations structurées pour pré-remplir un formulaire de CV.

Règles :
1. Réponds UNIQUEMENT en JSON valide, sans markdown.
2. Extrais le maximum d'informations présentes ; laisse les champs vides ("") si absents.
3. Pour LinkedIn : repère expériences, formations, compétences, langues, titre headline, localisation.
4. Pour un CV existant : conserve les dates, entreprises et missions.
5. experiences[].description : résumé des missions en texte brut (phrases ou puces concaténées).
6. skills et languages : chaînes avec éléments séparés par des virgules.
7. importNotes : 1 à 3 notes courtes sur ce qui a été trouvé ou manquant.

Structure JSON :
{
  "fullName": "",
  "email": "",
  "phone": "",
  "city": "",
  "targetTitle": "",
  "experiences": [{ "company", "role", "startDate", "endDate", "description" }],
  "education": [{ "school", "degree", "year" }],
  "skills": "",
  "languages": "",
  "importNotes": []
}`;
}

export function buildImportProfileUserMessage(
  rawText: string,
  sourceType: 'cv_file' | 'linkedin_text' | 'raw_text',
  linkedinUrl?: string
): string {
  const sourceLabel =
    sourceType === 'linkedin_text'
      ? 'Profil LinkedIn (texte collé par l\'utilisateur)'
      : sourceType === 'cv_file'
        ? 'CV existant (document importé)'
        : 'Texte libre';

  return `Source : ${sourceLabel}
${linkedinUrl ? `URL LinkedIn (référence) : ${linkedinUrl}\n` : ''}
Extrais les données du texte suivant :

---
${rawText}
---`;
}
