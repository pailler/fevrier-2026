# 🔄 Guide de Conversion des Modèles Real-ESRGAN

## 📋 Problème

Les modèles Real-ESRGAN utilisent une architecture différente avec des clés comme `model.0.weight`, `model.1.sub...` etc., qui ne sont pas compatibles directement avec notre implémentation RRDBNet.

## ✅ Solution : Script de Conversion

Un script de conversion a été créé pour transformer les modèles Real-ESRGAN vers un format compatible.

## 🚀 Utilisation

### Conversion d'un modèle unique

```powershell
cd C:\Users\AAA\Documents\iahome\esrgan-upscaler
python convert_model.py "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN\4xUltrasharp_4xUltrasharpV10.pt"
```

Le modèle converti sera sauvegardé dans le même dossier avec le suffixe `_converted.pt`.

### Conversion avec nom de sortie personnalisé

```powershell
python convert_model.py input.pt output_converted.pt
```

### Conversion automatique de tous les modèles

```powershell
.\convert_models.ps1
```

Ce script convertit automatiquement tous les fichiers `.pt` dans le dossier ESRGAN de StabilityMatrix.

## 📊 Résultats de la Conversion

Lors de la conversion, le script :
1. ✅ Analyse la structure du modèle Real-ESRGAN
2. ✅ Mappe les couches d'entrée (conv_first)
3. ✅ Mappe les couches de sortie (conv_last)
4. ✅ Mappe les autres couches par correspondance de shape
5. ✅ Sauvegarde le modèle converti avec métadonnées

**Résultat attendu** : 240-244 couches mappées sur 244 (98-100% de réussite)

## 📁 Emplacement des Modèles Convertis

Les modèles convertis sont sauvegardés dans :
```
C:\Users\AAA\Documents\iahome\esrgan-upscaler\converted_models\
```

L'application utilise automatiquement les modèles convertis s'ils existent, sinon elle essaie d'utiliser les modèles originaux.

## ⚠️ Notes Importantes

1. **Qualité** : Les modèles convertis peuvent avoir une qualité légèrement différente car certaines couches peuvent ne pas être parfaitement mappées (2-4 couches sur 244).

2. **Performance** : Les modèles convertis fonctionnent avec la même performance que les modèles originaux.

3. **Compatibilité** : Les modèles convertis sont compatibles avec notre architecture RRDBNet.

## 🔍 Vérification

Pour vérifier qu'un modèle a été converti :

```powershell
python -c "import torch; ckpt = torch.load('converted_models/4xUltrasharp_4xUltrasharpV10_converted.pt', map_location='cpu'); print('Converted from:', ckpt.get('converted_from', 'Unknown')); print('Layers mapped:', ckpt.get('mapping_stats', {}).get('mapped_layers', 'N/A'))"
```

## 🐛 Dépannage

### Erreur "Format de modèle non reconnu"
- Vérifiez que le fichier est bien un modèle PyTorch (.pt ou .pth)
- Vérifiez que le modèle utilise bien le format Real-ESRGAN

### Erreur "Impossible de mapper les couches"
- Le script utilise `strict=False`, donc même si certaines couches ne sont pas mappées, le modèle sera créé
- Les couches non mappées seront initialisées aléatoirement

### Le modèle converti ne fonctionne pas bien
- Vérifiez le nombre de couches mappées (devrait être > 240/244)
- Essayez de reconvertir le modèle
- Certaines architectures peuvent nécessiter une conversion manuelle

## 📝 Format du Modèle Converti

Le modèle converti contient :
- `state_dict` : Les poids du modèle au format standard
- `model` : Le modèle complet (optionnel)
- `architecture` : "RRDBNet"
- `converted_from` : "Real-ESRGAN"
- `mapping_stats` : Statistiques de conversion
- `original_file` : Chemin du fichier original

---

**Dernière mise à jour** : Janvier 2026
