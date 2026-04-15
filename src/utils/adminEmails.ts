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

/**
 * Destinataires de l’alerte « nouvel utilisateur » (Resend).
 * Surcharge optionnelle : ADMIN_SIGNUP_NOTIFICATION_EMAILS=un@x.fr;autre@y.fr
 */
export function getAdminSignupNotificationRecipients(): string[] {
  const raw = process.env.ADMIN_SIGNUP_NOTIFICATION_EMAILS?.trim();
  if (raw) {
    return raw
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean);
  }
  return [...ADMIN_EMAILS];
}
