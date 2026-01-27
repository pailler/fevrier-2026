# 📥 Instructions pour installer Python 3.10.6

## Étape 1 : Télécharger Python 3.10.6

1. Ouvrez votre navigateur et allez sur :
   **https://www.python.org/downloads/release/python-3106/**

2. Téléchargez **"Windows installer (64-bit)"** (fichier `.exe`)

## Étape 2 : Installer Python 3.10.6

1. **Double-cliquez** sur le fichier téléchargé (`python-3.10.6-amd64.exe`)

2. ⚠️ **IMPORTANT** : Cochez **"Add Python 3.10 to PATH"** en bas de la fenêtre d'installation

3. Cliquez sur **"Install Now"**

4. Attendez la fin de l'installation

5. Cliquez sur **"Close"**

## Étape 3 : Vérifier l'installation

Ouvrez PowerShell et exécutez :

```powershell
py -3.10 --version
```

Vous devriez voir : `Python 3.10.6`

## Étape 4 : Relancer Automatic1111

Une fois Python 3.10.6 installé, exécutez :

```powershell
cd docker-services\essentiels
.\start-automatic1111.ps1
```

Le script va :
- Détecter automatiquement Python 3.10.6
- Créer un nouveau venv avec Python 3.10.6
- Installer PyTorch et toutes les dépendances
- Démarrer Automatic1111

## Dépannage

### Python 3.10 n'est pas détecté

Si `py -3.10 --version` ne fonctionne pas :

1. Vérifiez que Python 3.10.6 est bien installé dans :
   - `C:\Users\VotreNom\AppData\Local\Programs\Python\Python310\`
   - ou `C:\Python310\`

2. Ajoutez Python au PATH manuellement :
   - Recherchez "Variables d'environnement" dans Windows
   - Ajoutez le chemin de Python 3.10 à la variable PATH

### Le venv est toujours créé avec Python 3.13

Supprimez manuellement le venv :

```powershell
Remove-Item -Recurse -Force docker-services\essentiels\automatic1111\venv
```

Puis relancez `start-automatic1111.ps1`
