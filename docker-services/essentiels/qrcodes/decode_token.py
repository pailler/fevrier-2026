#!/usr/bin/env python3
import jwt
import json
from datetime import datetime

# Token JWT généré par l'API
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTc1NjMzMzMxMywiaWF0IjoxNzU2MjQ2OTEzLCJpc3MiOiJpYWhvbWUuZnIiLCJhdWQiOiJxci1jb2RlLXNlcnZpY2UifQ.riJGnBxUiU2nZHzYAN1_eTBH2A6iZy6qVzAg5HX9yzA"

# Clé secrète utilisée par le service QR Code
secret = "qr-code-secret-key-change-in-production"

try:
    # Décoder le token sans vérification pour voir le contenu
    payload = jwt.decode(token, options={"verify_signature": False})
    print("Contenu du token JWT:")
    print(json.dumps(payload, indent=2))
    
    # Vérifier l'expiration
    exp_timestamp = payload.get('exp')
    current_timestamp = datetime.now().timestamp()
    print(f"\nExpiration: {exp_timestamp}")
    print(f"Timestamp actuel: {current_timestamp}")
    print(f"Token expiré: {current_timestamp > exp_timestamp}")
    
    # Essayer de décoder avec vérification complète
    try:
        payload_verified = jwt.decode(token, secret, algorithms=['HS256'])
        print("\nToken valide avec la clé secrète!")
        print(json.dumps(payload_verified, indent=2))
    except jwt.ExpiredSignatureError:
        print("\nToken expiré!")
    except jwt.InvalidAudienceError as e:
        print(f"\nErreur d'audience: {e}")
    except jwt.InvalidTokenError as e:
        print(f"\nToken invalide: {e}")
    
    # Essayer de décoder avec vérification de l'audience désactivée
    try:
        payload_no_audience = jwt.decode(token, secret, algorithms=['HS256'], options={"verify_aud": False})
        print("\nToken valide sans vérification d'audience!")
        print(json.dumps(payload_no_audience, indent=2))
    except Exception as e:
        print(f"\nErreur même sans vérification d'audience: {e}")
    
except Exception as e:
    print(f"Erreur lors du décodage: {e}")
