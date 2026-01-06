# 📦 Copier le dossier immo sur le NAS

## Méthode 1 : Copie complète du dossier (Recommandé)

### Windows (WinSCP ou FileZilla)

1. Ouvrir WinSCP ou FileZilla
2. Se connecter au NAS : `192.168.1.130`
3. Naviguer vers `/volume1/docker/`
4. Copier le dossier `immo/` complet depuis votre machine locale vers `/volume1/docker/immo/`

### Windows (PowerShell)

```powershell
# Depuis le dossier iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

### Linux/Mac (Bash)

```bash
# Depuis le dossier iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

## Méthode 2 : Copie avec rsync (Linux/Mac)

```bash
rsync -avz --progress immo/ admin@192.168.1.130:/volume1/docker/immo/
```

## ⚠️ Important après la copie

1. **Créer le fichier `.env.production`** sur le NAS dans `/volume1/docker/immo/` avec vos variables d'environnement
2. **Vérifier que tous les fichiers sont présents** (voir vérification ci-dessous)

## ✅ Vérification sur le NAS (via PuTTY)

```bash
# Se connecter au NAS
ssh admin@192.168.1.130

# Vérifier la structure
cd /volume1/docker/immo
ls -la

# Vérifier les fichiers essentiels
ls -la docker-compose.real-estate.yml
ls -la Dockerfile
ls -la package.json
ls -la next.config.ts
ls -la .env.production  # Doit être créé manuellement

# Vérifier les dossiers
ls -ld src/
ls -ld public/
ls -ld scripts/
```

## 📋 Contenu du dossier immo/

Le dossier `immo/` contient :
- ✅ `docker-compose.real-estate.yml`
- ✅ `Dockerfile`
- ✅ `package.json` et `package-lock.json`
- ✅ `next.config.ts` et `tsconfig.json`
- ✅ `postcss.config.mjs` (si présent)
- ✅ `src/` (code source complet)
- ✅ `public/` (fichiers statiques)
- ✅ `scripts/create-real-estate-tables.sql`
- ⚠️ `.env.production` (à créer manuellement sur le NAS)

## 🚀 Après la copie

Une fois le dossier copié et `.env.production` créé, exécutez dans PuTTY :

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml build --no-cache
docker-compose -f docker-compose.real-estate.yml up -d
```
