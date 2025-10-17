#!/usr/bin/env python3
"""
Test du résumé OpenAI
"""

import requests
import json

def test_openai_summarization():
    """Test de la fonction de résumé OpenAI"""
    print("=== Test du Résumé OpenAI ===")
    
    # Test de santé du backend
    print("[1] Test de santé du backend...")
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            print("[OK] Backend fonctionne")
        else:
            print("[ERROR] Backend ne repond pas")
            return
    except Exception as e:
        print(f"[ERROR] Erreur connexion: {e}")
        return
    
    # Texte de test (simulation d'une réunion)
    test_transcript = """
    Bonjour tout le monde, bienvenue à notre réunion hebdomadaire. 
    Nous allons discuter des progrès du projet Meeting Reports.
    
    Jean: J'ai terminé l'intégration de l'enregistreur audio. L'interface est maintenant fonctionnelle.
    Marie: Excellent ! J'ai testé l'upload de fichiers et tout fonctionne bien.
    Pierre: Pour la transcription, nous avons un problème avec Whisper sur Windows.
    Jean: Oui, mais nous avons implémenté une solution de fallback avec une transcription simulée.
    
    Marie: Qu'en est-il du résumé automatique ?
    Pierre: Nous devons intégrer OpenAI pour l'analyse intelligente des transcriptions.
    Jean: Parfait, c'est exactement ce que nous faisons maintenant.
    
    Actions à prendre:
    - Finaliser l'intégration OpenAI
    - Tester le résumé avec de vrais enregistrements
    - Déployer la version finale
    - Documenter l'utilisation
    
    Prochaine réunion: vendredi à 14h.
    """
    
    print("\n[2] Test du résumé...")
    print(f"Texte à résumer ({len(test_transcript)} caractères):")
    print(f"'{test_transcript[:100]}...'")
    
    # Appel de l'API de résumé
    try:
        payload = {
            "text": test_transcript,
            "language": "fr"
        }
        
        response = requests.post("http://localhost:8001/summarize", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("[OK] Résumé généré avec succès!")
            
            summary = result.get("summary", {})
            ai_enhanced = result.get("ai_enhanced", False)
            
            print(f"\n[INFO] Résumé AI: {'Oui' if ai_enhanced else 'Non (fallback)'}")
            
            if isinstance(summary, dict):
                print(f"\n[RÉSUMÉ] {summary.get('summary', 'N/A')}")
                
                print(f"\n[POINTS CLÉS]")
                for point in summary.get('key_points', []):
                    print(f"  - {point}")
                
                print(f"\n[ACTIONS]")
                for action in summary.get('action_items', []):
                    print(f"  - {action}")
                
                print(f"\n[PARTICIPANTS]")
                for participant in summary.get('participants', []):
                    print(f"  - {participant}")
                
                print(f"\n[DÉCISIONS]")
                for decision in summary.get('decisions', []):
                    print(f"  - {decision}")
                
                print(f"\n[PROCHAINES ÉTAPES] {summary.get('next_steps', 'N/A')}")
            else:
                print(f"[RÉSUMÉ] {summary}")
            
            return True
            
        else:
            print(f"[ERROR] Erreur API: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        return False

def test_with_real_transcript():
    """Test avec une vraie transcription"""
    print("\n=== Test avec Transcription Réelle ===")
    
    # Utiliser une transcription existante
    try:
        response = requests.get("http://localhost:8001/reports")
        if response.status_code == 200:
            reports = response.json()
            if reports:
                latest_report = reports[0]
                print(f"[INFO] Utilisation du rapport: {latest_report.get('id', 'N/A')}")
                
                # Récupérer le rapport complet
                report_response = requests.get(f"http://localhost:8001/report/{latest_report['id']}")
                if report_response.status_code == 200:
                    report_data = report_response.json()
                    transcript = report_data.get('transcript', '')
                    
                    if transcript:
                        print(f"[INFO] Transcription trouvée ({len(transcript)} caractères)")
                        
                        # Résumer cette transcription
                        payload = {
                            "text": transcript,
                            "language": "fr"
                        }
                        
                        summary_response = requests.post("http://localhost:8001/summarize", json=payload)
                        if summary_response.status_code == 200:
                            result = summary_response.json()
                            print("[OK] Résumé de transcription réelle généré!")
                            
                            summary = result.get("summary", {})
                            if isinstance(summary, dict):
                                print(f"\n[RÉSUMÉ AMÉLIORÉ] {summary.get('summary', 'N/A')}")
                            else:
                                print(f"[RÉSUMÉ] {summary}")
                            
                            return True
                        else:
                            print(f"[ERROR] Erreur résumé: {summary_response.status_code}")
                    else:
                        print("[WARNING] Aucune transcription trouvée")
                else:
                    print(f"[ERROR] Erreur récupération rapport: {report_response.status_code}")
            else:
                print("[INFO] Aucun rapport disponible")
        else:
            print(f"[ERROR] Erreur liste rapports: {response.status_code}")
            
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
    
    return False

if __name__ == "__main__":
    print("Test de la Fonction de Resume OpenAI")
    print("=" * 50)
    
    # Test avec texte simulé
    test_openai_summarization()
    
    # Test avec transcription réelle
    test_with_real_transcript()
    
    print("\n" + "=" * 50)
    print("[OK] Tests termines")
    print("\nPour utiliser OpenAI:")
    print("1. Obtenez une cle API OpenAI")
    print("2. Ajoutez-la dans backend/config.env")
    print("3. Redemarrez le backend")
