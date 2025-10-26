# 🧪 Test du Workflow PDF

## 📍 URL Correcte à Utiliser

### **Route Spécifique PDF** ✅
```
https://iahome.fr/card/pdf
```

Cette route pointe vers `src/app/card/pdf/page.tsx`

### **Code du Bouton** (Ligne 237)
```typescript
if (result.success) {
  console.log('✅ PDF+ activé avec succès');
  alert('PDF+ activé avec succès !');
  router.push('/encours');  // ← Redirection directe
}
```

## 🚨 Routes à Éviter

### **Route Dynamique Générique** ❌
```
https://iahome.fr/card/pdf  (via card/[id])
```

Cette route pointe vers `src/app/card/[id]/page.tsx` et redirige vers `/token-generated`

### **Route token-generated** ⚠️
```
https://iahome.fr/token-generated
```

Cette route est maintenant exclue de la requête Supabase mais peut encore causer des problèmes

## 🔍 Diagnostic

### 1. Vérifier quelle route est utilisée

Dans la console du navigateur, cherchez :
- `🔄 Activation PDF+ pour:` → Route correcte (`/card/pdf`)
- `✅ Token premium généré pour` → Route dynamique (`/card/[id]`)

### 2. Vérifier la redirection

Après le clic sur "Activer", vous devriez voir :
- Alert: "PDF+ activé avec succès !"
- Redirection vers `/encours`
- Module PDF+ visible dans la liste

## ✅ Solution Rapide

Si le problème persiste, ouvrez directement :
```
https://iahome.fr/encours
```

Et cliquez sur "Découvrir nos modules" pour aller à l'application PDF+.

## 🛠️ Chemin Complet

```
1. https://iahome.fr/applications
2. Cliquer sur "PDF+" ou "Applications essentielles"
3. → https://iahome.fr/card/pdf  ✅
4. Cliquer "Activer l'application PDF+"
5. → API /api/activate-pdf ✅
6. → Redirection /encours ✅
7. Module PDF+ visible ✅
```

## ❌ Ce qui ne devrait PAS arriver

```
/card/pdf → /token-generated → Page non trouvée
```

Si c'est ce qui se passe, vérifiez que vous n'accédez pas à PDF via `/card/[id]` au lieu de `/card/pdf`

