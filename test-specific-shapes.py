#!/usr/bin/env python3
"""
Test spécifique pour vérifier la reconnaissance des formes
"""

import requests
import json
import time

# Configuration
NEXTJS_URL = "http://localhost:3000"

def test_specific_shape(message, expected_shape):
    """Test une forme spécifique"""
    print(f"\n🧪 Test: '{message}'")
    print(f"   Attendu: {expected_shape}")
    
    try:
        data = {
            "message": message,
            "conversation": []
        }
        
        response = requests.post(f"{NEXTJS_URL}/api/blender-3d", json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            # Extraire la forme depuis la réponse
            actual_shape = None
            if result.get('actions') and len(result['actions']) > 0:
                action = result['actions'][0]
                if action.get('args') and action['args'].get('shape'):
                    actual_shape = action['args']['shape']
                elif action.get('result') and action['result'].get('object_type'):
                    actual_shape = action['result']['object_type']
            
            # Vérifier si la forme est correcte
            if actual_shape == expected_shape:
                print(f"   ✅ Succès: {actual_shape}")
                print(f"   📝 Réponse: {result['response']}")
                return True
            else:
                print(f"   ❌ Échec: attendu '{expected_shape}', obtenu '{actual_shape}'")
                print(f"   📝 Réponse: {result['response']}")
                return False
        else:
            print(f"   ❌ Erreur HTTP: {response.status_code}")
            print(f"   📝 Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def main():
    """Test principal"""
    print("🎯 Test de reconnaissance des formes spécifiques")
    print("=" * 60)
    
    # Tests de formes spécifiques
    tests = [
        ("Crée un cube", "cube"),
        ("Crée une sphère", "sphere"),
        ("Crée un cylindre", "cylinder"),
        ("Crée un cône", "cone"),
        ("Crée un tore", "torus"),
        ("Crée une sphère de taille 5", "sphere"),
        ("Crée un cylindre de taille 3", "cylinder"),
        ("Crée un cube de taille 2", "cube"),
        ("Crée un cône de taille 1.5", "cone"),
        ("Crée un tore de taille 4", "torus"),
        ("Fais-moi un cube", "cube"),
        ("Génère une sphère", "sphere"),
        ("Je veux un cylindre", "cylinder"),
        ("Donne-moi un cône", "cone"),
        ("Crée un tore pour moi", "torus"),
    ]
    
    results = []
    for message, expected_shape in tests:
        result = test_specific_shape(message, expected_shape)
        results.append(result)
        time.sleep(1)  # Pause entre les tests
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS DE FORMES")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Tests réussis: {passed}/{total}")
    print(f"❌ Tests échoués: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 Toutes les formes sont correctement reconnues !")
    else:
        print("⚠️  Certaines formes ne sont pas reconnues correctement.")
        
        # Afficher les échecs
        failed_tests = []
        for i, (message, expected_shape) in enumerate(tests):
            if not results[i]:
                failed_tests.append((message, expected_shape))
        
        if failed_tests:
            print("\n❌ Tests échoués:")
            for message, expected_shape in failed_tests:
                print(f"   - '{message}' (attendu: {expected_shape})")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)


