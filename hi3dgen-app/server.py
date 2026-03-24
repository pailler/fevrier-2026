"""
Hi3DGen — serveur FastAPI sur port 8095
Génération 3D image → mesh GLB via Hi3DGen (Stable-X).
"""
# Désactive torch.compile/dynamo avant tout import (conflit diffusers/xformers)
import os as _os
_os.environ.setdefault("TORCH_COMPILE_DISABLE", "1")
_os.environ.setdefault("TORCHDYNAMO_DISABLE", "1")
import io
import os
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

PORT = int(os.environ.get("PORT", 8095))
TMP_DIR = Path(__file__).parent / "tmp"
TMP_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Hi3DGen Standalone")

# Fichiers statiques (HTML, CSS, JS)
STATIC_DIR = Path(__file__).parent / "public"


@app.get("/")
async def root():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Hi3DGen API", "docs": "/docs"}


@app.get("/api/check")
async def check():
    """Vérifie que le serveur fonctionne."""
    try:
        import torch
        gpu = torch.cuda.is_available()
        return {"ok": True, "gpu": gpu, "mode": "standalone"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.get("/api/check-deps")
async def check_deps():
    """Vérifie les dépendances Hi3DGen (évite l'erreur 503 avant génération)."""
    missing = []
    try:
        import torch
    except ImportError as e:
        missing.append(f"torch: {e}")
    try:
        from trellis.pipelines import TrellisImageTo3DPipeline  # noqa: F401
    except ImportError as e:
        missing.append(f"trellis-3d-python: {e}")
    try:
        import trimesh  # noqa: F401
    except ImportError as e:
        missing.append(f"trimesh: {e}")
    ok = len(missing) == 0
    return {
        "ok": ok,
        "missing": missing,
        "fix": "pip install -r requirements.txt" if missing else None,
    }


@app.post("/api/generate")
async def generate(image: UploadFile = File(...)):
    """
    Génère un modèle 3D (GLB) à partir d'une image.
    Retourne le fichier GLB directement.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(400, "Fichier image requis (PNG, JPG, etc.)")

    out_dir = TMP_DIR / f"run-{os.urandom(4).hex()}"
    out_dir.mkdir(exist_ok=True)

    try:
        content = await image.read()
        img = __import__("PIL.Image").Image.open(io.BytesIO(content)).convert("RGB")
        img.load()

        from generator import generate_mesh

        mesh_path = generate_mesh(img, str(out_dir))

        if not os.path.exists(mesh_path):
            raise HTTPException(500, "Le mesh n'a pas été généré")

        with open(mesh_path, "rb") as f:
            glb_bytes = f.read()

        return Response(
            content=glb_bytes,
            media_type="model/gltf-binary",
            headers={"Content-Disposition": 'attachment; filename="hi3dgen-output.glb"'},
        )
    except ImportError as e:
        err_msg = str(e)
        print(f"[Hi3DGen] ImportError: {err_msg}")
        raise HTTPException(
            503,
            detail=f"Dépendances manquantes. Exécutez: pip install -r requirements.txt — Détail: {err_msg}",
        )
    except Exception as e:
        err_msg = str(e)
        print(f"[Hi3DGen] Erreur: {err_msg}")
        raise HTTPException(500, detail=err_msg)
    finally:
        if out_dir.exists():
            shutil.rmtree(out_dir, ignore_errors=True)


# Servir style.css et app.js à la racine (compatibilité frontend)
@app.get("/style.css")
async def style_css():
    p = STATIC_DIR / "style.css"
    if p.exists():
        return FileResponse(str(p), media_type="text/css")
    raise HTTPException(404)

@app.get("/app.js")
async def app_js():
    p = STATIC_DIR / "app.js"
    if p.exists():
        return FileResponse(str(p), media_type="application/javascript")
    raise HTTPException(404)


if __name__ == "__main__":
    import uvicorn

    print(f"Hi3DGen standalone: http://localhost:{PORT}")
    print("Mode: Hi3DGen standalone")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
