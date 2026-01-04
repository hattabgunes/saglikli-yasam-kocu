import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface SuccessBannerProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export function SuccessBanner({ message, visible, onHide, duration = 3000 }: SuccessBannerProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Şeridi sağdan sola kaydır ve görünür yap
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Parlak efekt animasyonu
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: Dimensions.get('window').width + 100,
          duration: 1500,
          useNativeDriver: true,
        }),
        { iterations: 2 }
      );
      shimmerAnimation.start();

      // Belirtilen süre sonra gizle
      const timer = setTimeout(() => {
        hideAnimation();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAnimation = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animasyon tamamlandığında pozisyonu sıfırla
      slideAnim.setValue(-Dimensions.get('window').width);
      shimmerAnim.setValue(-100);
      onHide?.();
    });
  };

  if (!visible) return null;

  const styles = createStyles(colors);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <Animated.View 
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerAnim }],
          },
        ]} 
      />
    </Animated.View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: '#4CAF50',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    message: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: -100,
      width: 100,
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      transform: [{ skewX: '-20deg' }],
    },
  });
}