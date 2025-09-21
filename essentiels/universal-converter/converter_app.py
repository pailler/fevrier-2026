#!/usr/bin/env python3
"""
Convertisseur Universel v1 - IAHome
API Flask pour la conversion de fichiers
"""

import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_file, redirect, url_for
from werkzeug.utils import secure_filename
import mimetypes
import uuid
from datetime import datetime
import logging
import requests
import json

# Configuration
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max
app.config['UPLOAD_FOLDER'] = '/app/uploads'
app.config['DOWNLOAD_FOLDER'] = '/app/downloads'

# Créer les dossiers nécessaires
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de l'API IAhome
IAHOME_API_URL = os.getenv('IAHOME_API_URL', 'http://localhost:3000')

def verify_token(token):
    """Vérifier le token d'accès avec l'API IAhome"""
    try:
        if not token:
            return False, "Token manquant"
        
        # Appeler l'API de vérification de token
        response = requests.get(f"{IAHOME_API_URL}/api/converter-token?token={token}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Token validé pour l'utilisateur: {data.get('user_email', 'Inconnu')}")
            return True, data
        else:
            logger.warning(f"Token invalide: {response.status_code}")
            return False, "Token invalide ou expiré"
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur lors de la vérification du token: {e}")
        return False, "Erreur de vérification du token"
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la vérification du token: {e}")
        return False, "Erreur interne"

def require_token(f):
    """Décorateur pour exiger un token valide"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Vérifier si c'est une requête API
        if request.endpoint in ['convert_file_api', 'get_formats']:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                token = request.args.get('token')
            
            if not token:
                return jsonify({'error': 'Token d\'accès requis'}), 401
            
            valid, data = verify_token(token)
            if not valid:
                return jsonify({'error': data}), 401
            
            # Ajouter les informations utilisateur à la requête
            request.user_info = data
        else:
            # Pour les pages web, vérifier le token dans les paramètres
            token = request.args.get('token')
            if not token:
                return render_template('unauthorized.html'), 401
            
            valid, data = verify_token(token)
            if not valid:
                return render_template('unauthorized.html', error=data), 401
            
            # Ajouter les informations utilisateur à la requête
            request.user_info = data
        
        return f(*args, **kwargs)
    return decorated_function

# Formats supportés
SUPPORTED_FORMATS = {
    'images': {
        'input': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
        'output': ['.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg', '.ico'],
        'converter': 'imagemagick'
    },
    'documents': {
        'input': ['.docx', '.doc', '.odt', '.rtf', '.txt', '.html', '.md'],
        'output': ['.pdf', '.docx', '.doc', '.odt', '.rtf', '.txt', '.html', '.md'],
        'converter': 'libreoffice'
    },
    'pdf_documents': {
        'input': ['.pdf'],
        'output': ['.txt', '.html'],
        'converter': 'libreoffice_pdf'
    },
    'audio': {
        'input': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
        'output': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
        'converter': 'ffmpeg'
    },
    'video': {
        'input': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
        'output': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
        'converter': 'ffmpeg'
    }
}

def get_file_category(filename):
    """Détermine la catégorie du fichier basée sur son extension"""
    ext = Path(filename).suffix.lower()
    for category, formats in SUPPORTED_FORMATS.items():
        if ext in formats['input']:
            return category
    return None

def is_conversion_supported(input_file, output_format):
    """Vérifie si la conversion est supportée"""
    category = get_file_category(input_file)
    if not category:
        return False
    
    output_ext = f'.{output_format.lower()}'
    return output_ext in SUPPORTED_FORMATS[category]['output']

def convert_with_imagemagick(input_path, output_path, output_format):
    """Conversion d'images avec ImageMagick"""
    try:
        cmd = ['convert', input_path, output_path]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return result.returncode == 0, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Timeout lors de la conversion"
    except Exception as e:
        return False, str(e)

def convert_with_libreoffice(input_path, output_path, output_format):
    """Conversion de documents avec LibreOffice"""
    try:
        # Créer un dossier temporaire pour LibreOffice
        temp_dir = tempfile.mkdtemp()
        
        # Commande LibreOffice headless
        cmd = [
            'libreoffice',
            '--headless',
            '--convert-to', output_format,
            '--outdir', temp_dir,
            input_path
        ]
        
        logger.info(f"Exécution de la commande LibreOffice: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        logger.info(f"Résultat LibreOffice: returncode={result.returncode}, stdout={result.stdout}, stderr={result.stderr}")
        
        if result.returncode == 0:
            # Chercher tous les fichiers dans le dossier temporaire
            temp_files = list(Path(temp_dir).glob("*"))
            logger.info(f"Fichiers trouvés dans {temp_dir}: {[str(f) for f in temp_files]}")
            
            if temp_files:
                # Prendre le fichier le plus récent (probablement le fichier converti)
                converted_file = max(temp_files, key=os.path.getctime)
                logger.info(f"Fichier converti sélectionné: {converted_file}")
                
                # Copier le fichier vers la destination finale
                shutil.copy2(str(converted_file), output_path)
                shutil.rmtree(temp_dir)
                
                # Vérifier que le fichier de destination existe
                if os.path.exists(output_path):
                    logger.info(f"Conversion réussie: {output_path}")
                    return True, ""
                else:
                    return False, "Erreur lors de la copie du fichier converti"
            else:
                shutil.rmtree(temp_dir)
                return False, "Aucun fichier converti trouvé dans le dossier temporaire"
        else:
            shutil.rmtree(temp_dir)
            return False, f"LibreOffice error: {result.stderr}"
    except subprocess.TimeoutExpired:
        return False, "Timeout lors de la conversion"
    except Exception as e:
        logger.error(f"Erreur LibreOffice: {str(e)}")
        return False, str(e)

def convert_with_ffmpeg(input_path, output_path, output_format):
    """Conversion audio/vidéo avec FFmpeg"""
    try:
        cmd = ['ffmpeg', '-i', input_path, '-y', output_path]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        return result.returncode == 0, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Timeout lors de la conversion"
    except Exception as e:
        return False, str(e)

def convert_with_libreoffice_pdf(input_path, output_path, output_format):
    """Conversion de PDF avec LibreOffice (extraction de texte)"""
    try:
        # Créer un dossier temporaire pour LibreOffice
        temp_dir = tempfile.mkdtemp()
        
        # Pour les PDF, on utilise LibreOffice pour extraire le texte
        # LibreOffice peut ouvrir les PDF et les convertir en texte
        cmd = [
            'libreoffice',
            '--headless',
            '--convert-to', output_format,
            '--outdir', temp_dir,
            input_path
        ]
        
        logger.info(f"Exécution de la commande LibreOffice PDF: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        logger.info(f"Résultat LibreOffice PDF: returncode={result.returncode}, stdout={result.stdout}, stderr={result.stderr}")
        
        if result.returncode == 0:
            # Chercher tous les fichiers dans le dossier temporaire
            temp_files = list(Path(temp_dir).glob("*"))
            logger.info(f"Fichiers trouvés dans {temp_dir}: {[str(f) for f in temp_files]}")
            
            if temp_files:
                # Prendre le fichier le plus récent
                converted_file = max(temp_files, key=os.path.getctime)
                logger.info(f"Fichier converti sélectionné: {converted_file}")
                
                # Copier le fichier vers la destination finale
                shutil.copy2(str(converted_file), output_path)
                shutil.rmtree(temp_dir)
                
                # Vérifier que le fichier de destination existe
                if os.path.exists(output_path):
                    logger.info(f"Conversion PDF réussie: {output_path}")
                    return True, ""
                else:
                    return False, "Erreur lors de la copie du fichier converti"
            else:
                shutil.rmtree(temp_dir)
                return False, "Aucun fichier converti trouvé dans le dossier temporaire"
        else:
            shutil.rmtree(temp_dir)
            return False, f"LibreOffice PDF error: {result.stderr}"
    except subprocess.TimeoutExpired:
        return False, "Timeout lors de la conversion"
    except Exception as e:
        logger.error(f"Erreur LibreOffice PDF: {str(e)}")
        return False, str(e)

def convert_file(input_path, output_format):
    """Convertit un fichier vers le format de sortie"""
    input_name = Path(input_path).stem
    output_filename = f"{input_name}.{output_format}"
    output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)
    
    logger.info(f"Conversion: {input_path} -> {output_path}")
    
    # Déterminer la catégorie et le convertisseur
    category = get_file_category(input_path)
    if not category:
        logger.error(f"Format de fichier non supporté: {input_path}")
        return False, "Format de fichier non supporté", None
    
    converter = SUPPORTED_FORMATS[category]['converter']
    logger.info(f"Catégorie: {category}, Convertisseur: {converter}")
    
    # Effectuer la conversion
    if converter == 'imagemagick':
        success, error = convert_with_imagemagick(input_path, output_path, output_format)
    elif converter == 'libreoffice':
        success, error = convert_with_libreoffice(input_path, output_path, output_format)
    elif converter == 'libreoffice_pdf':
        success, error = convert_with_libreoffice_pdf(input_path, output_path, output_format)
    elif converter == 'ffmpeg':
        success, error = convert_with_ffmpeg(input_path, output_path, output_format)
    else:
        logger.error(f"Convertisseur non disponible: {converter}")
        return False, "Convertisseur non disponible", None
    
    if success and os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        logger.info(f"Conversion réussie: {output_filename} ({file_size} bytes)")
        return True, "", output_filename
    else:
        logger.error(f"Échec de la conversion: {error}")
        return False, error, None

@app.route('/')
@require_token
def index():
    """Page d'accueil du convertisseur"""
    return render_template('index.html', formats=SUPPORTED_FORMATS)

@app.route('/api/convert', methods=['POST'])
@require_token
def convert_file_api():
    """API de conversion de fichiers"""
    try:
        logger.info(f"Requête de conversion reçue: {request.form}")
        
        # Vérifier si un fichier a été uploadé
        if 'file' not in request.files:
            logger.warning("Aucun fichier fourni dans la requête")
            return jsonify({'error': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.warning("Nom de fichier vide")
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        # Vérifier le format de sortie
        output_format = request.form.get('output_format')
        if not output_format:
            logger.warning("Format de sortie non spécifié")
            return jsonify({'error': 'Format de sortie non spécifié'}), 400
        
        logger.info(f"Fichier: {file.filename}, Format de sortie: {output_format}")
        
        # Vérifier si la conversion est supportée
        if not is_conversion_supported(file.filename, output_format):
            logger.warning(f"Conversion non supportée: {file.filename} -> {output_format}")
            return jsonify({'error': 'Conversion non supportée'}), 400
        
        # Sauvegarder le fichier uploadé
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        logger.info(f"Sauvegarde du fichier: {input_path}")
        file.save(input_path)
        
        # Vérifier que le fichier a été sauvegardé
        if not os.path.exists(input_path):
            logger.error(f"Fichier non sauvegardé: {input_path}")
            return jsonify({'error': 'Erreur lors de la sauvegarde du fichier'}), 500
        
        # Convertir le fichier
        logger.info(f"Début de la conversion: {input_path} -> {output_format}")
        success, error, output_filename = convert_file(input_path, output_format)
        
        # Nettoyer le fichier d'entrée
        try:
            os.remove(input_path)
        except Exception as e:
            logger.warning(f"Impossible de supprimer le fichier d'entrée: {e}")
        
        if success:
            logger.info(f"Conversion réussie: {output_filename}")
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'download_url': url_for('download_file', filename=output_filename)
            })
        else:
            logger.error(f"Erreur de conversion: {error}")
            return jsonify({'error': f'Erreur de conversion: {error}'}), 500
    
    except Exception as e:
        logger.error(f"Erreur lors de la conversion: {str(e)}", exc_info=True)
        return jsonify({'error': f'Erreur interne du serveur: {str(e)}'}), 500

@app.route('/api/formats')
@require_token
def get_formats():
    """API pour obtenir les formats supportés"""
    return jsonify(SUPPORTED_FORMATS)

@app.route('/api/health')
def health_check():
    """Vérification de santé de l'API"""
    # Tester les outils de conversion
    tools_status = {}
    
    # Tester ImageMagick
    try:
        result = subprocess.run(['convert', '-version'], capture_output=True, text=True, timeout=10)
        tools_status['imagemagick'] = result.returncode == 0
    except:
        tools_status['imagemagick'] = False
    
    # Tester LibreOffice
    try:
        result = subprocess.run(['libreoffice', '--version'], capture_output=True, text=True, timeout=10)
        tools_status['libreoffice'] = result.returncode == 0
    except:
        tools_status['libreoffice'] = False
    
    # Tester FFmpeg
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=10)
        tools_status['ffmpeg'] = result.returncode == 0
    except:
        tools_status['ffmpeg'] = False
    
    return jsonify({
        'status': 'healthy',
        'service': 'universal-converter-v1',
        'timestamp': datetime.now().isoformat(),
        'tools': tools_status
    })

@app.route('/download/<filename>')
def download_file(filename):
    """Téléchargement de fichier converti"""
    try:
        file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'Fichier non trouvé'}), 404
    except Exception as e:
        return jsonify({'error': 'Erreur lors du téléchargement'}), 500

@app.route('/api/convert-status/<task_id>')
def convert_status(task_id):
    """Statut de conversion (pour futures améliorations)"""
    return jsonify({'status': 'completed', 'task_id': task_id})

@app.route('/favicon.ico')
def favicon():
    """Favicon pour éviter l'erreur 404"""
    return '', 204

if __name__ == '__main__':
    # Installer les dépendances nécessaires
    try:
        subprocess.run(['apt-get', 'update'], check=True)
        subprocess.run(['apt-get', 'install', '-y', 'imagemagick', 'libreoffice', 'ffmpeg'], check=True)
        logger.info("Dépendances installées avec succès")
    except Exception as e:
        logger.warning(f"Erreur lors de l'installation des dépendances: {e}")
    
    app.run(host='0.0.0.0', port=8080, debug=False)
