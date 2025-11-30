const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware CORS avec configuration complète
app.use(cors({
    origin: '*', // Autoriser toutes les origines (peut être restreint en production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cache-Control',
        'Pragma',
        'Expires',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Gérer les requêtes OPTIONS (preflight) pour CORS
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de débogage pour voir toutes les requêtes
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

// Initialiser le fichier de données s'il n'existe pas
function initializeDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const defaultData = {
            consoles: [
                { id: '1', name: 'Switch2 : manette N°1', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '2', name: 'Switch2 : manette N°2', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '3', name: 'Switch2 : manette N°3', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '4', name: 'PS4 : manette N°1', type: 'Manette PS4', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '5', name: 'Casque VR Quest3 N°2', type: 'Casque VR', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '6', name: 'Emprunt d\'un casque audio', type: 'Casque audio', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
                { id: '7', name: 'Switch2 : manette N°4', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] }
            ],
            reservations: [],
            operations: [], // Historique des opérations
            allowedScanNumbers: ['8012908', '8012909', '8012910', '8012911'] // Numéros autorisés pour les réservations
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Fonction pour initialiser les données par défaut
function initializeDefaultData() {
    return {
        consoles: [
            { id: '1', name: 'Switch2 : manette N°1', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '2', name: 'Switch2 : manette N°2', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '3', name: 'Switch2 : manette N°3', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '4', name: 'PS4 : manette N°1', type: 'Manette PS4', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '5', name: 'Casque VR Quest3 N°2', type: 'Casque VR', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '6', name: 'Emprunt d\'un casque audio', type: 'Casque audio', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] },
            { id: '7', name: 'Switch2 : manette N°4', type: 'Manette Switch', isAvailable: true, currentReservation: null, allowedDurations: [10, 30, 60] }
        ],
        reservations: [],
        operations: [], // Historique des opérations
        allowedScanNumbers: ['8012908', '8012909', '8012910', '8012911'] // Numéros autorisés pour les réservations
    };
}

// Fonction pour enregistrer une opération dans l'historique
function logOperation(data, operation) {
    if (!data.operations) {
        data.operations = [];
    }
    
    const operationEntry = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: operation.type, // 'reservation_created', 'reservation_cancelled', 'reservation_validated', 'reservation_auto_cancelled', 'console_disabled', 'console_enabled'
        timestamp: new Date().toISOString(),
        details: operation.details || {}
    };
    
    data.operations.push(operationEntry);
    
    // Limiter l'historique à 1000 opérations (garder les plus récentes)
    if (data.operations.length > 1000) {
        data.operations = data.operations.slice(-1000);
    }
    
    console.log(`[LOG] Opération enregistrée: ${operation.type}`, operationEntry);
    
    return operationEntry;
}

// Lire les données
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture données:', error);
        return { consoles: [], reservations: [] };
    }
}

// Écrire les données
function writeData(data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(DATA_FILE, jsonData, 'utf8');
        // Vérifier que l'écriture a fonctionné
        const writtenData = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(writtenData);
        console.log(`[writeData] Données sauvegardées: ${parsed.consoles.length} consoles`);
        parsed.consoles.forEach(c => {
            console.log(`[writeData] Console ${c.id} (${c.name}): isAvailable=${c.isAvailable}`);
        });
        return true;
    } catch (error) {
        console.error('Erreur écriture données:', error);
        return false;
    }
}

// Synchroniser les consoles avec les réservations et annuler les non validées
// IMPORTANT: Cette fonction ne doit PAS modifier isAvailable pour les consoles désactivées manuellement
// Elle doit seulement gérer les réservations actives
function syncConsoles(data, preserveManualDisable = {}) {
    const now = new Date();
    
    // Annuler automatiquement les réservations non validées après 5 minutes de grâce
    data.reservations = data.reservations.filter(res => {
        const startDate = new Date(res.startDate);
        const gracePeriod = 5 * 60 * 1000; // 5 minutes
        const graceEnd = new Date(startDate.getTime() + gracePeriod);
        
        // Si la réservation a dépassé la période de grâce et n'est pas validée, l'annuler
        if (now > graceEnd && !res.isValidated) {
            console.log(`Annulation automatique de la réservation ${res.id} (non validée après ${Math.round((now - graceEnd) / (1000 * 60))} min)`);
            
            // Enregistrer l'annulation automatique
            const consoleName = data.consoles.find(c => c.id === res.consoleId)?.name || res.consoleId;
            logOperation(data, {
                type: 'reservation_auto_cancelled',
                details: {
                    reservationId: res.id,
                    consoleId: res.consoleId,
                    consoleName: consoleName,
                    userName: res.userName,
                    startDate: res.startDate,
                    endDate: res.endDate,
                    reason: 'Non validée après la période de grâce de 5 minutes'
                }
            });
            
            return false; // Retirer la réservation
        }
        return true;
    });
    
    data.consoles.forEach(gameConsole => {
        const activeReservation = data.reservations.find(res => 
            res.consoleId === gameConsole.id && 
            new Date(res.endDate) > now
        );

        if (activeReservation) {
            // Si une réservation est active, la console est forcément indisponible
            gameConsole.isAvailable = false;
            gameConsole.currentReservation = activeReservation;
        } else {
            // Pas de réservation active
            gameConsole.currentReservation = null;
            
            // Vérifier si la console était désactivée manuellement AVANT syncConsoles
            const wasManuallyDisabled = preserveManualDisable[gameConsole.id] === true;
            
            if (wasManuallyDisabled) {
                // Console désactivée manuellement, préserver l'état
                gameConsole.isAvailable = false;
                console.log(`[syncConsoles] Console ${gameConsole.name} désactivée manuellement, état préservé (isAvailable=false)`);
            } else {
                // Console disponible par défaut (pas de réservation active et pas désactivée manuellement)
                gameConsole.isAvailable = true;
                console.log(`[syncConsoles] Console ${gameConsole.name} sans réservation active, mise à disponible (isAvailable=true)`);
            }
        }
    });
    
    return data;
}

// ============================================
// ROUTES API - DOIVENT ÊTRE AVANT LE MIDDLEWARE STATIC
// ============================================

// GET /api/health - Health check (PLACÉ EN PREMIER POUR TEST)
app.get('/api/health', (req, res) => {
    console.log('[HEALTH] Requête reçue sur /api/health');
    console.log('[HEALTH] Headers:', req.headers);
    console.log('[HEALTH] Path:', req.path);
    console.log('[HEALTH] OriginalUrl:', req.originalUrl);
    res.json({ 
        success: true, 
        message: 'Backend opérationnel',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// GET /api/consoles - Liste toutes les consoles
app.get('/api/consoles', (req, res) => {
    let data = readData();
    
    // Initialiser les données si vides
    if (!data.consoles || data.consoles.length === 0) {
        data = initializeDefaultData();
        writeData(data);
    }
    
    // Ajouter les consoles manquantes depuis initializeDefaultData
    const defaultData = initializeDefaultData();
    const existingIds = new Set(data.consoles.map(c => c.id));
    defaultData.consoles.forEach(defaultConsole => {
        if (!existingIds.has(defaultConsole.id)) {
            console.log(`[GET /api/consoles] Ajout de la console manquante: ${defaultConsole.name} (ID: ${defaultConsole.id})`);
            data.consoles.push({
                id: defaultConsole.id,
                name: defaultConsole.name,
                type: defaultConsole.type,
                isAvailable: defaultConsole.isAvailable,
                currentReservation: null,
                allowedDurations: defaultConsole.allowedDurations
            });
        }
    });
    
    // Appeler syncConsoles mais avec une logique qui préserve les désactivations manuelles
    // Sauvegarder l'état actuel de isAvailable et allowedDurations avant syncConsoles pour chaque console
    const consoleState = {};
    const preserveManualDisable = {};
    data.consoles.forEach(c => {
        consoleState[c.id] = {
            isAvailable: c.isAvailable,
            allowedDurations: c.allowedDurations || [10, 30, 60] // Préserver les durées autorisées
        };
        // Marquer les consoles désactivées manuellement (isAvailable = false ET pas de réservation active)
        if (c.isAvailable === false && !c.currentReservation) {
            preserveManualDisable[c.id] = true;
            console.log(`[GET /api/consoles] Console ${c.id} (${c.name}) marquée comme désactivée manuellement`);
        }
    });
    
    // Appeler syncConsoles en préservant les désactivations manuelles
    data = syncConsoles(data, preserveManualDisable);
    
    // Restaurer les durées autorisées pour chaque console
    data.consoles.forEach(c => {
        const savedState = consoleState[c.id];
        if (savedState) {
            // Restaurer les durées autorisées
            if (!c.allowedDurations || c.allowedDurations.length === 0) {
                c.allowedDurations = savedState.allowedDurations;
            }
        }
    });
    
    // Sauvegarder après la synchronisation (pour les annulations automatiques)
    writeData(data);
    
    // Réorganiser l'ordre des consoles pour l'affichage
    // Ordre souhaité : 1, 2, 3, 7, 4, 5, 6
    const displayOrder = ['1', '2', '3', '7', '4', '5', '6'];
    const orderedConsoles = [];
    const consoleMap = new Map(data.consoles.map(c => [c.id, c]));
    
    // Ajouter les consoles dans l'ordre spécifié
    displayOrder.forEach(id => {
        if (consoleMap.has(id)) {
            orderedConsoles.push(consoleMap.get(id));
        }
    });
    
    // Ajouter les consoles qui ne sont pas dans l'ordre spécifié (au cas où)
    data.consoles.forEach(c => {
        if (!displayOrder.includes(c.id)) {
            orderedConsoles.push(c);
        }
    });
    
    res.json({ success: true, consoles: orderedConsoles });
});

// GET /api/consoles/:id - Obtenir une console spécifique
app.get('/api/consoles/:id', (req, res) => {
    const data = readData();
    const gameConsole = data.consoles.find(c => c.id === req.params.id);
    
    if (!gameConsole) {
        return res.status(404).json({ success: false, message: 'Console non trouvée' });
    }
    
    res.json({ success: true, console: gameConsole });
});

// PUT /api/consoles/:id/availability
app.put('/api/consoles/:id/availability', (req, res) => {
    console.log(`[PUT /api/consoles/:id/availability] Requête reçue pour console ${req.params.id}, isAvailable: ${req.body.isAvailable}`);
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        
        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: 'isAvailable doit être un booléen' 
            });
        }
        
        let data = readData();
        const gameConsole = data.consoles.find(c => c.id === id);
        
        if (!gameConsole) {
            return res.status(404).json({ success: false, message: 'Console non trouvée' });
        }
        
        // Vérifier qu'il n'y a pas de réservation en cours si on désactive
        if (!isAvailable && gameConsole.currentReservation) {
            return res.status(400).json({ 
                success: false, 
                message: 'Impossible de désactiver une console avec une réservation en cours' 
            });
        }
        
        // Mettre à jour la disponibilité
        gameConsole.isAvailable = isAvailable;
        
        // Si on désactive, s'assurer que currentReservation est null
        if (!isAvailable) {
            gameConsole.currentReservation = null;
        }
        
        console.log(`[PUT /api/consoles/:id/availability] Console ${id} mise à jour: isAvailable=${isAvailable}`);
        console.log(`[PUT /api/consoles/:id/availability] Données avant sauvegarde:`, JSON.stringify(data, null, 2));
        
        // Sauvegarder immédiatement AVANT syncConsoles
        if (!writeData(data)) {
            console.error(`[PUT /api/consoles/:id/availability] ERREUR lors de la sauvegarde!`);
            return res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
        }
        
        // Vérifier que la sauvegarde a bien fonctionné
        const savedData = readData();
        const savedConsole = savedData.consoles.find(c => c.id === id);
        if (savedConsole) {
            console.log(`[PUT /api/consoles/:id/availability] Vérification sauvegarde: console ${id} - isAvailable=${savedConsole.isAvailable}`);
            if (savedConsole.isAvailable !== isAvailable) {
                console.error(`[PUT /api/consoles/:id/availability] ERREUR: La sauvegarde n'a pas fonctionné!`);
                // Réessayer la sauvegarde
                gameConsole.isAvailable = isAvailable;
                if (!isAvailable) {
                    gameConsole.currentReservation = null;
                }
                writeData(data);
                console.log(`[PUT /api/consoles/:id/availability] Nouvelle tentative de sauvegarde effectuée`);
            } else {
                console.log(`[PUT /api/consoles/:id/availability] ✅ Sauvegarde confirmée: console ${id} - isAvailable=${savedConsole.isAvailable}`);
            }
        }
        
        res.json({ success: true, console: gameConsole });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la disponibilité:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la mise à jour de la disponibilité',
            error: error.message 
        });
    }
});

// POST /api/consoles - Créer une nouvelle console/objet
app.post('/api/consoles', (req, res) => {
    console.log('[POST /api/consoles] Création d\'une nouvelle console');
    try {
        const { name, type, allowedDurations } = req.body;
        
        // Validation
        if (!name || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le nom et le type sont requis' 
            });
        }
        
        // Vérifier que le nom n'existe pas déjà
        let data = readData();
        const existingConsole = data.consoles.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existingConsole) {
            return res.status(400).json({ 
                success: false, 
                message: 'Une console avec ce nom existe déjà' 
            });
        }
        
        // Générer un nouvel ID unique
        const maxId = Math.max(...data.consoles.map(c => parseInt(c.id) || 0), 0);
        const newId = (maxId + 1).toString();
        
        // Créer la nouvelle console
        const newConsole = {
            id: newId,
            name: name.trim(),
            type: type.trim(),
            isAvailable: true,
            currentReservation: null,
            allowedDurations: allowedDurations && Array.isArray(allowedDurations) && allowedDurations.length > 0 
                ? allowedDurations.sort((a, b) => a - b)
                : [10, 30, 60] // Par défaut
        };
        
        // Ajouter la console
        data.consoles.push(newConsole);
        
        // Enregistrer l'opération
        logOperation(data, {
            type: 'console_created',
            details: {
                consoleId: newId,
                consoleName: newConsole.name,
                consoleType: newConsole.type
            }
        });
        
        writeData(data);
        
        console.log(`[POST /api/consoles] Console créée: ${newConsole.name} (ID: ${newId})`);
        res.json({ success: true, console: newConsole });
    } catch (error) {
        console.error('[POST /api/consoles] Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création de la console', error: error.message });
    }
});

// DELETE /api/consoles/:id - Supprimer une console
app.delete('/api/consoles/:id', (req, res) => {
    console.log(`[DELETE /api/consoles/:id] Suppression de la console ${req.params.id}`);
    try {
        const { id } = req.params;
        let data = readData();
        
        const gameConsole = data.consoles.find(c => c.id === id);
        if (!gameConsole) {
            return res.status(404).json({ success: false, message: 'Console non trouvée' });
        }
        
        // Vérifier qu'il n'y a pas de réservation en cours
        if (gameConsole.currentReservation) {
            return res.status(400).json({ 
                success: false, 
                message: 'Impossible de supprimer une console avec une réservation en cours' 
            });
        }
        
        // Supprimer la console
        data.consoles = data.consoles.filter(c => c.id !== id);
        
        // Enregistrer l'opération
        logOperation(data, {
            type: 'console_deleted',
            details: {
                consoleId: id,
                consoleName: gameConsole.name,
                consoleType: gameConsole.type
            }
        });
        
        writeData(data);
        
        console.log(`[DELETE /api/consoles/:id] Console supprimée: ${gameConsole.name} (ID: ${id})`);
        res.json({ success: true, message: 'Console supprimée avec succès' });
    } catch (error) {
        console.error('[DELETE /api/consoles/:id] Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la console', error: error.message });
    }
});

// PUT /api/consoles/:id/durations - Mettre à jour les durées autorisées d'une console
app.put('/api/consoles/:id/durations', (req, res) => {
    console.log(`[PUT /api/consoles/:id/durations] Requête reçue pour console ${req.params.id}, durations:`, req.body.allowedDurations);
    try {
        const { id } = req.params;
        const { allowedDurations } = req.body;
        
        if (!Array.isArray(allowedDurations) || allowedDurations.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'allowedDurations doit être un tableau non vide' 
            });
        }
        
        // Vérifier que toutes les durées sont des nombres positifs
        if (!allowedDurations.every(d => typeof d === 'number' && d > 0)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Toutes les durées doivent être des nombres positifs' 
            });
        }
        
        let data = readData();
        const gameConsole = data.consoles.find(c => c.id === id);
        
        if (!gameConsole) {
            return res.status(404).json({ success: false, message: 'Console non trouvée' });
        }
        
        // Mettre à jour les durées autorisées
        gameConsole.allowedDurations = allowedDurations.sort((a, b) => a - b); // Trier par ordre croissant
        
        // Sauvegarder
        if (!writeData(data)) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
        }
        
        console.log(`[PUT /api/consoles/:id/durations] ✅ Durées mises à jour pour console ${id}:`, gameConsole.allowedDurations);
        
        res.json({ success: true, console: gameConsole });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des durées:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la mise à jour des durées',
            error: error.message 
        });
    }
});

// GET /api/reservations - Liste toutes les réservations
app.get('/api/reservations', (req, res) => {
    let data = readData();
    
    // Initialiser les données si vides
    if (!data.reservations) {
        data.reservations = [];
        writeData(data);
    }
    
    res.json({ success: true, reservations: data.reservations });
});

// Code PIN administrateur (code universel)
const ADMIN_PIN = '6626';

// Fonction simple de hash pour le PIN (pour ce cas simple)
function hashPIN(pin) {
    // Hash simple pour un PIN à 4 chiffres (pas de sécurité critique ici)
    // S'assurer que le PIN est une string
    const pinString = String(pin).trim();
    let hash = 0;
    for (let i = 0; i < pinString.length; i++) {
        const char = pinString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const result = Math.abs(hash).toString();
    console.log(`[hashPIN] Hash calculé pour PIN "${pinString}":`, result);
    return result;
}

// Fonction pour vérifier si le PIN est le code admin
function isAdminPIN(pin) {
    const pinString = String(pin).trim();
    const result = pinString === ADMIN_PIN;
    console.log(`[isAdminPIN] Vérification: pin="${pinString}", ADMIN_PIN="${ADMIN_PIN}", result=${result}`);
    return result;
}

// POST /api/reservations - Créer une réservation
app.post('/api/reservations', (req, res) => {
    try {
        console.log('[CREATE] Requête reçue:', {
            body: req.body,
            consoleId: req.body.consoleId,
            userName: req.body.userName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            pin: req.body.pin ? '***' : 'manquant',
            scanNumber: req.body.scanNumber ? '***' : 'manquant'
        });
        
        const { consoleId, userName, startDate, endDate, pin, scanNumber } = req.body;
        
        if (!consoleId || !userName || !startDate || !endDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données manquantes: consoleId, userName, startDate, endDate requis' 
            });
        }
        
        // Vérifier le numéro à scanner
        if (!scanNumber || scanNumber.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Le numéro à scanner est requis' 
            });
        }

        // Valider le format du numéro à scanner : 7 chiffres commençant par 8
        const scanNumberPattern = /^8\d{6}$/;
        const scanNumberTrimmed = scanNumber.trim();
        if (!scanNumberPattern.test(scanNumberTrimmed)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908)' 
            });
        }

        // Vérifier que le numéro est dans la liste autorisée
        let data = readData();
        if (!data.allowedScanNumbers) {
            data.allowedScanNumbers = ['8012908', '8012909', '8012910', '8012911'];
            writeData(data);
        }
        const allowedScanNumbers = data.allowedScanNumbers;
        if (!allowedScanNumbers.includes(scanNumberTrimmed)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Numéro non autorisé : ce numéro n\'est pas dans la liste des numéros autorisés' 
            });
        }
        
        // Vérifier le PIN (4 chiffres)
        if (!pin || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Un code PIN de 4 chiffres est requis' 
            });
        }
        
        const now = new Date();
        
        // Vérifier qu'un numéro de scan n'a qu'une seule réservation à la fois (tous modules confondus)
        // IMPORTANT : Cette vérification doit se faire AVANT syncConsoles pour capturer toutes les réservations
        // Si un numéro a déjà un emprunt en cours ou en attente, il ne peut pas réserver autre chose
        const scanActiveReservations = data.reservations.filter(res => {
            // Vérifier que c'est bien le même numéro de scan
            if (!res.scanNumber || res.scanNumber.trim() !== scanNumberTrimmed) {
                return false;
            }
            
            const resEndDate = new Date(res.endDate);
            const resStartDate = new Date(res.startDate);
            const gracePeriod = 5 * 60 * 1000; // 5 minutes
            const graceEnd = new Date(resStartDate.getTime() + gracePeriod);
            
            // Une réservation est considérée comme active si :
            // 1. Elle n'est pas encore terminée (endDate > now) - cela inclut toutes les réservations en cours ou à venir
            // 2. OU elle est non validée et dans la période de grâce - pour éviter les doubles créations rapides
            const isNotFinished = resEndDate > now;
            const isInGracePeriod = !res.isValidated && now <= graceEnd;
            
            // Une réservation est active si elle n'est pas terminée OU si elle est non validée et dans la période de grâce
            const isActive = isNotFinished || isInGracePeriod;
            
            if (isActive) {
                console.log(`[POST /api/reservations] Réservation active trouvée pour le numéro ${scanNumberTrimmed}:`, {
                    id: res.id,
                    consoleId: res.consoleId,
                    userName: res.userName,
                    startDate: res.startDate,
                    endDate: res.endDate,
                    isValidated: res.isValidated,
                    isNotFinished,
                    isInGracePeriod,
                    now: now.toISOString(),
                    resEndDate: resEndDate.toISOString(),
                    graceEnd: graceEnd.toISOString()
                });
            }
            
            return isActive;
        });
        
        if (scanActiveReservations.length > 0) {
            const activeRes = scanActiveReservations[0];
            const activeConsole = data.consoles.find(c => c.id === activeRes.consoleId);
            const consoleName = activeConsole ? activeConsole.name : 'un matériel';
            console.log(`[POST /api/reservations] Blocage: ${scanActiveReservations.length} réservation(s) active(s) pour le numéro ${scanNumberTrimmed}`);
            return res.status(400).json({ 
                success: false, 
                message: `Ce numéro a déjà une réservation en cours sur ${consoleName}. Tu ne peux pas réserver deux matériels à la fois.` 
            });
        }
        
        data = syncConsoles(data, {});
        
        const gameConsole = data.consoles.find(c => c.id === consoleId);
        if (!gameConsole) {
            return res.status(404).json({ success: false, message: 'Console non trouvée' });
        }
        
        // Vérifier que la durée est valide selon les durées autorisées de la console
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationMs = end - start;
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        
        // Utiliser les durées autorisées de la console, ou les durées par défaut
        const allowedDurations = gameConsole.allowedDurations || [10, 30, 60];
        if (!allowedDurations.includes(durationMinutes)) {
            return res.status(400).json({ 
                success: false, 
                message: `La durée doit être l'une des suivantes: ${allowedDurations.map(d => d === 60 ? '1 heure' : `${d} minutes`).join(', ')}` 
            });
        }
        
        // Vérifier que la durée ne dépasse pas le maximum autorisé
        const maxDuration = Math.max(...allowedDurations);
        if (durationMinutes > maxDuration) {
            return res.status(400).json({ 
                success: false, 
                message: `La réservation ne peut pas dépasser ${maxDuration === 60 ? '1 heure' : `${maxDuration} minutes`}` 
            });
        }
        
        if (durationMinutes <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'La date de fin doit être après la date de début' 
            });
        }
        
        // Vérifier les conflits de dates pour cette console
        // On vérifie uniquement les réservations qui sont encore actives (non terminées)
        const conflictingReservations = data.reservations.filter(res => {
            // Ne vérifier que les réservations pour cette console
            if (res.consoleId !== consoleId) return false;
            
            // Ignorer les réservations terminées
            if (new Date(res.endDate) <= now) return false;
            
            // Vérifier le chevauchement : la réservation existante chevauche-t-elle avec la nouvelle ?
            // Conflit si : (fin_existante > début_nouvelle) ET (début_existante < fin_nouvelle)
            const resStart = new Date(res.startDate);
            const resEnd = new Date(res.endDate);
            
            return (resEnd > start) && (resStart < end);
        });
        
        if (conflictingReservations.length > 0) {
            const conflictingRes = conflictingReservations[0];
            const conflictingEnd = new Date(conflictingRes.endDate);
            const conflictingStart = new Date(conflictingRes.startDate);
            return res.status(400).json({ 
                success: false, 
                message: `Conflit de réservation : la console est réservée de ${conflictingStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${conflictingEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` 
            });
        }
        
        // Vérifier la limite de durée d'emprunt : 2 heures par jour maximum
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Début de la journée (00:00:00)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Début du lendemain
        
        // Calculer la durée totale des réservations du numéro de scan pour aujourd'hui
        const scanReservationsToday = data.reservations.filter(res => {
            if (!res.scanNumber || res.scanNumber.trim() !== scanNumberTrimmed) return false;
            
            // Vérifier si la réservation a été créée aujourd'hui
            const resCreatedAt = new Date(res.createdAt || res.startDate);
            resCreatedAt.setHours(0, 0, 0, 0);
            
            return resCreatedAt.getTime() === today.getTime();
        });
        
        // Calculer la durée totale en minutes des réservations d'aujourd'hui
        let totalDurationToday = 0;
        scanReservationsToday.forEach(res => {
            const resStart = new Date(res.startDate);
            const resEnd = new Date(res.endDate);
            const resDuration = Math.round((resEnd - resStart) / (1000 * 60)); // Durée en minutes
            totalDurationToday += resDuration;
        });
        
        // Ajouter la durée de la nouvelle réservation
        const newReservationDuration = durationMinutes;
        const totalDurationWithNew = totalDurationToday + newReservationDuration;
        
        // Limite : 2 heures = 120 minutes
        const maxDurationPerDay = 120; // 2 heures en minutes
        
        if (totalDurationWithNew > maxDurationPerDay) {
            const remainingMinutes = maxDurationPerDay - totalDurationToday;
            if (remainingMinutes <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Tu as déjà atteint la limite de 2 heures d'emprunt pour aujourd'hui. Tu pourras réserver à nouveau demain.` 
                });
            } else {
                const remainingHours = Math.floor(remainingMinutes / 60);
                const remainingMins = remainingMinutes % 60;
                let remainingTimeStr = '';
                if (remainingHours > 0) {
                    remainingTimeStr = `${remainingHours}h${remainingMins > 0 ? remainingMins + 'min' : ''}`;
                } else {
                    remainingTimeStr = `${remainingMins}min`;
                }
                return res.status(400).json({ 
                    success: false, 
                    message: `Limite de 2 heures d'emprunt par jour atteinte. Il te reste ${remainingTimeStr} disponible aujourd'hui.` 
                });
            }
        }
        
        // Vérifier la limite de 2 réservations par jour et par module
        // Réutiliser la variable 'today' déjà déclarée plus haut
        
        const scanReservationsTodayForThisConsole = data.reservations.filter(res => {
            if (!res.scanNumber || res.scanNumber.trim() !== scanNumberTrimmed || res.consoleId !== consoleId) {
                return false;
            }
            
            // Vérifier si la réservation a été créée aujourd'hui
            const resCreatedAt = new Date(res.createdAt || res.startDate);
            resCreatedAt.setHours(0, 0, 0, 0);
            
            return resCreatedAt.getTime() === today.getTime();
        });
        
        if (scanReservationsTodayForThisConsole.length >= 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tu as déjà effectué 2 réservations pour ce module aujourd\'hui. Tu pourras réserver à nouveau demain. Merci de ta compréhension !' 
            });
        }
        
        // Créer la réservation (non validée par défaut)
        // Convertir les dates en tenant compte du fuseau horaire local
        // Si la date est au format datetime-local (YYYY-MM-DDTHH:mm), l'interpréter comme heure locale
        let parsedStartDate, parsedEndDate;
        try {
            // Si le format est datetime-local (sans fuseau horaire), l'interpréter comme heure locale
            if (typeof startDate === 'string' && startDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                // Format datetime-local: YYYY-MM-DDTHH:mm - interpréter comme heure locale
                const [datePart, timePart] = startDate.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                parsedStartDate = new Date(year, month - 1, day, hours, minutes);
            } else {
                parsedStartDate = new Date(startDate);
            }
            
            if (typeof endDate === 'string' && endDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                const [datePart, timePart] = endDate.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                parsedEndDate = new Date(year, month - 1, day, hours, minutes);
            } else {
                parsedEndDate = new Date(endDate);
            }
            
            // Vérifier que les dates sont valides
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                console.error('[CREATE] Dates invalides:', { startDate, endDate, parsedStartDate, parsedEndDate });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Dates invalides' 
                });
            }
        } catch (error) {
            console.error('[CREATE] Erreur lors du parsing des dates:', error, { startDate, endDate });
            return res.status(400).json({ 
                success: false, 
                message: 'Erreur lors du traitement des dates' 
            });
        }
        
        const reservation = {
            id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            consoleId,
            userName,
            startDate: parsedStartDate.toISOString(),
            endDate: parsedEndDate.toISOString(),
            createdAt: new Date().toISOString(),
            isValidated: false,
            pinHash: hashPIN(pin), // Stocker le hash du PIN
            scanNumber: scanNumberTrimmed // Stocker le numéro à scanner (déjà validé et trimé)
        };
        
        console.log(`[CREATE] Réservation créée avec dates:`, {
            reservationId: reservation.id,
            startDateOriginal: startDate,
            startDateParsed: parsedStartDate.toISOString(),
            endDateOriginal: endDate,
            endDateParsed: parsedEndDate.toISOString(),
            now: new Date().toISOString()
        });
        
        console.log(`[CREATE] Réservation créée avec PIN hashé:`, {
            reservationId: reservation.id,
            pin: pin,
            pinHash: reservation.pinHash
        });
        
        data.reservations.push(reservation);
        
        // Enregistrer la création de la réservation
        logOperation(data, {
            type: 'reservation_created',
            details: {
                reservationId: reservation.id,
                consoleId: reservation.consoleId,
                consoleName: gameConsole.name,
                userName: reservation.userName,
                startDate: reservation.startDate,
                endDate: reservation.endDate,
                durationMinutes: durationMinutes,
                scanNumber: reservation.scanNumber
            }
        });
        
        // Sauvegarder AVANT la synchronisation pour garder toutes les réservations
        if (!writeData(data)) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
        }
        
        // Synchroniser après sauvegarde
        data = syncConsoles(data, {});
        
        // Sauvegarder à nouveau après synchronisation
        writeData(data);
        
        res.json({ success: true, reservation });
    } catch (error) {
        console.error('[CREATE] Erreur lors de la création de la réservation:', error);
        console.error('[CREATE] Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la création de la réservation',
            error: error.message 
        });
    }
});

// DELETE /api/reservations/:id - Annuler une réservation
app.delete('/api/reservations/:id', (req, res) => {
    // S'assurer que le PIN est une string et normalisé
    const pin = String(req.body.pin || '').trim();
    
    console.log('[DELETE] PIN reçu:', {
        raw: req.body.pin,
        processed: pin,
        length: pin.length,
        type: typeof pin,
        isValid: /^\d{4}$/.test(pin),
        isAdminCheck: isAdminPIN(pin)
    });
    
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Code PIN requis (4 chiffres)' 
        });
    }
    
    let data = readData();
    
    const reservationIndex = data.reservations.findIndex(r => r.id === req.params.id);
    if (reservationIndex === -1) {
        return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }
    
    const reservation = data.reservations[reservationIndex];
    
    // Vérifier le PIN (admin ou PIN de la réservation)
    // IMPORTANT: Vérifier le code admin EN PREMIER
    const isAdmin = isAdminPIN(pin);
    console.log(`[DELETE] Vérification code admin pour PIN "${pin}":`, {
        pin: pin,
        ADMIN_PIN: ADMIN_PIN,
        isAdmin: isAdmin,
        comparison: pin === ADMIN_PIN
    });
    
    if (isAdmin) {
        // Code admin accepté, procéder à la suppression
        console.log(`[DELETE] Code admin accepté pour réservation ${req.params.id}`);
    } else {
        // Vérifier le PIN de la réservation
        const providedHash = hashPIN(pin);
        const storedHash = reservation.pinHash;
        console.log(`[DELETE] Vérification PIN pour réservation ${req.params.id}:`, {
            pin: pin,
            providedHash: providedHash,
            storedHash: storedHash,
            match: providedHash === storedHash
        });
        
        if (storedHash !== providedHash) {
            return res.status(401).json({ 
                success: false, 
                message: 'Code PIN incorrect' 
            });
        }
    }
    
    // Enregistrer l'annulation avant suppression
    const consoleName = data.consoles.find(c => c.id === reservation.consoleId)?.name || reservation.consoleId;
    logOperation(data, {
        type: 'reservation_cancelled',
        details: {
            reservationId: reservation.id,
            consoleId: reservation.consoleId,
            consoleName: consoleName,
            userName: reservation.userName,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            wasValidated: reservation.isValidated,
            cancelledBy: isAdmin ? 'admin' : 'user',
            scanNumber: reservation.scanNumber
        }
    });
    
    data.reservations.splice(reservationIndex, 1);
    // Après suppression, préserver les désactivations manuelles
    const preserveManualDisable = {};
    data.consoles.forEach(c => {
        if (c.isAvailable === false && !c.currentReservation) {
            preserveManualDisable[c.id] = true;
        }
    });
    data = syncConsoles(data, preserveManualDisable);
    
    if (writeData(data)) {
        res.json({ success: true, message: 'Réservation annulée' });
    } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
});

// POST /api/reservations/:id/validate - Valider une réservation
app.post('/api/reservations/:id/validate', (req, res) => {
    let data = readData();
    
    const reservation = data.reservations.find(r => r.id === req.params.id);
    if (!reservation) {
        return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }
    
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    
    // Vérifier que la réservation n'a pas encore commencé ou vient juste de commencer (5 min de grâce)
    const gracePeriod = 5 * 60 * 1000; // 5 minutes
    if (now > new Date(startDate.getTime() + gracePeriod)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Trop tard pour valider cette réservation' 
        });
    }
    
    reservation.isValidated = true;
    reservation.validatedAt = new Date().toISOString();
    
    // Enregistrer la validation
    const consoleName = data.consoles.find(c => c.id === reservation.consoleId)?.name || reservation.consoleId;
    logOperation(data, {
        type: 'reservation_validated',
        details: {
            reservationId: reservation.id,
            consoleId: reservation.consoleId,
            consoleName: consoleName,
            userName: reservation.userName,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            validatedAt: reservation.validatedAt,
            scanNumber: reservation.scanNumber
        }
    });
    
    // Préserver les désactivations manuelles
    const preserveManualDisable = {};
    data.consoles.forEach(c => {
        if (c.isAvailable === false && !c.currentReservation) {
            preserveManualDisable[c.id] = true;
        }
    });
    data = syncConsoles(data, preserveManualDisable);
    
    if (writeData(data)) {
        res.json({ success: true, message: 'Réservation validée', reservation });
    } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
});

// GET /api/operations - Récupérer l'historique des opérations
app.get('/api/operations', (req, res) => {
    try {
        const data = readData();
        let operations = data.operations || [];
        
        // Trier par date décroissante (plus récentes en premier)
        operations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Filtrer par type si demandé
        const type = req.query.type;
        if (type) {
            operations = operations.filter(op => op.type === type);
        }
        
        // Limiter le nombre de résultats si demandé
        const limit = parseInt(req.query.limit) || 100;
        operations = operations.slice(0, limit);
        
        res.json({ 
            success: true, 
            operations: operations,
            total: data.operations ? data.operations.length : 0
        });
    } catch (error) {
        console.error('[GET /api/operations] Erreur:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des opérations',
            error: error.message 
        });
    }
});

// POST /api/reservations/:id/verify-pin - Vérifier le PIN d'une réservation
app.post('/api/reservations/:id/verify-pin', (req, res) => {
    // S'assurer que le PIN est une string
    const pin = String(req.body.pin || '').trim();
    
    console.log('[VERIFY-PIN] PIN reçu:', {
        raw: req.body.pin,
        processed: pin,
        length: pin.length,
        type: typeof pin,
        isValid: /^\d{4}$/.test(pin)
    });
    
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Code PIN requis (4 chiffres)' 
        });
    }
    
    const data = readData();
    const reservation = data.reservations.find(r => r.id === req.params.id);
    
    if (!reservation) {
        return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }
    
    // Vérifier le PIN (admin ou PIN de la réservation)
    const isAdmin = isAdminPIN(pin);
    const providedHash = hashPIN(pin);
    const storedHash = reservation.pinHash;
    console.log(`[VERIFY-PIN] Vérification PIN pour réservation ${req.params.id}:`, {
        pin: pin,
        isAdmin: isAdmin,
        providedHash: providedHash,
        storedHash: storedHash,
        match: isAdmin || providedHash === storedHash
    });
    
    if (!isAdmin && storedHash !== providedHash) {
        return res.status(401).json({ 
            success: false, 
            message: 'Code PIN incorrect' 
        });
    }
    
    res.json({ success: true, message: 'Code PIN correct' });
});

// GET /api/allowed-scan-numbers - Récupérer la liste des numéros autorisés
app.get('/api/allowed-scan-numbers', (req, res) => {
    try {
        const data = readData();
        if (!data.allowedScanNumbers) {
            data.allowedScanNumbers = ['8012908', '8012909', '8012910', '8012911'];
            writeData(data);
        }
        res.json({ 
            success: true, 
            allowedScanNumbers: data.allowedScanNumbers 
        });
    } catch (error) {
        console.error('[GET /api/allowed-scan-numbers] Erreur:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des numéros autorisés',
            error: error.message 
        });
    }
});

// POST /api/allowed-scan-numbers - Ajouter un numéro autorisé
app.post('/api/allowed-scan-numbers', (req, res) => {
    try {
        const { scanNumber } = req.body;
        
        if (!scanNumber || typeof scanNumber !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Le numéro à scanner est requis' 
            });
        }
        
        // Valider le format : 7 chiffres commençant par 8
        const scanNumberPattern = /^8\d{6}$/;
        const scanNumberTrimmed = scanNumber.trim();
        if (!scanNumberPattern.test(scanNumberTrimmed)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format invalide : le numéro doit être 7 chiffres commençant par 8 (ex: 8012908)' 
            });
        }
        
        const data = readData();
        if (!data.allowedScanNumbers) {
            data.allowedScanNumbers = ['8012908', '8012909', '8012910', '8012911'];
        }
        
        // Vérifier si le numéro existe déjà
        if (data.allowedScanNumbers.includes(scanNumberTrimmed)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ce numéro est déjà dans la liste des numéros autorisés' 
            });
        }
        
        // Ajouter le numéro
        data.allowedScanNumbers.push(scanNumberTrimmed);
        data.allowedScanNumbers.sort(); // Trier par ordre croissant
        
        writeData(data);
        
        console.log(`[POST /api/allowed-scan-numbers] Numéro ajouté: ${scanNumberTrimmed}`);
        
        res.json({ 
            success: true, 
            message: 'Numéro ajouté avec succès',
            allowedScanNumbers: data.allowedScanNumbers 
        });
    } catch (error) {
        console.error('[POST /api/allowed-scan-numbers] Erreur:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'ajout du numéro',
            error: error.message 
        });
    }
});

// DELETE /api/allowed-scan-numbers/:scanNumber - Supprimer un numéro autorisé
app.delete('/api/allowed-scan-numbers/:scanNumber', (req, res) => {
    try {
        const { scanNumber } = req.params;
        
        if (!scanNumber || !/^8\d{6}$/.test(scanNumber)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format invalide : le numéro doit être 7 chiffres commençant par 8' 
            });
        }
        
        const data = readData();
        if (!data.allowedScanNumbers) {
            data.allowedScanNumbers = ['8012908', '8012909', '8012910', '8012911'];
        }
        
        const index = data.allowedScanNumbers.indexOf(scanNumber);
        if (index === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Numéro non trouvé dans la liste des numéros autorisés' 
            });
        }
        
        // Vérifier qu'il reste au moins un numéro
        if (data.allowedScanNumbers.length <= 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Impossible de supprimer : il doit rester au moins un numéro autorisé' 
            });
        }
        
        // Supprimer le numéro
        data.allowedScanNumbers.splice(index, 1);
        writeData(data);
        
        console.log(`[DELETE /api/allowed-scan-numbers] Numéro supprimé: ${scanNumber}`);
        
        res.json({ 
            success: true, 
            message: 'Numéro supprimé avec succès',
            allowedScanNumbers: data.allowedScanNumbers 
        });
    } catch (error) {
        console.error('[DELETE /api/allowed-scan-numbers] Erreur:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la suppression du numéro',
            error: error.message 
        });
    }
});

// Route racine - servir index.html (AVANT le middleware static)
app.get('/', (req, res) => {
    console.log('[ROOT] Requête sur /, envoi de index.html');
    // Désactiver le cache pour forcer le rechargement
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Servir les fichiers statiques APRÈS toutes les routes API et la route racine
// (pour éviter que /api/* soit intercepté par le serveur de fichiers statiques)
// IMPORTANT: Ce middleware doit être le dernier pour ne pas intercepter les routes API
app.use((req, res, next) => {
    // Ne JAMAIS servir les fichiers statiques pour les routes API
    if (req.path.startsWith('/api/')) {
        console.log(`[STATIC] Ignorant ${req.path} (route API) - devrait être géré par une route API`);
        // Si on arrive ici, c'est qu'aucune route API n'a matché - erreur 404
        return res.status(404).json({ 
            success: false, 
            message: 'Route API non trouvée',
            path: req.path 
        });
    }
    
    // Désactiver le cache pour tous les fichiers statiques (CSS, JS, etc.)
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    // Servir les fichiers statiques pour les autres routes
    console.log(`[STATIC] Tentative de servir ${req.path}`);
    express.static(path.join(__dirname, '..'))(req, res, next);
});

// Initialiser et démarrer le serveur
initializeDataFile();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📁 Données stockées dans: ${DATA_FILE}`);
    console.log(`✅ Routes API enregistrées:`);
    console.log(`   - GET /api/health`);
    console.log(`   - GET /api/consoles`);
    console.log(`   - GET /api/consoles/:id`);
    console.log(`   - PUT /api/consoles/:id/availability`);
    console.log(`   - GET /api/reservations`);
    console.log(`   - POST /api/reservations`);
    console.log(`   - DELETE /api/reservations/:id`);
    console.log(`   - POST /api/reservations/:id/validate`);
    console.log(`   - POST /api/reservations/:id/verify-pin`);
});

