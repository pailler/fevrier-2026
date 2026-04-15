"""
Telecharge les poids aux chemins exacts attendus par app.py.
Utile quand `hf download` / miroir HF ne materialise que des fichiers sous .cache.
Lancer depuis ce dossier avec le venv MuseTalk :
  .\\.venv\\Scripts\\python.exe download_weights.py
"""
from __future__ import annotations

import os
import sys


def main() -> int:
    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root)
    models = os.path.join(root, "models")
    os.makedirs(models, exist_ok=True)

    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("Installez huggingface_hub : pip install -U huggingface_hub", file=sys.stderr)
        return 1

    snapshot_download("TMElyralab/MuseTalk", local_dir=models)

    def snap(repo_id: str, subdir: str, patterns: list[str]) -> None:
        dest = os.path.join(models, subdir)
        os.makedirs(dest, exist_ok=True)
        snapshot_download(repo_id, local_dir=dest, allow_patterns=patterns)

    snap("stabilityai/sd-vae-ft-mse", "sd-vae", ["config.json", "diffusion_pytorch_model.bin"])
    snap("openai/whisper-tiny", "whisper", ["config.json", "pytorch_model.bin", "preprocessor_config.json"])
    snap("yzd-v/DWPose", "dwpose", ["dw-ll_ucoco_384.pth"])
    snap("ByteDance/LatentSync", "syncnet", ["latentsync_syncnet.pt"])
    snap(
        "ManyOtherFunctions/face-parse-bisent",
        "face-parse-bisent",
        ["79999_iter.pth", "resnet18-5c106cde.pth"],
    )

    print("OK - verifiez : models/sd-vae/config.json, models/whisper/config.json, models/face-parse-bisent/79999_iter.pth")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
