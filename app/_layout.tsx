import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ActivityProvider } from '@/context/ActivityContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Deep link handling
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link alındı:', url);
      
      if (url.includes('auth/reset-password')) {
        const urlObj = new URL(url);
        const oobCode = urlObj.searchParams.get('oobCode');
        const apiKey = urlObj.searchParams.get('apiKey');
        
        if (oobCode) {
          console.log('🔐 Şifre sıfırlama sayfasına yönlendiriliyor...');
          router.push(`/auth/reset-password?oobCode=${oobCode}&apiKey=${apiKey || ''}`);
        }
      }
    };

    // İlk açılışta URL kontrol et
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // URL değişikliklerini dinle
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, [router]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <NotificationProvider>
              <ActivityProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </ActivityProvider>
            </NotificationProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </NavigationThemeProvider>
  );
}
