# Fix pour l'erreur TorchCodec

## Problème
Erreur : "TorchCodec is required for load_with_torchcodec. Please install torchcodec to use this function."

## Solution appliquée

1. **Modification du code** : Utilisation de `backend="soundfile"` avec `torchaudio.load()` pour éviter l'utilisation de torchcodec
2. **Fallback avec librosa** : Si torchaudio échoue, utilisation de librosa comme alternative
3. **Dépendances** : Ajout de `pydub` pour une meilleure compatibilité audio

## Changements

### app.py
- Modification de `torchaudio.load(audio_file)` en `torchaudio.load(audio_file, backend="soundfile")`
- Ajout d'un fallback avec librosa si torchaudio échoue

### requirements.txt
- Ajout de `pydub>=0.25.1` pour le traitement audio

## Reconstruction

Après les modifications, reconstruire l'image :
```bash
cd voice-isolation-service
docker-compose build --no-cache
docker-compose up -d
```

## Vérification

Vérifier que le service fonctionne :
```bash
docker logs voice-isolation-service
```

L'erreur torchcodec ne devrait plus apparaître.
