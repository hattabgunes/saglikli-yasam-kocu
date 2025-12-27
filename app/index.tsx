import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const FIRST_LAUNCH_KEY = '@first_launch';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    console.log('Index: Auth durumu değişti', { isAuthenticated, isLoading, isFirstLaunch });
    if (!isLoading && isFirstLaunch !== null) {
      if (isFirstLaunch) {
        console.log('🎯 Index: Welcome sayfasına yönlendiriliyor');
        router.replace('/welcome' as any);
      } else if (isAuthenticated) {
        console.log('🎯 Index: Tabs sayfasına yönlendiriliyor');
        router.replace('/(tabs)');
      } else {
        console.log('🎯 Index: Login sayfasına yönlendiriliyor');
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, isFirstLaunch]);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      if (hasLaunched === null) {
        // İlk kez açılıyor
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('İlk açılış kontrolü hatası:', error);
      setIsFirstLaunch(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
  });
}