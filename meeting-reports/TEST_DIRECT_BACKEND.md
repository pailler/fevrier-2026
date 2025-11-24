# Test direct du backend (bypass Traefik)

Pour tester si le problème vient de Traefik ou du backend, testez directement le backend :

## Test avec curl

```powershell
# Créer un fichier de test de 34 MB
$testFile = New-Item -Path "test-34mb.bin" -ItemType File -Force
$testFile.SetLength(34MB)

# Test direct vers le backend (bypass Traefik)
curl -X POST http://localhost:8000/upload -F "file=@test-34mb.bin" -v
```

## Interprétation des résultats

- **Si ça fonctionne** : Le problème vient de Traefik
- **Si erreur 413** : Le problème vient du backend ou de la configuration FastAPI

## Solution temporaire : Utiliser directement le backend

Si le test direct fonctionne, vous pouvez temporairement utiliser le backend directement :

1. Modifier le frontend pour utiliser `http://localhost:8000` au lieu de `/api`
2. Ou créer un tunnel direct vers le backend
3. Ou configurer Traefik pour désactiver complètement le buffering pour cette route
















