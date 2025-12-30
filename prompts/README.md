# 🚀 Générateur de Prompts

Application dédiée au générateur de prompts pour IAhome.

## 📁 Structure

```
prompts/
├── src/
│   └── app/
│       ├── card/
│       │   └── prompt-generator/
│       │       └── page.tsx          # Page de présentation du module
│       └── api/
│           ├── activate-prompt-generator/
│           │   └── route.ts          # API d'activation du module
│           └── create-prompt-generator-module/
│               └── route.ts          # API de création du module
└── scripts/
    ├── create-prompt-generator-module.ps1      # Script PowerShell
    └── create-prompt-generator-module-direct.js # Script Node.js direct
```

## 📝 Fichiers

### Pages
- **`src/app/card/prompt-generator/page.tsx`** : Page de présentation et activation du module prompt-generator

### APIs
- **`src/app/api/activate-prompt-generator/route.ts`** : Endpoint pour activer l'accès au prompt-generator pour un utilisateur
- **`src/app/api/create-prompt-generator-module/route.ts`** : Endpoint pour créer le module dans Supabase

### Scripts
- **`scripts/create-prompt-generator-module.ps1`** : Script PowerShell pour créer le module via l'API
- **`scripts/create-prompt-generator-module-direct.js`** : Script Node.js pour créer le module directement dans Supabase

## 🔗 Intégration

Ces fichiers doivent être intégrés dans l'application principale IAhome (`src/`) pour fonctionner. Ils sont séparés ici pour une meilleure organisation.

## ⚠️ Note

Les fichiers dans `apprendre-autrement/` concernent l'application d'apprentissage et ne doivent pas être modifiés ici.


