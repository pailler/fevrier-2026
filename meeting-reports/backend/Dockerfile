FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for uploads and reports
RUN mkdir -p uploads reports

# Expose port
EXPOSE 8000

# Run the application
# Utiliser hypercorn au lieu de uvicorn pour supporter les gros fichiers (500MB)
# Note: La limite de taille est gérée par le middleware dans main.py
# Timeouts étendus pour les gros uploads
CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:8000", "--keep-alive", "75", "--read-timeout", "1800"]



































