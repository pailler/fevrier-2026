# Hi3DGen — image PyTorch officielle (système complet, évite libGL)
# Requiert: Docker + NVIDIA Container Toolkit

FROM pytorch/pytorch:2.4.0-cuda12.4-cudnn9-devel

ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_HOME=/usr/local/cuda
# Désactive torch.compile/dynamo (conflit diffusers/xformers infer_schema)
ENV TORCH_COMPILE_DISABLE=1
ENV TORCHDYNAMO_DISABLE=1

# libGL.so.1 + Mesa (trellis/pyvista si installé par trellis)
RUN apt-get update && apt-get install -y \
    libgl1 libgl1-mesa-dri libgl1-mesa-glx libglx-mesa0 libosmesa6 \
    libglib2.0-0 libsm6 libxext6 libxrender1 libegl1 libgomp1 \
    && ldconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dépendances (Mesa/libGL installée au-dessus)
COPY requirements-docker.txt requirements-docker.txt
RUN pip install --no-cache-dir -r requirements-docker.txt

# Trellis + custom_rasterizer_kernel
RUN pip install --no-cache-dir trellis-3d-python \
    && pip install --no-build-isolation --no-cache-dir \
        "$(python -c "import trellis; import os; print(os.path.dirname(trellis.__file__))")/paint3d/custom_rasterizer" \
    || true

RUN CUSTOM_DIR=$(python -c "import site; p=site.getsitepackages()[0]; print(f'{p}/trellis/paint3d/custom_rasterizer')" 2>/dev/null) \
    && if [ -f "$CUSTOM_DIR/setup.py" ]; then \
        pip install --no-build-isolation "$CUSTOM_DIR" || true; \
    fi

COPY . .
RUN mkdir -p tmp

EXPOSE 8095

CMD ["python", "server.py"]
