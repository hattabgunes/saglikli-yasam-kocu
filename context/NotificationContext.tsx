import { createContext, ReactNode, useContext, useState } from 'react';

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
  // Expo Go'da bildirim sınırlaması nedeniyle geçici olarak basit implementasyon
  const [isInitialized] = useState(true);
  const [hasPermission] = useState(false); // Expo Go'da false
  const [expoPushToken] = useState<string | null>(null);
  const [scheduledCount] = useState(0);

  const setupReminders = async (preferences: NotificationPreferences): Promise<void> => {
    console.log('📱 Bildirim kurulumu (Expo Go\'da devre dışı):', preferences);
    // Development build'de gerçek bildirimler çalışacak
  };

  const sendAchievement = async (achievement: string): Promise<void> => {
    console.log('🏆 Başarı bildirimi (Expo Go\'da devre dışı):', achievement);
  };

  const sendGoalReminder = async (goalType: string, progress: number): Promise<void> => {
    console.log('🎯 Hedef hatırlatıcısı (Expo Go\'da devre dışı):', goalType, progress);
  };

  const cancelAllReminders = async (): Promise<void> => {
    console.log('🚫 Tüm bildirimler iptal edildi (Expo Go\'da devre dışı)');
  };

  const value: NotificationContextType = {
    isInitialized,
    hasPermission,
    expoPushToken,
    setupReminders,
    sendAchievement,
    sendGoalReminder,
    cancelAllReminders,
    scheduledCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}