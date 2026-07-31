/**
 * iOS Safari (et autres navigateurs) bloquent souvent window.open() s'il n'est pas
 * déclenché de façon synchrone dans le geste utilisateur. Les handlers async qui font
 * await fetch() puis window.open() donnent l'impression que « le bouton ne fait rien ».
 *
 * Pattern : ouvrir immédiatement un onglet about:blank au tap/clic, puis y assigner
 * l'URL finale une fois le token récupéré.
 *
 * Sur iPhone / iPad (dont iPadOS « site bureau » : UA Macintosh + touch), les nouvelles
 * fenêtres restent souvent bugguées : on évite la popup et on fait un assign dans l'onglet
 * courant après le fetch — ce que WebKit autorise sans geste résiduel.
 */

export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  const maxTouch = typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints : 0;
  if (maxTouch > 1 && /Macintosh/i.test(ua)) return true;
  return false;
}

export function openUserGesturePopup(): Window | null {
  if (typeof window === 'undefined') return null;
  if (isAppleTouchDevice()) {
    return null;
  }
  try {
    const w = window.open('about:blank', '_blank');
    if (w) {
      try {
        w.opener = null;
      } catch {
        /* */
      }
      try {
        w.document.open();
        w.document.write(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IAHome</title></head><body style="margin:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;color:#475569;font-size:1rem">Chargement…</body></html>'
        );
        w.document.close();
      } catch {
        /* certains navigateurs restreignent write sur about:blank */
      }
    }
    return w;
  } catch {
    return null;
  }
}

export function navigateUserGesturePopup(popup: Window | null, url: string): void {
  if (typeof window === 'undefined') return;
  if (popup && !popup.closed) {
    try {
      popup.location.replace(url);
      return;
    } catch {
      try {
        popup.location.href = url;
        return;
      } catch {
        /* */
      }
    }
  }
  window.location.assign(url);
}

export function closeUserGesturePopup(popup: Window | null): void {
  if (!popup || popup.closed) return;
  try {
    popup.close();
  } catch {
    /* */
  }
}
