# Solution finale : Erreur EACCES permission denied n8n

## Problème

L'erreur `EACCES: permission denied, open '/home/node/.n8n/crash.journal'` indique que n8n ne peut pas écrire dans le répertoire monté depuis le NAS.

## Solution rapide (3 commandes)

Exécutez ces 3 commandes sur votre NAS :

```bash
sudo docker stop n8n
```

```bash
sudo chown -R 0:0 /volume1/docker/n8n/n8n && sudo chmod -R 777 /volume1/docker/n8n/n8n && sudo rm -f /volume1/docker/n8n/n8n/crash.journal
```

**IMPORTANT** : Modifiez le `docker-compose.yml` pour retirer ou commenter la ligne `user: "1000:1000"` :

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

Trouvez et commentez :
```yaml
# user: "1000:1000"
```

Puis redémarrez :

```bash
cd /volume1/docker/n8n && sudo docker-compose up -d
```

## Solution avec script automatique

J'ai créé un script qui fait tout automatiquement :

```bash
# Transférez le script sur le NAS
scp scripts/fix-n8n-permissions-final.sh admin@VOTRE_NAS_IP:/tmp/

# Sur le NAS
chmod +x /tmp/fix-n8n-permissions-final.sh
bash /tmp/fix-n8n-permissions-final.sh
```

## Étapes détaillées

### Étape 1 : Arrêter n8n

```bash
sudo docker stop n8n
```

### Étape 2 : Nettoyer les fichiers problématiques

```bash
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
sudo rm -f /volume1/docker/n8n/n8n/*.journal
```

### Étape 3 : Corriger les permissions

```bash
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 777 /volume1/docker/n8n/n8n
```

### Étape 4 : Modifier docker-compose.yml

**CRUCIAL** : Retirez la ligne `user: "1000:1000"` du docker-compose.yml :

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

Trouvez cette ligne :
```yaml
user: "1000:1000"
```

Et commentez-la ou supprimez-la :
```yaml
# user: "1000:1000"
```

Sauvegardez (Ctrl+O, Enter, Ctrl+X).

### Étape 5 : Redémarrer

```bash
cd /volume1/docker/n8n
sudo docker-compose up -d
```

### Étape 6 : Vérifier

Attendez 30 secondes, puis :

```bash
sudo docker logs n8n --tail 30
```

Vous ne devriez plus voir d'erreurs de permissions.

## Pourquoi cette solution fonctionne

1. **`chown -R 0:0`** : Donne la propriété à root (UID 0)
2. **`chmod -R 777`** : Donne tous les droits (lecture, écriture, exécution) à tous
3. **Retirer `user: "1000:1000"`** : Permet au conteneur d'utiliser root, qui a tous les droits

## Alternative : Utiliser un utilisateur spécifique

Si vous préférez ne pas utiliser root :

### Trouver votre UID/GID

```bash
id admin
```

Exemple : `uid=1026(admin) gid=100(users)`

### Configurer les permissions

```bash
sudo chown -R 1026:100 /volume1/docker/n8n/n8n
sudo chmod -R 755 /volume1/docker/n8n/n8n
```

### Modifier docker-compose.yml

```yaml
user: "1026:100"  # Utilisez vos valeurs UID:GID
```

## Vérification finale

### Vérifier les permissions

```bash
ls -ld /volume1/docker/n8n/n8n
```

Devrait afficher quelque chose comme :
```
drwxrwxrwx 1 root root 4096 Jan 21 14:00 /volume1/docker/n8n/n8n
```

### Vérifier que n8n peut écrire

```bash
sudo docker exec n8n touch /home/node/.n8n/test-write
sudo docker exec n8n rm /home/node/.n8n/test-write
```

Si ces commandes réussissent, les permissions sont correctes.

### Vérifier les logs

```bash
sudo docker logs n8n --tail 50
```

Aucune erreur `EACCES` ne devrait apparaître.

## Si le problème persiste

### Solution radicale : Recréer complètement le répertoire

```bash
sudo docker stop n8n
sudo rm -rf /volume1/docker/n8n/n8n/*
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 777 /volume1/docker/n8n/n8n
sudo docker start n8n
```

**⚠️ ATTENTION** : Cela supprime toutes les données n8n (workflows, credentials, etc.)

## Notes importantes

- ✅ **Root est OK pour Synology** : Utiliser root dans un conteneur Docker est acceptable pour un NAS personnel
- 🔒 **Sécurité** : Pour la production, utilisez un utilisateur spécifique avec les bonnes permissions
- 📁 **Permissions** : Les permissions `777` donnent tous les droits (moins sécurisé mais fonctionne toujours)
- 🔄 **Persistance** : Les permissions sont persistantes après redémarrage

## Résumé

La solution la plus simple et la plus fiable :

1. `sudo chown -R 0:0 /volume1/docker/n8n/n8n`
2. `sudo chmod -R 777 /volume1/docker/n8n/n8n`
3. Retirer `user: "1000:1000"` du docker-compose.yml
4. Redémarrer avec `sudo docker-compose up -d`

Cela devrait résoudre définitivement le problème de permissions.
