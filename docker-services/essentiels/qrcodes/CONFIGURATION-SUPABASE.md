# 🔧 Configuration Supabase pour QR Codes Dynamiques

## ⚠️ Problème Actuel

Les variables d'environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY` ne sont pas définies, ce qui empêche la création de QR codes dynamiques.

## 📋 Solution

### Option 1: Créer un fichier .env (Recommandé)

Créez un fichier `.env` à la racine de `docker-services/essentiels/` avec :

```env
SUPABASE_URL=https://votre-projet-id.supabase.co
SUPABASE_ANON_KEY=votre-anon-key-ici
```

### Option 2: Variables d'environnement système

Définissez les variables dans votre système avant de démarrer docker-compose :

**Windows PowerShell:**
```powershell
$env:SUPABASE_URL="https://votre-projet-id.supabase.co"
$env:SUPABASE_ANON_KEY="votre-anon-key-ici"
docker-compose up -d qrcodes
```

**Linux/Mac:**
```bash
export SUPABASE_URL="https://votre-projet-id.supabase.co"
export SUPABASE_ANON_KEY="votre-anon-key-ici"
docker-compose up -d qrcodes
```

### Option 3: Modifier directement docker-compose.yml

Ajoutez les valeurs directement dans `docker-compose.yml` :

```yaml
environment:
  - SUPABASE_URL=https://votre-projet-id.supabase.co
  - SUPABASE_ANON_KEY=votre-anon-key-ici
```

⚠️ **Attention**: Ne commitez jamais les clés Supabase dans le dépôt Git!

## 🔍 Où trouver les valeurs Supabase?

1. Connectez-vous à https://supabase.com
2. Ouvrez votre projet
3. Allez dans **Settings** → **API**
4. Copiez:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

## ✅ Vérification

Après configuration, redémarrez le service:

```bash
docker-compose restart qrcodes
docker logs qrcodes-iahome
```

Vous devriez voir dans les logs:
```
INFO:__main__:Configuration Supabase - URL présente: True, KEY présente: True
```

