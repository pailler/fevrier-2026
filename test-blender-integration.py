#!/usr/bin/env python3
"""
Script de test pour l'intégration complète Blender 3D
Teste l'API Next.js qui communique avec l'API Flask
"""

import requests
import json
import time

# Configuration
NEXTJS_URL = "http://localhost:3000"
API_URL = "http://localhost:3001"

def test_nextjs_health():
    """Test de santé de l'application Next.js"""
    print("🔍 Test de santé Next.js...")
    try:
        response = requests.get(f"{NEXTJS_URL}/api/blender-3d", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Next.js en ligne: {data}")
            return True
        else:
            print(f"❌ Erreur Next.js: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur connexion Next.js: {e}")
        return False

def test_blender_chat():
    """Test du chatbot Blender via Next.js"""
    print("\n💬 Test du chatbot Blender...")
    try:
        data = {
            "message": "Crée un cube de taille 3",
            "conversation": []
        }
        
        response = requests.post(f"{NEXTJS_URL}/api/blender-3d", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chatbot fonctionne: {result['response']}")
            print(f"📊 Actions: {len(result.get('actions', []))}")
            return True
        else:
            print(f"❌ Erreur chatbot: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_different_shapes():
    """Test de différentes formes"""
    print("\n🎨 Test de différentes formes...")
    
    shapes = [
        "Crée une sphère de taille 2",
        "Crée un cylindre de taille 4",
        "Crée un cône de taille 1.5",
        "Crée un tore de taille 3"
    ]
    
    results = []
    for shape in shapes:
        try:
            print(f"  Test: {shape}")
            data = {
                "message": shape,
                "conversation": []
            }
            
            response = requests.post(f"{NEXTJS_URL}/api/blender-3d", json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                print(f"    ✅ Succès: {result['response']}")
                results.append(True)
            else:
                print(f"    ❌ Erreur: {response.status_code}")
                results.append(False)
            
            time.sleep(2)  # Pause entre les tests
            
        except Exception as e:
            print(f"    ❌ Erreur: {e}")
            results.append(False)
    
    return results

def test_export():
    """Test d'export de modèle"""
    print("\n📦 Test d'export de modèle...")
    try:
        data = {
            "message": "Exporte le modèle en format STL",
            "conversation": []
        }
        
        response = requests.post(f"{NEXTJS_URL}/api/blender-3d", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Export testé: {result['response']}")
            if result.get('modelUrl'):
                print(f"📁 URL modèle: {result['modelUrl']}")
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Démarrage des tests d'intégration Blender 3D...")
    print(f"📍 Next.js URL: {NEXTJS_URL}")
    print(f"📍 API URL: {API_URL}")
    
    # Attendre que Next.js soit prêt
    print("\n⏳ Attente de Next.js...")
    max_attempts = 30
    attempt = 0
    nextjs_ready = False
    
    while attempt < max_attempts and not nextjs_ready:
        attempt += 1
        print(f"Tentative {attempt}/{max_attempts}...")
        
        try:
            response = requests.get(f"{NEXTJS_URL}", timeout=5)
            if response.status_code == 200:
                nextjs_ready = True
                print("✅ Next.js prêt!")
            else:
                print("⏳ Next.js pas encore prêt...")
                time.sleep(2)
        except:
            print("⏳ Next.js pas encore prêt...")
            time.sleep(2)
    
    if not nextjs_ready:
        print("❌ Next.js n'a pas démarré dans le délai imparti")
        return False
    
    # Tests
    tests = [
        test_nextjs_health,
        test_blender_chat,
        test_export
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
            time.sleep(1)
        except Exception as e:
            print(f"❌ Erreur lors du test: {e}")
            results.append(False)
    
    # Test des différentes formes
    shape_results = test_different_shapes()
    results.extend(shape_results)
    
    # Résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ DES TESTS D'INTÉGRATION")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Tests réussis: {passed}/{total}")
    print(f"❌ Tests échoués: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 Tous les tests d'intégration sont passés !")
        print("💡 Le système Blender 3D fonctionne parfaitement")
    else:
        print("⚠️  Certains tests ont échoué.")
    
    print("\n🌐 URLs disponibles:")
    print(f"   Application: {NEXTJS_URL}")
    print(f"   Blender 3D: {NEXTJS_URL}/blender-3d")
    print(f"   API Flask: {API_URL}")
    print(f"   Interface Web: http://localhost:9091")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)


