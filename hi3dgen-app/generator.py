"""
Hi3DGen — génération 3D image → mesh GLB.
Pipeline Stable-X/Hi3DGen (normal bridging).
"""
import os
import sys
import uuid
from pathlib import Path

# SPCONV_ALGO pour compatibilité (avant import torch/spconv)
os.environ.setdefault("SPCONV_ALGO", "native")

import numpy as np
import torch
from PIL import Image

# Lazy load pour éviter import au démarrage si pas utilisé
_pipeline = None
_normal_predictor = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from trellis.pipelines import TrellisImageTo3DPipeline
        _pipeline = TrellisImageTo3DPipeline.from_pretrained("Stable-X/trellis-normal-v0-1")
        _pipeline.cuda()
    return _pipeline


def _get_normal_predictor():
    global _normal_predictor
    if _normal_predictor is None:
        _normal_predictor = torch.hub.load(
            "hugoycj/StableNormal",
            "StableNormal_turbo",
            trust_repo=True,
            yoso_version="yoso-normal-v1-8-1",
        )
    return _normal_predictor


def generate_mesh(
    image: Image.Image,
    output_dir: str,
    seed: int = -1,
    ss_guidance_strength: float = 3.0,
    ss_sampling_steps: int = 50,
    slat_guidance_strength: float = 3.0,
    slat_sampling_steps: int = 6,
) -> str:
    """
    Génère un mesh GLB à partir d'une image.
    Retourne le chemin du fichier GLB généré.
    """
    if image is None:
        raise ValueError("Image requise")

    pipeline = _get_pipeline()
    normal_predictor = _get_normal_predictor()

    max_seed = int(np.iinfo(np.int32).max)
    if seed == -1:
        seed = int(np.random.randint(0, max_seed))

    # Préprocess image
    image = pipeline.preprocess_image(image, resolution=1024)

    # Estimation des normales (normal bridging)
    normal_image = normal_predictor(
        image,
        resolution=768,
        match_input_resolution=True,
        data_type="object",
    )

    # Génération 3D
    from trellis.utils import render_utils

    outputs = pipeline.run(
        normal_image,
        seed=seed,
        formats=["mesh"],
        preprocess_image=False,
        sparse_structure_sampler_params={
            "steps": ss_sampling_steps,
            "cfg_strength": ss_guidance_strength,
        },
        slat_sampler_params={
            "steps": slat_sampling_steps,
            "cfg_strength": slat_guidance_strength,
        },
    )

    generated_mesh = outputs["mesh"][0]

    # Export GLB
    import trimesh
    os.makedirs(output_dir, exist_ok=True)
    mesh_path = str(Path(output_dir) / "mesh.glb")
    trimesh_mesh = generated_mesh.to_trimesh(transform_pose=True)
    trimesh_mesh.export(mesh_path)

    return mesh_path
