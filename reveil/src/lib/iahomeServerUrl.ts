/** URL iahome pour les appels serveur (proxy auth/sync). */
export function getIahomeServerUrl(): string {
  if (process.env.IAHOME_INTERNAL_URL) {
    return process.env.IAHOME_INTERNAL_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_IAHOME_URL) {
    return process.env.NEXT_PUBLIC_IAHOME_URL.replace(/\/$/, '');
  }
  return 'https://iahome.fr';
}
