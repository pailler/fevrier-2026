# Système de Notifications IAHome

## Vue d'ensemble

Le système de notifications permet d'envoyer des emails automatiques via Resend pour différents événements de la plateforme IAHome.

## Événements supportés

1. **Création de compte** (`user_created`)
   - Déclenché quand un nouvel utilisateur s'inscrit
   - Variables disponibles: `{userName}`, `{timestamp}`

2. **Connexion utilisateur** (`user_login`)
   - Déclenché quand un utilisateur se connecte
   - Variables disponibles: `{userName}`, `{timestamp}`

3. **Activation de module** (`module_activated`)
   - Déclenché quand un utilisateur active un module
   - Variables disponibles: `{userName}`, `{moduleName}`, `{timestamp}`

4. **Déconnexion utilisateur** (`user_logout`)
   - Déclenché quand un utilisateur se déconnecte
   - Variables disponibles: `{userName}`, `{timestamp}`

## Installation

### 1. Créer les tables de base de données

Exécutez le script SQL `scripts/create-notifications-table.sql` dans votre base de données Supabase :

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
```

### 2. Configuration Resend

Assurez-vous que les variables d'environnement suivantes sont configurées :

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=votre_clé_api_resend
RESEND_FROM_EMAIL=noreply@votre-domaine.com
```

## Utilisation

### Interface d'administration

1. Accédez à la page d'administration (`/admin`)
2. Cliquez sur l'onglet "🔔 Notifications"
3. Configurez chaque type d'événement :
   - Activez/désactivez les notifications
   - Personnalisez les templates d'email
   - Testez les notifications

### Intégration dans le code

```typescript
import { useNotifications } from '../utils/useNotifications';

function MonComposant() {
  const { notifyUserCreated, notifyUserLogin, notifyModuleActivated, notifyUserLogout } = useNotifications();

  // Exemple d'utilisation
  const handleUserRegistration = async (userEmail: string, userName: string) => {
    // Logique d'inscription...
    
    // Envoyer la notification
    await notifyUserCreated(userEmail, userName);
  };

  const handleModuleActivation = async (userEmail: string, moduleName: string) => {
    // Logique d'activation...
    
    // Envoyer la notification
    await notifyModuleActivated(userEmail, moduleName);
  };
}
```

### API REST

#### Récupérer les paramètres de notification
```http
GET /api/admin/notifications
```

#### Mettre à jour un paramètre
```http
PUT /api/admin/notifications
Content-Type: application/json

{
  "eventType": "user_created",
  "updates": {
    "is_enabled": true,
    "email_template_subject": "Nouveau compte créé"
  }
}
```

#### Envoyer une notification de test
```http
POST /api/admin/notifications
Content-Type: application/json

{
  "eventType": "user_created",
  "userEmail": "test@example.com",
  "eventData": {
    "userName": "Utilisateur de test",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Templates d'email

Les templates utilisent un système de variables simples :

- `{userName}` : Nom de l'utilisateur
- `{moduleName}` : Nom du module (pour les événements de module)
- `{timestamp}` : Horodatage de l'événement

Exemple de template :
```
Bonjour,

L'utilisateur {userName} a créé un compte le {timestamp}.

Cordialement,
L'équipe IAHome
```

## Logs et monitoring

Toutes les tentatives d'envoi de notifications sont loggées dans la table `notification_logs` avec :
- Le type d'événement
- L'email de destination
- Le statut d'envoi (succès/échec)
- Les erreurs éventuelles
- L'horodatage

## Dépannage

### Vérifier la configuration Resend
```typescript
// Dans la console du navigateur
console.log('Configuration email:', {
  emailProvider: process.env.EMAIL_PROVIDER,
  hasResendApiKey: !!process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL
});
```

### Tester une notification
1. Allez dans l'interface d'administration
2. Cliquez sur "Test" pour un événement
3. Entrez un email de test
4. Vérifiez les logs dans l'onglet "Logs des Notifications"

### Erreurs courantes
- **Resend non initialisé** : Vérifiez `RESEND_API_KEY`
- **Email non envoyé** : Vérifiez `RESEND_FROM_EMAIL`
- **Template invalide** : Vérifiez la syntaxe des variables

## Personnalisation

### Ajouter un nouvel événement

1. Ajoutez l'événement dans la base de données :
```sql
INSERT INTO notification_settings (event_type, event_name, event_description, email_template_subject, email_template_body) 
VALUES ('nouvel_evenement', 'Nouvel événement', 'Description du nouvel événement', 'Sujet par défaut', 'Contenu par défaut');
```

2. Ajoutez la méthode dans `NotificationService` :
```typescript
async notifyNouvelEvenement(userEmail: string, data: any): Promise<boolean> {
  return this.sendNotification('nouvel_evenement', userEmail, data);
}
```

3. Ajoutez la méthode dans le hook `useNotifications` :
```typescript
const notifyNouvelEvenement = useCallback(async (userEmail: string, data: any) => {
  try {
    await notificationService.notifyNouvelEvenement(userEmail, data);
  } catch (error) {
    console.error('Erreur lors de la notification:', error);
  }
}, []);
```

## Sécurité

- Les notifications sont envoyées de manière asynchrone
- Les erreurs d'envoi ne bloquent pas le fonctionnement de l'application
- Les logs contiennent uniquement les informations nécessaires
- Les templates sont sanitizés pour éviter les injections
