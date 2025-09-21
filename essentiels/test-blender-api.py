#!/usr/bin/env python3
"""
Script de test pour l'API Blender Flask
"""

import requests
import json
import time

# Configuration
API_URL = "http://localhost:3001"

def test_health():
    """Test de santé de l'API"""
    print("🔍 Test de santé de l'API...")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API en ligne: {data}")
            return True
        else:
            print(f"❌ Erreur API: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return False

def test_create_cube():
    """Test de création d'un cube"""
    print("\n🎲 Test de création d'un cube...")
    try:
        data = {
            "shape": "cube",
            "size": 2.0,
            "location": [0, 0, 0],
            "rotation": [0, 0, 0]
        }
        
        response = requests.post(f"{API_URL}/create_shape", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cube créé: {result}")
            return True
        else:
            print(f"❌ Erreur création cube: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_sphere():
    """Test de création d'une sphère"""
    print("\n🔵 Test de création d'une sphère...")
    try:
        data = {
            "shape": "sphere",
            "radius": 1.5,
            "location": [0, 0, 0],
            "segments": 32,
            "rings": 16
        }
        
        response = requests.post(f"{API_URL}/create_shape", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sphère créée: {result}")
            return True
        else:
            print(f"❌ Erreur création sphère: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_export_model():
    """Test d'export de modèle"""
    print("\n📦 Test d'export de modèle...")
    try:
        data = {
            "format": "obj",
            "filename": f"test_model_{int(time.time())}.obj"
        }
        
        response = requests.post(f"{API_URL}/export", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Modèle exporté: {result}")
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_process_message():
    """Test de traitement de message"""
    print("\n💬 Test de traitement de message...")
    try:
        data = {
            "message": "Crée un cylindre de taille 3"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Message traité: {result}")
            return True
        else:
            print(f"❌ Erreur traitement message: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Démarrage des tests de l'API Blender Flask...")
    print(f"📍 URL API: {API_URL}")
    
    tests = [
        test_health,
        test_create_cube,
        test_create_sphere,
        test_export_model,
        test_process_message
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
            time.sleep(1)  # Pause entre les tests
        except Exception as e:
            print(f"❌ Erreur lors du test: {e}")
            results.append(False)
    
    # Résumé
    print("\n" + "="*50)
    print("📊 RÉSUMÉ DES TESTS")
    print("="*50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Tests réussis: {passed}/{total}")
    print(f"❌ Tests échoués: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 Tous les tests sont passés !")
    else:
        print("⚠️  Certains tests ont échoué.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)


