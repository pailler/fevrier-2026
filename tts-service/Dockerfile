FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# PyTorch CPU (compatible sans GPU ; remplacer par CUDA si besoin)
RUN pip install --no-cache-dir torch==2.2.2 torchaudio==2.2.2 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir "numpy>=1.24.0,<2.0.0"
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --force-reinstall "fastapi>=0.115.2,<0.116.0" "starlette>=0.40.0,<0.42.0" "jinja2>=3.1.0,<3.2.0"

COPY patch_gradio_early.py .
COPY static ./static
COPY app.py .

RUN mkdir -p /app/outputs

ENV GRADIO_SERVER_NAME=0.0.0.0
ENV GRADIO_SERVER_PORT=7860
ENV COQUI_TOS_AGREED=1
ENV TTS_HOME=/root/.local/share/tts

EXPOSE 7860

CMD ["python", "app.py"]
