# Configuration Deemix - Résolution du problème de permissions

## Problème

L'erreur `EACCES: permission denied, mkdir '/volume1/downloads/Gaëtan Roussel - Marjolaine'` indique que deemix n'a pas les permissions nécessaires pour créer des répertoires dans `/volume1/downloads/`.

## Solutions

### Solution 1 : Utiliser Docker avec les bonnes permissions (Recommandé)

Le fichier `docker-compose.yml` est déjà configuré avec `PUID=1000` et `PGID=1000`. Assurez-vous que ces valeurs correspondent à l'utilisateur propriétaire du répertoire `/volume1/downloads/` sur votre NAS.

#### Vérifier les permissions du répertoire sur le NAS

Sur votre NAS Synology, vérifiez les permissions du répertoire `/volume1/downloads/` :

```bash
# Sur le NAS (via SSH)
ls -ld /volume1/downloads
```

Notez l'UID et GID du propriétaire, puis ajustez `PUID` et `PGID` dans le `docker-compose.yml` si nécessaire.

#### Démarrer le conteneur

```powershell
cd docker-services\essentiels\deemix
docker-compose up -d
```

### Solution 2 : Corriger les permissions sur le NAS

Si vous préférez corriger les permissions directement sur le NAS :

#### Via l'interface Synology

1. Ouvrez **File Station**
2. Naviguez vers `/volume1/downloads`
3. Clic droit → **Propriétés** → **Permissions**
4. Assurez-vous que l'utilisateur qui exécute deemix a les permissions **Lecture/Écriture**

#### Via SSH (si vous avez accès)

```bash
# Sur le NAS Synology
sudo chown -R votre_utilisateur:votre_groupe /volume1/downloads
sudo chmod -R 755 /volume1/downloads
```

### Solution 3 : Utiliser un chemin local au lieu du NAS

Si vous préférez utiliser un répertoire local, modifiez le `docker-compose.yml` :

```yaml
volumes:
  # Utiliser un chemin local au lieu du NAS
  - ./downloads:/downloads
```

Puis créez le répertoire local :

```powershell
New-Item -ItemType Directory -Path "docker-services\essentiels\deemix\downloads" -Force
```

## Configuration recommandée

### Pour Synology NAS

1. **Vérifiez l'UID/GID** de l'utilisateur sur le NAS :
   ```bash
   # Sur le NAS
   id votre_utilisateur
   ```

2. **Ajustez PUID/PGID** dans `docker-compose.yml` si nécessaire

3. **Assurez-vous que le volume est monté** correctement :
   - Si Docker tourne sur le NAS : `/volume1/downloads:/downloads`
   - Si Docker tourne sur Windows avec un partage réseau : `//NAS_IP/downloads:/downloads`

### Pour Windows avec partage réseau

Si Docker tourne sur Windows et que vous accédez au NAS via un partage réseau :

```yaml
volumes:
  # Utiliser un chemin réseau Windows
  - //192.168.1.100/downloads:/downloads
```

**Note** : Vous devrez peut-être configurer les credentials dans Docker Desktop → Settings → Resources → File Sharing.

## Vérification

### Vérifier que le conteneur fonctionne

```powershell
docker ps --filter name=deemix-iahome
```

### Vérifier les logs

```powershell
docker logs deemix-iahome --tail 50
```

### Tester l'accès web

Ouvrez votre navigateur et allez sur : `http://localhost:6595`

### Tester la création de répertoire

```powershell
docker exec deemix-iahome mkdir -p /downloads/test-permissions
```

Si cette commande réussit, les permissions sont correctes.

## Dépannage

### Le conteneur ne démarre pas

1. Vérifiez que le réseau `iahome-network` existe :
   ```powershell
   docker network ls | Select-String "iahome-network"
   ```

2. Si le réseau n'existe pas, créez-le :
   ```powershell
   docker network create iahome-network
   ```

### Les permissions sont toujours incorrectes

1. Vérifiez les permissions du répertoire monté :
   ```powershell
   docker exec deemix-iahome ls -ld /downloads
   ```

2. Vérifiez l'utilisateur dans le conteneur :
   ```powershell
   docker exec deemix-iahome id
   ```

3. Ajustez `PUID` et `PGID` dans `docker-compose.yml` pour correspondre aux permissions du répertoire.

### Le répertoire n'est pas accessible

Si vous utilisez un chemin réseau Windows, assurez-vous que :
- Le partage réseau est accessible depuis Windows
- Docker Desktop a accès au partage (Settings → Resources → File Sharing)
- Les credentials sont corrects

## Notes importantes

- ⚠️ **PUID/PGID** : Ces valeurs doivent correspondre à l'utilisateur propriétaire du répertoire de téléchargement
- ✅ **Volume mount** : Le chemin monté doit exister et être accessible
- 🔒 **Permissions** : L'utilisateur dans le conteneur doit avoir les droits d'écriture
- 📁 **Configuration** : Les paramètres deemix sont sauvegardés dans `./config`









