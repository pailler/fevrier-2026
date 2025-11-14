# Patch pour corriger l'erreur "supabaseKey is required"

## Problème identifié
L'erreur `Uncaught Error: supabaseKey is required` se produit car Next.js remplace `process.env.NEXT_PUBLIC_*` au moment du build. Si ces variables ne sont pas disponibles, elles deviennent `undefined` dans le bundle JavaScript.

## Solution : Patch complet

### 1. Fichier utilitaire centralisé (DÉJÀ CRÉÉ)
✅ `src/utils/supabaseConfig.ts` - Utilitaire avec valeurs par défaut garanties

### 2. Fichiers à vérifier/corriger

Les fichiers suivants doivent utiliser `getSupabaseUrl()` et `getSupabaseAnonKey()` au lieu de `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` :

#### Fichiers déjà corrigés :
- ✅ `src/utils/supabaseService.ts
- ✅ `src/utils/librespeedAccess.ts`
- ✅ `src/utils/moduleSecurityService.ts`
- ✅ `src/app/api/librespeed/route.ts`
- ✅ `src/app/api/check-payment/route.ts`
- ✅ `src/app/api/check-module-activation/route.ts`
- ✅ `src/app/api/increment-usage/route.ts`
- ✅ `src/app/api/activate-whisper/route.ts`
- ✅ `src/app/api/init-user-applications/route.ts`
- ✅ `src/app/api/generate-standard-token/route.ts`
- ✅ `src/app/api/generate-premium-token/route.ts`
- ✅ `src/app/api/activate-metube/route.ts`
- ✅ `src/app/api/activate-hunyuan3d/route.ts`
- ✅ `src/app/api/check-module-security/route.ts`
- ✅ `src/app/api/redirect-psitransfer/route.ts`
- ✅ `src/app/api/metube-redirect/route.ts`
- ✅ `src/app/api/redirect-librespeed/route.ts`
- ✅ `src/app/api/librespeed-auth-check/route.ts`
- ✅ `src/app/api/unified-redirect/route.ts`
- ✅ `src/app/api/psitransfer-proxy/route.ts`
- ✅ `src/app/api/pdf-proxy/route.ts`
- ✅ `src/app/api/check-iahome-session/route.ts`
- ✅ `src/app/api/remote-cursor-access/route.ts`
- ✅ `src/app/api/secure-ruinedfooocus/route.ts`
- ✅ `src/app/api/local-proxy/route.ts`

#### Fichiers restants à vérifier :
- ⚠️ Tous les autres fichiers dans `src/app/api/` qui utilisent `createClient`

### 3. Dockerfile (DÉJÀ CORRIGÉ)
✅ Les variables sont définies comme `ARG` et `ENV` pour être disponibles au build time

### 4. next.config.ts (DÉJÀ CORRIGÉ)
✅ Les valeurs par défaut sont définies dans la section `env`

## Commandes pour appliquer le patch

```powershell
# 1. Reconstruire l'application avec le nouveau build
docker-compose -f docker-compose.prod.yml build iahome-app --no-cache

# 2. Redémarrer le service
docker-compose -f docker-compose.prod.yml up -d iahome-app

# 3. Vérifier que le service fonctionne
docker ps --filter "name=iahome-app"

# 4. Tester l'application
# - Vider le cache du navigateur (Ctrl+Shift+Delete)
# - Faire un hard refresh (Ctrl+F5)
# - Tester https://iahome.fr
```

## Vérification

Pour vérifier que le patch fonctionne :

1. Ouvrir la console du navigateur (F12)
2. Vérifier qu'il n'y a plus l'erreur "supabaseKey is required"
3. Vérifier que l'application fonctionne correctement

## Si le problème persiste

Si l'erreur persiste après avoir vidé le cache, vérifier :

1. Que tous les fichiers utilisent `getSupabaseUrl()` et `getSupabaseAnonKey()`
2. Que le build Docker a bien été fait avec `--no-cache`
3. Que les variables d'environnement sont bien définies dans le Dockerfile





