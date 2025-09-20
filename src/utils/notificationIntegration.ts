// Exemples d'intégration des notifications dans les événements existants
import { NotificationServiceClient } from './notificationServiceClient';

const notificationService = NotificationServiceClient.getInstance();

// Exemple 1: Intégration dans la création de compte
export async function handleUserRegistration(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de création de compte...
    // Envoyer la notification
    await notificationService.notifyUserCreated(userEmail, userName);
    } catch (error) {
    }
}

// Exemple 2: Intégration dans la connexion
export async function handleUserLogin(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de connexion...
    // Envoyer la notification
    await notificationService.notifyUserLogin(userEmail, userName);
    } catch (error) {
    }
}

// Exemple 3: Intégration dans l'activation de module
export async function handleModuleActivation(userEmail: string, moduleName: string, userName?: string) {
  try {
    // Votre logique existante d'activation de module...
    // Envoyer la notification
    await notificationService.notifyModuleActivated(userEmail, moduleName, userName);
    } catch (error) {
    }
}

// Exemple 4: Intégration dans la déconnexion
export async function handleUserLogout(userEmail: string, userName?: string) {
  try {
    // Votre logique existante de déconnexion...
    // Envoyer la notification
    await notificationService.notifyUserLogout(userEmail, userName);
    } catch (error) {
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
