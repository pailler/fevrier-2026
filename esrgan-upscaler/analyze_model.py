"""
Analyse les couches manquantes dans le modèle converti
"""

import torch
from pathlib import Path
from esrgan_model import RRDBNet

# Charger le modèle converti
converted_path = Path("converted_models/4xUltrasharp_4xUltrasharpV10_converted.pt")
checkpoint = torch.load(converted_path, map_location='cpu', weights_only=False)

# Créer notre modèle
model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
model_dict = model.state_dict()

# Charger le state_dict
model.load_state_dict(checkpoint['state_dict'], strict=False)

# Vérifier quelles couches sont manquantes
print("="*60)
print("Analyse des couches du modele")
print("="*60)

missing_keys = []
for key in model_dict.keys():
    if key not in checkpoint['state_dict']:
        missing_keys.append(key)

print(f"\nCouches manquantes dans le checkpoint ({len(missing_keys)}):")
for key in missing_keys:
    print(f"  - {key}: {model_dict[key].shape}")

# Vérifier quelles couches sont dans le checkpoint mais pas dans notre modèle
unexpected_keys = []
for key in checkpoint['state_dict'].keys():
    if key not in model_dict:
        unexpected_keys.append(key)

print(f"\nCouches inattendues dans le checkpoint ({len(unexpected_keys)}):")
for key in unexpected_keys[:10]:  # Afficher les 10 premières
    print(f"  - {key}: {checkpoint['state_dict'][key].shape}")

# Tester avec une image simple
print("\n" + "="*60)
print("Test du modele avec image simple")
print("="*60)

from PIL import Image
import numpy as np

# Créer une image de test
test_img = Image.new('RGB', (50, 50), color='red')
img_array = np.array(test_img).astype(np.float32) / 255.0
img_tensor = torch.from_numpy(np.transpose(img_array, (2, 0, 1))).float().unsqueeze(0)

print(f"Input shape: {img_tensor.shape}")

model.eval()
with torch.no_grad():
    output = model(img_tensor)

print(f"Output shape: {output.shape}")
print(f"Output range: [{output.min().item():.3f}, {output.max().item():.3f}]")

# Vérifier si l'output est uniforme
output_np = output.squeeze(0).cpu().numpy()
output_np = np.transpose(output_np, (1, 2, 0))
print(f"Output std: {output_np.std():.3f}")
print(f"Output mean: {output_np.mean():.3f}")

if output_np.std() < 0.01:
    print("\n[ERREUR] L'output est uniforme (std < 0.01)")
    print("Le modele ne fonctionne pas correctement.")
else:
    print("\n[OK] L'output a de la variation")
