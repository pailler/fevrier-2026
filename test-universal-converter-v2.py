#!/usr/bin/env python3
"""
Test script pour Universal Converter v2
Teste toutes les nouvelles fonctionnalités
"""

import requests
import json
import os
from pathlib import Path

# Configuration
BASE_URL = "https://converter.iahome.fr"
TEST_TOKEN = "test_token_123"  # Token de test

def test_health_check():
    """Test de l'API de santé"""
    print("🔍 Test de l'API de santé...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API de santé OK: {data['status']}")
            print(f"   Outils disponibles: {data['tools']}")
            return True
        else:
            print(f"❌ Erreur API de santé: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur lors du test de santé: {e}")
        return False

def test_formats_api():
    """Test de l'API des formats"""
    print("\n🔍 Test de l'API des formats...")
    try:
        response = requests.get(f"{BASE_URL}/api/formats?token={TEST_TOKEN}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API des formats OK: {len(data)} catégories")
            for category, formats in data.items():
                print(f"   {category}: {len(formats['input'])} formats d'entrée, {len(formats['output'])} formats de sortie")
            return True
        else:
            print(f"❌ Erreur API des formats: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur lors du test des formats: {e}")
        return False

def test_unauthorized_access():
    """Test de l'accès non autorisé"""
    print("\n🔍 Test de l'accès non autorisé...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 401:
            print("✅ Protection par token OK: Accès refusé sans token")
            return True
        else:
            print(f"❌ Erreur de sécurité: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur lors du test de sécurité: {e}")
        return False

def test_api_endpoints():
    """Test des endpoints API"""
    print("\n🔍 Test des endpoints API...")
    
    endpoints = [
        "/api/convert",
        "/api/convert-batch", 
        "/api/ocr",
        "/api/formats"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}?token={TEST_TOKEN}", timeout=5)
            if response.status_code in [200, 405]:  # 405 = Method Not Allowed (normal pour GET sur POST endpoints)
                print(f"✅ {endpoint}: Accessible")
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: Erreur - {e}")

def test_container_status():
    """Test du statut du container"""
    print("\n🔍 Test du statut du container...")
    try:
        import subprocess
        result = subprocess.run(['docker', 'ps', '--filter', 'name=universal-converter', '--format', 'table {{.Names}}\t{{.Status}}'], 
                              capture_output=True, text=True, timeout=10)
        if 'universal-converter' in result.stdout:
            print("✅ Container Universal Converter en cours d'exécution")
            print(f"   Statut: {result.stdout}")
            return True
        else:
            print("❌ Container Universal Converter non trouvé")
            return False
    except Exception as e:
        print(f"❌ Erreur lors de la vérification du container: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Test de Universal Converter v2")
    print("=" * 50)
    
    tests = [
        test_container_status,
        test_health_check,
        test_unauthorized_access,
        test_formats_api,
        test_api_endpoints
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Erreur dans le test: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Résultats: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests sont passés ! Universal Converter v2 est prêt !")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.")

if __name__ == "__main__":
    main()
