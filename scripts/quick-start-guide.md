# 🚀 Guide de démarrage rapide - Accès distant à Cursor

## 📋 Vue d'ensemble

Ce guide vous permet de configurer rapidement un accès distant sécurisé à Cursor via VPN en 30 minutes.

## ⚡ Configuration rapide (30 min)

### Étape 1 : Configuration du NAS (10 min)

#### Pour Synology NAS :
1. **Package Center** → Rechercher "VPN Server" → Installer
2. **VPN Server** → OpenVPN → Settings
3. **Port** : 1194, **Protocol** : UDP
4. **Certificate** → Create CA → Create Server Cert → Create Client Cert
5. **User Management** → Créer utilisateur → Générer .ovpn

#### Pour QNAP NAS :
1. **App Center** → QVPN Service → Installer
2. **VPN Server** → OpenVPN → Activer
3. **Port** : 1194, **Cipher** : AES-256-CBC
4. **User Management** → Créer utilisateur → Export .ovpn

#### Pour NAS Docker :
```bash
docker run -d --name=wireguard --cap-add=NET_ADMIN --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  -v /volume1/docker/wireguard/config:/config \
  -p 51820:51820/udp linuxserver/wireguard
```

### Étape 2 : Configuration du PC (10 min)

1. **Télécharger le script** : `scripts/setup-remote-access.ps1`
2. **Exécuter en tant qu'administrateur** :
```powershell
.\setup-remote-access.ps1 -Action setup
```

3. **Le script configure automatiquement** :
   - Bureau à distance Windows (RDP)
   - Serveur SSH
   - Serveur VNC (TightVNC)
   - Règles de pare-feu
   - Démarrage automatique

### Étape 3 : Test de connexion (10 min)

1. **Connectez-vous au VPN** depuis votre appareil distant
2. **Testez la connectivité** :
```bash
ping [IP_PC]
telnet [IP_PC] 3389  # RDP
telnet [IP_PC] 5900  # VNC
```

3. **Connectez-vous avec un client RDP/VNC**
4. **Lancez Cursor** sur le PC distant

## 🔧 Configuration avancée

### Option A : Interface web de gestion

Accédez à votre interface IAHome pour gérer les sessions :

1. Allez sur `https://iahome.fr/remote-access`
2. Connectez-vous avec votre compte
3. Générez des tokens d'accès temporaires
4. Surveillez les sessions actives

### Option B : Scripts automatisés

#### Vérifier le statut :
```powershell
.\setup-remote-access.ps1 -Action status
```

#### Nettoyer la configuration :
```powershell
.\setup-remote-access.ps1 -Action cleanup
```

#### Configuration avec VPN :
```powershell
.\setup-remote-access.ps1 -Action setup -VpnServer "vpn.iahome.fr" -VpnUsername "user" -VpnPassword "pass"
```

## 📱 Clients recommandés

### Bureau à distance (RDP)
- **Windows** : Bureau à distance intégré
- **macOS** : Microsoft Remote Desktop
- **Linux** : Remmina, KRDC
- **Mobile** : Microsoft RDP, Jump Desktop

### VNC
- **Windows** : TightVNC Viewer, RealVNC Viewer
- **macOS** : Screen Sharing, VNC Viewer
- **Linux** : Remmina, Vinagre
- **Mobile** : VNC Viewer, Jump Desktop

### SSH (pour tunnel)
- **Windows** : PuTTY, OpenSSH
- **macOS/Linux** : Terminal intégré
- **Mobile** : Termius, JuiceSSH

## 🔒 Sécurité

### Mots de passe à changer :
1. **Utilisateur Windows** : Changez le mot de passe de session
2. **VNC** : Configurez un mot de passe dans TightVNC
3. **SSH** : Utilisez des clés SSH plutôt que des mots de passe
4. **VPN** : Changez les mots de passe par défaut

### Bonnes pratiques :
- ✅ Utilisez uniquement des connexions VPN
- ✅ Activez l'authentification à deux facteurs
- ✅ Surveillez les logs de connexion
- ✅ Désactivez l'accès quand vous ne l'utilisez pas
- ❌ N'ouvrez pas les ports directement sur Internet
- ❌ N'utilisez pas de mots de passe faibles

## 🚨 Dépannage rapide

### Problème : Impossible de se connecter
**Solution** :
1. Vérifiez que le VPN est actif
2. Testez `ping [IP_PC]`
3. Vérifiez les services : `.\setup-remote-access.ps1 -Action status`
4. Consultez les logs : `C:\temp\remote-access-setup.log`

### Problème : Performance lente
**Solution** :
1. Utilisez RDP plutôt que VNC
2. Réduisez la qualité d'affichage
3. Fermez les applications inutiles
4. Vérifiez la bande passante

### Problème : Déconnexions fréquentes
**Solution** :
1. Vérifiez la stabilité du VPN
2. Activez le keep-alive dans les clients
3. Augmentez les timeouts
4. Vérifiez la charge du NAS

## 📊 Monitoring

### Logs à surveiller :
- **Windows** : `C:\temp\remote-access-setup.log`
- **NAS** : Logs VPN Server
- **Routeur** : Logs de connexion

### Alertes recommandées :
- Tentatives de connexion échouées
- Utilisation anormale de bande passante
- Connexions depuis des IP inconnues

## 🎯 Workflow recommandé

### Avant de commencer à travailler :
1. Connectez-vous au VPN
2. Vérifiez la connectivité : `ping [IP_PC]`
3. Connectez-vous en RDP/VNC
4. Lancez Cursor

### Après avoir terminé :
1. Fermez Cursor
2. Déconnectez-vous de la session distante
3. Déconnectez-vous du VPN
4. Vérifiez que la session est fermée

## 📞 Support

### En cas de problème :
1. **Consultez les logs** : `C:\temp\remote-access-setup.log`
2. **Vérifiez le statut** : `.\setup-remote-access.ps1 -Action status`
3. **Testez la connectivité** : `ping`, `telnet`
4. **Redémarrez les services** si nécessaire

### Ressources utiles :
- Guide NAS détaillé : `scripts/nas-vpn-setup.md`
- Script PowerShell : `scripts/setup-remote-access.ps1`
- Interface web : `https://iahome.fr/remote-access`

---

**⏱️ Temps estimé** : 30 minutes pour la configuration initiale
**🔒 Sécurité** : VPN + authentification forte
**📱 Compatibilité** : Windows, macOS, Linux, Mobile
**🎯 Objectif** : Accès distant sécurisé à Cursor


