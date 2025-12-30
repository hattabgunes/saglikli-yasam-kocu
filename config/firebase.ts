import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Gerçek Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyD0JtjusNx--mViUvnL0u7lErBjPATeUNk",
  authDomain: "saglikliyasam-6cb5f.firebaseapp.com",
  projectId: "saglikliyasam-6cb5f",
  storageBucket: "saglikliyasam-6cb5f.firebasestorage.app",
  messagingSenderId: "566005001174",
  appId: "1:566005001174:web:55975a4d4ab6a7231ed277",
  measurementId: "G-RTJ84R4E8Y"
};

// Firebase uygulamasını başlat
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Authentication persistence'ı ayarla
  if (Platform.OS === 'web') {
    // Web için local persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Web persistence ayarlama hatası:', error);
    });
  }
  // React Native'de varsayılan olarak persistence aktif
  
  console.log('✅ Firebase başarıyla başlatıldı');
  console.log('🔐 Authentication persistence aktif');
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error);
  // Fallback olarak mock objeler oluştur
  auth = null as any;
  db = null as any;
}

export { auth, db };
export default app;