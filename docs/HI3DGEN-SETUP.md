# Hi3DGen — Image vers 3D

Interface simplifiée pour générer des modèles 3D à partir d'images, intégrée à iahome et utilisant ComfyUI + **Hi3DGen**.

## Accès

- **URL locale** (`npm run hi3dgen`) : http://localhost:8095/ — Hi3DGen est servi à la **racine** (pas de `/card/hi3dgen` dans la barre d’adresse).
- **URL sur le site principal** : https://iahome.fr/card/hi3dgen

## Prérequis

1. **ComfyUI** (build récent) sur le port **8188**
2. Custom node **[ComfyUI-Hi3DGen](https://github.com/Stable-X/ComfyUI-Hi3DGen)** — il fournit notamment les nœuds `IF_TrellisCheckpointLoader` et `IF_TrellisImageTo3D`. Sans ce dossier dans `custom_nodes`, ComfyUI renvoie *Node 'IF_TrellisCheckpointLoader' not found*.

### Installation ComfyUI-Hi3DGen (Windows)

1. Arrêter ComfyUI.
2. Dans le dossier ComfyUI :
   ```bash
   cd custom_nodes
   git clone https://github.com/Stable-X/ComfyUI-Hi3DGen.git
   cd ComfyUI-Hi3DGen
   ```
3. Installer les dépendances Python (depuis l’environnement **du** ComfyUI, souvent `python_embeded\python.exe -m pip` ou le `venv` que vous utilisez pour ComfyUI) :
   ```bash
   pip install -r win_requirements.txt
   ```
   Sur GPU NVIDIA, suivez aussi le README du dépôt (torch, xformers, etc.).
4. Redémarrer ComfyUI. Dans l’interface, menu **Add Node**, chercher **IF_Trellis** : si les nœuds apparaissent, l’installation est OK.
5. Le modèle **trellis-normal-v0-1** (et DINOv2) doit être téléchargé au premier run selon les instructions du dépôt.

*ComfyUI Manager* peut aussi proposer « Hi3DGen » / dépôts liés ; vérifiez que c’est bien **Stable-X/ComfyUI-Hi3DGen**, pas un autre fork sans ces nœuds.

## Configuration (.env.local)

ComfyUI doit être joignable **depuis le process Node** qui exécute Next (même machine en général).

- En **`next dev`**, si tu as seulement `COMFYUI_INTERNAL_URL=https://comfyui.iahome.fr` (tunnel prod), l’API Hi3DGen **ignore** cette variable et utilise par défaut **`http://127.0.0.1:8188`** pour parler à ton ComfyUI local.
- Pour forcer une URL (recommandé en prod ou si ComfyUI est ailleurs) :

```env
# Prioritaire pour Hi3DGen uniquement
HI3DGEN_COMFYUI_URL=http://127.0.0.1:8188

# Ou URL générique ComfyUI (si tu ne veux pas de variable dédiée)
COMFYUI_URL=http://127.0.0.1:8188
```

Préférer **`127.0.0.1`** à `localhost` sur Windows si `localhost` résout en IPv6 (`::1`) alors que ComfyUI n’écoute qu’en IPv4.

## Lancement sur localhost:8095

```bash
# Depuis la racine iahome
npm run hi3dgen
```

Puis ouvrir **http://localhost:8095** — la racine affiche directement l’interface Hi3DGen.

## Utilisation

1. Glisser une image ou cliquer pour en choisir une
2. (Optionnel) Modifier le prompt
3. Cliquer sur **Générer le modèle 3D**
4. Attendre 2 à 5 minutes (génération GPU)
5. Télécharger le fichier GLB généré

## Dépannage

- **Erreur upload ComfyUI** : ComfyUI doit être lancé sur le port 8188
- **Node 'IF_TrellisCheckpointLoader' not found** : installer [Stable-X/ComfyUI-Hi3DGen](https://github.com/Stable-X/ComfyUI-Hi3DGen) dans `custom_nodes`, `pip install -r win_requirements.txt` (ou `linux_requirements.txt`), **redémarrer ComfyUI**
- **Time-out** : La génération peut prendre 5+ minutes ; augmenter le polling si besoin
- **MIME type / scripts bloqués** : Vérifier que vous lancez `npm run hi3dgen` (Next.js) sur le port 8095, pas un autre serveur
