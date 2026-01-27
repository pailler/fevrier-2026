"""Analyse les shapes pour trouver le mapping exact"""

import torch
from basicsr.archs.rrdbnet_arch import RRDBNet

checkpoint_path = r'C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN\4xUltrasharp_4xUltrasharpV10.pt'
checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False)

model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
model_dict = model.state_dict()

print("="*60)
print("ANALYSE DES SHAPES")
print("="*60)

# Couches manquantes dans le modèle
missing = ['conv_body.weight', 'conv_body.bias', 'conv_up1.weight', 'conv_up1.bias']
print("\nShapes attendues:")
for k in missing:
    if k in model_dict:
        print(f"  {k}: {model_dict[k].shape}")

# Couches model.X dans le checkpoint
print("\nShapes dans le checkpoint (model.X):")
for layer_num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    w_key = f'model.{layer_num}.weight'
    b_key = f'model.{layer_num}.bias'
    if w_key in checkpoint:
        print(f"  {w_key}: {checkpoint[w_key].shape}")
    if b_key in checkpoint:
        print(f"  {b_key}: {checkpoint[b_key].shape}")

# Trouver les correspondances
print("\n" + "="*60)
print("CORRESPONDANCES PAR SHAPE")
print("="*60)

# conv_body: [64, 64, 3, 3] / [64]
# conv_up1: [256, 64, 3, 3] / [256] (PixelShuffle)

for layer_num in range(1, 11):
    w_key = f'model.{layer_num}.weight'
    b_key = f'model.{layer_num}.bias'
    
    if w_key in checkpoint:
        shape = checkpoint[w_key].shape
        if shape == (64, 64, 3, 3):
            print(f"  {w_key} {shape} -> conv_body.weight ou conv_hr.weight")
        elif shape == (256, 64, 3, 3):
            print(f"  {w_key} {shape} -> conv_up1.weight ou conv_up2.weight")
        elif shape == (3, 64, 3, 3):
            print(f"  {w_key} {shape} -> conv_last.weight")
        else:
            print(f"  {w_key} {shape} -> ?")
