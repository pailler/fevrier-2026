FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    git \
    wget \
    curl \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Clone InstantMesh repository
RUN git clone https://github.com/TencentARC/InstantMesh.git .

# Install Python dependencies
RUN pip3 install --no-cache-dir --upgrade pip
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
RUN pip3 install --no-cache-dir -r requirements.txt
RUN pip3 install --no-cache-dir flask flask-cors requests onnxruntime
# Update huggingface-hub to a compatible version with accelerate and transformers
RUN pip3 install --no-cache-dir "huggingface-hub>=0.19.0,<1.0"
# Update tokenizers and transformers to compatible versions
RUN pip3 install --no-cache-dir "tokenizers>=0.20.0" "transformers>=4.40.0"

# Download model checkpoints (will download from correct repository)
RUN mkdir -p checkpoints
# Checkpoints will be downloaded at runtime from HuggingFace

# Copy API script
COPY api.py /app/api.py

# Create necessary directories
RUN mkdir -p /app/inputs /app/outputs

# Expose API port
EXPOSE 7860

# Run the API
CMD ["python3", "/app/api.py"]
