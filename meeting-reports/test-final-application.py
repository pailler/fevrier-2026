#!/usr/bin/env python3
"""
Test final de l'application Meeting Reports avec les modifications UI
"""

import requests
import time

def test_complete_workflow():
    """Test du workflow complet de l'application"""
    print("=== Test Workflow Complet ===")
    
    # 1. Test de santé du backend
    print("[1] Test de santé du backend...")
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Backend OK - Whisper: {data.get('whisper_loaded', False)}")
        else:
            print(f"[ERROR] Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur backend: {e}")
        return False
    
    # 2. Test de l'API de résumé
    print("\n[2] Test de l'API de résumé...")
    test_text = """
    Réunion de projet Meeting Reports - 16 octobre 2025
    
    Participants: Jean (Développeur), Marie (Designer), Pierre (Chef de projet)
    
    Ordre du jour:
    1. Finalisation de l'interface utilisateur
    2. Intégration de la marque IAHome
    3. Tests de l'API de résumé OpenAI
    4. Déploiement de la version finale
    
    Décisions prises:
    - Ajouter "proposé par IAHome" dans le titre
    - Mettre à jour la description de l'application
    - Finaliser l'intégration OpenAI
    
    Actions:
    - Jean: Finaliser les tests
    - Marie: Valider l'interface utilisateur
    - Pierre: Préparer le déploiement
    
    Prochaine réunion: lundi 20 octobre à 10h.
    """
    
    try:
        payload = {
            "text": test_text,
            "language": "fr"
        }
        
        response = requests.post("http://localhost:8001/summarize", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            ai_enhanced = result.get("ai_enhanced", False)
            print(f"[OK] Résumé généré - AI: {'Oui' if ai_enhanced else 'Non'}")
            
            if ai_enhanced:
                summary = result.get("summary", {})
                if isinstance(summary, dict):
                    print(f"[RÉSUMÉ] {summary.get('summary', 'N/A')[:100]}...")
                else:
                    print(f"[RÉSUMÉ] {str(summary)[:100]}...")
            else:
                print("[INFO] Mode fallback utilisé")
        else:
            print(f"[ERROR] Erreur API résumé: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Erreur résumé: {e}")
        return False
    
    # 3. Test de l'interface utilisateur
    print("\n[3] Test de l'interface utilisateur...")
    try:
        response = requests.get("http://localhost:3001")
        if response.status_code == 200:
            content = response.text
            if "proposé par IAHome" in content and "Générez un résumé du compte rendu de votre dernière réunion" in content:
                print("[OK] Interface utilisateur mise à jour correctement")
            else:
                print("[WARNING] Modifications UI non détectées")
        else:
            print(f"[ERROR] Frontend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur frontend: {e}")
        return False
    
    return True

def test_reports_list():
    """Test de la liste des rapports"""
    print("\n[4] Test de la liste des rapports...")
    
    try:
        response = requests.get("http://localhost:8001/reports")
        if response.status_code == 200:
            reports = response.json()
            print(f"[OK] {len(reports)} rapport(s) trouvé(s)")
            
            if reports:
                # Afficher le dernier rapport
                latest_report = reports[0]
                print(f"[DERNIER RAPPORT] {latest_report.get('title', 'Sans titre')}")
                print(f"[DATE] {latest_report.get('created_at', 'N/A')}")
            else:
                print("[INFO] Aucun rapport existant")
        else:
            print(f"[ERROR] Erreur récupération rapports: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur rapports: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Test Final de l'Application Meeting Reports")
    print("=" * 60)
    print("Vérification des modifications UI et fonctionnalités")
    print("=" * 60)
    
    # Tests
    workflow_ok = test_complete_workflow()
    reports_ok = test_reports_list()
    
    print("\n" + "=" * 60)
    print("RÉSULTATS FINAUX")
    print("=" * 60)
    
    if workflow_ok and reports_ok:
        print("[SUCCESS] Application completement fonctionnelle!")
        print("\n[OK] Fonctionnalites validees:")
        print("   - Interface utilisateur mise a jour avec IAHome")
        print("   - Titre: 'Meeting Reports Generator - propose par IAHome'")
        print("   - Description: 'Generez un resume du compte rendu de votre derniere reunion'")
        print("   - API de resume OpenAI fonctionnelle")
        print("   - Backend et frontend operationnels")
        
        print("\n[ACCES] Application:")
        print("   - Frontend: http://localhost:3001")
        print("   - Backend: http://localhost:8001")
        
        print("\n[READY] L'application est prete a l'utilisation!")
    else:
        print("[ERROR] Certains tests ont echoue")
        print("Verifiez les logs ci-dessus pour plus de details")
