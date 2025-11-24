//
//  ReservationManager.swift
//  GameConsoleReservation
//
//  Gestionnaire de réservations avec stockage local
//

import Foundation

class ReservationManager {
    static let shared = ReservationManager()
    
    private let consolesKey = "SavedConsoles"
    private let reservationsKey = "SavedReservations"
    
    private var consoles: [GameConsole] = []
    private var reservations: [Reservation] = []
    
    private init() {
        loadData()
        initializeDefaultConsolesIfNeeded()
    }
    
    // MARK: - Gestion des consoles
    
    func getAllConsoles() -> [GameConsole] {
        return consoles
    }
    
    func getConsole(byId id: String) -> GameConsole? {
        return consoles.first { $0.id == id }
    }
    
    func addConsole(_ console: GameConsole) {
        consoles.append(console)
        saveData()
    }
    
    func updateConsole(_ console: GameConsole) {
        if let index = consoles.firstIndex(where: { $0.id == console.id }) {
            consoles[index] = console
            saveData()
        }
    }
    
    // MARK: - Gestion des réservations
    
    func getAllReservations() -> [Reservation] {
        return reservations
    }
    
    func getReservations(forConsoleId consoleId: String) -> [Reservation] {
        return reservations.filter { $0.consoleId == consoleId }
    }
    
    func createReservation(_ reservation: Reservation) -> Bool {
        // Vérifier si la console est disponible
        guard let console = getConsole(byId: reservation.consoleId) else {
            return false
        }
        
        // Vérifier si la console n'est pas déjà réservée
        if !console.isAvailable {
            return false
        }
        
        // Vérifier les conflits de dates
        let conflictingReservations = reservations.filter { res in
            res.consoleId == reservation.consoleId &&
            res.endDate > reservation.startDate &&
            res.startDate < reservation.endDate
        }
        
        if !conflictingReservations.isEmpty {
            return false
        }
        
        // Créer la réservation
        reservations.append(reservation)
        
        // Mettre à jour la console
        var updatedConsole = console
        updatedConsole.isAvailable = false
        updatedConsole.currentReservation = reservation
        updateConsole(updatedConsole)
        
        saveData()
        return true
    }
    
    func cancelReservation(_ reservationId: String) {
        guard let reservation = reservations.first(where: { $0.id == reservationId }) else {
            return
        }
        
        // Retirer la réservation
        reservations.removeAll { $0.id == reservationId }
        
        // Libérer la console
        if var console = getConsole(byId: reservation.consoleId) {
            console.isAvailable = true
            console.currentReservation = nil
            updateConsole(console)
        }
        
        saveData()
    }
    
    // MARK: - Stockage local
    
    private func initializeDefaultConsolesIfNeeded() {
        if consoles.isEmpty {
            let defaultConsoles = [
                GameConsole(name: "PlayStation 4 - Console 1", type: "PlayStation 4"),
                GameConsole(name: "PlayStation 4 - Console 2", type: "PlayStation 4"),
                GameConsole(name: "Xbox One - Console 1", type: "Xbox One"),
                GameConsole(name: "Nintendo Switch - Console 1", type: "Nintendo Switch"),
                GameConsole(name: "PlayStation 5 - Console 1", type: "PlayStation 5")
            ]
            
            consoles = defaultConsoles
            saveData()
        }
    }
    
    private func saveData() {
        // Sauvegarder les consoles
        if let encoded = try? JSONEncoder().encode(consoles) {
            UserDefaults.standard.set(encoded, forKey: consolesKey)
        }
        
        // Sauvegarder les réservations
        if let encoded = try? JSONEncoder().encode(reservations) {
            UserDefaults.standard.set(encoded, forKey: reservationsKey)
        }
    }
    
    private func loadData() {
        // Charger les consoles
        if let data = UserDefaults.standard.data(forKey: consolesKey),
           let decoded = try? JSONDecoder().decode([GameConsole].self, from: data) {
            consoles = decoded
        }
        
        // Charger les réservations
        if let data = UserDefaults.standard.data(forKey: reservationsKey),
           let decoded = try? JSONDecoder().decode([Reservation].self, from: data) {
            reservations = decoded
        }
        
        // Synchroniser l'état des consoles avec les réservations
        syncConsolesWithReservations()
    }
    
    private func syncConsolesWithReservations() {
        // Mettre à jour l'état de disponibilité des consoles
        for i in 0..<consoles.count {
            let consoleId = consoles[i].id
            let activeReservation = reservations.first { res in
                res.consoleId == consoleId && res.endDate > Date()
            }
            
            consoles[i].isAvailable = activeReservation == nil
            consoles[i].currentReservation = activeReservation
        }
    }
}

