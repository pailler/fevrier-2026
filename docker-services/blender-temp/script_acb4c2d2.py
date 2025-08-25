
import bpy
import sys
import os
import json
import uuid
import math
from pathlib import Path

# Nettoyer la scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Configuration
OUTPUT_PATH = "/blender/output"
TEMP_PATH = "/blender/temp"

def create_material(name, color, material_type='plastic'):
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)
    
    if material_type == 'metal':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Metallic'].default_value = 1.0
        shader.inputs['Roughness'].default_value = 0.1
    elif material_type == 'glass':
        shader = nodes.new(type='ShaderNodeBsdfGlass')
    elif material_type == 'wood':
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.8
    else:  # plastic par defaut
        shader = nodes.new(type='ShaderNodeBsdfPrincipled')
        shader.inputs['Roughness'].default_value = 0.3
    
    shader.location = (0, 0)
    shader.inputs['Base Color'].default_value = (*color, 1.0)
    material.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    return material

def create_cube(size=1.0, location=(0, 0, 0), rotation=(0, 0, 0), color=None, material_type='plastic'):
    bpy.ops.mesh.primitive_cube_add(size=size, location=location)
    cube = bpy.context.active_object
    cube.rotation_euler = rotation
    cube.name = f"Cube_{uuid.uuid4().hex[:8]}"
    
    if color:
        material = create_material(f"Material_{cube.name}", color, material_type)
        cube.data.materials.append(material)
    
    return cube

def create_sphere(radius=1.0, location=(0, 0, 0), segments=32, rings=16, color=None, material_type='plastic'):
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

def add_animation(obj, animation_type='rotation', duration=5.0, **kwargs):
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = int(duration * 24)  # 24 FPS
    
    if animation_type == 'rotation':
        axis = kwargs.get('axis', 'Z')
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", frame=1)
        
        obj.rotation_euler = (0, 0, 2 * math.pi)
        obj.keyframe_insert(data_path="rotation_euler", frame=bpy.context.scene.frame_end)
        
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                fcurve.modifiers.new('CYCLES')
    
    elif animation_type == 'scaling':
        scale_factor = kwargs.get('scale_factor', 1.5)
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=1)
        
        obj.scale = (scale_factor, scale_factor, scale_factor)
        obj.keyframe_insert(data_path="scale", frame=bpy.context.scene.frame_end // 2)
        
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=bpy.context.scene.frame_end)

def export_model(format='obj', filename=None):
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
    
    return output_file

# Traitement de l'intention
intent = {"type": "create_shape", "shape": "sphere", "radius": 1.0, "location": [0, 0, 0], "segments": 32, "rings": 16, "color": [0.0, 0.0, 1.0], "material": "metal"}

try:
    if intent['type'] == 'create_shape':
        shape = intent['shape']
        color = intent.get('color', [0.8, 0.8, 0.8])
        material = intent.get('material', 'plastic')
        
        if shape == 'cube':
            obj = create_cube(
                size=intent.get('size', 1.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                rotation=tuple(intent.get('rotation', [0, 0, 0])),
                color=color,
                material_type=material
            )
        elif shape == 'sphere':
            obj = create_sphere(
                radius=intent.get('radius', 1.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                segments=intent.get('segments', 32),
                rings=intent.get('rings', 16),
                color=color,
                material_type=material
            )
        elif shape == 'cylinder':
            obj = create_cylinder(
                radius=intent.get('radius', 1.0),
                depth=intent.get('depth', 2.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                vertices=intent.get('vertices', 32),
                color=color,
                material_type=material
            )
        elif shape == 'cone':
            obj = create_cone(
                radius1=intent.get('radius1', 1.0),
                radius2=intent.get('radius2', 0.0),
                depth=intent.get('depth', 2.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                vertices=intent.get('vertices', 32),
                color=color,
                material_type=material
            )
        elif shape == 'torus':
            obj = create_torus(
                major_radius=intent.get('major_radius', 1.0),
                minor_radius=intent.get('minor_radius', 0.25),
                location=tuple(intent.get('location', [0, 0, 0])),
                color=color,
                material_type=material
            )
        elif shape == 'pyramid':
            obj = create_pyramid(
                size=intent.get('size', 1.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                color=color,
                material_type=material
            )
        elif shape == 'icosphere':
            obj = create_icosphere(
                radius=intent.get('radius', 1.0),
                location=tuple(intent.get('location', [0, 0, 0])),
                subdivisions=intent.get('subdivisions', 2),
                color=color,
                material_type=material
            )
        
        print(f"Objet {shape} cree: {obj.name}")
        
    elif intent['type'] == 'add_animation':
        if bpy.data.objects:
            obj = bpy.data.objects[-1]
            add_animation(obj, **intent)
            print(f"Animation ajoutee a {obj.name}")
    
    elif intent['type'] == 'export_model':
        output_file = export_model(
            format=intent.get('format', 'obj'),
            filename=intent.get('filename')
        )
        print(f"Modele exporte: {output_file}")
    
    elif intent['type'] == 'create_scene':
        objects = intent.get('objects', ['cube', 'sphere'])
        layout = intent.get('layout', 'random')
        
        for i, obj_type in enumerate(objects):
            x = i * 3
            if obj_type == 'cube':
                create_cube(1.0, (x, 0, 0))
            elif obj_type == 'sphere':
                create_sphere(0.5, (x, 0, 0))
            elif obj_type == 'cylinder':
                create_cylinder(0.5, 2.0, (x, 0, 0))
        
        print(f"Scene creee avec {len(objects)} objets")
    
    else:
        print(f"Type d'intention non reconnu: {intent['type']}")

except Exception as e:
    print(f"Erreur lors du traitement: {e}")

print("Script Blender termine")
