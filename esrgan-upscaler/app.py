"""
Application Flask pour l'upscaling d'images avec ESRGAN
Interface web avec différents cas d'usage
"""

import os
import io
import socket
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import base64
import json
from esrgan_model import ESRGANUpscaler
from esrgan_wrapper import ESRGANUpscalerWrapper, REALESRGAN_AVAILABLE
import threading
import time

# Configuration
UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
OUTPUT_FOLDER = Path(__file__).parent / 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'webp'}

# Chemins des modèles dans StabilityMatrix
STABILITY_MATRIX_MODELS = Path(r"C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN")
CONVERTED_MODELS_DIR = Path(__file__).parent / 'converted_models'
CONVERTED_MODELS_DIR.mkdir(exist_ok=True)

# Modèles originaux
MODEL_ULTRASHARP_ORIG = STABILITY_MATRIX_MODELS / "4xUltrasharp_4xUltrasharpV10.pt"
MODEL_ANIME_ORIG = STABILITY_MATRIX_MODELS / "fixYourBlurHires_4xUltra4xAnimeSharp.zip"

# Modèles convertis (priorité)
MODEL_ULTRASHARP = CONVERTED_MODELS_DIR / "4xUltrasharp_4xUltrasharpV10_converted.pt"
MODEL_ANIME = CONVERTED_MODELS_DIR / "fixYourBlurHires_4xUltra4xAnimeSharp_converted.pt"

# Fallback vers originaux si convertis n'existent pas
if not MODEL_ULTRASHARP.exists():
    MODEL_ULTRASHARP = MODEL_ULTRASHARP_ORIG
if not MODEL_ANIME.exists():
    MODEL_ANIME = MODEL_ANIME_ORIG

# Créer les dossiers nécessaires
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max
app.config['SECRET_KEY'] = 'esrgan-upscaler-secret-key-2024'

# Ajouter les headers CORS pour éviter les erreurs réseau
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configurer les logs pour voir les print
import logging
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Variables globales pour les modèles
upscaler_ultrasharp = None
upscaler_anime = None
model_loading_lock = threading.Lock()


def allowed_file(filename):
    """Vérifie si le fichier a une extension autorisée"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def find_free_port(start_port=8888, max_attempts=100):
    """Trouve un port libre"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"Aucun port libre trouvé entre {start_port} et {start_port + max_attempts}")


def load_model(model_type='ultrasharp'):
    """Charge un modèle ESRGAN (utilise Real-ESRGAN si disponible)"""
    global upscaler_ultrasharp, upscaler_anime
    
    with model_loading_lock:
        try:
            if model_type == 'ultrasharp' and upscaler_ultrasharp is None:
                # Essayer d'abord le modèle original (Real-ESRGAN)
                model_path = MODEL_ULTRASHARP_ORIG if MODEL_ULTRASHARP_ORIG.exists() else MODEL_ULTRASHARP
                
                if not model_path.exists():
                    raise FileNotFoundError(f"Modèle UltraSharp non trouvé: {model_path}")
                
                print(f"Chargement du modèle UltraSharp...")
                if REALESRGAN_AVAILABLE:
                    print("[INFO] Utilisation de Real-ESRGAN (modèle original)")
                    upscaler_ultrasharp = ESRGANUpscalerWrapper(str(model_path))
                else:
                    print("[INFO] Utilisation de l'implémentation personnalisée")
                    # Utiliser le modèle converti si disponible, sinon l'original
                    if MODEL_ULTRASHARP.exists() and MODEL_ULTRASHARP != MODEL_ULTRASHARP_ORIG:
                        upscaler_ultrasharp = ESRGANUpscaler(str(MODEL_ULTRASHARP))
                    else:
                        upscaler_ultrasharp = ESRGANUpscaler(str(model_path))
                
                print("[OK] Modèle UltraSharp chargé")
                return upscaler_ultrasharp
            
            elif model_type == 'anime' and upscaler_anime is None:
                # Utiliser l'implémentation ESRGAN personnalisée
                model_path = MODEL_ANIME_ORIG if MODEL_ANIME_ORIG.exists() else MODEL_ANIME
                
                if not model_path.exists():
                    raise FileNotFoundError(f"Modèle Anime non trouvé: {model_path}")
                
                print(f"Chargement du modèle Anime...")
                if REALESRGAN_AVAILABLE:
                    print("[INFO] Utilisation de Real-ESRGAN (modèle original)")
                    upscaler_anime = ESRGANUpscalerWrapper(str(model_path))
                else:
                    print("[INFO] Utilisation de l'implémentation personnalisée")
                    # Utiliser le modèle converti si disponible, sinon l'original
                    if MODEL_ANIME.exists() and MODEL_ANIME != MODEL_ANIME_ORIG:
                        upscaler_anime = ESRGANUpscaler(str(MODEL_ANIME))
                    else:
                        upscaler_anime = ESRGANUpscaler(str(model_path))
                
                print("[OK] Modèle Anime chargé")
                return upscaler_anime
            
            return upscaler_ultrasharp if model_type == 'ultrasharp' else upscaler_anime
            
        except Exception as e:
            print(f"Erreur lors du chargement du modèle {model_type}: {e}")
            import traceback
            traceback.print_exc()
            raise


@app.route('/')
def index():
    """Page d'accueil avec interface graphique"""
    return render_template('index.html')


@app.route('/api/models', methods=['GET'])
def get_models():
    """Retourne la liste des modèles disponibles"""
    models = []
    
    # Vérifier UltraSharp
    if MODEL_ULTRASHARP_ORIG.exists() or MODEL_ULTRASHARP.exists():
        model_file = MODEL_ULTRASHARP_ORIG.name if MODEL_ULTRASHARP_ORIG.exists() else MODEL_ULTRASHARP.name
        model_type = 'original (Real-ESRGAN)' if (REALESRGAN_AVAILABLE and MODEL_ULTRASHARP_ORIG.exists()) else 'converti'
        
        models.append({
            'id': 'ultrasharp',
            'name': '4x UltraSharp',
            'description': f'Upscaling 4x pour images générales et photos ({model_type})',
            'file': model_file,
            'loaded': upscaler_ultrasharp is not None,
            'type': model_type,
            'realesrgan': REALESRGAN_AVAILABLE
        })
    
    # Vérifier Anime
    if MODEL_ANIME_ORIG.exists() or MODEL_ANIME.exists():
        model_file = MODEL_ANIME_ORIG.name if MODEL_ANIME_ORIG.exists() else MODEL_ANIME.name
        model_type = 'original (Real-ESRGAN)' if (REALESRGAN_AVAILABLE and MODEL_ULTRASHARP_ORIG.exists()) else 'converti'
        
        models.append({
            'id': 'anime',
            'name': '4x Anime Sharp',
            'description': f'Upscaling 4x optimisé pour images animées ({model_type})',
            'file': model_file,
            'loaded': upscaler_anime is not None,
            'type': model_type,
            'realesrgan': REALESRGAN_AVAILABLE and MODEL_ANIME_ORIG.exists()
        })
    
    return jsonify({
        'models': models,
        'realesrgan_available': REALESRGAN_AVAILABLE
    })


@app.route('/api/upscale', methods=['POST'])
def upscale_image():
    """
    CAS D'USAGE 1: Upscaling d'image unique
    Endpoint principal pour upscaler une image
    """
    try:
        # Vérifier qu'un fichier a été envoyé
        if 'image' not in request.files:
            return jsonify({'error': 'Aucune image fournie'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Format de fichier non supporté'}), 400
        
        # Récupérer le type de modèle
        model_type = request.form.get('model', 'ultrasharp')
        
        # Charger le modèle si nécessaire
        print(f"[API] Chargement du modele: {model_type}")
        upscaler = load_model(model_type)
        print(f"[API] Modele charge: {upscaler is not None}")
        
        # Charger l'image
        image = Image.open(io.BytesIO(file.read()))
        original_size = image.size
        print(f"[API] Image chargee: {original_size}, mode: {image.mode}")
        
        # Upscaler
        print(f"[API] Debut de l'upscaling...")
        upscaled_image = upscaler.upscale(image)
        print(f"[API] Upscaling termine: {upscaled_image.size}")
        upscaled_size = upscaled_image.size
        
        # Convertir en base64 pour la réponse
        img_buffer = io.BytesIO()
        upscaled_image.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'original_size': original_size,
            'upscaled_size': upscaled_size,
            'scale_factor': upscaled_size[0] / original_size[0],
            'image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        print(f"[API] Erreur dans upscale_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/upscale-batch', methods=['POST'])
def upscale_batch():
    """
    CAS D'USAGE 2: Upscaling par lot (batch processing)
    Traite plusieurs images en une seule requête
    """
    try:
        if 'images' not in request.files:
            return jsonify({'error': 'Aucune image fournie'}), 400
        
        files = request.files.getlist('images')
        if not files:
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        model_type = request.form.get('model', 'ultrasharp')
        upscaler = load_model(model_type)
        
        results = []
        for file in files:
            if file.filename == '' or not allowed_file(file.filename):
                continue
            
            try:
                image = Image.open(io.BytesIO(file.read()))
                original_size = image.size
                
                upscaled_image = upscaler.upscale(image)
                upscaled_size = upscaled_image.size
                
                # Sauvegarder l'image upscalée
                filename = secure_filename(file.filename)
                output_path = OUTPUT_FOLDER / f"upscaled_{filename}"
                upscaled_image.save(output_path, quality=95)
                
                # Convertir en base64 pour l'affichage
                img_buffer = io.BytesIO()
                upscaled_image.save(img_buffer, format='PNG')
                img_str = base64.b64encode(img_buffer.getvalue()).decode()
                
                results.append({
                    'filename': filename,
                    'original_size': original_size,
                    'upscaled_size': upscaled_size,
                    'scale_factor': upscaled_size[0] / original_size[0],
                    'output_path': f'/api/download/{output_path.name}',
                    'image': f'data:image/png;base64,{img_str}'  # Ajouter l'image en base64
                })
            except Exception as e:
                results.append({
                    'filename': file.filename,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'processed': len(results),
            'results': results
        })
        
    except Exception as e:
        print(f"[API] Erreur dans upscale_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/improve-screenshot', methods=['POST'])
def improve_screenshot():
    """
    CAS D'USAGE 4: Amélioration de captures d'écran
    Optimisé pour les captures d'écran avec texte et interfaces
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Aucune image fournie'}), 400
        
        file = request.files['image']
        if not allowed_file(file.filename):
            return jsonify({'error': 'Format non supporté'}), 400
        
        print(f"[API] Amelioration screenshot - Chargement du modele...")
        upscaler = load_model('ultrasharp')
        print(f"[API] Modele charge pour screenshot")
        
        image = Image.open(io.BytesIO(file.read()))
        print(f"[API] Screenshot: {image.size}, mode: {image.mode}")
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Utiliser des tuiles plus petites pour préserver les détails du texte
        print(f"[API] Debut upscaling screenshot...")
        upscaled_image = upscaler.upscale(image, tile_size=256, tile_pad=15)
        print(f"[API] Screenshot upscale: {upscaled_image.size}")
        
        img_buffer = io.BytesIO()
        upscaled_image.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'message': 'Capture d\'écran améliorée',
            'image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        print(f"[API] Erreur dans upscale_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/prepare-print', methods=['POST'])
def prepare_print():
    """
    CAS D'USAGE 5: Préparation d'images pour l'impression
    Optimisé pour obtenir une haute résolution pour l'impression
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Aucune image fournie'}), 400
        
        file = request.files['image']
        dpi = int(request.form.get('dpi', 300))
        target_size = request.form.get('target_size', 'A4')  # A4, A3, etc.
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Format non supporté'}), 400
        
        upscaler = load_model('ultrasharp')
        
        image = Image.open(io.BytesIO(file.read()))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Upscaler
        upscaled_image = upscaler.upscale(image)
        
        # Calculer les dimensions pour l'impression
        # A4: 210x297mm à 300 DPI = 2480x3508 pixels
        # A3: 297x420mm à 300 DPI = 3508x4961 pixels
        print_sizes = {
            'A4': (2480, 3508),
            'A3': (3508, 4961),
            'A2': (4961, 7016),
            'A1': (7016, 9933)
        }
        
        target_pixels = print_sizes.get(target_size, print_sizes['A4'])
        
        # Redimensionner si nécessaire pour correspondre exactement à la taille d'impression
        if upscaled_image.size[0] < target_pixels[0] or upscaled_image.size[1] < target_pixels[1]:
            upscaled_image = upscaled_image.resize(target_pixels, Image.LANCZOS)
        
        img_buffer = io.BytesIO()
        upscaled_image.save(img_buffer, format='PNG', dpi=(dpi, dpi))
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'message': f'Image préparée pour impression {target_size} à {dpi} DPI',
            'print_size': target_size,
            'dpi': dpi,
            'final_size': upscaled_image.size,
            'image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        print(f"[API] Erreur dans upscale_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/upscale-video-frame', methods=['POST'])
def upscale_video_frame():
    """
    CAS D'USAGE 6: Amélioration de vidéos (frame par frame)
    Traite une frame de vidéo pour amélioration
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Aucune image fournie'}), 400
        
        file = request.files['image']
        frame_number = request.form.get('frame_number', '0')
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Format non supporté'}), 400
        
        upscaler = load_model('ultrasharp')
        
        image = Image.open(io.BytesIO(file.read()))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Upscaler avec paramètres optimisés pour les vidéos
        upscaled_image = upscaler.upscale(image, tile_size=512, tile_pad=10)
        
        img_buffer = io.BytesIO()
        upscaled_image.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'message': f'Frame {frame_number} upscalée',
            'frame_number': frame_number,
            'image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        print(f"[API] Erreur dans upscale_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<filename>')
def download_file(filename):
    """Télécharge un fichier upscalé"""
    return send_from_directory(str(OUTPUT_FOLDER), filename, as_attachment=True)


@app.route('/api/health', methods=['GET'])
def health():
    """Vérification de l'état de l'application"""
    return jsonify({
        'status': 'healthy',
        'models': {
            'ultrasharp': upscaler_ultrasharp is not None,
            'anime': upscaler_anime is not None
        },
        'realesrgan_available': REALESRGAN_AVAILABLE,
        'port': find_free_port(8888) if '__main__' in __name__ else None
    })

@app.route('/api/preload-models', methods=['POST'])
def preload_models():
    """Précharge les modèles pour accélérer les requêtes suivantes"""
    try:
        model_type = request.json.get('model', 'ultrasharp') if request.is_json else request.form.get('model', 'ultrasharp')
        upscaler = load_model(model_type)
        return jsonify({
            'success': True,
            'message': f'Modèle {model_type} préchargé avec succès',
            'model_type': model_type
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    import sys
    import io
    # Configurer stdout pour UTF-8 sur Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    # Utiliser le port spécifique 8893
    port = 8893
    # Vérifier si le port est disponible, sinon trouver un port libre
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', port))
    except OSError:
        print(f"[WARNING] Le port {port} est déjà utilisé. Recherche d'un port libre...")
        port = find_free_port(8893)
    print(f"\n{'='*60}")
    print(f"Application ESRGAN Upscaler")
    print(f"{'='*60}")
    
    # Afficher le statut de Real-ESRGAN
    if REALESRGAN_AVAILABLE:
        print(f"[OK] Real-ESRGAN disponible - Modeles originaux utilises directement")
    else:
        print(f"[INFO] Real-ESRGAN non disponible - Utilisation des modeles convertis")
        print(f"       Pour installer Real-ESRGAN: .\\install-realesrgan.ps1")
    
    print(f"\nModeles disponibles:")
    print(f"   - UltraSharp: {'OK (original)' if MODEL_ULTRASHARP_ORIG.exists() else 'OK (converti)' if MODEL_ULTRASHARP.exists() else 'NON TROUVE'}")
    print(f"   - Anime: {'OK (original)' if MODEL_ANIME_ORIG.exists() else 'OK (converti)' if MODEL_ANIME.exists() else 'NON TROUVE'}")
    print(f"\nInterface web: http://localhost:{port}")
    print(f"{'='*60}\n")
    
    # Charger les modèles au démarrage (optionnel, peut être chargé à la demande)
    # load_model('ultrasharp')
    
    # Activer les logs pour voir les print statements
    import sys
    import logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True, use_reloader=False)
