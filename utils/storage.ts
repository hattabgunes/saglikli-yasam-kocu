import { DailyActivity, defaultUserProfile, UserProfile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key'leri
const STORAGE_KEYS = {
  USER_PROFILE: '@saglikli_yasam:user_profile',
  DAILY_ACTIVITIES: '@saglikli_yasam:daily_activities',
};

// Tarih formatı: YYYY-MM-DD
export const getTodayDate = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Kullanıcı profil işlemleri
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Profil kaydedilirken hata:', error);
    throw error;
  }
};

export const loadUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      return JSON.parse(data);
    }
    return defaultUserProfile;
  } catch (error) {
    console.error('Profil yüklenirken hata:', error);
    return defaultUserProfile;
  }
};

// Günlük aktivite işlemleri
export const saveDailyActivity = async (activity: DailyActivity): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITIES);
    const activities: Record<string, DailyActivity> = data ? JSON.parse(data) : {};
    activities[activity.tarih] = activity;
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITIES, JSON.stringify(activities));
  } catch (error) {
    console.error('Aktivite kaydedilirken hata:', error);
    throw error;
  }
};

export const loadDailyActivity = async (tarih: string): Promise<DailyActivity | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITIES);
    if (data) {
      const activities: Record<string, DailyActivity> = JSON.parse(data);
      return activities[tarih] || null;
    }
    return null;
  } catch (error) {
    console.error('Aktivite yüklenirken hata:', error);
    return null;
  }
};

export const loadTodayActivity = async (): Promise<DailyActivity | null> => {
  return loadDailyActivity(getTodayDate());
};

export const getAllActivities = async (): Promise<Record<string, DailyActivity>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITIES);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Aktiviteler yüklenirken hata:', error);
    return {};
  }
};

// Bugünün aktivitesini oluştur veya getir
export const getOrCreateTodayActivity = async (): Promise<DailyActivity> => {
  const today = getTodayDate();
  const existing = await loadDailyActivity(today);
  
  if (existing) {
    // Eski format kontrolü ve dönüşümü
    if (existing.rutin) {
      const updatedRutin: { [rutinId: string]: any } = {};
      
      Object.entries(existing.rutin).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          // Eski boolean formatını yeni RutinDetay formatına dönüştür
          updatedRutin[key] = {
            tamamlandi: value,
            zaman: value ? new Date().toISOString() : undefined,
          };
        } else {
          // Zaten yeni format
          updatedRutin[key] = value;
        }
      });
      
      existing.rutin = updatedRutin;
      await saveDailyActivity(existing);
    }
    
    return existing;
  }

  const newActivity: DailyActivity = {
    tarih: today,
    spor: {
      tamamlandi: false,
    },
    beslenme: {
      kahvalti: { tamamlandi: false },
      ogle: { tamamlandi: false },
      aksam: { tamamlandi: false },
      araOgun: { tamamlandi: false },
    },
    rutin: {
      su: { tamamlandi: false },
      uyku: { tamamlandi: false },
      adim: { tamamlandi: false },
    },
    beslenmeSkoru: 0,
    gunlukKalori: 0,
  };

  await saveDailyActivity(newActivity);
  return newActivity;
};




