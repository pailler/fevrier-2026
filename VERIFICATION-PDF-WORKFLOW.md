# ✅ Vérification du Workflow PDF

## 📋 État Actuel du Workflow

### **Bouton "Activer l'application PDF+"**
**Page:** `https://iahome.fr/card/pdf`  
**Fichier:** `src/app/card/pdf/page.tsx`

#### Workflow Complet ✅

```
1. Utilisateur visite /card/pdf
   ↓
2. Clique sur "Activer l'application PDF+" (ligne 210-251)
   ↓
3. Vérification authentification (ligne 212-216)
   ↓
4. Appel API POST /api/activate-pdf (ligne 221-230)
   - userId: user.id
   - email: user.email
   ↓
5. API crée entrée dans user_applications
   - module_id: 'pdf'
   - module_title: 'PDF+'
   - is_active: true
   - expires_at: +90 jours
   ↓
6. Affichage message succès (ligne 236)
   "PDF+ activé avec succès ! Vous pouvez maintenant 
   y accéder depuis vos applications. 
   Les tokens seront consommés lors de l'utilisation."
   ↓
7. Redirection vers /encours (ligne 237)
```

### **Architecture Technique**

#### API d'Activation ✅
**Fichier:** `src/app/api/activate-pdf/route.ts`

**Fonctionnalités:**
- ✅ Crée entrée dans `user_applications`
- ✅ Vérifie si déjà activé (retourne succès si oui)
- ✅ Accès de 90 jours (module essentiel)
- ✅ Accès niveau premium
- ✅ Gestion complète d'erreurs
- ✅ Logs détaillés pour debugging

#### Intégration /encours ✅
**Fichier:** `src/app/encours/page.tsx`

**Configuration:**
```typescript
// Ligne 329: Mapping module_id
'1': 'pdf'  // PDF+ -> pdf

// Ligne 346: URL locale
'pdf': 'http://localhost:8080'

// Ligne 380: Coût tokens
'pdf': 10  // 10 tokens par utilisation

// Ligne 551: Module essentiel
const essentialModules = ['metube', 'psitransfer', 'pdf', ...]

// Ligne 1007: Utilise EssentialAccessButton
if (['librespeed', 'metube', 'psitransfer', 'qrcodes', 'pdf', 'meeting-reports', 'cogstudio'].includes(moduleId)) {
  return (
    <EssentialAccessButton
      user={user}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
      // Consomme 10 tokens
      // Génère token d'accès
      // Ouvre https://pdf.iahome.fr?token=xxx
    />
  );
}
```

### **Comparaison avec Autres Modules**

| Module | Bouton Action | API d'Activation | Redirection | Status |
|--------|----------------|-------------------|-------------|--------|
| **PDF** | ✅ `/card/pdf` | ✅ `/api/activate-pdf` | ✅ `/encours` | ✅ OK |
| PsiTransfer | ✅ `/card/psitransfer` | ✅ `/api/activate-psitransfer` | ✅ `/encours` | ✅ OK |
| QR Codes | ✅ `/card/qrcodes` | ✅ `/api/activate-qrcodes` | ✅ `/encours` | ✅ OK |
| MeTube | ✅ Bouton métier | ✅ `/api/activate-metube` | ✅ `/encours` | ✅ OK |
| LibreSpeed | ✅ Bouton métier | ✅ `/api/activate-librespeed-test` | ✅ `/encours` | ✅ OK |

### **Workflow d'Accès à l'Application**

Une fois PDF+ activé et visible dans `/encours`:

```
1. Utilisateur dans /encours
   ↓
2. Clique "🔧 Accéder à PDF+ (10 tokens)"
   ↓
3. EssentialAccessButton :
   - Vérifie solde tokens (≥10 requis)
   - Consomme 10 tokens
   - Génère access token sécurisé
   - Incrémente usage_count
   ↓
4. Ouvre https://pdf.iahome.fr?token=xxx
   ↓
5. PDF.iahome.fr vérifie token via /api/pdf-validate-token
   ↓
6. Application PDF accessible !
```

### **Points de Vérification** ✅

1. ✅ Bouton "Activer" visible sur `/card/pdf`
2. ✅ Vérification authentification avant activation
3. ✅ API `/api/activate-pdf` fonctionnelle
4. ✅ Création entrée dans `user_applications`
5. ✅ Message de succès affiché
6. ✅ Redirection vers `/encours`
7. ✅ Module visible dans `/encours`
8. ✅ Bouton accès dans `/encours`
9. ✅ Consommation tokens (10 tokens)
10. ✅ Génération token d'accès
11. ✅ Ouverture application PDF

### **Messages d'Erreur Potentiels**

**Utilisateur non connecté:**
```
❌ Accès PDF+ - Utilisateur non connecté
→ Redirection vers /login?redirect=/card/pdf
```

**Erreur API:**
```
❌ Erreur activation PDF+: [détails erreur]
→ Alert avec message d'erreur
```

**Tokens insuffisants (après activation):**
```
🪙 Tokens insuffisants pour accéder à PDF+.
Solde actuel: X token(s).
Veuillez acheter des tokens pour continuer.
```

### **Debugging**

Pour vérifier que tout fonctionne, checkez les logs console:

```javascript
// Lors du clic sur le bouton:
console.log('🔄 Activation PDF+ pour:', user.email);

// Si succès:
console.log('✅ PDF+ activé avec succès');

// Si erreur:
console.error('❌ Erreur activation PDF+:', error);
```

**Vérification base de données:**
```sql
SELECT * FROM user_applications 
WHERE module_id = 'pdf' 
AND user_id = 'f5fc0b6a-4369-480a-bd6c-4b8275c0da8c'
AND is_active = true;
```

### **Fichiers Concernés**

1. **Page Card PDF:** `src/app/card/pdf/page.tsx` (lignes 208-265)
2. **API Activation:** `src/app/api/activate-pdf/route.ts`
3. **Page Encours:** `src/app/encours/page.tsx` (lignes 1007-1029)
4. **Composant Accès:** `src/components/EssentialAccessButton.tsx`
5. **API Proxy PDF:** `src/app/api/pdf-proxy/route.ts`

### **Dépannage**

#### Problème: "Page non trouvée" après activation
**Solution:** ✅ Page `/token-generated` créée (workflow alternatif)

#### Problème: Module n'apparaît pas dans /encours
**Vérifier:**
1. `user_applications` contient l'entrée
2. `is_active = true`
3. `expires_at > maintenant`
4. API `/api/check-module-security` retourne succès

#### Problème: Erreur lors de l'accès
**Vérifier:**
1. Utilisateur a assez de tokens (≥10)
2. Token d'accès généré correctement
3. PDF.iahome.fr accessible
4. API validation token fonctionne

---

**Date de vérification:** Aujourd'hui  
**Status:** ✅ TOUT FONCTIONNE CORRECTEMENT  
**Build:** ✅ RÉUSSI  
**Linting:** ✅ AUCUNE ERREUR

