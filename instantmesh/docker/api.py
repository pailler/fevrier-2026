#!/usr/bin/env python3
"""
InstantMesh API Server
Provides REST API for 3D mesh generation from images
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import uuid
from pathlib import Path
from datetime import datetime
import traceback
from huggingface_hub import hf_hub_download
import torch

app = Flask(__name__)
CORS(app)

INPUT_DIR = "/app/inputs"
OUTPUT_DIR = "/app/outputs"
CHECKPOINT_DIR = "/app/ckpts"
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# Create checkpoint directory
os.makedirs(CHECKPOINT_DIR, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_output_name(input_filename):
    """Generate output filename from input"""
    return Path(input_filename).stem + ".obj"

def download_checkpoints():
    """Download checkpoints from HuggingFace if not present"""
    try:
        # Check if models are already downloaded
        unet_path = os.path.join(CHECKPOINT_DIR, "diffusion_pytorch_model.bin")
        model_path = os.path.join(CHECKPOINT_DIR, "instant_mesh_large.ckpt")
        
        if os.path.exists(unet_path) and os.path.exists(model_path):
            print("✅ Models already downloaded")
            return True
        
        print("📥 Downloading InstantMesh models from HuggingFace...")
        
        # Download UNet
        if not os.path.exists(unet_path):
            print("📥 Downloading diffusion_pytorch_model.bin...")
            hf_hub_download(
                repo_id="TencentARC/InstantMesh",
                filename="diffusion_pytorch_model.bin",
                repo_type="model",
                cache_dir=CHECKPOINT_DIR
            )
            print("✅ UNet downloaded")
        
        # Download reconstruction model
        if not os.path.exists(model_path):
            print("📥 Downloading instant_mesh_large.ckpt...")
            hf_hub_download(
                repo_id="TencentARC/InstantMesh",
                filename="instant_mesh_large.ckpt",
                repo_type="model",
                cache_dir=CHECKPOINT_DIR
            )
            print("✅ Reconstruction model downloaded")
        
        return True
    except Exception as e:
        print(f"⚠️ Error downloading models: {e}")
        return False

@app.route("/", methods=["GET"])
def index():
    """API home page"""
    return jsonify({
        "name": "InstantMesh API",
        "version": "v1.0",
        "description": "3D mesh generation from images",
        "endpoints": {
            "health": "GET /health - Check API status",
            "generate": "POST /generate - Convert image to 3D mesh",
            "list_outputs": "GET /list-outputs - List all generated files",
            "download": "GET /download/:filename - Download generated file",
            "download_models": "POST /download-models - Download checkpoints from HuggingFace"
        },
        "usage": "Upload an image via POST to /generate to create a 3D mesh",
        "checkpoints_dir": CHECKPOINT_DIR,
        "note": "Models will be downloaded automatically from HuggingFace on first use"
    })

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ready",
        "model": "InstantMesh",
        "version": "v1.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/generate", methods=["POST"])
def generate_3d():
    """Convert image to 3D mesh"""
    try:
        # Check if file is provided
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}"}), 400
        
        # Save input image
        unique_id = str(uuid.uuid4())[:8]
        input_filename = f"{unique_id}_{file.filename}"
        input_path = os.path.join(INPUT_DIR, input_filename)
        file.save(input_path)
        
        # Generate output filename
        output_name = generate_output_name(input_filename)
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        print(f"🔨 Processing: {input_filename} -> {output_name}")
        
        # Download models if needed
        if not download_checkpoints():
            return jsonify({"error": "Failed to download required models"}), 500
        
        # Call InstantMesh via run.py
        print("🚀 Starting InstantMesh processing...")
        config_path = "/app/configs/instant-mesh-large.yaml"
        
        cmd = [
            "python3", "run.py",
            config_path,
            input_path,
            "--output_path", OUTPUT_DIR,
            "--diffusion_steps", "75",
            "--seed", "42",
            "--scale", "1.0",
            "--view", "6",
            "--no_rembg"
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes timeout
        )
        
        if result.returncode != 0:
            print(f"❌ Error from run.py: {result.stderr}")
            return jsonify({"error": f"InstantMesh processing failed: {result.stderr}"}), 500
        
        print(f"✅ Success: {result.stdout}")
        
        # Find the generated mesh file (InstantMesh saves to outputs/instant-mesh-large/meshes/)
        mesh_dir = os.path.join(OUTPUT_DIR, "instant-mesh-large", "meshes")
        if os.path.exists(mesh_dir):
            mesh_files = [f for f in os.listdir(mesh_dir) if f.endswith('.obj')]
            if mesh_files:
                output_name = mesh_files[0]
                output_path = os.path.join(mesh_dir, output_name)
                
                if os.path.exists(output_path):
                    return jsonify({
                        "success": True,
                        "message": "3D model generated successfully",
                        "input_file": input_filename,
                        "output_file": output_name,
                        "download_url": f"/download/{output_name}"
                    })
        
        return jsonify({"error": "Failed to generate 3D model, output file not found."}), 500
    
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Generation timeout (>10 minutes)"}), 500
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    """Download generated 3D model"""
    try:
        # Try multiple possible locations
        possible_paths = [
            os.path.join(OUTPUT_DIR, filename),  # Direct
            os.path.join(OUTPUT_DIR, "instant-mesh-large", "meshes", filename),  # InstantMesh structure
            os.path.join(OUTPUT_DIR, "instant-mesh-large", "images", filename),  # Images
        ]
        
        file_path = None
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/list-outputs", methods=["GET"])
def list_outputs():
    """List all generated outputs"""
    try:
        file_info = []
        
        # Check InstantMesh structure first
        mesh_dir = os.path.join(OUTPUT_DIR, "instant-mesh-large", "meshes")
        if os.path.exists(mesh_dir):
            files = os.listdir(mesh_dir)
            obj_files = [f for f in files if f.endswith('.obj')]
            for f in obj_files:
                file_path = os.path.join(mesh_dir, f)
                file_info.append({
                    "filename": f,
                    "size": os.path.getsize(file_path),
                    "created": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
                })
        
        # Also check direct output directory
        if os.path.exists(OUTPUT_DIR):
            files = os.listdir(OUTPUT_DIR)
            obj_files = [f for f in files if f.endswith('.obj') and os.path.isfile(os.path.join(OUTPUT_DIR, f))]
            for f in obj_files:
                file_path = os.path.join(OUTPUT_DIR, f)
                if f not in [fi["filename"] for fi in file_info]:  # Avoid duplicates
                    file_info.append({
                        "filename": f,
                        "size": os.path.getsize(file_path),
                        "created": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
                    })
        
        return jsonify({"files": file_info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-models", methods=["POST"])
def download_models():
    """Manually trigger model download from HuggingFace"""
    try:
        success = download_checkpoints()
        if success:
            return jsonify({
                "success": True,
                "message": "Models downloaded successfully",
                "location": CHECKPOINT_DIR
            })
        else:
            return jsonify({"error": "Failed to download models"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting InstantMesh API Server...")
    print("📍 Input dir:", INPUT_DIR)
    print("📍 Output dir:", OUTPUT_DIR)
    print("📍 Checkpoints dir:", CHECKPOINT_DIR)
    print("🌐 API available at http://0.0.0.0:7860")
    
    app.run(host="0.0.0.0", port=7860, debug=True)
