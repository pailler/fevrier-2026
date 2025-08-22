# 🚀 Guide de Démarrage Rapide - Notifications IAHome

## ✅ Configuration terminée

Votre configuration Resend est prête :
- ✅ `EMAIL_PROVIDER=resend`
- ✅ `RESEND_API_KEY=re_eJ8fb3yV_DXuMCknN7ExXnxXHmf825NJf`
- ✅ `RESEND_FROM_EMAIL=noreply@iahome.fr`
- ✅ `NEXT_PUBLIC_APP_URL=https://iahome.fr`

## 📋 Étapes finales

### 1. Créer le fichier .env.local
Créez le fichier `.env.local` à la racine du projet avec ce contenu :

```env
# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_eJ8fb3yV_DXuMCknN7ExXnxXHmf825NJf
RESEND_FROM_EMAIL=noreply@iahome.fr
NEXT_PUBLIC_APP_URL=https://iahome.fr
```

### 2. Exécuter le SQL dans Supabase
Connectez-vous à votre interface Supabase et exécutez ce SQL :

```sql
-- Table pour la configuration des notifications par email
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL UNIQUE,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    email_template_subject VARCHAR(200),
    email_template_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des événements de notification par défaut
INSERT INTO notification_settings (event_type, event_name, event_description, email_template_subject, email_template_body) VALUES
('user_created', 'Création de compte', 'Un nouvel utilisateur a créé un compte', 'Nouveau compte créé - IAHome', 'Un nouvel utilisateur a créé un compte sur IAHome.'),
('user_login', 'Connexion utilisateur', 'Un utilisateur s''est connecté', 'Connexion utilisateur - IAHome', 'Un utilisateur s''est connecté à IAHome.'),
('module_activated', 'Activation de module', 'Un utilisateur a activé un module', 'Module activé - IAHome', 'Un utilisateur a activé un module sur IAHome.'),
('user_logout', 'Déconnexion utilisateur', 'Un utilisateur s''est déconnecté', 'Déconnexion utilisateur - IAHome', 'Un utilisateur s''est déconnecté d''IAHome.')
ON CONFLICT (event_type) DO NOTHING;

-- Table pour les logs de notifications envoyées
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    event_data JSONB,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON notification_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
```

### 3. Redémarrer l'application
```bash
npm run dev
# ou
yarn dev
```

### 4. Tester le système

1. **Accédez à l'interface admin** : `https://iahome.fr/admin`
2. **Cliquez sur l'onglet "🔔 Notifications"**
3. **Configurez les paramètres** :
   - Activez/désactivez chaque type d'événement
   - Personnalisez les templates d'email
4. **Testez avec le bouton "Test"** pour chaque événement
5. **Vérifiez les logs** dans le tableau en bas

## 🎯 Intégration dans votre code

### Utilisation simple avec le hook
```typescript
import { useNotifications } from '../utils/useNotifications';

function MonComposant() {
  const { notifyUserCreated, notifyUserLogin, notifyModuleActivated, notifyUserLogout } = useNotifications();

  const handleUserRegistration = async (userEmail: string, userName: string) => {
    // Votre logique existante...
    await notifyUserCreated(userEmail, userName);
  };

  const handleModuleActivation = async (userEmail: string, moduleName: string) => {
    // Votre logique existante...
    await notifyModuleActivated(userEmail, moduleName);
  };
}
```

### Utilisation avec le service direct
```typescript
import { NotificationService } from '../utils/notificationService';

const notificationService = NotificationService.getInstance();

// Dans vos gestionnaires d'événements
await notificationService.notifyUserCreated(userEmail, userName);
await notificationService.notifyUserLogin(userEmail, userName);
await notificationService.notifyModuleActivated(userEmail, moduleName, userName);
await notificationService.notifyUserLogout(userEmail, userName);
```

## 🔧 Personnalisation des templates

Dans l'interface admin, vous pouvez personnaliser :

- **Sujet de l'email** : Le titre de l'email
- **Contenu de l'email** : Le corps du message
- **Variables disponibles** : `{userName}`, `{moduleName}`, `{timestamp}`

Exemple de template personnalisé :
```
Bonjour,

L'utilisateur {userName} a activé le module {moduleName} le {timestamp}.

Cordialement,
L'équipe IAHome
```

## 📊 Monitoring

- **Logs en temps réel** dans l'interface admin
- **Statuts d'envoi** (succès/échec)
- **Messages d'erreur** détaillés
- **Historique complet** de tous les envois

## 🚨 Dépannage

### Si les emails ne sont pas envoyés :
1. Vérifiez que Resend est configuré dans `.env.local`
2. Vérifiez que les tables sont créées dans Supabase
3. Testez avec le bouton "Test" dans l'admin
4. Consultez les logs pour les erreurs

### Si l'onglet notifications n'apparaît pas :
1. Vérifiez que le SQL a été exécuté
2. Redémarrez l'application
3. Vérifiez les erreurs dans la console

## 🎉 Félicitations !

Votre système de notifications est maintenant opérationnel ! Vous pouvez :
- ✅ Recevoir des emails pour chaque événement
- ✅ Personnaliser les templates
- ✅ Activer/désactiver les notifications
- ✅ Surveiller les envois
- ✅ Tester en temps réel

Le système est prêt à être utilisé en production ! 🚀
