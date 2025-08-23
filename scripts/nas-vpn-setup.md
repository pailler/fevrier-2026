# Guide de configuration VPN sur NAS pour l'accès distant à Cursor

## 🎯 Objectif
Configurer un serveur VPN sur votre NAS pour permettre un accès distant sécurisé à votre PC où Cursor est installé.

## 📋 Prérequis
- NAS compatible (Synology, QNAP, etc.)
- Accès administrateur au NAS
- Routeur configuré pour le port forwarding (optionnel)

## 🔧 Configuration selon le type de NAS

### Synology NAS

#### 1. Installation du package VPN Server
1. Ouvrez **Package Center** sur votre NAS
2. Recherchez **VPN Server**
3. Installez le package
4. Lancez l'application VPN Server

#### 2. Configuration OpenVPN
1. Dans VPN Server, allez dans **OpenVPN**
2. Cliquez sur **Settings**
3. Configurez les paramètres :
   - **Port** : 1194 (par défaut)
   - **Protocol** : UDP
   - **Encryption** : AES-256-CBC
   - **Authentication** : SHA256
   - **DH Key** : 2048 bits

#### 3. Création des certificats
1. Allez dans **Certificate** > **Create**
2. Créez un certificat CA (Certificate Authority)
3. Créez un certificat serveur
4. Créez des certificats clients pour chaque utilisateur

#### 4. Configuration des utilisateurs
1. Allez dans **User Management**
2. Créez des comptes utilisateurs
3. Attribuez les permissions VPN
4. Générez les fichiers de configuration (.ovpn)

### QNAP NAS

#### 1. Installation QVPN Service
1. Ouvrez **App Center**
2. Recherchez **QVPN Service**
3. Installez l'application
4. Lancez QVPN Service

#### 2. Configuration OpenVPN
1. Dans QVPN, allez dans **VPN Server** > **OpenVPN**
2. Activez le serveur OpenVPN
3. Configurez :
   - **Port** : 1194
   - **Protocol** : UDP
   - **Cipher** : AES-256-CBC
   - **Auth** : SHA256

#### 3. Gestion des utilisateurs
1. Créez des comptes dans **User Management**
2. Générez les certificats clients
3. Exportez les fichiers .ovpn

### NAS générique (Docker)

Si votre NAS supporte Docker, vous pouvez utiliser WireGuard :

```bash
# Créer le dossier de configuration
mkdir -p /volume1/docker/wireguard/config

# Lancer le conteneur WireGuard
docker run -d \
  --name=wireguard \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  -v /volume1/docker/wireguard/config:/config \
  -p 51820:51820/udp \
  linuxserver/wireguard

# Accéder aux logs pour récupérer la configuration
docker logs wireguard
```

## 🌐 Configuration du routeur

### Port Forwarding
Configurez votre routeur pour rediriger le trafic VPN vers votre NAS :

- **Port** : 1194 (OpenVPN) ou 51820 (WireGuard)
- **Protocole** : UDP
- **IP de destination** : IP de votre NAS
- **Port de destination** : Même que le port source

### Configuration DNS dynamique (optionnel)
Si vous n'avez pas d'IP fixe :
1. Configurez un service DNS dynamique (No-IP, DynDNS, etc.)
2. Mettez à jour l'IP automatiquement
3. Utilisez le nom de domaine dans la configuration VPN

## 📱 Configuration des clients

### Windows
1. Téléchargez **OpenVPN Client** depuis openvpn.net
2. Installez l'application
3. Importez le fichier .ovpn
4. Connectez-vous avec vos identifiants

### macOS
1. Téléchargez **Tunnelblick** ou **OpenVPN Connect**
2. Importez la configuration
3. Configurez l'authentification

### Linux
```bash
# Installation OpenVPN
sudo apt-get install openvpn

# Connexion
sudo openvpn --config client.ovpn
```

### Mobile (Android/iOS)
1. Installez **OpenVPN Connect** depuis l'App Store
2. Importez le fichier .ovpn
3. Activez la connexion

## 🔒 Sécurité recommandée

### 1. Pare-feu NAS
- Limitez l'accès aux ports VPN uniquement
- Bloquez les tentatives de connexion répétées
- Surveillez les logs de connexion

### 2. Authentification forte
- Utilisez des certificats clients
- Activez l'authentification à deux facteurs
- Changez les mots de passe régulièrement

### 3. Surveillance
- Activez les logs de connexion
- Surveillez les tentatives d'intrusion
- Configurez des alertes

## 🚀 Test de connexion

### 1. Test local
```bash
# Depuis un PC sur le même réseau
ping [IP_NAS]
telnet [IP_NAS] 1194
```

### 2. Test distant
```bash
# Depuis l'extérieur
ping [DOMAINE_NAS]
telnet [DOMAINE_NAS] 1194
```

### 3. Test VPN
1. Connectez-vous au VPN
2. Vérifiez votre IP : `curl ifconfig.me`
3. Testez l'accès au réseau local
4. Essayez de vous connecter à votre PC

## 📊 Monitoring

### Logs à surveiller
- Connexions VPN réussies/échouées
- Utilisation de la bande passante
- Tentatives d'intrusion
- Performance du serveur

### Outils de monitoring
- **Synology** : Log Center, Resource Monitor
- **QNAP** : System Logs, Resource Monitor
- **Générique** : Docker logs, systemd logs

## 🔧 Dépannage

### Problèmes courants

#### Connexion impossible
1. Vérifiez le port forwarding
2. Testez la connectivité réseau
3. Vérifiez les certificats
4. Consultez les logs

#### Performance lente
1. Optimisez la bande passante
2. Vérifiez la charge du NAS
3. Ajustez les paramètres de chiffrement
4. Utilisez un protocole plus rapide (WireGuard)

#### Déconnexions fréquentes
1. Vérifiez la stabilité réseau
2. Ajustez les timeouts
3. Activez le keep-alive
4. Vérifiez la configuration client

## 📞 Support

En cas de problème :
1. Consultez les logs du NAS
2. Vérifiez la documentation du fabricant
3. Testez avec un client différent
4. Contactez le support technique

## 🎯 Prochaines étapes

Une fois le VPN configuré :
1. Configurez votre PC avec le script PowerShell fourni
2. Testez l'accès distant à Cursor
3. Configurez les sauvegardes automatiques
4. Mettez en place la surveillance
5. Documentez la configuration

---

**Note** : Ce guide est générique. Consultez la documentation spécifique de votre NAS pour des instructions détaillées.


