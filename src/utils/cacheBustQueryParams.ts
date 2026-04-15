/**
 * Paramètres ajoutés historiquement par ClientRedirectHandler pour forcer un reload.
 * À retirer des URL (middleware 308 + replaceState) pour limiter les doublons / « pages avec redirection » en GSC.
 */
export const CACHE_BUST_QUERY_KEYS = [
  '_v',
  '_h',
  '_cb',
  '_force',
  '_clear',
  '_radical',
] as const

export type CacheBustQueryKey = (typeof CACHE_BUST_QUERY_KEYS)[number]
