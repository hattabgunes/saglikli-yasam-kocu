import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Sağlıklı Yaşam Yolculuğunuz Başlıyor',
    subtitle: 'Günlük aktivitelerinizi takip edin, hedeflerinize ulaşın',
    icon: 'fitness',
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Beslenme Alışkanlıklarınızı Geliştirin',
    subtitle: 'Menü planlayın, kalori takibi yapın, sağlıklı beslenin',
    icon: 'restaurant',
    color: '#FF9800'
  },
  {
    id: 3,
    title: 'Rutinlerinizi Oluşturun',
    subtitle: 'Günlük rutinler ile sağlıklı alışkanlıklar edinin',
    icon: 'checkmark-circle',
    color: '#2196F3'
  },
  {
    id: 4,
    title: 'İlerlemenizi Takip Edin',
    subtitle: 'Detaylı raporlar ile gelişiminizi görün',
    icon: 'analytics',
    color: '#9C27B0'
  }
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/login' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/auth/login' as any);
  };

  const currentData = onboardingData[currentIndex];
  const styles = createStyles(colors, currentData.color);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={currentData.icon as any} size={80} color={currentData.color} />
        </View>
        
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.subtitle}>{currentData.subtitle}</Text>
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentIndex(currentIndex - 1)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Başla' : 'İleri'}
          </Text>
          <Ionicons 
            name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors: any, accentColor: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 50,
    },
    skipButton: {
      alignSelf: 'flex-end',
      padding: 10,
    },
    skipText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: accentColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
      gap: 8,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    paginationDotActive: {
      backgroundColor: accentColor,
      width: 24,
    },
    navigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: accentColor,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      gap: 8,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    nextButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
}