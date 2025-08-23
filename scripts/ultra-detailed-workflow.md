# 🚀 Workflow Ultra-Détaillé - Accès Distant à Cursor

## 📋 Table des matières
1. [Prérequis et Préparation](#prérequis-et-préparation)
2. [Configuration du NAS](#configuration-du-nas)
3. [Configuration du PC Principal](#configuration-du-pc-principal)
4. [Configuration du PC Client](#configuration-du-pc-client)
5. [Test de Connexion](#test-de-connexion)
6. [Workflow Quotidien](#workflow-quotidien)
7. [Dépannage](#dépannage)
8. [Sécurité et Maintenance](#sécurité-et-maintenance)

---

## 🔍 Prérequis et Préparation

### Étape 1.1 : Vérification de l'infrastructure

**⏱️ Temps estimé : 5 minutes**

1. **Téléchargez le script de vérification** :
   ```powershell
   # Créez le dossier scripts s'il n'existe pas
   mkdir C:\scripts
   cd C:\scripts
   
   # Copiez le script check-infrastructure.ps1 dans ce dossier
   ```

2. **Exécutez la vérification** :
   ```powershell
   # Ouvrez PowerShell en tant qu'administrateur
   # Clic droit sur PowerShell → "Exécuter en tant qu'administrateur"
   
   # Naviguez vers le dossier scripts
   cd C:\scripts
   
   # Exécutez le script de vérification
   .\check-infrastructure.ps1 -Action check
   ```

3. **Analysez les résultats** :
   - ✅ **Tous les éléments sont OK** → Passez à l'étape suivante
   - ❌ **Problèmes détectés** → Résolvez-les avant de continuer

### Étape 1.2 : Résolution des problèmes courants

**Si Cursor n'est pas installé :**
```powershell
# Téléchargez Cursor depuis https://cursor.sh
# Installez-le dans le dossier par défaut
# Redémarrez le PC après l'installation
```

**Si les services Windows ne sont pas installés :**
```powershell
# Le script setup-remote-access.ps1 les installera automatiquement
# Pas d'action requise pour le moment
```

**Si l'espace disque est insuffisant :**
```powershell
# Libérez de l'espace sur le disque C:
# Supprimez les fichiers temporaires
# Videz la corbeille
# Désinstallez les applications inutiles
```

### Étape 1.3 : Préparation des informations

**📝 Notez ces informations importantes :**

1. **IP de votre NAS** : `192.168.1.XXX` (remplacez par votre IP)
2. **Nom d'utilisateur NAS** : `votre_username`
3. **Mot de passe NAS** : `votre_password`
4. **IP de votre PC principal** : `192.168.1.XXX` (remplacez par votre IP)
5. **Nom d'utilisateur Windows** : `votre_username_windows`
6. **Mot de passe Windows** : `votre_password_windows`

---

## 🖥️ Configuration du NAS

### Étape 2.1 : Accès au NAS

**⏱️ Temps estimé : 2 minutes**

1. **Ouvrez votre navigateur web**
2. **Tapez l'adresse de votre NAS** :
   ```
   http://192.168.1.XXX:5000
   ```
   (Remplacez par l'IP de votre NAS)

3. **Connectez-vous** avec vos identifiants administrateur

### Étape 2.2 : Installation du VPN Server (Synology)

**⏱️ Temps estimé : 5 minutes**

1. **Ouvrez Package Center**
   - Cliquez sur l'icône "Package Center" dans le menu principal

2. **Recherchez "VPN Server"**
   - Dans la barre de recherche, tapez : `VPN Server`
   - Cliquez sur le résultat "VPN Server"

3. **Installez le package**
   - Cliquez sur le bouton "Installer"
   - Attendez la fin de l'installation (2-3 minutes)
   - Cliquez sur "Lancer" quand c'est terminé

### Étape 2.3 : Configuration OpenVPN

**⏱️ Temps estimé : 10 minutes**

1. **Ouvrez VPN Server**
   - Dans le menu principal, cliquez sur "VPN Server"

2. **Allez dans l'onglet "OpenVPN"**
   - Cliquez sur l'onglet "OpenVPN" en haut

3. **Cliquez sur "Settings"**
   - Cliquez sur le bouton "Settings" à droite

4. **Configurez les paramètres** :
   - ✅ **Enable OpenVPN server** : Cochez cette case
   - **Port** : `1194` (laissez la valeur par défaut)
   - **Protocol** : `UDP` (sélectionnez UDP)
   - **Encryption** : `AES-256-CBC` (laissez la valeur par défaut)
   - **Authentication** : `SHA256` (laissez la valeur par défaut)
   - **DH Key** : `2048 bits` (laissez la valeur par défaut)

5. **Cliquez sur "Apply"**
   - Cliquez sur le bouton "Apply" pour sauvegarder

### Étape 2.4 : Création des certificats

**⏱️ Temps estimé : 8 minutes**

1. **Allez dans l'onglet "Certificate"**
   - Cliquez sur l'onglet "Certificate" en haut

2. **Créez le certificat CA** :
   - Cliquez sur "Create" → "Create CA"
   - **Country** : `FR` (ou votre pays)
   - **State** : `Votre région`
   - **City** : `Votre ville`
   - **Organization** : `Votre organisation`
   - **Common Name** : `IAHome-CA`
   - Cliquez sur "Next" puis "Apply"

3. **Créez le certificat serveur** :
   - Cliquez sur "Create" → "Create Server Certificate"
   - **Common Name** : `IAHome-Server`
   - Sélectionnez le CA créé précédemment
   - Cliquez sur "Next" puis "Apply"

4. **Créez le certificat client** :
   - Cliquez sur "Create" → "Create Client Certificate"
   - **Common Name** : `IAHome-Client`
   - Sélectionnez le CA créé précédemment
   - Cliquez sur "Next" puis "Apply"

### Étape 2.5 : Configuration des utilisateurs

**⏱️ Temps estimé : 5 minutes**

1. **Allez dans l'onglet "User Management"**
   - Cliquez sur l'onglet "User Management" en haut

2. **Créez un nouvel utilisateur** :
   - Cliquez sur "Create"
   - **Username** : `cursor_user`
   - **Password** : `MotDePasseSecurise123!`
   - **Confirm Password** : `MotDePasseSecurise123!`
   - Cliquez sur "Next"

3. **Attribuez les permissions** :
   - ✅ Cochez "OpenVPN"
   - Cliquez sur "Next" puis "Apply"

### Étape 2.6 : Génération du fichier de configuration

**⏱️ Temps estimé : 3 minutes**

1. **Générez le fichier .ovpn** :
   - Dans "User Management", sélectionnez l'utilisateur créé
   - Cliquez sur "Export" → "Export .ovpn file"
   - Le fichier se télécharge automatiquement

2. **Sauvegardez le fichier** :
   - Notez l'emplacement du fichier téléchargé
   - Copiez-le dans un dossier sécurisé
   - Exemple : `C:\Users\[VotreNom]\Documents\VPN\cursor_user.ovpn`

---

## 💻 Configuration du PC Principal

### Étape 3.1 : Préparation du script

**⏱️ Temps estimé : 2 minutes**

1. **Créez le dossier scripts** :
   ```powershell
   # Ouvrez PowerShell en tant qu'administrateur
   mkdir C:\scripts
   cd C:\scripts
   ```

2. **Copiez le script setup-remote-access.ps1** :
   - Copiez le fichier `setup-remote-access.ps1` dans `C:\scripts\`

### Étape 3.2 : Exécution du script de configuration

**⏱️ Temps estimé : 15 minutes**

1. **Exécutez le script** :
   ```powershell
   # Assurez-vous d'être dans le bon dossier
   cd C:\scripts
   
   # Exécutez le script de configuration
   .\setup-remote-access.ps1 -Action setup
   ```

2. **Suivez les instructions à l'écran** :
   - Le script installe automatiquement :
     - Bureau à distance Windows (RDP)
     - Serveur SSH
     - Serveur VNC (TightVNC)
     - Règles de pare-feu
     - Script de démarrage automatique

3. **Attendez la fin de l'installation** :
   - L'installation peut prendre 10-15 minutes
   - Ne fermez pas la fenêtre PowerShell
   - Le script affiche les informations de connexion à la fin

### Étape 3.3 : Configuration des mots de passe

**⏱️ Temps estimé : 5 minutes**

1. **Changez le mot de passe Windows** :
   - Appuyez sur `Ctrl + Alt + Del`
   - Sélectionnez "Changer un mot de passe"
   - Entrez l'ancien mot de passe
   - Entrez le nouveau mot de passe : `MotDePasseWindowsSecurise123!`
   - Confirmez le nouveau mot de passe

2. **Configurez TightVNC** :
   - Ouvrez "TightVNC Server" depuis le menu Démarrer
   - Cliquez sur "Settings"
   - Dans l'onglet "Administration", définissez un mot de passe
   - Mot de passe VNC : `MotDePasseVNC123!`
   - Cliquez sur "OK"

3. **Configurez SSH** (optionnel) :
   ```powershell
   # Générez une clé SSH (optionnel mais recommandé)
   ssh-keygen -t rsa -b 4096 -C "votre_email@example.com"
   ```

### Étape 3.4 : Test local

**⏱️ Temps estimé : 5 minutes**

1. **Testez RDP localement** :
   ```powershell
   # Testez la connexion RDP locale
   mstsc /v:localhost
   ```

2. **Testez VNC localement** :
   - Ouvrez "TightVNC Viewer"
   - Connectez-vous à : `localhost:5900`
   - Entrez le mot de passe VNC configuré

3. **Testez SSH localement** :
   ```powershell
   # Testez SSH localement
   ssh localhost
   ```

---

## 📱 Configuration du PC Client

### Étape 4.1 : Installation du client VPN

**⏱️ Temps estimé : 5 minutes**

1. **Téléchargez OpenVPN Client** :
   - Allez sur https://openvpn.net/community-downloads/
   - Téléchargez "OpenVPN Connect" pour Windows
   - Installez l'application

2. **Importez le fichier .ovpn** :
   - Ouvrez "OpenVPN Connect"
   - Cliquez sur "Import" → "Import File"
   - Sélectionnez le fichier `cursor_user.ovpn` téléchargé du NAS
   - Cliquez sur "Import"

3. **Configurez l'authentification** :
   - Dans la liste des connexions, cliquez sur votre connexion
   - Cliquez sur "Settings"
   - Entrez les identifiants :
     - **Username** : `cursor_user`
     - **Password** : `MotDePasseSecurise123!`
   - Cliquez sur "Save"

### Étape 4.2 : Installation du client RDP

**⏱️ Temps estimé : 3 minutes**

1. **Windows** : Bureau à distance intégré (déjà installé)
2. **macOS** : Téléchargez "Microsoft Remote Desktop" depuis l'App Store
3. **Linux** : Installez Remmina :
   ```bash
   sudo apt-get install remmina remmina-plugin-rdp
   ```

### Étape 4.3 : Installation du client VNC (optionnel)

**⏱️ Temps estimé : 3 minutes**

1. **Windows** : Téléchargez "TightVNC Viewer" depuis https://www.tightvnc.com/
2. **macOS** : Utilisez "Screen Sharing" intégré
3. **Linux** : Installez Remmina avec le plugin VNC :
   ```bash
   sudo apt-get install remmina-plugin-vnc
   ```

---

## 🧪 Test de Connexion

### Étape 5.1 : Test de connectivité VPN

**⏱️ Temps estimé : 5 minutes**

1. **Connectez-vous au VPN** :
   - Ouvrez "OpenVPN Connect"
   - Cliquez sur "Connect" à côté de votre connexion
   - Entrez vos identifiants si demandé

2. **Vérifiez la connexion** :
   ```powershell
   # Vérifiez votre IP
   curl ifconfig.me
   
   # Testez la connectivité vers le PC principal
   ping 192.168.1.XXX
   ```
   (Remplacez par l'IP de votre PC principal)

3. **Vérifiez les ports** :
   ```powershell
   # Testez le port RDP
   telnet 192.168.1.XXX 3389
   
   # Testez le port VNC
   telnet 192.168.1.XXX 5900
   ```

### Étape 5.2 : Test de connexion RDP

**⏱️ Temps estimé : 5 minutes**

1. **Ouvrez le Bureau à distance** :
   - Windows : `mstsc`
   - macOS : Microsoft Remote Desktop
   - Linux : `remmina`

2. **Configurez la connexion** :
   - **Computer** : `192.168.1.XXX` (IP du PC principal)
   - **Username** : `votre_username_windows`
   - Cliquez sur "Connect"

3. **Connectez-vous** :
   - Entrez le mot de passe Windows
   - Acceptez l'avertissement de certificat si demandé

4. **Vérifiez l'accès** :
   - Vous devriez voir le bureau du PC principal
   - Testez l'ouverture de Cursor

### Étape 5.3 : Test de connexion VNC (optionnel)

**⏱️ Temps estimé : 5 minutes**

1. **Ouvrez le client VNC** :
   - Windows : TightVNC Viewer
   - macOS : Screen Sharing
   - Linux : Remmina

2. **Connectez-vous** :
   - **Server** : `192.168.1.XXX:5900`
   - **Password** : `MotDePasseVNC123!`

3. **Vérifiez l'accès** :
   - Vous devriez voir le bureau du PC principal
   - Testez l'ouverture de Cursor

---

## 🔄 Workflow Quotidien

### Étape 6.1 : Démarrage de la session de travail

**⏱️ Temps estimé : 2 minutes**

1. **Connectez-vous au VPN** :
   ```
   📱 Sur votre PC client :
   - Ouvrez "OpenVPN Connect"
   - Cliquez sur "Connect"
   - Entrez vos identifiants si demandé
   - Attendez la confirmation "Connected"
   ```

2. **Vérifiez la connectivité** :
   ```powershell
   # Testez la connexion vers le PC principal
   ping 192.168.1.XXX
   
   # Résultat attendu : "Reply from 192.168.1.XXX"
   ```

3. **Connectez-vous en RDP** :
   ```
   📱 Sur votre PC client :
   - Ouvrez le Bureau à distance
   - Entrez l'IP : 192.168.1.XXX
   - Cliquez sur "Connect"
   - Entrez vos identifiants Windows
   ```

4. **Lancez Cursor** :
   ```
   🖥️ Sur le PC distant :
   - Ouvrez le menu Démarrer
   - Recherchez "Cursor"
   - Cliquez sur "Cursor" pour lancer l'application
   ```

### Étape 6.2 : Pendant la session de travail

**✅ Bonnes pratiques :**

1. **Sauvegardez régulièrement** :
   - Utilisez `Ctrl + S` fréquemment
   - Configurez la sauvegarde automatique dans Cursor

2. **Surveillez la connexion** :
   - Vérifiez que le VPN reste connecté
   - Surveillez les performances réseau

3. **Utilisez les raccourcis clavier** :
   - `Ctrl + C`, `Ctrl + V` : Copier/Coller
   - `Alt + Tab` : Changer d'application
   - `Windows + D` : Afficher le bureau

### Étape 6.3 : Fin de session de travail

**⏱️ Temps estimé : 1 minute**

1. **Fermez Cursor** :
   ```
   🖥️ Sur le PC distant :
   - Sauvegardez tous vos fichiers
   - Fermez Cursor complètement
   ```

2. **Déconnectez-vous de la session** :
   ```
   🖥️ Sur le PC distant :
   - Cliquez sur le menu Démarrer
   - Cliquez sur votre nom d'utilisateur
   - Sélectionnez "Se déconnecter"
   ```

3. **Déconnectez-vous du VPN** :
   ```
   📱 Sur votre PC client :
   - Ouvrez "OpenVPN Connect"
   - Cliquez sur "Disconnect"
   - Attendez la confirmation "Disconnected"
   ```

---

## 🔧 Dépannage

### Problème 1 : Impossible de se connecter au VPN

**Symptômes :**
- Erreur "Connection failed"
- Impossible de se connecter au serveur VPN

**Solutions :**

1. **Vérifiez la connectivité Internet** :
   ```powershell
   ping 8.8.8.8
   ```

2. **Vérifiez l'IP du NAS** :
   ```powershell
   ping 192.168.1.XXX
   ```

3. **Vérifiez le port VPN** :
   ```powershell
   telnet 192.168.1.XXX 1194
   ```

4. **Redémarrez le service VPN sur le NAS** :
   - Connectez-vous à l'interface web du NAS
   - Allez dans VPN Server → OpenVPN
   - Cliquez sur "Disable" puis "Enable"

### Problème 2 : Impossible de se connecter en RDP

**Symptômes :**
- Erreur "Remote Desktop can't connect"
- Connexion refusée

**Solutions :**

1. **Vérifiez que le VPN est connecté** :
   ```powershell
   curl ifconfig.me
   # L'IP devrait être celle de votre réseau local
   ```

2. **Vérifiez le service RDP** :
   ```powershell
   # Sur le PC principal
   Get-Service TermService
   # Le statut doit être "Running"
   ```

3. **Vérifiez le pare-feu** :
   ```powershell
   # Sur le PC principal
   Get-NetFirewallRule -DisplayName "RDP Custom"
   # La règle doit exister et être activée
   ```

4. **Redémarrez le service RDP** :
   ```powershell
   # Sur le PC principal
   Restart-Service TermService
   ```

### Problème 3 : Performance lente

**Symptômes :**
- Lenteur dans l'affichage
- Délais de réponse
- Images floues

**Solutions :**

1. **Optimisez les paramètres RDP** :
   ```
   📱 Dans le client RDP :
   - Cliquez sur "Show Options"
   - Onglet "Display"
   - Réduisez la "Display configuration" à 1024x768
   - Décochez "Use connection quality detection"
   ```

2. **Fermez les applications inutiles** :
   ```
   🖥️ Sur le PC distant :
   - Fermez les navigateurs web
   - Fermez les applications non essentielles
   - Libérez la mémoire RAM
   ```

3. **Vérifiez la bande passante** :
   ```powershell
   # Testez la vitesse de connexion
   speedtest-cli
   ```

### Problème 4 : Déconnexions fréquentes

**Symptômes :**
- Déconnexions automatiques
- Sessions qui se ferment

**Solutions :**

1. **Activez le keep-alive VPN** :
   ```
   📱 Dans OpenVPN Connect :
   - Cliquez sur "Settings"
   - Onglet "Advanced"
   - Cochez "Keep connection alive"
   ```

2. **Augmentez les timeouts RDP** :
   ```
   📱 Dans le client RDP :
   - Cliquez sur "Show Options"
   - Onglet "Advanced"
   - Augmentez "Connection timeout"
   ```

3. **Vérifiez la stabilité réseau** :
   ```powershell
   # Testez la stabilité de la connexion
   ping -t 192.168.1.XXX
   # Surveillez les pertes de paquets
   ```

---

## 🔒 Sécurité et Maintenance

### Maintenance hebdomadaire

**⏱️ Temps estimé : 15 minutes**

1. **Vérifiez les logs** :
   ```powershell
   # Sur le PC principal
   Get-Content C:\temp\remote-access-setup.log -Tail 50
   ```

2. **Vérifiez les sessions actives** :
   ```powershell
   # Sur le PC principal
   quser
   # Liste les utilisateurs connectés
   ```

3. **Nettoyez les fichiers temporaires** :
   ```powershell
   # Sur le PC principal
   Cleanmgr
   # Nettoyage de disque
   ```

### Maintenance mensuelle

**⏱️ Temps estimé : 30 minutes**

1. **Changez les mots de passe** :
   - Mot de passe Windows
   - Mot de passe VNC
   - Mot de passe VPN

2. **Mettez à jour les logiciels** :
   - Cursor
   - OpenVPN Client
   - TightVNC

3. **Vérifiez la sécurité** :
   ```powershell
   # Vérifiez les tentatives de connexion échouées
   Get-EventLog -LogName Security -InstanceId 4625 -Newest 10
   ```

### Sécurité recommandée

**✅ À faire régulièrement :**

1. **Changez les mots de passe tous les 3 mois**
2. **Surveillez les logs de connexion**
3. **Utilisez uniquement des connexions VPN**
4. **Désactivez l'accès quand vous ne l'utilisez pas**
5. **Sauvegardez régulièrement vos données**

**❌ À éviter :**

1. **N'ouvrez pas les ports directement sur Internet**
2. **N'utilisez pas de mots de passe faibles**
3. **Ne partagez pas vos identifiants**
4. **Ne connectez pas d'appareils non autorisés**

---

## 📞 Support et Ressources

### En cas de problème persistant

1. **Consultez les logs détaillés** :
   - `C:\temp\remote-access-setup.log`
   - `C:\temp\infrastructure-check.log`

2. **Vérifiez le statut des services** :
   ```powershell
   .\setup-remote-access.ps1 -Action status
   ```

3. **Redémarrez les services** :
   ```powershell
   .\setup-remote-access.ps1 -Action cleanup
   .\setup-remote-access.ps1 -Action setup
   ```

### Ressources utiles

- **Guide NAS détaillé** : `scripts/nas-vpn-setup.md`
- **Script PowerShell** : `scripts/setup-remote-access.ps1`
- **Interface web** : `https://iahome.fr/remote-access`
- **Documentation Cursor** : https://cursor.sh/docs

---

## 🎯 Résumé du Workflow

**Configuration initiale :** 60 minutes
**Workflow quotidien :** 3-5 minutes
**Maintenance :** 15-30 minutes par semaine

**Sécurité :** VPN + authentification forte + surveillance
**Performance :** RDP optimisé + bande passante surveillée
**Fiabilité :** Services automatisés + logs détaillés

---

**✅ Vous êtes maintenant prêt à utiliser Cursor à distance de manière sécurisée et efficace !**


