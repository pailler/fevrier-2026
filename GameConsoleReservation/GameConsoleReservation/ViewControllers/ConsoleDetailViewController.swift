//
//  ConsoleDetailViewController.swift
//  GameConsoleReservation
//
//  Détails d'une console et réservation
//

import UIKit

class ConsoleDetailViewController: UIViewController {
    
    private let console: GameConsole
    private let reservationManager = ReservationManager.shared
    
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    
    private let nameLabel = UILabel()
    private let typeLabel = UILabel()
    private let statusLabel = UILabel()
    private let reservationInfoLabel = UILabel()
    
    private let reserveButton = UIButton(type: .system)
    private let cancelReservationButton = UIButton(type: .system)
    
    init(console: GameConsole) {
        self.console = console
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = console.name
        view.backgroundColor = .white
        
        setupUI()
        updateUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateUI()
    }
    
    private func setupUI() {
        // Scroll view
        view.addSubview(scrollView)
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor).isActive = true
        scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor).isActive = true
        scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor).isActive = true
        scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor).isActive = true
        
        scrollView.addSubview(contentView)
        contentView.translatesAutoresizingMaskIntoConstraints = false
        contentView.topAnchor.constraint(equalTo: scrollView.topAnchor).isActive = true
        contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor).isActive = true
        contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor).isActive = true
        contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor).isActive = true
        contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor).isActive = true
        
        // Labels
        nameLabel.font = UIFont.boldSystemFont(ofSize: 24)
        nameLabel.textAlignment = .center
        nameLabel.numberOfLines = 0
        
        typeLabel.font = UIFont.systemFont(ofSize: 18)
        typeLabel.textAlignment = .center
        typeLabel.textColor = .gray
        
        statusLabel.font = UIFont.systemFont(ofSize: 20)
        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        
        reservationInfoLabel.font = UIFont.systemFont(ofSize: 16)
        reservationInfoLabel.textAlignment = .center
        reservationInfoLabel.numberOfLines = 0
        reservationInfoLabel.textColor = .darkGray
        
        // Buttons
        reserveButton.setTitle("Réserver cette console", for: .normal)
        reserveButton.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
        reserveButton.backgroundColor = UIColor(red: 0.0, green: 0.5, blue: 1.0, alpha: 1.0)
        reserveButton.setTitleColor(.white, for: .normal)
        reserveButton.layer.cornerRadius = 10
        reserveButton.addTarget(self, action: #selector(reserveButtonTapped), for: .touchUpInside)
        
        cancelReservationButton.setTitle("Annuler la réservation", for: .normal)
        cancelReservationButton.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
        cancelReservationButton.backgroundColor = UIColor(red: 1.0, green: 0.3, blue: 0.3, alpha: 1.0)
        cancelReservationButton.setTitleColor(.white, for: .normal)
        cancelReservationButton.layer.cornerRadius = 10
        cancelReservationButton.addTarget(self, action: #selector(cancelReservationButtonTapped), for: .touchUpInside)
        
        // Stack view
        let stackView = UIStackView(arrangedSubviews: [
            nameLabel,
            typeLabel,
            statusLabel,
            reservationInfoLabel,
            reserveButton,
            cancelReservationButton
        ])
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        contentView.addSubview(stackView)
        stackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 40).isActive = true
        stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 40).isActive = true
        stackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -40).isActive = true
        stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -40).isActive = true
        
        reserveButton.heightAnchor.constraint(equalToConstant: 50).isActive = true
        cancelReservationButton.heightAnchor.constraint(equalToConstant: 50).isActive = true
    }
    
    private func updateUI() {
        guard let updatedConsole = reservationManager.getConsole(byId: console.id) else {
            return
        }
        
        nameLabel.text = updatedConsole.name
        typeLabel.text = updatedConsole.type
        
        if updatedConsole.isAvailable {
            statusLabel.text = "✅ Disponible"
            statusLabel.textColor = UIColor(red: 0.0, green: 0.6, blue: 0.0, alpha: 1.0)
            reservationInfoLabel.text = ""
            reserveButton.isHidden = false
            cancelReservationButton.isHidden = true
        } else {
            statusLabel.text = "❌ Réservée"
            statusLabel.textColor = UIColor(red: 0.8, green: 0.0, blue: 0.0, alpha: 1.0)
            
            if let reservation = updatedConsole.currentReservation {
                let formatter = DateFormatter()
                formatter.dateStyle = .medium
                formatter.timeStyle = .short
                reservationInfoLabel.text = "Réservée par: \(reservation.userName)\nDu: \(formatter.string(from: reservation.startDate))\nAu: \(formatter.string(from: reservation.endDate))"
            } else {
                reservationInfoLabel.text = "Non disponible"
            }
            
            reserveButton.isHidden = true
            cancelReservationButton.isHidden = false
        }
    }
    
    @objc private func reserveButtonTapped() {
        let alertController = UIAlertController(title: "Nouvelle réservation", message: "Entrez vos informations", preferredStyle: .alert)
        
        alertController.addTextField { textField in
            textField.placeholder = "Votre nom"
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm"
        
        alertController.addTextField { textField in
            textField.placeholder = "Date de début (YYYY-MM-DD HH:MM)"
            textField.text = dateFormatter.string(from: Date())
        }
        
        alertController.addTextField { textField in
            textField.placeholder = "Date de fin (YYYY-MM-DD HH:MM)"
            let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
            textField.text = dateFormatter.string(from: tomorrow)
        }
        
        let reserveAction = UIAlertAction(title: "Réserver", style: .default) { [weak self] _ in
            guard let self = self,
                  let nameField = alertController.textFields?[0],
                  let startField = alertController.textFields?[1],
                  let endField = alertController.textFields?[2],
                  let userName = nameField.text, !userName.isEmpty,
                  let startText = startField.text,
                  let endText = endField.text else {
                self?.showError("Veuillez remplir tous les champs")
                return
            }
            
            dateFormatter.dateFormat = "yyyy-MM-dd HH:mm"
            guard let startDate = dateFormatter.date(from: startText),
                  let endDate = dateFormatter.date(from: endText) else {
                self?.showError("Format de date invalide. Utilisez YYYY-MM-DD HH:MM")
                return
            }
            
            if endDate <= startDate {
                self?.showError("La date de fin doit être après la date de début")
                return
            }
            
            let reservation = Reservation(
                consoleId: self.console.id,
                userName: userName,
                startDate: startDate,
                endDate: endDate
            )
            
            if self.reservationManager.createReservation(reservation) {
                self.showSuccess("Réservation créée avec succès!")
                self.updateUI()
            } else {
                self.showError("Impossible de créer la réservation. La console est peut-être déjà réservée à cette période.")
            }
        }
        
        let cancelAction = UIAlertAction(title: "Annuler", style: .cancel)
        
        alertController.addAction(reserveAction)
        alertController.addAction(cancelAction)
        
        present(alertController, animated: true)
    }
    
    @objc private func cancelReservationButtonTapped() {
        guard let reservation = console.currentReservation else {
            return
        }
        
        let alertController = UIAlertController(
            title: "Annuler la réservation",
            message: "Êtes-vous sûr de vouloir annuler cette réservation?",
            preferredStyle: .alert
        )
        
        let cancelAction = UIAlertAction(title: "Non", style: .cancel)
        let confirmAction = UIAlertAction(title: "Oui, annuler", style: .destructive) { [weak self] _ in
            self?.reservationManager.cancelReservation(reservation.id)
            self?.showSuccess("Réservation annulée")
            self?.updateUI()
        }
        
        alertController.addAction(cancelAction)
        alertController.addAction(confirmAction)
        
        present(alertController, animated: true)
    }
    
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Erreur", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showSuccess(_ message: String) {
        let alert = UIAlertController(title: "Succès", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

