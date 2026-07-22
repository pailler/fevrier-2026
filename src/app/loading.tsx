/** Fallback Suspense léger — pas de page client qui masque le contenu SSR. */
export default function Loading() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
      aria-hidden="true"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}
