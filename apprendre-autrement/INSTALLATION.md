# Guide d'installation - Apprendre Autrement

## Prérequis

- Docker Desktop installé et démarré
- Docker Compose (inclus avec Docker Desktop)

## Installation avec Docker (Recommandé)

### Windows (PowerShell)

```powershell
cd apprendre-autrement
.\start.ps1
```

### Linux/Mac

```bash
cd apprendre-autrement
chmod +x start.sh
./start.sh
```

### Ou manuellement

```bash
cd apprendre-autrement
docker-compose up -d --build
```

## Accès à l'application

Une fois démarrée, l'application est accessible sur :
- **http://localhost:9001**

## Commandes utiles

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Reconstruire l'image
```bash
docker-compose up -d --build
```

## Installation locale (sans Docker)

### Prérequis
- Node.js 20 ou supérieur
- npm ou yarn

### Étapes

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer en mode développement :
```bash
npm run dev
```

3. Build de production :
```bash
npm run build
npm start
```

## Dépannage

### Le conteneur ne démarre pas

1. Vérifier que Docker est démarré
2. Vérifier les logs : `docker-compose logs`
3. Vérifier que le port 9001 n'est pas déjà utilisé

### Erreur de build

1. Nettoyer les images Docker :
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Problèmes de permissions (Linux/Mac)

```bash
sudo chown -R $USER:$USER .
```

## Configuration

L'application utilise localStorage pour sauvegarder :
- La progression de l'enfant
- Les points et badges
- Les paramètres d'accessibilité
- Les parcours complétés

Toutes les données sont stockées localement dans le navigateur.

## Personnalisation

Pour changer le prénom de l'enfant (actuellement "Adam"), modifiez la constante `CHILD_NAME` dans :
`src/utils/apprendre-autrement/voiceEncouragement.ts`





