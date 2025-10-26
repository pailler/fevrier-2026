FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY qr_service_clean.py .
COPY template.html .
COPY requirements.txt .

# Installer uniquement les dépendances essentielles
RUN pip install --no-cache-dir \
    flask==2.3.3 \
    flask-cors==4.0.0 \
    qrcode[pil]==7.4.2 \
    pillow==10.0.1 \
    supabase==2.3.4 \
    python-dotenv==1.0.0 \
    pyjwt==2.8.0

# Créer le dossier de logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 7006

# Commande de démarrage
CMD ["python", "qr_service_clean.py"]