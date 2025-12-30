import { auth } from '@/config/firebase';
import { authService, RegisterData, UserProfile } from '@/services/authService';
import { googleSignInService } from '@/services/googleSignInService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local storage'dan kullanıcı bilgilerini yükle
  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_profile');
      const storedFirebaseUser = await AsyncStorage.getItem('firebase_user');
      
      if (storedUser && storedFirebaseUser) {
        console.log('📱 Local storage\'dan kullanıcı yüklendi');
        setUser(JSON.parse(storedUser));
        // Firebase user'ı direkt set etmiyoruz, onAuthStateChanged'den gelsin
      }
    } catch (error) {
      console.error('❌ Local storage okuma hatası:', error);
    }
  };

  // Kullanıcı bilgilerini local storage'a kaydet
  const saveUserToStorage = async (userProfile: UserProfile | null, fbUser: FirebaseUser | null) => {
    try {
      if (userProfile && fbUser) {
        await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
        await AsyncStorage.setItem('firebase_user', JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        }));
        console.log('💾 Kullanıcı bilgileri local storage\'a kaydedildi');
      } else {
        await AsyncStorage.removeItem('user_profile');
        await AsyncStorage.removeItem('firebase_user');
        console.log('🗑️ Local storage temizlendi');
      }
    } catch (error) {
      console.error('❌ Local storage yazma hatası:', error);
    }
  };

  useEffect(() => {
    // Önce local storage'dan yükle
    loadUserFromStorage();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser?.email || 'null');
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          // Firebase kullanıcısı varsa Firestore'dan profil bilgilerini al
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          console.log('👤 User profile loaded:', userProfile?.ad || 'null');
          
          setFirebaseUser(firebaseUser);
          setUser(userProfile);
          
          // Local storage'a kaydet
          await saveUserToStorage(userProfile, firebaseUser);
          
        } catch (error) {
          console.error('❌ Kullanıcı profili yüklenirken hata:', error);
          setFirebaseUser(null);
          setUser(null);
          await saveUserToStorage(null, null);
        }
      } else {
        console.log('❌ No firebase user');
        setFirebaseUser(null);
        setUser(null);
        await saveUserToStorage(null, null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    console.log('🔐 Giriş denemesi:', email);
    try {
      const result = await authService.login(email, password);
      console.log('🔐 Giriş sonucu:', result);
      if (result.success && result.user) {
        setUser(result.user);
        // Local storage'a kaydet
        await saveUserToStorage(result.user, auth.currentUser);
        console.log('✅ Kullanıcı set edildi ve kaydedildi:', result.user.ad);
      }
      return result;
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      return { success: false, message: 'Giriş yapılırken bir hata oluştu.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success && result.user) {
        setUser(result.user);
        // Local storage'a kaydet
        await saveUserToStorage(result.user, auth.currentUser);
      }
      return result;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { success: false, message: 'Kayıt olurken bir hata oluştu.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    console.log('🔐 Google ile giriş denemesi başlıyor...');
    try {
      const result = await googleSignInService.signIn();
      console.log('🔐 Google giriş sonucu:', result);
      if (result.success && result.user) {
        setUser(result.user);
        // Local storage'a kaydet
        await saveUserToStorage(result.user, auth.currentUser);
        console.log('✅ Google kullanıcısı set edildi ve kaydedildi:', result.user.ad);
      }
      return result;
    } catch (error) {
      console.error('❌ Google giriş hatası:', error);
      return { success: false, message: 'Google ile giriş yapılırken bir hata oluştu.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Çıkış yapılıyor...');
    try {
      await authService.logout();
      await googleSignInService.signOut(); // Google'dan da çıkış yap
      console.log('✅ Firebase logout başarılı');
      
      // State'i temizle
      setUser(null);
      setFirebaseUser(null);
      
      // Local storage'ı temizle
      await saveUserToStorage(null, null);
      
      console.log('✅ User state ve local storage temizlendi');
    } catch (error) {
      console.error('❌ Çıkış yapılırken hata:', error);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      return { success: false, message: 'Şifre sıfırlama işlemi başarısız.' };
    }
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user || !firebaseUser) return;
    
    try {
      await authService.updateUserProfile(firebaseUser.uid, userData);
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Local storage'ı güncelle
      await saveUserToStorage(updatedUser, firebaseUser);
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    try {
      const userProfile = await authService.getUserProfile(firebaseUser.uid);
      setUser(userProfile);
    } catch (error) {
      console.error('Kullanıcı yenilenirken hata:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      isLoading,
      isAuthenticated: !!user && !!firebaseUser,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}