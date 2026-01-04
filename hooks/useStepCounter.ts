import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

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

    const initializePedometer = async () => {
      try {
        // İzin kontrolü
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

        // Pedometer kullanılabilirlik kontrolü
        const isAvailable = await Pedometer.isAvailableAsync();
        console.log('Pedometer kullanılabilir:', isAvailable);
        
        if (!isAvailable) {
          setStepData({
            steps: 0,
            isAvailable: false,
            error: 'Adım sayacı bu cihazda mevcut değil',
          });
          return;
        }

        // Bugünkü adımları al
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        try {
          const result = await Pedometer.getStepCountAsync(startOfDay, today);
          console.log('Bugünkü adımlar:', result.steps);
          
          setStepData({
            steps: result.steps || 0,
            isAvailable: true,
            error: null,
          });

          // Gerçek zamanlı adım takibi başlat
          subscription = Pedometer.watchStepCount((result) => {
            console.log('Yeni adım verisi:', result.steps);
            setStepData(prev => ({
              ...prev,
              steps: result.steps || 0,
            }));
          });

          console.log('✅ Gerçek adım sayacı aktif');
          
        } catch (stepError) {
          console.error('Adım sayısı alma hatası:', stepError);
          setStepData({
            steps: 0,
            isAvailable: false,
            error: 'Adım sayısı alınamadı',
          });
        }

      } catch (error) {
        console.error('Pedometer başlatma hatası:', error);
        setStepData({
          steps: 0,
          isAvailable: false,
          error: 'Adım sayacı başlatılamadı',
        });
      }
    };

    // Web platformunda çalışmaz
    if (Platform.OS !== 'web') {
      initializePedometer();
    } else {
      setStepData({
        steps: 0,
        isAvailable: false,
        error: 'Web platformunda desteklenmiyor',
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
        console.log('Adım sayacı durduruldu');
      }
    };
  }, []);

  return stepData;
}





