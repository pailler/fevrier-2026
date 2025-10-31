#!/usr/bin/env python3
"""
Test direct de l'API OpenAI avec la clé fournie
"""

import requests
import json

def test_openai_direct():
    """Test direct de l'API OpenAI"""
    print("=== Test Direct OpenAI ===")
    
    # Configuration
    api_key = "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"
    
    # Texte de test
    test_text = """
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
    
    print(f"[INFO] Test avec {len(test_text)} caractères")
    
    # Test direct avec l'API OpenAI
    try:
        import openai
        openai.api_key = api_key
        
        print("[1] Test direct OpenAI...")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un assistant spécialisé dans le résumé de réunions en français."},
                {"role": "user", "content": f"Analyse cette transcription de réunion et fournis un résumé structuré:\n\n{test_text}"}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        print("[OK] Résumé OpenAI généré!")
        print(f"\n[RÉSUMÉ OPENAI]\n{result}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Erreur OpenAI direct: {e}")
        return False

def test_backend_with_key():
    """Test du backend avec la clé configurée"""
    print("\n=== Test Backend avec Clé ===")
    
    # Test de santé
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            print("[OK] Backend fonctionne")
        else:
            print("[ERROR] Backend ne répond pas")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur connexion: {e}")
        return False
    
    # Test de résumé
    test_text = """
    Réunion de projet - 16 octobre 2025
    
    Participants: Jean, Marie, Pierre
    
    Ordre du jour:
    1. Progrès du projet Meeting Reports
    2. Intégration de l'enregistreur audio
    3. Tests de l'upload de fichiers
    4. Problème avec Whisper sur Windows
    5. Solution de fallback implémentée
    6. Intégration OpenAI pour le résumé
    
    Décisions prises:
    - Finaliser l'intégration OpenAI
    - Tester avec de vrais enregistrements
    - Déployer la version finale
    
    Actions:
    - Jean: Finaliser la documentation
    - Marie: Tester l'interface utilisateur
    - Pierre: Optimiser les performances
    
    Prochaine réunion: vendredi 17 octobre à 14h.
    """
    
    try:
        payload = {
            "text": test_text,
            "language": "fr"
        }
        
        response = requests.post("http://localhost:8001/summarize", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("[OK] Résumé backend généré!")
            
            summary = result.get("summary", {})
            ai_enhanced = result.get("ai_enhanced", False)
            
            print(f"[INFO] Résumé AI: {'Oui' if ai_enhanced else 'Non (fallback)'}")
            
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

if __name__ == "__main__":
    print("Test de l'API OpenAI avec votre clé")
    print("=" * 50)
    
    # Test direct OpenAI
    test_openai_direct()
    
    # Test backend
    test_backend_with_key()
    
    print("\n" + "=" * 50)
    print("[OK] Tests terminés")


































