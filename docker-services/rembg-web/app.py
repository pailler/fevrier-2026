#!/usr/bin/env python3
"""
Service REMBG pour la suppression d'arrière-plan
IAHome - Application d'intelligence artificielle
"""

import os
import io
import base64
import traceback
from flask import Flask, request, jsonify, send_file, render_template
from PIL import Image
import rembg
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = '/tmp/uploads'
OUTPUT_FOLDER = '/tmp/outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

# Créer les dossiers si ils n'existent pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    """Vérifier si le fichier a une extension autorisée"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def remove_background(input_path, output_path, model_name='u2net'):
    """
    Supprimer l'arrière-plan d'une image
    
    Args:
        input_path (str): Chemin vers l'image d'entrée
        output_path (str): Chemin vers l'image de sortie
        model_name (str): Modèle REMBG à utiliser
    
    Returns:
        bool: True si succès, False sinon
    """
    try:
        print(f"🔄 Traitement REMBG: {input_path} -> {output_path}")
        print(f"📦 Modèle utilisé: {model_name}")
        
        # Charger l'image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Supprimer l'arrière-plan
        output_data = rembg.remove(input_data, model=model_name)
        
        # Sauvegarder le résultat
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        print(f"✅ REMBG terminé avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur REMBG: {str(e)}")
        traceback.print_exc()
        return False

@app.route('/')
def index():
    """Page d'accueil du service - Interface web"""
    return render_template('index.html')

@app.route('/api')
def api_info():
    """Informations sur l'API"""
    return jsonify({
        'service': 'REMBG Background Removal',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'remove_background': '/remove-background',
            'health': '/health',
            'models': '/models'
        }
    })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'rembg-web',
        'version': '1.0.0'
    })

@app.route('/models')
def models():
    """Liste des modèles disponibles"""
    available_models = [
        'u2net',           # Modèle général (recommandé)
        'u2net_human_seg', # Optimisé pour les personnes
        'u2netp',          # Version légère
        'silueta',         # Silhouette
        'isnet-general-use' # Modèle général amélioré
    ]
    
    return jsonify({
        'models': available_models,
        'default': 'u2net',
        'description': {
            'u2net': 'Modèle général, bon pour tous types d\'images',
            'u2net_human_seg': 'Optimisé pour les photos de personnes',
            'u2netp': 'Version légère, plus rapide',
            'silueta': 'Création de silhouettes',
            'isnet-general-use': 'Modèle général amélioré, plus précis'
        }
    })

@app.route('/remove-background', methods=['POST'])
def remove_background_endpoint():
    """Endpoint principal pour la suppression d'arrière-plan"""
    try:
        print("🚀 Nouvelle requête REMBG reçue")
        
        # Vérifier la présence du fichier
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Type de fichier non supporté'}), 400
        
        # Récupérer le modèle (optionnel)
        model_name = request.form.get('model', 'u2net')
        print(f"📦 Modèle demandé: {model_name}")
        
        # Sécuriser le nom de fichier
        filename = secure_filename(file.filename)
        base_name = os.path.splitext(filename)[0]
        extension = os.path.splitext(filename)[1]
        
        # Chemins des fichiers
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        output_filename = f"{base_name}_no_bg.png"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # Sauvegarder le fichier d'entrée
        file.save(input_path)
        print(f"💾 Fichier sauvegardé: {input_path}")
        
        # Traitement REMBG
        success = remove_background(input_path, output_path, model_name)
        
        if not success:
            return jsonify({'error': 'Erreur lors du traitement REMBG'}), 500
        
        # Vérifier que le fichier de sortie existe
        if not os.path.exists(output_path):
            return jsonify({'error': 'Fichier de sortie non généré'}), 500
        
        # Retourner le fichier traité
        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
            mimetype='image/png'
        )
        
    except Exception as e:
        print(f"❌ Erreur dans remove_background_endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Erreur interne: {str(e)}'}), 500

@app.route('/favicon.ico')
def favicon():
    """Favicon (retourne 204 No Content)"""
    return '', 204

if __name__ == '__main__':
    print("🚀 Démarrage du service REMBG...")
    print("📦 Modèles disponibles: u2net, u2net_human_seg, u2netp, silueta, isnet-general-use")
    print("🌐 Service accessible sur: http://localhost:8080")
    
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=False,
        threaded=True
    )
