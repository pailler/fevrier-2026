# Intégration de Voice Isolation dans l'application IAHome

## ✅ Fichiers créés/modifiés

### 1. Script SQL pour la base de données
- **Fichier**: `scripts/add-voice-isolation-module.sql`
- **Action**: À exécuter dans Supabase SQL Editor pour ajouter le module à la table `modules`

### 2. Page détaillée
- **Fichier**: `src/app/card/voice-isolation/page.tsx`
- **URL**: `/card/voice-isolation`
- **Fonctionnalités**:
  - Affichage des détails du module
  - Bouton d'activation avec ModuleActivationButton
  - Vérification de l'état d'activation
  - SEO optimisé avec JSON-LD

### 3. Layout
- **Fichier**: `src/app/card/voice-isolation/layout.tsx`
- **Fonctionnalités**: Metadata SEO pour la page

### 4. Composant d'accès
- **Fichier**: `src/components/VoiceIsolationAccessButton.tsx`
- **Fonctionnalités**: 
  - Vérification des tokens (100 tokens requis)
  - Consommation des tokens
  - Ouverture de l'application dans un nouvel onglet

### 5. ModuleCard (page /applications)
- **Fichier**: `src/components/ModuleCard-simple.tsx`
- **Modifications**:
  - Ajout de l'image pour voice-isolation
  - Ajout du mapping d'affichage

### 6. Page /encours
- **Fichier**: `src/app/encours/page.tsx`
- **Modifications**:
  - Ajout du mapping `voice-isolation` dans `getModuleUrl()`
  - Ajout du coût (100 tokens) dans `getModuleCost()`
  - Ajout du bouton d'accès spécialisé `VoiceIsolationAccessButton`
  - Import du composant

### 7. Admin Applications
- **Fichier**: `src/app/admin/applications/page.tsx`
- **Modifications**:
  - Ajout de l'icône 🎤 pour voice-isolation dans `getApplicationIcon()`

### 8. Health Check Admin
- **Fichier**: `src/app/api/admin/applications/check-health/route.ts`
- **Modifications**:
  - Ajout de l'URL de production pour voice-isolation

## 📋 Prochaines étapes

### 1. Exécuter le script SQL
Exécuter le script `scripts/add-voice-isolation-module.sql` dans Supabase SQL Editor pour ajouter l'entrée dans la table `modules`.

### 2. Vérifier l'image
S'assurer qu'une image `/public/images/voice-isolation.jpg` existe pour l'affichage dans les cartes.

### 3. Tester le workflow
1. Aller sur `/applications` → La carte Voice Isolation doit apparaître
2. Cliquer sur la carte → Redirige vers `/card/voice-isolation`
3. Cliquer sur "Activer" → Consomme 100 tokens et crée une entrée dans `user_applications`
4. Aller sur `/encours` → L'application doit apparaître avec le bouton d'accès
5. Cliquer sur "Accéder" → Ouvre l'application Voice Isolation

## 🎯 Fonctionnalités implémentées

- ✅ Carte dans `/applications`
- ✅ Page détaillée `/card/voice-isolation`
- ✅ Bouton d'activation (100 tokens)
- ✅ Intégration dans `/encours` avec bouton d'accès
- ✅ Support dans l'admin (icône et health check)
- ✅ Gestion des tokens (consommation à l'accès)
- ✅ Vérification de l'activation

## 🔧 Configuration

- **Coût**: 100 tokens par utilisation
- **URL locale**: `http://localhost:8100`
- **URL production**: `https://iahome.fr/voice-isolation` (via proxy Next.js)
- **Module ID**: `voice-isolation`
- **Catégorie**: `IA Audio`

## 📝 Notes

- L'API `/api/activate-module` est générique et fonctionne avec tous les modules, y compris voice-isolation
- Le composant `VoiceIsolationAccessButton` consomme les tokens à chaque accès (pas à l'activation)
- L'activation crée une entrée dans `user_applications` avec expiration de 30 jours
- Le service Voice Isolation doit être démarré via Docker pour que l'accès fonctionne
