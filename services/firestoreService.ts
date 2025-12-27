import { db } from '@/config/firebase';
import { DailyActivity } from '@/types';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where
} from 'firebase/firestore';

class FirestoreService {
  // Günlük aktivite kaydet
  async saveDailyActivity(userId: string, date: string, activity: DailyActivity): Promise<void> {
    try {
      const activityRef = doc(db, 'users', userId, 'activities', date);
      await setDoc(activityRef, {
        ...activity,
        sonGuncelleme: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Aktivite kaydetme hatası:', error);
      throw error;
    }
  }
  
  // Günlük aktivite al
  async getDailyActivity(userId: string, date: string): Promise<DailyActivity | null> {
    try {
      const activityRef = doc(db, 'users', userId, 'activities', date);
      const activityDoc = await getDoc(activityRef);
      
      if (activityDoc.exists()) {
        return activityDoc.data() as DailyActivity;
      }
      return null;
    } catch (error) {
      console.error('Aktivite alma hatası:', error);
      throw error;
    }
  }
  
  // Haftalık aktiviteler al
  async getWeeklyActivities(userId: string, startDate: string, endDate: string): Promise<DailyActivity[]> {
    try {
      const activitiesRef = collection(db, 'users', userId, 'activities');
      const q = query(
        activitiesRef,
        where('tarih', '>=', startDate),
        where('tarih', '<=', endDate),
        orderBy('tarih', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const activities: DailyActivity[] = [];
      
      querySnapshot.forEach((doc) => {
        activities.push(doc.data() as DailyActivity);
      });
      
      return activities;
    } catch (error) {
      console.error('Haftalık aktivite alma hatası:', error);
      throw error;
    }
  }
  
  // Aylık aktiviteler al
  async getMonthlyActivities(userId: string, year: number, month: number): Promise<DailyActivity[]> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      return await this.getWeeklyActivities(userId, startDate, endDate);
    } catch (error) {
      console.error('Aylık aktivite alma hatası:', error);
      throw error;
    }
  }
  
  // Kullanıcı istatistikleri al
  async getUserStats(userId: string): Promise<any> {
    try {
      const statsRef = doc(db, 'users', userId, 'stats', 'summary');
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        return statsDoc.data();
      }
      return null;
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      throw error;
    }
  }
  
  // Kullanıcı istatistikleri güncelle
  async updateUserStats(userId: string, stats: any): Promise<void> {
    try {
      const statsRef = doc(db, 'users', userId, 'stats', 'summary');
      await setDoc(statsRef, {
        ...stats,
        sonGuncelleme: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('İstatistik güncelleme hatası:', error);
      throw error;
    }
  }
  
  // Özel egzersizler kaydet
  async saveCustomExercises(userId: string, exercises: any[]): Promise<void> {
    try {
      const exercisesRef = doc(db, 'users', userId, 'custom', 'exercises');
      await setDoc(exercisesRef, {
        exercises,
        sonGuncelleme: serverTimestamp()
      });
    } catch (error) {
      console.error('Özel egzersiz kaydetme hatası:', error);
      throw error;
    }
  }
  
  // Özel egzersizler al
  async getCustomExercises(userId: string): Promise<any[]> {
    try {
      const exercisesRef = doc(db, 'users', userId, 'custom', 'exercises');
      const exercisesDoc = await getDoc(exercisesRef);
      
      if (exercisesDoc.exists()) {
        return exercisesDoc.data().exercises || [];
      }
      return [];
    } catch (error) {
      console.error('Özel egzersiz alma hatası:', error);
      throw error;
    }
  }
  
  // Haftalık menü kaydet
  async saveWeeklyMenu(userId: string, menu: any): Promise<void> {
    try {
      const menuRef = doc(db, 'users', userId, 'nutrition', 'weeklyMenu');
      await setDoc(menuRef, {
        menu,
        sonGuncelleme: serverTimestamp()
      });
    } catch (error) {
      console.error('Menü kaydetme hatası:', error);
      throw error;
    }
  }
  
  // Haftalık menü al
  async getWeeklyMenu(userId: string): Promise<any> {
    try {
      const menuRef = doc(db, 'users', userId, 'nutrition', 'weeklyMenu');
      const menuDoc = await getDoc(menuRef);
      
      if (menuDoc.exists()) {
        return menuDoc.data().menu || {};
      }
      return {};
    } catch (error) {
      console.error('Menü alma hatası:', error);
      throw error;
    }
  }
  
  // Rutinler kaydet
  async saveRoutines(userId: string, routines: any): Promise<void> {
    try {
      const routinesRef = doc(db, 'users', userId, 'custom', 'routines');
      await setDoc(routinesRef, {
        routines,
        sonGuncelleme: serverTimestamp()
      });
    } catch (error) {
      console.error('Rutin kaydetme hatası:', error);
      throw error;
    }
  }
  
  // Rutinler al
  async getRoutines(userId: string): Promise<any> {
    try {
      const routinesRef = doc(db, 'users', userId, 'custom', 'routines');
      const routinesDoc = await getDoc(routinesRef);
      
      if (routinesDoc.exists()) {
        return routinesDoc.data().routines || {};
      }
      return {};
    } catch (error) {
      console.error('Rutin alma hatası:', error);
      throw error;
    }
  }
  
  // Kullanıcı verilerini sil (GDPR uyumluluğu için)
  async deleteUserData(userId: string): Promise<void> {
    try {
      // Ana kullanıcı dokümanını sil
      await deleteDoc(doc(db, 'users', userId));
      
      // Alt koleksiyonları da silmek için batch işlem gerekebilir
      // Bu örnekte sadana dokümanı siliyoruz
    } catch (error) {
      console.error('Kullanıcı verisi silme hatası:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();