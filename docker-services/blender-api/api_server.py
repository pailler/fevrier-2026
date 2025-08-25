#!/usr/bin/env python3
"""
API Flask amelioree pour Blender 3D
Gere les requetes du chatbot et communique avec Blender
Version 2.0 avec nouvelles fonctionnalites
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import uuid
import subprocess
import time
from pathlib import Path
import re

app = Flask(__name__)
CORS(app)

# Configuration
BLENDER_HOST = os.getenv('BLENDER_HOST', 'localhost')
BLENDER_PORT = os.getenv('BLENDER_PORT', '8080')
BLENDER_URL = f"http://{BLENDER_HOST}:{BLENDER_PORT}"
OUTPUT_PATH = "/app/output"
TEMP_PATH = "/app/temp"

# Creer les dossiers necessaires
os.makedirs(OUTPUT_PATH, exist_ok=True)
os.makedirs(TEMP_PATH, exist_ok=True)

def extract_size(text):
    """Extrait la taille depuis le texte"""
    # Recherche de nombres avec unites
    size_patterns = [
        r'(\d+(?:\.\d+)?)\s*(cm|m|mm|pixels?)',
        r'(\d+(?:\.\d+)?)\s*(centimetres?|metres?|millimetres?)',
        r'taille\s*(\d+(?:\.\d+)?)',
        r'size\s*(\d+(?:\.\d+)?)',
        r'(\d+(?:\.\d+)?)\s*unites?'
    ]
    
    for pattern in size_patterns:
        match = re.search(pattern, text.lower())
        if match:
            return float(match.group(1))
    
    # Recherche de nombres simples
    numbers = re.findall(r'\d+(?:\.\d+)?', text)
    if numbers:
        return float(numbers[0])
    
    return None

def extract_color(text):
    """Extrait la couleur depuis le texte"""
    colors = {
        'rouge': [1.0, 0.0, 0.0], 'red': [1.0, 0.0, 0.0],
        'vert': [0.0, 1.0, 0.0], 'green': [0.0, 1.0, 0.0],
        'bleu': [0.0, 0.0, 1.0], 'blue': [0.0, 0.0, 1.0],
        'jaune': [1.0, 1.0, 0.0], 'yellow': [1.0, 1.0, 0.0],
        'orange': [1.0, 0.5, 0.0], 'purple': [0.5, 0.0, 0.5],
        'violet': [0.5, 0.0, 0.5], 'pink': [1.0, 0.0, 1.0],
        'rose': [1.0, 0.0, 1.0], 'brown': [0.6, 0.4, 0.2],
        'marron': [0.6, 0.4, 0.2], 'black': [0.0, 0.0, 0.0],
        'noir': [0.0, 0.0, 0.0], 'white': [1.0, 1.0, 1.0],
        'blanc': [1.0, 1.0, 1.0], 'gray': [0.5, 0.5, 0.5],
        'gris': [0.5, 0.5, 0.5]
    }
    
    for color_name, color_value in colors.items():
        if color_name in text.lower():
            return color_value
    
    return None

def extract_material(text):
    """Extrait le type de materiau depuis le texte"""
    materials = {
        'metal': 'metal', 'metal': 'metal',
        'bois': 'wood', 'wood': 'wood',
        'plastique': 'plastic', 'plastic': 'plastic',
        'verre': 'glass', 'glass': 'glass',
        'caoutchouc': 'rubber', 'rubber': 'rubber',
        'tissu': 'fabric', 'fabric': 'fabric',
        'pierre': 'stone', 'stone': 'stone',
        'ceramique': 'ceramic', 'ceramic': 'ceramic'
    }
    
    for material_name, material_type in materials.items():
        if material_name in text.lower():
            return material_type
    
    return None

def analyze_intent(message):
    """Analyse l'intention du message utilisateur avec ameliorations"""
    lower_message = message.lower()
    
    # Formes geometriques de base
    if 'cube' in lower_message or 'carre' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'cube',
            'size': extract_size(lower_message) or 1.0,
            'location': [0, 0, 0],
            'rotation': [0, 0, 0],
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    if 'sphere' in lower_message or 'sphere' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'sphere',
            'radius': extract_size(lower_message) or 1.0,
            'location': [0, 0, 0],
            'segments': 32,
            'rings': 16,
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    if 'cylindre' in lower_message or 'cylinder' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'cylinder',
            'radius': extract_size(lower_message) or 1.0,
            'depth': 2.0,
            'location': [0, 0, 0],
            'vertices': 32,
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    if 'cone' in lower_message or 'cone' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'cone',
            'radius1': extract_size(lower_message) or 1.0,
            'radius2': 0.0,
            'depth': 2.0,
            'location': [0, 0, 0],
            'vertices': 32,
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    if 'tore' in lower_message or 'torus' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'torus',
            'major_radius': extract_size(lower_message) or 1.0,
            'minor_radius': 0.25,
            'location': [0, 0, 0],
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    # Nouvelles formes avancees
    if 'pyramide' in lower_message or 'pyramid' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'pyramid',
            'size': extract_size(lower_message) or 1.0,
            'location': [0, 0, 0],
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    if 'icosphere' in lower_message or 'icosphere' in lower_message:
        return {
            'type': 'create_shape',
            'shape': 'icosphere',
            'radius': extract_size(lower_message) or 1.0,
            'location': [0, 0, 0],
            'subdivisions': 2,
            'color': extract_color(lower_message),
            'material': extract_material(lower_message)
        }
    
    # Animations
    if 'animation' in lower_message or 'tourner' in lower_message or 'rotate' in lower_message:
        return {
            'type': 'add_animation',
            'animation_type': 'rotation',
            'duration': 5.0,
            'axis': 'Z'
        }
    
    if 'scaling' in lower_message or 'redimensionner' in lower_message:
        return {
            'type': 'add_animation',
            'animation_type': 'scaling',
            'duration': 3.0,
            'scale_factor': 1.5
        }
    
    # Export
    if 'export' in lower_message or 'exporter' in lower_message:
        format_type = 'obj'
        if 'stl' in lower_message:
            format_type = 'stl'
        elif 'fbx' in lower_message:
            format_type = 'fbx'
        elif 'gltf' in lower_message:
            format_type = 'gltf'
        elif 'dae' in lower_message or 'collada' in lower_message:
            format_type = 'dae'
        
        return {
            'type': 'export_model',
            'format': format_type,
            'filename': f"model_{uuid.uuid4().hex[:8]}.{format_type}"
        }
    
    # Effets speciaux
    if 'transparent' in lower_message or 'transparence' in lower_message:
        return {
            'type': 'add_effect',
            'effect': 'transparency',
            'alpha': 0.5
        }
    
    if 'brillant' in lower_message or 'shiny' in lower_message:
        return {
            'type': 'add_effect',
            'effect': 'shiny',
            'metallic': 1.0,
            'roughness': 0.1
        }
    
    # Scenes complexes
    if 'scene' in lower_message or 'scene' in lower_message:
        return {
            'type': 'create_scene',
            'objects': ['cube', 'sphere', 'cylinder'],
            'layout': 'random'
        }
    
    # Aide
    if 'aide' in lower_message or 'help' in lower_message or 'formes' in lower_message:
        return {
            'type': 'help',
            'category': 'shapes'
        }
    
    return {
        'type': 'unknown',
        'message': 'Je ne comprends pas cette demande. Essayez de decrire une forme 3D specifique.'
    }

def create_enhanced_blender_script(intent):
    """Cree un script Blender ameliore base sur l'intention"""
    script_content = """
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
intent = """ + json.dumps(intent) + """

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
"""
    
    return script_content

# Routes API
@app.route('/health', methods=['GET'])
def health_check():
    """Verification de sante de l'API"""
    return jsonify({
        'status': 'healthy',
        'service': 'blender-3d-api',
        'version': '2.0',
        'timestamp': time.time()
    })

@app.route('/create_shape', methods=['POST'])
def create_shape():
    """Cree une forme 3D"""
    try:
        data = request.get_json()
        intent = analyze_intent(data.get('message', ''))
        
        if intent['type'] == 'create_shape':
            script = create_enhanced_blender_script(intent)
            
            # Sauvegarder le script
            script_file = os.path.join(TEMP_PATH, f"script_{uuid.uuid4().hex[:8]}.py")
            with open(script_file, 'w') as f:
                f.write(script)
            
            # Executer avec Blender
            result = subprocess.run([
                'blender', '--background', '--python', script_file
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                return jsonify({
                    'success': True,
                    'message': f"Forme {intent['shape']} creee avec succes",
                    'object_name': f"{intent['shape'].capitalize()}_{uuid.uuid4().hex[:8]}",
                    'script_file': script_file
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f"Erreur Blender: {result.stderr}"
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': 'Type d\'intention non supporte'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/export', methods=['POST'])
def export_model():
    """Exporte le modele actuel"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'obj')
        filename = data.get('filename', f"model_{uuid.uuid4().hex[:8]}.{format_type}")
        
        script = create_enhanced_blender_script({
            'type': 'export_model',
            'format': format_type,
            'filename': filename
        })
        
        script_file = os.path.join(TEMP_PATH, f"export_{uuid.uuid4().hex[:8]}.py")
        with open(script_file, 'w') as f:
            f.write(script)
        
        result = subprocess.run([
            'blender', '--background', '--python', script_file
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            output_file = os.path.join(OUTPUT_PATH, filename)
            if os.path.exists(output_file):
                return jsonify({
                    'success': True,
                    'message': f"Modele exporte en {format_type.upper()}",
                    'filename': filename,
                    'file_path': output_file
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Fichier exporte non trouve'
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': f"Erreur export: {result.stderr}"
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/process_message', methods=['POST'])
def process_message():
    """Traite un message du chatbot"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        conversation = data.get('conversation', [])
        
        # Analyser l'intention
        intent = analyze_intent(message)
        
        if intent['type'] == 'help':
            return jsonify({
                'response': """Voici les formes 3D que je peux creer :

**Formes de base :**
- Cube (ex: "cree un cube rouge de 2cm")
- Sphere (ex: "une sphere bleue metallique")
- Cylindre (ex: "cylindre vert en bois")
- Cone (ex: "cone orange transparent")
- Tore (ex: "tore violet brillant")

**Formes avancees :**
- Pyramide (ex: "pyramide doree")
- Icospere (ex: "icosphere lisse")

**Animations :**
- Rotation (ex: "cube qui tourne")
- Mise a l'echelle (ex: "sphere qui grandit")

**Export :**
- OBJ, STL, FBX, GLTF, DAE
- (ex: "exporter en STL")

**Materiaux :**
- Metal, bois, plastique, verre, caoutchouc, tissu, pierre, ceramique

**Couleurs :**
- Rouge, vert, bleu, jaune, orange, violet, rose, marron, noir, blanc, gris""",
                'actions': [{
                    'type': 'help',
                    'description': 'Affiche l\'aide des formes disponibles'
                }]
            })
        
        elif intent['type'] == 'unknown':
            return jsonify({
                'response': intent['message'],
                'actions': []
            })
        
        else:
            # Creer et executer le script Blender
            script = create_enhanced_blender_script(intent)
            script_file = os.path.join(TEMP_PATH, f"script_{uuid.uuid4().hex[:8]}.py")
            
            with open(script_file, 'w') as f:
                f.write(script)
            
            result = subprocess.run([
                'blender', '--background', '--python', script_file
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                response_message = f"{intent['type'].replace('_', ' ').title()} traite avec succes !"
                
                if intent['type'] == 'create_shape':
                    response_message = f"{intent['shape'].capitalize()} cree avec succes !"
                elif intent['type'] == 'export_model':
                    response_message = f"Modele exporte en {intent['format'].upper()} !"
                
                return jsonify({
                    'response': response_message,
                    'actions': [{
                        'type': intent['type'],
                        'description': f'Execution de {intent["type"]}',
                        'result': 'success'
                    }]
                })
            else:
                return jsonify({
                    'response': f"Erreur lors du traitement : {result.stderr}",
                    'actions': [{
                        'type': 'error',
                        'description': 'Erreur Blender',
                        'result': result.stderr
                    }]
                })
                
    except Exception as e:
        return jsonify({
            'response': f"Erreur : {str(e)}",
            'actions': [{
                'type': 'error',
                'description': 'Exception',
                'result': str(e)
            }]
        })

@app.route('/list_files', methods=['GET'])
def list_files():
    """Liste les fichiers 3D generes"""
    try:
        files = []
        for file in os.listdir(OUTPUT_PATH):
            if file.endswith(('.obj', '.stl', '.fbx', '.gltf', '.dae')):
                file_path = os.path.join(OUTPUT_PATH, file)
                stat = os.stat(file_path)
                files.append({
                    'name': file,
                    'size': stat.st_size,
                    'created': stat.st_ctime,
                    'type': file.split('.')[-1].upper()
                })
        
        return jsonify({
            'success': True,
            'files': sorted(files, key=lambda x: x['created'], reverse=True)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Demarrage de l'API Blender 3D v2.0...")
    print(f"Dossier de sortie: {OUTPUT_PATH}")
    print(f"Dossier temporaire: {TEMP_PATH}")
    print("API disponible sur http://localhost:3001")
    
    app.run(host='0.0.0.0', port=3001, debug=True)
