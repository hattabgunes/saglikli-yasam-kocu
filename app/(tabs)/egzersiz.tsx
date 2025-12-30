import { CircularProgress } from '@/components/CircularProgress';
import { Timer } from '@/components/Timer';
import { useActivity } from '@/context/ActivityContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Popüler egzersizler
const populerEgzersizler = [
  { id: 'yuruyus', isim: 'Hızlı Yürüyüş', sure: 30, kalori: 150, zorluk: 'Kolay', icon: 'walk', renk: '#4CAF50' },
  { id: 'kosu', isim: 'Koşu', sure: 20, kalori: 200, zorluk: 'Orta', icon: 'fitness', renk: '#2196F3' },
  { id: 'agirlik', isim: 'Ağırlık', sure: 45, kalori: 300, zorluk: 'Zor', icon: 'barbell', renk: '#FF9800' },
  { id: 'yoga', isim: 'Yoga', sure: 60, kalori: 180, zorluk: 'Kolay', icon: 'leaf', renk: '#9C27B0' },
  { id: 'yuzme', isim: 'Yüzme', sure: 30, kalori: 400, zorluk: 'Orta', icon: 'water', renk: '#00BCD4' },
  { id: 'pilates', isim: 'Pilates', sure: 45, kalori: 250, zorluk: 'Orta', icon: 'body', renk: '#E91E63' },
];

// Egzersiz türü interface
interface CustomExercise {
  id: string;
  isim: string;
  sure: number;
  kalori: number;
  zorluk: string;
  icon: string;
  renk: string;
  isCustom: boolean;
}

export default function Egzersiz() {
  const { todayActivity, isLoading, updateSpor } = useActivity();
  const { profile } = useUser();
  const { colors } = useTheme();
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Kolay');
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [allExercises, setAllExercises] = useState<CustomExercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Timer callback'ini optimize et
  const handleTimeUpdate = useCallback((secs: number) => {
    setTimerSeconds(secs);
  }, []);

  // Özel egzersizleri yükle
  useEffect(() => {
    loadCustomExercises();
    loadCompletedExercises();
  }, []);

  // Tüm egzersizleri birleştir
  useEffect(() => {
    const popularWithCustomFlag = populerEgzersizler.map(ex => ({ ...ex, isCustom: false }));
    setAllExercises([...popularWithCustomFlag, ...customExercises]);
  }, [customExercises]);

  const loadCustomExercises = async () => {
    try {
      const stored = await AsyncStorage.getItem('customExercises');
      if (stored) {
        setCustomExercises(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Özel egzersizler yüklenemedi:', error);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(`completedExercises_${today}`);
      if (stored) {
        setCompletedExercises(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Tamamlanan egzersizler yüklenemedi:', error);
    }
  };

  const saveCompletedExercises = async (exercises: string[]) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`completedExercises_${today}`, JSON.stringify(exercises));
      setCompletedExercises(exercises);
    } catch (error) {
      console.error('Tamamlanan egzersizler kaydedilemedi:', error);
    }
  };

  const saveCustomExercises = async (exercises: CustomExercise[]) => {
    try {
      await AsyncStorage.setItem('customExercises', JSON.stringify(exercises));
      setCustomExercises(exercises);
    } catch (error) {
      console.error('Özel egzersizler kaydedilemedi:', error);
    }
  };

  if (isLoading || !todayActivity) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const egzersizTamamlandi = todayActivity.spor.tamamlandi;
  const egzersizSuresi = todayActivity.spor.sure || 0;
  const hedefSure = parseInt(profile.hedefSpor) || 90;
  const ilerlemeyuzdesi = Math.min((egzersizSuresi / hedefSure) * 100, 100);
  const tahminKalori = Math.round(egzersizSuresi * 5);

  const handleEgzersizTamamla = async () => {
    try {
      // Hedef süreyi al
      const hedefSure = parseInt(profile.hedefSpor) || 90;
      
      // Tüm egzersizleri tamamlanmış olarak işaretle
      const allExerciseIds = allExercises.map(ex => ex.id);
      await saveCompletedExercises(allExerciseIds);
      
      // Hedef süreyi spor aktivitesine ekle
      await updateSpor(true, hedefSure);
      
      Alert.alert(
        'Tebrikler! 🎉', 
        `Günlük egzersiz hedefin tamamlandı!\n${hedefSure} dakika egzersiz tamamlandı.\nTüm egzersizler işaretlendi.`,
        [{ text: 'Harika!', style: 'default' }]
      );
    } catch (error) {
      console.error('Egzersiz tamamlama hatası:', error);
      Alert.alert('Hata', 'Egzersiz tamamlanamadı!');
    }
  };

  const handleExerciseStart = (exercise: any) => {
    setSelectedExercise(exercise);
    setTimerSeconds(0);
    setShowTimerModal(true);
  };

  const handleTimerComplete = async () => {
    const dakika = Math.ceil(timerSeconds / 60);
    await updateSpor(true, dakika);
    setShowTimerModal(false);
    setSelectedExercise(null);
    setTimerSeconds(0);
  };

  const handleCustomSave = async () => {
    if (!customName.trim()) {
      Alert.alert('Hata', 'Egzersiz adı gerekli!');
      return;
    }
    
    const duration = parseInt(customDuration) || 30;
    const calories = parseInt(customCalories) || Math.round(duration * 5);
    
    const newExercise: CustomExercise = {
      id: `custom_${Date.now()}`,
      isim: customName.trim(),
      sure: duration,
      kalori: calories,
      zorluk: customDifficulty,
      icon: 'fitness',
      renk: '#6366F1',
      isCustom: true
    };

    const updatedExercises = [...customExercises, newExercise];
    await saveCustomExercises(updatedExercises);
    
    setShowCustomModal(false);
    setCustomName('');
    setCustomDuration('');
    setCustomCalories('');
    setCustomDifficulty('Kolay');
    
    Alert.alert('Başarılı', 'Egzersiz eklendi!');
  };

  const handleDeleteCustomExercise = async (exerciseId: string) => {
    console.log('Delete button pressed for:', exerciseId);
    Alert.alert(
      'Egzersizi Sil',
      'Bu egzersizi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedExercises = customExercises.filter(ex => ex.id !== exerciseId);
              await saveCustomExercises(updatedExercises);
              Alert.alert('Başarılı', 'Egzersiz silindi!');
            } catch (error) {
              console.error('Silme hatası:', error);
              Alert.alert('Hata', 'Egzersiz silinemedi!');
            }
          }
        }
      ]
    );
  };

  const handleCompleteExercise = async (exercise: any) => {
    try {
      // Egzersizi tamamlananlar listesine ekle
      const updatedCompleted = [...completedExercises, exercise.id];
      await saveCompletedExercises(updatedCompleted);
      
      // Spor aktivitesini güncelle
      await updateSpor(true, exercise.sure);
      
      Alert.alert(
        'Tebrikler! 🎉', 
        `${exercise.isim} egzersizini tamamladın!\n+${exercise.sure} dakika eklendi.`,
        [{ text: 'Harika!', style: 'default' }]
      );
    } catch (error) {
      console.error('Egzersiz tamamlama hatası:', error);
      Alert.alert('Hata', 'Egzersiz tamamlanamadı!');
    }
  };

  const handleUncompleteExercise = async (exercise: any) => {
    try {
      // Egzersizi tamamlananlar listesinden çıkar
      const updatedCompleted = completedExercises.filter(id => id !== exercise.id);
      await saveCompletedExercises(updatedCompleted);
      
      // Spor süresini azalt (negatif değer göndererek)
      const currentDuration = todayActivity?.spor?.sure || 0;
      const newDuration = Math.max(0, currentDuration - exercise.sure);
      await updateSpor(newDuration > 0, newDuration);
      
      Alert.alert(
        'Tamamlanma İptal Edildi', 
        `${exercise.isim} egzersizinin tamamlanması iptal edildi.\n-${exercise.sure} dakika çıkarıldı.`,
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      console.error('Tamamlanma iptal hatası:', error);
      Alert.alert('Hata', 'Tamamlanma iptal edilemedi!');
    }
  };

  const isExerciseCompleted = (exerciseId: string) => {
    return completedExercises.includes(exerciseId);
  };

  const getZorlukRengi = (zorluk: string) => {
    switch (zorluk) {
      case 'Kolay': return '#4CAF50';
      case 'Orta': return '#FF9800';
      case 'Zor': return '#FF5252';
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background, paddingTop: 40 }]} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Günlük Egzersiz</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Güçlü ve sağlıklı ol</Text>
        </View>
        <CircularProgress
          progress={ilerlemeyuzdesi}
          size={80}
          strokeWidth={8}
          color={ilerlemeyuzdesi >= 100 ? '#4CAF50' : colors.primary}
          backgroundColor={colors.border}
          text={`${Math.round(ilerlemeyuzdesi)}%`}
        />
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="time" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{egzersizSuresi}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dakika</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="trophy" size={20} color={colors.accent} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{hedefSure}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hedef</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="flame" size={20} color={colors.error} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{tahminKalori}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kalori</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: (egzersizTamamlandi ? '#4CAF50' : '#666') + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={egzersizTamamlandi ? '#4CAF50' : '#666'} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{egzersizTamamlandi ? '✓' : '○'}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Durum</Text>
        </View>
      </View>

      {/* Hedef Tamamlandı Mesajı */}
      {ilerlemeyuzdesi >= 100 && (
        <View style={[styles.completedMessage, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <Ionicons name="trophy" size={32} color={colors.success} />
          <View style={styles.completedMessageContent}>
            <Text style={[styles.completedMessageTitle, { color: colors.success }]}>
              Günlük Hedef Tamamlandı! 🎉
            </Text>
            <Text style={[styles.completedMessageText, { color: colors.text }]}>
              {hedefSure} dakika egzersiz hedefine ulaştın. Harika iş çıkardın!
            </Text>
          </View>
        </View>
      )}

      {/* Egzersiz Tamamla Butonu */}
      {ilerlemeyuzdesi < 100 && (
        <TouchableOpacity style={[styles.completedButton, { backgroundColor: colors.success, shadowColor: colors.shadow }]} onPress={handleEgzersizTamamla}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.completedButtonText}>Günlük Hedefi Tamamla ({hedefSure} dk)</Text>
        </TouchableOpacity>
      )}

      {/* Hızlı Aksiyonlar */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
          onPress={() => setShowCustomModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Özel Egzersiz</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: colors.secondary }]}
          onPress={() => handleExerciseStart({ isim: 'Serbest Antrenman', sure: 30, kalori: 150 })}
        >
          <Ionicons name="timer" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Zamanlayıcı</Text>
        </TouchableOpacity>
      </View>

      {/* Popüler Egzersizler */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tüm Egzersizler</Text>
      
      <View style={styles.exerciseGrid}>
        {allExercises.map((exercise) => {
          const isCompleted = isExerciseCompleted(exercise.id);
          return (
            <View key={exercise.id} style={[
              styles.exerciseCard, 
              { 
                backgroundColor: isCompleted ? '#E8F5E8' : colors.surface, 
                shadowColor: colors.shadow,
                borderWidth: isCompleted ? 2 : 0,
                borderColor: isCompleted ? '#4CAF50' : 'transparent'
              }
            ]}>
              {/* Tamamlanma Tik İşareti */}
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              )}
              
              {exercise.isCustom && !isCompleted && (
                <View style={styles.deleteButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.deleteButton, { backgroundColor: colors.error }]}
                    onPress={() => {
                      console.log('Delete pressed for:', exercise.id, exercise.isim);
                      handleDeleteCustomExercise(exercise.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.exerciseContent}
                onPress={() => {
                  if (isCompleted) {
                    // Tamamlanan egzersize tıklanırsa iptal et
                    Alert.alert(
                      'Tamamlanmayı İptal Et',
                      `${exercise.isim} egzersizinin tamamlanmasını iptal etmek istiyor musun?`,
                      [
                        { text: 'Hayır', style: 'cancel' },
                        { 
                          text: 'Evet, İptal Et', 
                          style: 'destructive',
                          onPress: () => handleUncompleteExercise(exercise)
                        }
                      ]
                    );
                  } else {
                    // Tamamlanmamış egzersize tıklanırsa zamanlayıcı aç
                    handleExerciseStart(exercise);
                  }
                }}
                onLongPress={exercise.isCustom && !isCompleted ? () => {
                  console.log('Long press delete for:', exercise.id, exercise.isim);
                  handleDeleteCustomExercise(exercise.id);
                } : undefined}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.exerciseIconContainer, 
                  { 
                    backgroundColor: isCompleted ? '#4CAF50' + '20' : exercise.renk + '20',
                    opacity: isCompleted ? 0.7 : 1
                  }
                ]}>
                  <Ionicons 
                    name={exercise.icon as any} 
                    size={28} 
                    color={isCompleted ? '#4CAF50' : exercise.renk} 
                  />
                </View>
                <Text style={[
                  styles.exerciseTitle, 
                  { 
                    color: isCompleted ? '#4CAF50' : colors.text,
                    textDecorationLine: isCompleted ? 'line-through' : 'none'
                  }
                ]}>
                  {exercise.isim}
                </Text>
                <Text style={[
                  styles.exerciseSubtitle, 
                  { 
                    color: isCompleted ? '#4CAF50' : colors.textSecondary,
                    opacity: isCompleted ? 0.8 : 1
                  }
                ]}>
                  {exercise.sure} dk • {exercise.kalori} kcal
                </Text>
                <View style={[
                  styles.difficultyBadge, 
                  { 
                    backgroundColor: isCompleted ? '#4CAF50' + '20' : getZorlukRengi(exercise.zorluk) + '20'
                  }
                ]}>
                  <Text style={[
                    styles.difficultyText, 
                    { 
                      color: isCompleted ? '#4CAF50' : getZorlukRengi(exercise.zorluk)
                    }
                  ]}>
                    {isCompleted ? 'Tamamlandı' : exercise.zorluk}
                  </Text>
                </View>
              </TouchableOpacity>
              
              {/* Tamamlandı Butonu - sadece tamamlanmamışlarda göster */}
              {!isCompleted && (
                <TouchableOpacity 
                  style={[styles.completeButton, { backgroundColor: colors.success }]}
                  onPress={() => handleCompleteExercise(exercise)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.completeButtonText}>Tamamlandı</Text>
                </TouchableOpacity>
              )}
              
              {/* İptal Et Butonu - sadece tamamlananlarda göster */}
              {isCompleted && (
                <TouchableOpacity 
                  style={[styles.uncompleteButton, { backgroundColor: colors.error }]}
                  onPress={() => {
                    Alert.alert(
                      'Tamamlanmayı İptal Et',
                      `${exercise.isim} egzersizinin tamamlanmasını iptal etmek istiyor musun?`,
                      [
                        { text: 'Hayır', style: 'cancel' },
                        { 
                          text: 'Evet, İptal Et', 
                          style: 'destructive',
                          onPress: () => handleUncompleteExercise(exercise)
                        }
                      ]
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.uncompleteButtonText}>İptal Et</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Motivasyon Mesajı */}
      <View style={[styles.motivationCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, borderColor: colors.primary }]}>
        <Ionicons name="star" size={32} color="#FFD700" />
        <Text style={[styles.motivationText, { color: colors.text }]}>
          Her gün biraz hareket, büyük değişiklikler yaratır! 🌟
        </Text>
      </View>
      
      {/* Kullanım İpucu */}
      {(customExercises.length > 0 || completedExercises.length > 0) && (
        <View style={[styles.tipCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            💡 İpuçları: Özel egzersizleri silmek için X butonuna tıklayın. Tamamlanan egzersizleri iptal etmek için "İptal Et" butonuna basın veya egzersize tıklayın.
          </Text>
        </View>
      )}
      {/* Timer Modal */}
      <Modal
        visible={showTimerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedExercise ? selectedExercise.isim : 'Egzersiz'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimerModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timerContainer}>
              <Timer
                initialSeconds={timerSeconds}
                onTimeUpdate={handleTimeUpdate}
                autoStart={false}
              />
              
              {selectedExercise && (
                <View style={styles.timerInfo}>
                  <Text style={[styles.timerInfoText, { color: colors.textSecondary }]}>
                    Önerilen: {selectedExercise.sure} dakika
                  </Text>
                  <Text style={[styles.timerInfoText, { color: colors.textSecondary }]}>
                    Tahmini Kalori: {Math.round((selectedExercise.kalori * Math.max(timerSeconds / 60, 1)) / selectedExercise.sure)} kcal
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.timerButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setShowTimerModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleTimerComplete}
                disabled={timerSeconds === 0}
              >
                <Text style={styles.modalButtonText}>Tamamla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Özel Egzersiz Modal */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Özel Egzersiz</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Egzersiz Adı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={customName}
                onChangeText={setCustomName}
                placeholder="Örn: Koşu, Yoga, Ağırlık"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Süre (dakika)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Tahmini Kalori</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={customCalories}
                onChangeText={setCustomCalories}
                placeholder="Otomatik hesaplanacak"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Zorluk Seviyesi</Text>
              <View style={styles.difficultySelector}>
                {['Kolay', 'Orta', 'Zor'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyOption,
                      { 
                        backgroundColor: customDifficulty === level ? colors.primary : colors.background,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => setCustomDifficulty(level)}
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      { color: customDifficulty === level ? '#fff' : colors.text }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCustomSave}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    gap: 16,
  },
  completedMessageContent: {
    flex: 1,
  },
  completedMessageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedMessageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  exerciseCard: {
    width: '48%',
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    paddingBottom: 50, // Tamamlandı butonu için yer
  },
  exerciseContent: {
    padding: 16,
    alignItems: 'center',
  },
  completeButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uncompleteButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  uncompleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1000,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  exerciseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseSubtitle: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerInfo: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  timerInfoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
});