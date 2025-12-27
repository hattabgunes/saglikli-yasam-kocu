# Firebase Google Sign-In Kurulum Rehberi

## ✅ TAMAMLANAN ADIMLAR

### 1. Expo Auth Session ile Google Sign-In
- ✅ `expo-auth-session` ve `expo-crypto` paketleri yüklendi
- ✅ `@react-native-google-signin/google-signin` paketi kaldırıldı (Expo uyumlu değil)
- ✅ `GoogleSignInService` Expo Auth Session ile yeniden yazıldı
- ✅ `AuthContext`'e Google login metodu eklendi
- ✅ Login sayfasında Google butonu mevcut

### 2. Firebase Konfigürasyonu
- ✅ Firebase Console'da Google Sign-In aktifleştirildi
- ✅ Web Client ID: `566005001174-beu01apa3n0kpp6b6p3ersm3ar98se7t.apps.googleusercontent.com`
- ✅ Package name: `com.saglikliyasam.app`
- ✅ `google-services.json` dosyası yapılandırıldı

### 3. Expo Konfigürasyonu
- ✅ `app.json`'da scheme: `saglikliyasam` ayarlandı
- ✅ TypeScript hataları düzeltildi
- ✅ Apple login butonu kaldırıldı

## 🧪 TEST ETME

### Expo Go ile Test:
```bash
npm start
# Expo Go uygulamasında QR kodu tarayın
# "Google ile Giriş Yap" butonuna basın
```

### Development Build ile Test:
```bash
eas build --profile development --platform android
# APK'yı yükleyin ve test edin
```

## 🔧 EXPO AUTH SESSION NASIL ÇALIŞIR

### 1. Auth Request Oluşturma
```typescript
const request = new AuthSession.AuthRequest({
  clientId: 'WEB_CLIENT_ID',
  scopes: ['openid', 'profile', 'email'],
  responseType: AuthSession.ResponseType.IdToken,
  redirectUri: AuthSession.makeRedirectUri({ scheme: 'saglikliyasam' }),
});
```

### 2. Auth Session Başlatma
```typescript
const result = await request.promptAsync(discovery);
```

### 3. ID Token ile Firebase Giriş
```typescript
const googleCredential = GoogleAuthProvider.credential(id_token);
const userCredential = await signInWithCredential(auth, googleCredential);
```

## 🚨 EXPO vs REACT NATIVE FARKI

### ❌ React Native Google Sign-In (Çalışmaz)
- Native Android konfigürasyonu gerektirir
- `@react-native-google-signin/google-signin` paketi
- SHA-1 fingerprint zorunlu
- Google Play Services bağımlılığı

### ✅ Expo Auth Session (Çalışır)
- Web tabanlı OAuth flow
- `expo-auth-session` paketi
- Expo Go ile test edilebilir
- Cross-platform uyumlu

## 📱 BEKLENEN DAVRANIŞLAR

### Başarılı Giriş:
1. Google butonuna bas → Web browser açılır
2. Google hesabını seç → İzinleri onayla
3. Uygulama geri döner → Firebase'e giriş yapar
4. Ana sayfaya yönlendirilir

### Olası Hatalar:
- **"Giriş işlemi iptal edildi"** → Kullanıcı browser'ı kapattı
- **"Google ID token alınamadı"** → OAuth flow başarısız
- **"İnternet bağlantısını kontrol edin"** → Network hatası

## 🔄 SONRAKI ADIMLAR

1. **Expo Go ile test edin** (hemen test edilebilir)
2. **Development build oluşturun** (production'a yakın test)
3. **Production build için EAS yapılandırın**

---

## DETAYLI KURULUM REHBERİ (REFERANS)

## 1. Firebase Console'da Google Sign-In Aktifleştirme ✅

### Adım 1: Authentication Ayarları
1. Firebase Console → Authentication → Sign-in method
2. "Google" seçeneğini aktifleştir
3. "Enable" butonuna tıkla
4. Project support email seç
5. "Save" butonuna tıkla

### Adım 2: Web Client ID Alma ✅
1. Firebase Console → Authentication → Sign-in method → Google
2. "Web SDK configuration" bölümünden Web client ID'yi kopyala
3. `services/googleSignInService.ts` dosyasında kullanıldı

## 2. Expo Auth Session Konfigürasyonu ✅

### Paket Kurulumu
```bash
npx expo install expo-auth-session expo-crypto
npm uninstall @react-native-google-signin/google-signin
```

### Auth Session Konfigürasyonu
```typescript
const request = new AuthSession.AuthRequest({
  clientId: '566005001174-beu01apa3n0kpp6b6p3ersm3ar98se7t.apps.googleusercontent.com',
  scopes: ['openid', 'profile', 'email'],
  responseType: AuthSession.ResponseType.IdToken,
  redirectUri: AuthSession.makeRedirectUri({ scheme: 'saglikliyasam' }),
});
```

## 3. Test Etme ✅

### Expo Go ile Test
1. `npm start` ile server'ı başlat
2. Expo Go ile QR kodu tara
3. "Google ile Giriş Yap" butonuna bas
4. Web browser'da Google hesabını seç
5. İzinleri onayla

### Development Build ile Test
```bash
eas build --profile development --platform android
```

## 4. Üretim Hazırlığı

### EAS Build Konfigürasyonu
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Google Play Console
1. **App signing** aktifleştir
2. **OAuth consent screen** yapılandır
3. **Store listing** tamamla

## 5. Güvenlik

### Önemli Notlar
- Web Client ID public olabilir (güvenli)
- Redirect URI scheme'i unique olmalı
- Firebase Security Rules aktif
- HTTPS zorunlu (Expo otomatik)

Bu adımları tamamladıktan sonra Expo Auth Session ile Google Sign-In çalışacak!

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Create a project" butonuna tıklayın
3. Proje adını girin (örn: "saglikli-yasam-kocu")
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. Projeyi oluşturun

## 2. Web Uygulaması Ekleme

1. Firebase Console'da projenizi açın
2. "Project Overview" sayfasında web ikonu (</>)'na tıklayın
3. Uygulama adını girin
4. "Register app" butonuna tıklayın
5. Firebase SDK konfigürasyonunu kopyalayın

## 3. Konfigürasyon Dosyasını Güncelleme

`config/firebase.ts` dosyasındaki konfigürasyonu Firebase Console'dan aldığınız bilgilerle güncelleyin:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 4. Firebase Authentication Kurulumu

1. Firebase Console'da "Authentication" bölümüne gidin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" seçeneğini etkinleştirin
5. İsteğe bağlı: Google, Apple gibi diğer sağlayıcıları da etkinleştirin

## 5. Firestore Database Kurulumu

1. Firebase Console'da "Firestore Database" bölümüne gidin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçeneğini seçin (geliştirme için)
4. Lokasyon seçin (Europe-west3 önerilir)
5. "Done" butonuna tıklayın

## 6. Firestore Güvenlik Kuralları

Firestore'da aşağıdaki güvenlik kurallarını ayarlayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Alt koleksiyonlar için de aynı kural
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Admin koleksiyonu (sadece admin kullanıcılar)
    match /admin/{document} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## 7. Firestore Veri Yapısı

Uygulama aşağıdaki Firestore koleksiyonlarını kullanır:

### Users Koleksiyonu (`/users/{userId}`)
```
{
  uid: string,
  email: string,
  ad: string,
  soyad: string,
  telefon?: string,
  kayitTarihi: timestamp,
  sonGiris?: timestamp,
  emailVerified: boolean,
  // Profil bilgileri
  yas?: string,
  cinsiyet?: string,
  kilo?: string,
  boy?: string,
  hedefKilo?: string,
  // ... diğer profil alanları
}
```

### Activities Alt Koleksiyonu (`/users/{userId}/activities/{date}`)
```
{
  tarih: string, // YYYY-MM-DD
  spor: { tamamlandi: boolean, sure?: number },
  beslenme: {
    kahvalti: { tamamlandi: boolean, kalori?: number, ... },
    ogle: { tamamlandi: boolean, kalori?: number, ... },
    aksam: { tamamlandi: boolean, kalori?: number, ... },
    araOgun: { tamamlandi: boolean, kalori?: number, ... }
  },
  rutin: { [rutinId]: { tamamlandi: boolean, ... } },
  adimSayisi?: number,
  suMiktari?: number,
  beslenmeSkoru?: number,
  gunlukKalori?: number,
  rutinSkoru?: number
}
```

### Custom Alt Koleksiyonu (`/users/{userId}/custom/{type}`)
- `exercises`: Özel egzersizler
- `routines`: Özel rutinler

### Nutrition Alt Koleksiyonu (`/users/{userId}/nutrition/{type}`)
- `weeklyMenu`: Haftalık menü planı

### Stats Alt Koleksiyonu (`/users/{userId}/stats/{type}`)
- `summary`: Kullanıcı istatistikleri

## 8. Test Etme

1. Uygulamayı çalıştırın: `npm start`
2. Yeni bir hesap oluşturun
3. Firebase Console'da kullanıcının oluşturulduğunu kontrol edin
4. Uygulama içinde aktivite ekleyin
5. Firestore'da verilerin kaydedildiğini kontrol edin

## 9. Production Ayarları

Production'a geçmeden önce:

1. Firestore güvenlik kurallarını sıkılaştırın
2. Firebase Authentication domain'lerini ayarlayın
3. API key'leri environment variable'lara taşıyın
4. Firebase Performance Monitoring'i etkinleştirin
5. Firebase Analytics'i yapılandırın

## ✅ Sorun Çözüldü: getReactNativePersistence Hatası

**Hata:** `Server Error(0 , _auth.getReactNativePersistence) is not a function`

**Çözüm:** 
- React Native Firebase paketleri kaldırıldı (`@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`)
- Sadece Firebase Web SDK (`firebase`) kullanılıyor
- Expo projelerinde Firebase Web SDK kullanmak daha uygun ve stabil

**Test Sonucu:** ✅ Firebase başarıyla çalışıyor

## 10. Sorun Giderme

### Yaygın Hatalar:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Firebase konfigürasyonunu kontrol edin
   - API key'lerin doğru olduğundan emin olun

2. **"FirebaseError: Missing or insufficient permissions"**
   - Firestore güvenlik kurallarını kontrol edin
   - Kullanıcının doğru şekilde authenticate olduğundan emin olun

3. **"Network request failed"**
   - İnternet bağlantısını kontrol edin
   - Firebase servislerinin çalıştığından emin olun

### Debug İpuçları:

1. Firebase Console'da "Usage" sekmesinden API çağrılarını izleyin
2. Browser Developer Tools'da Network sekmesini kontrol edin
3. Firebase Debug modunu etkinleştirin:
   ```typescript
   import { connectAuthEmulator } from 'firebase/auth';
   import { connectFirestoreEmulator } from 'firebase/firestore';
   
   // Sadece development'ta
   if (__DEV__) {
     connectAuthEmulator(auth, 'http://localhost:9099');
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

## 11. Ek Özellikler

### Push Notifications (Firebase Cloud Messaging)
Expo projelerinde push notification için Expo Notifications kullanın:
```bash
npx expo install expo-notifications
```

### Analytics
Expo projelerinde analytics için:
```bash
npx expo install expo-firebase-analytics
```

### Crashlytics
Expo projelerinde crash reporting için:
```bash
npx expo install expo-firebase-crashlytics
```

### Remote Config
Firebase Web SDK ile remote config:
```bash
# Firebase Web SDK zaten yüklü, remote config dahil
```

Bu rehberi takip ederek Firebase entegrasyonunu tamamlayabilirsiniz. Herhangi bir sorunla karşılaştığınızda Firebase dokümantasyonunu kontrol edin veya Firebase destek forumlarından yardım alın.