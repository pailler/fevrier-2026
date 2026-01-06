# 📦 Résumé : Fichiers à copier sur le NAS

## ✅ Tous les fichiers sont dans le dossier `immo/`

Le dossier `immo/` contient **TOUS** les fichiers nécessaires pour le déploiement.

## 🚀 Copie simple

### Option 1 : WinSCP / FileZilla (Recommandé)

1. Ouvrir WinSCP ou FileZilla
2. Se connecter au NAS : `192.168.1.130`
3. Naviguer vers `/volume1/docker/`
4. **Copier le dossier `immo/` complet** depuis `C:\Users\AAA\Documents\iahome\immo\` vers `/volume1/docker/immo/`

### Option 2 : PowerShell

```powershell
# Depuis le dossier iahome
cd C:\Users\AAA\Documents\iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

### Option 3 : Bash (Linux/Mac)

```bash
# Depuis le dossier iahome
cd ~/Documents/iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

## 📋 Contenu du dossier immo/

```
immo/
├── docker-compose.real-estate.yml    ✅
├── Dockerfile                         ✅
├── package.json                       ✅
├── package-lock.json                 ✅
├── next.config.ts                     ✅
├── tsconfig.json                      ✅
├── postcss.config.mjs                ✅
├── src/                               ✅ (dossier complet)
├── public/                            ✅ (dossier complet)
├── scripts/
│   └── create-real-estate-tables.sql ✅
├── README.md                          ✅
├── COPY_TO_NAS.md                     ✅
└── .gitignore                         ✅
```

## ⚠️ Après la copie sur le NAS

1. **Créer `.env.production`** dans `/volume1/docker/immo/` avec vos variables d'environnement
2. **Vérifier** que tous les fichiers sont présents
3. **Exécuter** les commandes Docker Compose (voir `COMMANDES_PUTTY.md`)

## ✅ Vérification sur le NAS

```bash
cd /volume1/docker/immo
ls -la
```

Vous devriez voir tous les fichiers listés ci-dessus.
