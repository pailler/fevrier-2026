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

app = Flask(__name__)
CORS(app)

INPUT_DIR = "/app/inputs"
OUTPUT_DIR = "/app/outputs"
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_output_name(input_filename):
    """Generate output filename from input"""
    return Path(input_filename).stem + ".obj"

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
            "download": "GET /download/:filename - Download generated file"
        },
        "usage": "Upload an image via POST to /generate to create a 3D mesh"
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
        
        # Call InstantMesh via Python API
        # Import model and process
        import sys
        sys.path.insert(0, '/app')
        
        try:
            from instant_mesh import InstantMesh
            
            print("🔧 Loading InstantMesh model...")
            model = InstantMesh()
            
            print(f"🎨 Processing image: {input_path}")
            result = model.process_image(input_path, output_path)
            
            print(f"✅ Success: {result}")
            
        except Exception as api_error:
            # Fallback to gradio_demo.py if direct API fails
            print(f"⚠️ Direct API failed: {api_error}, trying gradio_demo.py")
            
            cmd = ["python3", "gradio_demo.py", "--image", input_path, "--output", output_path]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
        
        if result.returncode == 0:
            if os.path.exists(output_path):
                return jsonify({
                    "success": True,
                    "message": "3D mesh generated successfully",
                    "input_file": input_filename,
                    "output_file": output_name,
                    "download_url": f"/download/{output_name}"
                })
            else:
                return jsonify({
                    "error": "Generation completed but output file not found",
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }), 500
        else:
            return jsonify({
                "error": "Generation failed",
                "details": result.stderr,
                "stdout": result.stdout
            }), 500
    
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Generation timeout (>5 minutes)"}), 500
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    """Download generated 3D model"""
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/list-outputs", methods=["GET"])
def list_outputs():
    """List all generated outputs"""
    try:
        files = os.listdir(OUTPUT_DIR)
        obj_files = [f for f in files if f.endswith('.obj')]
        
        file_info = []
        for f in obj_files:
            file_path = os.path.join(OUTPUT_DIR, f)
            file_info.append({
                "filename": f,
                "size": os.path.getsize(file_path),
                "created": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
            })
        
        return jsonify({"files": file_info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting InstantMesh API Server...")
    print("📍 Input dir:", INPUT_DIR)
    print("📍 Output dir:", OUTPUT_DIR)
    print("🌐 API available at http://0.0.0.0:7860")
    
    app.run(host="0.0.0.0", port=7860, debug=True)
