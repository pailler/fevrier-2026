# Résolution : Permission denied sur Docker daemon socket

## Problème

L'erreur `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock` indique que votre utilisateur n'a pas les permissions pour accéder à Docker.

## Solutions

### Solution 1 : Utiliser sudo (Rapide)

Ajoutez `sudo` devant chaque commande Docker :

```bash
sudo docker stop n8n
sudo docker start n8n
sudo docker ps
sudo docker logs n8n
```

### Solution 2 : Ajouter l'utilisateur au groupe docker (Recommandé)

Cette solution permet d'utiliser Docker sans `sudo` :

#### Étape 1 : Vérifier si le groupe docker existe

```bash
getent group docker
```

#### Étape 2 : Ajouter l'utilisateur au groupe docker

```bash
sudo usermod -aG docker $USER
```

#### Étape 3 : Appliquer les changements

Vous devez vous déconnecter et reconnecter pour que les changements prennent effet :

```bash
exit
```

Puis reconnectez-vous via SSH.

#### Étape 4 : Vérifier

```bash
groups
```

Vous devriez voir `docker` dans la liste des groupes.

#### Étape 5 : Tester

```bash
docker ps
```

Si cela fonctionne sans `sudo`, c'est bon !

### Solution 3 : Utiliser l'utilisateur root (Non recommandé)

```bash
sudo su -
docker stop n8n
docker start n8n
exit
```

## Commandes corrigées avec sudo

Voici les commandes pour corriger l'erreur de clé de chiffrement avec `sudo` :

```bash
sudo docker stop n8n
```

```bash
sudo rm -f /volume1/docker/n8n/n8n/config
```

```bash
sudo docker start n8n
```

```bash
sudo docker logs n8n --tail 30
```

## Pour docker-compose

Si vous utilisez `docker-compose`, utilisez aussi `sudo` :

```bash
sudo docker-compose -f /volume1/docker/n8n/docker-compose.yml stop n8n
sudo docker-compose -f /volume1/docker/n8n/docker-compose.yml start n8n
```

Ou pour redémarrer complètement :

```bash
cd /volume1/docker/n8n
sudo docker-compose down
sudo docker-compose up -d
```

## Script corrigé avec sudo

Voici le script de correction avec `sudo` :

```bash
#!/bin/bash
# Script pour corriger l'erreur de clé de chiffrement n8n avec sudo

echo "Correction de l'erreur de clé de chiffrement n8n..."
echo ""

# Arrêter n8n
echo "Arrêt du conteneur n8n..."
sudo docker stop n8n

# Supprimer le fichier config
echo "Suppression du fichier config..."
sudo rm -f /volume1/docker/n8n/n8n/config

# Redémarrer n8n
echo "Redémarrage du conteneur n8n..."
sudo docker start n8n

echo ""
echo "Attente du démarrage (20 secondes)..."
sleep 20

echo ""
echo "Vérification des logs:"
sudo docker logs n8n --tail 30

echo ""
echo "Vérification du statut:"
sudo docker ps | grep n8n
```

## Vérification des permissions

Pour vérifier les permissions du socket Docker :

```bash
ls -l /var/run/docker.sock
```

Vous devriez voir quelque chose comme :
```
srw-rw---- 1 root docker 0 Jan 21 14:00 /var/run/docker.sock
```

Le groupe `docker` doit avoir les permissions `rw-`.

## Notes importantes

- ⚠️ **Sudo** : Sur Synology, l'utilisateur `admin` a généralement les droits sudo
- 🔒 **Sécurité** : Ajouter un utilisateur au groupe docker lui donne des privilèges équivalents à root pour Docker
- 📝 **Reconnexion** : Après avoir ajouté un utilisateur au groupe docker, vous devez vous déconnecter et reconnecter
- 🔄 **Persistance** : Les changements de groupe sont persistants après reconnexion

## Alternative : Utiliser l'interface Synology

Si les commandes SSH posent problème, utilisez l'interface graphique Synology :

1. **Docker** → **Container**
2. Sélectionnez le conteneur `n8n`
3. **Action** → **Stop** (ou **Start**)
4. Pour supprimer le fichier config, utilisez **File Station**
