//
//  GameConsole.swift
//  GameConsoleReservation
//
//  Modèle de données pour une console de jeux
//

import Foundation

struct GameConsole: Codable {
    let id: String
    let name: String
    let type: String // Ex: "PlayStation 4", "Xbox One", "Nintendo Switch"
    var isAvailable: Bool
    var currentReservation: Reservation?
    
    init(id: String = UUID().uuidString, name: String, type: String, isAvailable: Bool = true, currentReservation: Reservation? = nil) {
        self.id = id
        self.name = name
        self.type = type
        self.isAvailable = isAvailable
        self.currentReservation = currentReservation
    }
}

struct Reservation: Codable {
    let id: String
    let consoleId: String
    let userName: String
    let startDate: Date
    let endDate: Date
    
    init(id: String = UUID().uuidString, consoleId: String, userName: String, startDate: Date, endDate: Date) {
        self.id = id
        self.consoleId = consoleId
        self.userName = userName
        self.startDate = startDate
        self.endDate = endDate
    }
}

