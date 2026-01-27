"""
Patch précoce pour corriger le bug gradio_client TypeError: argument of type 'bool' is not iterable
Ce module doit être importé AVANT gradio pour que le patch fonctionne.
"""
import sys

# Appliquer le patch dès que possible
if 'gradio_client' not in sys.modules:
    try:
        import gradio_client.utils as client_utils
        
        # Sauvegarder la fonction originale
        _original_get_type = client_utils.get_type
        
        def patched_get_type(schema):
            """Patch pour gérer les schémas booléens dans gradio_client"""
            if isinstance(schema, bool):
                return "boolean"
            return _original_get_type(schema)
        
        # Remplacer la fonction
        client_utils.get_type = patched_get_type
        print("✅ Patch gradio_client appliqué (early)")
    except Exception as e:
        print(f"⚠️ Erreur lors de l'application du patch: {e}")
