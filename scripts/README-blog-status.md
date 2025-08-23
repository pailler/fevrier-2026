# Ajout du champ Status aux Articles de Blog

## Vue d'ensemble

Cette mise à jour ajoute un champ `status` aux articles de blog pour permettre de gérer les articles en mode brouillon ou publié.

## Changements apportés

### 1. Base de données
- Ajout d'une colonne `status` de type TEXT avec contrainte CHECK
- Migration des données existantes depuis `is_published` vers `status`
- Ajout d'un index pour optimiser les performances

### 2. Interface Admin (`/admin/blog`)
- Ajout d'un champ de sélection du statut dans le formulaire d'édition
- Nouvelle colonne "Statut" dans le tableau des articles
- Boutons de basculement rapide du statut (Publier/Brouillon)
- Filtres par statut (Tous, Publiés, Brouillons)
- Indicateurs visuels colorés pour les statuts

### 3. Pages publiques
- Mise à jour de la page blog publique pour ne montrer que les articles publiés
- Mise à jour de la page d'article individuel pour vérifier le statut
- Mise à jour de l'API chat pour utiliser le nouveau champ

### 4. Interface Admin principale
- Mise à jour des statistiques pour utiliser le nouveau champ status
- Mise à jour de l'affichage des statuts dans le tableau de bord

## Migration

### Étape 1 : Exécuter le script de migration
1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Copiez-collez le contenu du fichier `migrate-blog-status.sql`
4. Exécutez le script

### Étape 2 : Vérifier la migration
Le script affichera un résumé des articles par statut :
```sql
SELECT status, COUNT(*) as count FROM blog_articles GROUP BY status;
```

### Étape 3 : Tester les fonctionnalités
1. Testez l'interface admin du blog
2. Créez un nouvel article en mode brouillon
3. Publiez l'article
4. Vérifiez qu'il n'apparaît pas sur le blog public tant qu'il n'est pas publié

## Structure du champ Status

- **Valeurs possibles** : `'draft'` ou `'published'`
- **Valeur par défaut** : `'draft'`
- **Contrainte** : CHECK (status IN ('draft', 'published'))

## Fonctionnalités ajoutées

### Interface Admin
- ✅ Sélection du statut lors de la création/modification d'articles
- ✅ Affichage visuel du statut avec badges colorés
- ✅ Boutons de basculement rapide du statut
- ✅ Filtres par statut
- ✅ Compteurs d'articles par statut

### Sécurité
- ✅ Les articles en brouillon ne sont pas visibles sur le blog public
- ✅ Vérification du statut lors de l'accès aux articles individuels
- ✅ API mise à jour pour ne retourner que les articles publiés

## Fichiers modifiés

- `src/app/admin/blog/page.tsx` - Interface admin principale
- `src/app/blog/page.tsx` - Page blog publique
- `src/app/blog/[slug]/page.tsx` - Page article individuel
- `src/app/admin/page.tsx` - Dashboard admin
- `src/app/api/chat/route.ts` - API chat
- `scripts/migrate-blog-status.sql` - Script de migration
- `scripts/migrate-blog-status.ps1` - Script PowerShell d'aide

## Notes importantes

1. **Rétrocompatibilité** : L'ancien champ `is_published` est conservé temporairement
2. **Migration automatique** : Les articles existants avec `is_published=true` auront `status='published'`
3. **Performance** : Un index a été ajouté sur la colonne `status`
4. **Validation** : Une contrainte CHECK empêche les valeurs invalides

## Prochaines étapes (optionnelles)

1. Supprimer l'ancienne colonne `is_published` après vérification
2. Ajouter des notifications lors des changements de statut
3. Ajouter un historique des changements de statut
4. Ajouter des permissions granulaires pour la publication
