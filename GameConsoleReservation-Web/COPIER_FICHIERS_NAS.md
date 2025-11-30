# 📋 Guide pour copier les fichiers modifiés sur le NAS

## Fichiers modifiés

Les fichiers suivants ont été modifiés pour ajouter la fonctionnalité d'ajout d'objets côté admin :

1. **backend/server.js** - Ajout des routes API POST et DELETE pour les consoles
2. **app-backend.js** - Ajout de l'interface admin pour ajouter/supprimer des objets

## Méthode 1 : Via File Station (Interface Web) ⭐ Recommandé

1. **Ouvrez DSM** : `http://192.168.1.130:5000`
2. **Ouvrez File Station**
3. **Naviguez vers** : `/volume1/docker/game-reservation`
4. **Téléversez les fichiers** :
   - `app-backend.js` (remplacez l'ancien)
   - Allez dans le dossier `backend/`
   - Téléversez `server.js` (remplacez l'ancien)

5. **Redémarrez les conteneurs** :
   - Ouvrez **Docker** dans DSM
   - Allez dans l'onglet **Container**
   - Sélectionnez `game-reservation-backend` et `game-reservation-frontend`
   - Cliquez sur **Action** > **Redémarrer**

## Méthode 2 : Via Telnet

1. **Connectez-vous en telnet** au NAS (port 23)

2. **Copiez les fichiers** depuis votre PC vers le NAS :
   ```bash
   # Depuis votre PC (PowerShell)
   scp backend/server.js admin@192.168.1.130:/volume1/docker/game-reservation/backend/server.js
   scp app-backend.js admin@192.168.1.130:/volume1/docker/game-reservation/app-backend.js
   ```

3. **Redémarrez les conteneurs** :
   ```bash
   cd /volume1/docker/game-reservation
   sudo docker-compose restart backend frontend
   ```

## Méthode 3 : Via le script de déploiement

Si SSH est activé, vous pouvez utiliser le script :

```powershell
.\deploy-to-synology.ps1
```

## Vérification

Après avoir copié les fichiers et redémarré les conteneurs :

1. **Testez l'application** : `http://192.168.1.130:5000`
2. **Ouvrez le mode admin** (bouton en bas de page)
3. **Vérifiez** qu'il y a maintenant :
   - Une section "➕ Ajouter un nouvel objet à réserver"
   - Une section "🗑️ Supprimer un objet"

## Nouvelle fonctionnalité

### Ajouter un objet

1. Dans le mode admin, allez dans la section "➕ Ajouter un nouvel objet à réserver"
2. Remplissez :
   - **Nom de l'objet** : Ex: "Switch2 : manette N°5"
   - **Type d'objet** : Ex: "Manette Switch"
   - **Durées autorisées** : Cochez les durées disponibles (10 min, 30 min, 1 heure, etc.)
3. Cliquez sur "➕ Ajouter l'objet"
4. L'objet apparaîtra immédiatement dans la liste

### Supprimer un objet

1. Dans le mode admin, allez dans la section "🗑️ Supprimer un objet"
2. Trouvez l'objet à supprimer
3. Cliquez sur "🗑️ Supprimer"
4. Confirmez la suppression
5. ⚠️ **Note** : Impossible de supprimer un objet avec une réservation en cours

## Emplacement des fichiers sur le NAS

- Frontend : `/volume1/docker/game-reservation/app-backend.js`
- Backend : `/volume1/docker/game-reservation/backend/server.js`


