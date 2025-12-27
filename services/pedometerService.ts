import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface StepData {
  steps: number;
  timestamp: number;
}

export interface PedometerSubscription {
  remove: () => void;
}

class PedometerService {
  private subscription: PedometerSubscription | null = null;
  private isAvailable: boolean = false;

  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Pedometer web platformunda desteklenmiyor');
        return false;
      }

      // Önce izinleri kontrol et
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Pedometer izni verilmedi');
        return false;
      }

      this.isAvailable = await Pedometer.isAvailableAsync();
      console.log('Pedometer durumu:', this.isAvailable);
      
      if (!this.isAvailable) {
        console.log('Pedometer cihazda kullanılamıyor');
        return false;
      }

      return this.isAvailable;
    } catch (error) {
      console.error('Pedometer başlatma hatası:', error);
      this.isAvailable = false;
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    try {
      if (!this.isAvailable) {
        console.log('Pedometer kullanılamıyor, 0 döndürülüyor');
        return 0;
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const now = new Date();

      const result = await Pedometer.getStepCountAsync(startOfDay, now);
      console.log('Pedometer sonucu:', result);
      return result.steps || 0;
    } catch (error) {
      console.error('Günlük adım sayısı alma hatası:', error);
      // Hata durumunda 0 döndür, uygulama çökmesin
      return 0;
    }
  }

  startWatching(callback: (stepData: StepData) => void): boolean {
    try {
      if (!this.isAvailable) {
        console.log('Pedometer kullanılamıyor, izleme başlatılamıyor');
        return false;
      }

      if (this.subscription) {
        console.log('Mevcut izleme durduruluyor');
        this.stopWatching();
      }

      console.log('Pedometer izleme başlatılıyor...');
      this.subscription = Pedometer.watchStepCount((result) => {
        console.log('Pedometer callback:', result);
        callback({
          steps: result.steps || 0,
          timestamp: Date.now()
        });
      });

      console.log('Adım sayacı başlatıldı');
      return true;
    } catch (error) {
      console.error('Adım sayacı başlatma hatası:', error);
      return false;
    }
  }

  stopWatching(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
      console.log('Adım sayacı durduruldu');
    }
  }

  async getWeeklySteps(): Promise<number> {
    try {
      if (!this.isAvailable) {
        return 0;
      }

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const result = await Pedometer.getStepCountAsync(weekAgo, today);
      return result.steps || 0;
    } catch (error) {
      console.error('Haftalık adım sayısı alma hatası:', error);
      return 0;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android'de ACTIVITY_RECOGNITION izni gerekli
        // Bu izin app.json'da tanımlı
        return true;
      }
      return true;
    } catch (error) {
      console.error('İzin isteme hatası:', error);
      return false;
    }
  }
}

export const pedometerService = new PedometerService();