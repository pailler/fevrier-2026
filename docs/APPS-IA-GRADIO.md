# Démarrer les apps IA (Animagine XL, Florence-2, BiRefNet, MuseTalk)

## 1. Corriger l’erreur torchvision _C.pyd

Si vous voyez « point d’entrée introuvable » avec `torchvision\_C.pyd`, exécutez :

```powershell
.\scripts\fix-gradio-torch.ps1
```

Version CPU uniquement (installation plus légère, sans CUDA) :

```powershell
.\scripts\fix-gradio-torch.ps1 -CpuOnly
```

Le script réinstalle PyTorch et torchvision dans le venv de chaque app Gradio.

## Cache des modèles

Les scripts utilisent le dossier **Stability Matrix** standard pour les modèles HF :

`Documents\StabilityMatrix-win-x64\Data\Models\Diffusers`

Migration depuis l'ancien `iahome/models-cache` :

```powershell
.\scripts\migrate-models-to-stabilitymatrix.ps1 -DeleteOldCache
```

Migration `iahome/ai-models-cache` (TTS Coqui, photo-animation SD 1.5, voice isolation) :

```powershell
.\scripts\migrate-ai-models-cache.ps1 -DeleteOldCache
```

## 2. Lancer les apps IA en parallèle

```powershell
.\scripts\start-ia-apps.ps1
```

Démarre en parallèle :
- **Animagine XL** → http://localhost:7883
- **Florence-2**   → http://localhost:7884
- **BiRefNet**     → http://localhost:7882
- **MuseTalk**     → http://localhost:7886 (lip-sync vidéo ; GPU + poids requis, voir `scripts/setup-musetalk-local.ps1`)
  - Voix clonée : `setup-musetalk-local.ps1 -WithChatterbox` (Chatterbox dans `.venv-chatterbox`)
  - CUDA RTX : `setup-musetalk-cuda.ps1` puis `restart-musetalk.ps1`

## 3. Si l’erreur persiste : passer à Python 3.11

Certaines combinaisons PyTorch/torchvision peuvent échouer avec Python 3.12. Utiliser Python 3.11 :

```powershell
# Vérifier la présence de Python 3.11
py -3.11 --version

# Recréer les venvs avec Python 3.11
cd gradio-apps\animagine-xl
Remove-Item -Recurse -Force .venv
py -3.11 -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
# ou: .\.venv\Scripts\pip install torch torchvision gradio diffusers transformers
```

Répéter pour `florence-2` et `birefnet`.

## 4. Réactiver les apps IA dans `start-all-apps`

Dans `scripts\apps-hosts.config.ps1`, commentez ou supprimez :

```powershell
# $SkipGradioApps = $true
```

Ensuite, les apps Gradio seront à nouveau démarrées par `start-all-apps.ps1`.
