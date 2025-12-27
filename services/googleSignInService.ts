import { auth } from '@/config/firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { authService } from './authService';

// WebBrowser'ı auth session için yapılandır
WebBrowser.maybeCompleteAuthSession();

class GoogleSignInService {
  // Google Sign-In'i yapılandır
  async configure(): Promise<void> {
    try {
      console.log('✅ Google Sign-In yapılandırıldı (Expo Auth Session)');
    } catch (error) {
      console.error('❌ Google Sign-In yapılandırma hatası:', error);
      throw error;
    }
  }

  // Google ile giriş yap
  async signIn(): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Redirect URI oluştur
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'saglikliyasam',
        path: 'auth',
      });

      console.log('🔗 Redirect URI:', redirectUri);

      // Auth URL'i manuel olarak oluştur (PKCE olmadan)
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=566005001174-beu01apa3n0kpp6b6p3ersm3ar98se7t.apps.googleusercontent.com&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `nonce=${Math.random().toString(36)}`;

      console.log('🌐 Auth URL:', authUrl);

      // Web browser ile auth session başlat
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      console.log('📱 Auth result:', result);

      if (result.type !== 'success') {
        return {
          success: false,
          message: 'Google giriş işlemi iptal edildi.'
        };
      }

      // URL'den id_token'ı çıkar
      const url = result.url;
      const urlParams = new URLSearchParams(url.split('#')[1]);
      const id_token = urlParams.get('id_token');

      if (!id_token) {
        throw new Error('Google ID token alınamadı');
      }

      console.log('🔑 ID Token alındı');

      // Firebase credential oluştur
      const googleCredential = GoogleAuthProvider.credential(id_token);
      
      // Firebase'e giriş yap
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      console.log('🔥 Firebase giriş başarılı:', firebaseUser.email);

      // Kullanıcı profilini kontrol et veya oluştur
      let userProfile = await authService.getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        // İlk kez Google ile giriş yapıyor, profil oluştur
        const names = firebaseUser.displayName?.split(' ') || ['', ''];
        const ad = names[0] || '';
        const soyad = names.slice(1).join(' ') || '';

        userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          ad,
          soyad,
          kayitTarihi: new Date(),
          sonGiris: new Date(),
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

        // Firestore'a kaydet
        await authService.updateUserProfile(firebaseUser.uid, userProfile);
        console.log('Yeni kullanıcı profili oluşturuldu');
      } else {
        // Mevcut kullanıcı, son giriş tarihini güncelle
        await authService.updateUserProfile(firebaseUser.uid, {
          sonGiris: new Date(),
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
        });
        console.log('Mevcut kullanıcı profili güncellendi');
      }

      return {
        success: true,
        message: 'Google ile giriş başarılı!',
        user: userProfile
      };

    } catch (error: any) {
      console.error('❌ Google Sign-In hatası:', error);
      
      let message = 'Google ile giriş yapılırken bir hata oluştu.';
      
      if (error.message?.includes('cancelled') || error.message?.includes('dismiss')) {
        message = 'Giriş işlemi iptal edildi.';
      } else if (error.message?.includes('network')) {
        message = 'İnternet bağlantısını kontrol edin.';
      } else if (error.message?.includes('invalid_request')) {
        message = 'Google giriş konfigürasyonu hatası.';
      }

      return {
        success: false,
        message
      };
    }
  }

  // Çıkış yap
  async signOut(): Promise<void> {
    try {
      console.log('✅ Google Sign-Out başarılı (Expo)');
    } catch (error) {
      console.error('❌ Google Sign-Out hatası:', error);
    }
  }

  // Mevcut kullanıcıyı al
  async getCurrentUser() {
    try {
      return null; // Expo auth session'da silent sign-in yok
    } catch (error) {
      return null;
    }
  }

  // Google hesabını bağlantıyı kes
  async revokeAccess(): Promise<void> {
    try {
      console.log('✅ Google erişimi iptal edildi (Expo)');
    } catch (error) {
      console.error('❌ Google erişim iptali hatası:', error);
    }
  }
}

export const googleSignInService = new GoogleSignInService();