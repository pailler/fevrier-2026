// Exemples d'intégration des notifications dans les événements existants
import { NotificationService } from './notificationService';

const notificationService = NotificationService.getInstance();

// Exemple 1: Intégration dans la création de compte
export async function handleUserRegistration(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de création de compte...
    console.log('Création du compte pour:', userEmail);
    
    // Envoyer la notification
    await notificationService.notifyUserCreated(userEmail, userName);
    console.log('Notification de création de compte envoyée');
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
  }
}

// Exemple 2: Intégration dans la connexion
export async function handleUserLogin(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de connexion...
    console.log('Connexion de l\'utilisateur:', userEmail);
    
    // Envoyer la notification
    await notificationService.notifyUserLogin(userEmail, userName);
    console.log('Notification de connexion envoyée');
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
  }
}

// Exemple 3: Intégration dans l'activation de module
export async function handleModuleActivation(userEmail: string, moduleName: string, userName?: string) {
  try {
    // Votre logique existante d'activation de module...
    console.log('Activation du module', moduleName, 'pour:', userEmail);
    
    // Envoyer la notification
    await notificationService.notifyModuleActivated(userEmail, moduleName, userName);
    console.log('Notification d\'activation de module envoyée');
  } catch (error) {
    console.error('Erreur lors de l\'activation du module:', error);
  }
}

// Exemple 4: Intégration dans la déconnexion
export async function handleUserLogout(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de déconnexion...
    console.log('Déconnexion de l\'utilisateur:', userEmail);
    
    // Envoyer la notification
    await notificationService.notifyUserLogout(userEmail, userName);
    console.log('Notification de déconnexion envoyée');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

// Exemple d'utilisation dans un composant React
export function useNotificationIntegration() {
  return {
    handleUserRegistration,
    handleUserLogin,
    handleModuleActivation,
    handleUserLogout
  };
}
