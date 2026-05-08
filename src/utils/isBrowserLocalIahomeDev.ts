/**
 * True quand le site Next est ouvert en dev local (même logique que les URLs Gradio localhost:788x).
 */
export function isBrowserLocalIahomeDev(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}
