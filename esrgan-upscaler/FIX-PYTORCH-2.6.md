# 🔧 Correction pour PyTorch 2.6+

## Problème

PyTorch 2.6 a changé le comportement par défaut de `torch.load()` pour utiliser `weights_only=True` par défaut. Cela empêche le chargement de modèles qui contiennent des références à des classes personnalisées.

## Solution Appliquée

### 1. Modification du chargement des modèles

Tous les appels à `torch.load()` ont été modifiés pour utiliser `weights_only=False` :

```python
try:
    checkpoint = torch.load(path, map_location=device, weights_only=False)
except TypeError:
    # Pour les versions antérieures de PyTorch qui n'ont pas ce paramètre
    checkpoint = torch.load(path, map_location=device)
```

### 2. Modification du script de conversion

Le script de conversion ne sauvegarde plus la référence à la classe `RRDBNet` dans le modèle converti. Seul le `state_dict` est sauvegardé :

```python
torch.save({
    'state_dict': model.state_dict(),
    # 'model': model,  # ❌ Retiré pour éviter les problèmes
    'architecture': 'RRDBNet',
    'converted_from': 'Real-ESRGAN',
    # ... autres métadonnées
}, output_path)
```

### 3. Chargement du modèle converti

Le code de chargement utilise maintenant les paramètres sauvegardés pour recréer l'architecture :

```python
if 'converted_from' in checkpoint and checkpoint['converted_from'] == 'Real-ESRGAN':
    num_in_ch = checkpoint.get('num_in_ch', 3)
    num_out_ch = checkpoint.get('num_out_ch', 3)
    # ... autres paramètres
    
    self.model = RRDBNet(num_in_ch=num_in_ch, num_out_ch=num_out_ch, ...)
    self.model.load_state_dict(checkpoint['state_dict'], strict=False)
```

## Fichiers Modifiés

1. ✅ `esrgan_model.py` - Ajout de `weights_only=False` dans tous les `torch.load()`
2. ✅ `convert_model.py` - Retrait de la sauvegarde de la classe, seulement `state_dict`
3. ✅ `convert_model.py` - Ajout de `weights_only=False` dans les chargements

## Vérification

Pour vérifier que le modèle se charge correctement :

```python
import torch
from esrgan_model import ESRGANUpscaler

# Le modèle devrait se charger sans erreur
upscaler = ESRGANUpscaler("converted_models/4xUltrasharp_4xUltrasharpV10_converted.pt")
print("Modèle chargé avec succès!")
```

## Notes de Sécurité

⚠️ **Important** : `weights_only=False` permet l'exécution de code arbitraire lors du chargement. 

**C'est sûr dans notre cas car** :
- Les modèles sont convertis localement
- Les modèles proviennent de sources de confiance (StabilityMatrix)
- L'application est utilisée en local

Pour une utilisation en production, considérez :
- Utiliser `weights_only=True` avec `torch.serialization.add_safe_globals()`
- Valider les modèles avant le chargement
- Utiliser des modèles signés numériquement

---

**Dernière mise à jour** : Janvier 2026
