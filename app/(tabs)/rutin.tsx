import { CircularProgress } from '@/components/CircularProgress';
import { Timer } from '@/components/Timer';
import { useActivity } from '@/context/ActivityContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { RutinKategori } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Rutin kategorileri
const rutinKategorileri: RutinKategori[] = [
  // Temel Rutinler
  {
    id: 'su',
    isim: 'Su İç',
    icon: 'water',
    renk: '#2196F3',
    aciklama: 'Günlük su hedefini tamamla',
    kategori: 'temel',
    hedefDeger: 2000,
    birim: 'ml'
  },
  {
    id: 'uyku',
    isim: 'Kaliteli Uyku',
    icon: 'moon',
    renk: '#3F51B5',
    aciklama: 'En az 7 saat uyku',
    kategori: 'temel',
    hedefDeger: 7,
    birim: 'saat'
  },
  {
    id: 'adim',
    isim: 'Adım Hedefi',
    icon: 'walk',
    renk: '#FF9800',
    aciklama: 'Günlük adım hedefini tamamla',
    kategori: 'temel',
    hedefDeger: 10000,
    birim: 'adım'
  },
  
  // Sağlık Rutinleri
  {
    id: 'vitamin',
    isim: 'Vitamin Al',
    icon: 'medical',
    renk: '#4CAF50',
    aciklama: 'Günlük vitamin takviyesi',
    kategori: 'saglik'
  },
  {
    id: 'ilac',
    isim: 'İlaç İç',
    icon: 'fitness',
    renk: '#FF5252',
    aciklama: 'Reçeteli ilaçları zamanında al',
    kategori: 'saglik'
  },
  {
    id: 'kilo',
    isim: 'Kilo Ölç',
    icon: 'analytics',
    renk: '#9C27B0',
    aciklama: 'Günlük kilo takibi',
    kategori: 'saglik'
  },
  
  // Mental Rutinler
  {
    id: 'meditasyon',
    isim: 'Meditasyon',
    icon: 'leaf',
    renk: '#4CAF50',
    aciklama: 'Zihinsel dinginlik için meditasyon',
    kategori: 'mental',
    zamanlayici: true,
    varsayilanSure: 10
  },
  {
    id: 'gunluk',
    isim: 'Günlük Yaz',
    icon: 'create',
    renk: '#FF9800',
    aciklama: 'Düşüncelerini kaydet',
    kategori: 'mental',
    zamanlayici: true,
    varsayilanSure: 15
  },
  {
    id: 'okuma',
    isim: 'Kitap Oku',
    icon: 'library',
    renk: '#795548',
    aciklama: 'Günlük okuma alışkanlığı',
    kategori: 'mental',
    zamanlayici: true,
    varsayilanSure: 30
  },
  
  // Fiziksel Rutinler
  {
    id: 'esneme',
    isim: 'Esneme',
    icon: 'body',
    renk: '#E91E63',
    aciklama: 'Vücut esnekliği için esneme',
    kategori: 'fiziksel',
    zamanlayici: true,
    varsayilanSure: 10
  },
  {
    id: 'nefes',
    isim: 'Nefes Egzersizi',
    icon: 'heart',
    renk: '#00BCD4',
    aciklama: 'Derin nefes alma egzersizi',
    kategori: 'fiziksel',
    zamanlayici: true,
    varsayilanSure: 5
  },
  {
    id: 'dus',
    isim: 'Soğuk Duş',
    icon: 'water-outline',
    renk: '#607D8B',
    aciklama: 'Metabolizma için soğuk duş',
    kategori: 'fiziksel'
  },
  
  // Sosyal Rutinler
  {
    id: 'aile',
    isim: 'Aile Zamanı',
    icon: 'people',
    renk: '#FF6B35',
    aciklama: 'Aile ile kaliteli zaman geçir',
    kategori: 'sosyal',
    zamanlayici: true,
    varsayilanSure: 60
  },
  {
    id: 'arkadas',
    isim: 'Arkadaş Görüş',
    icon: 'chatbubbles',
    renk: '#FFA726',
    aciklama: 'Sosyal bağları güçlendir',
    kategori: 'sosyal'
  }
];

// Rutin şablonları
const rutinSablonlari = [
  {
    id: 'sabah',
    isim: 'Sabah Rutini',
    aciklama: 'Güne enerjik başla',
    icon: 'sunny',
    renk: '#FF9800',
    rutinler: ['su', 'esneme', 'meditasyon', 'gunluk']
  },
  {
    id: 'aksam',
    isim: 'Akşam Rutini',
    aciklama: 'Günü huzurla bitir',
    icon: 'moon',
    renk: '#3F51B5',
    rutinler: ['okuma', 'nefes', 'uyku']
  },
  {
    id: 'saglik',
    isim: 'Sağlık Rutini',
    aciklama: 'Sağlığını koru',
    icon: 'medical',
    renk: '#4CAF50',
    rutinler: ['vitamin', 'su', 'adim', 'kilo']
  },
  {
    id: 'mental',
    isim: 'Mental Sağlık',
    aciklama: 'Zihinsel sağlığını güçlendir',
    icon: 'leaf',
    renk: '#4CAF50',
    rutinler: ['meditasyon', 'gunluk', 'okuma', 'nefes']
  }
];

export default function Rutin() {
  const { todayActivity, isLoading, updateRutin } = useActivity();
  const { profile } = useUser();
  const { colors, isDark } = useTheme();
  const [selectedKategori, setSelectedKategori] = useState<string>('hepsi');
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showSablonModal, setShowSablonModal] = useState(false);
  const [showOzelRutinModal, setShowOzelRutinModal] = useState(false);
  const [selectedRutin, setSelectedRutin] = useState<RutinKategori | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [ozelRutinAd, setOzelRutinAd] = useState('');
  const [ozelRutinAciklama, setOzelRutinAciklama] = useState('');
  const [aktifRutinler, setAktifRutinler] = useState<string[]>([
    'su', 'uyku', 'adim', 'vitamin', 'meditasyon', 'esneme'
  ]);

  if (isLoading || !todayActivity) {
    const styles = createStyles(colors);
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const aktifRutinKategorileri = rutinKategorileri.filter(rutin => 
    aktifRutinler.includes(rutin.id)
  );

  const filtreliRutinler = selectedKategori === 'hepsi' 
    ? aktifRutinKategorileri
    : aktifRutinKategorileri.filter(rutin => rutin.kategori === selectedKategori);

  const tamamlananRutinSayisi = aktifRutinKategorileri.filter(rutin => 
    todayActivity.rutin[rutin.id]?.tamamlandi
  ).length;

  const rutinSkoru = aktifRutinKategorileri.length > 0 
    ? Math.round((tamamlananRutinSayisi / aktifRutinKategorileri.length) * 100)
    : 0;

  const handleRutinToggle = async (rutinId: string) => {
    const rutin = rutinKategorileri.find(r => r.id === rutinId);
    if (!rutin) return;

    if (rutin.zamanlayici && !todayActivity.rutin[rutinId]?.tamamlandi) {
      setSelectedRutin(rutin);
      setTimerSeconds(0);
      setShowTimerModal(true);
    } else {
      const mevcutDurum = todayActivity.rutin[rutinId]?.tamamlandi || false;
      const rutinDetay: any = {
        tamamlandi: !mevcutDurum
      };
      
      // Sadece tamamlanıyorsa zaman ekle
      if (!mevcutDurum) {
        rutinDetay.zaman = new Date().toISOString();
      }
      
      await updateRutin(rutinId, rutinDetay);
    }
  };

  const handleTimerComplete = async () => {
    if (!selectedRutin) return;
    
    const sure = Math.ceil(timerSeconds / 60);
    await updateRutin(selectedRutin.id, {
      tamamlandi: true,
      zaman: new Date().toISOString(),
      sure: sure
    });
    
    setShowTimerModal(false);
    setSelectedRutin(null);
    setTimerSeconds(0);
  };

  const handleSablonUygula = (sablon: any) => {
    const yeniAktifRutinler = [...new Set([...aktifRutinler, ...sablon.rutinler])];
    setAktifRutinler(yeniAktifRutinler);
    setShowSablonModal(false);
  };

  const handleOzelRutinEkle = () => {
    if (!ozelRutinAd.trim()) return;
    
    const yeniRutin: RutinKategori = {
      id: `ozel_${Date.now()}`,
      isim: ozelRutinAd.trim(),
      icon: 'star',
      renk: '#9C27B0',
      aciklama: ozelRutinAciklama.trim() || 'Özel rutin',
      kategori: 'ozel'
    };
    
    rutinKategorileri.push(yeniRutin);
    setAktifRutinler([...aktifRutinler, yeniRutin.id]);
    setOzelRutinAd('');
    setOzelRutinAciklama('');
    setShowOzelRutinModal(false);
  };

  const getRutinDeger = (rutin: RutinKategori) => {
    if (rutin.id === 'su') {
      const mevcutSu = todayActivity.suMiktari || 0;
      const hedefSu = parseInt(profile.hedefSu) || 2000;
      return `${mevcutSu}/${hedefSu} ml`;
    } else if (rutin.id === 'adim') {
      const mevcutAdim = todayActivity.adimSayisi || 0;
      const hedefAdim = parseInt(profile.hedefAdim) || 10000;
      return `${mevcutAdim.toLocaleString('tr-TR')}/${hedefAdim.toLocaleString('tr-TR')} adım`;
    } else if (rutin.zamanlayici && todayActivity.rutin[rutin.id]?.sure) {
      return `${todayActivity.rutin[rutin.id].sure} dakika`;
    }
    return null;
  };

  const getRutinYuzde = (rutin: RutinKategori) => {
    if (rutin.id === 'su') {
      const mevcutSu = todayActivity.suMiktari || 0;
      const hedefSu = parseInt(profile.hedefSu) || 2000;
      return Math.min((mevcutSu / hedefSu) * 100, 100);
    } else if (rutin.id === 'adim') {
      const mevcutAdim = todayActivity.adimSayisi || 0;
      const hedefAdim = parseInt(profile.hedefAdim) || 10000;
      return Math.min((mevcutAdim / hedefAdim) * 100, 100);
    }
    return todayActivity.rutin[rutin.id]?.tamamlandi ? 100 : 0;
  };

  const kategoriler = [
    { key: 'hepsi', isim: 'Hepsi', icon: 'apps' },
    { key: 'temel', isim: 'Temel', icon: 'home' },
    { key: 'saglik', isim: 'Sağlık', icon: 'medical' },
    { key: 'mental', isim: 'Mental', icon: 'leaf' },
    { key: 'fiziksel', isim: 'Fiziksel', icon: 'body' },
    { key: 'sosyal', isim: 'Sosyal', icon: 'people' },
  ];

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Günlük Rutinler</Text>
          <Text style={styles.subtitle}>Sağlıklı alışkanlıklar geliştir</Text>
        </View>
        <CircularProgress
          progress={rutinSkoru}
          size={80}
          strokeWidth={8}
          color={rutinSkoru >= 80 ? '#4CAF50' : rutinSkoru >= 60 ? '#FF9800' : '#FF5252'}
          backgroundColor={colors.border}
          text={`${rutinSkoru}`}
        />
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{tamamlananRutinSayisi}/{aktifRutinKategorileri.length}</Text>
          <Text style={styles.statLabel}>Rutin</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{rutinSkoru}</Text>
          <Text style={styles.statLabel}>Skor</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Kategori Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategoriContainer}>
        {kategoriler.map((kategori) => (
          <TouchableOpacity
            key={kategori.key}
            style={[
              styles.kategoriButton,
              selectedKategori === kategori.key && styles.kategoriButtonActive
            ]}
            onPress={() => setSelectedKategori(kategori.key)}
          >
            <Ionicons 
              name={kategori.icon as any} 
              size={20} 
              color={selectedKategori === kategori.key ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.kategoriButtonText,
              selectedKategori === kategori.key && styles.kategoriButtonTextActive
            ]}>
              {kategori.isim}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rutinler */}
      <View style={styles.rutinlerContainer}>
        {filtreliRutinler.map((rutin) => {
          const rutinDetay = todayActivity.rutin[rutin.id];
          const tamamlandi = rutinDetay?.tamamlandi || false;
          const yuzde = getRutinYuzde(rutin);
          const deger = getRutinDeger(rutin);
          
          return (
            <TouchableOpacity
              key={rutin.id}
              style={[styles.rutinCard, { borderLeftColor: rutin.renk }]}
              onPress={() => handleRutinToggle(rutin.id)}
              activeOpacity={0.7}
            >
              <View style={styles.rutinHeader}>
                <View style={[styles.rutinIconContainer, { backgroundColor: `${rutin.renk}20` }]}>
                  <Ionicons name={rutin.icon as any} size={28} color={rutin.renk} />
                </View>
                <View style={styles.rutinInfo}>
                  <Text style={styles.rutinName}>{rutin.isim}</Text>
                  <Text style={styles.rutinAciklama}>{rutin.aciklama}</Text>
                  {deger && (
                    <Text style={styles.rutinDeger}>{deger}</Text>
                  )}
                </View>
                <View style={styles.rutinProgress}>
                  <CircularProgress
                    progress={yuzde}
                    size={60}
                    strokeWidth={6}
                    color={tamamlandi ? '#4CAF50' : rutin.renk}
                    backgroundColor={colors.border}
                    showText={false}
                  />
                  {tamamlandi && (
                    <View style={styles.rutinCheckmark}>
                      <Ionicons name="checkmark" size={20} color="#4CAF50" />
                    </View>
                  )}
                </View>
              </View>
              
              {rutin.zamanlayici && (
                <View style={styles.rutinTimer}>
                  <Ionicons name="timer" size={16} color={colors.textSecondary} />
                  <Text style={styles.rutinTimerText}>
                    {rutin.varsayilanSure} dakika önerilen
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hızlı Aksiyonlar */}
      <Text style={styles.sectionTitle}>Hızlı Aksiyonlar</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setShowSablonModal(true)}
        >
          <Ionicons name="library" size={32} color="#4CAF50" />
          <Text style={styles.quickActionText}>Rutin Şablonları</Text>
          <Text style={styles.quickActionSubtext}>Hazır rutin paketleri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setShowOzelRutinModal(true)}
        >
          <Ionicons name="add-circle" size={32} color="#2196F3" />
          <Text style={styles.quickActionText}>Özel Rutin</Text>
          <Text style={styles.quickActionSubtext}>Kendi rutinini oluştur</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Modal */}
      {showTimerModal && selectedRutin && (
        <Modal
          visible={showTimerModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.timerHeader, { backgroundColor: selectedRutin.renk }]}>
                <Ionicons name={selectedRutin.icon as any} size={40} color="#fff" />
                <Text style={styles.timerTitle}>{selectedRutin.isim}</Text>
                <Text style={styles.timerSubtitle}>{selectedRutin.aciklama}</Text>
              </View>
              
              <View style={styles.timerContainer}>
                <Timer
                  initialSeconds={timerSeconds}
                  onTimeUpdate={(secs) => setTimerSeconds(secs)}
                  autoStart={true}
                />
                
                <View style={styles.timerInfo}>
                  <Text style={styles.timerInfoText}>
                    Önerilen: {selectedRutin.varsayilanSure} dakika
                  </Text>
                  <Text style={styles.timerInfoText}>
                    Geçen: {Math.floor(timerSeconds / 60)} dakika {timerSeconds % 60} saniye
                  </Text>
                </View>
              </View>

              <View style={styles.timerButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowTimerModal(false)}
                >
                  <Text style={styles.modalButtonText}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.completeButton]}
                  onPress={handleTimerComplete}
                >
                  <Text style={styles.modalButtonText}>Tamamla</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Şablon Modal */}
      <Modal
        visible={showSablonModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSablonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rutin Şablonları</Text>
              <TouchableOpacity onPress={() => setShowSablonModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sablonScroll} showsVerticalScrollIndicator={false}>
              {rutinSablonlari.map((sablon) => (
                <TouchableOpacity
                  key={sablon.id}
                  style={[styles.sablonCard, { borderLeftColor: sablon.renk }]}
                  onPress={() => handleSablonUygula(sablon)}
                >
                  <View style={styles.sablonHeader}>
                    <View style={[styles.sablonIcon, { backgroundColor: `${sablon.renk}20` }]}>
                      <Ionicons name={sablon.icon as any} size={24} color={sablon.renk} />
                    </View>
                    <View style={styles.sablonInfo}>
                      <Text style={styles.sablonName}>{sablon.isim}</Text>
                      <Text style={styles.sablonAciklama}>{sablon.aciklama}</Text>
                    </View>
                  </View>
                  <Text style={styles.sablonRutinler}>
                    {sablon.rutinler.length} rutin içerir
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Özel Rutin Modal */}
      <Modal
        visible={showOzelRutinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOzelRutinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Özel Rutin Oluştur</Text>
              <TouchableOpacity onPress={() => setShowOzelRutinModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rutin Adı</Text>
              <TextInput
                style={styles.input}
                value={ozelRutinAd}
                onChangeText={setOzelRutinAd}
                placeholder="Örn: Sabah Kahvesi"
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={ozelRutinAciklama}
                onChangeText={setOzelRutinAciklama}
                placeholder="Rutin hakkında kısa açıklama..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowOzelRutinModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.completeButton,
                  !ozelRutinAd.trim() && styles.disabledButton
                ]}
                onPress={handleOzelRutinEkle}
                disabled={!ozelRutinAd.trim()}
              >
                <Text style={styles.modalButtonText}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Motivasyon Mesajı */}
      {rutinSkoru < 50 && (
        <View style={styles.motivationCard}>
          <Ionicons name="star" size={32} color="#FFD700" />
          <Text style={styles.motivationText}>
            Küçük adımlarla büyük değişiklikler yaratabilirsin! Her rutin seni hedefe yaklaştırıyor. 🌟
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
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
    kategoriContainer: {
      marginBottom: 20,
    },
    kategoriButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    kategoriButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    kategoriButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    kategoriButtonTextActive: {
      color: '#fff',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    rutinlerContainer: {
      gap: 16,
      marginBottom: 20,
    },
    rutinCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      borderLeftWidth: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    rutinHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    rutinIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rutinInfo: {
      flex: 1,
    },
    rutinName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    rutinAciklama: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    rutinDeger: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '600',
    },
    rutinProgress: {
      position: 'relative',
      marginLeft: 12,
    },
    rutinCheckmark: {
      position: 'absolute',
      top: 20,
      left: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rutinTimer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 4,
    },
    rutinTimerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickActionText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    quickActionSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    timerHeader: {
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    timerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 12,
    },
    timerSubtitle: {
      fontSize: 16,
      color: '#fff',
      opacity: 0.9,
      marginTop: 4,
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
      color: colors.textSecondary,
    },
    timerButtons: {
      flexDirection: 'row',
      gap: 12,
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
    cancelButton: {
      backgroundColor: colors.error,
    },
    completeButton: {
      backgroundColor: colors.success,
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    sablonScroll: {
      flex: 1,
      maxHeight: 400,
    },
    sablonCard: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    sablonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sablonIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sablonInfo: {
      flex: 1,
    },
    sablonName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    sablonAciklama: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sablonRutinler: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '600',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.background,
      color: colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    motivationCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    motivationText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
  });
}