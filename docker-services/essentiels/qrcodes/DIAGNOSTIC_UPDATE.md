# 🔍 Diagnostic Mise à Jour Supabase

## Problème
La mise à jour de l'URL dans Supabase ne fonctionne pas malgré l'utilisation de `SERVICE_ROLE_KEY`.

## Informations nécessaires pour diagnostiquer

### 1. Vérifier les politiques RLS dans Supabase

Allez sur https://supabase.com → Votre projet → Table Editor → `dynamic_qr_codes` → Onglet "RLS"

**Vérifiez :**
- ✅ RLS est-il activé ou désactivé ?
- ✅ Quelles politiques existent pour UPDATE ?
- ✅ La politique "Allow public update for scans" permet-elle tous les UPDATE ou seulement certains champs ?

**Action recommandée :**
Si RLS est activé, créez une politique spécifique pour permettre l'UPDATE de l'URL :

```sql
CREATE POLICY "Allow UPDATE url with service role"
ON dynamic_qr_codes
FOR UPDATE
USING (true)
WITH CHECK (true);
```

### 2. Tester directement dans Supabase SQL Editor

Exécutez ces requêtes pour tester :

```sql
-- 1. Voir l'URL actuelle
SELECT qr_id, url, updated_at FROM dynamic_qr_codes WHERE qr_id = '021821d8';

-- 2. Tester UPDATE direct
UPDATE dynamic_qr_codes 
SET url = 'https://test-update-direct.com', updated_at = NOW()
WHERE qr_id = '021821d8' AND is_active = true
RETURNING qr_id, url, updated_at;

-- 3. Vérifier que l'UPDATE a fonctionné
SELECT qr_id, url, updated_at FROM dynamic_qr_codes WHERE qr_id = '021821d8';
```

**Si l'UPDATE SQL direct fonctionne** → Le problème est dans le code Python / bibliothèque Supabase
**Si l'UPDATE SQL direct ne fonctionne pas** → Le problème est dans Supabase (RLS / politiques / permissions)

### 3. Vérifier les variables d'environnement

Dans le container Docker :
```powershell
docker-compose exec qrcodes python -c "import os; print('SERVICE_ROLE_KEY:', 'OK' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'MANQUANT'); print('Longueur:', len(os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')))"
```

### 4. Surveiller les logs en temps réel

Lors de la mise à jour, surveillez les logs :
```powershell
docker-compose logs -f qrcodes | Select-String -Pattern "UPDATE|SERVICE_ROLE|URL|Supabase"
```

**Logs à surveiller :**
- `🔑 Clé utilisée: SERVICE_ROLE_KEY` → Doit apparaître
- `✅ UPDATE Méthode 1 exécuté` → L'UPDATE est envoyé
- `📦 URL dans réponse: ...` → L'URL retournée par Supabase
- `❌❌❌ ERREUR UPDATE` → Une erreur s'est produite

### 5. Solutions possibles

#### Solution A: Politique RLS spécifique
Créer une politique UPDATE explicite dans Supabase qui permet tous les UPDATE.

#### Solution B: Utiliser l'API REST PostgREST directement
Contourner la bibliothèque Python Supabase et utiliser `requests` pour appeler l'API REST directement.

#### Solution C: Utiliser une fonction PostgreSQL RPC
Créer une fonction PostgreSQL dans Supabase qui fait l'UPDATE et l'appeler via RPC.

#### Solution D: Désactiver temporairement RLS
Pour tester si RLS est vraiment le problème (⚠️ ne pas laisser en production).

## Cause probable identifiée

D'après le schema SQL (`supabase_schema.sql` ligne 56-57), la politique UPDATE existe mais dit "Allow public update for scans" - elle peut être trop restrictive ou ne pas permettre tous les champs.

**Recommandation immédiate :**
1. Vérifier dans Supabase si cette politique existe
2. La modifier ou créer une nouvelle politique qui permet l'UPDATE de tous les champs
3. Tester avec le SQL direct pour confirmer que l'UPDATE fonctionne



