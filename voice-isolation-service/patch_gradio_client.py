"""
Patch pour corriger le bug gradio_client TypeError: argument of type 'bool' is not iterable
Bug connu: https://github.com/gradio-app/gradio/issues/11722

Ce script doit être exécuté AVANT l'import de gradio.
"""
import sys
import os

# Chemin vers gradio_client/utils.py
try:
    import gradio_client.utils as client_utils
    
    # Sauvegarder la fonction originale
    original_get_type = client_utils.get_type
    
    def patched_get_type(schema):
        """Patch pour gérer les schémas booléens dans gradio_client"""
        if isinstance(schema, bool):
            return "boolean"
        return original_get_type(schema)
    
    # Appliquer le patch
    client_utils.get_type = patched_get_type
    print("✅ Patch gradio_client appliqué avec succès")
except (ImportError, AttributeError) as e:
    print(f"⚠️ Impossible d'appliquer le patch gradio_client: {e}")
    # On continue quand même, le patch n'est peut-être pas nécessaire
