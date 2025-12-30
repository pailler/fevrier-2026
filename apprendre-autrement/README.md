# Apprendre Autrement

Application d'apprentissage adaptée pour les enfants dys et autistes, spécialement conçue pour Adan.

## Fonctionnalités

- 🎯 Activités adaptées et personnalisables
- 📅 Calendrier visuel et organisation de la journée
- 👨‍👩‍👧‍👦 Activités familiales (photos, voix, histoires)
- 🏆 Système de points, niveaux et badges
- 🗺️ Parcours d'apprentissage progressifs
- 🔊 Messages vocaux d'encouragement personnalisés
- ♿ Options d'accessibilité complètes

## Installation avec Docker

### Prérequis
- Docker Desktop installé et démarré
- Docker Compose (inclus avec Docker Desktop)

### Démarrage rapide

**Windows (PowerShell) :**
```powershell
.\start.ps1
```

**Linux/Mac :**
```bash
chmod +x start.sh
./start.sh
```

**Ou manuellement :**
```bash
docker-compose up -d --build
```

L'application sera accessible sur **http://localhost:9001**

Pour plus de détails, consultez [INSTALLATION.md](./INSTALLATION.md)

## Développement local

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start
```

## Structure du projet

```
apprendre-autrement/
├── src/
│   ├── app/              # Pages Next.js
│   ├── components/       # Composants React
│   ├── hooks/            # Hooks personnalisés
│   └── utils/            # Utilitaires
├── public/               # Fichiers statiques
├── Dockerfile            # Configuration Docker
└── docker-compose.yml    # Configuration Docker Compose
```

## Configuration

L'application utilise localStorage pour sauvegarder la progression. Tous les paramètres d'accessibilité et la progression sont stockés localement dans le navigateur.

### Configuration du Générateur de prompts

Le générateur de prompts nécessite une clé API OpenAI pour fonctionner.

1. **Obtenir une clé API OpenAI :**
   - Allez sur [OpenAI Platform](https://platform.openai.com/)
   - Créez un compte ou connectez-vous
   - Allez dans "API Keys"
   - Créez une nouvelle clé API
   - Copiez la clé (format: `sk-...`)

2. **Configurer la clé API :**
   
   **Pour le développement local :**
   - Créez un fichier `.env.local` à la racine du projet `apprendre-autrement/`
   - Ajoutez : `OPENAI_API_KEY=votre-cle-api-ici`
   
   **Pour Docker :**
   - Ajoutez la variable dans `docker-compose.yml` ou créez un fichier `.env`
   - Exemple dans `docker-compose.yml` :
     ```yaml
     environment:
       - OPENAI_API_KEY=${OPENAI_API_KEY}
     ```

3. **Redémarrer l'application** après avoir configuré la clé API.

**Note :** Si la clé API n'est pas configurée, le générateur de prompts affichera un message d'erreur approprié.

## Personnalisation

Le prénom de l'enfant (Adan) est configuré dans `src/utils/apprendre-autrement/voiceEncouragement.ts`. Vous pouvez le modifier si nécessaire.

