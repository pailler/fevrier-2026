#!/usr/bin/env python3
"""
Script de test complet pour l'API Blender 3D v2.0
Teste toutes les nouvelles fonctionnalités
"""

import requests
import json
import time
import os

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

def test_create_cube_with_material():
    """Test de création d'un cube avec matériau"""
    print("\n🎲 Test de création d'un cube rouge métallique...")
    try:
        data = {
            "message": "crée un cube rouge métallique de 2cm"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cube créé: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création cube: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_sphere_glass():
    """Test de création d'une sphère en verre"""
    print("\n🔵 Test de création d'une sphère bleue en verre...")
    try:
        data = {
            "message": "une sphère bleue en verre de 1.5cm"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sphère créée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création sphère: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_cylinder_wood():
    """Test de création d'un cylindre en bois"""
    print("\n🟢 Test de création d'un cylindre vert en bois...")
    try:
        data = {
            "message": "cylindre vert en bois de 3cm"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cylindre créé: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création cylindre: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_pyramid():
    """Test de création d'une pyramide"""
    print("\n🏛️ Test de création d'une pyramide dorée...")
    try:
        data = {
            "message": "pyramide dorée en céramique"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Pyramide créée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création pyramide: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_icosphere():
    """Test de création d'une icosphère"""
    print("\n🔶 Test de création d'une icosphère lisse...")
    try:
        data = {
            "message": "icosphère violette brillante"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Icosphère créée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création icosphère: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_torus():
    """Test de création d'un tore"""
    print("\n🔄 Test de création d'un tore orange...")
    try:
        data = {
            "message": "tore orange en caoutchouc"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tore créé: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création tore: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_animation():
    """Test d'ajout d'animation"""
    print("\n🎬 Test d'ajout d'animation de rotation...")
    try:
        data = {
            "message": "cube qui tourne"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Animation ajoutée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur animation: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_scaling_animation():
    """Test d'animation de mise à l'échelle"""
    print("\n📏 Test d'animation de redimensionnement...")
    try:
        data = {
            "message": "sphère qui grandit"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Animation de redimensionnement: {result['response']}")
            return True
        else:
            print(f"❌ Erreur animation: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_export_stl():
    """Test d'export en STL"""
    print("\n📦 Test d'export en STL...")
    try:
        data = {
            "message": "exporter en STL"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Export STL: {result['response']}")
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_export_fbx():
    """Test d'export en FBX"""
    print("\n📦 Test d'export en FBX...")
    try:
        data = {
            "message": "exporter en FBX"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Export FBX: {result['response']}")
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_export_gltf():
    """Test d'export en GLTF"""
    print("\n📦 Test d'export en GLTF...")
    try:
        data = {
            "message": "exporter en GLTF"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Export GLTF: {result['response']}")
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_scene():
    """Test de création d'une scène complexe"""
    print("\n🎭 Test de création d'une scène...")
    try:
        data = {
            "message": "crée une scène avec plusieurs objets"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Scène créée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur création scène: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_help():
    """Test de la fonction d'aide"""
    print("\n❓ Test de la fonction d'aide...")
    try:
        data = {
            "message": "aide"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Aide affichée: {len(result['response'])} caractères")
            return True
        else:
            print(f"❌ Erreur aide: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_list_files():
    """Test de liste des fichiers"""
    print("\n📁 Test de liste des fichiers...")
    try:
        response = requests.get(f"{API_URL}/list_files")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Fichiers listés: {len(result['files'])} fichiers")
            for file in result['files'][:5]:  # Afficher les 5 premiers
                print(f"   - {file['name']} ({file['type']}) - {file['size']} bytes")
            return True
        else:
            print(f"❌ Erreur liste fichiers: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_unknown_command():
    """Test d'une commande inconnue"""
    print("\n❓ Test d'une commande inconnue...")
    try:
        data = {
            "message": "crée quelque chose de bizarre"
        }
        
        response = requests.post(f"{API_URL}/process_message", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Réponse appropriée: {result['response']}")
            return True
        else:
            print(f"❌ Erreur commande inconnue: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def run_all_tests():
    """Exécute tous les tests"""
    print("🚀 Démarrage des tests de l'API Blender 3D v2.0")
    print("=" * 60)
    
    tests = [
        ("Santé de l'API", test_health),
        ("Cube rouge métallique", test_create_cube_with_material),
        ("Sphère bleue en verre", test_create_sphere_glass),
        ("Cylindre vert en bois", test_create_cylinder_wood),
        ("Pyramide dorée", test_create_pyramid),
        ("Icosphère violette", test_create_icosphere),
        ("Tore orange", test_create_torus),
        ("Animation de rotation", test_animation),
        ("Animation de redimensionnement", test_scaling_animation),
        ("Export STL", test_export_stl),
        ("Export FBX", test_export_fbx),
        ("Export GLTF", test_export_gltf),
        ("Création de scène", test_create_scene),
        ("Fonction d'aide", test_help),
        ("Liste des fichiers", test_list_files),
        ("Commande inconnue", test_unknown_command)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            success = test_func()
            results.append((test_name, success))
            if success:
                print(f"✅ {test_name}: SUCCÈS")
            else:
                print(f"❌ {test_name}: ÉCHEC")
        except Exception as e:
            print(f"❌ {test_name}: ERREUR - {e}")
            results.append((test_name, False))
        
        # Pause entre les tests
        time.sleep(1)
    
    # Résumé final
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    successful = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ SUCCÈS" if success else "❌ ÉCHEC"
        print(f"{test_name}: {status}")
    
    print(f"\n🎯 Résultat global: {successful}/{total} tests réussis ({successful/total*100:.1f}%)")
    
    if successful == total:
        print("🎉 Tous les tests sont passés avec succès !")
    elif successful >= total * 0.8:
        print("👍 La plupart des tests sont passés !")
    else:
        print("⚠️ Plusieurs tests ont échoué, vérifiez la configuration.")

if __name__ == "__main__":
    run_all_tests()

