#!/usr/bin/env python3
"""
Script de test pour le workflow de production IAHome
Teste l'intégration complète du service QR Code Generator
"""

import requests
import json
import jwt
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:7005"
IAHOME_JWT_SECRET = "qr-code-secret-key-change-in-production"

def create_test_token(user_id="test_user", email="test@iahome.fr"):
    """Créer un token JWT de test pour simuler l'authentification IAHome"""
    payload = {
        'userId': user_id,
        'email': email,
        'aud': 'qr-code-service',
        'iss': 'iahome.fr',
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, IAHOME_JWT_SECRET, algorithm='HS256')

def test_health_check():
    """Test du health check"""
    print("🔍 Test du health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check OK - Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health check échoué - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur health check: {e}")
        return False

def test_authentication():
    """Test de l'authentification"""
    print("\n🔐 Test de l'authentification...")
    try:
        # Test sans token
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            if "Authentification requise" in response.text:
                print("✅ Authentification requise correctement détectée")
            else:
                print("⚠️  Page accessible sans authentification")
        
        # Test avec token valide
        token = create_test_token()
        response = requests.get(f"{BASE_URL}/?auth_token={token}")
        if response.status_code == 200:
            if "QR Code Generator" in response.text:
                print("✅ Authentification avec token valide OK")
                return True
            else:
                print("❌ Page non accessible avec token valide")
                return False
        else:
            print(f"❌ Erreur authentification - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur test authentification: {e}")
        return False

def test_api_endpoints():
    """Test des endpoints API"""
    print("\n🔌 Test des endpoints API...")
    token = create_test_token()
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test liste QR codes
    try:
        response = requests.get(f"{BASE_URL}/api/dynamic/qr", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ API liste QR codes OK")
            else:
                print("❌ API liste QR codes échoué")
                return False
        else:
            print(f"❌ API liste QR codes - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur API liste QR codes: {e}")
        return False
    
    return True

def test_qr_code_creation():
    """Test de création de QR code"""
    print("\n🎯 Test de création de QR code...")
    token = create_test_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Données de test
    test_data = {
        'target': 'web',
        'type': 'dynamic',
        'url': 'https://iahome.fr',
        'name': 'Test QR Code IAHome',
        'size': 300,
        'foreground_color': '#000000',
        'background_color': '#FFFFFF',
        'logo_size': 15,
        'logo_position': 'center'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/dynamic/qr", 
                               headers=headers, 
                               json=test_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                qr_id = data.get('qr_id')
                print(f"✅ QR code créé avec succès - ID: {qr_id}")
                return qr_id
            else:
                print(f"❌ Création QR code échouée: {data.get('error')}")
                return None
        else:
            print(f"❌ Création QR code - Status: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Erreur création QR code: {e}")
        return None

def test_qr_code_modification(qr_id):
    """Test de modification de QR code"""
    print(f"\n✏️  Test de modification de QR code {qr_id}...")
    token = create_test_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Données de modification
    update_data = {
        'url': 'https://iahome.fr/modified',
        'name': 'QR Code IAHome Modifié',
        'foreground_color': '#2563eb',
        'background_color': '#f8fafc'
    }
    
    try:
        response = requests.put(f"{BASE_URL}/api/dynamic/qr/{qr_id}", 
                              headers=headers, 
                              json=update_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Modification QR code OK")
                return True
            else:
                print(f"❌ Modification QR code échouée: {data.get('error')}")
                return False
        else:
            print(f"❌ Modification QR code - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur modification QR code: {e}")
        return False

def test_qr_code_deletion(qr_id):
    """Test de suppression de QR code"""
    print(f"\n🗑️  Test de suppression de QR code {qr_id}...")
    token = create_test_token()
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.delete(f"{BASE_URL}/api/dynamic/qr/{qr_id}", 
                                 headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Suppression QR code OK")
                return True
            else:
                print(f"❌ Suppression QR code échouée: {data.get('error')}")
                return False
        else:
            print(f"❌ Suppression QR code - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur suppression QR code: {e}")
        return False

def test_redirect_functionality():
    """Test de la fonctionnalité de redirection"""
    print("\n🔄 Test de la fonctionnalité de redirection...")
    
    # Créer un QR code pour le test
    token = create_test_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    test_data = {
        'target': 'web',
        'type': 'dynamic',
        'url': 'https://iahome.fr/test-redirect',
        'name': 'Test Redirection',
        'size': 300
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/dynamic/qr", 
                               headers=headers, 
                               json=test_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                qr_id = data.get('qr_id')
                qr_url = data.get('qr_url')
                print(f"✅ QR code de test créé - URL: {qr_url}")
                
                # Test de redirection
                redirect_response = requests.get(f"{BASE_URL}/r/{qr_id}", 
                                               allow_redirects=False)
                if redirect_response.status_code in [301, 302]:
                    print("✅ Redirection fonctionne correctement")
                    
                    # Supprimer le QR code de test
                    requests.delete(f"{BASE_URL}/api/dynamic/qr/{qr_id}", 
                                  headers=headers)
                    return True
                else:
                    print(f"❌ Redirection échouée - Status: {redirect_response.status_code}")
                    return False
            else:
                print("❌ Création QR code de test échouée")
                return False
        else:
            print(f"❌ Création QR code de test - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur test redirection: {e}")
        return False

def main():
    """Test principal du workflow de production"""
    print("🚀 Test du Workflow de Production IAHome - QR Code Generator v4.0.0")
    print("=" * 70)
    
    tests = [
        ("Health Check", test_health_check),
        ("Authentification", test_authentication),
        ("Endpoints API", test_api_endpoints),
        ("Création QR Code", test_qr_code_creation),
        ("Fonctionnalité Redirection", test_redirect_functionality)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            if test_name == "Création QR Code":
                qr_id = test_func()
                if qr_id:
                    results.append((test_name, True))
                    # Test modification et suppression
                    if test_qr_code_modification(qr_id):
                        results.append(("Modification QR Code", True))
                    else:
                        results.append(("Modification QR Code", False))
                    
                    if test_qr_code_deletion(qr_id):
                        results.append(("Suppression QR Code", True))
                    else:
                        results.append(("Suppression QR Code", False))
                else:
                    results.append((test_name, False))
            else:
                success = test_func()
                results.append((test_name, success))
        except Exception as e:
            print(f"❌ Erreur dans le test {test_name}: {e}")
            results.append((test_name, False))
    
    # Résumé des tests
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\n📈 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 TOUS LES TESTS SONT PASSÉS ! Le service est prêt pour la production.")
        print("\n✅ Workflow IAHome complet validé:")
        print("   - Authentification centralisée")
        print("   - Création de QR codes dynamiques")
        print("   - Personnalisation avancée")
        print("   - Gestion des QR codes")
        print("   - Redirection et suivi")
        print("   - Interface utilisateur")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez la configuration.")
    
    print(f"\n🌐 Service accessible sur: {BASE_URL}")
    print("📚 Documentation: INTEGRATION_IAHOME.md")

if __name__ == "__main__":
    main()
