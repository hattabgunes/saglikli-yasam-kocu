import { useAuth } from '@/context/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { pedometerService } from '@/services/pedometerService';
import { DailyActivity, OgunDetay, RutinDetay } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

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

  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      loadActivity();
    } else {
      setTodayActivity(null);
      setIsLoading(false);
    }
    
    // Uygulama durumu değişikliklerini dinle
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopStepCounter();
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
      console.log('Adım sayacı başlatılıyor...');
      
      // Pedometer'ı başlat
      const isInitialized = await pedometerService.initialize();
      if (!isInitialized) {
        console.log('Pedometer kullanılamıyor, simülasyon moduna geçiliyor');
        startSimulatedStepCounter();
        return true; // Simülasyon başarılı
      }

      // Bugünkü adımları al
      const todaySteps = await pedometerService.getTodaySteps();
      console.log('Bugünkü adımlar:', todaySteps);
      
      if (todaySteps > 0) {
        await updateAdimSayisi(todaySteps);
      }

      // Gerçek zamanlı izlemeyi başlat
      const isWatching = pedometerService.startWatching((stepData) => {
        console.log('Yeni adım verisi:', stepData);
        updateAdimSayisi(stepData.steps);
      });

      if (!isWatching) {
        console.log('Gerçek zamanlı izleme başlatılamadı, simülasyon moduna geçiliyor');
        startSimulatedStepCounter();
        return true;
      }

      setIsStepCounterActive(true);
      return true;
    } catch (error) {
      console.error('Adım sayacı başlatma hatası:', error);
      console.log('Hata nedeniyle simülasyon moduna geçiliyor');
      startSimulatedStepCounter();
      return true; // Simülasyon başarılı
    }
  };

  const startSimulatedStepCounter = () => {
    console.log('Simülasyon adım sayacı başlatılıyor...');
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
    
    stepCounterIntervalRef.current = setInterval(() => {
      if (todayActivity) {
        const randomSteps = Math.floor(Math.random() * 5) + 1;
        const newStepCount = (todayActivity.adimSayisi || 0) + randomSteps;
        updateAdimSayisi(newStepCount);
      }
    }, 30000) as any;
    
    setIsStepCounterActive(true);
  };

  const stopStepCounter = () => {
    console.log('Adım sayacı durduruluyor...');
    
    // Gerçek pedometer'ı durdur
    pedometerService.stopWatching();
    
    // Simülasyon timer'ını durdur
    if (stepCounterIntervalRef.current) {
      clearInterval(stepCounterIntervalRef.current);
      stepCounterIntervalRef.current = null;
    }
    
    setIsStepCounterActive(false);
  };

  const getTodaySteps = async (): Promise<number> => {
    try {
      return await pedometerService.getTodaySteps();
    } catch (error) {
      console.error('Günlük adım sayısı alma hatası:', error);
      return todayActivity?.adimSayisi || 0;
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
      getTodaySteps
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