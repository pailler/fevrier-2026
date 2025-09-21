#!/usr/bin/env python3
"""
Script Blender amélioré pour l'API 3D
Version 2.0 avec matériaux, animations et nouvelles formes
"""

import bpy
import sys
import os
import json
import uuid
import math
from pathlib import Path

# Configuration
OUTPUT_PATH = "/blender/output"
TEMP_PATH = "/blender/temp"

def create_material(name, color, material_type='plastic'):
    """Crée un matériau avec couleur et type"""
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    
    # Nettoyer les nœuds existants
    nodes.clear()
    
    # Nœud de sortie
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)
    
    # Nœud principal selon le type de matériau
    if material_type == 'metal':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Metallic'].default_value = 1.0
        shader.inputs['Roughness'].default_value = 0.1
    elif material_type == 'glass':
        shader = nodes.new(type='ShaderNodeBsdfGlass')
    elif material_type == 'wood':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.8
    elif material_type == 'rubber':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.9
    elif material_type == 'fabric':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 1.0
    elif material_type == 'stone':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.7
    elif material_type == 'ceramic':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.2
    else:  # plastic par défaut
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.3
    
    shader.location = (0, 0)
    shader.inputs['Base Color'].default_value = (*color, 1.0)
    
    # Connecter les nœuds
    material.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    
    return material

def create_cube(size=1.0, location=(0, 0, 0), rotation=(0, 0, 0), color=None, material_type='plastic'):
    """Crée un cube avec matériau"""
    bpy.ops.mesh.primitive_cube_add(size=size, location=location)
    cube = bpy.context.active_object
    cube.rotation_euler = rotation
    cube.name = f"Cube_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{cube.name}", color, material_type)
        cube.data.materials.append(material)
    
    return cube

def create_sphere(radius=1.0, location=(0, 0, 0), segments=32, rings=16, color=None, material_type='plastic'):
    """Crée une sphère avec matériau"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, 
        location=location,
        segments=segments,
        ring_count=rings
    )
    sphere = bpy.context.active_object
    sphere.name = f"Sphere_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{sphere.name}", color, material_type)
        sphere.data.materials.append(material)
    
    return sphere

def create_cylinder(radius=1.0, depth=2.0, location=(0, 0, 0), vertices=32, color=None, material_type='plastic'):
    """Crée un cylindre avec matériau"""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius,
        depth=depth,
        location=location,
        vertices=vertices
    )
    cylinder = bpy.context.active_object
    cylinder.name = f"Cylinder_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{cylinder.name}", color, material_type)
        cylinder.data.materials.append(material)
    
    return cylinder

def create_cone(radius1=1.0, radius2=0.0, depth=2.0, location=(0, 0, 0), vertices=32, color=None, material_type='plastic'):
    """Crée un cône avec matériau"""
    bpy.ops.mesh.primitive_cone_add(
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
        vertices=vertices
    )
    cone = bpy.context.active_object
    cone.name = f"Cone_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{cone.name}", color, material_type)
        cone.data.materials.append(material)
    
    return cone

def create_torus(major_radius=1.0, minor_radius=0.25, location=(0, 0, 0), color=None, material_type='plastic'):
    """Crée un tore avec matériau"""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location
    )
    torus = bpy.context.active_object
    torus.name = f"Torus_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{torus.name}", color, material_type)
        torus.data.materials.append(material)
    
    return torus

def create_pyramid(size=1.0, location=(0, 0, 0), color=None, material_type='plastic'):
    """Crée une pyramide"""
    bpy.ops.mesh.primitive_cone_add(
        radius1=size,
        radius2=0.0,
        depth=size * 2,
        location=location,
        vertices=4
    )
    pyramid = bpy.context.active_object
    pyramid.name = f"Pyramid_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{pyramid.name}", color, material_type)
        pyramid.data.materials.append(material)
    
    return pyramid

def create_icosphere(radius=1.0, location=(0, 0, 0), subdivisions=2, color=None, material_type='plastic'):
    """Crée une icosphère"""
    bpy.ops.mesh.primitive_ico_sphere_add(
        radius=radius,
        location=location,
        subdivisions=subdivisions
    )
    icosphere = bpy.context.active_object
    icosphere.name = f"Icosphere_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{icosphere.name}", color, material_type)
        icosphere.data.materials.append(material)
    
    return icosphere

def create_monkey_suzanne(location=(0, 0, 0), color=None, material_type='plastic'):
    """Crée le monkey Suzanne (mascotte de Blender)"""
    bpy.ops.mesh.primitive_monkey_add(location=location)
    monkey = bpy.context.active_object
    monkey.name = f"Monkey_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{monkey.name}", color, material_type)
        monkey.data.materials.append(material)
    
    return monkey

def create_plane(size=2.0, location=(0, 0, 0), color=None, material_type='plastic'):
    """Crée un plan"""
    bpy.ops.mesh.primitive_plane_add(size=size, location=location)
    plane = bpy.context.active_object
    plane.name = f"Plane_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{plane.name}", color, material_type)
        plane.data.materials.append(material)
    
    return plane

def add_animation(obj, animation_type='rotation', duration=5.0, **kwargs):
    """Ajoute une animation à un objet"""
    # Définir la durée de l'animation
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = int(duration * 24)  # 24 FPS
    
    if animation_type == 'rotation':
        axis = kwargs.get('axis', 'Z')
        # Animation de rotation
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", frame=1)
        
        obj.rotation_euler = (0, 0, 2 * math.pi)
        obj.keyframe_insert(data_path="rotation_euler", frame=bpy.context.scene.frame_end)
        
        # Rendre l'animation cyclique
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                fcurve.modifiers.new('CYCLES')
    
    elif animation_type == 'scaling':
        scale_factor = kwargs.get('scale_factor', 1.5)
        # Animation de mise à l'échelle
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=1)
        
        obj.scale = (scale_factor, scale_factor, scale_factor)
        obj.keyframe_insert(data_path="scale", frame=bpy.context.scene.frame_end // 2)
        
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=bpy.context.scene.frame_end)
    
    elif animation_type == 'bounce':
        # Animation de rebond
        obj.location.z = 0
        obj.keyframe_insert(data_path="location", frame=1)
        
        obj.location.z = 2
        obj.keyframe_insert(data_path="location", frame=bpy.context.scene.frame_end // 2)
        
        obj.location.z = 0
        obj.keyframe_insert(data_path="location", frame=bpy.context.scene.frame_end)

def add_lighting():
    """Ajoute un éclairage de base à la scène"""
    # Supprimer les lumières existantes
    for obj in bpy.data.objects:
        if obj.type == 'LIGHT':
            bpy.data.objects.remove(obj, do_unlink=True)
    
    # Lumière principale
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 5.0
    sun.rotation_euler = (math.radians(45), 0, math.radians(45))
    
    # Lumière d'appoint
    bpy.ops.object.light_add(type='POINT', location=(-3, -3, 5))
    point_light = bpy.context.active_object
    point_light.data.energy = 100.0

def setup_camera():
    """Configure la caméra pour un bon rendu"""
    # Supprimer les caméras existantes
    for obj in bpy.data.objects:
        if obj.type == 'CAMERA':
            bpy.data.objects.remove(obj, do_unlink=True)
    
    # Créer une nouvelle caméra
    bpy.ops.object.camera_add(location=(5, -5, 3))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(60), 0, math.radians(45))
    
    # Définir comme caméra active
    bpy.context.scene.camera = camera

def export_model(format='obj', filename=None):
    """Exporte le modèle avec support de nouveaux formats"""
    if not filename:
        filename = f"model_{uuid.uuid4().hex[:8]}.{format}"
    
    output_file = os.path.join(OUTPUT_PATH, filename)
    
    bpy.ops.object.select_all(action='SELECT')
    
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
    elif format.lower() == 'dae':
        bpy.ops.wm.collada_export(
            filepath=output_file
        )
    elif format.lower() == 'blend':
        bpy.ops.wm.save_as_mainfile(
            filepath=output_file
        )
    
    return output_file

def create_scene_with_objects(objects_list, layout='grid'):
    """Crée une scène avec plusieurs objets"""
    created_objects = []
    
    for i, obj_info in enumerate(objects_list):
        obj_type = obj_info.get('type', 'cube')
        color = obj_info.get('color', [0.8, 0.8, 0.8])
        material = obj_info.get('material', 'plastic')
        
        # Position selon le layout
        if layout == 'grid':
            x = (i % 3) * 3
            y = (i // 3) * 3
            location = (x, y, 0)
        elif layout == 'circle':
            angle = (i / len(objects_list)) * 2 * math.pi
            radius = 3
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            location = (x, y, 0)
        else:  # random
            import random
            x = random.uniform(-5, 5)
            y = random.uniform(-5, 5)
            location = (x, y, 0)
        
        # Créer l'objet
        if obj_type == 'cube':
            obj = create_cube(1.0, location, color=color, material_type=material)
        elif obj_type == 'sphere':
            obj = create_sphere(0.5, location, color=color, material_type=material)
        elif obj_type == 'cylinder':
            obj = create_cylinder(0.5, 2.0, location, color=color, material_type=material)
        elif obj_type == 'cone':
            obj = create_cone(0.5, 0.0, 2.0, location, color=color, material_type=material)
        elif obj_type == 'torus':
            obj = create_torus(0.5, 0.1, location, color=color, material_type=material)
        elif obj_type == 'pyramid':
            obj = create_pyramid(0.5, location, color=color, material_type=material)
        elif obj_type == 'icosphere':
            obj = create_icosphere(0.5, location, color=color, material_type=material)
        elif obj_type == 'monkey':
            obj = create_monkey_suzanne(location, color=color, material_type=material)
        else:
            continue
        
        created_objects.append(obj)
    
    return created_objects

def main():
    """Fonction principale"""
    print("🎨 Démarrage de l'API Blender 3D v2.0...")
    
    # Configuration de base
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.device = 'GPU'
    
    # Créer les dossiers nécessaires
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    os.makedirs(TEMP_PATH, exist_ok=True)
    
    # Nettoyer la scène
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Ajouter éclairage et caméra
    add_lighting()
    setup_camera()
    
    # Créer des objets de test avec matériaux
    print("🧪 Création d'objets de test...")
    
    # Cube rouge métallique
    cube = create_cube(1.0, (0, 0, 0), color=[1.0, 0.0, 0.0], material_type='metal')
    print(f"✅ Cube métallique rouge créé: {cube.name}")
    
    # Sphère bleue en verre
    sphere = create_sphere(0.5, (2, 0, 0), color=[0.0, 0.0, 1.0], material_type='glass')
    print(f"✅ Sphère en verre bleue créée: {sphere.name}")
    
    # Cylindre vert en bois
    cylinder = create_cylinder(0.5, 2.0, (-2, 0, 0), color=[0.0, 1.0, 0.0], material_type='wood')
    print(f"✅ Cylindre en bois vert créé: {cylinder.name}")
    
    # Pyramide dorée
    pyramid = create_pyramid(0.5, (0, 2, 0), color=[1.0, 0.8, 0.0], material_type='ceramic')
    print(f"✅ Pyramide dorée créée: {pyramid.name}")
    
    # Ajouter une animation de rotation au cube
    add_animation(cube, 'rotation', 5.0)
    print(f"✅ Animation de rotation ajoutée au cube")
    
    # Exporter un modèle de test
    test_file = export_model('obj', 'test_enhanced_objects.obj')
    print(f"✅ Modèle de test exporté: {test_file}")
    
    print("✅ API Blender 3D v2.0 prête")
    print("🎯 Blender fonctionne en mode headless avec matériaux et animations")
    print("📁 Dossier de sortie:", OUTPUT_PATH)
    print("📦 Objets créés:", len(bpy.data.objects))
    print("🎨 Matériaux créés:", len(bpy.data.materials))
    
    # Garder Blender ouvert
    while True:
        import time
        time.sleep(1)

if __name__ == "__main__":
    main()

