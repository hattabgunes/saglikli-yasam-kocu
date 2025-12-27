import { auth, db } from '@/config/firebase';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  ad: string;
  soyad: string;
  telefon?: string;
  kayitTarihi: any;
  sonGiris?: any;
  emailVerified: boolean;
  photoURL?: string;
  // Profil bilgileri
  yas?: string;
  cinsiyet?: string;
  kilo?: string;
  boy?: string;
  hedefKilo?: string;
  hedefAdim?: string;
  hedefSu?: string;
  hedefSpor?: string;
  hedefKalori?: string;
  beslenmeHedefi?: 'kilo-ver' | 'kilo-al' | 'koru' | 'kas-kazan';
  aktiviteSeviyesi?: string;
  hedefTarihi?: string;
  haftalikHedefKilo?: string;
  kronikHastalik?: string;
  alerji?: string;
  ilac?: string;
  notifikasyon?: boolean;
  darkMode?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  ad: string;
  soyad: string;
  telefon?: string;
}

class AuthService {
  // Firebase bağlantısını kontrol et
  private checkFirebaseConnection() {
    if (!auth || !db) {
      throw new Error('Firebase bağlantısı kurulamadı. Lütfen konfigürasyonu kontrol edin.');
    }
  }

  // Kullanıcı kayıt
  async register(userData: RegisterData): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      this.checkFirebaseConnection();
      
      // Firebase Auth'da kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Kullanıcı profilini güncelle
      await updateProfile(firebaseUser, {
        displayName: `${userData.ad} ${userData.soyad}`
      });
      
      // E-posta doğrulama gönder
      await sendEmailVerification(firebaseUser);
      
      // Firestore'da kullanıcı profili oluştur
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: userData.email,
        ad: userData.ad,
        soyad: userData.soyad,
        telefon: userData.telefon || undefined,
        kayitTarihi: serverTimestamp(),
        sonGiris: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL,
        // Varsayılan değerler
        hedefAdim: '10000',
        hedefSu: '2000',
        hedefSpor: '90',
        hedefKalori: '2000',
        beslenmeHedefi: 'koru',
        aktiviteSeviyesi: 'orta',
        haftalikHedefKilo: '0.5',
        notifikasyon: true,
        darkMode: false,
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      return { 
        success: true, 
        message: 'Kayıt başarılı! E-posta adresinizi doğrulamayı unutmayın.', 
        user: userProfile 
      };
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }
  
  // Kullanıcı giriş
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Firestore'dan kullanıcı profilini al
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı profili bulunamadı');
      }
      
      const userProfile = userDoc.data() as UserProfile;
      
      // Son giriş tarihini güncelle
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        sonGiris: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified
      });
      
      return { 
        success: true, 
        message: 'Giriş başarılı!', 
        user: { ...userProfile, emailVerified: firebaseUser.emailVerified } 
      };
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }
  
  // Çıkış yap
  async logout(): Promise<void> {
    try {
      console.log('🔥 Firebase signOut çağrılıyor...');
      await signOut(auth);
      console.log('✅ Firebase signOut başarılı');
    } catch (error) {
      console.error('❌ Firebase signOut hatası:', error);
      throw error;
    }
  }
  
  // Şifre sıfırlama
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Şifre sıfırlama e-postası gönderildi.' 
      };
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }
  
  // Kullanıcı profili güncelle
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        sonGuncelleme: serverTimestamp()
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  }
  
  // Kullanıcı profili al
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Profil alma hatası:', error);
      throw error;
    }
  }
  
  // Mevcut kullanıcıyı al
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
  
  // Hata mesajlarını Türkçe'ye çevir
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-not-found':
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      case 'auth/invalid-credential':
        return 'Geçersiz giriş bilgileri.';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
}

export const authService = new AuthService();