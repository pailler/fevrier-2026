# Hi3DGen — Image vers 3D

Interface simplifiée pour générer des modèles 3D à partir d'images, intégrée à iahome et utilisant ComfyUI + **Hi3DGen**.

## Accès

- **URL locale** : http://localhost:8095
- **URL directe** : http://localhost:8095/card/hi3dgen
- **URL production** : https://iahome.fr/card/hi3dgen  

## Prérequis

1. **ComfyUI** lancé avec le custom node **ComfyUI-Hi3DGen** installé
2. ComfyUI accessible sur le port **8188**

## Configuration (.env.local)

```env
COMFYUI_URL=http://localhost:8188
```

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
- **Node not found** : ComfyUI-Hi3DGen doit être installé (ComfyUI Manager ou manuellement)
- **Time-out** : La génération peut prendre 5+ minutes ; augmenter le polling si besoin
- **MIME type / scripts bloqués** : Vérifier que vous lancez `npm run hi3dgen` (Next.js) sur le port 8095, pas un autre serveur
