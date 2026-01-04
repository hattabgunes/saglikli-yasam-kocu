import { useAuth } from '@/context/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { notificationService } from '@/services/notificationService';
import { pedometerService } from '@/services/pedometerService';
import { DailyActivity, OgunDetay, RutinDetay } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

interface ActivityContextType {
  todayActivity: DailyActivity | null;
  isLoading: boolean;
  updateSpor: (tamamlandi: boolean, sure?: number) => Promise<void>;
  updateBeslenme: (ogun: 'kahvalti' | 'ogle' | 'aksam' | 'araOgun', ogunDetay: Partial<OgunDetay>) => Promise<void>;
  updateRutin: (rutinId: string, rutinDetay: Partial<RutinDetay>) => Promise<void>;
  updateAdimSayisi: (adim: number, hedefAdim?: number) => Promise<void>;
  updateSuMiktari: (su: number, hedefSu?: number) => Promise<void>;
  updateBeslenmeSkoru: (skor: number) => Promise<void>;
  refreshActivity: () => Promise<void>;
  resetTodayActivity: () => Promise<void>;
  getWeeklyActivities: (startDate: string, endDate: string) => Promise<DailyActivity[]>;
  getMonthlyActivities: (year: number, month: number) => Promise<DailyActivity[]>;
  // Gerçek zamanlı adım sayacı
  isStepCounterActive: boolean;
  startStepCounter: () => Promise<boolean>;
  stopStepCounter: () => void;
  getTodaySteps: () => Promise<number>;
  // Akıllı bildirim sistemi
  setupAdvancedNotifications: () => Promise<void>;
  checkAndSendReminders: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStepCounterActive, setIsStepCounterActive] = useState(false);
  const { firebaseUser, isAuthenticated } = useAuth();
  const stepCounterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStepCountRef = useRef<number>(0);
  const appStateRef = useRef(AppState.currentState);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWaterReminderRef = useRef<number>(0);
  const lastExerciseReminderRef = useRef<number>(0);

  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      loadActivity();
      setupAdvancedNotifications(); // Gelişmiş bildirim sistemini başlat
    } else {
      setTodayActivity(null);
      setIsLoading(false);
    }
    
    // Uygulama durumu değişikliklerini dinle
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Günlük sıfırlama kontrolü - her 10 dakikada bir
    const dailyCheckInterval = setInterval(checkDailyReset, 10 * 60 * 1000);

    return () => {
      stopStepCounter();
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
      clearInterval(dailyCheckInterval);
      subscription.remove();
    };
  }, [isAuthenticated, firebaseUser]);

  useEffect(() => {
    if (todayActivity && !isLoading && firebaseUser) {
      // Adım sayacı izleme başlat
      startStepCounter();
    }
    
    return () => {
      stopStepCounter();
    };
  }, [todayActivity, isLoading, firebaseUser]);

  const loadActivity = async () => {
    if (!firebaseUser) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      let activity = await firestoreService.getDailyActivity(firebaseUser.uid, today);
      
      if (!activity) {
        // Bugün için aktivite yoksa oluştur
        activity = createEmptyActivity(today);
        await firestoreService.saveDailyActivity(firebaseUser.uid, today, activity);
      }
      
      setTodayActivity(activity);
    } catch (error) {
      console.error('Aktivite yüklenirken hata:', error);
      // Hata durumunda boş aktivite oluştur
      const today = new Date().toISOString().split('T')[0];
      setTodayActivity(createEmptyActivity(today));
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyActivity = (date: string): DailyActivity => {
    return {
      tarih: date,
      spor: { tamamlandi: false },
      beslenme: {
        kahvalti: { tamamlandi: false },
        ogle: { tamamlandi: false },
        aksam: { tamamlandi: false },
        araOgun: { tamamlandi: false }
      },
      rutin: {},
      adimSayisi: 0,
      suMiktari: 0,
      beslenmeSkoru: 0,
      gunlukKalori: 0,
      rutinSkoru: 0
    };
  };

  const saveActivity = async (activity: DailyActivity) => {
    if (!firebaseUser) return;
    
    try {
      // Undefined değerleri daha agresif şekilde temizle
      const cleanActivity = removeUndefinedValues(activity);
      
      await firestoreService.saveDailyActivity(firebaseUser.uid, cleanActivity.tarih, cleanActivity);
      setTodayActivity(activity);
    } catch (error) {
      console.error('Aktivite kaydedilirken hata:', error);
      throw error;
    }
  };

  // Undefined değerleri temizleyen yardımcı fonksiyon
  const removeUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(removeUndefinedValues);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  };

  const updateSpor = async (tamamlandi: boolean, sure?: number) => {
    if (!todayActivity) return;
    
    const updatedActivity = {
      ...todayActivity,
      spor: {
        tamamlandi,
        sure: sure || todayActivity.spor.sure
      }
    };
    
    await saveActivity(updatedActivity);
  };

  const updateBeslenme = async (ogun: 'kahvalti' | 'ogle' | 'aksam' | 'araOgun', ogunDetay: Partial<OgunDetay>) => {
    if (!todayActivity) return;
    
    const updatedOgun = {
      ...todayActivity.beslenme[ogun],
      ...ogunDetay
    };
    
    const updatedActivity = {
      ...todayActivity,
      beslenme: {
        ...todayActivity.beslenme,
        [ogun]: updatedOgun
      }
    };
    
    // Günlük kaloriyi hesapla
    const gunlukKalori = Object.values(updatedActivity.beslenme)
      .reduce((total, ogun) => total + (ogun.kalori || 0), 0);
    
    updatedActivity.gunlukKalori = gunlukKalori;
    
    // Beslenme skorunu hesapla
    const tamamlananOgunSayisi = Object.values(updatedActivity.beslenme)
      .filter(ogun => ogun.tamamlandi).length;
    updatedActivity.beslenmeSkoru = Math.round((tamamlananOgunSayisi / 4) * 100);
    
    await saveActivity(updatedActivity);
  };

  const updateRutin = async (rutinId: string, rutinDetay: Partial<RutinDetay>) => {
    if (!todayActivity) return;
    
    // Undefined değerleri temizle
    const cleanedRutinDetay = Object.fromEntries(
      Object.entries(rutinDetay).filter(([_, value]) => value !== undefined)
    );
    
    const updatedRutin = {
      ...todayActivity.rutin[rutinId],
      ...cleanedRutinDetay
    };
    
    const updatedActivity = {
      ...todayActivity,
      rutin: {
        ...todayActivity.rutin,
        [rutinId]: updatedRutin
      }
    };
    
    // Rutin skorunu hesapla
    const rutinler = Object.values(updatedActivity.rutin);
    const tamamlananRutinSayisi = rutinler.filter(rutin => rutin.tamamlandi).length;
    updatedActivity.rutinSkoru = rutinler.length > 0 ? Math.round((tamamlananRutinSayisi / rutinler.length) * 100) : 0;
    
    await saveActivity(updatedActivity);
  };

  const updateAdimSayisi = async (adim: number, hedefAdim?: number) => {
    if (!todayActivity) return;
    
    const updatedActivity = {
      ...todayActivity,
      adimSayisi: adim
    };
    
    await saveActivity(updatedActivity);
  };

  const updateSuMiktari = async (su: number, hedefSu?: number) => {
    if (!todayActivity) return;
    
    const updatedActivity = {
      ...todayActivity,
      suMiktari: su
    };
    
    await saveActivity(updatedActivity);
  };

  const updateBeslenmeSkoru = async (skor: number) => {
    if (!todayActivity) return;
    
    const updatedActivity = {
      ...todayActivity,
      beslenmeSkoru: skor
    };
    
    await saveActivity(updatedActivity);
  };

  const refreshActivity = async () => {
    await loadActivity();
  };

  const resetTodayActivity = async () => {
    if (!firebaseUser) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const cleanActivity = createEmptyActivity(today);
      await firestoreService.saveDailyActivity(firebaseUser.uid, today, cleanActivity);
      setTodayActivity(cleanActivity);
    } catch (error) {
      console.error('Aktivite sıfırlama hatası:', error);
      throw error;
    }
  };

  const getWeeklyActivities = async (startDate: string, endDate: string): Promise<DailyActivity[]> => {
    if (!firebaseUser) return [];
    
    try {
      return await firestoreService.getWeeklyActivities(firebaseUser.uid, startDate, endDate);
    } catch (error) {
      console.error('Haftalık aktiviteler alınırken hata:', error);
      return [];
    }
  };

  const getMonthlyActivities = async (year: number, month: number): Promise<DailyActivity[]> => {
    if (!firebaseUser) return [];
    
    try {
      return await firestoreService.getMonthlyActivities(firebaseUser.uid, year, month);
    } catch (error) {
      console.error('Aylık aktiviteler alınırken hata:', error);
      return [];
    }
  };

  const handleAppStateChange = (nextAppState: any) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // Uygulama ön plana geldiğinde aktiviteyi yenile
      refreshActivity();
    }
    appStateRef.current = nextAppState;
  };

  const startStepCounter = async (): Promise<boolean> => {
    try {
      console.log('🚶‍♂️ Gerçek adım sayacı başlatılıyor...');
      
      // Pedometer'ı başlat
      const isInitialized = await pedometerService.initialize();
      if (!isInitialized) {
        console.log('❌ Pedometer kullanılamıyor');
        setIsStepCounterActive(false);
        return false;
      }

      // Bugünkü adımları al
      const todaySteps = await pedometerService.getTodaySteps();
      console.log('📊 Bugünkü adımlar:', todaySteps);
      
      if (todaySteps > 0) {
        await updateAdimSayisi(todaySteps);
      }

      // Gerçek zamanlı izlemeyi başlat
      const isWatching = pedometerService.startWatching((stepData) => {
        console.log('👟 Yeni adım verisi:', stepData.steps);
        updateAdimSayisi(stepData.steps);
      });

      if (!isWatching) {
        console.log('❌ Gerçek zamanlı izleme başlatılamadı');
        setIsStepCounterActive(false);
        return false;
      }

      setIsStepCounterActive(true);
      console.log('✅ Gerçek adım sayacı aktif');
      return true;
    } catch (error) {
      console.error('❌ Adım sayacı başlatma hatası:', error);
      setIsStepCounterActive(false);
      return false;
    }
  };

  const stopStepCounter = () => {
    console.log('🛑 Adım sayacı durduruluyor...');
    
    // Gerçek pedometer'ı durdur
    pedometerService.stopWatching();
    
    setIsStepCounterActive(false);
  };

  const getTodaySteps = async (): Promise<number> => {
    try {
      // Önce pedometer servisinden gerçek adımları almaya çalış
      const realSteps = await pedometerService.getTodaySteps();
      if (realSteps > 0) {
        return realSteps;
      }
      
      // Pedometer çalışmıyorsa mevcut aktivite değerini döndür
      if (todayActivity?.adimSayisi !== undefined) {
        return todayActivity.adimSayisi;
      }
      
      return 0;
    } catch (error) {
      console.error('Adım sayısı alma hatası:', error);
      return todayActivity?.adimSayisi || 0;
    }
  };

  // Gelişmiş bildirim sistemi - background'da çalışır
  const setupAdvancedNotifications = async (): Promise<void> => {
    try {
      console.log('🔔 Gelişmiş bildirim sistemi kuruluyor...');
      
      // Bildirim servisini başlat
      const isInitialized = await notificationService.initialize();
      if (!isInitialized) {
        console.log('❌ Bildirim izni verilmedi');
        return;
      }
      
      // Tüm eski bildirimleri temizle
      await notificationService.cancelAllNotifications();
      
      // Sabit zamanlanmış bildirimler (background'da çalışır)
      const notifications = [
        // Su içme hatırlatıcıları
        { hour: 8, minute: 0, title: '💧 Günaydın!', body: 'Güne bir bardak su ile başla!' },
        { hour: 10, minute: 0, title: '💧 Su Zamanı', body: 'Su içmeyi unutma! Hedefin: 2000ml' },
        { hour: 12, minute: 0, title: '💧 Öğle Su Molası', body: 'Öğle yemeğinden önce su iç!' },
        { hour: 14, minute: 0, title: '💧 Öğleden Sonra Su', body: 'Günün yarısında su kontrolü!' },
        { hour: 16, minute: 0, title: '💧 İkindi Su Molası', body: 'Enerji için su iç!' },
        { hour: 18, minute: 0, title: '💧 Akşam Su Hatırlatıcısı', body: 'Gün sona ererken su iç!' },
        { hour: 20, minute: 0, title: '💧 Son Su Hatırlatıcısı', body: 'Günlük su hedefini tamamla!' },
        
        // Yemek hatırlatıcıları
        { hour: 8, minute: 30, title: '🍳 Kahvaltı Zamanı', body: 'Güne sağlıklı bir kahvaltı ile başla!' },
        { hour: 12, minute: 30, title: '🍽️ Öğle Yemeği', body: 'Dengeli bir öğle yemeği zamanı!' },
        { hour: 15, minute: 30, title: '🥗 Ara Öğün', body: 'Sağlıklı bir ara öğün almayı unutma!' },
        { hour: 19, minute: 0, title: '🍽️ Akşam Yemeği', body: 'Akşam yemeği için zamanı geldi!' },
        
        // Egzersiz hatırlatıcıları
        { hour: 7, minute: 0, title: '🏃‍♂️ Sabah Egzersizi', body: 'Güne spor ile başlamaya ne dersin?' },
        { hour: 17, minute: 0, title: '🏃‍♂️ Akşam Egzersizi', body: 'Günlük egzersiz hedefin için zamanı geldi!' },
        { hour: 21, minute: 0, title: '🏃‍♂️ Egzersiz Kontrolü', body: 'Bugün egzersiz yaptın mı? Yarın için plan yap!' },
        
        // Motivasyon bildirimleri
        { hour: 9, minute: 0, title: '🌟 Günaydın Şampiyon!', body: 'Bugün hedeflerine bir adım daha yaklaş!' },
        { hour: 13, minute: 0, title: '💪 Yarı Yol!', body: 'Günün yarısında harikasın! Devam et!' },
        { hour: 22, minute: 0, title: '🌙 İyi Geceler', body: 'Bugünkü başarıların için tebrikler! Yarın yeni hedefler!' }
      ];
      
      // Her bildirimi zamanla
      for (const notif of notifications) {
        await notificationService.scheduleDaily({
          title: notif.title,
          body: notif.body,
          categoryId: 'health',
          hour: notif.hour,
          minute: notif.minute
        });
      }
      
      // Haftalık motivasyon (Pazartesi 09:00)
      await notificationService.scheduleWeekly({
        title: '🎯 Yeni Hafta Başlıyor!',
        body: 'Bu hafta hedeflerine ulaşmak için hazır mısın? Hadi başlayalım!',
        categoryId: 'motivation',
        dayOfWeek: 1,
        hour: 9,
        minute: 0
      });
      
      // Hafta sonu değerlendirme (Pazar 20:00)
      await notificationService.scheduleWeekly({
        title: '📊 Haftalık Değerlendirme',
        body: 'Bu hafta nasıl geçti? Gelecek hafta için planlarını yap!',
        categoryId: 'review',
        dayOfWeek: 7,
        hour: 20,
        minute: 0
      });
      
      console.log('✅ Gelişmiş bildirim sistemi kuruldu - Background\'da çalışacak');
      
    } catch (error) {
      console.error('❌ Gelişmiş bildirim sistemi hatası:', error);
    }
  };

  const setupMealNotifications = async () => {
    // Günlük yemek saati bildirimleri
    const mealSchedule = [
      { hour: 8, minute: 0, meal: 'Kahvaltı', message: 'Güne sağlıklı bir kahvaltı ile başla!' },
      { hour: 12, minute: 30, meal: 'Öğle Yemeği', message: 'Öğle yemeği zamanı! Dengeli beslen.' },
      { hour: 19, minute: 0, meal: 'Akşam Yemeği', message: 'Akşam yemeği için zamanı geldi!' },
      { hour: 15, minute: 30, meal: 'Ara Öğün', message: 'Sağlıklı bir ara öğün almayı unutma!' }
    ];

    for (const meal of mealSchedule) {
      await notificationService.scheduleDaily({
        title: `🍽️ ${meal.meal} Zamanı!`,
        body: meal.message,
        categoryId: 'meal',
        hour: meal.hour,
        minute: meal.minute
      });
    }
  };

  const startPeriodicReminders = () => {
    // Her 30 dakikada bir kontrol et
    notificationIntervalRef.current = setInterval(() => {
      checkAndSendReminders();
    }, 30 * 60 * 1000) as any; // 30 dakika
  };

  const checkAndSendReminders = async () => {
    if (!todayActivity) return;

    const now = Date.now();
    const currentHour = new Date().getHours();
    
    // Sadece gündüz saatlerinde hatırlatıcı gönder (7-22 arası)
    if (currentHour < 7 || currentHour > 22) return;

    try {
      // Su hatırlatıcısı - 1.5 saatte bir
      const waterReminderInterval = 90 * 60 * 1000; // 1.5 saat
      if (now - lastWaterReminderRef.current > waterReminderInterval) {
        const waterProgress = (todayActivity.suMiktari || 0) / 2000 * 100;
        
        if (waterProgress < 80) { // %80'den az ise hatırlat
          await notificationService.scheduleLocalNotification({
            title: '💧 Su İçmeyi Unutma!',
            body: `Bugün ${todayActivity.suMiktari || 0}ml su içtin. Hedefin: 2000ml`,
            categoryId: 'water'
          });
          lastWaterReminderRef.current = now;
        }
      }

      // Egzersiz hatırlatıcısı - 2 saatte bir
      const exerciseReminderInterval = 120 * 60 * 1000; // 2 saat
      if (now - lastExerciseReminderRef.current > exerciseReminderInterval) {
        if (!todayActivity.spor.tamamlandi) {
          await notificationService.scheduleLocalNotification({
            title: '🏃‍♂️ Hareket Zamanı!',
            body: 'Bugün henüz egzersiz yapmadın. Biraz hareket etmeye ne dersin?',
            categoryId: 'exercise'
          });
          lastExerciseReminderRef.current = now;
        }
      }

      // Günlük hedef kontrolleri
      await checkDailyGoals();
      
    } catch (error) {
      console.error('❌ Hatırlatıcı gönderme hatası:', error);
    }
  };

  const checkDailyGoals = async () => {
    if (!todayActivity) return;

    const currentHour = new Date().getHours();
    
    // Akşam saatlerinde (20:00-22:00) günlük özet gönder
    if (currentHour >= 20 && currentHour <= 22) {
      const completedGoals = [];
      const pendingGoals = [];

      // Spor kontrolü
      if (todayActivity.spor.tamamlandi) {
        completedGoals.push('Egzersiz');
      } else {
        pendingGoals.push('Egzersiz');
      }

      // Su kontrolü
      const waterProgress = (todayActivity.suMiktari || 0) / 2000 * 100;
      if (waterProgress >= 100) {
        completedGoals.push('Su içme');
      } else {
        pendingGoals.push('Su içme');
      }

      // Beslenme kontrolü
      const mealCount = Object.values(todayActivity.beslenme).filter(meal => meal.tamamlandi).length;
      if (mealCount >= 3) {
        completedGoals.push('Beslenme');
      } else {
        pendingGoals.push('Beslenme');
      }

      // Günlük özet bildirimi
      if (completedGoals.length > 0 || pendingGoals.length > 0) {
        let message = '';
        if (completedGoals.length > 0) {
          message += `Tamamlanan: ${completedGoals.join(', ')}. `;
        }
        if (pendingGoals.length > 0) {
          message += `Kalan: ${pendingGoals.join(', ')}.`;
        }

        await notificationService.scheduleLocalNotification({
          title: '📊 Günlük Özet',
          body: message,
          categoryId: 'summary'
        });
      }
    }
  };

  // Günlük sıfırlama kontrolü
  const checkDailyReset = () => {
    if (!todayActivity) return;

    const today = new Date().toISOString().split('T')[0];
    const activityDate = todayActivity.tarih;

    // Eğer aktivite tarihi bugünden farklıysa yeni gün başlamış
    if (activityDate !== today) {
      console.log('🌅 Yeni gün başladı, aktivite sıfırlanıyor...');
      loadActivity(); // Yeni günün aktivitesini yükle
      
      // Yeni gün motivasyon bildirimi
      notificationService.scheduleLocalNotification({
        title: '🌅 Günaydın!',
        body: 'Yeni bir gün, yeni hedefler! Bugün de sağlıklı kalmaya odaklan.',
        categoryId: 'motivation'
      });
    }
  };

  return (
    <ActivityContext.Provider value={{
      todayActivity,
      isLoading,
      updateSpor,
      updateBeslenme,
      updateRutin,
      updateAdimSayisi,
      updateSuMiktari,
      updateBeslenmeSkoru,
      refreshActivity,
      resetTodayActivity,
      getWeeklyActivities,
      getMonthlyActivities,
      // Gerçek zamanlı adım sayacı
      isStepCounterActive,
      startStepCounter,
      stopStepCounter,
      getTodaySteps,
      // Akıllı bildirim sistemi
      setupAdvancedNotifications,
      checkAndSendReminders
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}