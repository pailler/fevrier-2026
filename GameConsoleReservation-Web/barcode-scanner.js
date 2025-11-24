// Gestionnaire de scan de code-barres
class BarcodeScanner {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.scanning = false;
        this.barcodeDetector = null;
        this.init();
    }

    async init() {
        // Vérifier si BarcodeDetector est disponible
        if ('BarcodeDetector' in window) {
            try {
                // Formats de codes-barres linéaires (1D) prioritaires pour la lecture de numéros
                this.barcodeDetector = new BarcodeDetector({
                    formats: [
                        'code_128',      // Code 128 (très commun pour les numéros)
                        'ean_13',        // EAN-13 (codes-barres produits)
                        'ean_8',         // EAN-8
                        'code_39',       // Code 39
                        'code_93',       // Code 93
                        'codabar',       // Codabar
                        'itf',           // ITF (Interleaved 2 of 5)
                        'upc_a',         // UPC-A
                        'upc_e',         // UPC-E
                        'qr_code'        // QR Code (pour compatibilité)
                    ]
                });
                console.log('✅ BarcodeDetector natif disponible avec support codes-barres linéaires');
            } catch (error) {
                console.warn('⚠️ BarcodeDetector non disponible:', error);
            }
        }
        
        // Toujours charger ZXing comme fallback (meilleur support des codes-barres linéaires)
        console.log('📱 Chargement de ZXing pour le scan de codes-barres');
        await this.loadZXing();
    }

    async loadZXing() {
        return new Promise((resolve, reject) => {
            if (window.ZXing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@zxing/library@latest';
            script.onload = () => {
                console.log('✅ ZXing chargé');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Erreur chargement ZXing');
                // Continuer quand même, on utilisera juste BarcodeDetector si disponible
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    async startScan(videoElement, onScan) {
        this.video = videoElement;
        this.scanning = true;

        try {
            console.log('📷 [BarcodeScanner] Démarrage du scan...');
            
            // Contraintes simplifiées pour meilleure compatibilité
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // Caméra arrière sur mobile, mais accepte la caméra frontale si nécessaire
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                }
            };
            
            console.log('📷 [BarcodeScanner] Demande d\'accès à la caméra avec contraintes:', constraints);
            
            // Demander l'accès à la caméra
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log('📷 [BarcodeScanner] Accès caméra obtenu, stream:', this.stream);
            
            if (!this.stream || !this.stream.getVideoTracks().length) {
                throw new Error('Aucune piste vidéo disponible');
            }
            
            console.log('📷 [BarcodeScanner] Pistes vidéo disponibles:', this.stream.getVideoTracks().length);
            
            this.video.srcObject = this.stream;
            
            // Attendre que la vidéo soit prête
            return new Promise((resolve, reject) => {
                let resolved = false;
                let timeoutId;
                
                const onReady = async () => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timeoutId);
                    
                    try {
                        // Vérifier que la vidéo a des dimensions valides
                        if (!this.video.videoWidth || !this.video.videoHeight) {
                            // Attendre un peu plus si les dimensions ne sont pas encore disponibles
                            await new Promise(resolve => setTimeout(resolve, 100));
                            if (!this.video.videoWidth || !this.video.videoHeight) {
                                throw new Error('La vidéo n\'a pas de dimensions valides');
                            }
                        }
                        
                        console.log('📷 [BarcodeScanner] Métadonnées vidéo chargées, dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
                        
                        await this.video.play();
                        console.log('📷 [BarcodeScanner] Vidéo en cours de lecture');
                        
                        // Créer un canvas pour la détection
                        this.canvas = document.createElement('canvas');
                        this.context = this.canvas.getContext('2d');
                        
                        console.log('📷 [BarcodeScanner] Canvas créé, démarrage de la détection...');
                        
                        // Démarrer la détection
                        this.detectBarcode(onScan);
                        
                        resolve();
                    } catch (playError) {
                        console.error('📷 [BarcodeScanner] Erreur lors de la lecture vidéo:', playError);
                        reject(new Error('Impossible de démarrer la vidéo: ' + playError.message));
                    }
                };
                
                // Écouter plusieurs événements pour meilleure compatibilité
                this.video.addEventListener('loadedmetadata', onReady, { once: true });
                this.video.addEventListener('loadeddata', () => {
                    if (!resolved && this.video.videoWidth > 0) {
                        onReady();
                    }
                }, { once: true });
                this.video.addEventListener('canplay', () => {
                    if (!resolved && this.video.videoWidth > 0) {
                        onReady();
                    }
                }, { once: true });
                
                this.video.onerror = (error) => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timeoutId);
                    console.error('📷 [BarcodeScanner] Erreur vidéo:', error);
                    reject(new Error('Erreur lors du chargement de la vidéo'));
                };
                
                // Timeout de sécurité
                timeoutId = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        console.error('📷 [BarcodeScanner] Timeout: la vidéo n\'a pas démarré dans les 5 secondes');
                        reject(new Error('Timeout: la vidéo n\'a pas démarré dans les 5 secondes. Vérifiez que la caméra fonctionne et que les permissions sont accordées.'));
                    }
                }, 5000);
            });
        } catch (error) {
            console.error('📷 [BarcodeScanner] Erreur accès caméra:', error);
            this.scanning = false;
            
            let errorMessage = 'Impossible d\'accéder à la caméra.';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Permission d\'accès à la caméra refusée. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = 'Aucune caméra trouvée sur cet appareil.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = 'La caméra est déjà utilisée par une autre application.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    async detectBarcode(onScan) {
        if (!this.scanning || !this.video) return;

        try {
            // Priorité à ZXing pour les codes-barres linéaires (meilleure détection)
            if (window.ZXing && this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.video.videoWidth > 0) {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                
                // Dessiner l'image vidéo sur le canvas (sans inversion - effet miroir naturel)
                this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                try {
                    // Utiliser BrowserMultiFormatReader de ZXing (meilleur pour codes-barres linéaires)
                    if (window.ZXing.BrowserMultiFormatReader) {
                        const codeReader = new window.ZXing.BrowserMultiFormatReader();
                        const result = await codeReader.decodeFromCanvas(this.canvas);
                        if (result) {
                            // Extraire le texte du code-barres (le numéro sous le code-barres)
                            const barcodeText = result.getText();
                            console.log('📷 Code-barres détecté (ZXing):', barcodeText);
                            onScan(barcodeText);
                            return;
                        }
                    }
                } catch (e) {
                    // Pas de code-barres détecté, continuer
                }
            }
            
            // Fallback sur BarcodeDetector natif si ZXing n'a rien trouvé
            if (this.barcodeDetector) {
                try {
                    const barcodes = await this.barcodeDetector.detect(this.video);
                    if (barcodes.length > 0) {
                        const barcode = barcodes[0];
                        // Utiliser rawValue qui contient le numéro sous le code-barres
                        const barcodeText = barcode.rawValue || barcode.value || '';
                        console.log('📷 Code-barres détecté (BarcodeDetector):', barcodeText, {
                            format: barcode.format,
                            rawValue: barcode.rawValue,
                            value: barcode.value
                        });
                        if (barcodeText) {
                            onScan(barcodeText);
                            return;
                        }
                    }
                } catch (error) {
                    // Erreur de détection, continuer
                }
            }
        } catch (error) {
            console.error('Erreur détection:', error);
        }

        // Continuer la détection
        if (this.scanning) {
            requestAnimationFrame(() => this.detectBarcode(onScan));
        }
    }

    stopScan() {
        this.scanning = false;

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
            this.video = null;
        }

        if (this.canvas) {
            this.canvas = null;
            this.context = null;
        }
    }

    isSupported() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }
}

