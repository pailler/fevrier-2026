# Fix Docker Permissions sur Synology

## Problème
```
permission denied while trying to connect to the Docker daemon socket
```

## Solution 1 : Ajouter l'utilisateur au groupe docker (Recommandé)

1. **Connectez-vous au NAS via SSH** :
```bash
ssh admin@192.168.1.130
```

2. **Vérifiez si le groupe docker existe** :
```bash
getent group docker
```

3. **Ajoutez votre utilisateur au groupe docker** :
```bash
sudo synogroup --add docker
sudo synogroup --member docker admin
```

4. **Déconnectez-vous et reconnectez-vous** pour que les changements prennent effet :
```bash
exit
ssh admin@192.168.1.130
```

5. **Vérifiez que ça fonctionne** :
```bash
docker ps
```

## Solution 2 : Utiliser sudo (Temporaire)

Si la solution 1 ne fonctionne pas, utilisez `sudo` :

```bash
sudo docker-compose up -d --build
```

## Solution 3 : Utiliser l'utilisateur root (Non recommandé)

```bash
sudo su
docker-compose up -d --build
```

## Vérification

Après avoir appliqué la solution, testez :

```bash
docker ps
```

Si vous voyez la liste des conteneurs (même vide), c'est bon !


