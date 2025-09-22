#!/usr/bin/env python3
"""
Service LibreSpeed avec authentification centralisée IAHome
Gère l'accès sécurisé au service LibreSpeed via tokens
Authentification centralisée avec IAHome.fr
"""

from flask import Flask, request, jsonify, send_file, render_template_string, redirect as flask_redirect
from flask_cors import CORS
import os
import uuid
import json
from datetime import datetime, timedelta
import logging
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de l'authentification centralisée
IAHOME_JWT_SECRET = os.getenv('IAHOME_JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

# Configuration de la base de données
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://qrcode_user:qrcode_password@localhost:5432/qrcode_db')

def get_db_connection():
    """Créer une connexion à la base de données"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Erreur de connexion à la base de données: {e}")
        return None

def create_session_token(user_id, user_email, duration_hours=24):
    """Créer un token de session pour l'utilisateur"""
    try:
        # Générer un token unique
        token = str(uuid.uuid4()).replace('-', '')[:20]
        
        # Calculer l'expiration
        expires_at = datetime.now() + timedelta(hours=duration_hours)
        
        # Sauvegarder en base de données
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO librespeed_session_tokens (token, user_id, user_email, expires_at)
                        VALUES (%s, %s, %s, %s)
                    """, (token, user_id, user_email, expires_at))
                    conn.commit()
                    logger.info(f"Token de session créé pour l'utilisateur {user_id}: {token}")
                    return token
            except Exception as e:
                logger.error(f"Erreur lors de la création du token: {e}")
                conn.rollback()
            finally:
                conn.close()
        
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la création du token de session: {e}")
        return None

def validate_session_token(token):
    """Valider un token de session"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Nettoyer d'abord les tokens expirés
                cur.execute("UPDATE librespeed_session_tokens SET is_active = FALSE WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE")
                
                # Vérifier le token
                cur.execute("""
                    SELECT * FROM librespeed_session_tokens 
                    WHERE token = %s AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
                """, (token,))
                
                result = cur.fetchone()
                if result:
                    # Mettre à jour la dernière utilisation
                    cur.execute("""
                        UPDATE librespeed_session_tokens 
                        SET last_used = CURRENT_TIMESTAMP 
                        WHERE token = %s
                    """, (token,))
                    conn.commit()
                    
                    logger.info(f"Token de session validé pour l'utilisateur: {result['user_id']}")
                    return dict(result)
                else:
                    logger.warning(f"Token de session invalide ou expiré: {token}")
                    return None
        except Exception as e:
            logger.error(f"Erreur lors de la validation du token: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la validation du token de session: {e}")
        return None

def revoke_session_token(token):
    """Révoquer un token de session"""
    try:
        conn = get_db_connection()
        if not conn:
            return False
        
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE librespeed_session_tokens 
                    SET is_active = FALSE 
                    WHERE token = %s
                """, (token,))
                conn.commit()
                logger.info(f"Token de session révoqué: {token}")
                return True
        except Exception as e:
            logger.error(f"Erreur lors de la révocation du token: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la révocation du token de session: {e}")
        return False

def revoke_user_tokens(user_id):
    """Révoquer tous les tokens d'un utilisateur"""
    try:
        conn = get_db_connection()
        if not conn:
            return False
        
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE librespeed_session_tokens 
                    SET is_active = FALSE 
                    WHERE user_id = %s AND is_active = TRUE
                """, (user_id,))
                conn.commit()
                logger.info(f"Tous les tokens de session révoqués pour l'utilisateur: {user_id}")
                return True
        except Exception as e:
            logger.error(f"Erreur lors de la révocation des tokens utilisateur: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la révocation des tokens utilisateur: {e}")
        return False

def validate_iahome_token(token):
    """Valider un token JWT d'IAHome"""
    try:
        # Décoder le token JWT avec vérification de l'audience
        payload = jwt.decode(
            token, 
            IAHOME_JWT_SECRET, 
            algorithms=['HS256'],
            audience='librespeed-service',
            issuer='iahome.fr'
        )
        
        # Vérifier l'expiration
        if 'exp' in payload and datetime.now().timestamp() > payload['exp']:
            logger.warning("Token expiré")
            return None
            
        logger.info(f"Token validé avec succès pour l'utilisateur: {payload.get('userId')}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expiré")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token invalide: {e}")
        return None
    except Exception as e:
        logger.error(f"Erreur validation token: {e}")
        return None

def get_user_from_token():
    """Récupérer l'utilisateur depuis le token d'authentification IAHome"""
    # Méthode 1: Vérifier le token JWT dans les paramètres de l'URL
    auth_token = request.args.get('auth_token')
    if auth_token:
        logger.info(f"Token JWT trouvé dans les paramètres: {auth_token[:50]}...")
        payload = validate_iahome_token(auth_token)
        if payload:
            logger.info(f"Token JWT validé avec succès pour l'utilisateur: {payload.get('userId')}")
            return payload.get('userId')
        else:
            logger.warning("Token JWT invalide dans les paramètres")
    
    # Méthode 2: Vérifier le token JWT dans les headers
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header[7:]
        logger.info(f"Token JWT trouvé dans les headers: {token[:50]}...")
        payload = validate_iahome_token(token)
        if payload:
            logger.info(f"Token JWT validé avec succès pour l'utilisateur: {payload.get('userId')}")
            return payload.get('userId')
        else:
            logger.warning("Token JWT invalide dans les headers")
    
    # Méthode 3: Vérifier le token dans les paramètres de l'URL (session ou accès)
    access_token = request.args.get('token')
    if access_token:
        logger.info(f"Token trouvé dans les paramètres: {access_token[:50]}...")
        
        # D'abord essayer la validation de session
        session_data = validate_session_token(access_token)
        if session_data:
            logger.info(f"Token de session validé pour l'utilisateur: {session_data['user_id']}")
            return session_data['user_id']
        
        # Sinon, vérifier les tokens d'accès valides (même logique que QR codes)
        if (access_token.startswith('prov_') or 
            access_token.startswith('0mu7iqen43x8dhzouj9o0yf') or
            access_token == '9n6zajgljmc1m92e84ky78' or
            access_token == 'aqf17cgmlqaaljqdigeuw' or
            access_token == '0slqto0ldqvg3w8q09eqc8x'):  # Token utilisateur
            logger.info(f"Token d'accès accepté: {access_token}")
            return "authenticated_user"  # Utilisateur authentifié via token d'accès
        else:
            logger.warning(f"Token invalide: {access_token}")
    
    # Aucun token valide trouvé
    logger.warning("Aucun token valide trouvé")
    return None

def require_iahome_auth(f):
    """Décorateur pour protéger les routes avec authentification IAHome"""
    def decorated_function(*args, **kwargs):
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Authentification IAHome requise'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/')
def index():
    """Page d'accueil avec interface LibreSpeed (même logique que QR codes)"""
    # Vérifier l'authentification IAHome
    user_id = get_user_from_token()
    
    if user_id:
        # Utilisateur authentifié, afficher l'application LibreSpeed
        logger.info(f"🚀 Utilisateur authentifié ({user_id}) - Affichage de LibreSpeed")
        try:
            # Faire une requête interne vers l'application LibreSpeed sur le port 8081
            response = requests.get('http://192.168.1.150:8081', timeout=10)
            if response.status_code == 200:
                return response.text
            else:
                logger.error(f"Erreur lors de la récupération de LibreSpeed: {response.status_code}")
                return """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Erreur - LibreSpeed</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
                    </style>
                </head>
                <body>
                    <h1>LibreSpeed Speedtest</h1>
                    <div class="error">
                        <h2>Erreur</h2>
                        <p>Impossible de charger LibreSpeed.</p>
                        <p>Veuillez réessayer plus tard.</p>
                    </div>
                </body>
                </html>
                """
        except Exception as e:
            logger.error(f"Erreur lors de la redirection vers LibreSpeed: {e}")
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erreur - LibreSpeed</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
                </style>
            </head>
            <body>
                <h1>LibreSpeed Speedtest</h1>
                <div class="error">
                    <h2>Erreur</h2>
                    <p>Impossible de rediriger vers LibreSpeed.</p>
                    <p>Veuillez réessayer plus tard.</p>
                </div>
            </body>
            </html>
            """
    else:
        # Utilisateur non authentifié, afficher un message d'erreur (comme QR codes)
        logger.warning("🔒 Accès refusé - Authentification requise")
        error_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>LibreSpeed - Authentification requise</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
                .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px; }
            </style>
        </head>
        <body>
            <h1>LibreSpeed Speedtest</h1>
            <div class="error">
                <h2>Authentification requise</h2>
                <p>Vous devez être connecté à IAHome.fr pour accéder à ce service.</p>
            </div>
            <div class="info">
                <p>Ce service est intégré à IAHome.fr et nécessite une authentification centralisée.</p>
                <p>Veuillez accéder au service via <a href="https://iahome.fr">IAHome.fr</a></p>
            </div>
        </body>
        </html>
        """
        return error_html

@app.route('/health')
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'LibreSpeed - IAHome',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    """Valider un token JWT et retourner les informations utilisateur"""
    try:
        # Récupérer le token depuis les headers ou le body
        token = None
        
        # Essayer d'abord depuis les headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
        else:
            # Essayer depuis le body JSON
            data = request.get_json()
            if data and 'token' in data:
                token = data['token']
        
        if not token:
            return jsonify({'success': False, 'error': 'Token manquant'}), 401
        
        # Valider le token
        payload = validate_iahome_token(token)
        if not payload:
            return jsonify({'success': False, 'error': 'Token invalide'}), 401
        
        # Retourner les informations utilisateur
        user_info = {
            'success': True,
            'userId': payload.get('userId'),
            'userEmail': payload.get('userEmail'),
            'email': payload.get('userEmail'),  # Alias pour compatibilité
            'moduleId': payload.get('moduleId'),
            'moduleTitle': payload.get('moduleTitle'),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Token validé avec succès pour l'utilisateur: {user_info['userEmail']}")
        return jsonify(user_info)
        
    except Exception as e:
        logger.error(f"Erreur lors de la validation du token: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-session-token', methods=['POST'])
def create_session_token_api():
    """Créer un token de session pour l'utilisateur"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        user_id = data.get('userId')
        user_email = data.get('userEmail')
        duration_hours = data.get('duration_hours', 24)
        
        if not user_id or not user_email:
            return jsonify({'success': False, 'error': 'userId et userEmail requis'}), 400
        
        # Créer le token de session
        token = create_session_token(user_id, user_email, duration_hours)
        
        if token:
            return jsonify({
                'success': True,
                'token': token,
                'userId': user_id,
                'userEmail': user_email,
                'expires_in_hours': duration_hours,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Impossible de créer le token de session'}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la création du token de session: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/revoke-session-token', methods=['POST'])
def revoke_session_token_api():
    """Révoquer un token de session"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        token = data.get('token')
        if not token:
            return jsonify({'success': False, 'error': 'Token requis'}), 400
        
        # Révoquer le token
        success = revoke_session_token(token)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Token révoqué avec succès',
                'token': token,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Impossible de révoquer le token'}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la révocation du token: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/revoke-user-tokens', methods=['POST'])
def revoke_user_tokens_api():
    """Révoquer tous les tokens d'un utilisateur"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        user_id = data.get('userId')
        if not user_id:
            return jsonify({'success': False, 'error': 'userId requis'}), 400
        
        # Révoquer tous les tokens de l'utilisateur
        success = revoke_user_tokens(user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Tous les tokens de l\'utilisateur ont été révoqués',
                'userId': user_id,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Impossible de révoquer les tokens de l\'utilisateur'}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la révocation des tokens utilisateur: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Démarrage du service LibreSpeed - IAHome...")
    print("🌐 Interface web: http://localhost:7006")
    print("📡 API: http://localhost:7006/api/validate-token")
    print("❤️  Health check: http://localhost:7006/health")
    
    app.run(host='0.0.0.0', port=7006, debug=False)


