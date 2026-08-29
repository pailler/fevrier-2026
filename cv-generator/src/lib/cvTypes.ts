export type CvTemplate = 'modern' | 'classic' | 'minimal';

export interface ExperienceInput {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationInput {
  school: string;
  degree: string;
  year: string;
}

export interface CvFormInput {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  targetTitle: string;
  jobDescription: string;
  experiences: ExperienceInput[];
  education: EducationInput[];
  skills: string;
  languages: string;
  template: CvTemplate;
}

export interface CvExperience {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface CvEducation {
  school: string;
  degree: string;
  year: string;
}

export interface CvLanguage {
  name: string;
  level: string;
}

export interface GeneratedCv {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    title: string;
    summary: string;
  };
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  languages: CvLanguage[];
  atsScore?: number;
  atsTips?: string[];
}

export const EMPTY_FORM: CvFormInput = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  targetTitle: '',
  jobDescription: '',
  experiences: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
  education: [{ school: '', degree: '', year: '' }],
  skills: '',
  languages: '',
  template: 'modern',
};

/** Fusionne les données importées dans le formulaire existant (sans écraser le template). */
export function mergeFormWithImport(
  current: CvFormInput,
  imported: Partial<CvFormInput>
): CvFormInput {
  const experiences =
    imported.experiences && imported.experiences.length > 0
      ? imported.experiences
      : current.experiences;
  const education =
    imported.education && imported.education.length > 0
      ? imported.education
      : current.education;

  return {
    ...current,
    fullName: imported.fullName?.trim() || current.fullName,
    email: imported.email?.trim() || current.email,
    phone: imported.phone?.trim() || current.phone,
    city: imported.city?.trim() || current.city,
    targetTitle: imported.targetTitle?.trim() || current.targetTitle,
    experiences,
    education,
    skills: imported.skills?.trim() || current.skills,
    languages: imported.languages?.trim() || current.languages,
  };
}

export type ImportSourceType = 'cv_file' | 'linkedin_text' | 'raw_text';

export interface ImportProfileResult {
  form: Partial<CvFormInput>;
  importNotes?: string[];
  sourceType: ImportSourceType;
}
