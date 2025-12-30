import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Tarif {
  id: number;
  isim: string;
  kalori: number;
  protein: number;
  sure: string;
  malzemeler: string[];
  tarif: string;
}

export default function Beslenme() {
  const { colors } = useTheme();
  
  // Modal state'leri
  const [tarifModalVisible, setTarifModalVisible] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [raporModalVisible, setRaporModalVisible] = useState(false);
  const [yemekSecimModalVisible, setYemekSecimModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [customYemekInput, setCustomYemekInput] = useState('');
  const [customKaloriInput, setCustomKaloriInput] = useState('');
  const [menuSecimModalVisible, setMenuSecimModalVisible] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState(''); // 'zayiflama' veya 'kilo-alma'
  const [activeZayiflamaMenu, setActiveZayiflamaMenu] = useState(0); // Aktif zayıflama menüsü index
  const [activeKiloAlmaMenu, setActiveKiloAlmaMenu] = useState(0); // Aktif kilo alma menüsü index

  // Alternatif menü seçenekleri
  const menuAlternatifleri = {
    zayiflama: [
      {
        id: 1,
        isim: 'Klasik Zayıflama',
        kalori: '1200-1400 kcal',
        ogunler: {
          kahvalti: 'Yulaf + Meyve + Badem',
          ogle: 'Izgara Tavuk + Salata',
          araOgun: 'Yoğurt + Ceviz',
          aksam: 'Balık + Buharda Sebze'
        },
        makrolar: 'Protein: 95g • Karb: 120g • Yağ: 45g'
      },
      {
        id: 2,
        isim: 'Akdeniz Diyeti',
        kalori: '1300-1500 kcal',
        ogunler: {
          kahvalti: 'Zeytinyağlı Domates + Peynir',
          ogle: 'Somon + Quinoa Salata',
          araOgun: 'Badem + Kuru Üzüm',
          aksam: 'Sebze Yemeği + Bulgur'
        },
        makrolar: 'Protein: 85g • Karb: 140g • Yağ: 55g'
      },
      {
        id: 3,
        isim: 'Düşük Karbonhidrat',
        kalori: '1100-1300 kcal',
        ogunler: {
          kahvalti: 'Omlet + Avokado',
          ogle: 'Izgara Et + Yeşil Salata',
          araOgun: 'Protein Shake',
          aksam: 'Tavuk + Brokoli'
        },
        makrolar: 'Protein: 110g • Karb: 80g • Yağ: 65g'
      }
    ],
    'kilo-alma': [
      {
        id: 1,
        isim: 'Klasik Kilo Alma',
        kalori: '2500-2800 kcal',
        ogunler: {
          kahvalti: 'Omlet + Avokado + Ekmek',
          ogle: 'Et + Pilav + Salata',
          araOgun: 'Protein Shake + Muz',
          aksam: 'Somon + Quinoa + Sebze'
        },
        makrolar: 'Protein: 140g • Karb: 280g • Yağ: 95g'
      },
      {
        id: 2,
        isim: 'Yüksek Protein',
        kalori: '2600-2900 kcal',
        ogunler: {
          kahvalti: 'Protein Pancake + Fıstık Ezmesi',
          ogle: 'Tavuk + Tatlı Patates',
          araOgun: 'Çifte Protein Shake',
          aksam: 'Biftek + Makarna'
        },
        makrolar: 'Protein: 180g • Karb: 250g • Yağ: 100g'
      },
      {
        id: 3,
        isim: 'Sağlıklı Kilo Alma',
        kalori: '2400-2700 kcal',
        ogunler: {
          kahvalti: 'Müsli + Süt + Meyve',
          ogle: 'Balık + Bulgur Pilavı',
          araOgun: 'Kuruyemiş Karışımı',
          aksam: 'Tavuk + Sebzeli Makarna'
        },
        makrolar: 'Protein: 130g • Karb: 300g • Yağ: 85g'
      }
    ]
  };

  // Haftalık menü state'i
  const [weeklyMenu, setWeeklyMenu] = useState({
    Pazartesi: { kahvalti: 'Yulaf + Meyve', ogle: 'Izgara Tavuk + Salata', aksam: 'Balık + Sebze' },
    Salı: { kahvalti: 'Protein Smoothie', ogle: 'Quinoa Salatası', aksam: 'Somon + Brokoli' },
    Çarşamba: { kahvalti: 'Avokado Toast', ogle: 'Mercimek Çorbası', aksam: 'Tavuk + Bulgur' },
    Perşembe: { kahvalti: 'Yoğurt + Granola', ogle: 'Ton Balığı Salata', aksam: 'Köfte + Sebze' },
    Cuma: { kahvalti: 'Omlet + Sebze', ogle: 'Pilav + Et', aksam: 'Pizza (Cheat Day)' }
  });

  // Yemek seçenekleri
  const yemekSecenekleri = {
    kahvalti: [
      { isim: 'Yulaf + Meyve', kalori: 280 },
      { isim: 'Protein Smoothie', kalori: 250 },
      { isim: 'Avokado Toast', kalori: 320 },
      { isim: 'Yoğurt + Granola', kalori: 290 },
      { isim: 'Omlet + Sebze', kalori: 310 },
      { isim: 'Peynirli Börek', kalori: 380 },
      { isim: 'Müsli + Süt', kalori: 260 },
      { isim: 'Pancake + Bal', kalori: 350 }
    ],
    ogle: [
      { isim: 'Izgara Tavuk + Salata', kalori: 450 },
      { isim: 'Quinoa Salatası', kalori: 380 },
      { isim: 'Mercimek Çorbası', kalori: 320 },
      { isim: 'Ton Balığı Salata', kalori: 350 },
      { isim: 'Pilav + Et', kalori: 520 },
      { isim: 'Makarna + Sebze', kalori: 480 },
      { isim: 'Balık + Pilav', kalori: 490 },
      { isim: 'Tavuk Döner', kalori: 420 }
    ],
    aksam: [
      { isim: 'Balık + Sebze', kalori: 380 },
      { isim: 'Somon + Brokoli', kalori: 420 },
      { isim: 'Tavuk + Bulgur', kalori: 450 },
      { isim: 'Köfte + Sebze', kalori: 480 },
      { isim: 'Pizza (Cheat Day)', kalori: 650 },
      { isim: 'Izgara Et + Salata', kalori: 520 },
      { isim: 'Sebze Yemeği', kalori: 280 },
      { isim: 'Balık Çorbası', kalori: 320 }
    ]
  };

  // Tarif veritabanı
  const tarifler = [
    {
      id: 1,
      isim: 'Avokadolu Salata',
      kalori: 250,
      protein: 12,
      sure: '15 dk',
      malzemeler: ['1 adet avokado', '2 adet domates', '1 adet salatalık', '1 yemek kaşığı zeytinyağı', '1/2 limon suyu', 'Tuz, karabiber'],
      tarif: '1. Avokadoyu küp şeklinde kesin\n2. Domates ve salatalığı küçük parçalara kesin\n3. Tüm sebzeleri karıştırın\n4. Zeytinyağı ve limon suyu ile sosunu hazırlayın\n5. Tuz ve karabiber ekleyip servis edin'
    },
    {
      id: 2,
      isim: 'Protein Smoothie',
      kalori: 180,
      protein: 25,
      sure: '5 dk',
      malzemeler: ['1 adet muz', '1 ölçek protein tozu', '200ml süt', '1 tatlı kaşığı bal', '2 yemek kaşığı yulaf'],
      tarif: '1. Tüm malzemeleri blender\'a atın\n2. 1-2 dakika yüksek hızda karıştırın\n3. Kıvam kontrolü yapın\n4. Soğuk servis yapın'
    },
    {
      id: 3,
      isim: 'Izgara Tavuk',
      kalori: 320,
      protein: 35,
      sure: '25 dk',
      malzemeler: ['200g tavuk göğsü', '1 tatlı kaşığı zeytinyağı', '1 diş sarımsak', 'Kekik, tuz, karabiber', '1/2 limon suyu'],
      tarif: '1. Tavuğu marine edin (30 dk)\n2. Izgarayı ısıtın\n3. Tavuğu her iki tarafını 8-10 dk pişirin\n4. İç sıcaklığı 75°C olana kadar bekleyin\n5. Limon ile servis edin'
    },
    {
      id: 4,
      isim: 'Quinoa Salatası',
      kalori: 280,
      protein: 14,
      sure: '20 dk',
      malzemeler: ['1 su bardağı quinoa', '1 kutu nohut', '1 adet kırmızı biber', '1 demet maydanoz', '2 yemek kaşığı zeytinyağı'],
      tarif: '1. Quinoa\'yı 15 dakika haşlayın\n2. Nohutları süzün ve yıkayın\n3. Sebzeleri küçük parçalara kesin\n4. Tüm malzemeleri karıştırın\n5. Sos ile harmanlayıp servis edin'
    }
  ];

  const tarifDetayGoster = (tarif: Tarif) => {
    setSelectedTarif(tarif);
    setTarifModalVisible(true);
  };

  const yemekSec = (gun: string, ogun: string) => {
    setSelectedDay(gun);
    setSelectedMeal(ogun);
    setCustomYemekInput('');
    setCustomKaloriInput('');
    setYemekSecimModalVisible(true);
  };

  const yemekDegistir = (yeniYemek: string) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedMeal]: yeniYemek
      }
    }));
    setYemekSecimModalVisible(false);
  };

  const yemekSil = (gun: string, ogun: string) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [gun]: {
        ...prev[gun],
        [ogun]: ''
      }
    }));
  };

  const customYemekEkle = () => {
    if (customYemekInput.trim()) {
      const yemekIsmi = customKaloriInput ? 
        `${customYemekInput.trim()} (${customKaloriInput} kcal)` : 
        customYemekInput.trim();
      
      yemekDegistir(yemekIsmi);
      setCustomYemekInput('');
      setCustomKaloriInput('');
    }
  };

  const menuSecimAc = (menuType: string) => {
    setSelectedMenuType(menuType);
    setMenuSecimModalVisible(true);
  };

  const menuUygula = (menu: any) => {
    // Seçilen menüyü haftalık menüye uygula
    const yeniMenu = {
      Pazartesi: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Salı: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Çarşamba: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Perşembe: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Cuma: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Cumartesi: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      },
      Pazar: { 
        kahvalti: menu.ogunler.kahvalti, 
        ogle: menu.ogunler.ogle, 
        aksam: menu.ogunler.aksam 
      }
    };
    
    // Seçili menü index'ini kaydet
    if (selectedMenuType === 'zayiflama') {
      setActiveZayiflamaMenu(menu.id - 1);
    } else if (selectedMenuType === 'kilo-alma') {
      setActiveKiloAlmaMenu(menu.id - 1);
    }
    
    setWeeklyMenu(yeniMenu);
    setMenuSecimModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 40 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Günlük Beslenme</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sağlıklı beslenme alışkanlıkları</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: colors.text }]}>85</Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Skor</Text>
          </View>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="restaurant" size={24} color="#4CAF50" />
            <Text style={[styles.statValue, { color: colors.text }]}>2/4</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Öğün</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="flame" size={24} color="#FF5252" />
            <Text style={[styles.statValue, { color: colors.text }]}>1250</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kalori</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="fitness" size={24} color="#2196F3" />
            <Text style={[styles.statValue, { color: colors.text }]}>62%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hedef</Text>
          </View>
        </View>

        {/* Kalori İlerleme */}
        <View style={[styles.kaloriCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.kaloriTitle, { color: colors.text }]}>Günlük Kalori Takibi</Text>
          <View style={styles.kaloriProgress}>
            <View style={[styles.kaloriBar, { backgroundColor: colors.border }]}>
              <View style={[styles.kaloriFill, { width: '62%', backgroundColor: colors.success }]} />
            </View>
            <Text style={[styles.kaloriText, { color: colors.textSecondary }]}>1250 / 2000 kcal</Text>
          </View>
        </View>

        {/* Besin Değerleri */}
        <View style={[styles.besinCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.besinTitle, { color: colors.text }]}>Besin Değerleri</Text>
          <View style={styles.besinRow}>
            <View style={styles.besinItem}>
              <View style={[styles.besinIcon, { backgroundColor: '#FF525220' }]}>
                <Ionicons name="fitness" size={20} color="#FF5252" />
              </View>
              <Text style={[styles.besinLabel, { color: colors.textSecondary }]}>Protein</Text>
              <Text style={[styles.besinValue, { color: colors.text }]}>45g</Text>
            </View>
            <View style={styles.besinItem}>
              <View style={[styles.besinIcon, { backgroundColor: '#FF980020' }]}>
                <Ionicons name="leaf" size={20} color="#FF9800" />
              </View>
              <Text style={[styles.besinLabel, { color: colors.textSecondary }]}>Karbonhidrat</Text>
              <Text style={[styles.besinValue, { color: colors.text }]}>120g</Text>
            </View>
            <View style={styles.besinItem}>
              <View style={[styles.besinIcon, { backgroundColor: '#4CAF5020' }]}>
                <Ionicons name="water" size={20} color="#4CAF50" />
              </View>
              <Text style={[styles.besinLabel, { color: colors.textSecondary }]}>Yağ</Text>
              <Text style={[styles.besinValue, { color: colors.text }]}>35g</Text>
            </View>
          </View>
        </View>

        {/* Hedef Odaklı Menüler */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hedef Odaklı Günlük Menüler</Text>
        <View style={styles.hedefMenuContainer}>
          {/* Zayıflama Menüsü */}
          <TouchableOpacity style={[styles.hedefMenuCard, { backgroundColor: colors.surface, borderLeftColor: '#FF5722' }]}>
            <View style={styles.hedefMenuHeader}>
              <View style={[styles.hedefMenuIcon, { backgroundColor: '#FF572220' }]}>
                <Ionicons name="trending-down" size={24} color="#FF5722" />
              </View>
              <View style={styles.hedefMenuInfo}>
                <Text style={[styles.hedefMenuTitle, { color: colors.text }]}>Zayıflama Menüsü</Text>
                <Text style={[styles.hedefMenuSubtitle, { color: colors.textSecondary }]}>Kalori açığı odaklı</Text>
              </View>
              <View style={styles.hedefMenuStats}>
                <Text style={[styles.hedefMenuCalorie, { color: '#FF5722' }]}>
                  {menuAlternatifleri.zayiflama[activeZayiflamaMenu]?.kalori || '1200-1400'}
                </Text>
                <Text style={[styles.hedefMenuCalorieLabel, { color: colors.textSecondary }]}>kcal</Text>
              </View>
            </View>
            
            <View style={styles.hedefMenuMeals}>
              <View style={styles.hedefMealItem}>
                <Ionicons name="sunny" size={16} color="#FF9800" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri.zayiflama[activeZayiflamaMenu]?.ogunler.kahvalti || 'Yulaf + Meyve + Badem'} (280 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="restaurant" size={16} color="#4CAF50" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri.zayiflama[activeZayiflamaMenu]?.ogunler.ogle || 'Izgara Tavuk + Salata'} (350 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="nutrition" size={16} color="#2196F3" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  Ara Öğün: {menuAlternatifleri.zayiflama[activeZayiflamaMenu]?.ogunler.araOgun || 'Yoğurt + Ceviz'} (150 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="moon" size={16} color="#9C27B0" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri.zayiflama[activeZayiflamaMenu]?.ogunler.aksam || 'Balık + Buharda Sebze'} (420 kcal)
                </Text>
              </View>
            </View>
            
            <View style={styles.hedefMenuFooter}>
              <View style={styles.hedefMenuMacros}>
                <Text style={[styles.hedefMacroText, { color: colors.textSecondary }]}>Protein: 95g • Karb: 120g • Yağ: 45g</Text>
              </View>
              <TouchableOpacity 
                style={[styles.hedefMenuButton, { backgroundColor: '#FF5722' }]}
                onPress={() => menuSecimAc('zayiflama')}
              >
                <Text style={styles.hedefMenuButtonText}>Menüyü Değiştir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Kilo Alma Menüsü */}
          <TouchableOpacity style={[styles.hedefMenuCard, { backgroundColor: colors.surface, borderLeftColor: '#4CAF50' }]}>
            <View style={styles.hedefMenuHeader}>
              <View style={[styles.hedefMenuIcon, { backgroundColor: '#4CAF5020' }]}>
                <Ionicons name="trending-up" size={24} color="#4CAF50" />
              </View>
              <View style={styles.hedefMenuInfo}>
                <Text style={[styles.hedefMenuTitle, { color: colors.text }]}>Kilo Alma Menüsü</Text>
                <Text style={[styles.hedefMenuSubtitle, { color: colors.textSecondary }]}>Kalori fazlası odaklı</Text>
              </View>
              <View style={styles.hedefMenuStats}>
                <Text style={[styles.hedefMenuCalorie, { color: '#4CAF50' }]}>
                  {menuAlternatifleri['kilo-alma'][activeKiloAlmaMenu]?.kalori || '2500-2800'}
                </Text>
                <Text style={[styles.hedefMenuCalorieLabel, { color: colors.textSecondary }]}>kcal</Text>
              </View>
            </View>
            
            <View style={styles.hedefMenuMeals}>
              <View style={styles.hedefMealItem}>
                <Ionicons name="sunny" size={16} color="#FF9800" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri['kilo-alma'][activeKiloAlmaMenu]?.ogunler.kahvalti || 'Omlet + Avokado + Ekmek'} (520 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="restaurant" size={16} color="#4CAF50" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri['kilo-alma'][activeKiloAlmaMenu]?.ogunler.ogle || 'Et + Pilav + Salata'} (680 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="nutrition" size={16} color="#2196F3" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  Ara Öğün: {menuAlternatifleri['kilo-alma'][activeKiloAlmaMenu]?.ogunler.araOgun || 'Protein Shake + Muz'} (350 kcal)
                </Text>
              </View>
              <View style={styles.hedefMealItem}>
                <Ionicons name="moon" size={16} color="#9C27B0" />
                <Text style={[styles.hedefMealText, { color: colors.textSecondary }]}>
                  {menuAlternatifleri['kilo-alma'][activeKiloAlmaMenu]?.ogunler.aksam || 'Somon + Quinoa + Sebze'} (750 kcal)
                </Text>
              </View>
            </View>
            
            <View style={styles.hedefMenuFooter}>
              <View style={styles.hedefMenuMacros}>
                <Text style={[styles.hedefMacroText, { color: colors.textSecondary }]}>Protein: 140g • Karb: 280g • Yağ: 95g</Text>
              </View>
              <TouchableOpacity 
                style={[styles.hedefMenuButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => menuSecimAc('kilo-alma')}
              >
                <Text style={styles.hedefMenuButtonText}>Menüyü Değiştir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hızlı Aksiyonlar */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı Aksiyonlar</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionCardLarge, { backgroundColor: colors.surface }]}
            onPress={() => setMenuModalVisible(true)}
          >
            <Ionicons name="calendar" size={40} color="#4CAF50" />
            <Text style={[styles.quickActionTextLarge, { color: colors.text }]}>Menü Planlayıcı</Text>
            <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]}>Haftalık menünüzü planlayın</Text>
            <View style={styles.planButton}>
              <Text style={styles.planButtonText}>Plan Oluştur</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
            onPress={() => setMarketModalVisible(true)}
          >
            <Ionicons name="basket" size={32} color="#FF9800" />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Market Listesi</Text>
            <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]}>Alışveriş listesi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
            onPress={() => setRaporModalVisible(true)}
          >
            <Ionicons name="analytics" size={32} color="#2196F3" />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Haftalık Rapor</Text>
            <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]}>Beslenme analizi</Text>
          </TouchableOpacity>
        </View>

        {/* Günlük Öğünler */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Öğünler</Text>
        <View style={styles.ogunlerContainer}>
          {/* Kahvaltı */}
          <View style={[styles.ogunCard, { backgroundColor: colors.surface }]}>
            <View style={styles.ogunHeader}>
              <View style={styles.ogunInfo}>
                <Text style={[styles.ogunIsim, { color: colors.text }]}>Kahvaltı</Text>
                <Text style={[styles.ogunKalori, { color: colors.textSecondary }]}>350/400 kcal</Text>
              </View>
              <View style={[styles.durumBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.durumText}>Tamamlandı</Text>
              </View>
            </View>
            <Text style={[styles.ogunDetay, { color: colors.textSecondary }]}>
              {weeklyMenu.Pazartesi?.kahvalti || 'Yulaf + Meyve'}
            </Text>
            <View style={styles.ogunProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: '87%', backgroundColor: '#4CAF50' }]} />
              </View>
            </View>
          </View>

          {/* Öğle Yemeği */}
          <View style={[styles.ogunCard, { backgroundColor: colors.surface }]}>
            <View style={styles.ogunHeader}>
              <View style={styles.ogunInfo}>
                <Text style={[styles.ogunIsim, { color: colors.text }]}>Öğle Yemeği</Text>
                <Text style={[styles.ogunKalori, { color: colors.textSecondary }]}>450/600 kcal</Text>
              </View>
              <View style={[styles.durumBadge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.durumText}>Devam Ediyor</Text>
              </View>
            </View>
            <Text style={[styles.ogunDetay, { color: colors.textSecondary }]}>
              {weeklyMenu.Pazartesi?.ogle || 'Izgara Tavuk + Salata'}
            </Text>
            <View style={styles.ogunProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: '75%', backgroundColor: '#FF9800' }]} />
              </View>
            </View>
          </View>

          {/* Akşam Yemeği */}
          <View style={[styles.ogunCard, { backgroundColor: colors.surface }]}>
            <View style={styles.ogunHeader}>
              <View style={styles.ogunInfo}>
                <Text style={[styles.ogunIsim, { color: colors.text }]}>Akşam Yemeği</Text>
                <Text style={[styles.ogunKalori, { color: colors.textSecondary }]}>0/500 kcal</Text>
              </View>
              <View style={[styles.durumBadge, { backgroundColor: '#9E9E9E' }]}>
                <Text style={styles.durumText}>Bekliyor</Text>
              </View>
            </View>
            <Text style={[styles.ogunDetay, { color: colors.textSecondary }]}>
              {weeklyMenu.Pazartesi?.aksam || 'Balık + Sebze'}
            </Text>
            <View style={styles.ogunProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: '0%', backgroundColor: '#9E9E9E' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Popüler Tarifler */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popüler Tarifler</Text>
        <View style={styles.tariflerGrid}>
          {tarifler.map((tarif) => (
            <TouchableOpacity 
              key={tarif.id}
              style={[styles.tarifCard, { backgroundColor: colors.surface }]}
              onPress={() => tarifDetayGoster(tarif)}
            >
              <View style={styles.tarifHeader}>
                <Ionicons name="restaurant" size={24} color="#9C27B0" />
                <View style={styles.tarifBadge}>
                  <Text style={styles.tarifBadgeText}>{tarif.sure}</Text>
                </View>
              </View>
              <Text style={[styles.tarifIsim, { color: colors.text }]}>{tarif.isim}</Text>
              <Text style={[styles.tarifKalori, { color: colors.textSecondary }]}>{tarif.kalori} kcal • {tarif.protein}g protein</Text>
              <View style={styles.tarifButton}>
                <Text style={styles.tarifButtonText}>Tarifi Gör</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Haftalık Menü Planlayıcısı */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bu Haftanın Menüsü</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          <View style={styles.menuHeader}>
            <Ionicons name="calendar" size={24} color="#4CAF50" />
            <Text style={[styles.menuTitle, { color: colors.text }]}>Haftalık Plan</Text>
          </View>
          
          <View style={styles.menuItems}>
            {Object.entries(weeklyMenu).map(([gun, ogunler]) => (
              <View key={gun} style={styles.menuDay}>
                <Text style={[styles.dayName, { color: colors.text }]}>{gun}</Text>
                <View style={styles.dayMealsContainer}>
                  <Text style={[styles.dayMeal, { color: colors.textSecondary }]}>
                    {ogunler.kahvalti || 'Kahvaltı seçilmedi'} • {ogunler.ogle || 'Öğle seçilmedi'} • {ogunler.aksam || 'Akşam seçilmedi'}
                  </Text>
                </View>
                <Text style={[styles.dayCalories, { color: colors.primary }]}>~1250 kcal</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Beslenme Önerileri */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Beslenme Önerileri</Text>
        <View style={styles.onerilerContainer}>
          <View style={[styles.oneriCard, { backgroundColor: '#4CAF5010', borderLeftColor: '#4CAF50' }]}>
            <Ionicons name="water" size={20} color="#4CAF50" />
            <View style={styles.oneriContent}>
              <Text style={[styles.oneriTitle, { color: colors.text }]}>Su Tüketimi</Text>
              <Text style={[styles.oneriText, { color: colors.textSecondary }]}>Günde en az 2.5 litre su için</Text>
            </View>
          </View>
          
          <View style={[styles.oneriCard, { backgroundColor: '#FF980010', borderLeftColor: '#FF9800' }]}>
            <Ionicons name="leaf" size={20} color="#FF9800" />
            <View style={styles.oneriContent}>
              <Text style={[styles.oneriTitle, { color: colors.text }]}>Sebze Tüketimi</Text>
              <Text style={[styles.oneriText, { color: colors.textSecondary }]}>5 porsiyon meyve ve sebze tüketin</Text>
            </View>
          </View>
          
          <View style={[styles.oneriCard, { backgroundColor: '#FF525210', borderLeftColor: '#FF5252' }]}>
            <Ionicons name="fitness" size={20} color="#FF5252" />
            <View style={styles.oneriContent}>
              <Text style={[styles.oneriTitle, { color: colors.text }]}>Protein Alımı</Text>
              <Text style={[styles.oneriText, { color: colors.textSecondary }]}>Vücut ağırlığınızın kg başına 1.2g protein</Text>
            </View>
          </View>
        </View>

        {/* Test Mesajı */}
        <View style={[styles.testCard, { backgroundColor: colors.surface, borderColor: colors.success }]}>
          <Text style={[styles.testText, { color: colors.success }]}>Alternatif menü seçenekleri eklendi!</Text>
          <Text style={[styles.testSubtext, { color: colors.textSecondary }]}>Zayıflama ve kilo alma için 3'er farklı menü seçeneği mevcut.</Text>
        </View>
      </View>

      {/* Tarif Detay Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tarifModalVisible}
        onRequestClose={() => setTarifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedTarif?.isim}
              </Text>
              <TouchableOpacity onPress={() => setTarifModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedTarif && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.tarifInfo}>
                  <View style={styles.tarifInfoRow}>
                    <View style={styles.tarifInfoItem}>
                      <Ionicons name="flame" size={20} color="#FF5252" />
                      <Text style={[styles.tarifInfoText, { color: colors.text }]}>{selectedTarif.kalori} kcal</Text>
                    </View>
                    <View style={styles.tarifInfoItem}>
                      <Ionicons name="fitness" size={20} color="#4CAF50" />
                      <Text style={[styles.tarifInfoText, { color: colors.text }]}>{selectedTarif.protein}g protein</Text>
                    </View>
                    <View style={styles.tarifInfoItem}>
                      <Ionicons name="time" size={20} color="#2196F3" />
                      <Text style={[styles.tarifInfoText, { color: colors.text }]}>{selectedTarif.sure}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.malzemelerSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Malzemeler</Text>
                  {selectedTarif.malzemeler.map((malzeme: string, index: number) => (
                    <View key={index} style={styles.malzemeItem}>
                      <Text style={[styles.malzemeText, { color: colors.textSecondary }]}>• {malzeme}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.tarifSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Hazırlanışı</Text>
                  <Text style={[styles.tarifText, { color: colors.textSecondary }]}>{selectedTarif.tarif}</Text>
                </View>
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => setTarifModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menü Planlayıcı Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentLarge, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Haftalık Menü Planlayıcı</Text>
              <TouchableOpacity onPress={() => setMenuModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Menünüzü özelleştirin. Öğünlere tıklayarak değiştirebilir veya silebilirsiniz.
              </Text>
              
              <View style={styles.menuPlanContainer}>
                {Object.entries(weeklyMenu).map(([gun, ogunler]) => (
                  <View key={gun} style={styles.menuPlanDay}>
                    <Text style={[styles.menuPlanDayTitle, { color: colors.text }]}>📅 {gun}</Text>
                    
                    <View style={styles.mealPlanRow}>
                      <View style={[styles.mealPlanButton, { backgroundColor: '#4CAF50' }]}>
                        <Ionicons name="sunny" size={16} color="white" />
                        <Text style={styles.mealPlanButtonText}>Kahvaltı</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.mealPlanContent}
                        onPress={() => yemekSec(gun, 'kahvalti')}
                      >
                        <Text style={[styles.mealPlanText, { color: colors.text }]}>
                          {ogunler.kahvalti || 'Öğün seçin'}
                        </Text>
                        <Ionicons name="create" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      {ogunler.kahvalti && (
                        <TouchableOpacity onPress={() => yemekSil(gun, 'kahvalti')}>
                          <Ionicons name="trash" size={16} color="#FF5252" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.mealPlanRow}>
                      <View style={[styles.mealPlanButton, { backgroundColor: '#FF9800' }]}>
                        <Ionicons name="restaurant" size={16} color="white" />
                        <Text style={styles.mealPlanButtonText}>Öğle</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.mealPlanContent}
                        onPress={() => yemekSec(gun, 'ogle')}
                      >
                        <Text style={[styles.mealPlanText, { color: colors.text }]}>
                          {ogunler.ogle || 'Öğün seçin'}
                        </Text>
                        <Ionicons name="create" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      {ogunler.ogle && (
                        <TouchableOpacity onPress={() => yemekSil(gun, 'ogle')}>
                          <Ionicons name="trash" size={16} color="#FF5252" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.mealPlanRow}>
                      <View style={[styles.mealPlanButton, { backgroundColor: '#9C27B0' }]}>
                        <Ionicons name="moon" size={16} color="white" />
                        <Text style={styles.mealPlanButtonText}>Akşam</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.mealPlanContent}
                        onPress={() => yemekSec(gun, 'aksam')}
                      >
                        <Text style={[styles.mealPlanText, { color: colors.text }]}>
                          {ogunler.aksam || 'Öğün seçin'}
                        </Text>
                        <Ionicons name="create" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      {ogunler.aksam && (
                        <TouchableOpacity onPress={() => yemekSil(gun, 'aksam')}>
                          <Ionicons name="trash" size={16} color="#FF5252" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                <View style={styles.weeklyStats}>
                  <Text style={[styles.weeklyStatsTitle, { color: colors.text }]}>📊 Haftalık Özet</Text>
                  <View style={styles.weeklyStatsRow}>
                    <View style={styles.weeklyStatItem}>
                      <Text style={[styles.weeklyStatValue, { color: '#4CAF50' }]}>8,750</Text>
                      <Text style={[styles.weeklyStatLabel, { color: colors.textSecondary }]}>Toplam Kalori</Text>
                    </View>
                    <View style={styles.weeklyStatItem}>
                      <Text style={[styles.weeklyStatValue, { color: '#FF5252' }]}>315g</Text>
                      <Text style={[styles.weeklyStatLabel, { color: colors.textSecondary }]}>Protein</Text>
                    </View>
                    <View style={styles.weeklyStatItem}>
                      <Text style={[styles.weeklyStatValue, { color: '#2196F3' }]}>21</Text>
                      <Text style={[styles.weeklyStatLabel, { color: colors.textSecondary }]}>Öğün</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButtonSecondary, { backgroundColor: colors.border }]}
                onPress={() => setMenuModalVisible(false)}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => setMenuModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Planı Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Yemek Seçim Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={yemekSecimModalVisible}
        onRequestClose={() => setYemekSecimModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedDay} - {selectedMeal === 'kahvalti' ? 'Kahvaltı' : selectedMeal === 'ogle' ? 'Öğle' : 'Akşam'} Seçin
              </Text>
              <TouchableOpacity onPress={() => setYemekSecimModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {/* Manuel Yemek Ekleme */}
              <View style={styles.customYemekContainer}>
                <Text style={[styles.customYemekTitle, { color: colors.text }]}>Kendi Yemeğinizi Ekleyin</Text>
                
                <View style={styles.customYemekInputContainer}>
                  <TextInput
                    style={[styles.customYemekInput, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="Yemek adını yazın (örn: Tavuklu Salata)"
                    placeholderTextColor={colors.textSecondary}
                    value={customYemekInput}
                    onChangeText={setCustomYemekInput}
                  />
                  
                  <TextInput
                    style={[styles.customKaloriInput, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="Kalori (isteğe bağlı)"
                    placeholderTextColor={colors.textSecondary}
                    value={customKaloriInput}
                    onChangeText={setCustomKaloriInput}
                    keyboardType="numeric"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.customYemekButton, { backgroundColor: colors.primary }]}
                  onPress={customYemekEkle}
                  disabled={!customYemekInput.trim()}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.customYemekButtonText}>Yemek Ekle</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Veya hazır seçeneklerden birini seçin:
              </Text>
              
              <View style={styles.yemekSecenekleriContainer}>
                {yemekSecenekleri[selectedMeal]?.map((yemek, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.yemekSecenekCard, { backgroundColor: colors.background }]}
                    onPress={() => yemekDegistir(yemek.isim)}
                  >
                    <View style={styles.yemekSecenekInfo}>
                      <Text style={[styles.yemekSecenekIsim, { color: colors.text }]}>{yemek.isim}</Text>
                      <Text style={[styles.yemekSecenekKalori, { color: colors.textSecondary }]}>{yemek.kalori} kcal</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setYemekSecimModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menü Seçim Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuSecimModalVisible}
        onRequestClose={() => setMenuSecimModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedMenuType === 'zayiflama' ? 'Zayıflama Menüleri' : 'Kilo Alma Menüleri'}
              </Text>
              <TouchableOpacity onPress={() => setMenuSecimModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Size uygun menü seçeneğini seçin:
              </Text>
              
              <View style={styles.menuAlternatifleriContainer}>
                {menuAlternatifleri[selectedMenuType]?.map((menu) => (
                  <TouchableOpacity
                    key={menu.id}
                    style={[styles.menuAlternatifCard, { backgroundColor: colors.background }]}
                    onPress={() => menuUygula(menu)}
                  >
                    <View style={styles.menuAlternatifHeader}>
                      <Text style={[styles.menuAlternatifIsim, { color: colors.text }]}>{menu.isim}</Text>
                      <Text style={[styles.menuAlternatifKalori, { color: selectedMenuType === 'zayiflama' ? '#FF5722' : '#4CAF50' }]}>
                        {menu.kalori}
                      </Text>
                    </View>
                    
                    <View style={styles.menuAlternatifOgunler}>
                      <View style={styles.menuAlternatifOgun}>
                        <Ionicons name="sunny" size={16} color="#FF9800" />
                        <Text style={[styles.menuAlternatifOgunText, { color: colors.textSecondary }]}>
                          {menu.ogunler.kahvalti}
                        </Text>
                      </View>
                      <View style={styles.menuAlternatifOgun}>
                        <Ionicons name="restaurant" size={16} color="#4CAF50" />
                        <Text style={[styles.menuAlternatifOgunText, { color: colors.textSecondary }]}>
                          {menu.ogunler.ogle}
                        </Text>
                      </View>
                      <View style={styles.menuAlternatifOgun}>
                        <Ionicons name="nutrition" size={16} color="#2196F3" />
                        <Text style={[styles.menuAlternatifOgunText, { color: colors.textSecondary }]}>
                          {menu.ogunler.araOgun}
                        </Text>
                      </View>
                      <View style={styles.menuAlternatifOgun}>
                        <Ionicons name="moon" size={16} color="#9C27B0" />
                        <Text style={[styles.menuAlternatifOgunText, { color: colors.textSecondary }]}>
                          {menu.ogunler.aksam}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.menuAlternatifMakrolar}>
                      <Text style={[styles.menuAlternatifMakroText, { color: colors.textSecondary }]}>
                        {menu.makrolar}
                      </Text>
                    </View>
                    
                    <View style={styles.menuAlternatifButton}>
                      <Ionicons name="checkmark-circle" size={20} color={selectedMenuType === 'zayiflama' ? '#FF5722' : '#4CAF50'} />
                      <Text style={[styles.menuAlternatifButtonText, { color: selectedMenuType === 'zayiflama' ? '#FF5722' : '#4CAF50' }]}>
                        Bu Menüyü Seç
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setMenuSecimModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Market Listesi Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={marketModalVisible}
        onRequestClose={() => setMarketModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Market Listesi</Text>
              <TouchableOpacity onPress={() => setMarketModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Haftalık menünüze göre hazırlanmış alışveriş listesi.
              </Text>
              
              <View style={styles.marketListContainer}>
                <View style={styles.marketCategory}>
                  <Text style={[styles.marketCategoryTitle, { color: colors.text }]}>Sebze & Meyve</Text>
                  <View style={styles.marketItems}>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>2 adet avokado</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>1 kg domates</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>500g salatalık</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>3 adet muz</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.marketCategory}>
                  <Text style={[styles.marketCategoryTitle, { color: colors.text }]}>Protein</Text>
                  <View style={styles.marketItems}>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>500g tavuk göğsü</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>300g somon balığı</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>1 paket protein tozu</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.marketCategory}>
                  <Text style={[styles.marketCategoryTitle, { color: colors.text }]}>Tahıllar</Text>
                  <View style={styles.marketItems}>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>500g quinoa</Text>
                    </View>
                    <View style={styles.marketItem}>
                      <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
                      <Text style={[styles.marketItemText, { color: colors.text }]}>1 paket yulaf</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#FF9800' }]}
              onPress={() => setMarketModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Listeyi Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Haftalık Rapor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={raporModalVisible}
        onRequestClose={() => setRaporModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Haftalık Rapor</Text>
              <TouchableOpacity onPress={() => setRaporModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Bu haftaki beslenme performansınızın detaylı analizi.
              </Text>
              
              <View style={styles.raporContainer}>
                <View style={styles.raporCard}>
                  <View style={styles.raporHeader}>
                    <Ionicons name="trending-up" size={24} color="#4CAF50" />
                    <Text style={[styles.raporTitle, { color: colors.text }]}>Genel Performans</Text>
                  </View>
                  <Text style={[styles.raporValue, { color: '#4CAF50' }]}>%87</Text>
                  <Text style={[styles.raporDescription, { color: colors.textSecondary }]}>
                    Bu hafta hedeflerinizin %87'sini başarıyla tamamladınız.
                  </Text>
                </View>
                
                <View style={styles.raporCard}>
                  <View style={styles.raporHeader}>
                    <Ionicons name="flame" size={24} color="#FF5252" />
                    <Text style={[styles.raporTitle, { color: colors.text }]}>Kalori Takibi</Text>
                  </View>
                  <Text style={[styles.raporValue, { color: colors.text }]}>8,750 kcal</Text>
                  <Text style={[styles.raporDescription, { color: colors.textSecondary }]}>
                    Haftalık ortalama: 1,250 kcal/gün
                  </Text>
                </View>
                
                <View style={styles.raporCard}>
                  <View style={styles.raporHeader}>
                    <Ionicons name="fitness" size={24} color="#2196F3" />
                    <Text style={[styles.raporTitle, { color: colors.text }]}>Protein Alımı</Text>
                  </View>
                  <Text style={[styles.raporValue, { color: colors.text }]}>315g</Text>
                  <Text style={[styles.raporDescription, { color: colors.textSecondary }]}>
                    Haftalık ortalama: 45g/gün
                  </Text>
                </View>
                
                <View style={styles.raporCard}>
                  <View style={styles.raporHeader}>
                    <Ionicons name="water" size={24} color="#00BCD4" />
                    <Text style={[styles.raporTitle, { color: colors.text }]}>Su Tüketimi</Text>
                  </View>
                  <Text style={[styles.raporValue, { color: colors.text }]}>17.5L</Text>
                  <Text style={[styles.raporDescription, { color: colors.textSecondary }]}>
                    Haftalık ortalama: 2.5L/gün
                  </Text>
                </View>
              </View>
              
              <View style={styles.raporSuggestions}>
                <Text style={[styles.raporSuggestionsTitle, { color: colors.text }]}>Öneriler</Text>
                <Text style={[styles.raporSuggestionText, { color: colors.textSecondary }]}>
                  • Akşam öğünlerinde porsiyon kontrolüne dikkat edin
                </Text>
                <Text style={[styles.raporSuggestionText, { color: colors.textSecondary }]}>
                  • Sebze tüketiminizi artırmaya odaklanın
                </Text>
                <Text style={[styles.raporSuggestionText, { color: colors.textSecondary }]}>
                  • Su tüketiminiz hedeflere uygun, devam edin
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
              onPress={() => setRaporModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Raporu Kaydet</Text>
            </TouchableOpacity>
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
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
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
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  kaloriCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  kaloriTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  kaloriProgress: {
    gap: 8,
  },
  kaloriBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  kaloriFill: {
    height: '100%',
    borderRadius: 4,
  },
  kaloriText: {
    fontSize: 14,
    textAlign: 'center',
  },
  besinCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  besinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  besinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  besinItem: {
    alignItems: 'center',
    flex: 1,
  },
  besinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  besinLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  besinValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Hedef Odaklı Menüler stilleri
  hedefMenuContainer: {
    gap: 16,
    marginBottom: 20,
  },
  hedefMenuCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hedefMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hedefMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hedefMenuInfo: {
    flex: 1,
  },
  hedefMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  hedefMenuSubtitle: {
    fontSize: 14,
  },
  hedefMenuStats: {
    alignItems: 'flex-end',
  },
  hedefMenuCalorie: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hedefMenuCalorieLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  hedefMenuMeals: {
    gap: 12,
    marginBottom: 16,
  },
  hedefMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  hedefMealText: {
    fontSize: 14,
    flex: 1,
  },
  hedefMenuFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  hedefMenuMacros: {
    marginBottom: 12,
  },
  hedefMacroText: {
    fontSize: 12,
    textAlign: 'center',
  },
  hedefMenuButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  hedefMenuButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionCardLarge: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionTextLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  planButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  planButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ogunlerContainer: {
    gap: 12,
    marginBottom: 20,
  },
  ogunCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ogunHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ogunInfo: {
    flex: 1,
  },
  ogunIsim: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ogunDetay: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  ogunKalori: {
    fontSize: 14,
  },
  durumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ogunProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tariflerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tarifCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tarifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tarifBadge: {
    backgroundColor: '#9C27B020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tarifBadgeText: {
    color: '#9C27B0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tarifIsim: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarifKalori: {
    fontSize: 12,
    marginBottom: 8,
  },
  tarifButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  tarifButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  menuItems: {
    gap: 12,
  },
  menuDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 80,
  },
  dayMealsContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  dayMeal: {
    fontSize: 14,
    flex: 1,
    marginHorizontal: 12,
  },
  dayCalories: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  onerilerContainer: {
    gap: 12,
    marginBottom: 20,
  },
  oneriCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  oneriContent: {
    marginLeft: 12,
    flex: 1,
  },
  oneriTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  oneriText: {
    fontSize: 14,
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tarifInfo: {
    marginBottom: 20,
  },
  tarifInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  tarifInfoItem: {
    alignItems: 'center',
    gap: 4,
  },
  tarifInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  malzemelerSection: {
    marginBottom: 20,
  },
  malzemeItem: {
    marginBottom: 8,
  },
  malzemeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tarifSection: {
    marginBottom: 20,
  },
  tarifText: {
    fontSize: 14,
    lineHeight: 22,
  },
  testCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 20,
  },
  testText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  testSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal genel stilleri
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContentLarge: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Menü Planlayıcı stilleri
  menuPlanContainer: {
    gap: 20,
  },
  menuPlanDay: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  menuPlanDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  mealPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    minWidth: 90,
  },
  mealPlanButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealPlanText: {
    fontSize: 14,
    flex: 1,
  },
  mealPlanContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  weeklyStats: {
    padding: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    marginTop: 8,
  },
  weeklyStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  weeklyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 12,
  },
  // Yemek Seçenekleri stilleri
  yemekSecenekleriContainer: {
    gap: 8,
  },
  yemekSecenekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  yemekSecenekInfo: {
    flex: 1,
  },
  yemekSecenekIsim: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  yemekSecenekKalori: {
    fontSize: 14,
  },
  // Manuel Yemek Ekleme stilleri
  customYemekContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  customYemekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  customYemekInputContainer: {
    gap: 8,
    marginBottom: 12,
  },
  customYemekInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  customKaloriInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    width: '50%',
  },
  customYemekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  customYemekButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  // Menü Alternatifleri stilleri
  menuAlternatifleriContainer: {
    gap: 16,
  },
  menuAlternatifCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuAlternatifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuAlternatifIsim: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuAlternatifKalori: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuAlternatifOgunler: {
    gap: 8,
    marginBottom: 12,
  },
  menuAlternatifOgun: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuAlternatifOgunText: {
    fontSize: 14,
    flex: 1,
  },
  menuAlternatifMakrolar: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 12,
  },
  menuAlternatifMakroText: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuAlternatifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  menuAlternatifButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Market Listesi stilleri
  marketListContainer: {
    gap: 20,
  },
  marketCategory: {
    marginBottom: 16,
  },
  marketCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  marketItems: {
    gap: 8,
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  marketItemText: {
    fontSize: 14,
  },
  // Haftalık Rapor stilleri
  raporContainer: {
    gap: 16,
    marginBottom: 20,
  },
  raporCard: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  raporHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  raporTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  raporValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  raporDescription: {
    fontSize: 14,
  },
  raporSuggestions: {
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  raporSuggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  raporSuggestionText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});