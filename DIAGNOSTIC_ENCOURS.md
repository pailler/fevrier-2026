# 🔍 Diagnostic : Page /encours ne se charge pas

## Problème
La page `https://iahome.fr/encours` ne se charge pas.

## Causes possibles

### 1. Problème d'authentification
- Le hook `useCustomAuth` reste en état `loading: true`
- L'utilisateur n'est pas authentifié et la redirection vers `/login` bloque

### 2. Erreur dans les appels API
- `fetchTokenData()` échoue silencieusement
- `fetchUserModules()` échoue avec une erreur non gérée

### 3. Problème de dépendances circulaires
- `useEffect` avec `fetchTokenData` dans les dépendances peut causer des boucles infinies

### 4. Problème avec Supabase Realtime
- L'abonnement Realtime bloque le rendu

## Solutions

### Solution 1 : Vérifier l'authentification
```typescript
// Dans encours/page.tsx, ligne 58-73
// Ajouter un timeout pour éviter un chargement infini
useEffect(() => {
  if (authLoading) {
    const timeout = setTimeout(() => {
      console.error('⚠️ Authentification prend trop de temps');
      setLoading(false);
    }, 10000); // 10 secondes max
    
    return () => clearTimeout(timeout);
  }
  
  // ... reste du code
}, [authLoading]);
```

### Solution 2 : Gérer les erreurs silencieuses
```typescript
// Dans fetchTokenData, ligne 119-145
try {
  // ... code existant
} catch (error) {
  console.error('❌ fetchTokenData: Erreur chargement tokens:', error);
  // Ne pas bloquer le rendu si les tokens échouent
  setTokenBalance(0);
  setTokenHistory([]);
} finally {
  setLoadingTokens(false);
}
```

### Solution 3 : Nettoyer les dépendances useEffect
```typescript
// Ligne 148-191, problème potentiel avec fetchTokenData dans les dépendances
useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel(`token_usage:${user.id}`)
    // ... reste du code

  // ⚠️ PROBLÈME : fetchTokenData est dans les dépendances
  // Mais fetchTokenData est créé avec useCallback qui dépend de user?.id
  // Cela peut causer des re-renders infinis

  return () => {
    clearInterval(pollingInterval);
    supabase.removeChannel(channel);
  };
}, [user?.id]); // ✅ Retirer fetchTokenData des dépendances
```

### Solution 4 : Ajouter une protection contre les erreurs non gérées
```typescript
// Dans fetchUserModules, ligne 194-363
try {
  // ... code existant
} catch (error) {
  console.error('❌ fetchUserModules: Erreur:', error);
  setError(`Erreur lors du chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  setUserModules([]); // ✅ Toujours définir un tableau vide
  setLoading(false); // ✅ Toujours arrêter le chargement
} finally {
  setLoading(false); // ✅ S'assurer que loading est toujours false
}
```

## Commandes de diagnostic

### 1. Vérifier les logs du serveur
```bash
npm run dev
# Regarder les logs dans la console pour des erreurs
```

### 2. Vérifier dans le navigateur
- Ouvrir la console du navigateur (F12)
- Regarder les erreurs réseau (onglet Network)
- Regarder les erreurs JavaScript (onglet Console)

### 3. Tester l'API directement
```bash
# Tester l'API user-tokens-simple
curl http://localhost:3000/api/user-tokens-simple?userId=USER_ID
```

## Corrections recommandées

1. ✅ Ajouter des timeouts pour éviter les chargements infinis
2. ✅ Gérer toutes les erreurs silencieuses
3. ✅ Nettoyer les dépendances useEffect
4. ✅ Ajouter un état d'erreur visible pour l'utilisateur
5. ✅ S'assurer que `loading` est toujours mis à `false` dans un `finally`

## Test après correction

1. Redémarrer le serveur : `npm run dev`
2. Visiter `http://localhost:3000/encours`
3. Vérifier la console pour des erreurs
4. Vérifier que la page se charge correctement

