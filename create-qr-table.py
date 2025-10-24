#!/usr/bin/env python3
"""
Script pour créer la table dynamic_qr_codes dans Supabase
Utilise la base de données Supabase d'IAHome
"""

from supabase import create_client
import os
from dotenv import load_dotenv

# Charger la configuration
load_dotenv('essentiels/qrcodes/config.env')

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

def create_table():
    """Créer la table dynamic_qr_codes"""
    try:
        # Connexion à Supabase
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"✅ Connexion à Supabase réussie: {SUPABASE_URL}")
        
        # Le script SQL doit être exécuté dans l'interface Supabase
        # car l'API Python ne permet pas d'exécuter du DDL
        print("\n📋 Pour créer la table, exécutez ce script SQL dans l'éditeur SQL de Supabase:")
        print("=" * 80)
        
        with open('essentiels/qrcodes/supabase_schema.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
            print(sql_content)
        
        print("=" * 80)
        print("\n🔗 Allez sur: https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr/sql")
        print("📝 Copiez le script ci-dessus et exécutez-le")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    create_table()



