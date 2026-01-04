// Expo Go'da bildirim sınırlaması nedeniyle basit implementasyon
// Development build'de gerçek expo-notifications kullanılacak

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Expo Go'da bildirimler devre dışı
  async initialize(): Promise<boolean> {
    console.log('📱 Bildirim servisi başlatıldı (Expo Go modunda)');
    return false; // Expo Go'da false döndür
  }

  async requestPermissions(): Promise<boolean> {
    console.log('🔔 Bildirim izni istendi (Expo Go\'da devre dışı)');
    return false;
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  async scheduleNotification(notification: NotificationData, trigger: any): Promise<string | null> {
    console.log('📅 Bildirim zamanlandı (Expo Go\'da devre dışı):', notification.title);
    return null;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    console.log('🚫 Bildirim iptal edildi (Expo Go\'da devre dışı):', notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    console.log('🚫 Tüm bildirimler iptal edildi (Expo Go\'da devre dışı)');
  }

  async getScheduledNotifications(): Promise<any[]> {
    return [];
  }

  // Su hatırlatıcıları
  async scheduleWaterReminders(): Promise<void> {
    console.log('💧 Su hatırlatıcıları ayarlandı (Expo Go\'da devre dışı)');
  }

  // Yemek hatırlatıcıları
  async scheduleMealReminders(): Promise<void> {
    console.log('🍽️ Yemek hatırlatıcıları ayarlandı (Expo Go\'da devre dışı)');
  }

  // Egzersiz hatırlatıcıları
  async scheduleExerciseReminders(): Promise<void> {
    console.log('💪 Egzersiz hatırlatıcıları ayarlandı (Expo Go\'da devre dışı)');
  }

  // Motivasyon bildirimleri
  async scheduleMotivationNotifications(): Promise<void> {
    console.log('⭐ Motivasyon bildirimleri ayarlandı (Expo Go\'da devre dışı)');
  }

  // Varsayılan hatırlatıcıları kur
  async setupDefaultReminders(): Promise<void> {
    console.log('🔧 Varsayılan hatırlatıcılar kuruldu (Expo Go\'da devre dışı)');
  }

  // Günlük bildirim zamanla
  async scheduleDaily(options: any): Promise<void> {
    console.log('📅 Günlük bildirim zamanlandı (Expo Go\'da devre dışı):', options);
  }

  // Haftalık bildirim zamanla
  async scheduleWeekly(options: any): Promise<void> {
    console.log('📅 Haftalık bildirim zamanlandı (Expo Go\'da devre dışı):', options);
  }

  // Yerel bildirim zamanla
  async scheduleLocalNotification(options: any): Promise<void> {
    console.log('📱 Yerel bildirim zamanlandı (Expo Go\'da devre dışı):', options);
  }

  // Anlık bildirim gönder
  async sendImmediateNotification(notification: NotificationData): Promise<void> {
    console.log('📢 Anlık bildirim gönderildi (Expo Go\'da devre dışı):', notification.title);
  }

  // Başarı bildirimi
  async sendAchievementNotification(achievement: string): Promise<void> {
    console.log('🏆 Başarı bildirimi (Expo Go\'da devre dışı):', achievement);
  }

  // Hedef hatırlatıcısı
  async sendGoalReminder(goalType: string, progress: number): Promise<void> {
    console.log('🎯 Hedef hatırlatıcısı (Expo Go\'da devre dışı):', goalType, progress);
  }
}

export const notificationService = new NotificationService();