import { useCallback } from 'react';
import { NotificationServiceClient } from './notificationServiceClient';

export const useNotifications = () => {
  const notificationService = NotificationServiceClient.getInstance();

  const notifyUserCreated = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserCreated(userEmail, userName);
    } catch (error) {
      }
  }, []);

  const notifyUserLogin = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserLogin(userEmail, userName);
    } catch (error) {
      }
  }, []);

  const notifyModuleActivated = useCallback(async (userEmail: string, moduleName: string, userName?: string) => {
    try {
      await notificationService.notifyModuleActivated(userEmail, moduleName, userName);
    } catch (error) {
      }
  }, []);

  const notifyUserLogout = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserLogout(userEmail, userName);
    } catch (error) {
      }
  }, []);

  return {
    notifyUserCreated,
    notifyUserLogin,
    notifyModuleActivated,
    notifyUserLogout
  };
};
