//
//  ConsoleListViewController.swift
//  GameConsoleReservation
//
//  Liste des consoles disponibles
//

import UIKit

class ConsoleListViewController: UITableViewController {
    
    private let reservationManager = ReservationManager.shared
    private var consoles: [GameConsole] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "Réservation de Consoles"
        
        // Configuration de la table view
        tableView.rowHeight = 80
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "ConsoleCell")
        
        // Bouton pour actualiser
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .refresh,
            target: self,
            action: #selector(refreshData)
        )
        
        loadConsoles()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadConsoles()
    }
    
    @objc private func refreshData() {
        loadConsoles()
    }
    
    private func loadConsoles() {
        consoles = reservationManager.getAllConsoles()
        tableView.reloadData()
    }
    
    // MARK: - Table view data source
    
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return consoles.count
    }
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ConsoleCell", for: indexPath)
        let console = consoles[indexPath.row]
        
        // Configuration de la cellule
        cell.textLabel?.text = console.name
        cell.detailTextLabel?.text = console.type
        
        // Style selon la disponibilité
        if console.isAvailable {
            cell.backgroundColor = UIColor(red: 0.9, green: 1.0, blue: 0.9, alpha: 1.0) // Vert clair
            cell.textLabel?.textColor = .black
            cell.detailTextLabel?.text = "\(console.type) - Disponible"
        } else {
            cell.backgroundColor = UIColor(red: 1.0, green: 0.9, blue: 0.9, alpha: 1.0) // Rouge clair
            cell.textLabel?.textColor = .black
            if let reservation = console.currentReservation {
                let formatter = DateFormatter()
                formatter.dateStyle = .short
                formatter.timeStyle = .short
                cell.detailTextLabel?.text = "Réservée par \(reservation.userName) jusqu'au \(formatter.string(from: reservation.endDate))"
            } else {
                cell.detailTextLabel?.text = "\(console.type) - Non disponible"
            }
        }
        
        cell.accessoryType = .disclosureIndicator
        
        return cell
    }
    
    // MARK: - Table view delegate
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let console = consoles[indexPath.row]
        let detailViewController = ConsoleDetailViewController(console: console)
        navigationController?.pushViewController(detailViewController, animated: true)
    }
}

