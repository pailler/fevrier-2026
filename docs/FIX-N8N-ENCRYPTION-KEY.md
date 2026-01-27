# Résolution : Erreur "Mismatching encryption keys" dans n8n

## Problème

L'erreur `Mismatching encryption keys. The encryption key in the settings file /home/node/.n8n/config does not match the N8N_ENCRYPTION_KEY env var` indique que :

- Le fichier `/home/node/.n8n/config` contient une clé de chiffrement
- La variable d'environnement `N8N_ENCRYPTION_KEY` contient une clé différente
- n8n ne peut pas démarrer car les clés ne correspondent pas

## Solutions

### Solution 1 : Supprimer le fichier config (Recommandé pour nouvelle installation)

Si vous n'avez pas de données importantes dans n8n, supprimez le fichier config pour qu'il soit recréé avec la nouvelle clé :

#### Sur le NAS (via SSH)

```bash
# Arrêter n8n
docker stop n8n

# Supprimer le fichier config
rm -f /volume1/docker/n8n/n8n/config

# Redémarrer n8n
docker start n8n
```

#### Ou utiliser le script

```bash
chmod +x /tmp/fix-n8n-encryption-key.sh
bash /tmp/fix-n8n-encryption-key.sh
```

### Solution 2 : Utiliser la clé existante

Si vous avez des données importantes, récupérez la clé existante et utilisez-la dans le docker-compose :

#### Étape 1 : Trouver la clé existante

```bash
# Sur le NAS
cat /volume1/docker/n8n/n8n/config | grep encryptionKey
```

Ou si le fichier est en JSON :

```bash
cat /volume1/docker/n8n/n8n/config
```

#### Étape 2 : Mettre à jour le docker-compose.yml

Modifiez le fichier `docker-compose.yml` pour utiliser la clé existante :

```yaml
environment:
  N8N_ENCRYPTION_KEY: "VOTRE_CLE_EXISTANTE_ICI"
```

#### Étape 3 : Redémarrer

```bash
cd /volume1/docker/n8n
docker-compose restart n8n
```

### Solution 3 : Supprimer complètement le répertoire (ATTENTION : perte de toutes les données)

⚠️ **ATTENTION** : Cette solution supprime **TOUTES** les données n8n (workflows, credentials, etc.)

```bash
# Arrêter n8n
docker stop n8n

# Supprimer tout le répertoire
rm -rf /volume1/docker/n8n/n8n/*

# Redémarrer n8n
docker start n8n
```

n8n créera un nouveau fichier config avec la clé définie dans `N8N_ENCRYPTION_KEY`.

### Solution 4 : Ne pas définir N8N_ENCRYPTION_KEY

Si vous préférez laisser n8n gérer la clé automatiquement :

#### Étape 1 : Retirer N8N_ENCRYPTION_KEY du docker-compose.yml

Supprimez ou commentez cette ligne :

```yaml
# N8N_ENCRYPTION_KEY: "n8n-encryption-key-2024-regispailler-secure"
```

#### Étape 2 : Redémarrer

```bash
docker-compose restart n8n
```

n8n utilisera la clé existante dans le fichier config.

## Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours utiliser la même clé** : Une fois définie, gardez la même `N8N_ENCRYPTION_KEY`
2. **Sauvegarder la clé** : Stockez la clé dans un gestionnaire de mots de passe sécurisé
3. **Documenter** : Notez la clé utilisée dans votre documentation

## Vérification

Après avoir appliqué une solution, vérifiez que n8n démarre correctement :

```bash
# Vérifier les logs
docker logs n8n --tail 50

# Vérifier le statut
docker ps | grep n8n
```

Vous ne devriez plus voir l'erreur "Mismatching encryption keys".

## Recommandation

Pour une **nouvelle installation** :
- Utilisez la **Solution 1** (supprimer le fichier config)

Pour une **installation existante avec données** :
- Utilisez la **Solution 2** (utiliser la clé existante)

Pour une **réinstallation complète** :
- Utilisez la **Solution 3** (supprimer tout le répertoire)
