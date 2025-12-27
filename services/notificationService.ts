import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // İzin iste ve token al
  async initialize(): Promise<boolean> {
    try {
      // Bildirim izni iste
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Bildirim izni verilmedi');
        return false;
      }

      // Push token al
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'saglikliyasam-6cb5f', // Firebase project ID
      });
      
      this.expoPushToken = token.data;
      console.log('Push token:', this.expoPushToken);
      
      return true;
    } catch (error) {
      console.error('Bildirim başlatma hatası:', error);
      return false;
    }
  }

  // Push token'ı al
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Yerel bildirim gönder
  async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
        },
        trigger: trigger || null,
      });

      return notificationId;
    } catch (error) {
      console.error('Yerel bildirim hatası:', error);
      throw error;
    }
  }

  // Günlük hatırlatıcılar
  async scheduleDaily(
    notification: NotificationData,
    hour: number,
    minute: number = 0
  ): Promise<string> {
    const trigger: Notifications.DailyTriggerInput = {
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleLocalNotification(notification, trigger);
  }

  // Haftalık hatırlatıcılar
  async scheduleWeekly(
    notification: NotificationData,
    weekday: number, // 1=Pazartesi, 7=Pazar
    hour: number,
    minute: number = 0
  ): Promise<string> {
    const trigger: Notifications.WeeklyTriggerInput = {
      weekday,
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleLocalNotification(notification, trigger);
  }

  // Belirli bir tarihte bildirim
  async scheduleAt(
    notification: NotificationData,
    date: Date
  ): Promise<string> {
    const trigger: Notifications.DateTriggerInput = {
      date,
    };

    return this.scheduleLocalNotification(notification, trigger);
  }

  // Tüm bildirimleri iptal et
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Belirli bildirimi iptal et
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Zamanlanmış bildirimleri listele
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Varsayılan hatırlatıcıları ayarla
  async setupDefaultReminders(): Promise<void> {
    try {
      // Sabah su içme hatırlatıcısı (08:00)
      await this.scheduleDaily({
        title: 'Su İçme Zamanı!',
        body: 'Güne bir bardak su ile başla! Hedefin: 2000ml',
        categoryId: 'water'
      }, 8, 0);

      // Öğle yemeği hatırlatıcısı (12:00)
      await this.scheduleDaily({
        title: 'Öğle Yemeği Zamanı!',
        body: 'Sağlıklı bir öğle yemeği için zamanı geldi!',
        categoryId: 'meal'
      }, 12, 0);

      // Egzersiz hatırlatıcısı (18:00)
      await this.scheduleDaily({
        title: 'Egzersiz Zamanı!',
        body: 'Günlük egzersiz hedefin için harekete geç!',
        categoryId: 'exercise'
      }, 18, 0);

      // Akşam su hatırlatıcısı (20:00)
      await this.scheduleDaily({
        title: 'Su İçmeyi Unutma!',
        body: 'Gün boyunca yeterince su içtin mi? Kontrol et!',
        categoryId: 'water'
      }, 20, 0);

      // Haftalık motivasyon (Pazartesi 09:00)
      await this.scheduleWeekly({
        title: '🎯 Yeni Hafta, Yeni Hedefler!',
        body: 'Bu hafta hedeflerine ulaşmak için hazır mısın?',
        categoryId: 'motivation'
      }, 1, 9, 0);

      console.log('✅ Varsayılan hatırlatıcılar ayarlandı');
    } catch (error) {
      console.error('❌ Hatırlatıcı ayarlama hatası:', error);
    }
  }

  // Kişiselleştirilmiş hatırlatıcılar
  async setupPersonalizedReminders(userPreferences: {
    waterReminder: boolean;
    mealReminder: boolean;
    exerciseReminder: boolean;
    waterTimes: number[]; // Saat dizisi [8, 12, 16, 20]
    mealTimes: number[]; // [8, 13, 19]
    exerciseTime: number; // 18
  }): Promise<void> {
    // Önce tüm bildirimleri temizle
    await this.cancelAllNotifications();

    if (userPreferences.waterReminder) {
      for (const hour of userPreferences.waterTimes) {
        await this.scheduleDaily({
          title: 'Su İçme Zamanı!',
          body: `${hour}:00 su içme hatırlatıcın!`,
          categoryId: 'water'
        }, hour);
      }
    }

    if (userPreferences.mealReminder) {
      const mealNames = ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği'];
      userPreferences.mealTimes.forEach((hour, index) => {
        this.scheduleDaily({
          title: `🍽️ ${mealNames[index]} Zamanı!`,
          body: 'Sağlıklı beslenme hedefin için zamanı geldi!',
          categoryId: 'meal'
        }, hour);
      });
    }

    if (userPreferences.exerciseReminder) {
      await this.scheduleDaily({
        title: 'Egzersiz Zamanı!',
        body: 'Günlük hareket hedefin için harekete geç!',
        categoryId: 'exercise'
      }, userPreferences.exerciseTime);
    }
  }

  // Başarı bildirimi gönder
  async sendAchievementNotification(achievement: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: '🎉 Tebrikler!',
      body: `${achievement} hedefini tamamladın!`,
      categoryId: 'achievement'
    });
  }

  // Hedef hatırlatıcısı
  async sendGoalReminder(goalType: string, progress: number): Promise<void> {
    const messages = {
      water: `Su hedefinin %${progress}'i tamamlandı! Devam et!`,
      steps: `Adım hedefinin %${progress}'i tamamlandı! Yürümeye devam!`,
      exercise: `Egzersiz hedefinin %${progress}'i tamamlandı! Biraz daha!`,
      calories: `Kalori hedefinin %${progress}'i tamamlandı! İyi gidiyorsun!`
    };

    await this.scheduleLocalNotification({
      title: '📊 Hedef Durumu',
      body: messages[goalType as keyof typeof messages] || 'Hedefine yaklaşıyorsun!',
      categoryId: 'progress'
    });
  }
}

export const notificationService = new NotificationService();