import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Sensors from 'expo-sensors';

interface StepCounterData {
  steps: number;
  isAvailable: boolean;
  error: string | null;
}

export function useStepCounter() {
  const [stepData, setStepData] = useState<StepCounterData>({
    steps: 0,
    isAvailable: false,
    error: null,
  });

  useEffect(() => {
    let subscription: any = null;
    let intervalId: NodeJS.Timeout | null = null;

    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: 'Adım Sayacı İzni',
              message: 'Uygulamanın adım sayısını takip edebilmesi için izin gerekiyor.',
              buttonNeutral: 'Daha Sonra',
              buttonNegative: 'İptal',
              buttonPositive: 'İzin Ver',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setStepData({
              steps: 0,
              isAvailable: false,
              error: 'Adım sayacı izni verilmedi',
            });
            return;
          }
        } catch (err) {
          console.error('İzin hatası:', err);
          setStepData({
            steps: 0,
            isAvailable: false,
            error: 'İzin alınamadı',
          });
          return;
        }
      }

      // Expo-sensors ile accelerometer kullanarak basit adım sayma
      // Not: Bu gerçek bir pedometer değil, sadece hareket algılama
      try {
        const isAvailable = await Sensors.Accelerometer.isAvailableAsync();
        if (isAvailable) {
          setStepData(prev => ({ ...prev, isAvailable: true, error: null }));
          
          // Accelerometer ile hareket algılama
          subscription = Sensors.Accelerometer.addListener(({ x, y, z }) => {
            // Basit hareket algılama (gerçek adım sayma için daha gelişmiş algoritma gerekir)
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            // Bu sadece örnek - gerçek adım sayma için daha karmaşık algoritma gerekir
          });

          Sensors.Accelerometer.setUpdateInterval(1000);
        } else {
          setStepData({
            steps: 0,
            isAvailable: false,
            error: 'Adım sayacı bu cihazda mevcut değil',
          });
        }
      } catch (error) {
        console.error('Adım sayacı hatası:', error);
        setStepData({
          steps: 0,
          isAvailable: false,
          error: 'Adım sayacı başlatılamadı',
        });
      }
    };

    checkPermissions();

    // Simüle edilmiş adım sayacı (gerçek uygulamada cihazın pedometer'ını kullanın)
    // Bu sadece demo amaçlı - gerçek uygulamada native pedometer API kullanılmalı
    if (Platform.OS === 'web') {
      // Web için simüle edilmiş adım sayacı
      intervalId = setInterval(() => {
        setStepData(prev => ({
          ...prev,
          steps: prev.steps + Math.floor(Math.random() * 3), // Rastgele adım ekleme (demo)
        }));
      }, 5000); // Her 5 saniyede bir
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return stepData;
}




