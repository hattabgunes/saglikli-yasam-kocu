import { CircularProgress } from '@/components/CircularProgress';
import { useActivity } from '@/context/ActivityContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Motivasyon mesajları
const motivasyonMesajlari = [
  'Harika iş çıkarıyorsun!',
  'Sağlıklı yaşam yolculuğunda mükemmelsin!',
  'Her adım seni hedefe yaklaştırıyor!',
  'Bugün de harika bir gün olacak!',
  'Küçük adımlar büyük değişiklikler yaratır!',
  'Sen bir şampiyonsun!',
];

export default function Home() {
  const { todayActivity, isLoading, updateSuMiktari, updateAdimSayisi, resetTodayActivity } = useActivity();
  const { profile } = useUser();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [motivasyonMesaji, setMotivasyonMesaji] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setMotivasyonMesaji(motivasyonMesajlari[Math.floor(Math.random() * motivasyonMesajlari.length)]);
    }
  }, [isLoading]);

  if (isLoading || !todayActivity) {
    const loadingStyles = StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background },
      center: { justifyContent: 'center', alignItems: 'center' }
    });
    
    return (
      <View style={[loadingStyles.container, loadingStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const tamamlananBeslenme = Object.values(todayActivity.beslenme).filter(ogun => ogun.tamamlandi).length;
  const tamamlananRutin = Object.values(todayActivity.rutin).filter(rutin => rutin?.tamamlandi).length;
  const toplamBeslenme = 4;
  const toplamRutin = Object.keys(todayActivity.rutin).length;

  const bugunTarih = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Egzersiz yüzdesini süre bazında hesapla
  const egzersizSuresi = todayActivity.spor.sure || 0;
  const hedefEgzersizSuresi = parseInt(profile.hedefSpor) || 90;
  const egzersizYuzdesi = Math.min(egzersizSuresi / hedefEgzersizSuresi, 1);

  const ilerlemeYuzdesi = Math.round(
    ((tamamlananBeslenme / toplamBeslenme) + 
     (tamamlananRutin / Math.max(toplamRutin, 1)) + 
     egzersizYuzdesi) / 3 * 100
  );

  const suYuzdesi = Math.min(((todayActivity.suMiktari || 0) / parseInt(profile.hedefSu)) * 100, 100);
  const adimYuzdesi = Math.min(((todayActivity.adimSayisi || 0) / parseInt(profile.hedefAdim)) * 100, 100);

  const handleSuEkle = async () => {
    const mevcutSu = todayActivity.suMiktari || 0;
    const yeniSu = mevcutSu + 250;
    await updateSuMiktari(yeniSu, parseInt(profile.hedefSu));
  };

  const handleAdimEkle = async () => {
    const mevcutAdim = todayActivity.adimSayisi || 0;
    const yeniAdim = mevcutAdim + 1000;
    await updateAdimSayisi(yeniAdim, parseInt(profile.hedefAdim));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    date: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 16,
      textTransform: 'capitalize',
    },
    motivationText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    progressSection: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    progressItem: {
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    quickActionsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    quickActionCard: {
      width: '48%',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    suButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 12,
    },
    suButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    adimButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 12,
    },
    adimButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba, {profile.ad || 'Kullanıcı'}!</Text>
        <Text style={styles.date}>{bugunTarih}</Text>
        <Text style={styles.motivationText}>{motivasyonMesaji}</Text>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="restaurant" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{tamamlananBeslenme}/{toplamBeslenme}</Text>
          <Text style={styles.statLabel}>Öğün</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={24} color={colors.secondary} />
          <Text style={styles.statValue}>{egzersizSuresi}/{hedefEgzersizSuresi}</Text>
          <Text style={styles.statLabel}>Dakika</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          <Text style={styles.statValue}>{tamamlananRutin}/{toplamRutin}</Text>
          <Text style={styles.statLabel}>Rutin</Text>
        </View>
      </View>

      {/* Günlük İlerleme */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Günlük İlerleme</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={ilerlemeYuzdesi}
              size={80}
              strokeWidth={8}
              color={colors.primary}
              backgroundColor={isDark ? colors.border : '#E0E0E0'}
              text={`${ilerlemeYuzdesi}`}
            />
            <Text style={styles.progressLabel}>Genel</Text>
            <Text style={styles.progressValue}>{ilerlemeYuzdesi}%</Text>
          </View>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={suYuzdesi}
              size={60}
              strokeWidth={6}
              color={colors.secondary}
              backgroundColor={isDark ? colors.border : '#E0E0E0'}
              showText={false}
            />
            <Text style={styles.progressLabel}>Su</Text>
            <Text style={styles.progressValue}>{Math.round(suYuzdesi)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={adimYuzdesi}
              size={60}
              strokeWidth={6}
              color={colors.accent}
              backgroundColor={isDark ? colors.border : '#E0E0E0'}
              showText={false}
            />
            <Text style={styles.progressLabel}>Adım</Text>
            <Text style={styles.progressValue}>{Math.round(adimYuzdesi)}%</Text>
          </View>
        </View>
      </View>

      {/* Hızlı Aksiyonlar */}
      <Text style={styles.quickActionsTitle}>Hızlı Aksiyonlar</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/egzersiz')}>
          <Ionicons name="barbell" size={32} color={colors.primary} />
          <Text style={styles.quickActionText}>Egzersiz</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/beslenme')}>
          <Ionicons name="restaurant" size={32} color={colors.secondary} />
          <Text style={styles.quickActionText}>Beslenme</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/rutin')}>
          <Ionicons name="checkmark-circle" size={32} color={colors.accent} />
          <Text style={styles.quickActionText}>Rutinler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/profil')}>
          <Ionicons name="person" size={32} color={colors.primary} />
          <Text style={styles.quickActionText}>Profil</Text>
        </TouchableOpacity>
        
        <View style={styles.quickActionCard}>
          <Ionicons name="water" size={32} color={colors.secondary} />
          <Text style={styles.quickActionText}>Su: {todayActivity.suMiktari || 0}ml</Text>
          <TouchableOpacity style={styles.suButton} onPress={handleSuEkle}>
            <Text style={styles.suButtonText}>+250ml</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickActionCard}>
          <Ionicons name="walk" size={32} color={colors.accent} />
          <Text style={styles.quickActionText}>Adım: {todayActivity.adimSayisi || 0}</Text>
          <TouchableOpacity style={styles.adimButton} onPress={handleAdimEkle}>
            <Text style={styles.adimButtonText}>+1000</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}