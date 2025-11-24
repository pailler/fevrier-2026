// Modèle de données
class GameConsole {
    constructor(id, name, type, isAvailable = true, currentReservation = null) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.isAvailable = isAvailable;
        this.currentReservation = currentReservation;
    }
}

class Reservation {
    constructor(id, consoleId, userName, startDate, endDate) {
        this.id = id;
        this.consoleId = consoleId;
        this.userName = userName;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }
}

// Gestionnaire de réservations
class ReservationManager {
    constructor() {
        this.consoles = [];
        this.reservations = [];
        this.loadData();
        this.initializeDefaultConsolesIfNeeded();
    }

    loadData() {
        // Charger les consoles
        const savedConsoles = localStorage.getItem('gameConsoles');
        if (savedConsoles) {
            const parsed = JSON.parse(savedConsoles);
            this.consoles = parsed.map(c => {
                const console = new GameConsole(c.id, c.name, c.type, c.isAvailable, c.currentReservation);
                if (console.currentReservation) {
                    console.currentReservation = new Reservation(
                        console.currentReservation.id,
                        console.currentReservation.consoleId,
                        console.currentReservation.userName,
                        console.currentReservation.startDate,
                        console.currentReservation.endDate
                    );
                }
                return console;
            });
        }

        // Charger les réservations
        const savedReservations = localStorage.getItem('reservations');
        if (savedReservations) {
            const parsed = JSON.parse(savedReservations);
            this.reservations = parsed.map(r => 
                new Reservation(r.id, r.consoleId, r.userName, r.startDate, r.endDate)
            );
        }

        this.syncConsolesWithReservations();
    }

    saveData() {
        // Sauvegarder les consoles
        localStorage.setItem('gameConsoles', JSON.stringify(this.consoles));
        
        // Sauvegarder les réservations
        localStorage.setItem('reservations', JSON.stringify(this.reservations));
    }

    syncConsolesWithReservations() {
        const now = new Date();
        
        this.consoles.forEach(console => {
            // Trouver les réservations actives pour cette console
            const activeReservation = this.reservations.find(res => 
                res.consoleId === console.id && 
                new Date(res.endDate) > now
            );

            if (activeReservation) {
                console.isAvailable = false;
                console.currentReservation = activeReservation;
            } else {
                console.isAvailable = true;
                console.currentReservation = null;
            }
        });

        this.saveData();
    }

    initializeDefaultConsolesIfNeeded() {
        if (this.consoles.length === 0) {
            const defaultConsoles = [
                new GameConsole(this.generateId(), 'PlayStation 4 - Console 1', 'PlayStation 4'),
                new GameConsole(this.generateId(), 'PlayStation 4 - Console 2', 'PlayStation 4'),
                new GameConsole(this.generateId(), 'Xbox One - Console 1', 'Xbox One'),
                new GameConsole(this.generateId(), 'Nintendo Switch - Console 1', 'Nintendo Switch'),
                new GameConsole(this.generateId(), 'PlayStation 5 - Console 1', 'PlayStation 5')
            ];

            this.consoles = defaultConsoles;
            this.saveData();
        }
    }

    getAllConsoles() {
        this.syncConsolesWithReservations();
        return this.consoles;
    }

    getConsole(byId) {
        return this.consoles.find(c => c.id === byId);
    }

    createReservation(reservation) {
        const console = this.getConsole(reservation.consoleId);
        
        if (!console) {
            return false;
        }

        if (!console.isAvailable) {
            return false;
        }

        // Vérifier les conflits de dates
        const conflictingReservations = this.reservations.filter(res => 
            res.consoleId === reservation.consoleId &&
            new Date(res.endDate) > new Date(reservation.startDate) &&
            new Date(res.startDate) < new Date(reservation.endDate)
        );

        if (conflictingReservations.length > 0) {
            return false;
        }

        // Créer la réservation
        this.reservations.push(reservation);

        // Mettre à jour la console
        console.isAvailable = false;
        console.currentReservation = reservation;
        
        this.saveData();
        return true;
    }

    cancelReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        
        if (!reservation) {
            return false;
        }

        // Retirer la réservation
        this.reservations = this.reservations.filter(r => r.id !== reservationId);

        // Libérer la console
        const console = this.getConsole(reservation.consoleId);
        if (console) {
            console.isAvailable = true;
            console.currentReservation = null;
        }

        this.saveData();
        return true;
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Application principale
class App {
    constructor() {
        this.reservationManager = new ReservationManager();
        this.currentConsole = null;
        this.init();
    }

    init() {
        this.renderConsoles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Bouton refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.renderConsoles();
            this.showToast('Liste actualisée', 'success');
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
        document.getElementById('reservationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReservation();
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
    }

    renderConsoles() {
        const consoles = this.reservationManager.getAllConsoles();
        const container = document.getElementById('consolesList');
        
        container.innerHTML = '';

        if (consoles.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Aucune console disponible</p>';
            return;
        }

        consoles.forEach(console => {
            const card = document.createElement('div');
            card.className = `console-card ${console.isAvailable ? 'available' : 'reserved'}`;
            
            card.innerHTML = `
                <div>
                    <div class="console-name">${console.name}</div>
                    <div class="console-type">${console.type}</div>
                    <div class="console-status ${console.isAvailable ? 'available' : 'reserved'}">
                        ${console.isAvailable ? '✅ Disponible' : '❌ Réservée'}
                    </div>
                    ${!console.isAvailable && console.currentReservation ? `
                        <div class="reservation-info">
                            Réservée par: <strong>${console.currentReservation.userName}</strong><br>
                            Jusqu'au: ${this.formatDate(console.currentReservation.endDate)}
                        </div>
                    ` : ''}
                </div>
            `;

            card.addEventListener('click', () => {
                this.showConsoleDetails(console);
            });

            container.appendChild(card);
        });
    }

    showConsoleDetails(console) {
        this.currentConsole = console;

        if (console.isAvailable) {
            this.showReservationModal(console);
        } else {
            this.showDetailsModal(console);
        }
    }

    showReservationModal(console) {
        const modal = document.getElementById('reservationModal');
        const title = document.getElementById('modalTitle');
        const info = document.getElementById('consoleInfo');
        const form = document.getElementById('reservationForm');

        title.textContent = `Réserver: ${console.name}`;
        info.innerHTML = `
            <h3>${console.name}</h3>
            <p>Type: ${console.type}</p>
        `;

        // Définir les dates par défaut
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0, 0, 0);

        document.getElementById('startDate').value = this.formatDateTimeLocal(now);
        document.getElementById('endDate').value = this.formatDateTimeLocal(tomorrow);
        document.getElementById('userName').value = '';

        modal.classList.add('active');
        form.reset();
    }

    showDetailsModal(console) {
        const modal = document.getElementById('detailsModal');
        const title = document.getElementById('detailsModalTitle');
        const details = document.getElementById('consoleDetails');
        const reservationDetails = document.getElementById('reservationDetails');
        const actions = document.getElementById('detailsActions');

        title.textContent = console.name;
        details.innerHTML = `
            <h3>${console.name}</h3>
            <p>Type: ${console.type}</p>
            <p><strong>Statut: Réservée</strong></p>
        `;

        if (console.currentReservation) {
            const res = console.currentReservation;
            reservationDetails.innerHTML = `
                <h4>Détails de la réservation</h4>
                <p><strong>Réservée par:</strong> ${res.userName}</p>
                <p><strong>Du:</strong> ${this.formatDate(res.startDate)}</p>
                <p><strong>Au:</strong> ${this.formatDate(res.endDate)}</p>
            `;

            actions.innerHTML = `
                <button class="btn btn-danger" id="cancelReservationBtn">Annuler la réservation</button>
            `;

            document.getElementById('cancelReservationBtn').addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
                    this.reservationManager.cancelReservation(res.id);
                    this.showToast('Réservation annulée', 'success');
                    this.closeModal('detailsModal');
                    this.renderConsoles();
                }
            });
        }

        modal.classList.add('active');
    }

    handleReservation() {
        const userName = document.getElementById('userName').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!userName) {
            this.showToast('Veuillez entrer votre nom', 'error');
            return;
        }

        if (!startDate || !endDate) {
            this.showToast('Veuillez sélectionner les dates', 'error');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            this.showToast('La date de fin doit être après la date de début', 'error');
            return;
        }

        const reservation = new Reservation(
            this.reservationManager.generateId(),
            this.currentConsole.id,
            userName,
            start,
            end
        );

        if (this.reservationManager.createReservation(reservation)) {
            this.showToast('Réservation créée avec succès !', 'success');
            this.closeModal('reservationModal');
            this.renderConsoles();
        } else {
            this.showToast('Impossible de créer la réservation. La console est peut-être déjà réservée.', 'error');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
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
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

