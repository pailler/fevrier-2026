# 📋 Fichiers à copier dans /volume1/docker/immo/ sur le NAS

## Structure du répertoire sur le NAS

```
/volume1/docker/immo/
├── docker-compose.real-estate.yml    ← Fichier Docker Compose
├── .env.production                   ← Variables d'environnement (déjà créé)
├── Dockerfile                         ← Fichier de build Docker
├── package.json                      ← Dépendances Node.js
├── package-lock.json                 ← Verrouillage des versions
├── next.config.ts                    ← Configuration Next.js
├── tsconfig.json                     ← Configuration TypeScript
├── postcss.config.mjs                ← Configuration PostCSS
├── src/                              ← Code source de l'application
│   ├── app/
│   │   ├── real-estate/             ← Application immobilière
│   │   └── api/
│   │       └── real-estate/         ← APIs immobilières
│   ├── components/
│   │   └── real-estate/             ← Composants immobiliers
│   ├── lib/
│   │   └── real-estate/             ← Bibliothèques immobilières
│   └── utils/                       ← Utilitaires
├── public/                           ← Fichiers statiques
├── scripts/
│   └── create-real-estate-tables.sql ← Script SQL (optionnel)
└── logs/                             ← Créé automatiquement
```

## 📦 Fichiers obligatoires à copier

### 1. Fichiers de configuration Docker

```bash
# Depuis votre machine locale, dans le répertoire iahome
scp docker-compose.real-estate.yml admin@192.168.1.130:/volume1/docker/immo/
scp Dockerfile admin@192.168.1.130:/volume1/docker/immo/
```

### 2. Fichiers de configuration Node.js/Next.js

```bash
scp package.json admin@192.168.1.130:/volume1/docker/immo/
scp package-lock.json admin@192.168.1.130:/volume1/docker/immo/
scp next.config.ts admin@192.168.1.130:/volume1/docker/immo/
scp tsconfig.json admin@192.168.1.130:/volume1/docker/immo/
scp postcss.config.mjs admin@192.168.1.130:/volume1/docker/immo/
```

### 3. Code source de l'application

```bash
# Copier le dossier src/ (toute l'application)
scp -r src admin@192.168.1.130:/volume1/docker/immo/

# Copier le dossier public/ (fichiers statiques)
scp -r public admin@192.168.1.130:/volume1/docker/immo/
```

### 4. Scripts SQL (optionnel mais recommandé)

```bash
# Créer le dossier scripts sur le NAS
ssh admin@192.168.1.130 "mkdir -p /volume1/docker/immo/scripts"

# Copier le script SQL
scp scripts/create-real-estate-tables.sql admin@192.168.1.130:/volume1/docker/immo/scripts/
```

## 🔄 Script complet de copie (Linux/Mac)

Créez un fichier `copy-to-nas.sh` :

```bash
#!/bin/bash

NAS_USER="admin"
NAS_IP="192.168.1.130"
NAS_PATH="/volume1/docker/immo"

echo "📦 Copie des fichiers vers le NAS..."

# Créer les répertoires nécessaires
ssh $NAS_USER@$NAS_IP "mkdir -p $NAS_PATH/scripts"

# Fichiers de configuration Docker
echo "📋 Copie des fichiers Docker..."
scp docker-compose.real-estate.yml $NAS_USER@$NAS_IP:$NAS_PATH/
scp Dockerfile $NAS_USER@$NAS_IP:$NAS_PATH/

# Fichiers de configuration Node.js
echo "⚙️  Copie des fichiers de configuration..."
scp package.json $NAS_USER@$NAS_IP:$NAS_PATH/
scp package-lock.json $NAS_USER@$NAS_IP:$NAS_PATH/
scp next.config.ts $NAS_USER@$NAS_IP:$NAS_PATH/
scp tsconfig.json $NAS_USER@$NAS_IP:$NAS_PATH/
scp postcss.config.mjs $NAS_USER@$NAS_IP:$NAS_PATH/ 2>/dev/null || echo "⚠️  postcss.config.mjs non trouvé (optionnel)"

# Code source
echo "💻 Copie du code source..."
scp -r src $NAS_USER@$NAS_IP:$NAS_PATH/

# Fichiers statiques
echo "🖼️  Copie des fichiers statiques..."
scp -r public $NAS_USER@$NAS_IP:$NAS_PATH/

# Scripts SQL
echo "📜 Copie des scripts SQL..."
scp scripts/create-real-estate-tables.sql $NAS_USER@$NAS_IP:$NAS_PATH/scripts/ 2>/dev/null || echo "⚠️  Script SQL non trouvé (optionnel)"

echo "✅ Copie terminée!"
echo ""
echo "📝 N'oubliez pas de créer/copier le fichier .env.production dans $NAS_PATH/"
```

## 🔄 Script complet de copie (Windows PowerShell)

Créez un fichier `copy-to-nas.ps1` :

```powershell
$NasUser = "admin"
$NasIP = "192.168.1.130"
$NasPath = "/volume1/docker/immo"

Write-Host "📦 Copie des fichiers vers le NAS..." -ForegroundColor Cyan

# Créer les répertoires nécessaires
ssh "$NasUser@$NasIP" "mkdir -p $NasPath/scripts"

# Fichiers de configuration Docker
Write-Host "📋 Copie des fichiers Docker..." -ForegroundColor Yellow
scp docker-compose.real-estate.yml "${NasUser}@${NasIP}:${NasPath}/"
scp Dockerfile "${NasUser}@${NasIP}:${NasPath}/"

# Fichiers de configuration Node.js
Write-Host "⚙️  Copie des fichiers de configuration..." -ForegroundColor Yellow
scp package.json "${NasUser}@${NasIP}:${NasPath}/"
scp package-lock.json "${NasUser}@${NasIP}:${NasPath}/"
scp next.config.ts "${NasUser}@${NasIP}:${NasPath}/"
scp tsconfig.json "${NasUser}@${NasIP}:${NasPath}/"
if (Test-Path "postcss.config.mjs") {
    scp postcss.config.mjs "${NasUser}@${NasIP}:${NasPath}/"
}

# Code source
Write-Host "💻 Copie du code source..." -ForegroundColor Yellow
scp -r src "${NasUser}@${NasIP}:${NasPath}/"

# Fichiers statiques
Write-Host "🖼️  Copie des fichiers statiques..." -ForegroundColor Yellow
scp -r public "${NasUser}@${NasIP}:${NasPath}/"

# Scripts SQL
Write-Host "📜 Copie des scripts SQL..." -ForegroundColor Yellow
if (Test-Path "scripts/create-real-estate-tables.sql") {
    scp scripts/create-real-estate-tables.sql "${NasUser}@${NasIP}:${NasPath}/scripts/"
}

Write-Host "✅ Copie terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 N'oubliez pas de créer/copier le fichier .env.production dans $NasPath/" -ForegroundColor Yellow
```

## 📝 Liste détaillée des fichiers

### Fichiers racine (obligatoires)

| Fichier | Description | Obligatoire |
|---------|-------------|-------------|
| `docker-compose.real-estate.yml` | Configuration Docker Compose | ✅ Oui |
| `Dockerfile` | Configuration de build Docker | ✅ Oui |
| `.env.production` | Variables d'environnement | ✅ Oui (déjà créé) |
| `package.json` | Dépendances Node.js | ✅ Oui |
| `package-lock.json` | Verrouillage des versions | ✅ Oui |
| `next.config.ts` | Configuration Next.js | ✅ Oui |
| `tsconfig.json` | Configuration TypeScript | ✅ Oui |
| `postcss.config.mjs` | Configuration PostCSS | ⚠️ Optionnel |

### Dossiers (obligatoires)

| Dossier | Description | Obligatoire |
|---------|-------------|-------------|
| `src/` | Code source complet de l'application | ✅ Oui |
| `public/` | Fichiers statiques (images, fonts, etc.) | ✅ Oui |

### Fichiers optionnels

| Fichier/Dossier | Description | Utilité |
|-----------------|-------------|---------|
| `scripts/create-real-estate-tables.sql` | Script SQL pour créer les tables | 📊 Utile pour initialiser la BDD |
| `logs/` | Dossier de logs | 🔄 Créé automatiquement |

## ✅ Vérification après copie

Une fois les fichiers copiés, vérifiez sur le NAS :

```bash
# Se connecter au NAS
ssh admin@192.168.1.130

# Vérifier la structure
cd /volume1/docker/immo
ls -la

# Vérifier les fichiers essentiels
ls -la docker-compose.real-estate.yml
ls -la Dockerfile
ls -la .env.production
ls -la package.json
ls -la next.config.ts

# Vérifier les dossiers
ls -ld src/
ls -ld public/
```

## 🚨 Fichiers à NE PAS copier

Ne copiez **PAS** ces fichiers/dossiers :

- ❌ `node_modules/` - Sera installé lors du build Docker
- ❌ `.next/` - Sera généré lors du build
- ❌ `.git/` - Non nécessaire en production
- ❌ `logs/` - Sera créé automatiquement
- ❌ `hunyuan2-spz/` - Non nécessaire
- ❌ `meeting-reports/` - Non nécessaire
- ❌ `apprendre-autrement/` - Non nécessaire
- ❌ `prompt-generator/` - Non nécessaire
- ❌ `prompts/` - Non nécessaire
- ❌ `deploy/` - Non nécessaire
- ❌ `*.log` - Fichiers de logs locaux

## 📊 Taille approximative

- `src/` : ~5-10 MB (code source)
- `public/` : ~1-5 MB (fichiers statiques)
- Fichiers de configuration : ~50 KB
- **Total** : ~10-20 MB (sans node_modules)

## 🔧 Méthode alternative : rsync (Linux/Mac)

Si vous avez `rsync` disponible :

```bash
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude '.git' \
           --exclude '*.log' \
           --exclude 'logs' \
           --exclude 'hunyuan2-spz' \
           --exclude 'meeting-reports' \
           --exclude 'apprendre-autrement' \
           --exclude 'prompt-generator' \
           --exclude 'prompts' \
           --exclude 'deploy' \
           ./ admin@192.168.1.130:/volume1/docker/immo/
```

## 📝 Note importante

Le fichier `.env.production` doit être créé **manuellement** sur le NAS avec vos variables d'environnement. Il ne doit **PAS** être copié depuis votre machine locale pour des raisons de sécurité.
