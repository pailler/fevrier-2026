// Version avec backend API
// Remplacez app.js par app-backend.js dans index.html pour utiliser le backend

// Configuration de l'API - Détection automatique de l'URL
// Utilise l'URL actuelle si on est sur le domaine public, sinon localhost pour le développement
function getApiBaseUrl() {
    // Si on est sur le domaine public (consoles.regispailler.fr), utiliser l'URL complète avec le même domaine
    if (window.location.hostname.includes('regispailler.fr') || window.location.hostname.includes('iahome.fr')) {
        // Utiliser l'URL complète avec le même protocole et domaine
        const protocol = window.location.protocol; // 'https:' ou 'http:'
        const hostname = window.location.hostname; // 'consoles.regispailler.fr'
        return `${protocol}//${hostname}/api`;
    }
    // Sinon, utiliser localhost pour le développement local (backend sur port 5001)
    return 'http://localhost:5001/api';
}

const API_BASE_URL = getApiBaseUrl();
console.log('🔧 API_BASE_URL configuré:', API_BASE_URL);

// Modèle de données
class GameConsole {
    constructor(id, name, type, isAvailable = true, currentReservation = null, allowedDurations = [10, 30, 60]) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.isAvailable = isAvailable;
        this.currentReservation = currentReservation;
        this.allowedDurations = allowedDurations; // Durées autorisées en minutes
    }
}

class Reservation {
    constructor(id, consoleId, userName, startDate, endDate) {
        this.id = id;
        this.consoleId = consoleId;
        this.userName = userName;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.isValidated = false;
    }
}

// Gestionnaire de réservations avec API
class ReservationManager {
    constructor() {
        this.consoles = [];
        this.reservations = [];
    }

    async loadConsoles() {
        try {
            const url = `${API_BASE_URL}/consoles`;
            console.log('📡 Appel API:', url);
            console.log('📡 Hostname actuel:', window.location.hostname);
            console.log('📡 Protocol actuel:', window.location.protocol);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-store'
            });
            
            console.log('📡 Réponse reçue:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur API:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📦 Données reçues:', data);
            
                if (data.success) {
                this.consoles = data.consoles.map(c => {
                    const gameConsole = new GameConsole(
                        c.id, 
                        c.name, 
                        c.type, 
                        c.isAvailable, 
                        c.currentReservation,
                        c.allowedDurations || [10, 30, 60] // Durées par défaut si non définies
                    );
                    if (c.currentReservation) {
                        // Créer la réservation avec toutes les propriétés
                        const res = c.currentReservation;
                        gameConsole.currentReservation = {
                            id: res.id,
                            consoleId: res.consoleId,
                            userName: res.userName,
                            startDate: new Date(res.startDate),
                            endDate: new Date(res.endDate),
                            isValidated: res.isValidated || false
                        };
                    }
                    // Log pour déboguer les consoles désactivées
                    if (!gameConsole.isAvailable && !gameConsole.currentReservation) {
                        console.log(`🔴 [loadConsoles] Console désactivée détectée: ${gameConsole.name} (id: ${gameConsole.id})`);
                    }
                    return gameConsole;
                });
                console.log('✅ Consoles mappées:', this.consoles.length);
                // Log détaillé de toutes les consoles
                this.consoles.forEach(c => {
                    console.log(`  - ${c.name}: isAvailable=${c.isAvailable}, hasReservation=${!!c.currentReservation}`);
                });
                // Log des réservations pour débogage
                const consolesWithReservations = this.consoles.filter(c => c.currentReservation);
                if (consolesWithReservations.length > 0) {
                    console.log('📋 Consoles avec réservations:', consolesWithReservations.length, consolesWithReservations.map(c => ({
                        name: c.name,
                        reservation: {
                            userName: c.currentReservation.userName,
                            startDate: c.currentReservation.startDate,
                            endDate: c.currentReservation.endDate,
                            isValidated: c.currentReservation.isValidated
                        }
                    })));
                } else {
                    console.log('📋 Aucune console avec réservation actuellement');
                }
                return this.consoles;
            } else {
                throw new Error(data.message || 'Erreur lors du chargement des consoles');
            }
        } catch (error) {
            console.error('❌ Erreur API loadConsoles:', error);
            throw error;
        }
    }

    async loadReservations() {
        try {
            const url = `${API_BASE_URL}/reservations`;
            console.log('📡 [loadReservations] URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache'
            });
            const data = await response.json();
            
            if (data.success) {
                this.reservations = data.reservations.map(r => {
                    const res = new Reservation(r.id, r.consoleId, r.userName, r.startDate, r.endDate);
                    // Ajouter isValidated si présent
                    if (r.isValidated !== undefined) {
                        res.isValidated = r.isValidated;
                    }
                    return res;
                });
                return this.reservations;
            } else {
                throw new Error('Erreur lors du chargement des réservations');
            }
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    async updateConsoleAvailability(consoleId, isAvailable) {
        try {
            const url = `${API_BASE_URL}/consoles/${consoleId}/availability`;
            console.log('📡 [updateConsoleAvailability] URL:', url);
            console.log('📡 [updateConsoleAvailability] Données:', { consoleId, isAvailable });
            console.log('📡 [updateConsoleAvailability] API_BASE_URL:', API_BASE_URL);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache',
                body: JSON.stringify({ isAvailable })
            });
            
            console.log('📡 [updateConsoleAvailability] Réponse:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [updateConsoleAvailability] Erreur:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📡 [updateConsoleAvailability] Données reçues:', data);
            console.log('📡 [updateConsoleAvailability] Console mise à jour:', data.console);
            
            // Vérifier que la console a bien été mise à jour
            if (data.success && data.console) {
                console.log(`✅ [updateConsoleAvailability] Console ${data.console.id} - isAvailable: ${data.console.isAvailable}`);
            }
            
            return data.success || false;
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de la disponibilité:', error);
            console.error('❌ Stack:', error.stack);
            throw error;
        }
    }

    async updateConsoleDurations(consoleId, allowedDurations) {
        try {
            const url = `${API_BASE_URL}/consoles/${consoleId}/durations`;
            console.log('📡 [updateConsoleDurations] URL:', url);
            console.log('📡 [updateConsoleDurations] Données:', { consoleId, allowedDurations });
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache',
                body: JSON.stringify({ allowedDurations })
            });
            
            console.log('📡 [updateConsoleDurations] Réponse:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [updateConsoleDurations] Erreur:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📡 [updateConsoleDurations] Données reçues:', data);
            
            // Mettre à jour la console dans la liste locale
            const gameConsole = this.consoles.find(c => c.id === consoleId);
            if (gameConsole && data.success && data.console) {
                gameConsole.allowedDurations = data.console.allowedDurations;
                console.log(`✅ [updateConsoleDurations] Console ${consoleId} - Durées mises à jour:`, gameConsole.allowedDurations);
            }
            
            return data.success || false;
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour des durées:', error);
            console.error('❌ Stack:', error.stack);
            throw error;
        }
    }

    getAllConsoles() {
        return this.consoles;
    }

    getConsole(byId) {
        return this.consoles.find(c => c.id === byId);
    }

    async loadAllowedScanNumbers() {
        try {
            const url = `${API_BASE_URL}/allowed-scan-numbers`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                return data.allowedScanNumbers || [];
            }
            return [];
        } catch (error) {
            console.error('❌ Erreur lors du chargement des numéros autorisés:', error);
            // Retourner la liste par défaut en cas d'erreur
            return ['8012908', '8012909', '8012910', '8012911'];
        }
    }

    async addAllowedScanNumber(scanNumber) {
        try {
            const url = `${API_BASE_URL}/allowed-scan-numbers`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache',
                body: JSON.stringify({ scanNumber })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout du numéro:', error);
            throw error;
        }
    }

    async removeAllowedScanNumber(scanNumber) {
        try {
            const url = `${API_BASE_URL}/allowed-scan-numbers/${scanNumber}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du numéro:', error);
            throw error;
        }
    }

    async createReservation(reservation, pin, scanNumber) {
        try {
            const url = `${API_BASE_URL}/reservations`;
            console.log('📡 [createReservation] URL:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache',
                body: JSON.stringify({
                    consoleId: reservation.consoleId,
                    userName: reservation.userName,
                    startDate: reservation.startDate.toISOString(),
                    endDate: reservation.endDate.toISOString(),
                    pin: pin,
                    scanNumber: scanNumber
                })
            });

            // Vérifier si la réponse est OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[createReservation] Erreur HTTP:', response.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
                }
                throw new Error(errorData.message || `Erreur serveur (${response.status})`);
            }
            
            const data = await response.json();
            console.log('[createReservation] Réponse du serveur:', data);
            
            if (data.success) {
                // Recharger les consoles pour avoir l'état à jour
                await this.loadConsoles();
                return true;
            } else {
                throw new Error(data.message || 'Erreur lors de la création de la réservation');
            }
        } catch (error) {
            console.error('[createReservation] Erreur API:', error);
            throw error;
        }
    }

    async cancelReservation(reservationId, pin) {
        try {
            // S'assurer que le PIN est une string et normalisé
            const pinString = String(pin).trim();
            console.log('[cancelReservation] PIN envoyé:', {
                original: pin,
                asString: pinString,
                length: pinString.length,
                type: typeof pinString,
                isAdmin: pinString === '6626',
                charCodes: pinString.split('').map(c => c.charCodeAt(0))
            });
            
            const url = `${API_BASE_URL}/reservations/${reservationId}`;
            console.log('📡 [cancelReservation] URL:', url);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache',
                body: JSON.stringify({
                    pin: pinString
                })
            });

            const data = await response.json();
            console.log('[cancelReservation] Réponse du serveur:', data);
            
            if (data.success) {
                // Recharger les consoles pour avoir l'état à jour
                await this.loadConsoles();
                return true;
            } else {
                throw new Error(data.message || 'Erreur lors de l\'annulation');
            }
        } catch (error) {
            console.error('Erreur API cancelReservation:', error);
            throw error;
        }
    }

    async validateReservation(reservationId) {
        try {
            const url = `${API_BASE_URL}/reservations/${reservationId}/validate`;
            console.log('📡 [validateReservation] URL:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache'
            });

            const data = await response.json();
            
            if (data.success) {
                // Recharger les consoles pour avoir l'état à jour
                await this.loadConsoles();
                return true;
            } else {
                throw new Error(data.message || 'Erreur lors de la validation');
            }
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Application principale
class App {
    constructor() {
        this.reservationManager = new ReservationManager();
        this.allowedScanNumbers = []; // Cache des numéros autorisés
        this.currentConsole = null;
        this.barcodeScanner = new BarcodeScanner();
        this.scanMode = null; // 'reservation' ou 'validation'
        this.showOnlyActiveGames = false; // Filtre pour afficher uniquement les jeux en cours
        this.modifyingReservation = null; // Réservation en cours de modification
        this.modifyingPin = null; // PIN de la réservation en modification
        this.nextAvailableTimeForReservation = null; // Heure disponible pour la prochaine réservation
        this.isAdminMode = false; // Mode administrateur activé
        this.sortColumn = null; // Colonne de tri par défaut (null = date de création)
        this.sortDirection = 'desc'; // Direction de tri par défaut (décroissant)
        this.adminPIN = '6626'; // Code PIN administrateur
        this.inactivityTimer = null; // Timer pour la détection d'inactivité
        this.inactivityTimeout = 2 * 60 * 1000; // 2 minutes en millisecondes
        this.init();
    }

    async init() {
        console.log('🚀 [init] DÉBUT - Initialisation de l\'application...');
        try {
            console.log('🚀 [init] Initialisation de l\'application...');
            console.log('📋 DOM prêt:', document.readyState);
            console.log('📋 Body:', document.body ? 'OUI' : 'NON');
            
            // Afficher un message visible dans la page pour débogage
            const container = document.getElementById('consolesList');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; background: #e3f2fd; border-radius: 10px; margin: 20px; color: #1976d2; font-weight: bold;">🔄 Chargement en cours...</div>';
            }
            
            // Attendre que le DOM soit complètement chargé
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        document.addEventListener('DOMContentLoaded', resolve);
                    }
                });
            }
            
            // Attendre un peu pour être sûr que tout est prêt
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('📋 ConsolesList existe:', document.getElementById('consolesList') ? 'OUI' : 'NON');
            
            // Vérifier que le backend est accessible
            await this.checkBackend();
            console.log('✅ Backend vérifié');
            
            // Charger les numéros autorisés
            this.allowedScanNumbers = await this.reservationManager.loadAllowedScanNumbers();
            console.log('✅ Numéros autorisés chargés:', this.allowedScanNumbers);
            
            console.log('🎨 [init] Appel de renderConsoles()...');
            await this.renderConsoles();
            console.log('✅ [init] Consoles rendues');
            this.setupEventListeners();
            console.log('✅ [init] Event listeners configurés');
            
            // Rafraîchir automatiquement toutes les 30 secondes pour détecter les annulations
            setInterval(async () => {
                try {
                    await this.renderConsoles();
                    await this.renderReservationsTable();
                } catch (error) {
                    console.error('Erreur rafraîchissement automatique:', error);
                }
            }, 30000); // 30 secondes
            
            // Détection d'inactivité - recharger la page après 2 minutes d'inactivité
            this.setupInactivityDetection();
            
            // Mettre à jour le tableau des réservations toutes les 5 secondes
            setInterval(() => {
                this.renderReservationsTable();
            }, 5000);
            
            // Mettre à jour les compteurs toutes les secondes
            this.timerInterval = setInterval(() => {
                this.updateTimers();
            }, 1000); // 1 seconde
            
            // Détection d'inactivité - recharger la page après 2 minutes d'inactivité
            this.setupInactivityDetection();
        } catch (error) {
            this.showToast('Erreur de connexion au backend. Vérifiez que le serveur est démarré sur le port 5000.', 'error');
            console.error('Erreur initialisation:', error);
        }
    }

    setupInactivityDetection() {
        // Réinitialiser le timer d'inactivité
        const resetInactivityTimer = () => {
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }
            
            this.inactivityTimer = setTimeout(() => {
                console.log('⏰ Aucune activité détectée pendant 2 minutes. Rechargement de la page...');
                window.location.reload();
            }, this.inactivityTimeout);
        };
        
        // Détecter les différents types d'activité utilisateur
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'touchmove',
            'click',
            'keydown'
        ];
        
        // Ajouter les listeners pour tous les événements d'activité
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, resetInactivityTimer, { passive: true });
        });
        
        // Initialiser le timer au démarrage
        resetInactivityTimer();
        
        console.log('✅ Détection d\'inactivité activée (rechargement après 2 minutes)');
    }

    async checkBackend() {
        try {
            // API_BASE_URL contient déjà /api, donc on utilise directement /health
            // car le backend attend /api/health
            const url = API_BASE_URL.endsWith('/api') 
                ? `${API_BASE_URL}/health` 
                : `${API_BASE_URL}/api/health`;
            console.log('📡 [checkBackend] URL:', url);
            console.log('📡 [checkBackend] API_BASE_URL:', API_BASE_URL);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                console.error(`❌ [checkBackend] HTTP ${response.status}: ${response.statusText}`);
                throw new Error(`Backend non accessible (HTTP ${response.status})`);
            }
            
            const data = await response.json();
            if (data.success) {
                console.log('✅ [checkBackend] Backend connecté');
                return true;
            } else {
                throw new Error('Backend non accessible');
            }
        } catch (error) {
            console.error('❌ [checkBackend] Erreur:', error);
            throw new Error('Backend non accessible');
        }
    }

    setupEventListeners() {
        // Event listeners pour le tri des colonnes
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const sortColumn = header.getAttribute('data-sort');
                if (this.sortColumn === sortColumn) {
                    // Inverser la direction si on clique sur la même colonne
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    // Nouvelle colonne, commencer par asc
                    this.sortColumn = sortColumn;
                    this.sortDirection = 'asc';
                }
                this.updateSortIndicators();
                this.renderReservationsTable();
            });
        });
        
        // Bouton refresh
        document.getElementById('refreshBtn').addEventListener('click', async () => {
            try {
                await this.renderConsoles();
                this.showToast('Liste actualisée', 'success');
            } catch (error) {
                this.showToast('Erreur lors de l\'actualisation', 'error');
            }
        });

        // Bouton "Jeu en cours" - Filtrer les consoles avec des jeux actifs
        document.getElementById('activeGamesBtn').addEventListener('click', () => {
            this.showOnlyActiveGames = !this.showOnlyActiveGames;
            const btn = document.getElementById('activeGamesBtn');
            if (this.showOnlyActiveGames) {
                btn.classList.add('active');
                btn.classList.remove('has-active-games'); // Retirer l'animation en mode filtre
                btn.textContent = '🎮 Toutes les consoles';
            } else {
                btn.classList.remove('active');
                // Remettre l'animation si nécessaire (sera géré par updateActiveGamesButton)
                // Le texte sera mis à jour par updateActiveGamesButton selon le nombre de jeux actifs
            }
            this.renderConsoles();
        });

        // Fermer les modals
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal('reservationModal');
        });

        document.getElementById('closeDetailsModal').addEventListener('click', () => {
            this.closeModal('detailsModal');
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal('reservationModal');
        });

        // Formulaire de réservation
        document.getElementById('reservationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleReservation();
        });

        // Fermer modal en cliquant à l'extérieur
        document.getElementById('reservationModal').addEventListener('click', (e) => {
            if (e.target.id === 'reservationModal') {
                this.closeModal('reservationModal');
            }
        });

        document.getElementById('detailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailsModal') {
                this.closeModal('detailsModal');
            }
        });

        // Bouton scan code-barres dans le formulaire
        // Bouton de scan dans le formulaire de réservation
        const scanBarcodeInFormBtn = document.getElementById('scanBarcodeInFormBtn');
        if (scanBarcodeInFormBtn) {
            scanBarcodeInFormBtn.addEventListener('click', () => {
                this.scanMode = 'reservation';
                this.startBarcodeScan();
            });
        }

        // Fermer modal scan
        document.getElementById('closeBarcodeModal').addEventListener('click', () => {
            this.stopBarcodeScan();
        });

        document.getElementById('barcodeModal').addEventListener('click', (e) => {
            if (e.target.id === 'barcodeModal') {
                this.stopBarcodeScan();
            }
        });

        // Bouton Règles
        document.getElementById('rulesBtn').addEventListener('click', () => {
            this.showRulesModal();
        });

        document.getElementById('closeRulesModal').addEventListener('click', () => {
            this.closeModal('rulesModal');
        });

        // Bouton Admin
        document.getElementById('adminBtn').addEventListener('click', () => {
            this.showAdminModal();
        });

        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.closeModal('adminModal');
            this.isAdminMode = false;
        });

        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminModal') {
                this.closeModal('adminModal');
                this.isAdminMode = false;
            }
        });

        // Modal Règles - fermer en cliquant à l'extérieur
        document.getElementById('rulesModal').addEventListener('click', (e) => {
            if (e.target.id === 'rulesModal') {
                this.closeModal('rulesModal');
            }
        });
    }

    async renderConsoles() {
        console.log('🔄 [renderConsoles] DÉBUT - Fonction appelée');
        try {
            console.log('🔄 [renderConsoles] DÉBUT - Chargement des consoles...');
            let consoles = await this.reservationManager.loadConsoles();
            
            // Charger les réservations avec gestion d'erreur pour ne pas bloquer l'affichage
            let allReservations = [];
            try {
                allReservations = await this.reservationManager.loadReservations();
                console.log('✅ [renderConsoles] Réservations chargées:', allReservations.length);
            } catch (reservationError) {
                console.warn('⚠️ [renderConsoles] Erreur lors du chargement des réservations (non bloquant):', reservationError);
                // Continuer sans les réservations pour ne pas bloquer l'affichage des modules
            }
            
            console.log('✅ [renderConsoles] Consoles chargées:', consoles.length, consoles);
            
            // Vérifier s'il y a des jeux en cours pour mettre à jour le bouton
            const activeGamesCount = consoles.filter(gameConsole => {
                return gameConsole.currentReservation && 
                       gameConsole.currentReservation.isValidated;
            }).length;
            
            // Mettre à jour le bouton "Jeu en cours" avec l'indicateur visuel
            this.updateActiveGamesButton(activeGamesCount);
            
            // Filtrer les consoles si le mode "Jeu en cours" est activé
            if (this.showOnlyActiveGames) {
                consoles = consoles.filter(gameConsole => {
                    return gameConsole.currentReservation && 
                           gameConsole.currentReservation.isValidated;
                });
                console.log('🎮 [renderConsoles] Filtre "Jeu en cours" activé:', consoles.length, 'consoles avec jeu actif');
            }
            
            const container = document.getElementById('consolesList');
            console.log('🔍 [renderConsoles] Conteneur recherché:', container ? 'TROUVÉ' : 'NON TROUVÉ');
            
            if (!container) {
                console.error('❌ [renderConsoles] Conteneur consolesList non trouvé');
                console.error('📋 [renderConsoles] Éléments disponibles:', document.querySelectorAll('main, #consolesList, .consoles-list'));
                // Afficher une erreur visible
                const body = document.body;
                if (body) {
                    body.innerHTML += '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #f44336; color: white; padding: 20px; border-radius: 10px; z-index: 10000; max-width: 90%;">❌ ERREUR: Conteneur consolesList non trouvé dans le DOM</div>';
                }
                return;
            }
            
            console.log('📦 Conteneur trouvé:', {
                id: container.id,
                tagName: container.tagName,
                className: container.className,
                parentElement: container.parentElement ? container.parentElement.tagName : 'N/A',
                isVisible: container.offsetWidth > 0 && container.offsetHeight > 0,
                display: window.getComputedStyle(container).display,
                visibility: window.getComputedStyle(container).visibility
            });
            
            container.innerHTML = '';

            if (consoles.length === 0) {
                console.warn('⚠️ Aucune console disponible');
                container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Aucune console disponible</p>';
                await this.renderReservationsTable();
                return;
            }
            
            console.log('📋 Affichage de', consoles.length, 'consoles');
            console.log('📦 Conteneur trouvé:', container ? 'OUI' : 'NON');
            console.log('📦 Conteneur parent:', container ? container.parentElement : 'N/A');

            let cardsCreated = 0;
            console.log('🔄 [renderConsoles] Début de la boucle forEach pour', consoles.length, 'consoles');
            consoles.forEach((gameConsole, index) => {
                console.log(`🔄 [renderConsoles] Traitement console ${index + 1}/${consoles.length}:`, gameConsole.name, {
                    isAvailable: gameConsole.isAvailable,
                    hasReservation: !!gameConsole.currentReservation,
                    currentReservation: gameConsole.currentReservation ? {
                        id: gameConsole.currentReservation.id,
                        userName: gameConsole.currentReservation.userName,
                        startDate: gameConsole.currentReservation.startDate,
                        endDate: gameConsole.currentReservation.endDate,
                        isValidated: gameConsole.currentReservation.isValidated
                    } : null
                });
                
                // Log détaillé pour débogage
                if (!gameConsole.isAvailable) {
                    console.log(`🔴 [renderConsoles] Console ${gameConsole.name} n'est PAS disponible`);
                    if (gameConsole.currentReservation) {
                        console.log(`✅ [renderConsoles] Console ${gameConsole.name} a une réservation:`, gameConsole.currentReservation);
                    } else {
                        console.warn(`⚠️ [renderConsoles] Console ${gameConsole.name} n'est pas disponible mais n'a PAS de currentReservation!`);
                    }
                }
                const card = document.createElement('div');
                
                // Déterminer la couleur selon le statut de la réservation
                // - Bleu par défaut (disponible)
                // - Orange quand le statut est "à valider" (non validée)
                // - Vert quand le statut est "en cours" (validée et en cours)
                // - Rouge quand le temps est dépassé
                let cardClass = 'default'; // Bleu par défaut
                let statusColor = '';
                let diffMinutes = 0;
                let overdueText = '';
                
                // Log pour déboguer
                console.log(`🔍 [renderConsoles] Console ${gameConsole.name}: isAvailable=${gameConsole.isAvailable}, hasReservation=${!!gameConsole.currentReservation}`);
                
                if (!gameConsole.isAvailable) {
                    if (gameConsole.currentReservation) {
                        // Console réservée - déterminer le statut
                        const now = new Date();
                        const endDate = new Date(gameConsole.currentReservation.endDate);
                        const isValidated = gameConsole.currentReservation.isValidated || false;
                        diffMinutes = (now - endDate) / (1000 * 60);
                        
                        console.log(`🔍 [renderConsoles] Console ${gameConsole.name} - diffMinutes: ${diffMinutes}, isValidated: ${isValidated}, endDate: ${endDate.toISOString()}, now: ${now.toISOString()}`);
                        
                        // PRIORITÉ 1: Vérifier si le temps est dépassé (même si validée)
                        // Le dépassement doit être vérifié EN PREMIER, peu importe le statut de validation
                        if (diffMinutes > 0) {
                            // Si dépassement entre 0 et 5 minutes = rouge avec compteur
                            // IMPORTANT: diffMinutes doit être strictement <= 5 pour rester rouge
                            if (diffMinutes <= 5) {
                                cardClass = 'overdue';
                                statusColor = '🔴';
                                const overdueSeconds = Math.floor((now - endDate) / 1000);
                                const overdueMins = Math.floor(overdueSeconds / 60);
                                const overdueSecs = overdueSeconds % 60;
                                overdueText = `<br><span style="color: #d32f2f; font-weight: bold;">⏰ Dépassement: ${overdueMins}m ${overdueSecs}s</span>`;
                                console.log(`🔴 [renderConsoles] Console ${gameConsole.name} - Dépassement: ${overdueMins}m ${overdueSecs}s (${Math.round(diffMinutes * 10) / 10} min) - ROUGE (cardClass=overdue)`);
                            } else {
                                // Dépassement de plus de 5 minutes = retour au bleu (normal)
                                cardClass = 'default';
                                overdueText = ''; // Ne pas afficher le message de dépassement
                                console.log(`🔵 [renderConsoles] Console ${gameConsole.name} - Dépassement > 5 min (${Math.round(diffMinutes * 10) / 10} min), retour au mode normal (bleu - cardClass=default)`);
                            }
                        } 
                        // PRIORITÉ 2: Si pas de dépassement (diffMinutes <= 0), vérifier le statut de validation
                        else {
                            if (isValidated) {
                                // Réservation validée et en cours = vert
                                cardClass = 'in-progress';
                                console.log(`🟢 [renderConsoles] Console ${gameConsole.name} - Jeu en cours (validée - cardClass=in-progress)`);
                            } else {
                                // Réservation non validée = orange
                                cardClass = 'to-validate';
                                console.log(`🟠 [renderConsoles] Console ${gameConsole.name} - À valider (non validée - cardClass=to-validate)`);
                            }
                        }
                    } else {
                        // Console désactivée (pas de réservation)
                        cardClass = 'unavailable';
                        console.log(`🚫 [renderConsoles] Console ${gameConsole.name} est désactivée (unavailable) - cardClass=${cardClass}`);
                    }
                } else {
                    // Console disponible = bleu par défaut
                    cardClass = 'default';
                    console.log(`🔵 [renderConsoles] Console ${gameConsole.name} est disponible (bleu par défaut)`);
                }
                
                // Appliquer la classe - s'assurer qu'elle est correcte
                // IMPORTANT: Ne pas écraser la classe 'overdue' si on est toujours dans la fenêtre 0-5 minutes
                // Vérifier si la carte a déjà la classe 'overdue' et si on devrait la garder
                const currentCard = document.querySelector(`.console-card[data-console-id="${gameConsole.id}"]`);
                if (currentCard && currentCard.classList.contains('overdue') && diffMinutes > 0 && diffMinutes <= 5) {
                    // Si la carte est déjà en rouge et qu'on est toujours dans la fenêtre 0-5 min, garder 'overdue'
                    cardClass = 'overdue';
                    console.log(`🔴 [renderConsoles] Conservation de la classe 'overdue' pour ${gameConsole.name} (dépassement: ${Math.round(diffMinutes * 10) / 10} min)`);
                }
                card.className = `console-card ${cardClass}`;
                console.log(`🎨 [renderConsoles] Classe appliquée à ${gameConsole.name}: ${card.className} (diffMinutes: ${Math.round(diffMinutes * 10) / 10} min)`);
                card.dataset.consoleId = gameConsole.id;
                if (!gameConsole.isAvailable && gameConsole.currentReservation) {
                    card.dataset.endTime = new Date(gameConsole.currentReservation.endDate).getTime();
                }
                
                // Vérifier si le créneau est terminé (afficher seulement pendant les 5 premières minutes)
                let timeFinishedMessage = '';
                if (!gameConsole.isAvailable && gameConsole.currentReservation) {
                    const now = new Date();
                    const endDate = new Date(gameConsole.currentReservation.endDate);
                    const overdueMinutes = (now - endDate) / (1000 * 60);
                    // Si le temps est terminé et dépassement <= 5 minutes
                    if (endDate <= now && overdueMinutes <= 5) {
                        const userName = gameConsole.currentReservation.userName;
                        timeFinishedMessage = `
                            <div class="time-finished-alert" style="background: #d32f2f; color: white; padding: 15px; margin: 10px 0; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; animation: blink-red 1s ease-in-out infinite;">
                                ⏰ ${userName} a terminé son temps de jeu
                            </div>
                        `;
                    }
                }
                
                // Calculer le temps restant ou dépassement
                let timerText = '';
                let timerClass = '';
                if (!gameConsole.isAvailable && gameConsole.currentReservation) {
                    const now = new Date();
                    const endDate = new Date(gameConsole.currentReservation.endDate);
                    const remainingMs = endDate - now;
                    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
                    
                    if (remainingMs > 0) {
                        // Temps restant
                        const hours = Math.floor(remainingMinutes / 60);
                        const mins = remainingMinutes % 60;
                        if (hours > 0) {
                            timerText = `${hours}h ${mins}m ${remainingSeconds}s`;
                        } else {
                            timerText = `${mins}m ${remainingSeconds}s`;
                        }
                        timerClass = 'timer-remaining';
                    } else {
                        // Dépassement
                        const overdueMinutes = Math.abs(remainingMinutes);
                        const overdueSeconds = Math.abs(remainingSeconds);
                        // Afficher le compteur seulement si le dépassement est <= 5 minutes
                        if (diffMinutes <= 5) {
                            timerText = `+${overdueMinutes}m ${overdueSeconds}s`;
                            timerClass = 'timer-overdue-severe';
                        } else {
                            // Après 5 minutes, ne plus afficher le compteur
                            timerText = '';
                            timerClass = '';
                        }
                    }
                }
                
                // Déterminer l'icône et la couleur selon le type de console
                const consoleIcon = this.getConsoleIcon(gameConsole.type);
                const consoleColor = this.getConsoleColor(gameConsole.type);
                
                card.innerHTML = `
                    <div>
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                            <div class="console-icon" style="background: ${consoleColor}; font-size: 64px; line-height: 1; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 15px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); flex-shrink: 0;">
                                ${consoleIcon}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div class="console-name" style="font-size: 24px; font-weight: 700; margin-bottom: 5px;">${gameConsole.name}</div>
                                <div class="console-type" style="font-size: 18px; color: #666;">${gameConsole.type}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <div class="console-status ${gameConsole.isAvailable ? 'available' : (gameConsole.currentReservation ? 'reserved' : 'unavailable')}">
                                ${gameConsole.isAvailable ? '✅ Disponible' : (gameConsole.currentReservation ? `${statusColor} Réservée` : '🚫 Indisponible')}
                            </div>
                            ${!gameConsole.isAvailable && gameConsole.currentReservation && !gameConsole.currentReservation.isValidated ? 
                                '<div style="background: #fff3cd; color: #856404; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; border: 2px solid #ffc107;">⚠️ À valider</div>' : 
                                ''
                            }
                            ${!gameConsole.isAvailable && gameConsole.currentReservation && timerText ? 
                                `<div class="timer-display-top ${timerClass}" style="font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; color: ${diffMinutes > 0 && diffMinutes <= 5 ? '#d32f2f' : '#2e7d32'}; padding: 8px 12px; background: ${diffMinutes > 0 && diffMinutes <= 5 ? '#ffebee' : '#e8f5e9'}; border-radius: 6px; border: 2px solid ${diffMinutes > 0 && diffMinutes <= 5 ? '#f44336' : '#4caf50'};" data-end-time="${new Date(gameConsole.currentReservation.endDate).getTime()}">
                                    ⏱️ ${timerText}
                                </div>` : 
                                ''
                            }
                        </div>
                        ${timeFinishedMessage}
                        ${(() => {
                            if (!gameConsole.isAvailable && gameConsole.currentReservation) {
                                console.log(`✅ [renderConsoles] Affichage réservation pour ${gameConsole.name}:`, {
                                    userName: gameConsole.currentReservation.userName,
                                    startDate: gameConsole.currentReservation.startDate,
                                    endDate: gameConsole.currentReservation.endDate,
                                    isValidated: gameConsole.currentReservation.isValidated
                                });
                                
                                // Calculer les réservations suivantes pour cette console
                                const currentEndDate = new Date(gameConsole.currentReservation.endDate);
                                const nextReservations = (allReservations || [])
                                    .filter(res => {
                                        // Filtrer les réservations pour cette console
                                        if (!res || res.consoleId !== gameConsole.id) return false;
                                        // Exclure la réservation actuelle
                                        if (res.id === gameConsole.currentReservation.id) return false;
                                        // Garder seulement celles qui commencent après la fin de la réservation actuelle
                                        const resStartDate = new Date(res.startDate);
                                        return resStartDate >= currentEndDate;
                                    })
                                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                                    .slice(0, 3); // Limiter à 3 réservations suivantes
                                
                                // Générer le HTML pour les réservations suivantes
                                let nextReservationsHTML = '';
                                if (nextReservations.length > 0) {
                                    nextReservationsHTML = `
                                        <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); border-radius: 8px; border-left: 4px solid #9e9e9e;">
                                            <div style="font-size: 14px; color: #757575; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">📅 Réservataires suivants :</div>
                                            ${nextReservations.map((res, index) => {
                                                const resStartDate = new Date(res.startDate);
                                                const resEndDate = new Date(res.endDate);
                                                return `
                                                    <div style="font-size: 26px; color: #c62828; margin-top: 10px; padding: 12px 14px; background: linear-gradient(135deg, #ffffff 0%, #ffebee 100%); border-radius: 6px; border-left: 4px solid #f44336; font-weight: 700; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                                        <div style="flex: 1; min-width: 200px;">
                                                            <strong style="color: #b71c1c; font-size: 26px;">${res.userName}</strong> - <span style="font-size: 20px; color: #424242; font-weight: 500;">${this.formatTime(resStartDate)} → ${this.formatTime(resEndDate)}</span>
                                                        </div>
                                                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                                                            <button class="btn-manage-reservation" data-reservation-id="${res.id}" data-action="modify" style="padding: 8px 12px; font-size: 14px; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">✏️ Modifier</button>
                                                            <button class="btn-manage-reservation" data-reservation-id="${res.id}" data-action="delete" style="padding: 8px 12px; font-size: 14px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">🗑️ Supprimer</button>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    `;
                                }
                                
                                return `
                            <div class="reservation-info" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0;">
                                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #2196F3; box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);">
                                    <div style="font-size: 14px; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🎮 Réservation en cours</div>
                                    <div class="current-user-name" style="font-size: 48px; font-weight: 900; color: #1976d2; text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3), 0 0 20px rgba(25, 118, 210, 0.2); letter-spacing: 1px; margin: 10px 0; animation: name-glow 2s ease-in-out infinite;">
                                        ${gameConsole.currentReservation.userName}
                                    </div>
                                    <div style="font-size: 14px; color: #666; margin-top: 8px;">
                                        Début: ${this.formatTime(new Date(gameConsole.currentReservation.startDate))} | 
                                        Fin: ${this.formatTime(new Date(gameConsole.currentReservation.endDate))}
                                    </div>
                                </div>
                                ${nextReservationsHTML}
                                <div style="background: ${diffMinutes > 0 && diffMinutes <= 5 ? '#ffebee' : '#e8f5e9'}; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${diffMinutes > 0 && diffMinutes <= 5 ? '#f44336' : '#4caf50'}; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                    <span style="font-size: 16px; color: #424242; font-weight: 600; white-space: nowrap;">
                                        Fin théorique:
                                    </span>
                                    <span style="font-size: 32px; color: ${diffMinutes > 0 && diffMinutes <= 5 ? '#d32f2f' : '#2e7d32'}; font-weight: 900; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); white-space: nowrap;">
                                        ${this.formatTime(new Date(gameConsole.currentReservation.endDate))}
                                    </span>
                                </div>
                                ${overdueText && diffMinutes > 0 && diffMinutes <= 5 ? `
                                <div style="margin-top: 10px;">
                                    <div style="background: #f8d7da; color: #721c24; padding: 12px 15px; border-radius: 8px; font-weight: bold; font-size: 18px; text-align: center; border: 2px solid #d32f2f;">
                                        ${overdueText.replace(/<br>/g, '').replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                            `;
                            } else {
                                if (!gameConsole.isAvailable && !gameConsole.currentReservation) {
                                    // Console désactivée (pas de réservation)
                                    return `
                                <div class="reservation-info" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0;">
                                    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #9e9e9e;">
                                        <div style="font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🚫 Console désactivée</div>
                                        <div style="font-size: 16px; color: #757575; margin-top: 8px;">
                                            Cette console n'est pas disponible pour les réservations.
                                        </div>
                                    </div>
                                </div>
                            `;
                                }
                                return '';
                            }
                        })()}
                    </div>
                `;

                card.addEventListener('click', () => {
                    // Ne pas permettre de cliquer sur une console désactivée
                    if (!gameConsole.isAvailable && !gameConsole.currentReservation) {
                        this.showToast('Cette console est désactivée et ne peut pas être réservée', 'error');
                        return;
                    }
                    this.showConsoleDetails(gameConsole);
                });

                try {
                    console.log(`🔧 [renderConsoles] Tentative d'ajout de la carte ${index + 1} au DOM...`);
                    container.appendChild(card);
                    cardsCreated++;
                    console.log(`✅ [renderConsoles] Carte console ${cardsCreated} ajoutée:`, gameConsole.name, {
                        hasReservation: !!gameConsole.currentReservation,
                        isAvailable: gameConsole.isAvailable,
                        cardHTML: card.innerHTML.substring(0, 100) + '...',
                        containerChildren: container.children.length
                    });
                } catch (appendError) {
                    console.error(`❌ [renderConsoles] Erreur ajout carte ${index + 1}:`, appendError);
                    console.error('❌ [renderConsoles] Détails de l\'erreur:', {
                        error: appendError.message,
                        stack: appendError.stack,
                        container: container ? 'existe' : 'n\'existe pas',
                        card: card ? 'existe' : 'n\'existe pas'
                    });
                }
            });
            
            console.log(`✅ [renderConsoles] Toutes les consoles traitées (${cardsCreated}/${consoles.length} cartes créées)`);
            console.log('📦 [renderConsoles] Conteneur final:', {
                innerHTMLLength: container.innerHTML.length,
                childrenCount: container.children.length,
                firstChild: container.firstElementChild ? container.firstElementChild.tagName : 'Aucun',
                visible: container.offsetWidth > 0 && container.offsetHeight > 0,
                computedStyle: {
                    display: window.getComputedStyle(container).display,
                    visibility: window.getComputedStyle(container).visibility,
                    opacity: window.getComputedStyle(container).opacity
                }
            });
            
            // Vérifier que les cartes sont bien dans le DOM
            if (container.children.length === 0) {
                console.error('❌ [renderConsoles] Aucune carte dans le conteneur après appendChild!');
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #f44336; background: #ffebee; border-radius: 10px; margin: 20px; border: 3px solid #d32f2f;">❌ Erreur: Les cartes n\'ont pas pu être ajoutées au DOM. Vérifiez la console pour plus de détails.</div>';
            } else {
                console.log('✅ [renderConsoles] Cartes ajoutées avec succès:', container.children.length);
                
                // Forcer la visibilité et le style pour débogage
                container.style.display = 'grid';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                container.style.position = 'relative';
                container.style.zIndex = '1';
                
                // Vérifier chaque carte
                Array.from(container.children).forEach((card, idx) => {
                    card.style.display = 'flex';
                    card.style.visibility = 'visible';
                    card.style.opacity = '1';
                    console.log(`🔍 [renderConsoles] Carte ${idx + 1} vérifiée:`, {
                        tagName: card.tagName,
                        className: card.className,
                        offsetWidth: card.offsetWidth,
                        offsetHeight: card.offsetHeight,
                        display: window.getComputedStyle(card).display,
                        visibility: window.getComputedStyle(card).visibility,
                        opacity: window.getComputedStyle(card).opacity
                    });
                });
            }
            
            // Forcer le reflow pour s'assurer que le navigateur affiche les éléments
            void container.offsetHeight;
            
            // Afficher un message de confirmation visible
            console.log('🎨 [renderConsoles] Style forcé - Les cartes devraient être visibles maintenant');
            
            // Ajouter les event listeners pour les boutons de gestion des réservations dans les cartes
            this.setupReservationManagementButtons();
            
            // Afficher le tableau des réservations
            console.log('📊 [renderConsoles] Affichage du tableau des réservations...');
            await this.renderReservationsTable();
            console.log('✅ [renderConsoles] FIN - Rendu terminé avec succès');
        } catch (error) {
            console.error('❌ [renderConsoles] ERREUR dans renderConsoles:', error);
            console.error('❌ [renderConsoles] Stack trace:', error.stack);
            this.showToast('Erreur lors du chargement des consoles', 'error');
            
            // Afficher l'erreur dans le conteneur
            const container = document.getElementById('consolesList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #f44336;">
                        <p style="font-size: 18px; font-weight: bold;">❌ Erreur de chargement</p>
                        <p>${error.message || 'Impossible de charger les consoles'}</p>
                        <p style="margin-top: 20px; font-size: 14px; color: #666;">Vérifiez que le backend est démarré sur le port 5001</p>
                    </div>
                `;
            }
        }
    }

    updateActiveGamesButton(activeGamesCount) {
        const btn = document.getElementById('activeGamesBtn');
        if (!btn) return;
        
        // Ne pas modifier si le filtre est actif
        if (this.showOnlyActiveGames) {
            return;
        }
        
        if (activeGamesCount > 0) {
            // Ajouter l'animation et le badge
            btn.classList.add('has-active-games');
            // Ajouter le nombre de jeux actifs dans le texte
            btn.textContent = `🎮 Jeu en cours (${activeGamesCount})`;
        } else {
            // Retirer l'animation
            btn.classList.remove('has-active-games');
            btn.textContent = '🎮 Aucune réservation en cours';
        }
    }

    showConsoleDetails(gameConsole) {
        this.currentConsole = gameConsole;

        if (gameConsole.isAvailable) {
            this.showReservationModal(gameConsole);
        } else {
            this.showDetailsModal(gameConsole);
        }
    }

    async showReservationModal(gameConsole) {
        const modal = document.getElementById('reservationModal');
        const title = document.getElementById('modalTitle');
        const info = document.getElementById('consoleInfo');
        const form = document.getElementById('reservationForm');

        title.textContent = `Réserver: ${gameConsole.name}`;
        
        // Charger les réservations pour cette console
        const allReservations = await this.reservationManager.loadReservations();
        const consoleReservations = allReservations
            .filter(res => res.consoleId === gameConsole.id)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        const now = new Date();
        const upcomingReservations = consoleReservations.filter(res => {
            const endDate = new Date(res.endDate);
            return endDate > now;
        });
        
        let reservationsHTML = '';
        if (upcomingReservations.length > 0) {
            reservationsHTML = `
                <div style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2; font-size: 16px;">📅 Sessions à venir pour cette console :</h4>
                    <div style="max-height: 200px; overflow-y: auto;">
            `;
            upcomingReservations.forEach(res => {
                const startDate = new Date(res.startDate);
                const endDate = new Date(res.endDate);
                const isCurrent = gameConsole.currentReservation && gameConsole.currentReservation.id === res.id;
                const status = isCurrent ? '🟢 En cours' : '⏳ À venir';
                const statusColor = isCurrent ? '#4caf50' : '#2196F3';
                reservationsHTML += `
                    <div style="padding: 10px; margin-bottom: 8px; background: white; border-radius: 5px; border-left: 3px solid ${statusColor};">
                        <strong>${res.userName}</strong> - ${status}<br>
                        <small style="color: #666;">
                            ${this.formatDateTime(startDate)} → ${this.formatDateTime(endDate)}
                            (${Math.round((endDate - startDate) / (1000 * 60))} min)
                        </small>
                    </div>
                `;
            });
            reservationsHTML += `
                    </div>
                </div>
            `;
        }
        
        info.innerHTML = `
            <h3>${gameConsole.name}</h3>
            <p>Type: ${gameConsole.type}</p>
            ${reservationsHTML}
        `;

        // Réinitialiser les champs seulement si on n'est pas en mode modification
        if (!this.modifyingReservation) {
            document.getElementById('userName').value = '';
            const scanNumberField = document.getElementById('scanNumber');
            const scanNumberError = document.getElementById('scanNumberError');
            if (scanNumberField) {
                scanNumberField.value = '';
                scanNumberField.style.borderColor = '#667eea'; // Réinitialiser la couleur de bordure
            }
            if (scanNumberError) {
                scanNumberError.style.display = 'none'; // Cacher le message d'erreur
            }
            document.getElementById('pin').value = '';
            document.getElementById('timeDetails').textContent = 'Sélectionnez une durée';
        }
        
        // Mettre à jour les boutons de durée selon les durées autorisées de la console
        const durationContainer = document.querySelector('.duration-buttons-container');
        if (durationContainer) {
            const allowedDurations = gameConsole.allowedDurations || [10, 30, 60];
            durationContainer.innerHTML = allowedDurations.map(duration => {
                const label = duration === 60 ? '1 heure' : duration === 90 ? '1h30' : duration === 120 ? '2 heures' : `${duration} min`;
                return `<button type="button" class="btn btn-secondary duration-btn" data-duration="${duration}" style="flex: 1;">⏱️ ${label}</button>`;
            }).join('');
        }

        // Réinitialiser les boutons de durée
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            // Retirer les anciens listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        // Validation en temps réel du numéro à scanner
        const scanNumberField = document.getElementById('scanNumber');
        const scanNumberError = document.getElementById('scanNumberError');
        if (scanNumberField) {
            scanNumberField.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const scanNumberPattern = /^8\d{6}$/;
                
                // Ne valider que si le champ n'est pas vide
                if (value.length === 0) {
                    e.target.style.borderColor = '#667eea';
                    if (scanNumberError) scanNumberError.style.display = 'none';
                    return;
                }
                
                // Valider le format
                if (scanNumberPattern.test(value)) {
                    e.target.style.borderColor = '#4caf50'; // Vert pour valide
                    if (scanNumberError) scanNumberError.style.display = 'none';
                } else {
                    e.target.style.borderColor = '#f44336'; // Rouge pour invalide
                    if (scanNumberError) scanNumberError.style.display = 'block';
                }
            });
            
            // Empêcher la saisie de caractères non numériques ou qui ne commencent pas par 8
            scanNumberField.addEventListener('keydown', (e) => {
                // Autoriser les touches de contrôle (backspace, delete, tab, etc.)
                if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End' ||
                    (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))) {
                    return;
                }
                
                // Si le champ est vide, n'accepter que le chiffre 8
                if (e.target.value.length === 0 && e.key !== '8') {
                    e.preventDefault();
                    return;
                }
                
                // Si le champ a déjà 7 caractères, empêcher l'ajout
                if (e.target.value.length >= 7) {
                    e.preventDefault();
                    return;
                }
                
                // N'accepter que les chiffres
                if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
            });
        }

        // Gestion des boutons de durée (une seule fois)
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Retirer la sélection précédente
                document.querySelectorAll('.duration-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                });
                
                // Sélectionner le bouton cliqué
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                
                const selectedDuration = parseInt(btn.dataset.duration);
                // Si on a une heure disponible pré-calculée, l'utiliser
                if (this.nextAvailableTimeForReservation) {
                    this.updateReservationTimeWithStartTime(selectedDuration, this.nextAvailableTimeForReservation);
                } else {
                    this.updateReservationTime(selectedDuration);
                }
            });
        });

        modal.classList.add('active');
        form.reset();
    }

    updateReservationTime(durationMinutes) {
        // Utiliser l'heure disponible si elle est définie, sinon utiliser maintenant
        let startTime = this.nextAvailableTimeForReservation ? new Date(this.nextAvailableTimeForReservation) : new Date();
        // S'assurer que la date n'est pas dans le passé
        const now = new Date();
        if (startTime < now) {
            startTime = now;
        }
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        
        // Utiliser le format datetime-local (heure locale)
        const formatDateTimeLocal = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        // Stocker les dates dans les champs cachés
        document.getElementById('startDate').value = formatDateTimeLocal(startTime);
        document.getElementById('endDate').value = formatDateTimeLocal(endTime);
        
        // Afficher les informations
        const timeDetails = document.getElementById('timeDetails');
        const startStr = this.formatTime(startTime);
        const endStr = this.formatTime(endTime);
        timeDetails.innerHTML = `
            <strong>Début:</strong> ${startStr}<br>
            <strong>Fin théorique:</strong> ${endStr}<br>
            <strong>Durée:</strong> ${durationMinutes} minutes
        `;
    }

    updateReservationTimeWithStartTime(durationMinutes, startTime) {
        const start = new Date(startTime);
        // S'assurer que la date n'est pas dans le passé
        const now = new Date();
        if (start < now) {
            start.setTime(now.getTime());
        }
        const endTime = new Date(start.getTime() + durationMinutes * 60 * 1000);
        
        // Stocker les dates dans les champs cachés au format datetime-local (YYYY-MM-DDTHH:mm)
        // Convertir en heure locale pour éviter les problèmes de fuseau horaire
        const formatDateTimeLocal = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        document.getElementById('startDate').value = formatDateTimeLocal(start);
        document.getElementById('endDate').value = formatDateTimeLocal(endTime);
        
        // Afficher les informations
        const timeDetails = document.getElementById('timeDetails');
        const startStr = this.formatTime(start);
        const endStr = this.formatTime(endTime);
        timeDetails.innerHTML = `
            <strong>Début:</strong> ${startStr}<br>
            <strong>Fin théorique:</strong> ${endStr}<br>
            <strong>Durée:</strong> ${durationMinutes} minutes
        `;
    }

    formatTime(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    getConsoleIcon(consoleType) {
        const type = consoleType.toLowerCase();
        
        // Manette Switch (vérifier EN PREMIER pour éviter les conflits)
        if (type.includes('manette switch')) {
            return '🎮'; // Manette Switch - console de jeux vidéo
        }
        
        // PlayStation - Console de salon
        if (type.includes('playstation') || type.includes('ps')) {
            if (type.includes('5') || type.includes('ps5')) {
                return '🎮'; // PlayStation 5 - Console de jeux vidéo
            } else if (type.includes('4') || type.includes('ps4')) {
                return '🎮'; // PlayStation 4 - Console de jeux vidéo
            } else if (type.includes('3') || type.includes('ps3')) {
                return '🎮'; // PlayStation 3 - Console de jeux vidéo
            }
            return '🎮'; // PlayStation par défaut - Console de jeux vidéo
        }
        
        // Nintendo Switch - Console portable
        if (type.includes('switch') || type.includes('nintendo')) {
            if (type.includes('2')) {
                return '🎮'; // Switch 2 - Console de jeux vidéo
            }
            return '🎮'; // Switch - Console de jeux vidéo
        }
        
        // Xbox - Console de salon
        if (type.includes('xbox')) {
            if (type.includes('series') || type.includes('x') || type.includes('s')) {
                return '🎮'; // Xbox Series X/S - Console de jeux vidéo
            } else if (type.includes('one')) {
                return '🎮'; // Xbox One - Console de jeux vidéo
            }
            return '🎮'; // Xbox par défaut - Console de jeux vidéo
        }
        
        // Casque VR
        if (type.includes('vr') || type.includes('casque vr')) {
            return '🥽'; // Casque VR
        }
        
        // Casque audio
        if (type.includes('casque audio') || type.includes('audio')) {
            return '🎧'; // Casque audio
        }
        
        // Par défaut
        return '🎮';
    }
    
    getConsoleColor(consoleType) {
        const type = consoleType.toLowerCase();
        
        // PlayStation - Bleu
        if (type.includes('playstation') || type.includes('ps')) {
            if (type.includes('5') || type.includes('ps5')) {
                return 'linear-gradient(135deg, #003087 0%, #0070f3 100%)'; // Bleu PS5
            } else if (type.includes('4') || type.includes('ps4')) {
                return 'linear-gradient(135deg, #003087 0%, #0070f3 100%)'; // Bleu PS4
            }
            return 'linear-gradient(135deg, #003087 0%, #0070f3 100%)'; // Bleu PlayStation
        }
        
        // Manette Switch - Rouge Nintendo (vérifier AVANT Nintendo Switch pour éviter les conflits)
        if (type.includes('manette')) {
            return 'linear-gradient(135deg, #e60012 0%, #ff6b6b 100%)'; // Rouge Switch
        }
        
        // Nintendo Switch - Rouge
        if (type.includes('switch') || type.includes('nintendo')) {
            if (type.includes('2')) {
                return 'linear-gradient(135deg, #e60012 0%, #ff6b6b 100%)'; // Rouge Switch 2
            }
            return 'linear-gradient(135deg, #e60012 0%, #ff6b6b 100%)'; // Rouge Switch
        }
        
        // Xbox - Vert
        if (type.includes('xbox')) {
            if (type.includes('series') || type.includes('x') || type.includes('s')) {
                return 'linear-gradient(135deg, #107c10 0%, #5cb85c 100%)'; // Vert Xbox Series
            } else if (type.includes('one')) {
                return 'linear-gradient(135deg, #107c10 0%, #5cb85c 100%)'; // Vert Xbox One
            }
            return 'linear-gradient(135deg, #107c10 0%, #5cb85c 100%)'; // Vert Xbox
        }
        
        // Casque VR - Cyan/Violet
        if (type.includes('vr') || type.includes('casque vr')) {
            return 'linear-gradient(135deg, #00d4ff 0%, #5b86e5 50%, #36d1dc 100%)'; // Cyan/Violet VR
        }
        
        // Casque audio - Orange/Rouge
        if (type.includes('casque audio') || type.includes('audio')) {
            return 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #ff8c00 100%)'; // Orange/Rouge audio
        }
        
        // Par défaut - Violet
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    showDetailsModal(gameConsole) {
        const modal = document.getElementById('detailsModal');
        const title = document.getElementById('detailsModalTitle');
        const details = document.getElementById('consoleDetails');
        const reservationDetails = document.getElementById('reservationDetails');
        const actions = document.getElementById('detailsActions');

        title.textContent = gameConsole.name;
        details.innerHTML = `
            <h3>${gameConsole.name}</h3>
            <p>Type: ${gameConsole.type}</p>
            <p><strong>Statut: Réservée</strong></p>
        `;

        if (gameConsole.currentReservation) {
            const res = gameConsole.currentReservation;
            const isValidated = res.isValidated || false;
            const now = new Date();
            const startDate = new Date(res.startDate);
            const endDate = new Date(res.endDate);
            const canValidate = now <= new Date(startDate.getTime() + 5 * 60 * 1000); // 5 min de grâce
            const diffMinutes = (now - endDate) / (1000 * 60);
            let overdueInfo = '';
            
            if (diffMinutes > 30) {
                overdueInfo = `<p style="color: #d32f2f; font-weight: bold; font-size: 16px;">🔴 Dépassement: ${Math.round(diffMinutes)} minutes</p>`;
            } else if (diffMinutes > 15) {
                overdueInfo = `<p style="color: #ff9800; font-weight: bold; font-size: 16px;">🟠 Dépassement: ${Math.round(diffMinutes)} minutes</p>`;
            }
            
            reservationDetails.innerHTML = `
                <h4>Détails de la réservation</h4>
                <p><strong>Réservée par:</strong> ${res.userName}</p>
                <p><strong>Début:</strong> ${this.formatTime(new Date(res.startDate))}</p>
                <p><strong>Fin théorique:</strong> <strong>${this.formatTime(endDate)}</strong></p>
                <p><strong>Statut:</strong> ${isValidated ? '<span style="color: #4caf50; font-weight: bold;">🎮 Jeu en cours</span>' : '<span style="color: #ff9800; font-weight: bold;">⚠️ À valider</span>'}</p>
                ${overdueInfo}
                ${!isValidated ? '<p style="color: #f44336; font-size: 14px;"><strong>⚠️ Attention:</strong> Cette réservation sera annulée automatiquement 5 minutes après l\'heure initiale de la réservation si elle n\'est pas validée.</p>' : ''}
            `;

            let buttonsHTML = '';
            
            // Bouton de validation si non validée et dans les temps
            if (!isValidated && canValidate) {
                buttonsHTML += `<button class="btn btn-primary" id="validateReservationBtn" style="background: #4caf50;">✅ Valider la réservation</button>`;
            }
            
            buttonsHTML += `<button class="btn btn-danger" id="cancelReservationBtn">🗑️ Supprimer la réservation</button>`;
            buttonsHTML += `<button class="btn btn-secondary" id="modifyReservationBtn" style="background: #ff9800;">✏️ Modifier la réservation</button>`;
            buttonsHTML += `<button class="btn btn-primary" id="reserveNextBtn" style="background: #2196F3;">📅 Réserver la console</button>`;
            
            actions.innerHTML = buttonsHTML;

            // Bouton de validation
            if (!isValidated && canValidate) {
                document.getElementById('validateReservationBtn').addEventListener('click', async () => {
                    const pin = await this.askForPIN('Pour valider cette réservation, entre ton code PIN :');
                    if (!pin) return; // L'utilisateur a annulé
                    
                    // Normaliser le PIN (le code admin 6626 fonctionne pour toutes les opérations)
                    const pinString = String(pin).trim();
                    
                    try {
                        // Vérifier le PIN avant de valider (le code admin 6626 est accepté côté backend)
                        const verifyResponse = await fetch(`${API_BASE_URL}/reservations/${res.id}/verify-pin`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            mode: 'cors',
                            credentials: 'same-origin',
                            cache: 'no-cache',
                            body: JSON.stringify({ pin: pinString })
                        });
                        
                        const verifyData = await verifyResponse.json();
                        // Le code admin (6626) est vérifié côté backend, donc si verifyData.success est true, c'est bon
                        if (!verifyData.success) {
                            this.showToast('Code PIN incorrect', 'error');
                            return;
                        }
                        
                        // PIN correct (y compris code admin), procéder à la validation
                        await this.reservationManager.validateReservation(res.id);
                        this.showToast('Réservation validée avec succès !', 'success');
                        this.closeModal('detailsModal');
                        await this.renderConsoles();
                        await this.renderReservationsTable();
                    } catch (error) {
                        this.showToast(error.message || 'Erreur lors de la validation', 'error');
                    }
                });
            }

            // Bouton d'annulation
            document.getElementById('cancelReservationBtn').addEventListener('click', async () => {
                const pin = await this.askForPIN('Pour supprimer cette réservation, entre ton code PIN :');
                if (!pin) return; // L'utilisateur a annulé
                
                // Normaliser le PIN (le code admin 6626 fonctionne pour toutes les opérations)
                const pinString = String(pin).trim();
                
                if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
                    try {
                        await this.reservationManager.cancelReservation(res.id, pinString);
                        this.showToast('Réservation supprimée. Les heures des réservations suivantes ont été recalculées.', 'success');
                        this.closeModal('detailsModal');
                        // Recharger les données pour recalculer les heures théoriques
                        await this.renderConsoles();
                        await this.renderReservationsTable();
                    } catch (error) {
                        this.showToast(error.message || 'Erreur lors de la suppression. Code PIN incorrect ?', 'error');
                    }
                }
            });

            // Bouton de modification
            document.getElementById('modifyReservationBtn').addEventListener('click', async () => {
                const pin = await this.askForPIN('Pour modifier cette réservation, entre ton code PIN :');
                if (!pin) return;
                
                // Vérifier le PIN
                try {
                    // S'assurer que le PIN est une string
                    const pinString = String(pin).trim();
                    console.log('[verify-pin] PIN envoyé:', {
                        original: pin,
                        asString: pinString,
                        length: pinString.length,
                        type: typeof pinString
                    });
                    
                    const url = `${API_BASE_URL}/reservations/${res.id}/verify-pin`;
                    console.log('📡 [verify-pin] URL:', url);
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        mode: 'cors',
                        credentials: 'same-origin',
                        cache: 'no-cache',
                        body: JSON.stringify({ pin: pinString })
                    });
                    
                    const data = await response.json();
                    console.log('[verify-pin] Réponse du serveur:', data);
                    
                    if (!data.success) {
                        this.showToast('Code PIN incorrect', 'error');
                        return;
                    }
                    
                    // PIN correct, ouvrir le formulaire de modification
                    this.closeModal('detailsModal');
                    this.showModifyReservationModal(gameConsole, res, pinString);
                } catch (error) {
                    this.showToast('Erreur lors de la vérification du PIN', 'error');
                }
            });

            // Bouton "Réserver la console" - même si elle est déjà réservée
            document.getElementById('reserveNextBtn').addEventListener('click', async () => {
                this.closeModal('detailsModal');
                await this.showReservationModalWithNextAvailableTime(gameConsole);
            });
        }

        modal.classList.add('active');
    }

    async handleReservation() {
        const userName = document.getElementById('userName').value.trim();
        const scanNumber = document.getElementById('scanNumber').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const pin = document.getElementById('pin').value.trim();
        
        // Si on est en mode modification, utiliser le PIN existant
        const pinToUse = this.modifyingReservation ? this.modifyingPin : pin;

        if (!userName) {
            this.showToast('Veuillez entrer ton prénom', 'error');
            return;
        }

        if (!scanNumber) {
            this.showToast('Veuillez entrer le numéro à scanner', 'error');
            return;
        }

        // Valider le format du numéro à scanner : 7 chiffres commençant par 8
        const scanNumberPattern = /^8\d{6}$/;
        if (!scanNumberPattern.test(scanNumber)) {
            this.showToast('Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908)', 'error');
            const scanNumberField = document.getElementById('scanNumber');
            const errorMsg = document.getElementById('scanNumberError');
            if (scanNumberField) {
                scanNumberField.style.borderColor = '#f44336';
                scanNumberField.focus();
            }
            if (errorMsg) {
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Vérifier que le numéro est dans la liste autorisée
        if (!this.allowedScanNumbers.includes(scanNumber)) {
            this.showToast('Numéro non autorisé : ce numéro n\'est pas dans la liste des numéros autorisés', 'error');
            const scanNumberField = document.getElementById('scanNumber');
            const errorMsg = document.getElementById('scanNumberError');
            if (scanNumberField) {
                scanNumberField.style.borderColor = '#f44336';
                scanNumberField.focus();
            }
            if (errorMsg) {
                errorMsg.textContent = '❌ Numéro non autorisé : ce numéro n\'est pas dans la liste des numéros autorisés';
                errorMsg.style.display = 'block';
            }
            return;
        }

        if (!startDate || !endDate) {
            this.showToast('Veuillez sélectionner une durée d\'emprunt', 'error');
            return;
        }

        // Si on est en mode modification, ne pas demander le PIN (déjà vérifié)
        if (!this.modifyingReservation) {
            if (!pin || !/^\d{4}$/.test(pin)) {
                this.showToast('Veuillez entrer un code PIN de 4 chiffres', 'error');
                return;
            }
        }

        // Convertir les dates du format datetime-local (YYYY-MM-DDTHH:mm) en Date
        // Le format datetime-local est en heure locale, donc on doit le traiter comme tel
        let start, end;
        try {
            // Parser le format datetime-local (YYYY-MM-DDTHH:mm) comme heure locale
            const parseDateTimeLocal = (dateTimeString) => {
                if (!dateTimeString || !dateTimeString.includes('T')) {
                    return new Date(dateTimeString);
                }
                
                // Format datetime-local: YYYY-MM-DDTHH:mm
                const [datePart, timePart] = dateTimeString.split('T');
                if (!datePart || !timePart) {
                    return new Date(dateTimeString);
                }
                
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                
                // Créer une date en heure locale (pas UTC)
                return new Date(year, month - 1, day, hours, minutes, 0, 0);
            };
            
            start = parseDateTimeLocal(startDate);
            end = parseDateTimeLocal(endDate);
            
            // Vérifier que les dates sont valides
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                this.showToast('Erreur : dates invalides', 'error');
                console.error('Dates invalides:', { startDate, endDate, start, end });
                return;
            }
            
            // Vérifier que la date de début n'est pas dans le passé (avec une marge de 1 minute)
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            if (start < oneMinuteAgo) {
                console.warn('Date de début dans le passé, correction à maintenant:', {
                    start: start.toISOString(),
                    now: now.toISOString()
                });
                const duration = end - start;
                start = new Date(now);
                end = new Date(start.getTime() + duration);
            }
            
            console.log('[handleReservation] Dates parsées:', {
                startDateOriginal: startDate,
                startParsed: start.toISOString(),
                endDateOriginal: endDate,
                endParsed: end.toISOString(),
                now: now.toISOString()
            });
        } catch (error) {
            this.showToast('Erreur lors du traitement des dates', 'error');
            console.error('Erreur parsing dates:', error, { startDate, endDate });
            return;
        }

        if (end <= start) {
            this.showToast('Erreur de calcul de durée', 'error');
            return;
        }

        // Vérifier que la durée est valide (10, 30 ou 60 minutes)
        const durationMs = end - start;
        const durationMinutes = durationMs / (1000 * 60);
        
        const allowedDurations = [10, 30, 60];
        if (!allowedDurations.includes(durationMinutes)) {
            this.showToast('La durée doit être de 10, 30 minutes ou 1 heure', 'error');
            return;
        }
        
        if (durationMinutes > 60) {
            this.showToast('La réservation ne peut pas dépasser 1 heure', 'error');
            return;
        }

        try {
            // Si on est en mode modification, supprimer l'ancienne réservation puis créer la nouvelle
            if (this.modifyingReservation) {
                // Supprimer l'ancienne réservation
                await this.reservationManager.cancelReservation(this.modifyingReservation.id, this.modifyingPin);
                
                // Créer la nouvelle réservation avec les nouvelles données
                const reservation = new Reservation(
                    this.reservationManager.generateId(),
                    this.currentConsole.id,
                    userName,
                    start,
                    end
                );
                
                const success = await this.reservationManager.createReservation(reservation, this.modifyingPin, scanNumber);
                if (success) {
                    this.showToast('Réservation modifiée avec succès !', 'success');
                    this.modifyingReservation = null;
                    this.modifyingPin = null;
                    this.closeModal('reservationModal');
                    await this.renderConsoles();
                    await this.renderReservationsTable();
                }
            } else {
                // Création normale
                const reservation = new Reservation(
                    this.reservationManager.generateId(),
                    this.currentConsole.id,
                    userName,
                    start,
                    end
                );
                
                const success = await this.reservationManager.createReservation(reservation, pin, scanNumber);
                if (success) {
                    this.showToast('Merci pour ta réservation, pense bien à la valider. N\'oublie pas ton code PIN !', 'success');
                    this.closeModal('reservationModal');
                    await this.renderConsoles();
                    await this.renderReservationsTable();
                }
            }
        } catch (error) {
            this.showToast(error.message || 'Impossible de créer/modifier la réservation', 'error');
        }
    }

    async showReservationModalWithNextAvailableTime(gameConsole) {
        // Réinitialiser l'heure disponible avant de recalculer
        this.nextAvailableTimeForReservation = null;
        
        // Calculer la prochaine heure disponible (toujours basée sur la date actuelle)
        const nextAvailableTime = await this.calculateNextAvailableTime(gameConsole);
        
        // Vérifier que la date calculée n'est pas dans le passé
        const now = new Date();
        if (nextAvailableTime < now) {
            console.warn('[showReservationModalWithNextAvailableTime] Date calculée dans le passé, utilisation de maintenant');
            this.nextAvailableTimeForReservation = new Date(now);
        } else {
            this.nextAvailableTimeForReservation = nextAvailableTime;
        }
        
        // Ouvrir le formulaire de réservation avec l'heure pré-remplie
        const modal = document.getElementById('reservationModal');
        const title = document.getElementById('modalTitle');
        const info = document.getElementById('consoleInfo');
        
        title.textContent = `Réserver: ${gameConsole.name}`;
        
        // Afficher les informations sur la prochaine disponibilité
        let availabilityInfo = '';
        if (nextAvailableTime) {
            const nextTimeStr = this.formatTime(nextAvailableTime);
            availabilityInfo = `
                <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                    <strong>✅ Prochaine disponibilité :</strong> La console sera libre à partir de <strong>${nextTimeStr}</strong>
                </div>
            `;
        }
        
        info.innerHTML = `
            <h3>${gameConsole.name}</h3>
            <p>Type: ${gameConsole.type}</p>
            ${availabilityInfo}
        `;
        
        // Réinitialiser les champs
        document.getElementById('userName').value = '';
        const scanNumberField = document.getElementById('scanNumber');
        const scanNumberError = document.getElementById('scanNumberError');
        if (scanNumberField) {
            scanNumberField.value = '';
            scanNumberField.style.borderColor = '#667eea';
        }
        if (scanNumberError) {
            scanNumberError.style.display = 'none';
        }
        document.getElementById('pin').value = '';
        document.getElementById('timeDetails').textContent = 'Sélectionnez une durée';
        
        // Mettre à jour les boutons de durée selon les durées autorisées de la console
        const durationContainer = document.querySelector('.duration-buttons-container');
        if (durationContainer) {
            const allowedDurations = gameConsole.allowedDurations || [10, 30, 60];
            durationContainer.innerHTML = allowedDurations.map(duration => {
                const label = duration === 60 ? '1 heure' : duration === 90 ? '1h30' : duration === 120 ? '2 heures' : `${duration} min`;
                return `<button type="button" class="btn btn-secondary duration-btn" data-duration="${duration}" style="flex: 1;">⏱️ ${label}</button>`;
            }).join('');
        }
        
        // Réinitialiser les boutons de durée
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            // Retirer les anciens listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Gestion des boutons de durée (une seule fois)
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Retirer la sélection précédente
                document.querySelectorAll('.duration-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                });
                
                // Sélectionner le bouton cliqué
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                
                const selectedDuration = parseInt(btn.dataset.duration);
                // Utiliser l'heure disponible pré-calculée
                if (this.nextAvailableTimeForReservation) {
                    this.updateReservationTimeWithStartTime(selectedDuration, this.nextAvailableTimeForReservation);
                } else {
                    // Calculer à partir de maintenant
                    const start = new Date();
                    const end = new Date(start.getTime() + selectedDuration * 60 * 1000);
                    
                    // Utiliser le format datetime-local (heure locale)
                    const formatDateTimeLocal = (date) => {
                        const d = new Date(date);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    };
                    
                    document.getElementById('startDate').value = formatDateTimeLocal(start);
                    document.getElementById('endDate').value = formatDateTimeLocal(end);
                    document.getElementById('timeDetails').textContent = 
                        `Début: ${this.formatTime(start)} | Fin: ${this.formatTime(end)}`;
                }
            });
        });
        
        // Validation en temps réel du numéro à scanner
        if (scanNumberField) {
            scanNumberField.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const scanNumberPattern = /^8\d{6}$/;
                
                // Ne valider que si le champ n'est pas vide
                if (value.length === 0) {
                    e.target.style.borderColor = '#667eea';
                    if (scanNumberError) scanNumberError.style.display = 'none';
                    return;
                }
                
                // Valider le format
                if (scanNumberPattern.test(value)) {
                    e.target.style.borderColor = '#4caf50'; // Vert pour valide
                    if (scanNumberError) scanNumberError.style.display = 'none';
                } else {
                    e.target.style.borderColor = '#f44336'; // Rouge pour invalide
                    if (scanNumberError) scanNumberError.style.display = 'block';
                }
            });
            
            // Empêcher la saisie de caractères non numériques ou qui ne commencent pas par 8
            scanNumberField.addEventListener('keydown', (e) => {
                // Autoriser les touches de contrôle (backspace, delete, tab, etc.)
                if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End' ||
                    (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))) {
                    return;
                }
                
                // Si le champ est vide, n'accepter que le chiffre 8
                if (e.target.value.length === 0 && e.key !== '8') {
                    e.preventDefault();
                    return;
                }
                
                // Si le champ a déjà 7 caractères, empêcher l'ajout
                if (e.target.value.length >= 7) {
                    e.preventDefault();
                    return;
                }
                
                // N'accepter que les chiffres
                if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
            });
        }
        
        // L'heure disponible a déjà été stockée plus haut avec vérification
        
        // Pré-sélectionner la durée de 10 minutes par défaut après un court délai
        setTimeout(() => {
            const defaultBtn = document.querySelector('.duration-btn[data-duration="10"]');
            if (defaultBtn) {
                defaultBtn.click();
            }
        }, 100);
        
        modal.classList.add('active');
    }

    async calculateNextAvailableTime(gameConsole) {
        try {
            // Charger toutes les réservations pour cette console
            const allReservations = await this.reservationManager.loadReservations();
            const now = new Date();
            
            console.log('[calculateNextAvailableTime] Début du calcul:', {
                consoleId: gameConsole.id,
                consoleName: gameConsole.name,
                now: now.toISOString(),
                nowLocal: now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                totalReservations: allReservations.length
            });
            
            // Filtrer uniquement les réservations valides (non annulées, non expirées)
            const validReservations = allReservations.filter(res => {
                if (res.consoleId !== gameConsole.id) return false;
                const resEnd = new Date(res.endDate);
                // Garder les réservations qui ne sont pas encore terminées
                const isFuture = resEnd > now;
                if (!isFuture) {
                    console.log('[calculateNextAvailableTime] Réservation passée ignorée:', {
                        id: res.id,
                        endDate: res.endDate,
                        endDateParsed: resEnd.toISOString(),
                        now: now.toISOString()
                    });
                }
                return isFuture;
            });
            
            const consoleReservations = validReservations
                .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            
            // Trouver la prochaine heure disponible
            // TOUJOURS commencer par maintenant (date actuelle)
            let nextAvailable = new Date(now);
            
            // Si la console a une réservation en cours, commencer après sa fin
            if (gameConsole.currentReservation) {
                const currentEnd = new Date(gameConsole.currentReservation.endDate);
                console.log('[calculateNextAvailableTime] Réservation en cours:', {
                    id: gameConsole.currentReservation.id,
                    endDate: currentEnd.toISOString(),
                    endDateLocal: currentEnd.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                    now: now.toISOString()
                });
                if (currentEnd > now) {
                    nextAvailable = new Date(currentEnd);
                }
            }
            
            // Vérifier toutes les réservations futures pour trouver le premier créneau libre
            for (const res of consoleReservations) {
                const resStart = new Date(res.startDate);
                const resEnd = new Date(res.endDate);
                
                // Ignorer les réservations passées
                if (resEnd <= now) {
                    console.log('[calculateNextAvailableTime] Réservation passée ignorée dans la boucle:', {
                        id: res.id,
                        endDate: resEnd.toISOString(),
                        now: now.toISOString()
                    });
                    continue;
                }
                
                // Si la réservation est future et qu'elle commence après notre heure disponible
                if (resStart > nextAvailable) {
                    // Il y a un créneau libre entre nextAvailable et resStart
                    break;
                }
                
                // Si la réservation chevauche ou est après notre heure disponible
                if (resEnd > nextAvailable) {
                    nextAvailable = new Date(resEnd);
                }
            }
            
            // S'assurer que l'heure disponible n'est JAMAIS dans le passé
            if (nextAvailable < now) {
                console.warn('[calculateNextAvailableTime] Date dans le passé détectée, correction:', {
                    nextAvailable: nextAvailable.toISOString(),
                    now: now.toISOString(),
                    difference: (now - nextAvailable) / (1000 * 60) + ' minutes'
                });
                nextAvailable = new Date(now);
            }
            
            // S'assurer que la date est valide
            if (isNaN(nextAvailable.getTime())) {
                console.warn('[calculateNextAvailableTime] Date invalide calculée, utilisation de maintenant');
                nextAvailable = new Date(now);
            }
            
            console.log('[calculateNextAvailableTime] Prochaine heure disponible calculée:', {
                consoleId: gameConsole.id,
                consoleName: gameConsole.name,
                now: now.toISOString(),
                nowLocal: now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                nextAvailable: nextAvailable.toISOString(),
                nextAvailableLocal: nextAvailable.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                hasCurrentReservation: !!gameConsole.currentReservation,
                validReservationsCount: consoleReservations.length
            });
            
            return nextAvailable;
        } catch (error) {
            console.error('[calculateNextAvailableTime] Erreur lors du calcul:', error);
            return new Date(); // Retourner maintenant par défaut
        }
    }

    showModifyReservationModal(gameConsole, reservation, pin) {
        // Stocker les informations de modification
        this.modifyingReservation = reservation;
        this.modifyingPin = pin;
        this.currentConsole = gameConsole;
        
        // Ouvrir le formulaire de réservation avec les données pré-remplies
        const modal = document.getElementById('reservationModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('reservationForm');
        
        title.textContent = `Modifier: ${gameConsole.name}`;
        
        // Pré-remplir les champs avec les données de la réservation
        document.getElementById('userName').value = reservation.userName;
        document.getElementById('scanNumber').value = reservation.scanNumber || '';
        
        // Calculer la durée actuelle
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));
        
        // Sélectionner automatiquement la durée (10, 30 ou 60 minutes)
        const durationBtn = document.querySelector(`.duration-btn[data-duration="${durationMinutes}"]`);
        if (durationBtn) {
            durationBtn.click();
        } else {
            // Si la durée n'est pas exactement 10, 30 ou 60 minutes, utiliser la plus proche
            let closestDuration = 10;
            if (durationMinutes >= 45) {
                closestDuration = 60;
            } else if (durationMinutes >= 20) {
                closestDuration = 30;
            }
            const defaultBtn = document.querySelector(`.duration-btn[data-duration="${closestDuration}"]`);
            if (defaultBtn) {
                defaultBtn.click();
            }
        }
        
        // Masquer le champ PIN en mode modification (déjà vérifié)
        const pinField = document.getElementById('pin').closest('.form-group');
        if (pinField) {
            pinField.style.display = 'none';
        }
        
        // Changer le texte du bouton de soumission
        const submitBtn = document.getElementById('reserveBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Modifier la réservation';
        }
        
        modal.classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        
        // Réinitialiser le mode modification
        if (modalId === 'reservationModal') {
            this.modifyingReservation = null;
            this.modifyingPin = null;
            this.nextAvailableTimeForReservation = null; // Réinitialiser l'heure disponible
            
            // Réafficher le champ PIN
            const pinField = document.getElementById('pin').closest('.form-group');
            if (pinField) {
                pinField.style.display = '';
            }
            
            // Réinitialiser le texte du bouton
            const submitBtn = document.getElementById('reserveBtn');
            if (submitBtn) {
                submitBtn.textContent = 'Réserver';
            }
        }
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTimeLocal(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async startBarcodeScan() {
        if (!this.barcodeScanner.isSupported()) {
            this.showToast('La caméra n\'est pas disponible sur cet appareil', 'error');
            return;
        }

        const modal = document.getElementById('barcodeModal');
        const video = document.getElementById('barcodeVideo');
        const status = document.getElementById('barcodeStatus');
        const detectedNumberDiv = document.getElementById('barcodeDetectedNumber');
        const numberValueDiv = document.getElementById('barcodeNumberValue');

        modal.classList.add('active');
        status.textContent = 'Initialisation de la caméra...';
        status.style.color = '#667eea';
        
        // Masquer l'affichage du numéro détecté au démarrage
        if (detectedNumberDiv) {
            detectedNumberDiv.style.display = 'none';
        }

        // Timeout de sécurité pour détecter si la caméra ne démarre pas
        const timeoutId = setTimeout(() => {
            if (status && status.textContent === 'Initialisation de la caméra...') {
                console.error('📷 [App] Timeout: la caméra n\'a pas démarré dans les 10 secondes');
                status.textContent = '❌ Timeout: la caméra n\'a pas démarré. Vérifiez les permissions.';
                status.style.color = '#f44336';
                this.showToast('La caméra n\'a pas démarré. Vérifiez les permissions dans les paramètres du navigateur.', 'error');
            }
        }, 10000);

        try {
            console.log('📷 [App] Démarrage du scan de code-barres...');
            
            await this.barcodeScanner.startScan(video, (barcodeValue) => {
                console.log('📷 [App] Code-barres détecté:', barcodeValue);
                
                // Afficher le numéro détecté dans le modal
                if (status) {
                    status.textContent = '✅ Code-barres détecté !';
                    status.style.color = '#4caf50';
                }
                
                // Afficher le numéro détecté dans la zone dédiée
                if (detectedNumberDiv && numberValueDiv) {
                    numberValueDiv.textContent = barcodeValue;
                    detectedNumberDiv.style.display = 'block';
                }
                
                // Appeler la fonction de traitement
                this.onBarcodeScanned(barcodeValue);
            });
            
            // Annuler le timeout si la caméra démarre correctement
            clearTimeout(timeoutId);
            
            // Mettre à jour le statut une fois que la caméra est démarrée
            if (status) {
                status.textContent = 'Caméra active - Scannez un code-barres';
                status.style.color = '#4caf50';
            }
            
            console.log('📷 [App] Scanner démarré avec succès');
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('📷 [App] Erreur lors du scan:', error);
            
            if (status) {
                status.textContent = '❌ Erreur: ' + (error.message || 'Erreur lors du scan');
                status.style.color = '#f44336';
            }
            
            this.showToast(error.message || 'Erreur lors du scan', 'error');
            this.stopBarcodeScan();
        }
    }

    onBarcodeScanned(barcodeValue) {
        console.log('Code-barres scanné:', barcodeValue);

        if (this.scanMode === 'admin') {
            // Mode admin : remplir le champ de numéro dans le modal admin
            const scanNumberPattern = /^8\d{6}$/;
            const scannedValue = barcodeValue.trim();
            
            if (!scanNumberPattern.test(scannedValue)) {
                this.showToast(`Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908). Reçu: ${scannedValue}`, 'error');
                this.stopBarcodeScan();
                return;
            }
            
            // Remplir le champ numéro dans le modal admin
            const newScanNumberInput = document.getElementById('newScanNumber');
            const newScanNumberError = document.getElementById('newScanNumberError');
            if (newScanNumberInput) {
                newScanNumberInput.value = scannedValue;
                newScanNumberInput.style.borderColor = '#4caf50'; // Vert pour indiquer que c'est valide
                if (newScanNumberError) {
                    newScanNumberError.style.display = 'none';
                }
            }
            
            this.showToast('Numéro scanné avec succès ! Cliquez sur "Ajouter" pour l\'ajouter à la liste.', 'success');
            this.stopBarcodeScan();
        } else if (this.scanMode === 'reservation') {
            // Valider le format du numéro scanné : 7 chiffres commençant par 8
            const scanNumberPattern = /^8\d{6}$/;
            const scannedValue = barcodeValue.trim();
            
            if (!scanNumberPattern.test(scannedValue)) {
                this.showToast(`Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908). Reçu: ${scannedValue}`, 'error');
                const scanNumberField = document.getElementById('scanNumber');
                const errorMsg = document.getElementById('scanNumberError');
                if (scanNumberField) {
                    scanNumberField.value = scannedValue;
                    scanNumberField.style.borderColor = '#f44336';
                    scanNumberField.focus();
                }
                if (errorMsg) {
                    errorMsg.textContent = '❌ Format invalide : doit être 7 chiffres commençant par 8';
                    errorMsg.style.display = 'block';
                }
                this.stopBarcodeScan();
                return;
            }
            
            // Vérifier que le numéro est dans la liste autorisée
            if (!this.allowedScanNumbers.includes(scannedValue)) {
                this.showToast(`Numéro non autorisé : ce numéro n'est pas dans la liste des numéros autorisés. Reçu: ${scannedValue}`, 'error');
                const scanNumberField = document.getElementById('scanNumber');
                const errorMsg = document.getElementById('scanNumberError');
                if (scanNumberField) {
                    scanNumberField.value = scannedValue;
                    scanNumberField.style.borderColor = '#f44336';
                    scanNumberField.focus();
                }
                if (errorMsg) {
                    errorMsg.textContent = '❌ Numéro non autorisé : ce numéro n\'est pas dans la liste des numéros autorisés';
                    errorMsg.style.display = 'block';
                }
                this.stopBarcodeScan();
                return;
            }
            
            // Remplir le champ numéro à scanner avec le code-barres
            const scanNumberField = document.getElementById('scanNumber');
            const errorMsg = document.getElementById('scanNumberError');
            if (scanNumberField) {
                scanNumberField.value = scannedValue;
                scanNumberField.style.borderColor = '#4caf50'; // Vert pour indiquer que c'est valide
                // Déclencher un événement input pour s'assurer que la validation fonctionne
                scanNumberField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
            this.showToast(`Numéro scanné: ${scannedValue}`, 'success');
            this.stopBarcodeScan();
        } else if (this.scanMode === 'validation') {
            // Valider la réservation si le code-barres correspond
            this.validateReservationByBarcode(barcodeValue);
        }
    }

    async validateReservationByBarcode(barcodeValue) {
        if (!this.currentConsole || !this.currentConsole.currentReservation) {
            this.showToast('Aucune réservation à valider', 'error');
            this.stopBarcodeScan();
            return;
        }

        const reservation = this.currentConsole.currentReservation;
        
        // Vérifier si le code-barres correspond au nom d'utilisateur
        if (reservation.userName === barcodeValue) {
            try {
                await this.reservationManager.validateReservation(reservation.id);
                this.showToast('Réservation validée avec succès !', 'success');
                this.stopBarcodeScan();
                this.closeModal('detailsModal');
                await this.renderConsoles();
            } catch (error) {
                this.showToast(error.message || 'Erreur lors de la validation', 'error');
            }
        } else {
            this.showToast(`Code-barres incorrect. Attendu: ${reservation.userName}`, 'error');
            // Continuer le scan
        }
    }

    stopBarcodeScan() {
        this.barcodeScanner.stopScan();
        const modal = document.getElementById('barcodeModal');
        modal.classList.remove('active');
        const status = document.getElementById('barcodeStatus');
        const detectedNumberDiv = document.getElementById('barcodeDetectedNumber');
        const numberValueDiv = document.getElementById('barcodeNumberValue');
        
        if (status) {
            status.textContent = '';
        }
        if (detectedNumberDiv) {
            detectedNumberDiv.style.display = 'none';
        }
        if (numberValueDiv) {
            numberValueDiv.textContent = '';
        }
        
        this.scanMode = null;
    }

    async askForPIN(message = 'Entrez votre code PIN (4 chiffres) :') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'pinModal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>🔒 Code PIN</h2>
                        <button class="close-btn" id="closePinModal">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 20px; color: #666;">${message}</p>
                        <div class="form-group">
                            <input type="password" id="pinInput" placeholder="1234" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" 
                                   style="font-size: 32px; text-align: center; letter-spacing: 12px; font-family: 'Courier New', monospace; width: 100%; padding: 15px; border: 2px solid #667eea; border-radius: 10px;" 
                                   autofocus>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelPinBtn">Annuler</button>
                            <button type="button" class="btn btn-primary" id="confirmPinBtn">Confirmer</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const pinInput = document.getElementById('pinInput');
            const confirmBtn = document.getElementById('confirmPinBtn');
            const cancelBtn = document.getElementById('cancelPinBtn');
            const closeBtn = document.getElementById('closePinModal');
            
            // Validation en temps réel
            pinInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, ''); // Garder seulement les chiffres
                e.target.value = value;
                // Activer le bouton si c'est le code admin (6626) ou un PIN de 4 chiffres
                if (value === this.adminPIN || value.length === 4) {
                    confirmBtn.disabled = false;
                } else {
                    confirmBtn.disabled = true;
                }
            });
            
            const closeModal = (result = null) => {
                try {
                    // Retirer la classe active d'abord pour masquer visuellement
                    if (modal) {
                        modal.classList.remove('active');
                    }
                    // Puis supprimer du DOM
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                } catch (e) {
                    console.log('Erreur lors de la fermeture du modal PIN:', e);
                }
                // Résoudre la promesse après un court délai pour s'assurer que le DOM est mis à jour
                setTimeout(() => {
                    resolve(result);
                }, 50);
            };
            
            confirmBtn.addEventListener('click', () => {
                const pin = pinInput.value;
                // Accepter le code admin 6626 ou un PIN de 4 chiffres
                if (pin === this.adminPIN || (pin.length === 4 && /^\d{4}$/.test(pin))) {
                    closeModal(pin);
                } else {
                    this.showToast('Le code PIN doit contenir 4 chiffres', 'error');
                }
            });
            
            cancelBtn.addEventListener('click', () => closeModal(null));
            closeBtn.addEventListener('click', () => closeModal(null));
            
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'pinModal') {
                    closeModal(null);
                }
            });
            
            // Entrée pour confirmer
            pinInput.addEventListener('keypress', (e) => {
                const pin = pinInput.value;
                if (e.key === 'Enter' && (pin === this.adminPIN || (pin.length === 4 && /^\d{4}$/.test(pin)))) {
                    confirmBtn.click();
                }
            });
            
            pinInput.focus();
        });
    }

    async renderReservationsTable() {
        try {
            // PRÉSERVER l'état des checkboxes sélectionnées AVANT de régénérer le tableau
            const selectedReservationIds = new Set();
            document.querySelectorAll('.reservation-checkbox:checked').forEach(checkbox => {
                const reservationId = checkbox.getAttribute('data-reservation-id');
                if (reservationId) {
                    selectedReservationIds.add(reservationId);
                }
            });
            
            // Charger toutes les réservations
            const reservations = await this.reservationManager.loadReservations();
            const consoles = await this.reservationManager.loadConsoles();
            
            const tableBody = document.getElementById('reservationsTableBody');
            const section = document.getElementById('reservationsTableSection');
            
            if (!tableBody || !section) {
                console.error('Éléments du tableau non trouvés');
                return;
            }
            
            // Toujours afficher la section
            section.style.display = 'block';
            
            if (!reservations || reservations.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">Aucune réservation pour le moment</td></tr>';
                // Masquer le bouton de suppression en masse
                const deleteBtn = document.getElementById('deleteSelectedPastReservationsBtn');
                const selectAllCheckbox = document.getElementById('selectAllCheckbox');
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (selectAllCheckbox) selectAllCheckbox.style.display = 'none';
                return;
            }
            tableBody.innerHTML = '';
            
            console.log('Affichage de', reservations.length, 'réservations');
            
            // Filtrer les réservations : garder toutes sauf celles annulées (non validées après 5 min de grâce)
            const now = new Date();
            const validReservations = reservations.filter(res => {
                const startDate = new Date(res.startDate);
                const gracePeriod = 5 * 60 * 1000; // 5 minutes
                const graceEnd = new Date(startDate.getTime() + gracePeriod);
                
                // Garder si validée OU si pas encore dans la période de grâce OU si future
                return res.isValidated || now <= graceEnd || startDate > now;
            });
            
            // Trier les réservations par console puis par date de début
            const sortedReservations = [...validReservations].sort((a, b) => {
                if (a.consoleId !== b.consoleId) {
                    return a.consoleId.localeCompare(b.consoleId);
                }
                return new Date(a.startDate) - new Date(b.startDate);
            });
            
            // Grouper par console et calculer les heures théoriques
            const reservationsByConsole = {};
            sortedReservations.forEach(res => {
                if (!reservationsByConsole[res.consoleId]) {
                    reservationsByConsole[res.consoleId] = [];
                }
                reservationsByConsole[res.consoleId].push(res);
            });
            
            console.log('Réservations valides:', validReservations.length, 'sur', reservations.length);
            
            // Tableau pour stocker toutes les réservations avec leurs heures théoriques calculées
            const allReservationsWithTheoreticalTimes = [];
            
            // Calculer les heures théoriques pour chaque console
            Object.keys(reservationsByConsole).forEach(consoleId => {
                const consoleReservations = reservationsByConsole[consoleId];
                const now = new Date();
                
                // Trouver la console pour vérifier la réservation actuelle
                const gameConsole = consoles.find(c => c.id === consoleId);
                const currentReservationId = gameConsole && gameConsole.currentReservation ? gameConsole.currentReservation.id : null;
                
                // Calculer l'heure de début théorique pour chaque réservation
                let theoreticalStart = new Date(now);
                
                consoleReservations.forEach((res, index) => {
                    const startDate = new Date(res.startDate);
                    const endDate = new Date(res.endDate);
                    const duration = endDate - startDate;
                    
                    // Si c'est la première réservation
                    if (index === 0) {
                        // Si elle est en cours (currentReservation), utiliser maintenant comme début
                        if (res.id === currentReservationId) {
                            theoreticalStart = new Date(now);
                        } 
                        // Sinon, si elle n'a pas encore commencé, utiliser sa date de début réelle
                        else if (startDate > now) {
                            theoreticalStart = new Date(startDate);
                        }
                        // Si elle est passée mais validée, utiliser sa date de début réelle
                        else if (res.isValidated) {
                            theoreticalStart = new Date(startDate);
                        }
                        // Sinon, elle est passée et non validée
                        // Si elle est dans la période de grâce (non validée mais créée récemment), utiliser sa date de début réelle
                        else {
                            const gracePeriod = 5 * 60 * 1000; // 5 minutes
                            const graceEnd = new Date(startDate.getTime() + gracePeriod);
                            // Si on est encore dans la période de grâce, utiliser la date de début réelle
                            if (now <= graceEnd) {
                                theoreticalStart = new Date(startDate);
                            } else {
                                // Sinon, elle est vraiment passée, utiliser maintenant (pour les suivantes)
                                theoreticalStart = new Date(now);
                            }
                        }
                    } else {
                        // Pour les réservations suivantes, si elles n'ont pas encore commencé, utiliser leur date de début réelle
                        if (startDate > now) {
                            theoreticalStart = new Date(startDate);
                        }
                    }
                    
                    // Calculer l'heure de fin théorique
                    const theoreticalEnd = new Date(theoreticalStart.getTime() + duration);
                    
                    // Trouver le nom de la console
                    const gameConsole = consoles.find(c => c.id === res.consoleId);
                    const consoleName = gameConsole ? gameConsole.name : res.consoleId;
                    
                    // Stocker la réservation avec ses heures théoriques
                    allReservationsWithTheoreticalTimes.push({
                        reservation: res,
                        consoleName: consoleName,
                        theoreticalStart: theoreticalStart,
                        theoreticalEnd: theoreticalEnd,
                        duration: duration,
                        currentReservationId: currentReservationId
                    });
                    
                    // L'heure de début théorique de la prochaine réservation est l'heure de fin de celle-ci
                    theoreticalStart = new Date(theoreticalEnd);
                });
            });
            
            // Trier toutes les réservations selon la colonne et direction sélectionnées
            allReservationsWithTheoreticalTimes.sort((a, b) => {
                let valueA, valueB;
                
                if (this.sortColumn === 'console') {
                    valueA = a.consoleName.toLowerCase();
                    valueB = b.consoleName.toLowerCase();
                } else if (this.sortColumn === 'joueur') {
                    valueA = a.reservation.userName.toLowerCase();
                    valueB = b.reservation.userName.toLowerCase();
                } else {
                    // Par défaut, trier par date de création (createdAt)
                    valueA = a.reservation.createdAt ? new Date(a.reservation.createdAt) : a.theoreticalStart;
                    valueB = b.reservation.createdAt ? new Date(b.reservation.createdAt) : b.theoreticalStart;
                }
                
                // Comparaison selon le type de valeur
                let comparison = 0;
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    comparison = valueA.localeCompare(valueB);
                } else {
                    comparison = valueA - valueB;
                }
                
                // Appliquer la direction de tri
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });
            
            // Mettre à jour les indicateurs de tri
            this.updateSortIndicators();
            
            // Identifier les réservations passées (réutiliser la variable now déclarée au début de la fonction)
            const pastReservations = [];
            
            // Afficher les réservations triées dans le tableau
            allReservationsWithTheoreticalTimes.forEach(item => {
                const { reservation: res, consoleName, theoreticalStart, theoreticalEnd, duration, currentReservationId } = item;
                
                // Déterminer si la réservation est passée (fin théorique < maintenant)
                const isPast = theoreticalEnd < now;
                if (isPast) {
                    pastReservations.push(res.id);
                }
                
                // Déterminer le statut
                const status = this.getReservationStatus(res, theoreticalStart, theoreticalEnd, currentReservationId);
                
                // Créer la ligne du tableau
                const row = document.createElement('tr');
                row.setAttribute('data-reservation-id', res.id);
                if (isPast) {
                    row.setAttribute('data-is-past', 'true');
                }
                
                // Case à cocher uniquement pour les réservations passées
                const checkboxCell = isPast 
                    ? `<td style="text-align: center;"><input type="checkbox" class="reservation-checkbox" data-reservation-id="${res.id}" style="cursor: pointer; width: 18px; height: 18px;"></td>`
                    : `<td style="text-align: center;"></td>`;
                
                row.innerHTML = `
                    ${checkboxCell}
                    <td>${consoleName}</td>
                    <td><strong>${res.userName}</strong></td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td class="time-cell">${this.formatDateTime(theoreticalStart)}</td>
                    <td class="time-cell">${this.formatDateTime(theoreticalEnd)}</td>
                    <td>${Math.round(duration / (1000 * 60))} min</td>
                    <td>
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button class="btn-manage-reservation-table" data-reservation-id="${res.id}" data-action="modify" style="padding: 6px 12px; font-size: 13px; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">✏️ Modifier</button>
                            <button class="btn-manage-reservation-table" data-reservation-id="${res.id}" data-action="delete" style="padding: 6px 12px; font-size: 13px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">🗑️ Supprimer</button>
                        </div>
                    </td>
                `;
                
                if (tableBody) {
                    tableBody.appendChild(row);
                }
            });
            
            // Afficher/masquer le bouton de suppression en masse selon s'il y a des réservations passées
            const deleteBtn = document.getElementById('deleteSelectedPastReservationsBtn');
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (pastReservations.length > 0) {
                if (deleteBtn) deleteBtn.style.display = 'block';
                if (selectAllCheckbox) selectAllCheckbox.style.display = 'block';
            } else {
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (selectAllCheckbox) selectAllCheckbox.style.display = 'none';
            }
            
            // Ajouter les event listeners pour les boutons de gestion dans le tableau
            this.setupReservationManagementButtons();
            
            // Ajouter les event listeners pour la sélection en masse
            this.setupBulkDeleteReservations();
            
            // RESTAURER l'état des checkboxes après la régénération et la configuration des listeners
            if (selectedReservationIds.size > 0) {
                // Marquer qu'on est en train de restaurer l'état pour éviter les conflits
                const selectAllCheckbox = document.getElementById('selectAllCheckbox');
                if (selectAllCheckbox) {
                    selectAllCheckbox.dataset.restoring = 'true';
                }
                
                // Utiliser setTimeout pour s'assurer que le DOM est complètement prêt
                setTimeout(() => {
                    selectedReservationIds.forEach(reservationId => {
                        const checkbox = document.querySelector(`.reservation-checkbox[data-reservation-id="${reservationId}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                    
                    // Mettre à jour l'état de "Sélectionner tout"
                    if (selectAllCheckbox) {
                        const allCheckboxes = document.querySelectorAll('.reservation-checkbox');
                        const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.checked);
                        selectAllCheckbox.checked = allChecked;
                        // Retirer le flag de restauration
                        delete selectAllCheckbox.dataset.restoring;
                    }
                    
                    // Mettre à jour le compteur et le bouton
                    const checkboxes = document.querySelectorAll('.reservation-checkbox:checked');
                    const count = checkboxes.length;
                    const selectedCountSpan = document.getElementById('selectedCount');
                    const deleteBtn = document.getElementById('deleteSelectedPastReservationsBtn');
                    if (selectedCountSpan) {
                        if (count > 0) {
                            selectedCountSpan.textContent = `${count} réservation(s) sélectionnée(s)`;
                            selectedCountSpan.style.display = 'block';
                        } else {
                            selectedCountSpan.style.display = 'none';
                        }
                    }
                    if (deleteBtn) {
                        deleteBtn.disabled = count === 0;
                        deleteBtn.style.opacity = count === 0 ? '0.5' : '1';
                        deleteBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
                    }
                }, 100); // Délai de 100ms pour s'assurer que tout est prêt
            }
            
        } catch (error) {
            console.error('Erreur lors du rendu du tableau:', error);
        }
    }
    
    updateSortIndicators() {
        // Réinitialiser tous les indicateurs
        document.querySelectorAll('.sortable .sort-indicator').forEach(indicator => {
            indicator.textContent = '';
            indicator.className = 'sort-indicator';
        });
        
        // Si aucune colonne n'est sélectionnée, ne rien afficher
        if (!this.sortColumn) {
            return;
        }
        
        // Mettre à jour l'indicateur de la colonne active
        const activeHeader = document.querySelector(`.sortable[data-sort="${this.sortColumn}"]`);
        if (activeHeader) {
            const indicator = activeHeader.querySelector('.sort-indicator');
            if (indicator) {
                if (this.sortDirection === 'asc') {
                    indicator.textContent = ' ▲';
                    indicator.className = 'sort-indicator sort-asc';
                } else {
                    indicator.textContent = ' ▼';
                    indicator.className = 'sort-indicator sort-desc';
                }
            }
        }
    }

    getReservationStatus(reservation, theoreticalStart, theoreticalEnd, currentReservationId = null) {
        const now = new Date();
        const start = new Date(theoreticalStart);
        const end = new Date(theoreticalEnd);
        const isValidated = reservation.isValidated || false;
        const isCurrentReservation = reservation.id === currentReservationId;
        
        // Utiliser la date de début réelle de la réservation pour la période de grâce
        const realStartDate = new Date(reservation.startDate);
        const gracePeriod = 5 * 60 * 1000; // 5 minutes
        const graceEnd = new Date(realStartDate.getTime() + gracePeriod);
        
        // Si c'est la réservation actuelle de la console
        if (isCurrentReservation) {
            if (isValidated) {
                return { class: 'status-active', text: '✅ En cours' };
            } else {
                // Vérifier si on est dans la période de grâce (basée sur la date réelle)
                if (now > graceEnd) {
                    return { class: 'status-cancelled', text: '❌ Annulée' };
                }
                return { class: 'status-pending', text: '⚠️ À valider' };
            }
        }
        
        // Vérifier si la réservation a été annulée (pas dans currentReservation)
        // Utiliser la date de début réelle pour calculer la période de grâce
        if (!isValidated && now > graceEnd) {
            return { class: 'status-cancelled', text: '❌ Annulée' };
        }
        
        // Si la réservation n'a pas encore commencé (basé sur la date théorique)
        if (now < start) {
            // Si elle est non validée et dans la période de grâce, elle est "À valider"
            if (!isValidated && now <= graceEnd) {
                return { class: 'status-pending', text: '⚠️ À valider' };
            }
            return { class: 'status-pending', text: '⏳ En attente' };
        }
        
        // Si la réservation est en cours (basé sur la date théorique)
        if (now >= start && now <= end) {
            if (isValidated) {
                return { class: 'status-active', text: '✅ En cours' };
            } else {
                // Si elle est dans la période de grâce, elle est "À valider"
                if (now <= graceEnd) {
                    return { class: 'status-pending', text: '⚠️ À valider' };
                }
                // Sinon, elle est annulée
                return { class: 'status-cancelled', text: '❌ Annulée' };
            }
        }
        
        if (now > end) {
            if (isValidated) {
                return { class: 'status-completed', text: '✓ Terminée' };
            } else {
                return { class: 'status-overdue', text: '🔴 En dépassement' };
            }
        }
        
        return { class: 'status-pending', text: '⏳ En attente' };
    }

    formatDateTime(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    formatDateTimeShort(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    updateTimers() {
        // Mettre à jour tous les compteurs des cartes (sans recharger les données)
        document.querySelectorAll('.console-card').forEach(card => {
            // Récupérer l'heure de fin depuis l'attribut data
            const endTime = card.dataset.endTime;
            if (!endTime) return;
            
            const now = new Date();
            const endDate = new Date(parseInt(endTime));
            
            const remainingMs = endDate - now;
            const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            
            // Calculer diffMinutes pour les couleurs (une seule déclaration)
            const diffMinutes = (now - endDate) / (1000 * 60);
            
            // Vérifier si le créneau est terminé
            const isFinished = endDate <= now;
            
            // Gérer l'affichage du message "temps terminé" (seulement pendant les 5 premières minutes)
            let timeFinishedAlert = card.querySelector('.time-finished-alert');
            const reservationInfo = card.querySelector('.reservation-info');
            
            if (isFinished && diffMinutes <= 5 && reservationInfo) {
                // Récupérer le nom de l'utilisateur depuis la carte
                const userNameElement = reservationInfo.querySelector('.current-user-name');
                const userName = userNameElement ? userNameElement.textContent.trim() : 'L\'emprunteur';
                
                // Créer ou mettre à jour le message
                if (!timeFinishedAlert) {
                    timeFinishedAlert = document.createElement('div');
                    timeFinishedAlert.className = 'time-finished-alert';
                    timeFinishedAlert.style.cssText = 'background: #d32f2f; color: white; padding: 15px; margin: 10px 0; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; animation: blink-red 1s ease-in-out infinite; box-shadow: 0 4px 12px rgba(211, 47, 47, 0.5);';
                    timeFinishedAlert.innerHTML = `⏰ ${userName} a terminé son temps de jeu`;
                    
                    // Insérer le message après le statut de la console
                    const consoleStatus = card.querySelector('.console-status');
                    if (consoleStatus && consoleStatus.parentNode) {
                        consoleStatus.parentNode.insertBefore(timeFinishedAlert, consoleStatus.nextSibling);
                    }
                }
            } else if (timeFinishedAlert && (!isFinished || diffMinutes > 5)) {
                // Supprimer le message si le temps n'est pas encore terminé ou si dépassement > 5 min
                timeFinishedAlert.remove();
            }
            
            // Calculer le texte et la classe du timer
            let timerText = '';
            let timerClass = '';
            
            if (remainingMs > 0) {
                // Temps restant
                const hours = Math.floor(remainingMinutes / 60);
                const mins = remainingMinutes % 60;
                if (hours > 0) {
                    timerText = `${hours}h ${mins}m ${remainingSeconds}s`;
                } else if (remainingMinutes > 0) {
                    timerText = `${mins}m ${remainingSeconds}s`;
                } else {
                    timerText = `${remainingSeconds}s`;
                }
                timerClass = 'timer-remaining';
            } else {
                // Dépassement - afficher seulement si <= 5 minutes
                if (diffMinutes <= 5) {
                    const overdueMinutes = Math.abs(remainingMinutes);
                    const overdueSeconds = Math.abs(remainingSeconds);
                    if (overdueMinutes > 0) {
                        timerText = `+${overdueMinutes}m ${overdueSeconds}s`;
                    } else {
                        timerText = `+${overdueSeconds}s`;
                    }
                    timerClass = 'timer-overdue-severe';
                } else {
                    // Après 5 minutes, ne plus afficher le compteur
                    timerText = '';
                    timerClass = '';
                }
            }
            
            // Mettre à jour la classe CSS de la carte selon le dépassement
            // IMPORTANT: Cette logique doit correspondre exactement à celle de renderConsoles()
            // Cette mise à jour doit se faire AVANT la mise à jour du timer pour s'assurer que la classe est correcte
            // IMPORTANT: diffMinutes doit être strictement <= 5 pour rester rouge pendant 5 minutes
            if (diffMinutes > 0 && diffMinutes <= 5) {
                // Dépassement 0-5 min = rouge
                if (!card.classList.contains('overdue')) {
                    card.classList.remove('default', 'in-progress', 'to-validate', 'unavailable');
                    card.classList.add('overdue');
                    console.log(`🔴 [updateTimers] Carte ${card.dataset.consoleId} - Passage en rouge (dépassement: ${Math.round(diffMinutes * 10) / 10} min, max 5 min)`);
                }
            } else if (diffMinutes > 5) {
                // Dépassement > 5 min = bleu
                if (!card.classList.contains('default')) {
                    card.classList.remove('overdue', 'in-progress', 'to-validate', 'unavailable');
                    card.classList.add('default');
                    console.log(`🔵 [updateTimers] Carte ${card.dataset.consoleId} - Passage en bleu (dépassement: ${Math.round(diffMinutes * 10) / 10} min > 5 min)`);
                }
            } else if (diffMinutes <= 0) {
                // Pas de dépassement - ne pas modifier la classe ici, elle est gérée par renderConsoles()
                // Mais s'assurer qu'on ne force pas 'overdue' si on n'est pas en dépassement
                if (card.classList.contains('overdue') && diffMinutes <= 0) {
                    // Si on était en rouge mais qu'on n'est plus en dépassement, laisser renderConsoles() gérer
                    // (ne pas forcer ici pour éviter les conflits)
                }
            }
            // Si diffMinutes <= 0, on ne modifie pas la classe (gérée par renderConsoles selon isValidated)
            
            // Mettre à jour le compteur en haut (timer-display-top)
            const timerDisplayTop = card.querySelector('.timer-display-top');
            if (timerDisplayTop) {
                if (timerText) {
                    timerDisplayTop.textContent = `⏱️ ${timerText}`;
                    timerDisplayTop.className = `timer-display-top ${timerClass}`;
                    // Appliquer la couleur rouge seulement si dépassement entre 0 et 5 minutes
                    const isOverdue = diffMinutes > 0 && diffMinutes <= 5;
                    timerDisplayTop.style.color = isOverdue ? '#d32f2f' : '#2e7d32';
                    timerDisplayTop.style.background = isOverdue ? '#ffebee' : '#e8f5e9';
                    timerDisplayTop.style.borderColor = isOverdue ? '#f44336' : '#4caf50';
                    timerDisplayTop.style.display = 'block';
                } else {
                    // Masquer le compteur si pas de texte
                    timerDisplayTop.style.display = 'none';
                }
            }
            
            // Mettre à jour le compteur en bas (timer-display) si il existe encore
            const timerDisplay = card.querySelector('.timer-display');
            if (timerDisplay) {
                timerDisplay.textContent = timerText;
                timerDisplay.className = `timer-display ${timerClass}`;
            }
            
            // Mettre à jour aussi la couleur de la carte si nécessaire
            let cardClass = 'reserved';
            if (diffMinutes > 30) {
                cardClass = 'reserved-overdue-severe';
            } else if (diffMinutes > 15) {
                cardClass = 'reserved-overdue-warning';
            }
            
            // Mettre à jour la classe de la carte
            const currentClasses = card.className.split(' ').filter(c => !c.startsWith('reserved'));
            card.className = `${currentClasses.join(' ')} ${cardClass}`.trim();
        });
    }

    showRulesModal() {
        const modal = document.getElementById('rulesModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    async showAdminModal() {
        // Si le mode admin n'est pas activé, demander le code PIN
        if (!this.isAdminMode) {
            const pin = await this.askForPIN('Entrez le code PIN administrateur :');
            if (!pin) return; // L'utilisateur a annulé
            
            if (pin !== this.adminPIN) {
                this.showToast('Code PIN incorrect', 'error');
                return;
            }
            
            this.isAdminMode = true;
        }
        
        // Afficher l'interface admin
        const modal = document.getElementById('adminModal');
        const title = document.getElementById('adminModalTitle');
        const body = document.getElementById('adminModalBody');
        
        title.textContent = '🔐 Mode Administrateur';
        
        // Charger les consoles et les numéros autorisés
        const consoles = await this.reservationManager.loadConsoles();
        const allowedScanNumbers = await this.reservationManager.loadAllowedScanNumbers();
        
        let adminHTML = `
            <!-- Section 1: Gestion des numéros autorisés -->
            <div style="margin-bottom: 30px; padding: 20px; background: #fff; border: 2px solid #667eea; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <strong style="font-size: 18px; color: #856404;">📋 Gestion des numéros autorisés pour les réservations</strong>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                        Ajoutez ou supprimez des numéros de carte Geek autorisés pour les réservations. Format requis : 7 chiffres commençant par 8 (ex: 8012908).
                    </p>
                </div>
                
                <!-- Champ de recherche -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555; font-size: 14px;">
                        🔍 Rechercher un numéro :
                    </label>
                    <input type="text" 
                           id="searchScanNumber" 
                           placeholder="Tapez pour rechercher (ex: 8012...)" 
                           style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; font-family: 'Courier New', monospace; text-align: center; letter-spacing: 1px;">
                    <small style="display: block; margin-top: 5px; color: #666; font-size: 12px;">
                        La recherche filtre la liste en temps réel
                    </small>
                </div>
                
                <!-- Formulaire d'ajout -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555; font-size: 14px;">
                        ➕ Ajouter un nouveau numéro :
                    </label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" 
                               id="newScanNumber" 
                               placeholder="Ex: 8012912" 
                               pattern="^8\\d{6}$" 
                               maxlength="7" 
                               inputmode="numeric"
                               style="flex: 1; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 18px; font-family: 'Courier New', monospace; text-align: center; letter-spacing: 2px;">
                        <button type="button" 
                                id="scanBarcodeAdminBtn" 
                                class="btn btn-secondary"
                                style="padding: 12px 20px; white-space: nowrap; font-weight: bold;">
                            📷 Scanner
                        </button>
                        <button type="button" 
                                id="addScanNumberBtn" 
                                class="btn btn-primary"
                                style="padding: 12px 24px; white-space: nowrap; font-weight: bold;">
                            ➕ Ajouter
                        </button>
                    </div>
                </div>
                
                <!-- Liste des numéros autorisés -->
                <div style="margin-top: 20px;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #555; display: flex; justify-content: space-between; align-items: center;">
                        <span>📋 Numéros autorisés :</span>
                        <span id="scanNumbersCount" style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                            ${allowedScanNumbers.length} numéro${allowedScanNumbers.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div id="allowedScanNumbersList" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; padding-right: 5px;">
        `;
        
        allowedScanNumbers.forEach(scanNumber => {
            adminHTML += `
                <div class="allowed-scan-number-item" 
                     data-scan-number="${scanNumber}"
                     style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #e3f2fd; border: 2px solid #2196F3; border-radius: 8px; transition: all 0.2s;">
                    <div style="font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px; color: #1976d2;">
                        ${scanNumber}
                    </div>
                    <button type="button" 
                            class="btn btn-secondary remove-scan-number-btn" 
                            data-scan-number="${scanNumber}"
                            style="padding: 8px 16px; ${allowedScanNumbers.length <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                            ${allowedScanNumbers.length <= 1 ? 'disabled' : ''}
                            title="${allowedScanNumbers.length <= 1 ? 'Il doit rester au moins un numéro autorisé' : 'Supprimer ce numéro'}">
                        🗑️ Supprimer
                    </button>
                </div>
            `;
        });
        
        adminHTML += `
                    </div>
                    <div id="noScanNumbersFound" style="display: none; text-align: center; padding: 20px; color: #999; font-style: italic;">
                        Aucun numéro trouvé correspondant à votre recherche
                    </div>
                </div>
            </div>
            
            <!-- Section 2: Gestion des consoles -->
            <div style="margin-bottom: 20px; padding: 20px; background: #fff; border: 2px solid #667eea; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                    <strong style="font-size: 18px; color: #1976d2;">🎮 Gestion de la disponibilité des consoles</strong>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                        Activez ou désactivez la disponibilité des consoles pour les réservations.
                    </p>
                </div>
                <div id="adminConsolesList" style="display: flex; flex-direction: column; gap: 15px;">
        `;
        
        consoles.forEach(gameConsole => {
            const isAvailable = gameConsole.isAvailable;
            const hasReservation = gameConsole.currentReservation !== null;
            const canToggle = !hasReservation; // Ne peut pas changer si une réservation est en cours
            
            adminHTML += `
                <div class="admin-console-item" style="padding: 15px; border: 2px solid ${isAvailable ? '#4caf50' : '#f44336'}; border-radius: 8px; background: ${isAvailable ? '#e8f5e9' : '#ffebee'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${gameConsole.name}</div>
                            <div style="font-size: 14px; color: #666;">Type: ${gameConsole.type}</div>
                            <div style="font-size: 14px; color: ${isAvailable ? '#4caf50' : '#f44336'}; font-weight: bold; margin-top: 5px;">
                                ${isAvailable ? '✅ Disponible' : '❌ Indisponible'}
                            </div>
                            ${hasReservation ? `<div style="font-size: 12px; color: #ff9800; margin-top: 5px;">⚠️ Réservation en cours</div>` : ''}
                        </div>
                        <div style="margin-left: 15px;">
                            <label class="admin-toggle-switch" style="position: relative; display: inline-block; width: 60px; height: 34px; cursor: ${canToggle ? 'pointer' : 'not-allowed'};">
                                <input type="checkbox" 
                                       id="toggle-${gameConsole.id}"
                                       data-console-id="${gameConsole.id}" 
                                       ${isAvailable ? 'checked' : ''} 
                                       ${canToggle ? '' : 'disabled'}
                                       style="opacity: 0; width: 0; height: 0; position: absolute;">
                                <span class="admin-toggle-slider" style="position: absolute; cursor: ${canToggle ? 'pointer' : 'not-allowed'}; top: 0; left: 0; right: 0; bottom: 0; background-color: ${isAvailable ? '#4caf50' : '#ccc'}; transition: .4s; border-radius: 34px;">
                                    <span style="position: absolute; content: ''; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; ${isAvailable ? 'transform: translateX(26px);' : ''}"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid ${isAvailable ? '#4caf50' : '#f44336'};">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #555;">⏱️ Durées autorisées (en minutes) :</div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                            ${[10, 15, 20, 30, 45, 60, 90, 120].map(duration => {
                                const isChecked = (gameConsole.allowedDurations || [10, 30, 60]).includes(duration);
                                return `
                                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px 12px; background: ${isChecked ? '#e3f2fd' : '#f5f5f5'}; border: 2px solid ${isChecked ? '#2196F3' : '#ddd'}; border-radius: 6px; transition: all 0.2s;">
                                        <input type="checkbox" 
                                               class="duration-checkbox" 
                                               data-console-id="${gameConsole.id}"
                                               data-duration="${duration}"
                                               ${isChecked ? 'checked' : ''}
                                               style="margin-right: 6px; cursor: pointer;">
                                        <span style="font-size: 14px; font-weight: ${isChecked ? 'bold' : 'normal'}; color: ${isChecked ? '#1976d2' : '#666'};">
                                            ${duration === 60 ? '1 heure' : duration === 90 ? '1h30' : duration === 120 ? '2 heures' : `${duration} min`}
                                        </span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; color: #666; font-style: italic;">
                            Les durées cochées seront disponibles lors de la réservation de cette console.
                        </div>
                    </div>
                </div>
            `;
        });
        
        adminHTML += `</div></div>`;
        
        body.innerHTML = adminHTML;
        
        // Ajouter les event listeners pour les checkboxes de durées
        const durationCheckboxes = body.querySelectorAll('.duration-checkbox');
        console.log(`🔧 [Admin] ${durationCheckboxes.length} checkboxes de durées trouvées`);
        
        durationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const consoleId = checkbox.dataset.consoleId;
                const duration = parseInt(checkbox.dataset.duration);
                const isChecked = checkbox.checked;
                
                console.log(`🔄 [Admin] Durée ${duration}min ${isChecked ? 'cochée' : 'décochée'} pour console ${consoleId}`);
                
                // Récupérer toutes les durées actuellement cochées pour cette console
                const consoleCheckboxes = Array.from(body.querySelectorAll(`.duration-checkbox[data-console-id="${consoleId}"]`));
                const checkedDurations = consoleCheckboxes
                    .filter(cb => cb.checked)
                    .map(cb => parseInt(cb.dataset.duration))
                    .sort((a, b) => a - b);
                
                console.log(`📋 [Admin] Durées sélectionnées pour console ${consoleId}:`, checkedDurations);
                
                // Vérifier qu'au moins une durée est sélectionnée
                if (checkedDurations.length === 0) {
                    checkbox.checked = true; // Re-cocher la case
                    this.showToast('Au moins une durée doit être sélectionnée', 'error');
                    return;
                }
                
                // Désactiver toutes les checkboxes pendant la mise à jour
                consoleCheckboxes.forEach(cb => cb.disabled = true);
                
                try {
                    const success = await this.reservationManager.updateConsoleDurations(consoleId, checkedDurations);
                    
                    if (success) {
                        const consoleName = this.reservationManager.getConsole(consoleId)?.name || 'la console';
                        this.showToast(`Durées mises à jour pour ${consoleName}`, 'success');
                        
                        // Recharger les consoles pour mettre à jour les données
                        console.log(`🔄 [Admin] Rechargement des consoles après mise à jour des durées...`);
                        await this.reservationManager.loadConsoles();
                        
                        // Vérifier que les durées ont bien été mises à jour
                        const updatedConsole = this.reservationManager.getConsole(consoleId);
                        if (updatedConsole) {
                            console.log(`✅ [Admin] Console ${consoleName} - Durées après rechargement:`, updatedConsole.allowedDurations);
                        } else {
                            console.error(`❌ [Admin] Console ${consoleId} non trouvée après rechargement!`);
                        }
                        
                        // Mettre à jour visuellement les labels
                        const label = checkbox.closest('label');
                        if (label) {
                            if (isChecked) {
                                label.style.background = '#e3f2fd';
                                label.style.borderColor = '#2196F3';
                                const span = label.querySelector('span');
                                if (span) {
                                    span.style.fontWeight = 'bold';
                                    span.style.color = '#1976d2';
                                }
                            } else {
                                label.style.background = '#f5f5f5';
                                label.style.borderColor = '#ddd';
                                const span = label.querySelector('span');
                                if (span) {
                                    span.style.fontWeight = 'normal';
                                    span.style.color = '#666';
                                }
                            }
                        }
                    } else {
                        checkbox.checked = !isChecked; // Annuler le changement
                        this.showToast('Erreur lors de la mise à jour des durées', 'error');
                    }
                } catch (error) {
                    console.error('❌ [Admin] Erreur lors de la mise à jour des durées:', error);
                    checkbox.checked = !isChecked; // Annuler le changement
                    this.showToast(error.message || 'Erreur lors de la mise à jour des durées', 'error');
                } finally {
                    // Réactiver toutes les checkboxes
                    consoleCheckboxes.forEach(cb => cb.disabled = false);
                }
            });
        });
        
        // Ajouter les event listeners pour les toggles (exclure les checkboxes de durées)
        const toggles = Array.from(body.querySelectorAll('input[type="checkbox"][data-console-id]'))
            .filter(toggle => !toggle.classList.contains('duration-checkbox'));
        console.log(`🔧 [Admin] ${toggles.length} toggles trouvés`);
        
        toggles.forEach((toggle, index) => {
            const consoleId = toggle.dataset.consoleId;
            const originalChecked = toggle.checked;
            console.log(`🔧 [Admin] Configuration toggle pour console ${consoleId} (index ${index + 1}), état initial: ${originalChecked}`);
            
            // Event listener pour le changement du checkbox
            toggle.addEventListener('change', async (e) => {
                const target = e.target;
                const consoleId = target.dataset.consoleId;
                const isAvailable = target.checked;
                
                console.log(`🔄 [Admin] Toggle changé - Console ${consoleId}: ${isAvailable}`);
                
                // Désactiver le toggle pendant la requête
                target.disabled = true;
                
                try {
                    console.log(`🔄 [Admin] Appel API pour console ${consoleId}, isAvailable: ${isAvailable}`);
                    const success = await this.reservationManager.updateConsoleAvailability(consoleId, isAvailable);
                    console.log(`✅ [Admin] Résultat API: ${success}`);
                    
                    if (success) {
                        this.showToast(`Console ${isAvailable ? 'activée' : 'désactivée'}`, 'success');
                        
                        // Mettre à jour immédiatement le toggle dans le modal
                        target.checked = isAvailable;
                        target.disabled = false;
                        
                        // Trouver le label et le slider
                        const label = target.closest('label');
                        if (label) {
                            const slider = label.querySelector('.admin-toggle-slider');
                            console.log('🎨 [Admin] Slider trouvé:', slider);
                            
                            if (slider) {
                                // Récupérer le style actuel et le mettre à jour
                                const currentStyle = slider.getAttribute('style') || '';
                                // Remplacer la couleur de fond dans le style inline
                                const newBgColor = isAvailable ? '#4caf50' : '#ccc';
                                let newStyle = currentStyle.replace(/background-color:\s*[^;]+;?/g, '');
                                newStyle = newStyle.replace(/background:\s*[^;]+;?/g, '');
                                newStyle += ` background-color: ${newBgColor};`;
                                
                                // Garder les autres propriétés du style
                                const otherProps = currentStyle.match(/(?:cursor|position|top|left|right|bottom|transition|border-radius):[^;]+;?/g);
                                if (otherProps) {
                                    otherProps.forEach(prop => {
                                        if (!newStyle.includes(prop)) {
                                            newStyle += ' ' + prop;
                                        }
                                    });
                                }
                                
                                slider.setAttribute('style', newStyle.trim());
                                console.log('🎨 [Admin] Style slider mis à jour:', newStyle);
                                
                                // Mettre à jour le point du slider
                                const sliderDot = slider.querySelector('span');
                                if (sliderDot) {
                                    const dotStyle = sliderDot.getAttribute('style') || '';
                                    const newTransform = isAvailable ? 'translateX(26px)' : 'translateX(0px)';
                                    let newDotStyle = dotStyle.replace(/transform:\s*[^;]+;?/g, '');
                                    newDotStyle += ` transform: ${newTransform};`;
                                    
                                    // Garder les autres propriétés
                                    const otherDotProps = dotStyle.match(/(?:position|content|height|width|left|bottom|background-color|transition|border-radius):[^;]+;?/g);
                                    if (otherDotProps) {
                                        otherDotProps.forEach(prop => {
                                            if (!newDotStyle.includes(prop.split(':')[0])) {
                                                newDotStyle += ' ' + prop;
                                            }
                                        });
                                    }
                                    
                                    sliderDot.setAttribute('style', newDotStyle.trim());
                                    console.log('🎨 [Admin] Style dot mis à jour:', newDotStyle);
                                }
                            }
                        }
                        
                        // Mettre à jour le texte de statut dans le modal
                        const consoleItem = target.closest('.admin-console-item');
                        if (consoleItem) {
                            const statusText = consoleItem.querySelector('div[style*="font-weight: bold"]');
                            if (statusText) {
                                statusText.textContent = isAvailable ? '✅ Disponible' : '❌ Indisponible';
                                statusText.style.color = isAvailable ? '#4caf50' : '#f44336';
                            }
                            // Mettre à jour la bordure et le fond
                            consoleItem.style.borderColor = isAvailable ? '#4caf50' : '#f44336';
                            consoleItem.style.background = isAvailable ? '#e8f5e9' : '#ffebee';
                        }
                        
                        // Attendre un peu pour que le backend sauvegarde
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        // Recharger les consoles depuis le serveur (sans cache)
                        console.log('🔄 [Admin] Rechargement des consoles...');
                        await this.reservationManager.loadConsoles();
                        console.log('✅ [Admin] Consoles rechargées:', this.reservationManager.consoles.map(c => ({
                            id: c.id,
                            name: c.name,
                            isAvailable: c.isAvailable,
                            hasReservation: !!c.currentReservation
                        })));
                        
                        // Vérifier spécifiquement la console modifiée AVANT le rendu
                        const updatedConsole = this.reservationManager.consoles.find(c => c.id === consoleId);
                        if (updatedConsole) {
                            console.log(`🔍 [Admin] Console modifiée vérifiée: ${updatedConsole.name} - isAvailable: ${updatedConsole.isAvailable}, expected: ${isAvailable}`);
                            if (updatedConsole.isAvailable !== isAvailable) {
                                console.error(`❌ [Admin] PROBLÈME: La console ${updatedConsole.name} n'a pas été correctement mise à jour!`);
                                console.error(`❌ [Admin] État actuel: isAvailable=${updatedConsole.isAvailable}, État attendu: isAvailable=${isAvailable}`);
                                // Forcer la mise à jour manuellement
                                updatedConsole.isAvailable = isAvailable;
                                if (!isAvailable) {
                                    updatedConsole.currentReservation = null;
                                }
                                console.log(`🔧 [Admin] État forcé manuellement à: ${isAvailable}`);
                            }
                        } else {
                            console.error(`❌ [Admin] Console ${consoleId} non trouvée après rechargement!`);
                        }
                        
                        console.log('✅ [Admin] Rendu des consoles...');
                        await this.renderConsoles();
                        console.log('✅ [Admin] Rendu terminé');
                        
                        // Attendre un peu pour que le DOM soit mis à jour
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Vérifier que la carte a bien la bonne classe
                        const card = document.querySelector(`.console-card[data-console-id="${consoleId}"]`);
                        if (card) {
                            const hasUnavailable = card.classList.contains('unavailable');
                            const hasAvailable = card.classList.contains('available');
                            console.log(`🎨 [Admin] Carte console ${consoleId}: classes=${card.className}, unavailable=${hasUnavailable}, available=${hasAvailable}`);
                            if (!isAvailable && !hasUnavailable) {
                                console.error(`❌ [Admin] PROBLÈME: La carte devrait avoir la classe 'unavailable' mais ne l'a pas!`);
                                // Forcer la classe
                                card.classList.remove('available', 'reserved', 'reserved-overdue-warning', 'reserved-overdue-severe');
                                card.classList.add('unavailable');
                                console.log(`🔧 [Admin] Classe 'unavailable' forcée manuellement`);
                                
                                // Mettre à jour aussi le statut visuel
                                const statusElement = card.querySelector('.console-status');
                                if (statusElement) {
                                    statusElement.textContent = '🚫 Indisponible';
                                    statusElement.className = 'console-status unavailable';
                                    console.log(`🔧 [Admin] Statut visuel mis à jour: 🚫 Indisponible`);
                                }
                                
                                // Mettre à jour aussi le message de console désactivée
                                const reservationInfo = card.querySelector('.reservation-info');
                                if (!reservationInfo || !reservationInfo.innerHTML.includes('Console désactivée')) {
                                    const existingInfo = card.querySelector('.reservation-info');
                                    if (existingInfo) {
                                        existingInfo.remove();
                                    }
                                    const consoleStatus = card.querySelector('.console-status');
                                    if (consoleStatus && consoleStatus.parentNode) {
                                        const disabledInfo = document.createElement('div');
                                        disabledInfo.className = 'reservation-info';
                                        disabledInfo.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0;';
                                        disabledInfo.innerHTML = `
                                            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #9e9e9e;">
                                                <div style="font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🚫 Console désactivée</div>
                                                <div style="font-size: 16px; color: #757575; margin-top: 8px;">
                                                    Cette console n'est pas disponible pour les réservations.
                                                </div>
                                            </div>
                                        `;
                                        consoleStatus.parentNode.insertBefore(disabledInfo, consoleStatus.nextSibling);
                                    }
                                }
                            }
                        } else {
                            console.error(`❌ [Admin] Carte console ${consoleId} non trouvée dans le DOM!`);
                        }
                    } else {
                        this.showToast('Erreur lors de la mise à jour', 'error');
                        // Remettre le toggle à son état précédent
                        target.checked = !isAvailable;
                        target.disabled = false;
                    }
                } catch (error) {
                    console.error('❌ [Admin] Erreur lors de la mise à jour:', error);
                    console.error('❌ [Admin] Stack:', error.stack);
                    this.showToast(error.message || 'Erreur lors de la mise à jour', 'error');
                    // Remettre le toggle à son état précédent
                    target.checked = !isAvailable;
                    target.disabled = false;
                }
            });
            
            // Event listener sur le label pour capturer les clics et s'assurer que le changement se produit
            const label = toggle.closest('label');
            if (label) {
                label.addEventListener('click', (e) => {
                    // Si le toggle est désactivé, empêcher le clic
                    if (toggle.disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🚫 [Admin] Toggle désactivé pour console ${consoleId}`);
                        return;
                    }
                    console.log(`🖱️ [Admin] Label cliqué pour console ${consoleId}, état avant: ${toggle.checked}`);
                    // Le changement du checkbox sera automatiquement déclenché par le navigateur
                    // On attend un peu pour que le changement se produise
                    setTimeout(() => {
                        console.log(`🖱️ [Admin] État après clic: ${toggle.checked}`);
                    }, 10);
                });
            }
            
            // Ajouter aussi un listener sur le span slider pour s'assurer que le clic fonctionne
            const slider = toggle.nextElementSibling;
            if (slider && slider.classList.contains('admin-toggle-slider')) {
                slider.addEventListener('click', (e) => {
                    if (!toggle.disabled) {
                        console.log(`🖱️ [Admin] Slider cliqué pour console ${consoleId}`);
                        // Déclencher manuellement le changement si nécessaire
                        toggle.click();
                    } else {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }
        });
        
        // Event listeners pour la recherche de numéros
        const searchScanNumberInput = document.getElementById('searchScanNumber');
        if (searchScanNumberInput) {
            searchScanNumberInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.trim().toLowerCase();
                const items = document.querySelectorAll('.allowed-scan-number-item');
                const noResultsMsg = document.getElementById('noScanNumbersFound');
                const listContainer = document.getElementById('allowedScanNumbersList');
                let visibleCount = 0;
                
                items.forEach(item => {
                    const scanNumber = item.dataset.scanNumber || '';
                    if (searchTerm === '' || scanNumber.toLowerCase().includes(searchTerm)) {
                        item.style.display = 'flex';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Afficher/masquer le message "aucun résultat"
                if (noResultsMsg) {
                    if (visibleCount === 0 && searchTerm !== '') {
                        noResultsMsg.style.display = 'block';
                        if (listContainer) {
                            listContainer.style.display = 'none';
                        }
                    } else {
                        noResultsMsg.style.display = 'none';
                        if (listContainer) {
                            listContainer.style.display = 'flex';
                        }
                    }
                }
                
                // Mettre à jour le compteur
                const countElement = document.getElementById('scanNumbersCount');
                if (countElement) {
                    const totalCount = items.length;
                    if (searchTerm === '') {
                        countElement.textContent = `${totalCount} numéro${totalCount > 1 ? 's' : ''}`;
                    } else {
                        countElement.textContent = `${visibleCount}/${totalCount} trouvé${visibleCount > 1 ? 's' : ''}`;
                    }
                }
            });
        }
        
        // Event listeners pour la gestion des numéros autorisés
        const addScanNumberBtn = document.getElementById('addScanNumberBtn');
        const newScanNumberInput = document.getElementById('newScanNumber');
        const scanBarcodeAdminBtn = document.getElementById('scanBarcodeAdminBtn');
        const removeScanNumberBtns = document.querySelectorAll('.remove-scan-number-btn');
        
        // Bouton de scan dans l'admin
        if (scanBarcodeAdminBtn) {
            scanBarcodeAdminBtn.addEventListener('click', () => {
                this.scanMode = 'admin'; // Mode spécial pour l'admin
                this.startBarcodeScan();
            });
        }
        
        if (addScanNumberBtn && newScanNumberInput) {
            addScanNumberBtn.addEventListener('click', async () => {
                const scanNumber = newScanNumberInput.value.trim();
                
                if (!scanNumber) {
                    this.showToast('Veuillez entrer un numéro', 'error');
                    return;
                }
                
                // Valider le format
                if (!/^8\d{6}$/.test(scanNumber)) {
                    this.showToast('Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908)', 'error');
                    newScanNumberInput.focus();
                    return;
                }
                
                try {
                    addScanNumberBtn.disabled = true;
                    addScanNumberBtn.textContent = '⏳ Ajout...';
                    
                    const result = await this.reservationManager.addAllowedScanNumber(scanNumber);
                    
                    if (result.success) {
                        this.showToast('Numéro ajouté avec succès', 'success');
                        newScanNumberInput.value = '';
                        // Recharger les numéros autorisés et mettre à jour l'affichage
                        this.allowedScanNumbers = result.allowedScanNumbers;
                        // Recharger le modal admin pour afficher la nouvelle liste
                        await this.showAdminModal();
                        // Réinitialiser la recherche après rechargement
                        const searchInput = document.getElementById('searchScanNumber');
                        if (searchInput) {
                            searchInput.value = '';
                        }
                    }
                } catch (error) {
                    this.showToast(error.message || 'Erreur lors de l\'ajout du numéro', 'error');
                } finally {
                    addScanNumberBtn.disabled = false;
                    addScanNumberBtn.textContent = '➕ Ajouter';
                }
            });
            
            // Permettre l'ajout avec Entrée
            newScanNumberInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addScanNumberBtn.click();
                }
            });
        }
        
        removeScanNumberBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (btn.disabled) return;
                
                const scanNumber = btn.dataset.scanNumber;
                if (!scanNumber) return;
                
                if (!confirm(`Êtes-vous sûr de vouloir supprimer le numéro ${scanNumber} ?`)) {
                    return;
                }
                
                try {
                    btn.disabled = true;
                    btn.textContent = '⏳ Suppression...';
                    
                    const result = await this.reservationManager.removeAllowedScanNumber(scanNumber);
                    
                    if (result.success) {
                        this.showToast('Numéro supprimé avec succès', 'success');
                        // Recharger les numéros autorisés et mettre à jour l'affichage
                        this.allowedScanNumbers = result.allowedScanNumbers;
                        // Recharger le modal admin pour afficher la nouvelle liste
                        await this.showAdminModal();
                        // Réinitialiser la recherche après rechargement
                        const searchInput = document.getElementById('searchScanNumber');
                        if (searchInput) {
                            searchInput.value = '';
                        }
                    }
                } catch (error) {
                    this.showToast(error.message || 'Erreur lors de la suppression du numéro', 'error');
                    btn.disabled = false;
                    btn.textContent = '🗑️ Supprimer';
                }
            });
        });
        
        modal.classList.add('active');
    }

    setupReservationManagementButtons() {
        // Gérer les boutons dans les cartes de console (réservataires suivants)
        document.querySelectorAll('.btn-manage-reservation').forEach(btn => {
            // Supprimer les anciens event listeners en clonant le bouton
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                const reservationId = newBtn.getAttribute('data-reservation-id');
                const action = newBtn.getAttribute('data-action');
                
                // Trouver la réservation
                const reservations = await this.reservationManager.loadReservations();
                const reservation = reservations.find(r => r.id === reservationId);
                
                if (!reservation) {
                    this.showToast('Réservation non trouvée', 'error');
                    return;
                }
                
                // Trouver la console associée
                const consoles = await this.reservationManager.loadConsoles();
                const gameConsole = consoles.find(c => c.id === reservation.consoleId);
                
                if (!gameConsole) {
                    this.showToast('Console non trouvée', 'error');
                    return;
                }
                
                if (action === 'modify') {
                    // Demander le PIN pour modifier
                    const pin = await this.askForPIN('Pour modifier cette réservation, entre ton code PIN :');
                    if (!pin) return;
                    
                    try {
                        // Vérifier le PIN
                        const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/verify-pin`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            mode: 'cors',
                            cache: 'no-cache',
                            body: JSON.stringify({ pin: String(pin).trim() })
                        });
                        
                        const data = await response.json();
                        if (!data.success) {
                            this.showToast('Code PIN incorrect', 'error');
                            return;
                        }
                        
                        // Ouvrir le formulaire de modification
                        this.showModifyReservationModal(gameConsole, reservation, String(pin).trim());
                    } catch (error) {
                        this.showToast('Erreur lors de la vérification du PIN', 'error');
                    }
                } else if (action === 'delete') {
                    // Demander le PIN pour supprimer
                    const pin = await this.askForPIN('Pour supprimer cette réservation, entre ton code PIN :');
                    if (!pin) return;
                    
                    try {
                        await this.reservationManager.cancelReservation(reservationId, String(pin).trim());
                        this.showToast('Réservation supprimée. Les heures des réservations suivantes ont été recalculées.', 'success');
                        await this.renderConsoles();
                        await this.renderReservationsTable();
                    } catch (error) {
                        this.showToast(error.message || 'Erreur lors de la suppression. Code PIN incorrect ?', 'error');
                    }
                }
            });
        });
        
        // Gérer les boutons dans le tableau des réservations
        document.querySelectorAll('.btn-manage-reservation-table').forEach(btn => {
            // Supprimer les anciens event listeners en clonant le bouton
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                const reservationId = newBtn.getAttribute('data-reservation-id');
                const action = newBtn.getAttribute('data-action');
                
                // Trouver la réservation
                const reservations = await this.reservationManager.loadReservations();
                const reservation = reservations.find(r => r.id === reservationId);
                
                if (!reservation) {
                    this.showToast('Réservation non trouvée', 'error');
                    return;
                }
                
                // Trouver la console associée
                const consoles = await this.reservationManager.loadConsoles();
                const gameConsole = consoles.find(c => c.id === reservation.consoleId);
                
                if (!gameConsole) {
                    this.showToast('Console non trouvée', 'error');
                    return;
                }
                
                if (action === 'modify') {
                    // Demander le PIN pour modifier
                    const pin = await this.askForPIN('Pour modifier cette réservation, entre ton code PIN :');
                    if (!pin) return;
                    
                    try {
                        // Vérifier le PIN
                        const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/verify-pin`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            mode: 'cors',
                            cache: 'no-cache',
                            body: JSON.stringify({ pin: String(pin).trim() })
                        });
                        
                        const data = await response.json();
                        if (!data.success) {
                            this.showToast('Code PIN incorrect', 'error');
                            return;
                        }
                        
                        // Ouvrir le formulaire de modification
                        this.showModifyReservationModal(gameConsole, reservation, String(pin).trim());
                    } catch (error) {
                        this.showToast('Erreur lors de la vérification du PIN', 'error');
                    }
                } else if (action === 'delete') {
                    // Demander le PIN pour supprimer
                    const pin = await this.askForPIN('Pour supprimer cette réservation, entre ton code PIN :');
                    if (!pin) return;
                    
                    try {
                        await this.reservationManager.cancelReservation(reservationId, String(pin).trim());
                        this.showToast('Réservation supprimée. Les heures des réservations suivantes ont été recalculées.', 'success');
                        await this.renderConsoles();
                        await this.renderReservationsTable();
                    } catch (error) {
                        this.showToast(error.message || 'Erreur lors de la suppression. Code PIN incorrect ?', 'error');
                    }
                }
            });
        });
    }
    
    setupBulkDeleteReservations() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const deleteBtn = document.getElementById('deleteSelectedPastReservationsBtn');
        const selectedCountSpan = document.getElementById('selectedCount');
        
        // Fonction pour mettre à jour le compteur et l'état du bouton
        const updateSelectionState = () => {
            // Ne pas mettre à jour si on est en train de restaurer l'état
            if (selectAllCheckbox && selectAllCheckbox.dataset.restoring) {
                return;
            }
            
            const checkboxes = document.querySelectorAll('.reservation-checkbox:checked');
            const count = checkboxes.length;
            
            if (selectedCountSpan) {
                if (count > 0) {
                    selectedCountSpan.textContent = `${count} réservation(s) sélectionnée(s)`;
                    selectedCountSpan.style.display = 'block';
                } else {
                    selectedCountSpan.style.display = 'none';
                }
            }
            
            if (deleteBtn) {
                deleteBtn.disabled = count === 0;
                deleteBtn.style.opacity = count === 0 ? '0.5' : '1';
                deleteBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
            }
            
            // Mettre à jour l'état de "Sélectionner tout"
            if (selectAllCheckbox) {
                const allCheckboxes = document.querySelectorAll('.reservation-checkbox');
                const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            }
        };
        
        // Event listener pour "Sélectionner tout" (éviter les doublons)
        if (selectAllCheckbox) {
            // Supprimer les anciens listeners pour éviter les doublons
            const newSelectAllCheckbox = selectAllCheckbox.cloneNode(true);
            selectAllCheckbox.parentNode.replaceChild(newSelectAllCheckbox, selectAllCheckbox);
            
            newSelectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                // Utiliser requestAnimationFrame pour s'assurer que l'état est bien appliqué
                requestAnimationFrame(() => {
                    document.querySelectorAll('.reservation-checkbox').forEach(checkbox => {
                        checkbox.checked = isChecked;
                    });
                    // Mettre à jour l'état après un court délai pour s'assurer que les checkboxes sont bien mises à jour
                    setTimeout(() => {
                        updateSelectionState();
                    }, 10);
                });
            });
        }
        
        // Event listeners pour les cases individuelles (avec gestion pour éviter les doublons)
        const setupCheckboxListeners = () => {
            document.querySelectorAll('.reservation-checkbox').forEach(checkbox => {
                // Vérifier si le listener existe déjà pour éviter les doublons
                if (!checkbox.dataset.listenerAdded) {
                    checkbox.addEventListener('change', updateSelectionState);
                    checkbox.dataset.listenerAdded = 'true';
                }
            });
        };
        setupCheckboxListeners();
        
        // Event listener pour le bouton de suppression en masse (éviter les doublons)
        if (deleteBtn) {
            // Supprimer les anciens listeners pour éviter les doublons
            const newDeleteBtn = deleteBtn.cloneNode(true);
            deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
            
            newDeleteBtn.addEventListener('click', async () => {
                const selectedCheckboxes = document.querySelectorAll('.reservation-checkbox:checked');
                const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-reservation-id'));
                
                if (selectedIds.length === 0) {
                    this.showToast('Aucune réservation sélectionnée', 'error');
                    return;
                }
                
                // Demander confirmation
                const confirmed = confirm(
                    `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} réservation(s) passée(s) ?\n\nCette action est irréversible.`
                );
                
                if (!confirmed) {
                    return;
                }
                
                // Demander le code PIN administrateur
                let pin;
                try {
                    pin = await this.askForPIN('Entrez le code PIN administrateur pour confirmer la suppression :');
                    
                    // Attendre un peu pour s'assurer que le modal est bien fermé
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // S'assurer que le modal PIN est bien fermé immédiatement après la saisie
                    const pinModal = document.getElementById('pinModal');
                    if (pinModal) {
                        try {
                            if (pinModal.parentNode) {
                                pinModal.parentNode.removeChild(pinModal);
                            }
                            // Aussi retirer la classe active au cas où
                            pinModal.classList.remove('active');
                        } catch (e) {
                            // Ignorer si déjà supprimé
                            console.log('Modal PIN déjà supprimé:', e);
                        }
                    }
                    
                    if (!pin) {
                        return;
                    }
                    
                    if (pin !== this.adminPIN) {
                        this.showToast('Code PIN incorrect', 'error');
                        return;
                    }
                } catch (error) {
                    console.error('Erreur lors de la demande du PIN:', error);
                    this.showToast('Erreur lors de la demande du code PIN', 'error');
                    
                    // S'assurer que le modal PIN est fermé même en cas d'erreur
                    const pinModal = document.getElementById('pinModal');
                    if (pinModal) {
                        try {
                            if (pinModal.parentNode) {
                                pinModal.parentNode.removeChild(pinModal);
                            }
                            pinModal.classList.remove('active');
                        } catch (e) {
                            // Ignorer si déjà supprimé
                        }
                    }
                    return;
                }
                
                // Désactiver le bouton pendant la suppression
                const btnToDisable = document.getElementById('deleteSelectedPastReservationsBtn') || newDeleteBtn;
                btnToDisable.disabled = true;
                const originalText = btnToDisable.textContent;
                btnToDisable.textContent = '⏳ Suppression en cours...';
                
                try {
                    // Supprimer les réservations une par une avec gestion d'erreur robuste
                    let successCount = 0;
                    let failCount = 0;
                    
                    for (let i = 0; i < selectedIds.length; i++) {
                        const reservationId = selectedIds[i];
                        try {
                            // Mettre à jour le texte du bouton avec le progrès
                            const btnToUpdate = document.getElementById('deleteSelectedPastReservationsBtn');
                            if (btnToUpdate) {
                                btnToUpdate.textContent = `⏳ Suppression ${i + 1}/${selectedIds.length}...`;
                            }
                            
                            // Appeler la suppression avec timeout
                            const deletePromise = this.reservationManager.cancelReservation(reservationId, pin);
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 10000)
                            );
                            
                            await Promise.race([deletePromise, timeoutPromise]);
                            successCount++;
                            
                            // Petit délai pour éviter de surcharger le serveur
                            if (i < selectedIds.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 200));
                            }
                        } catch (error) {
                            console.error(`Erreur lors de la suppression de la réservation ${reservationId}:`, error);
                            failCount++;
                            // Continuer avec la suppression suivante même en cas d'erreur
                        }
                    }
                    
                    // Afficher le résultat
                    if (successCount > 0) {
                        this.showToast(
                            `${successCount} réservation(s) supprimée(s)${failCount > 0 ? `, ${failCount} erreur(s)` : ''}`,
                            failCount > 0 ? 'warning' : 'success'
                        );
                    } else {
                        this.showToast('Aucune réservation n\'a pu être supprimée', 'error');
                    }
                    
                    // Attendre un peu avant de recharger pour laisser le temps aux suppressions de se terminer
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Recharger le tableau avec gestion d'erreur
                    try {
                        await this.renderReservationsTable();
                    } catch (renderError) {
                        console.error('Erreur lors du rechargement du tableau:', renderError);
                        // Ne pas bloquer si le rechargement échoue, juste logger
                    }
                    
                } catch (error) {
                    console.error('Erreur lors de la suppression en masse:', error);
                    this.showToast('Erreur lors de la suppression en masse: ' + (error.message || 'Erreur inconnue'), 'error');
                } finally {
                    // S'assurer que le modal PIN est bien fermé
                    try {
                        const pinModal = document.getElementById('pinModal');
                        if (pinModal && pinModal.parentNode) {
                            pinModal.parentNode.removeChild(pinModal);
                        }
                    } catch (e) {
                        // Ignorer si déjà supprimé ou erreur
                        console.log('Modal PIN déjà fermé ou erreur:', e);
                    }
                    
                    // Restaurer le bouton
                    try {
                        const btnToRestore = document.getElementById('deleteSelectedPastReservationsBtn');
                        if (btnToRestore) {
                            btnToRestore.disabled = false;
                            btnToRestore.textContent = originalText;
                        }
                    } catch (e) {
                        console.error('Erreur lors de la restauration du bouton:', e);
                    }
                    
                    // Réinitialiser l'état de sélection
                    try {
                        updateSelectionState();
                    } catch (stateError) {
                        console.error('Erreur lors de la mise à jour de l\'état:', stateError);
                    }
                }
            });
        }
        
        // Initialiser l'état (seulement si on n'est pas en train de restaurer)
        if (!selectAllCheckbox || !selectAllCheckbox.dataset.restoring) {
            updateSelectionState();
        }
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

