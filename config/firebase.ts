import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

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
  console.log('Firebase başarıyla başlatıldı');
} catch (error) {
  console.error('Firebase başlatma hatası:', error);
  // Fallback olarak mock objeler oluştur
  auth = null as any;
  db = null as any;
}

export { auth, db };
export default app;