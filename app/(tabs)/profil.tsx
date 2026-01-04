import { CircularProgress } from '@/components/CircularProgress';
import { useActivity } from '@/context/ActivityContext';
import { useAuth } from '@/context/AuthContext';
import { useFriends } from '@/context/FriendsContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Profil kategorileri
const profilKategorileri = [
  {
    id: 'kisisel',
    baslik: 'Kişisel Bilgiler',
    icon: 'person',
    renk: '#4CAF50'
  },
  {
    id: 'fiziksel',
    baslik: 'Fiziksel Özellikler',
    icon: 'fitness',
    renk: '#2196F3'
  },
  {
    id: 'hedefler',
    baslik: 'Günlük Hedefler',
    icon: 'trophy',
    renk: '#FF9800'
  },
  {
    id: 'arkadaslar',
    baslik: 'Arkadaşlarım',
    icon: 'people',
    renk: '#E91E63'
  },
  {
    id: 'saglik',
    baslik: 'Sağlık Bilgileri',
    icon: 'medical',
    renk: '#9C27B0'
  },
  {
    id: 'bildirimler',
    baslik: 'Bildirim Ayarları',
    icon: 'notifications',
    renk: '#FF5722'
  },
  {
    id: 'tercihler',
    baslik: 'Uygulama Tercihleri',
    icon: 'settings',
    renk: '#607D8B'
  }
];

// Aktivite seviyeleri
const aktiviteSeviyesi = [
  { id: 'sedanter', isim: 'Sedanter', aciklama: 'Çok az hareket', carpan: 1.2 },
  { id: 'hafif', isim: 'Hafif Aktif', aciklama: 'Haftada 1-3 gün egzersiz', carpan: 1.375 },
  { id: 'orta', isim: 'Orta Aktif', aciklama: 'Haftada 3-5 gün egzersiz', carpan: 1.55 },
  { id: 'yuksek', isim: 'Çok Aktif', aciklama: 'Haftada 6-7 gün egzersiz', carpan: 1.725 },
  { id: 'cok_yuksek', isim: 'Aşırı Aktif', aciklama: 'Günde 2 kez egzersiz', carpan: 1.9 }
];

// Hedef türleri
const hedefTurleri = [
  { id: 'kilo-ver', isim: 'Kilo Ver', icon: 'trending-down', renk: '#FF5252' },
  { id: 'kilo-al', isim: 'Kilo Al', icon: 'trending-up', renk: '#4CAF50' },
  { id: 'koru', isim: 'Kilonu Koru', icon: 'remove', renk: '#2196F3' },
  { id: 'kas-kazan', isim: 'Kas Kazan', icon: 'fitness', renk: '#FF9800' }
];

export default function Profil() {
  const { profile, updateProfile, isLoading } = useUser();
  const { todayActivity } = useActivity();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { 
    friends, 
    friendRequests, 
    publicId, 
    isLoading: friendsLoading,
    generatePublicId,
    findUserByPublicId,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  } = useFriends();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('kisisel');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'aktivite' | 'hedef' | 'istatistik' | 'arkadas-ara' | 'arkadas-istekleri' | null>(null);
  const [kaydedildi, setKaydedildi] = useState(false);

  // Arkadaşlık sistemi state'leri
  const [searchPublicId, setSearchPublicId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Form state'leri
  const [ad, setAd] = useState('');
  const [yas, setYas] = useState('');
  const [cinsiyet, setCinsiyet] = useState('');
  const [kilo, setKilo] = useState('');
  const [boy, setBoy] = useState('');
  const [hedefKilo, setHedefKilo] = useState('');
  const [hedefAdim, setHedefAdim] = useState('10000');
  const [hedefSu, setHedefSu] = useState('2000');
  const [hedefSpor, setHedefSpor] = useState('90');
  const [hedefKalori, setHedefKalori] = useState('2000');
  const [aktiviteSeviyesiSecim, setAktiviteSeviyesiSecim] = useState('orta');
  const [beslenmeHedefi, setBeslenmeHedefi] = useState<'kilo-ver' | 'kilo-al' | 'koru' | 'kas-kazan'>('koru');
  const [kronikHastalik, setKronikHastalik] = useState('');
  const [alerji, setAlerji] = useState('');
  const [ilac, setIlac] = useState('');
  const [notifikasyon, setNotifikasyon] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Bildirim ayarları
  const [suHatirlatici, setSuHatirlatici] = useState(true);
  const [yemekHatirlatici, setYemekHatirlatici] = useState(true);
  const [egzersizHatirlatici, setEgzersizHatirlatici] = useState(true);
  const [motivasyonBildirimi, setMotivasyonBildirimi] = useState(true);
  const [gunlukOzet, setGunlukOzet] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setAd(profile.ad || '');
      setYas(profile.yas || '');
      setCinsiyet(profile.cinsiyet || '');
      setKilo(profile.kilo || '');
      setBoy(profile.boy || '');
      setHedefKilo(profile.hedefKilo || '');
      setHedefAdim(profile.hedefAdim || '10000');
      setHedefSu(profile.hedefSu || '2000');
      setHedefSpor(profile.hedefSpor || '90');
      setHedefKalori(profile.hedefKalori || '2000');
      setAktiviteSeviyesiSecim(profile.aktiviteSeviyesi || 'orta');
      setBeslenmeHedefi(profile.beslenmeHedefi || 'koru');
      setKronikHastalik(profile.kronikHastalik || '');
      setAlerji(profile.alerji || '');
      setIlac(profile.ilac || '');
      setNotifikasyon(profile.notifikasyon !== false);
      setDarkMode(profile.darkMode || false);
    }
  }, [profile, isLoading]);

  const kaydet = async () => {
    try {
      await updateProfile({
        ...profile,
        ad,
        yas,
        cinsiyet,
        kilo,
        boy,
        hedefKilo,
        hedefAdim,
        hedefSu,
        hedefSpor,
        hedefKalori,
        aktiviteSeviyesi: aktiviteSeviyesiSecim,
        beslenmeHedefi,
        kronikHastalik,
        alerji,
        ilac,
        notifikasyon,
        darkMode,
      });
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 2000);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      Alert.alert('Hata', 'Profil kaydedilirken bir hata oluştu.');
    }
  };

  const hesaplaBMI = () => {
    if (!kilo || !boy) return 0;
    const kiloNum = parseFloat(kilo);
    const boyNum = parseFloat(boy) / 100; // cm'den m'ye
    return kiloNum / (boyNum * boyNum);
  };

  const getBMIKategori = (bmi: number) => {
    if (bmi < 18.5) return { kategori: 'Zayıf', renk: '#2196F3' };
    if (bmi < 25) return { kategori: 'Normal', renk: '#4CAF50' };
    if (bmi < 30) return { kategori: 'Fazla Kilolu', renk: '#FF9800' };
    return { kategori: 'Obez', renk: '#FF5252' };
  };

  const hesaplaGunlukKalori = () => {
    if (!kilo || !boy || !yas) return 2000;
    
    const kiloNum = parseFloat(kilo);
    const boyNum = parseFloat(boy);
    const yasNum = parseFloat(yas);
    const aktiviteCarpan = aktiviteSeviyesi.find(a => a.id === aktiviteSeviyesiSecim)?.carpan || 1.55;
    
    // Harris-Benedict formülü
    let bmr;
    if (cinsiyet === 'erkek') {
      bmr = 88.362 + (13.397 * kiloNum) + (4.799 * boyNum) - (5.677 * yasNum);
    } else {
      bmr = 447.593 + (9.247 * kiloNum) + (3.098 * boyNum) - (4.330 * yasNum);
    }
    
    return Math.round(bmr * aktiviteCarpan);
  };

  const getHedefDurum = () => {
    if (!kilo || !hedefKilo) return null;
    const mevcutKilo = parseFloat(kilo);
    const hedef = parseFloat(hedefKilo);
    const fark = Math.abs(mevcutKilo - hedef);
    const yuzde = Math.max(0, Math.min(100, ((hedef - mevcutKilo) / mevcutKilo) * 100));
    
    return {
      fark: fark.toFixed(1),
      yuzde: Math.abs(yuzde).toFixed(1),
      tip: mevcutKilo > hedef ? 'ver' : 'al',
      tamamlandi: fark < 1
    };
  };

  const getGunlukIlerleme = () => {
    if (!todayActivity) return { adim: 0, su: 0, spor: 0, kalori: 0 };
    
    const adimYuzde = Math.min(((todayActivity.adimSayisi || 0) / parseInt(hedefAdim)) * 100, 100);
    const suYuzde = Math.min(((todayActivity.suMiktari || 0) / parseInt(hedefSu)) * 100, 100);
    const sporYuzde = todayActivity.spor.tamamlandi ? 100 : 0;
    const kaloriYuzde = Math.min(((todayActivity.gunlukKalori || 0) / parseInt(hedefKalori)) * 100, 100);
    
    return { adim: adimYuzde, su: suYuzde, spor: sporYuzde, kalori: kaloriYuzde };
  };

  // Arkadaşlık sistemi fonksiyonları
  const handleSearchUser = async () => {
    if (!searchPublicId.trim()) {
      Alert.alert('Hata', 'Lütfen bir Public ID girin.');
      return;
    }

    setSearchLoading(true);
    try {
      const result = await findUserByPublicId(searchPublicId.trim());
      setSearchResult(result);
      if (!result) {
        Alert.alert('Kullanıcı Bulunamadı', 'Bu Public ID ile kayıtlı kullanıcı bulunamadı.');
      }
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      Alert.alert('Hata', 'Kullanıcı aranırken bir hata oluştu.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      const result = await sendFriendRequest(toUserId);
      Alert.alert(
        result.success ? 'Başarılı' : 'Hata',
        result.message
      );
      if (result.success) {
        setSearchResult(null);
        setSearchPublicId('');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      Alert.alert('Hata', 'Arkadaşlık isteği gönderilemedi.');
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    try {
      const result = await acceptFriendRequest(friendId);
      Alert.alert(
        result.success ? 'Başarılı' : 'Hata',
        result.message
      );
    } catch (error) {
      console.error('Arkadaşlık isteği kabul etme hatası:', error);
      Alert.alert('Hata', 'Arkadaşlık isteği kabul edilemedi.');
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    try {
      const result = await rejectFriendRequest(friendId);
      Alert.alert(
        result.success ? 'Başarılı' : 'Hata',
        result.message
      );
    } catch (error) {
      console.error('Arkadaşlık isteği reddetme hatası:', error);
      Alert.alert('Hata', 'Arkadaşlık isteği reddedilemedi.');
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    Alert.alert(
      'Arkadaşı Sil',
      `${friendName} adlı kişiyi arkadaş listenizden silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await removeFriend(friendId);
              Alert.alert(
                result.success ? 'Başarılı' : 'Hata',
                result.message
              );
            } catch (error) {
              console.error('Arkadaş silme hatası:', error);
              Alert.alert('Hata', 'Arkadaş silinemedi.');
            }
          }
        }
      ]
    );
  };

  const copyPublicId = () => {
    // React Native'de clipboard kullanımı için @react-native-clipboard/clipboard gerekli
    // Şimdilik Alert ile gösterelim
    Alert.alert(
      'Public ID',
      `Sizin Public ID'niz: ${publicId}`,
      [
        { text: 'Tamam', style: 'default' }
      ]
    );
  };

  if (isLoading) {
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

  const bmi = hesaplaBMI();
  const bmiKategori = getBMIKategori(bmi);
  const gunlukKalori = hesaplaGunlukKalori();
  const hedefDurum = getHedefDurum();
  const gunlukIlerleme = getGunlukIlerleme();

  const styles = StyleSheet.create({
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
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    userStats: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statsButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? colors.card : '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressCard: {
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
    hedefCard: {
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
    hedefHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    hedefTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 8,
    },
    hedefContent: {
      gap: 12,
    },
    hedefText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    hedefProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    hedefBar: {
      flex: 1,
      height: 8,
      backgroundColor: isDark ? colors.border : '#E0E0E0',
      borderRadius: 4,
      overflow: 'hidden',
    },
    hedefFill: {
      height: '100%',
      borderRadius: 4,
    },
    hedefPercent: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      minWidth: 40,
      textAlign: 'right',
    },
    categoryContainer: {
      marginBottom: 20,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 12,
      borderRadius: 25,
      backgroundColor: colors.surface,
      borderWidth: 2,
      gap: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    categoryButtonTextActive: {
      color: '#fff',
    },
    sectionCard: {
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    sectionContent: {
      gap: 16,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      color: colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
    },
    inputHalf: {
      flex: 1,
      gap: 8,
    },
    genderContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    genderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      gap: 6,
    },
    genderButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genderText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    genderTextActive: {
      color: '#fff',
    },
    bmiCard: {
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    bmiHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bmiTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    bmiValue: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    bmiNumber: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    bmiKategori: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    bmiBar: {
      position: 'relative',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    bmiScale: {
      flexDirection: 'row',
      height: '100%',
    },
    bmiSegment: {
      flex: 1,
    },
    bmiIndicator: {
      position: 'absolute',
      top: -2,
      width: 4,
      height: 12,
      backgroundColor: colors.text,
      borderRadius: 2,
    },
    bmiLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bmiLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    selectButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: isDark ? colors.card : '#f9f9f9',
    },
    selectButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    kaloriOneri: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#FFF8E1',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#FFD54F',
      gap: 12,
    },
    kaloriOneriText: {
      flex: 1,
    },
    kaloriOneriTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    kaloriOneriValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.accent,
      marginBottom: 2,
    },
    kaloriOneriDesc: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    switchItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    switchInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    switchText: {
      flex: 1,
    },
    switchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    switchDesc: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    switch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.border,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    switchActive: {
      backgroundColor: colors.primary,
    },
    switchThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    switchThumbActive: {
      transform: [{ translateX: 20 }],
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      gap: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    successMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.card : '#E8F5E9',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.success,
    },
    successText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success,
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
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    modalScroll: {
      maxHeight: 300,
      marginBottom: 20,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      minHeight: 60,
    },
    modalOptionActive: {
      backgroundColor: isDark ? colors.card : '#E8F5E9',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modalOptionInfo: {
      flex: 1,
    },
    modalOptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalOptionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    modalOptionDesc: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsContainer: {
      gap: 16,
    },
    statItem: {
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    statCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    userInfoSection: {
      marginTop: 30,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
    },
    userInfoTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    userInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    userInfoText: {
      fontSize: 16,
      color: colors.text,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF525220',
      borderWidth: 1,
      borderColor: '#FF5252',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      gap: 8,
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FF5252',
    },
    notificationSettings: {
      marginTop: 16,
      marginBottom: 16,
    },
    notificationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notificationButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    notificationButtonText: {
      marginLeft: 12,
      flex: 1,
    },
    notificationButtonTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    notificationButtonDesc: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    permissionWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      marginBottom: 16,
      gap: 12,
    },
    permissionWarningText: {
      flex: 1,
      fontSize: 14,
      color: '#F57C00',
    },
    // Arkadaşlık sistemi stilleri
    publicIdCard: {
      backgroundColor: isDark ? colors.card : '#FCE4EC',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E91E63',
    },
    publicIdHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    publicIdTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    publicIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors.surface : '#fff',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    publicIdText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#E91E63',
      flex: 1,
    },
    publicIdDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    friendsActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    friendsActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E91E63',
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    friendsActionText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    friendsList: {
      marginTop: 8,
    },
    friendsListTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    friendsLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      gap: 12,
    },
    friendsLoadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyFriends: {
      alignItems: 'center',
      padding: 40,
      gap: 12,
    },
    emptyFriendsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    emptyFriendsDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    friendsGrid: {
      gap: 12,
    },
    friendCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    friendAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#E91E63',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    friendAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    friendId: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    friendRemoveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF525220',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Modal stilleri
    searchContainer: {
      marginBottom: 20,
    },
    searchLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    searchInputContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: isDark ? colors.card : '#f9f9f9',
      color: colors.text,
    },
    searchButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#E91E63',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchResultContainer: {
      marginTop: 20,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    searchResultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#E8F5E9',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#4CAF50',
    },
    searchResultAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    searchResultAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    searchResultInfo: {
      flex: 1,
    },
    searchResultName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    searchResultId: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    addFriendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
    },
    addFriendButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff',
    },
    emptyRequests: {
      alignItems: 'center',
      padding: 40,
      gap: 12,
    },
    emptyRequestsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    emptyRequestsDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    requestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#FFF3E0',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#FF9800',
    },
    requestAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FF9800',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    requestAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    requestInfo: {
      flex: 1,
    },
    requestName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    requestId: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    requestText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    requestActions: {
      flexDirection: 'row',
      gap: 8,
    },
    acceptButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rejectButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF5252',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderKisiselBilgiler = () => (
    <View style={styles.sectionContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınız ve soyadınız"
          value={ad}
          onChangeText={setAd}
        />
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Yaş</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            value={yas}
            onChangeText={setYas}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Cinsiyet</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, cinsiyet === 'erkek' && styles.genderButtonActive]}
              onPress={() => setCinsiyet('erkek')}
            >
              <Ionicons name="man" size={20} color={cinsiyet === 'erkek' ? '#fff' : '#666'} />
              <Text style={[styles.genderText, cinsiyet === 'erkek' && styles.genderTextActive]}>Erkek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, cinsiyet === 'kadın' && styles.genderButtonActive]}
              onPress={() => setCinsiyet('kadın')}
            >
              <Ionicons name="woman" size={20} color={cinsiyet === 'kadın' ? '#fff' : '#666'} />
              <Text style={[styles.genderText, cinsiyet === 'kadın' && styles.genderTextActive]}>Kadın</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFizikselOzellikler = () => (
    <View style={styles.sectionContent}>
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="70"
            value={kilo}
            onChangeText={setKilo}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Boy (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="175"
            value={boy}
            onChangeText={setBoy}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hedef Kilo (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="65"
          value={hedefKilo}
          onChangeText={setHedefKilo}
          keyboardType="numeric"
        />
      </View>

      {/* BMI Kartı */}
      {bmi > 0 && (
        <View style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Vücut Kitle İndeksi (BMI)</Text>
            <View style={[styles.bmiValue, { backgroundColor: `${bmiKategori.renk}20` }]}>
              <Text style={[styles.bmiNumber, { color: bmiKategori.renk }]}>{bmi.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={[styles.bmiKategori, { color: bmiKategori.renk }]}>{bmiKategori.kategori}</Text>
          <View style={styles.bmiBar}>
            <View style={styles.bmiScale}>
              <View style={[styles.bmiSegment, { backgroundColor: '#2196F3' }]} />
              <View style={[styles.bmiSegment, { backgroundColor: '#4CAF50' }]} />
              <View style={[styles.bmiSegment, { backgroundColor: '#FF9800' }]} />
              <View style={[styles.bmiSegment, { backgroundColor: '#FF5252' }]} />
            </View>
            <View style={[styles.bmiIndicator, { left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%` }]} />
          </View>
          <View style={styles.bmiLabels}>
            <Text style={styles.bmiLabel}>Zayıf</Text>
            <Text style={styles.bmiLabel}>Normal</Text>
            <Text style={styles.bmiLabel}>Fazla</Text>
            <Text style={styles.bmiLabel}>Obez</Text>
          </View>
        </View>
      )}

      {/* Aktivite Seviyesi */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Aktivite Seviyesi</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            setModalType('aktivite');
            setShowModal(true);
          }}
        >
          <Text style={styles.selectButtonText}>
            {aktiviteSeviyesi.find(a => a.id === aktiviteSeviyesiSecim)?.isim || 'Seçiniz'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHedefler = () => (
    <View style={styles.sectionContent}>
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Günlük Adım</Text>
          <TextInput
            style={styles.input}
            placeholder="10000"
            value={hedefAdim}
            onChangeText={setHedefAdim}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Su (ml)</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            value={hedefSu}
            onChangeText={setHedefSu}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Spor (dk)</Text>
          <TextInput
            style={styles.input}
            placeholder="90"
            value={hedefSpor}
            onChangeText={setHedefSpor}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Kalori</Text>
          <TextInput
            style={styles.input}
            placeholder={gunlukKalori.toString()}
            value={hedefKalori}
            onChangeText={setHedefKalori}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Beslenme Hedefi */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Beslenme Hedefi</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            setModalType('hedef');
            setShowModal(true);
          }}
        >
          <Text style={styles.selectButtonText}>
            {hedefTurleri.find(h => h.id === beslenmeHedefi)?.isim || 'Seçiniz'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Önerilen Kalori */}
      <View style={styles.kaloriOneri}>
        <Ionicons name="bulb" size={24} color="#FF9800" />
        <View style={styles.kaloriOneriText}>
          <Text style={styles.kaloriOneriTitle}>Önerilen Günlük Kalori</Text>
          <Text style={styles.kaloriOneriValue}>{gunlukKalori} kcal</Text>
          <Text style={styles.kaloriOneriDesc}>Yaş, kilo, boy ve aktivite seviyenize göre</Text>
        </View>
      </View>
    </View>
  );

  const renderSaglikBilgileri = () => (
    <View style={styles.sectionContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kronik Hastalıklar</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Diyabet, hipertansiyon vb. (varsa)"
          value={kronikHastalik}
          onChangeText={setKronikHastalik}
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Alerjiler</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Besin alerjileri, ilaç alerjileri vb."
          value={alerji}
          onChangeText={setAlerji}
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kullandığınız İlaçlar</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Düzenli kullandığınız ilaçlar"
          value={ilac}
          onChangeText={setIlac}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderArkadaslar = () => (
    <View style={styles.sectionContent}>
      {/* Public ID Kartı */}
      <View style={styles.publicIdCard}>
        <View style={styles.publicIdHeader}>
          <Ionicons name="id-card" size={24} color="#E91E63" />
          <Text style={styles.publicIdTitle}>Sizin Public ID'niz</Text>
        </View>
        <TouchableOpacity style={styles.publicIdContainer} onPress={copyPublicId}>
          <Text style={styles.publicIdText}>{publicId || 'Yükleniyor...'}</Text>
          <Ionicons name="copy" size={20} color="#E91E63" />
        </TouchableOpacity>
        <Text style={styles.publicIdDesc}>
          Arkadaşlarınız bu ID ile sizi bulabilir. Dokunarak kopyalayın.
        </Text>
      </View>

      {/* Hızlı Aksiyonlar */}
      <View style={styles.friendsActions}>
        <TouchableOpacity
          style={styles.friendsActionButton}
          onPress={() => {
            setModalType('arkadas-ara');
            setShowModal(true);
          }}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
          <Text style={styles.friendsActionText}>Arkadaş Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.friendsActionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => {
            setModalType('arkadas-istekleri');
            setShowModal(true);
          }}
        >
          <Ionicons name="mail" size={24} color="#fff" />
          <Text style={styles.friendsActionText}>
            İstekler {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arkadaş Listesi */}
      <View style={styles.friendsList}>
        <Text style={styles.friendsListTitle}>
          Arkadaşlarım ({friends.length})
        </Text>
        
        {friendsLoading ? (
          <View style={styles.friendsLoading}>
            <ActivityIndicator size="small" color="#E91E63" />
            <Text style={styles.friendsLoadingText}>Arkadaşlar yükleniyor...</Text>
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.emptyFriends}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyFriendsText}>Henüz arkadaşınız yok</Text>
            <Text style={styles.emptyFriendsDesc}>
              Public ID paylaşarak arkadaş ekleyebilirsiniz
            </Text>
          </View>
        ) : (
          <View style={styles.friendsGrid}>
            {friends.map((friend) => (
              <View key={friend.uid} style={styles.friendCard}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {friend.ad.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.ad} {friend.soyad}</Text>
                  <Text style={styles.friendId}>@{friend.publicId}</Text>
                </View>
                <TouchableOpacity
                  style={styles.friendRemoveButton}
                  onPress={() => handleRemoveFriend(friend.uid, `${friend.ad} ${friend.soyad}`)}
                >
                  <Ionicons name="person-remove" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const handleLogout = () => {
    console.log('🚪 Çıkış yap butonuna basıldı');
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { 
          text: 'İptal Et', 
          style: 'cancel',
          onPress: () => console.log('❌ Çıkış iptal edildi')
        },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 Çıkış onaylandı, çıkış yapılıyor...');
            try {
              await logout();
              console.log('✅ Logout tamamlandı, login sayfasına yönlendiriliyor...');
              router.replace('/auth/login');
            } catch (error) {
              console.error('❌ Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const renderBildirimAyarlari = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Bildirim Tercihleri</Text>
      
      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="water" size={24} color="#2196F3" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Su İçme Hatırlatıcısı</Text>
            <Text style={styles.switchDesc}>1.5 saatte bir su içme bildirimi</Text>
          </View>
        </View>
        <Switch
          value={suHatirlatici}
          onValueChange={setSuHatirlatici}
          trackColor={{ false: '#767577', true: '#2196F3' }}
          thumbColor={suHatirlatici ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="restaurant" size={24} color="#FF9800" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Yemek Saati Hatırlatıcısı</Text>
            <Text style={styles.switchDesc}>Kahvaltı, öğle, akşam yemeği bildirimleri</Text>
          </View>
        </View>
        <Switch
          value={yemekHatirlatici}
          onValueChange={setYemekHatirlatici}
          trackColor={{ false: '#767577', true: '#FF9800' }}
          thumbColor={yemekHatirlatici ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="barbell" size={24} color="#4CAF50" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Egzersiz Hatırlatıcısı</Text>
            <Text style={styles.switchDesc}>2 saatte bir egzersiz bildirimi</Text>
          </View>
        </View>
        <Switch
          value={egzersizHatirlatici}
          onValueChange={setEgzersizHatirlatici}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={egzersizHatirlatici ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="star" size={24} color="#FF5722" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Motivasyon Bildirimleri</Text>
            <Text style={styles.switchDesc}>Günlük motivasyon mesajları</Text>
          </View>
        </View>
        <Switch
          value={motivasyonBildirimi}
          onValueChange={setMotivasyonBildirimi}
          trackColor={{ false: '#767577', true: '#FF5722' }}
          thumbColor={motivasyonBildirimi ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="analytics" size={24} color="#9C27B0" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Günlük Özet</Text>
            <Text style={styles.switchDesc}>Akşam saatlerinde günlük özet bildirimi</Text>
          </View>
        </View>
        <Switch
          value={gunlukOzet}
          onValueChange={setGunlukOzet}
          trackColor={{ false: '#767577', true: '#9C27B0' }}
          thumbColor={gunlukOzet ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderTercihler = () => (
    <View style={styles.sectionContent}>
      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="notifications" size={24} color="#4CAF50" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Bildirimler</Text>
            <Text style={styles.switchDesc}>Hatırlatıcı bildirimleri al</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.switch, notifikasyon && styles.switchActive]}
          onPress={() => setNotifikasyon(!notifikasyon)}
        >
          <View style={[styles.switchThumb, notifikasyon && styles.switchThumbActive]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.switchItem}>
        <View style={styles.switchInfo}>
          <Ionicons name="moon" size={24} color="#9C27B0" />
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Karanlık Tema</Text>
            <Text style={styles.switchDesc}>Koyu renk temasını kullan</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.switch, isDark && styles.switchActive]}
          onPress={toggleTheme}
        >
          <View style={[styles.switchThumb, isDark && styles.switchThumbActive]} />
        </TouchableOpacity>
      </View>

      {/* Kullanıcı Bilgileri */}
      {user && (
        <View style={styles.userInfoSection}>
          <Text style={styles.userInfoTitle}>Hesap Bilgileri</Text>
          <View style={styles.userInfoItem}>
            <Ionicons name="person" size={20} color={colors.textSecondary} />
            <Text style={styles.userInfoText}>{user.ad} {user.soyad}</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Ionicons name="mail" size={20} color={colors.textSecondary} />
            <Text style={styles.userInfoText}>{user.email}</Text>
          </View>
          {user.telefon && (
            <View style={styles.userInfoItem}>
              <Ionicons name="call" size={20} color={colors.textSecondary} />
              <Text style={styles.userInfoText}>{user.telefon}</Text>
            </View>
          )}
          <View style={styles.userInfoItem}>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={styles.userInfoText}>
              Kayıt: {new Date(user.kayitTarihi).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      )}

      {/* Çıkış Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#FF5252" />
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: 40 }]} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{ad ? ad.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{ad || 'Kullanıcı'}</Text>
            <Text style={styles.userDetails}>
              {yas && `${yas} yaş`} {cinsiyet && `• ${cinsiyet}`}
            </Text>
            {kilo && boy && (
              <Text style={styles.userStats}>{kilo} kg • {boy} cm</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => {
            setModalType('istatistik');
            setShowModal(true);
          }}
        >
          <Ionicons name="analytics" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Günlük İlerleme */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Bugünkü İlerleme</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={gunlukIlerleme.adim}
              size={60}
              strokeWidth={6}
              color="#FF9800"
              backgroundColor="#E0E0E0"
              showText={false}
            />
            <Text style={styles.progressLabel}>Adım</Text>
            <Text style={styles.progressValue}>{Math.round(gunlukIlerleme.adim)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={gunlukIlerleme.su}
              size={60}
              strokeWidth={6}
              color="#2196F3"
              backgroundColor="#E0E0E0"
              showText={false}
            />
            <Text style={styles.progressLabel}>Su</Text>
            <Text style={styles.progressValue}>{Math.round(gunlukIlerleme.su)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={gunlukIlerleme.spor}
              size={60}
              strokeWidth={6}
              color="#4CAF50"
              backgroundColor="#E0E0E0"
              showText={false}
            />
            <Text style={styles.progressLabel}>Spor</Text>
            <Text style={styles.progressValue}>{Math.round(gunlukIlerleme.spor)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <CircularProgress
              progress={gunlukIlerleme.kalori}
              size={60}
              strokeWidth={6}
              color="#FF5252"
              backgroundColor="#E0E0E0"
              showText={false}
            />
            <Text style={styles.progressLabel}>Kalori</Text>
            <Text style={styles.progressValue}>{Math.round(gunlukIlerleme.kalori)}%</Text>
          </View>
        </View>
      </View>

      {/* Hedef Durum */}
      {hedefDurum && (
        <View style={styles.hedefCard}>
          <View style={styles.hedefHeader}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.hedefTitle}>Kilo Hedefi</Text>
          </View>
          <View style={styles.hedefContent}>
            <Text style={styles.hedefText}>
              {hedefDurum.tamamlandi ? 'Hedefine ulaştın! 🎉' : 
               `${hedefDurum.fark} kg ${hedefDurum.tip === 'ver' ? 'vermeli' : 'almalı'}sin`}
            </Text>
            <View style={styles.hedefProgress}>
              <View style={styles.hedefBar}>
                <View 
                  style={[
                    styles.hedefFill, 
                    { 
                      width: `${Math.min(parseFloat(hedefDurum.yuzde), 100)}%`,
                      backgroundColor: hedefDurum.tamamlandi ? '#4CAF50' : '#FF9800'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.hedefPercent}>{hedefDurum.yuzde}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Kategori Seçimi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {profilKategorileri.map((kategori) => (
          <TouchableOpacity
            key={kategori.id}
            style={[
              styles.categoryButton,
              activeSection === kategori.id && styles.categoryButtonActive,
              { borderColor: kategori.renk }
            ]}
            onPress={() => setActiveSection(kategori.id)}
          >
            <Ionicons 
              name={kategori.icon as any} 
              size={20} 
              color={activeSection === kategori.id ? '#fff' : kategori.renk} 
            />
            <Text style={[
              styles.categoryButtonText,
              activeSection === kategori.id && styles.categoryButtonTextActive
            ]}>
              {kategori.baslik}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* İçerik */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {profilKategorileri.find(k => k.id === activeSection)?.baslik}
        </Text>
        
        {activeSection === 'kisisel' && renderKisiselBilgiler()}
        {activeSection === 'fiziksel' && renderFizikselOzellikler()}
        {activeSection === 'hedefler' && renderHedefler()}
        {activeSection === 'arkadaslar' && renderArkadaslar()}
        {activeSection === 'saglik' && renderSaglikBilgileri()}
        {activeSection === 'bildirimler' && renderBildirimAyarlari()}
        {activeSection === 'tercihler' && renderTercihler()}
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity style={styles.saveButton} onPress={kaydet}>
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>Profili Kaydet</Text>
      </TouchableOpacity>

      {kaydedildi && (
        <View style={styles.successMessage}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.successText}>Profil başarıyla kaydedildi!</Text>
        </View>
      )}

      {/* Modaller */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'aktivite' && 'Aktivite Seviyesi Seç'}
                {modalType === 'hedef' && 'Beslenme Hedefi Seç'}
                {modalType === 'istatistik' && 'Profil İstatistikleri'}
                {modalType === 'arkadas-ara' && 'Arkadaş Ara'}
                {modalType === 'arkadas-istekleri' && 'Arkadaşlık İstekleri'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {modalType === 'aktivite' && (
                <View style={{ paddingBottom: 20 }}>
                  {aktiviteSeviyesi.map((seviye) => (
                    <TouchableOpacity
                      key={seviye.id}
                      style={[
                        styles.modalOption,
                        aktiviteSeviyesiSecim === seviye.id && styles.modalOptionActive
                      ]}
                      onPress={() => {
                        setAktiviteSeviyesiSecim(seviye.id);
                        setShowModal(false);
                      }}
                    >
                      <View style={styles.modalOptionInfo}>
                        <Text style={styles.modalOptionTitle}>{seviye.isim}</Text>
                        <Text style={styles.modalOptionDesc}>{seviye.aciklama}</Text>
                      </View>
                      {aktiviteSeviyesiSecim === seviye.id && (
                        <Ionicons name="checkmark" size={24} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {modalType === 'hedef' && (
                <View style={{ paddingBottom: 20 }}>
                  {hedefTurleri.map((hedef) => (
                    <TouchableOpacity
                      key={hedef.id}
                      style={[
                        styles.modalOption,
                        beslenmeHedefi === hedef.id && styles.modalOptionActive
                      ]}
                      onPress={() => {
                        setBeslenmeHedefi(hedef.id as any);
                        setShowModal(false);
                      }}
                    >
                      <View style={styles.modalOptionInfo}>
                        <View style={styles.modalOptionHeader}>
                          <Ionicons name={hedef.icon as any} size={24} color={hedef.renk} />
                          <Text style={styles.modalOptionTitle}>{hedef.isim}</Text>
                        </View>
                      </View>
                      {beslenmeHedefi === hedef.id && (
                        <Ionicons name="checkmark" size={24} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {modalType === 'istatistik' && (
                <View style={[styles.statsContainer, { paddingBottom: 20 }]}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>BMI</Text>
                    <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
                    <Text style={[styles.statCategory, { color: bmiKategori.renk }]}>
                      {bmiKategori.kategori}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Günlük Kalori İhtiyacı</Text>
                    <Text style={styles.statValue}>{gunlukKalori}</Text>
                    <Text style={styles.statCategory}>kcal</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Aktivite Seviyesi</Text>
                    <Text style={styles.statValue}>
                      {aktiviteSeviyesi.find(a => a.id === aktiviteSeviyesiSecim)?.isim}
                    </Text>
                    <Text style={styles.statCategory}>
                      {aktiviteSeviyesi.find(a => a.id === aktiviteSeviyesiSecim)?.aciklama}
                    </Text>
                  </View>
                  {hedefDurum && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Hedef İlerleme</Text>
                      <Text style={styles.statValue}>{hedefDurum.yuzde}%</Text>
                      <Text style={styles.statCategory}>
                        {hedefDurum.fark} kg {hedefDurum.tip === 'ver' ? 'ver' : 'al'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {modalType === 'arkadas-ara' && (
                <View style={{ paddingBottom: 20 }}>
                  <View style={styles.searchContainer}>
                    <Text style={styles.searchLabel}>Public ID ile Arkadaş Ara</Text>
                    <View style={styles.searchInputContainer}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="örn: ahmetmehmet1234"
                        value={searchPublicId}
                        onChangeText={setSearchPublicId}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearchUser}
                        disabled={searchLoading}
                      >
                        {searchLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons name="search" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {searchResult && (
                    <View style={styles.searchResultContainer}>
                      <Text style={styles.searchResultTitle}>Bulunan Kullanıcı:</Text>
                      <View style={styles.searchResultCard}>
                        <View style={styles.searchResultAvatar}>
                          <Text style={styles.searchResultAvatarText}>
                            {searchResult.ad.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.searchResultInfo}>
                          <Text style={styles.searchResultName}>
                            {searchResult.ad} {searchResult.soyad}
                          </Text>
                          <Text style={styles.searchResultId}>@{searchResult.publicId}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.addFriendButton}
                          onPress={() => handleSendFriendRequest(searchResult.uid)}
                        >
                          <Ionicons name="person-add" size={20} color="#fff" />
                          <Text style={styles.addFriendButtonText}>Ekle</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {modalType === 'arkadas-istekleri' && (
                <View style={{ paddingBottom: 20 }}>
                  {friendRequests.length === 0 ? (
                    <View style={styles.emptyRequests}>
                      <Ionicons name="mail-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyRequestsText}>Arkadaşlık isteği yok</Text>
                      <Text style={styles.emptyRequestsDesc}>
                        Size gelen arkadaşlık istekleri burada görünecek
                      </Text>
                    </View>
                  ) : (
                    friendRequests.map((request) => (
                      <View key={request.uid} style={styles.requestCard}>
                        <View style={styles.requestAvatar}>
                          <Text style={styles.requestAvatarText}>
                            {request.ad.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.requestInfo}>
                          <Text style={styles.requestName}>
                            {request.ad} {request.soyad}
                          </Text>
                          <Text style={styles.requestId}>@{request.publicId}</Text>
                          <Text style={styles.requestText}>
                            Size arkadaşlık isteği gönderdi
                          </Text>
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAcceptFriendRequest(request.uid)}
                          >
                            <Ionicons name="checkmark" size={20} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleRejectFriendRequest(request.uid)}
                          >
                            <Ionicons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles are defined inline within the component for better performance and theme integration