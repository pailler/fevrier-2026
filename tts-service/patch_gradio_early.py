"""
Patch précoce pour corriger le bug gradio_client TypeError: argument of type 'bool' is not iterable.
"""
import sys

if "gradio_client" not in sys.modules:
    try:
        import gradio_client.utils as client_utils

        _original_get_type = client_utils.get_type

        def patched_get_type(schema):
            if isinstance(schema, bool):
                return "boolean"
            return _original_get_type(schema)

        client_utils.get_type = patched_get_type
        print("Patch gradio_client appliqué (early)")
    except Exception as e:
        print(f"Impossible d'appliquer le patch: {e}")
