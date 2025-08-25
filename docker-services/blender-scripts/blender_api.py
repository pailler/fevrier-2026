#!/usr/bin/env python3
"""
Script Blender pour l'API 3D
S'exécute en mode headless pour traiter les requêtes
"""

import bpy
import sys
import os
import json
import uuid
from pathlib import Path

# Configuration
OUTPUT_PATH = "/blender/output"
TEMP_PATH = "/blender/temp"

def create_cube(size=1.0, location=(0, 0, 0), rotation=(0, 0, 0)):
    """Crée un cube"""
    bpy.ops.mesh.primitive_cube_add(size=size, location=location)
    cube = bpy.context.active_object
    cube.rotation_euler = rotation
    cube.name = f"Cube_{uuid.uuid4().hex[:8]}"
    return cube

def create_sphere(radius=1.0, location=(0, 0, 0), segments=32, rings=16):
    """Crée une sphère"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, 
        location=location,
        segments=segments,
        ring_count=rings
    )
    sphere = bpy.context.active_object
    sphere.name = f"Sphere_{uuid.uuid4().hex[:8]}"
    return sphere

def create_cylinder(radius=1.0, depth=2.0, location=(0, 0, 0), vertices=32):
    """Crée un cylindre"""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius,
        depth=depth,
        location=location,
        vertices=vertices
    )
    cylinder = bpy.context.active_object
    cylinder.name = f"Cylinder_{uuid.uuid4().hex[:8]}"
    return cylinder

def create_cone(radius1=1.0, radius2=0.0, depth=2.0, location=(0, 0, 0), vertices=32):
    """Crée un cône"""
    bpy.ops.mesh.primitive_cone_add(
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
        vertices=vertices
    )
    cone = bpy.context.active_object
    cone.name = f"Cone_{uuid.uuid4().hex[:8]}"
    return cone

def create_torus(major_radius=1.0, minor_radius=0.25, location=(0, 0, 0)):
    """Crée un tore"""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location
    )
    torus = bpy.context.active_object
    torus.name = f"Torus_{uuid.uuid4().hex[:8]}"
    return torus

def export_model(format='obj', filename=None):
    """Exporte le modèle"""
    if not filename:
        filename = f"model_{uuid.uuid4().hex[:8]}.{format}"
    
    output_file = os.path.join(OUTPUT_PATH, filename)
    
    # Sélectionner tous les objets
    bpy.ops.object.select_all(action='SELECT')
    
    # Exporter selon le format
    if format.lower() == 'obj':
        bpy.ops.export_scene.obj(
            filepath=output_file,
            use_selection=True,
            use_materials=True
        )
    elif format.lower() == 'stl':
        bpy.ops.export_mesh.stl(
            filepath=output_file,
            use_selection=True
        )
    elif format.lower() == 'fbx':
        bpy.ops.export_scene.fbx(
            filepath=output_file,
            use_selection=True
        )
    elif format.lower() == 'gltf':
        bpy.ops.export_scene.gltf(
            filepath=output_file,
            use_selection=True
        )
    
    return output_file

def main():
    """Fonction principale"""
    print("🎨 Démarrage de l'API Blender 3D...")
    
    # Configuration de base
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.device = 'GPU'
    
    # Créer les dossiers nécessaires
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    os.makedirs(TEMP_PATH, exist_ok=True)
    
    # Créer un cube de test
    test_cube = create_cube(1.0, (0, 0, 0), (0, 0, 0))
    print(f"✅ Cube de test créé: {test_cube.name}")
    
    # Créer une sphère de test
    test_sphere = create_sphere(0.5, (2, 0, 0), 16, 8)
    print(f"✅ Sphère de test créée: {test_sphere.name}")
    
    # Exporter un modèle de test
    test_file = export_model('obj', 'test_objects.obj')
    print(f"✅ Modèle de test exporté: {test_file}")
    
    print("✅ API Blender 3D prête")
    print("🎯 Blender fonctionne en mode headless")
    print("📁 Dossier de sortie:", OUTPUT_PATH)
    print("📦 Objets créés:", len(bpy.data.objects))
    
    # Garder Blender ouvert
    while True:
        import time
        time.sleep(1)

if __name__ == "__main__":
    main()
