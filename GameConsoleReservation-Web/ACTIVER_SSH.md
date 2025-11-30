# 🔓 Activer SSH sur Synology NAS

## Méthode 1 : Via l'interface web DSM

1. **Ouvrez votre navigateur** et allez sur : `http://192.168.1.130:5000`
   - Connectez-vous avec votre compte administrateur

2. **Ouvrez Control Panel**
   - Menu principal > Control Panel

3. **Allez dans Terminal & SNMP**
   - Catégorie "System" > Terminal & SNMP

4. **Activez SSH**
   - Cochez **Enable SSH service**
   - Port par défaut : **22** (laissez tel quel)
   - Cliquez sur **Apply**

5. **Notez vos identifiants**
   - Utilisateur : `admin` (ou votre utilisateur)
   - Mot de passe : (votre mot de passe)

## Méthode 2 : Via l'interface mobile DS finder

1. Ouvrez l'application **DS finder** sur votre téléphone
2. Connectez-vous à votre NAS
3. Allez dans **Settings** > **Terminal** > **Enable SSH**

## Vérifier que SSH est activé

Une fois activé, vous pouvez tester depuis PowerShell :

```powershell
Test-NetConnection -ComputerName 192.168.1.130 -Port 22
```

Si `TcpTestSucceeded : True`, SSH est activé !


