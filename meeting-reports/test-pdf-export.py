#!/usr/bin/env python3
"""
Script de test pour la fonctionnalité d'export PDF
"""

import requests
import json
import time
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8001"
TEST_AUDIO_FILE = "test-audio.wav"  # Fichier de test audio

def test_pdf_export():
    """Test complet de la fonctionnalité d'export PDF"""
    print("=== Test de l'export PDF ===")
    
    # 1. Vérifier que le backend est accessible
    print("1. Vérification du backend...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("[OK] Backend accessible")
        else:
            print(f"[ERROR] Backend non accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur de connexion au backend: {e}")
        return False
    
    # 2. Créer un rapport de test
    print("\n2. Création d'un rapport de test...")
    test_report = {
        "id": "test-pdf-123",
        "filename": "test-audio.wav",
        "created_at": "2025-10-16T20:30:00Z",
        "summary": "Ceci est un résumé de test pour la fonctionnalité d'export PDF. L'application Meeting Reports Generator fonctionne correctement avec la génération de PDF.",
        "key_points": [
            "Test de la fonctionnalité PDF",
            "Génération automatique de rapports",
            "Export en format professionnel"
        ],
        "action_items": [
            "Tester l'export PDF",
            "Vérifier la mise en forme",
            "Valider le téléchargement"
        ],
        "participants": [
            "Utilisateur Test",
            "Assistant IA"
        ],
        "decisions": [
            "Implémentation de l'export PDF validée",
            "Interface utilisateur mise à jour"
        ],
        "next_steps": "Continuer le développement et les tests de l'application Meeting Reports Generator.",
        "transcript": "Ceci est une transcription de test pour valider la fonctionnalité d'export PDF de l'application Meeting Reports Generator proposée par IAHome."
    }
    
    # Sauvegarder le rapport de test
    reports_dir = Path("backend/reports")
    reports_dir.mkdir(exist_ok=True)
    
    report_file = reports_dir / "test-pdf-123_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(test_report, f, indent=2, ensure_ascii=False)
    
    print("[OK] Rapport de test créé")
    
    # 3. Tester la génération de PDF
    print("\n3. Test de la génération PDF...")
    try:
        response = requests.post(f"{BASE_URL}/generate-pdf/test-pdf-123")
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("[OK] PDF généré avec succès")
                print(f"  - Chemin: {result.get('pdf_path')}")
                if result.get('pdf_info'):
                    pdf_info = result['pdf_info']
                    print(f"  - Taille: {pdf_info.get('size')} bytes")
                    print(f"  - Nom: {pdf_info.get('filename')}")
            else:
                print(f"[ERROR] Erreur lors de la génération: {result.get('error')}")
                return False
        else:
            print(f"[ERROR] Erreur HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur lors de la génération PDF: {e}")
        return False
    
    # 4. Tester le téléchargement de PDF
    print("\n4. Test du téléchargement PDF...")
    try:
        response = requests.get(f"{BASE_URL}/download-pdf/test-pdf-123")
        if response.status_code == 200:
            # Vérifier le type de contenu
            content_type = response.headers.get('content-type')
            if content_type == 'application/pdf':
                print("[OK] PDF téléchargé avec succès")
                print(f"  - Type de contenu: {content_type}")
                print(f"  - Taille: {len(response.content)} bytes")
                
                # Sauvegarder le PDF de test
                pdf_dir = Path("test-pdfs")
                pdf_dir.mkdir(exist_ok=True)
                
                pdf_file = pdf_dir / "test-export.pdf"
                with open(pdf_file, "wb") as f:
                    f.write(response.content)
                print(f"  - Sauvegardé: {pdf_file}")
            else:
                print(f"[ERROR] Type de contenu incorrect: {content_type}")
                return False
        else:
            print(f"[ERROR] Erreur HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erreur lors du téléchargement PDF: {e}")
        return False
    
    # 5. Nettoyage
    print("\n5. Nettoyage...")
    try:
        if report_file.exists():
            report_file.unlink()
        print("[OK] Fichiers de test nettoyés")
    except Exception as e:
        print(f"[WARNING] Erreur lors du nettoyage: {e}")
    
    print("\n=== Test PDF terminé avec succès ===")
    return True

def test_pdf_generator_direct():
    """Test direct du générateur PDF"""
    print("\n=== Test direct du générateur PDF ===")
    
    try:
        # Importer le générateur PDF
        import sys
        sys.path.append('backend')
        from pdf_generator import pdf_generator
        
        # Données de test
        test_data = {
            "summary": "Résumé de test pour la génération PDF directe",
            "key_points": ["Point 1", "Point 2", "Point 3"],
            "action_items": ["Action 1", "Action 2"],
            "participants": ["Participant 1", "Participant 2"],
            "decisions": ["Décision 1", "Décision 2"],
            "next_steps": "Prochaines étapes de test"
        }
        
        # Générer le PDF
        pdf_path = pdf_generator.generate_meeting_report_pdf(test_data, "test-direct")
        print(f"[OK] PDF généré directement: {pdf_path}")
        
        # Vérifier les informations
        pdf_info = pdf_generator.get_pdf_info(pdf_path)
        if pdf_info:
            print(f"  - Taille: {pdf_info['size']} bytes")
            print(f"  - Nom: {pdf_info['filename']}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Erreur lors du test direct: {e}")
        return False

if __name__ == "__main__":
    print("Démarrage des tests d'export PDF...")
    
    # Test direct du générateur
    test_pdf_generator_direct()
    
    # Test complet via API
    test_pdf_export()
    
    print("\nTests terminés!")
