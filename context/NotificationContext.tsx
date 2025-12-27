import { notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface NotificationContextType {
  isInitialized: boolean;
  hasPermission: boolean;
  expoPushToken: string | null;
  setupReminders: (preferences: NotificationPreferences) => Promise<void>;
  sendAchievement: (achievement: string) => Promise<void>;
  sendGoalReminder: (goalType: string, progress: number) => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  scheduledCount: number;
}

export interface NotificationPreferences {
  waterReminder: boolean;
  mealReminder: boolean;
  exerciseReminder: boolean;
  waterTimes: number[];
  mealTimes: number[];
  exerciseTime: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    initializeNotifications();
    setupNotificationListeners();
  }, []);

  const initializeNotifications = async () => {
    try {
      const success = await notificationService.initialize();
      setHasPermission(success);
      setIsInitialized(true);
      
      if (success) {
        const token = notificationService.getExpoPushToken();
        setExpoPushToken(token);
        
        // Varsayılan hatırlatıcıları ayarla (sadece ilk kez)
        const scheduled = await notificationService.getScheduledNotifications();
        if (scheduled.length === 0) {
          await notificationService.setupDefaultReminders();
        }
        updateScheduledCount();
      }
    } catch (error) {
      console.error('Bildirim başlatma hatası:', error);
      setIsInitialized(true);
    }
  };

  const setupNotificationListeners = () => {
    // Bildirime tıklandığında
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Bildirim alındı:', notification);
    });

    // Bildirime tıklandığında
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Bildirime tıklandı:', response);
      
      const categoryId = response.notification.request.content.categoryIdentifier;
      
      // Bildirim türüne göre yönlendirme yapılabilir
      switch (categoryId) {
        case 'water':
          // Su sayfasına yönlendir
          break;
        case 'exercise':
          // Egzersiz sayfasına yönlendir
          break;
        case 'meal':
          // Beslenme sayfasına yönlendir
          break;
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const updateScheduledCount = async () => {
    try {
      const scheduled = await notificationService.getScheduledNotifications();
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Zamanlanmış bildirim sayısı alınamadı:', error);
    }
  };

  const setupReminders = async (preferences: NotificationPreferences) => {
    try {
      await notificationService.setupPersonalizedReminders(preferences);
      await updateScheduledCount();
      console.log('✅ Kişiselleştirilmiş hatırlatıcılar ayarlandı');
    } catch (error) {
      console.error('❌ Hatırlatıcı ayarlama hatası:', error);
      throw error;
    }
  };

  const sendAchievement = async (achievement: string) => {
    try {
      await notificationService.sendAchievementNotification(achievement);
    } catch (error) {
      console.error('❌ Başarı bildirimi hatası:', error);
    }
  };

  const sendGoalReminder = async (goalType: string, progress: number) => {
    try {
      await notificationService.sendGoalReminder(goalType, progress);
    } catch (error) {
      console.error('❌ Hedef hatırlatıcısı hatası:', error);
    }
  };

  const cancelAllReminders = async () => {
    try {
      await notificationService.cancelAllNotifications();
      await updateScheduledCount();
      console.log('✅ Tüm hatırlatıcılar iptal edildi');
    } catch (error) {
      console.error('❌ Hatırlatıcı iptal hatası:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider value={{
      isInitialized,
      hasPermission,
      expoPushToken,
      setupReminders,
      sendAchievement,
      sendGoalReminder,
      cancelAllReminders,
      scheduledCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}