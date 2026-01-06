// Fonction pour détecter si une erreur est due à un problème réseau
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  const errorMessage = error?.message || error?.toString() || '';
  const errorName = error?.name || '';
  
  return (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('ERR_FAILED') ||
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorMessage.includes('ERR_NETWORK_CHANGED') ||
    errorMessage.includes('CORS') ||
    errorName === 'NetworkError' ||
    (errorName === 'TypeError' && errorMessage.includes('fetch'))
  );
}

// Fonction pour faire un fetch avec gestion d'erreurs et retry
export async function safeApiFetchJson<T = any>(
  url: string,
  options: RequestInit = {},
  retries: number = 2,
  timeout: number = 10000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Essayer de parser le JSON de l'erreur
          let errorData: any = {};
          try {
            const text = await response.text();
            if (text) {
              errorData = JSON.parse(text);
            }
          } catch {
            // Si le parsing échoue, utiliser le texte brut
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }

          // Si c'est une erreur HTTP (4xx, 5xx), ne pas réessayer
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
          }

          // Pour les erreurs 5xx, réessayer si on a encore des tentatives
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
        }

        // Parser la réponse JSON
        const data = await response.json();
        return data as T;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Si c'est une erreur d'abort (timeout), la traiter comme une erreur réseau
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: La requête a pris trop de temps');
        }

        throw fetchError;
      }
    } catch (error: any) {
      lastError = error;

      // Si c'est une erreur réseau et qu'on a encore des tentatives, réessayer
      if (isNetworkError(error) && attempt < retries) {
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Si ce n'est pas une erreur réseau ou qu'on n'a plus de tentatives, propager l'erreur
      if (!isNetworkError(error) || attempt >= retries) {
        throw error;
      }
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  throw lastError || new Error('Erreur inconnue lors de la requête');
}
