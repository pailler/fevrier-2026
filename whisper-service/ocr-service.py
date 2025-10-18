from flask import Flask, request, jsonify
import cv2
import pytesseract
from PIL import Image
import numpy as np
import io
import base64

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image
        image = Image.open(file.stream)
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform OCR
        text = pytesseract.image_to_string(opencv_image)
        
        return jsonify({'text': text.strip()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
