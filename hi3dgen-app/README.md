# Hi3DGen — Image vers 3D

Application standalone sur **localhost:8095** pour générer des modèles 3D (GLB) à partir d'images via Hi3DGen.

## Prérequis

- **Python 3.10+**
- **NVIDIA GPU** 16 Go+ VRAM
- **CUDA 12.x**

## Installation

```bash
cd hi3dgen-app
python -m venv venv
venv\Scripts\activate    # Windows
# ou: source venv/bin/activate   # Linux

pip install -r requirements.txt
```

## Lancement

```bash
python server.py
```

Ou, sous Windows :
```bash
run.bat
```

L'app est accessible sur **http://localhost:8095**

## Utilisation

1. Ouvrez http://localhost:8095
2. Glissez une image ou cliquez pour en sélectionner une
3. Cliquez sur « Générer le modèle 3D »
4. La génération prend environ 1–3 minutes
5. Téléchargez le fichier GLB généré

## Architecture

- **Frontend** : HTML/CSS/JS (`public/`)
- **Backend** : FastAPI (Python) sur le port 8095
- **Modèle** : Hi3DGen (StableNormal + pipeline 3D), chargé localement

## Compatibilité

- **Linux** : testé avec CUDA 12
- **Windows** : peut nécessiter des ajustements (wheels CUDA, spconv, etc.)

En cas d'erreur d'installation sur Windows, envisagez **WSL2** avec une distribution Linux.
