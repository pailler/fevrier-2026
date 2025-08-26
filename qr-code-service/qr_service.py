#!/usr/bin/env python3
"""
Service QR Code Generator avec Base de Données PostgreSQL
Génère des QR codes dynamiques via une API REST
"""

from flask import Flask, request, jsonify, send_file, render_template_string, redirect as flask_redirect, session
from flask_cors import CORS
import qrcode
import qrcode.image.svg
from PIL import Image, ImageDraw
import io
import os
import uuid
import json
from datetime import datetime
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import hashlib
import secrets

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))
CORS(app)

# Configuration
QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Configuration de la base de données
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://qrcode_user:qrcode_password@localhost:5432/qrcode_db')

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Créer une connexion à la base de données"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Erreur de connexion à la base de données: {e}")
        return None

def init_database():
    """Initialiser la base de données si nécessaire"""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                # Vérifier si les tables existent
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'dynamic_qr_codes'
                    );
                """)
                if not cur.fetchone()[0]:
                    logger.info("Tables non trouvées, initialisation de la base de données...")
                    # Les tables seront créées par le script init.sql
                    pass
            conn.commit()
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la base de données: {e}")
        finally:
            conn.close()

def create_dynamic_qr_in_db(url, name="", size=300, margin=4, error_correction="M", user_id=None):
    """Créer un nouveau QR code dynamique en base de données"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        qr_id = str(uuid.uuid4())[:8]
        qr_url = f"http://localhost:7005/r/{qr_id}"
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO dynamic_qr_codes (qr_id, name, url, qr_url, size, margin, error_correction, user_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (qr_id, name, url, qr_url, size, margin, error_correction, user_id))
            
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
            
    except Exception as e:
        logger.error(f"Erreur lors de la création du QR code: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def get_dynamic_qr(qr_id):
    """Récupérer un QR code dynamique par son ID"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM dynamic_qr_codes WHERE qr_id = %s
            """, (qr_id,))
            
            result = cur.fetchone()
            if result:
                return dict(result)
            return None
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du QR code: {e}")
        return None
    finally:
        conn.close()

def list_dynamic_qr_codes(user_id=None):
    """Lister tous les QR codes dynamiques d'un utilisateur"""
    conn = get_db_connection()
    if not conn:
        return {}
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if user_id:
                cur.execute("""
                    SELECT * FROM dynamic_qr_codes 
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
            else:
                cur.execute("""
                    SELECT * FROM dynamic_qr_codes 
                    ORDER BY created_at DESC
                """)
            
            results = cur.fetchall()
            return {row['qr_id']: dict(row) for row in results}
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des QR codes: {e}")
        return {}
    finally:
        conn.close()

def update_dynamic_qr_in_db(qr_id, new_url, new_name=None):
    """Mettre à jour un QR code dynamique"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Récupérer l'ancienne URL pour l'historique
            cur.execute("SELECT url FROM dynamic_qr_codes WHERE qr_id = %s", (qr_id,))
            old_url_result = cur.fetchone()
            if not old_url_result:
                return None
            
            old_url = old_url_result['url']
            
            # Mettre à jour le QR code
            if new_name:
                cur.execute("""
                    UPDATE dynamic_qr_codes 
                    SET url = %s, name = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE qr_id = %s
                    RETURNING *
                """, (new_url, new_name, qr_id))
            else:
                cur.execute("""
                    UPDATE dynamic_qr_codes 
                    SET url = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE qr_id = %s
                    RETURNING *
                """, (new_url, qr_id))
            
            result = cur.fetchone()
            
            # Enregistrer dans l'historique
            cur.execute("""
                INSERT INTO qr_code_history (qr_id, old_url, new_url)
                VALUES (%s, %s, %s)
            """, (qr_id, old_url, new_url))
            
            conn.commit()
            return dict(result) if result else None
            
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def increment_scan_count(qr_id, ip_address=None, user_agent=None, referer=None):
    """Incrémenter le compteur de scans et enregistrer les statistiques"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # Incrémenter le compteur de scans
            cur.execute("""
                UPDATE dynamic_qr_codes 
                SET scans = scans + 1, last_scan = CURRENT_TIMESTAMP
                WHERE qr_id = %s
            """, (qr_id,))
            
            # Enregistrer les statistiques de scan
            cur.execute("""
                INSERT INTO scan_statistics (qr_id, ip_address, user_agent, referer)
                VALUES (%s, %s, %s, %s)
            """, (qr_id, ip_address, user_agent, referer))
            
            conn.commit()
            return True
            
    except Exception as e:
        logger.error(f"Erreur lors de l'incrémentation du compteur de scans: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def get_scan_statistics(qr_id):
    """Récupérer les statistiques de scans pour un QR code"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM scan_statistics 
                WHERE qr_id = %s 
                ORDER BY scanned_at DESC
            """, (qr_id,))
            
            results = cur.fetchall()
            return [dict(row) for row in results]
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {e}")
        return []
    finally:
        conn.close()

def delete_dynamic_qr(qr_id):
    """Supprimer un QR code dynamique et toutes ses données associées"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # Supprimer les statistiques de scans (cascade)
            cur.execute("DELETE FROM scan_statistics WHERE qr_id = %s", (qr_id,))
            
            # Supprimer l'historique des modifications (cascade)
            cur.execute("DELETE FROM qr_code_history WHERE qr_id = %s", (qr_id,))
            
            # Supprimer le QR code principal
            cur.execute("DELETE FROM dynamic_qr_codes WHERE qr_id = %s", (qr_id,))
            
            conn.commit()
            return True
            
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du QR code: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def hash_password(password):
    """Hasher un mot de passe avec salt"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256()
    hash_obj.update((password + salt).encode('utf-8'))
    return salt + hash_obj.hexdigest()

def verify_password(password, hashed_password):
    """Vérifier un mot de passe"""
    if len(hashed_password) < 32:
        return False
    salt = hashed_password[:32]
    hash_obj = hashlib.sha256()
    hash_obj.update((password + salt).encode('utf-8'))
    return salt + hash_obj.hexdigest() == hashed_password

def create_user(username, password):
    """Créer un nouvel utilisateur"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Vérifier si l'utilisateur existe déjà
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                return None
            
            # Créer le nouvel utilisateur
            hashed_password = hash_password(password)
            cur.execute("""
                INSERT INTO users (username, password_hash)
                VALUES (%s, %s)
                RETURNING id, username
            """, (username, hashed_password))
            
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
            
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'utilisateur: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def authenticate_user(username, password):
    """Authentifier un utilisateur"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, username, password_hash FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
            
            if user and verify_password(password, user['password_hash']):
                return dict(user)
            return None
            
    except Exception as e:
        logger.error(f"Erreur lors de l'authentification: {e}")
        return None
    finally:
        conn.close()

def get_user_by_id(user_id):
    """Récupérer un utilisateur par son ID"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            return dict(user) if user else None
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'utilisateur: {e}")
        return None
    finally:
        conn.close()

def require_auth(f):
    """Décorateur pour protéger les routes"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Authentification requise'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Template HTML pour l'interface web
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Generator - Dynamique avec Base de Données</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1, h2 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .auth-container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .user-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        .user-info h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            gap: 5px;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border: 2px solid #6c757d;
            background: #ffffff;
            color: #495057;
            font-size: 16px;
            font-weight: 500;
            border-radius: 5px 5px 0 0;
            margin-right: 2px;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .tab:hover {
            background-color: #e9ecef;
            border-color: #5a6268;
            color: #212529;
        }
        .tab.active {
            background-color: #007bff;
            color: white;
            border-color: #0056b3;
            box-shadow: 0 2px 4px rgba(0,123,255,0.3);
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .btn-success {
            background-color: #28a745;
        }
        .btn-success:hover {
            background-color: #1e7e34;
        }
        .btn-warning {
            background-color: #ffc107;
            color: #212529;
        }
        .btn-warning:hover {
            background-color: #e0a800;
        }
        .btn-info {
            background-color: #17a2b8;
        }
        .btn-info:hover {
            background-color: #138496;
        }
        .btn-danger {
            background-color: #dc3545;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }
        .btn-secondary {
            background-color: #6c757d;
        }
        .btn-secondary:hover {
            background-color: #545b62;
        }
        .result {
            margin-top: 30px;
            text-align: center;
        }
        .qr-code {
            max-width: 300px;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
        }
        .api-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 30px;
        }
        .api-info h3 {
            color: #333;
            margin-top: 0;
        }
        code {
            background-color: #e9ecef;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        .qr-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
        }
        .qr-item {
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
        }
        .qr-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .qr-header h4 {
            margin: 0;
            color: #333;
            flex: 1;
        }
        .qr-actions {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        .qr-actions button {
            width: auto;
            margin-bottom: 0;
            padding: 8px 12px;
            font-size: 14px;
        }
        .qr-content {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .qr-info {
            flex: 1;
            min-width: 300px;
        }
        .qr-info p {
            margin: 5px 0;
            color: #666;
        }
        .qr-image-container {
            flex: 0 0 auto;
            text-align: center;
            min-width: 200px;
        }
        .qr-image-container h5 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .qr-image {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            background: white;
            margin-bottom: 10px;
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qr-image img {
            max-width: 150px;
            max-height: 150px;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
        .qr-url {
            font-family: monospace;
            background-color: #e9ecef;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .error {
            color: #dc3545;
            background-color: #f8d7da;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .success {
            color: #155724;
            background-color: #d4edda;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .stats-table th, .stats-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .stats-table th {
            background-color: #f2f2f2;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <!-- Interface d'authentification -->
    <div id="authInterface" class="auth-container">
        <h1>🔐 QR Code Generator</h1>
        <h2>Connexion / Création de session</h2>
        
        <div class="tabs">
            <button class="tab active" onclick="showAuthTab('login')">Se connecter</button>
            <button class="tab" onclick="showAuthTab('register')">Créer une session</button>
        </div>
        
        <!-- Formulaire de connexion -->
        <div id="loginTab" class="tab-content active">
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginUsername">Nom d'utilisateur :</label>
                    <input type="text" id="loginUsername" name="username" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Mot de passe :</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <button type="submit">Se connecter</button>
            </form>
        </div>
        
        <!-- Formulaire de création de session -->
        <div id="registerTab" class="tab-content">
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerUsername">Nom d'utilisateur :</label>
                    <input type="text" id="registerUsername" name="username" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Mot de passe :</label>
                    <input type="password" id="registerPassword" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirmer le mot de passe :</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <button type="submit">Créer ma session</button>
            </form>
        </div>
    </div>

    <!-- Interface principale (cachée par défaut) -->
    <div id="mainInterface" class="container hidden">
        <div class="user-info">
            <h3>👤 Session active</h3>
            <p>Connecté en tant que : <strong id="currentUser"></strong></p>
            <button onclick="logout()" class="btn-secondary">Se déconnecter</button>
        </div>
        
        <h1>🎯 QR Code Generator - Dynamique avec Base de Données</h1>
        
        <div class="tabs">
            <button class="tab" onclick="showTab('static')">QR Code Statique</button>
            <button class="tab active" onclick="showTab('dynamic')">QR Code Dynamique</button>
            <button class="tab" onclick="showTab('manage')">Gérer les QR Codes</button>
            <button class="tab" onclick="showTab('stats')">Statistiques</button>
        </div>
        
        <!-- QR Code Statique -->
        <div id="static" class="tab-content">
            <h2>Générer un QR Code Statique</h2>
            <form id="staticForm">
                <div class="form-group">
                    <label for="staticText">Texte ou URL :</label>
                    <input type="text" id="staticText" name="text" placeholder="https://example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="staticSize">Taille (px) :</label>
                    <input type="number" id="staticSize" name="size" value="300" min="100" max="1000">
                </div>
                
                <div class="form-group">
                    <label for="staticMargin">Marge (px) :</label>
                    <input type="number" id="staticMargin" name="margin" value="4" min="0" max="10">
                </div>
                
                <div class="form-group">
                    <label for="staticErrorCorrection">Niveau de correction d'erreur :</label>
                    <select id="staticErrorCorrection" name="errorCorrection">
                        <option value="L">L - Faible (7%)</option>
                        <option value="M" selected>M - Moyen (15%)</option>
                        <option value="Q">Q - Élevé (25%)</option>
                        <option value="H">H - Très élevé (30%)</option>
                    </select>
                </div>
                
                <button type="submit">Générer QR Code Statique</button>
            </form>
            
            <div id="staticResult" class="result" style="display: none;">
                <h3>QR Code généré :</h3>
                <div id="staticQrCode" class="qr-code"></div>
                <button class="download-btn btn-success" onclick="downloadQR('static')">Télécharger PNG</button>
            </div>
        </div>
        
        <!-- QR Code Dynamique -->
        <div id="dynamic" class="tab-content active">
            <h2>Créer un QR Code Dynamique</h2>
            <form id="dynamicForm">
                <div class="form-group">
                    <label for="dynamicUrl">URL de destination :</label>
                    <input type="url" id="dynamicUrl" name="url" placeholder="https://example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="dynamicName">Nom du QR Code (optionnel) :</label>
                    <input type="text" id="dynamicName" name="name" placeholder="Mon QR Code">
                </div>
                
                <div class="form-group">
                    <label for="dynamicSize">Taille (px) :</label>
                    <input type="number" id="dynamicSize" name="size" value="300" min="100" max="1000">
                </div>
                
                <div class="form-group">
                    <label for="dynamicMargin">Marge (px) :</label>
                    <input type="number" id="dynamicMargin" name="margin" value="4" min="0" max="10">
                </div>
                
                <div class="form-group">
                    <label for="dynamicErrorCorrection">Niveau de correction d'erreur :</label>
                    <select id="dynamicErrorCorrection" name="errorCorrection">
                        <option value="L">L - Faible (7%)</option>
                        <option value="M" selected>M - Moyen (15%)</option>
                        <option value="Q">Q - Élevé (25%)</option>
                        <option value="H">H - Très élevé (30%)</option>
                    </select>
                </div>
                
                <button type="submit">Créer QR Code Dynamique</button>
            </form>
            
            <div id="dynamicResult" class="result" style="display: none;">
                <h3>QR Code Dynamique créé :</h3>
                <div id="dynamicQrCode" class="qr-code"></div>
                <p><strong>URL du QR Code :</strong> <span id="dynamicQrUrl" class="qr-url"></span></p>
                <p><strong>ID unique :</strong> <span id="dynamicQrId" class="qr-url"></span></p>
                <button class="download-btn btn-success" onclick="downloadQR('dynamic')">Télécharger PNG</button>
            </div>
        </div>
        
        <!-- Gérer les QR Codes -->
        <div id="manage" class="tab-content">
            <h2>Gérer les QR Codes Dynamiques</h2>
            <button onclick="loadDynamicQRCodes()" class="btn-success">Actualiser la liste</button>
            <div id="qrList" class="qr-list"></div>
        </div>
        
        <!-- Statistiques -->
        <div id="stats" class="tab-content">
            <h2>Statistiques des QR Codes</h2>
            <div id="statsContent">
                <p>Sélectionnez un QR code pour voir ses statistiques détaillées.</p>
            </div>
        </div>
        
        <div class="api-info">
            <h3>📡 API REST avec Base de Données</h3>
            <p><strong>QR Code Statique :</strong></p>
            <code>GET /api/qr?text=URL&size=300&margin=4&errorCorrection=M</code>
            <br><br>
            <p><strong>Créer QR Code Dynamique :</strong></p>
            <code>POST /api/dynamic/qr</code>
            <br>
            <code>{"url": "https://example.com", "name": "Mon QR", "size": 300}</code>
            <br><br>
            <p><strong>Modifier QR Code Dynamique :</strong></p>
            <code>PUT /api/dynamic/qr/{id}</code>
            <br>
            <code>{"url": "https://nouvelle-url.com"}</code>
            <br><br>
            <p><strong>Lister QR Codes Dynamiques :</strong></p>
            <code>GET /api/dynamic/qr</code>
            <br><br>
            <p><strong>Statistiques d'un QR Code :</strong></p>
            <code>GET /api/dynamic/qr/{id}/stats</code>
            <br><br>
            <p><strong>Supprimer un QR Code :</strong></p>
            <code>DELETE /api/dynamic/qr/{id}</code>
            <br><br>
            <p><strong>Redirection :</strong></p>
            <code>GET /r/{id}</code>
        </div>
    </div>

    <script>
        let currentStaticQR = null;
        let currentDynamicQR = null;
        let currentUser = null;
        
        // Vérifier l'authentification au chargement
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthStatus();
        });
        
        function checkAuthStatus() {
            fetch('/api/auth/status')
                .then(response => response.json())
                .then(data => {
                    if (data.authenticated) {
                        currentUser = data.user;
                        showMainInterface();
                    } else {
                        showAuthInterface();
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la vérification de l\'authentification:', error);
                    showAuthInterface();
                });
        }
        
        function showAuthInterface() {
            document.getElementById('authInterface').classList.remove('hidden');
            document.getElementById('mainInterface').classList.add('hidden');
        }
        
        function showMainInterface() {
            document.getElementById('authInterface').classList.add('hidden');
            document.getElementById('mainInterface').classList.remove('hidden');
            document.getElementById('currentUser').textContent = currentUser.username;
            loadDynamicQRCodes();
        }
        
        function showAuthTab(tabName) {
            // Masquer tous les contenus d'authentification
            document.querySelectorAll('#authInterface .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('#authInterface .tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Afficher le contenu sélectionné
            document.getElementById(tabName + 'Tab').classList.add('active');
            event.target.classList.add('active');
        }
        
        function showTab(tabName) {
            // Masquer tous les contenus
            document.querySelectorAll('#mainInterface .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('#mainInterface .tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Afficher le contenu sélectionné
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
        
        // Authentification
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    showMainInterface();
                } else {
                    alert('Erreur de connexion: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la connexion');
            });
        });
        
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            if (data.password !== data.confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            
            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    showMainInterface();
                } else {
                    alert('Erreur de création: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la création de la session');
            });
        });
        
        function logout() {
            fetch('/api/auth/logout', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                currentUser = null;
                showAuthInterface();
            })
            .catch(error => {
                console.error('Erreur:', error);
                currentUser = null;
                showAuthInterface();
            });
        }
        
        // QR Code Statique
        document.getElementById('staticForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const params = new URLSearchParams();
            
            for (let [key, value] of formData.entries()) {
                params.append(key, value);
            }
            
            const url = '/api/qr?' + params.toString();
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        currentStaticQR = data.qr_code;
                        document.getElementById('staticQrCode').innerHTML = 
                            `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code" style="max-width: 100%;">`;
                        document.getElementById('staticResult').style.display = 'block';
                    } else {
                        alert('Erreur: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la génération du QR code');
                });
        });
        
        // QR Code Dynamique
        document.getElementById('dynamicForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            fetch('/api/dynamic/qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentDynamicQR = data.qr_code;
                    document.getElementById('dynamicQrCode').innerHTML = 
                        `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code" style="max-width: 100%;">`;
                    document.getElementById('dynamicQrUrl').textContent = data.qr_url;
                    document.getElementById('dynamicQrId').textContent = data.qr_id;
                    document.getElementById('dynamicResult').style.display = 'block';
                } else {
                    alert('Erreur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la création du QR code dynamique');
            });
        });
        
        function downloadQR(type) {
            const qrData = type === 'static' ? currentStaticQR : currentDynamicQR;
            if (!qrData) return;
            
            const link = document.createElement('a');
            link.href = 'data:image/png;base64,' + qrData;
            link.download = 'qrcode-' + type + '-' + Date.now() + '.png';
            link.click();
        }
        
        function loadDynamicQRCodes() {
            fetch('/api/dynamic/qr')
                .then(response => {
                    if (response.status === 401) {
                        // Rediriger vers l'authentification si non connecté
                        showAuthInterface();
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.success) {
                        displayQRCodes(data.qr_codes);
                    } else if (data) {
                        document.getElementById('qrList').innerHTML = '<div class="error">Erreur: ' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    document.getElementById('qrList').innerHTML = '<div class="error">Erreur lors du chargement des QR codes</div>';
                });
        }
        
        function displayQRCodes(qrCodes) {
            const container = document.getElementById('qrList');
            
            if (Object.keys(qrCodes).length === 0) {
                container.innerHTML = '<p>Aucun QR code dynamique créé.</p>';
                return;
            }
            
                         let html = '';
             for (const [id, qr] of Object.entries(qrCodes)) {
                 html += `
                     <div class="qr-item">
                         <div class="qr-header">
                             <h4>${qr.name || 'QR Code sans nom'}</h4>
                             <div class="qr-actions">
                                 <button onclick="editQRCode('${id}')" class="btn-warning">Modifier l'URL</button>
                                 <button onclick="viewStats('${id}')" class="btn-info">Voir les statistiques</button>
                                 <button onclick="deleteQRCode('${id}')" class="btn-danger">Supprimer</button>
                             </div>
                         </div>
                         <div class="qr-content">
                             <div class="qr-info">
                                 <p><strong>ID :</strong> <span class="qr-url">${id}</span></p>
                                 <p><strong>URL de destination :</strong> <span class="qr-url">${qr.url}</span></p>
                                 <p><strong>URL du QR Code :</strong> <span class="qr-url">${qr.qr_url}</span></p>
                                 <p><strong>Créé le :</strong> ${new Date(qr.created_at).toLocaleString()}</p>
                                 <p><strong>Scans :</strong> ${qr.scans || 0}</p>
                             </div>
                             <div class="qr-image-container">
                                 <h5>QR Code généré :</h5>
                                 <div class="qr-image" id="qr-image-${id}">
                                     <div class="loading">Chargement du QR code...</div>
                                 </div>
                                 <button onclick="downloadQRImage('${id}')" class="btn-success">Télécharger</button>
                             </div>
                         </div>
                     </div>
                 `;
             }
            container.innerHTML = html;
        }
        
        function editQRCode(id) {
            const newUrl = prompt('Nouvelle URL de destination :');
            if (!newUrl) return;
            
            fetch(`/api/dynamic/qr/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({url: newUrl})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('QR Code modifié avec succès !');
                    loadDynamicQRCodes();
                } else {
                    alert('Erreur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification du QR code');
            });
        }
        
                 function viewStats(qrId) {
             fetch(`/api/dynamic/qr/${qrId}/stats`)
                 .then(response => response.json())
                 .then(data => {
                     if (data.success) {
                         showTab('stats');
                         displayStats(qrId, data.stats);
                     } else {
                         alert('Erreur: ' + data.error);
                     }
                 })
                 .catch(error => {
                     console.error('Erreur:', error);
                     alert('Erreur lors du chargement des statistiques');
                 });
         }
         
         function deleteQRCode(id) {
             if (!confirm('Êtes-vous sûr de vouloir supprimer ce QR code ? Cette action est irréversible.')) {
                 return;
             }
             
             fetch(`/api/dynamic/qr/${id}`, {
                 method: 'DELETE',
                 headers: {
                     'Content-Type': 'application/json',
                 }
             })
             .then(response => response.json())
             .then(data => {
                 if (data.success) {
                     alert('QR Code supprimé avec succès !');
                     loadDynamicQRCodes();
                 } else {
                     alert('Erreur: ' + data.error);
                 }
             })
             .catch(error => {
                 console.error('Erreur:', error);
                 alert('Erreur lors de la suppression du QR code');
             });
         }
        
        function displayStats(qrId, stats) {
            const container = document.getElementById('statsContent');
            
            if (stats.length === 0) {
                container.innerHTML = '<p>Aucune statistique disponible pour ce QR code.</p>';
                return;
            }
            
            let html = `<h3>Statistiques pour le QR Code ${qrId}</h3>`;
            html += '<table class="stats-table">';
            html += '<tr><th>Date</th><th>IP</th><th>User Agent</th><th>Referer</th></tr>';
            
            stats.forEach(stat => {
                html += `
                    <tr>
                        <td>${new Date(stat.scanned_at).toLocaleString()}</td>
                        <td>${stat.ip_address || 'N/A'}</td>
                        <td>${stat.user_agent || 'N/A'}</td>
                        <td>${stat.referer || 'N/A'}</td>
                    </tr>
                `;
            });
            
                         html += '</table>';
             container.innerHTML = html;
         }
         
         function loadQRImage(qrId, qrUrl) {
             // Générer le QR code en utilisant l'URL du QR code
             const params = new URLSearchParams({
                 text: qrUrl,
                 size: 150,
                 margin: 4,
                 errorCorrection: 'M'
             });
             
             fetch('/api/qr?' + params.toString())
                 .then(response => response.json())
                 .then(data => {
                     if (data.success) {
                         const container = document.getElementById(`qr-image-${qrId}`);
                         container.innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code" style="max-width: 100%;">`;
                     } else {
                         const container = document.getElementById(`qr-image-${qrId}`);
                         container.innerHTML = '<div class="error">Erreur lors du chargement</div>';
                     }
                 })
                 .catch(error => {
                     console.error('Erreur:', error);
                     const container = document.getElementById(`qr-image-${qrId}`);
                     container.innerHTML = '<div class="error">Erreur lors du chargement</div>';
                 });
         }
         
         function downloadQRImage(qrId) {
             // Récupérer l'URL du QR code depuis les données affichées
             const qrItem = document.querySelector(`#qr-image-${qrId}`).closest('.qr-item');
             const qrUrlElements = qrItem.querySelectorAll('.qr-url');
             // Le deuxième élément .qr-url contient l'URL du QR code (pas l'URL de destination)
             const qrUrl = qrUrlElements[1].textContent;
             
             // Générer le QR code pour le téléchargement
             const params = new URLSearchParams({
                 text: qrUrl,
                 size: 300,
                 margin: 4,
                 errorCorrection: 'M'
             });
             
             fetch('/api/qr?' + params.toString())
                 .then(response => response.json())
                 .then(data => {
                     if (data.success) {
                         const link = document.createElement('a');
                         link.href = 'data:image/png;base64,' + data.qr_code;
                         link.download = `qrcode-${qrId}-${Date.now()}.png`;
                         link.click();
                     } else {
                         alert('Erreur lors de la génération du QR code pour téléchargement');
                     }
                 })
                 .catch(error => {
                     console.error('Erreur:', error);
                     alert('Erreur lors du téléchargement du QR code');
                 });
         }
         
                   // Charger les QR codes au chargement de la page
          // (maintenant géré par checkAuthStatus)
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Page d'accueil avec interface web"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Créer un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Créer l'utilisateur
        user = create_user(username, password)
        
        if not user:
            return jsonify({'success': False, 'error': 'Nom d\'utilisateur déjà pris'}), 400
        
        # Connecter l'utilisateur
        session['user_id'] = user['id']
        
        return jsonify({
            'success': True,
            'user': {'id': user['id'], 'username': user['username']},
            'message': 'Session créée avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'utilisateur: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Connecter un utilisateur"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        # Authentifier l'utilisateur
        user = authenticate_user(username, password)
        
        if not user:
            return jsonify({'success': False, 'error': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401
        
        # Connecter l'utilisateur
        session['user_id'] = user['id']
        
        return jsonify({
            'success': True,
            'user': {'id': user['id'], 'username': user['username']},
            'message': 'Connexion réussie'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la connexion: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Déconnecter un utilisateur"""
    try:
        session.pop('user_id', None)
        return jsonify({
            'success': True,
            'message': 'Déconnexion réussie'
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la déconnexion: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/status')
def auth_status():
    """Vérifier le statut d'authentification"""
    try:
        user_id = session.get('user_id')
        
        if user_id:
            user = get_user_by_id(user_id)
            if user:
                return jsonify({
                    'authenticated': True,
                    'user': {'id': user['id'], 'username': user['username']}
                })
        
        return jsonify({'authenticated': False})
        
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du statut: {e}")
        return jsonify({'authenticated': False})

@app.route('/health')
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'QR Code Generator - Dynamique avec Base de Données',
        'version': '3.0.0',
        'database': 'PostgreSQL',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/qr')
def generate_qr():
    """Générer un QR code statique via GET"""
    try:
        # Récupérer les paramètres
        text = request.args.get('text', '')
        size = int(request.args.get('size', 300))
        margin = int(request.args.get('margin', 4))
        error_correction = request.args.get('errorCorrection', 'M')
        format_type = request.args.get('format', 'png')
        
        if not text:
            return jsonify({'success': False, 'error': 'Le paramètre "text" est requis'}), 400
        
        # Générer le QR code
        qr_code = generate_qr_code(text, size, margin, error_correction, format_type)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code,
            'text': text,
            'size': size,
            'margin': margin,
            'error_correction': error_correction,
            'format': format_type,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code statique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr', methods=['POST'])
def generate_qr_post():
    """Générer un QR code statique via POST"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        text = data.get('text', '')
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        format_type = data.get('format', 'png')
        
        if not text:
            return jsonify({'success': False, 'error': 'Le champ "text" est requis'}), 400
        
        # Générer le QR code
        qr_code = generate_qr_code(text, size, margin, error_correction, format_type)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code,
            'text': text,
            'size': size,
            'margin': margin,
            'error_correction': error_correction,
            'format': format_type,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code statique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['POST'])
@require_auth
def create_dynamic_qr():
    """Créer un QR code dynamique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        url = data.get('url', '').strip()
        name = data.get('name', '').strip()
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        
        if not url:
            return jsonify({'success': False, 'error': 'L\'URL de destination est requise'}), 400
        
        # Créer le QR code en base de données avec l'ID utilisateur
        user_id = session.get('user_id')
        qr_data = create_dynamic_qr_in_db(url, name, size, margin, error_correction, user_id)
        
        if not qr_data:
            return jsonify({'success': False, 'error': 'Erreur lors de la création du QR code'}), 500
        
        # Générer le QR code
        qr_code = generate_qr_code(qr_data['qr_url'], size, margin, error_correction, 'png')
        
        return jsonify({
            'success': True,
            'qr_id': qr_data['qr_id'],
            'qr_url': qr_data['qr_url'],
            'qr_code': qr_code,
            'destination_url': url,
            'name': name,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la création du QR code dynamique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['PUT'])
def update_dynamic_qr(qr_id):
    """Modifier un QR code dynamique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        new_url = data.get('url', '').strip()
        new_name = data.get('name', '').strip()
        
        if not new_url:
            return jsonify({'success': False, 'error': 'La nouvelle URL est requise'}), 400
        
        # Mettre à jour le QR code
        qr_data = update_dynamic_qr_in_db(qr_id, new_url, new_name)
        
        if not qr_data:
            return jsonify({'success': False, 'error': 'QR Code non trouvé'}), 404
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'new_url': new_url,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['GET'])
@require_auth
def list_dynamic_qr():
    """Lister tous les QR codes dynamiques de l'utilisateur connecté"""
    try:
        user_id = session.get('user_id')
        qr_codes = list_dynamic_qr_codes(user_id)
        
        return jsonify({
            'success': True,
            'qr_codes': qr_codes,
            'count': len(qr_codes),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des QR codes: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['GET'])
def get_dynamic_qr_info(qr_id):
    """Obtenir les informations d'un QR code dynamique"""
    try:
        qr_data = get_dynamic_qr(qr_id)
        
        if not qr_data:
            return jsonify({'success': False, 'error': 'QR Code non trouvé'}), 404
        
        return jsonify({
            'success': True,
            'qr_code': qr_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>/stats', methods=['GET'])
def get_qr_stats(qr_id):
    """Obtenir les statistiques d'un QR code dynamique"""
    try:
        stats = get_scan_statistics(qr_id)
        
        return jsonify({
            'success': True,
            'stats': stats,
            'count': len(stats),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['DELETE'])
def delete_qr(qr_id):
    """Supprimer un QR code dynamique"""
    try:
        success = delete_dynamic_qr(qr_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'QR Code supprimé avec succès',
                'qr_id': qr_id,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'QR Code non trouvé ou erreur lors de la suppression'}), 404
        
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/r/<qr_id>')
def redirect_qr(qr_id):
    """Rediriger vers l'URL de destination du QR code dynamique"""
    try:
        # Récupérer les informations du QR code depuis la base de données
        qr_data = get_dynamic_qr(qr_id)
        
        if not qr_data:
            return jsonify({'success': False, 'error': 'QR Code non trouvé'}), 404
        
        # Récupérer les informations de la requête
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        referer = request.headers.get('Referer')
        
        # Incrémenter le compteur de scans
        increment_scan_count(qr_id, ip_address, user_agent, referer)
        
        # Rediriger vers l'URL de destination
        return flask_redirect(qr_data['url'], code=302)
        
    except Exception as e:
        logger.error(f"Erreur lors de la redirection: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr/download/<filename>')
def download_qr(filename):
    """Télécharger un QR code généré"""
    try:
        file_path = os.path.join(QR_CODES_DIR, filename)
        
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'success': False, 'error': 'Fichier non trouvé'}), 404
            
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr/list')
def list_qr_codes():
    """Lister tous les QR codes générés"""
    try:
        files = []
        
        for filename in os.listdir(QR_CODES_DIR):
            if filename.endswith(('.png', '.svg')):
                file_path = os.path.join(QR_CODES_DIR, filename)
                stat = os.stat(file_path)
                
                files.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'url': f'/api/qr/download/{filename}'
                })
        
        return jsonify({
            'success': True,
            'files': sorted(files, key=lambda x: x['created'], reverse=True)
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des fichiers: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_qr_code(text, size=300, margin=4, error_correction='M', format_type='png'):
    """Générer un QR code et retourner en base64"""
    
    # Configuration du QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{error_correction}'),
        box_size=10,
        border=margin
    )
    
    qr.add_data(text)
    qr.make(fit=True)
    
    # Créer l'image
    if format_type.lower() == 'svg':
        img = qr.make_image(image_factory=qrcode.image.svg.SvgImage)
    else:
        img = qr.make_image(fill_color="black", back_color="white")
    
    # Redimensionner si nécessaire
    if size != 300:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Convertir en base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Sauvegarder le fichier
    filename = f"qrcode_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    file_path = os.path.join(QR_CODES_DIR, filename)
    img.save(file_path, format='PNG')
    
    # Retourner en base64
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

if __name__ == '__main__':
    print("🚀 Démarrage du service QR Code Generator - Dynamique avec Base de Données...")
    print(f"📁 Dossier QR codes: {QR_CODES_DIR}")
    print("🗄️  Base de données: PostgreSQL")
    print("🌐 Interface web: http://localhost:8080")
    print("📡 API: http://localhost:8080/api/qr")
    print("🔄 QR Codes dynamiques: http://localhost:8080/api/dynamic/qr")
    print("❤️  Health check: http://localhost:8080/health")
    
    # Initialiser la base de données
    init_database()
    
    app.run(host='0.0.0.0', port=8080, debug=False)
