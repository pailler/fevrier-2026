/**
 * Liste des emails administrateurs (partagée client/serveur, sans dépendance Supabase).
 * Utilisée pour : callback OAuth, useCustomAuth, sessionDurationCheck, Header, etc.
 */
export const ADMIN_EMAILS: string[] = [
  'formateur_tic@hotmail.com',
  'regispailler@gmail.com',
];

export function isAdminEmail(email: string | undefined | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
