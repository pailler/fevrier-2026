import { useCallback } from 'react';
import { NotificationServiceClient } from './notificationServiceClient';

export const useNotifications = () => {
  const notificationService = NotificationServiceClient.getInstance();

  const notifyUserCreated = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserCreated(userEmail, userName);
    } catch {}
  }, [notificationService]);

  const notifyUserLogin = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserLogin(userEmail, userName);
    } catch {}
  }, [notificationService]);

  const notifyModuleActivated = useCallback(async (userEmail: string, moduleName: string, userName?: string) => {
    try {
      await notificationService.notifyModuleActivated(userEmail, moduleName, userName);
    } catch {}
  }, [notificationService]);

  const notifyUserLogout = useCallback(async (userEmail: string, userName?: string) => {
    try {
      await notificationService.notifyUserLogout(userEmail, userName);
    } catch {}
  }, [notificationService]);

  return {
    notifyUserCreated,
    notifyUserLogin,
    notifyModuleActivated,
    notifyUserLogout
  };
};
