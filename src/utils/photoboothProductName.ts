/** Libellé affiché côté utilisateur (ne pas utiliser pour ids techniques moduleId, URLs, etc.). */
export const PHOTOBOOTH_PRODUCT_NAME = 'Photobooth/Videobooth connecté';

/** Titre court sur les cartes module (liste applications, essentiels). */
export const PHOTOBOOTH_MODULE_TITLE = 'Photo-Videobooth';

/** Tarif catalogue TTC — borne seule (sans imprimante). */
export const PHOTOBOOTH_PRICE_EUR = 299;

/** Tarif catalogue TTC — pack complet (borne + imprimante + routeur 5G). */
export const PHOTOBOOTH_COMPLETE_PRICE_EUR = 599;

export const PHOTOBOOTH_COMPLETE_PRODUCT_NAME =
  `${PHOTOBOOTH_PRODUCT_NAME} — pack complet (imprimante + routeur)`;

export function isPhotoboothModule(module: { id?: string | number; title?: string | null }): boolean {
  const id = String(module.id ?? '')
    .trim()
    .toLowerCase();
  const title = (module.title ?? '').toLowerCase();
  return id === 'photobooth' || title.includes('photobooth') || title.includes('photo booth');
}

export function getPhotoboothModuleDisplayTitle(module: {
  id?: string | number;
  title?: string | null;
}): string {
  return isPhotoboothModule(module) ? PHOTOBOOTH_MODULE_TITLE : String(module.title ?? '');
}

export const PHOTOBOOTH_SPECS_CONTACT_SUBJECT =
  `Demande de spécifications avant achat d'un ${PHOTOBOOTH_PRODUCT_NAME}`;

export const PHOTOBOOTH_SPECS_CONTACT_HREF = `/contact?subject=${encodeURIComponent(
  PHOTOBOOTH_SPECS_CONTACT_SUBJECT
)}`;
