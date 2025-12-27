import { CircularProgress } from '@/components/CircularProgress';
import { useActivity } from '@/context/ActivityContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { OgunDetay } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Öğün bilgileri
const ogunBilgileri = [
  { 
    isim: 'Kahvaltı', 
    key: 'kahvalti' as const, 
    icon: 'sunny',
    renk: '#FF9800',
    zaman: '07:00-09:00',
    oneriler: ['Yulaf', 'Yumurta', 'Peynir', 'Domates', 'Çay']
  },
  { 
    isim: 'Öğle', 
    key: 'ogle' as const, 
    icon: 'partly-sunny',
    renk: '#4CAF50',
    zaman: '12:00-14:00',
    oneriler: ['Izgara Tavuk', 'Bulgur Pilavı', 'Salata', 'Yoğurt']
  },
  { 
    isim: 'Akşam', 
    key: 'aksam' as const, 
    icon: 'moon',
    renk: '#3F51B5',
    zaman: '19:00-21:00',
    oneriler: ['Balık', 'Sebze Yemeği', 'Yoğurt', 'Meyve']
  },
  { 
    isim: 'Ara Öğün', 
    key: 'araOgun' as const, 
    icon: 'nutrition',
    renk: '#E91E63',
    zaman: 'Gün içi',
    oneriler: ['Meyve', 'Ceviz', 'Badem', 'Yoğurt']
  },
];

// Önerilen ürünler veritabanı
const onerilerVeVegetabanı = {
  kahvalti: [
    { id: 'yumurta', isim: 'Yumurta (1 adet)', kalori: 70, protein: 6, karbonhidrat: 0.5, yag: 5, gram: 50, kategori: 'Protein' },
    { id: 'yulaf', isim: 'Yulaf (1 kase)', kalori: 150, protein: 5, karbonhidrat: 27, yag: 3, gram: 40, kategori: 'Tahıl' },
    { id: 'sut', isim: 'Süt (1 bardak)', kalori: 150, protein: 8, karbonhidrat: 12, yag: 8, gram: 250, kategori: 'Süt Ürünü' },
    { id: 'peynir', isim: 'Beyaz Peynir (2 dilim)', kalori: 75, protein: 11, karbonhidrat: 1, yag: 6, gram: 30, kategori: 'Protein' },
    { id: 'domates', isim: 'Domates (1 orta)', kalori: 22, protein: 1, karbonhidrat: 5, yag: 0.2, gram: 120, kategori: 'Sebze' },
    { id: 'ekmek', isim: 'Tam Buğday Ekmeği (1 dilim)', kalori: 80, protein: 4, karbonhidrat: 14, yag: 1, gram: 25, kategori: 'Tahıl' },
    { id: 'avokado', isim: 'Avokado (1/2 adet)', kalori: 160, protein: 2, karbonhidrat: 9, yag: 15, gram: 100, kategori: 'Meyve' },
    { id: 'muz', isim: 'Muz (1 orta)', kalori: 105, protein: 1, karbonhidrat: 27, yag: 0.3, gram: 120, kategori: 'Meyve' }
  ],
  ogle: [
    { id: 'tavuk', isim: 'Izgara Tavuk (100g)', kalori: 165, protein: 31, karbonhidrat: 0, yag: 3.6, gram: 100, kategori: 'Protein' },
    { id: 'pirinc', isim: 'Pirinç Pilavı (1 kase)', kalori: 205, protein: 4, karbonhidrat: 45, yag: 0.5, gram: 150, kategori: 'Tahıl' },
    { id: 'salata', isim: 'Karışık Salata (1 kase)', kalori: 20, protein: 1, karbonhidrat: 4, yag: 0.1, gram: 100, kategori: 'Sebze' },
    { id: 'bulgur', isim: 'Bulgur Pilavı (1 kase)', kalori: 151, protein: 6, karbonhidrat: 34, yag: 0.4, gram: 150, kategori: 'Tahıl' },
    { id: 'yogurt', isim: 'Yoğurt (1 kase)', kalori: 150, protein: 8, karbonhidrat: 17, yag: 8, gram: 200, kategori: 'Süt Ürünü' },
    { id: 'mercimek', isim: 'Mercimek Çorbası (1 kase)', kalori: 230, protein: 18, karbonhidrat: 40, yag: 0.8, gram: 250, kategori: 'Baklagil' },
    { id: 'somon', isim: 'Izgara Somon (100g)', kalori: 208, protein: 25, karbonhidrat: 0, yag: 12, gram: 100, kategori: 'Protein' },
    { id: 'brokoli', isim: 'Buharda Brokoli (1 kase)', kalori: 55, protein: 4, karbonhidrat: 11, yag: 0.6, gram: 150, kategori: 'Sebze' }
  ],
  aksam: [
    { id: 'balik', isim: 'Izgara Balık (100g)', kalori: 206, protein: 22, karbonhidrat: 0, yag: 12, gram: 100, kategori: 'Protein' },
    { id: 'sebze_yemegi', isim: 'Sebze Yemeği (1 porsiyon)', kalori: 150, protein: 5, karbonhidrat: 20, yag: 7, gram: 200, kategori: 'Sebze' },
    { id: 'quinoa', isim: 'Quinoa (1 kase)', kalori: 222, protein: 8, karbonhidrat: 39, yag: 4, gram: 150, kategori: 'Tahıl' },
    { id: 'hindi', isim: 'Hindi Göğsü (100g)', kalori: 135, protein: 30, karbonhidrat: 0, yag: 1, gram: 100, kategori: 'Protein' },
    { id: 'patates', isim: 'Fırın Patates (1 orta)', kalori: 161, protein: 4, karbonhidrat: 37, yag: 0.2, gram: 150, kategori: 'Sebze' },
    { id: 'ispanak', isim: 'Ispanak Yemeği (1 porsiyon)', kalori: 120, protein: 6, karbonhidrat: 8, yag: 8, gram: 200, kategori: 'Sebze' },
    { id: 'makarna', isim: 'Tam Buğday Makarna (1 kase)', kalori: 174, protein: 7, karbonhidrat: 37, yag: 1, gram: 140, kategori: 'Tahıl' }
  ],
  araOgun: [
    { id: 'ceviz', isim: 'Ceviz (5 adet)', kalori: 185, protein: 4, karbonhidrat: 4, yag: 18, gram: 28, kategori: 'Kuruyemiş' },
    { id: 'elma', isim: 'Elma (1 orta)', kalori: 95, protein: 0.5, karbonhidrat: 25, yag: 0.3, gram: 180, kategori: 'Meyve' },
    { id: 'badem', isim: 'Badem (10 adet)', kalori: 162, protein: 6, karbonhidrat: 6, yag: 14, gram: 28, kategori: 'Kuruyemiş' },
    { id: 'yoğurt_meyve', isim: 'Yoğurt + Meyve (1 kase)', kalori: 180, protein: 10, karbonhidrat: 25, yag: 5, gram: 200, kategori: 'Süt Ürünü' },
    { id: 'smoothie', isim: 'Protein Smoothie (1 bardak)', kalori: 200, protein: 15, karbonhidrat: 20, yag: 8, gram: 300, kategori: 'İçecek' },
    { id: 'findik', isim: 'Fındık (8 adet)', kalori: 178, protein: 4, karbonhidrat: 5, yag: 17, gram: 28, kategori: 'Kuruyemiş' },
    { id: 'portakal', isim: 'Portakal (1 orta)', kalori: 62, protein: 1, karbonhidrat: 15, yag: 0.2, gram: 150, kategori: 'Meyve' }
  ]
};

// Tarif veritabanı
const tarifler = [
  {
    id: 'yumurta_omlet',
    isim: 'Sebzeli Omlet',
    kategori: 'kahvalti',
    resim: '🍳',
    hazirlamaSuresi: 10,
    kalori: 280,
    besinDegerleri: { protein: 18, karbonhidrat: 8, yag: 20 },
    malzemeler: ['2 yumurta', 'Domates', 'Biber', 'Soğan', 'Zeytinyağı'],
    tarif: [
      'Sebzeleri küçük küçük doğrayın',
      'Tavada zeytinyağını ısıtın',
      'Sebzeleri kavurun',
      'Çırpılmış yumurtaları ekleyin',
      'Pişene kadar bekleyin'
    ]
  },
  {
    id: 'tavuk_salata',
    isim: 'Izgara Tavuk Salatası',
    kategori: 'ogle',
    resim: '🥗',
    hazirlamaSuresi: 20,
    kalori: 320,
    besinDegerleri: { protein: 35, karbonhidrat: 15, yag: 12 },
    malzemeler: ['Tavuk göğsü', 'Marul', 'Domates', 'Salatalık', 'Zeytinyağı'],
    tarif: [
      'Tavuk göğsünü ızgarada pişirin',
      'Sebzeleri yıkayıp doğrayın',
      'Tavuğu dilimleyin',
      'Tüm malzemeleri karıştırın',
      'Zeytinyağı ile tatlandırın'
    ]
  },
  {
    id: 'somon_sebze',
    isim: 'Fırın Somon',
    kategori: 'aksam',
    resim: '🐟',
    hazirlamaSuresi: 25,
    kalori: 380,
    besinDegerleri: { protein: 28, karbonhidrat: 12, yag: 25 },
    malzemeler: ['Somon fileto', 'Brokoli', 'Havuç', 'Limon', 'Zeytinyağı'],
    tarif: [
      'Fırını 180°C\'ye ısıtın',
      'Salmonu ve sebzeleri hazırlayın',
      'Zeytinyağı ve limon sıkın',
      'Fırında 20 dakika pişirin',
      'Sıcak servis yapın'
    ]
  },
  {
    id: 'protein_smoothie',
    isim: 'Protein Smoothie',
    kategori: 'ara-ogun',
    resim: '🥤',
    hazirlamaSuresi: 5,
    kalori: 220,
    besinDegerleri: { protein: 15, karbonhidrat: 25, yag: 8 },
    malzemeler: ['Yoğurt', 'Muz', 'Badem', 'Bal', 'Süt'],
    tarif: [
      'Tüm malzemeleri blender\'a koyun',
      '1-2 dakika karıştırın',
      'Kıvam kontrolü yapın',
      'Gerekirse süt ekleyin',
      'Soğuk servis yapın'
    ]
  }
];

export default function Beslenme() {
  const { todayActivity, isLoading, updateBeslenme } = useActivity();
  const { profile, updateProfile } = useUser();
  const { colors, isDark } = useTheme();
  const [selectedOgun, setSelectedOgun] = useState<'kahvalti' | 'ogle' | 'aksam' | 'araOgun' | null>(null);
  const [showOgunModal, setShowOgunModal] = useState(false);
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showRaporModal, setShowRaporModal] = useState(false);
  const [showHedefModal, setShowHedefModal] = useState(false);
  const [showHatirlaticiModal, setShowHatirlaticiModal] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<any>(null);
  const [marketListesi, setMarketListesi] = useState<string[]>([]);
  const [haftalikRapor, setHaftalikRapor] = useState<any>(null);
  const [haftalikMenu, setHaftalikMenu] = useState<any>({});
  const [selectedGun, setSelectedGun] = useState<string>('Pazartesi');
  const [selectedMenuOgun, setSelectedMenuOgun] = useState<string>('kahvalti');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [hedefKilo, setHedefKilo] = useState('');
  const [hedefTarih, setHedefTarih] = useState('');
  const [haftalikHedef, setHaftalikHedef] = useState('0.5');
  const [kaloriInput, setKaloriInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [karbonhidratInput, setKarbonhidratInput] = useState('');
  const [yagInput, setYagInput] = useState('');
  const [notlarInput, setNotlarInput] = useState('');
  const [besinlerInput, setBesinlerInput] = useState('');
  
  // Özel yemek ekleme için state'ler
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCalories, setCustomFoodCalories] = useState('');
  const [customFoodProtein, setCustomFoodProtein] = useState('');
  const [customFoodCarbs, setCustomFoodCarbs] = useState('');
  const [customFoodFat, setCustomFoodFat] = useState('');
  const [customFoodGrams, setCustomFoodGrams] = useState('');
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);

  const hedefKalori = parseInt(profile.hedefKalori || '2000');

  if (isLoading || !todayActivity) {
    const styles = createStyles(colors);
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const tamamlananOgunSayisi = Object.values(todayActivity.beslenme).filter(ogun => ogun.tamamlandi).length;
  const gunlukKalori = todayActivity.gunlukKalori || 0;
  const beslenmeSkoru = todayActivity.beslenmeSkoru || 0;
  const kaloriYuzdesi = Math.min((gunlukKalori / hedefKalori) * 100, 100);

  const handleOgunTamamla = async (ogunKey: 'kahvalti' | 'ogle' | 'aksam' | 'araOgun') => {
    const mevcutOgun = todayActivity.beslenme[ogunKey];
    await updateBeslenme(ogunKey, { 
      tamamlandi: !mevcutOgun.tamamlandi,
      zaman: !mevcutOgun.tamamlandi ? new Date().toISOString() : mevcutOgun.zaman
    });
  };

  const handleOgunDetayAc = (ogunKey: 'kahvalti' | 'ogle' | 'aksam' | 'araOgun') => {
    setSelectedOgun(ogunKey);
    const ogun = todayActivity.beslenme[ogunKey];
    setKaloriInput(ogun.kalori?.toString() || '');
    setProteinInput(ogun.protein?.toString() || '');
    setKarbonhidratInput(ogun.karbonhidrat?.toString() || '');
    setYagInput(ogun.yag?.toString() || '');
    setNotlarInput(ogun.notlar || '');
    setBesinlerInput(ogun.besinler?.join(', ') || '');
    setShowOgunModal(true);
  };

  const handleOgunKaydet = async () => {
    if (!selectedOgun) return;
    
    const ogunDetay: Partial<OgunDetay> = {
      tamamlandi: true,
      kalori: parseInt(kaloriInput) || 0,
      protein: parseInt(proteinInput) || 0,
      karbonhidrat: parseInt(karbonhidratInput) || 0,
      yag: parseInt(yagInput) || 0,
      notlar: notlarInput,
      besinler: besinlerInput.split(',').map(b => b.trim()).filter(b => b),
      zaman: new Date().toISOString(),
    };

    await updateBeslenme(selectedOgun, ogunDetay);
    setShowOgunModal(false);
    clearInputs();
  };

  const clearInputs = () => {
    setKaloriInput('');
    setProteinInput('');
    setKarbonhidratInput('');
    setYagInput('');
    setNotlarInput('');
    setBesinlerInput('');
    setSelectedOgun(null);
  };

  const handleTarifSec = (tarif: any) => {
    setSelectedTarif(tarif);
    setShowTarifModal(true);
  };

  const handleTarifUygula = async () => {
    if (!selectedTarif || !selectedOgun) return;
    
    const ogunDetay: Partial<OgunDetay> = {
      tamamlandi: true,
      kalori: selectedTarif.kalori,
      protein: selectedTarif.besinDegerleri.protein,
      karbonhidrat: selectedTarif.besinDegerleri.karbonhidrat,
      yag: selectedTarif.besinDegerleri.yag,
      notlar: `${selectedTarif.isim} tarifi uygulandı`,
      besinler: selectedTarif.malzemeler,
      zaman: new Date().toISOString(),
    };

    await updateBeslenme(selectedOgun, ogunDetay);
    setShowTarifModal(false);
    setSelectedTarif(null);
  };

  const handleMarketListesiOlustur = () => {
    console.log('Market listesi oluşturuluyor...');
    
    // Kategorilere göre malzemeler
    const malzemeKategorileri = {
      protein: ['Tavuk göğsü', 'Somon', 'Ton balığı', 'Yumurta', 'Beyaz peynir', 'Kaşar peyniri', 'Yoğurt', 'Süt'],
      sebzeMeyve: ['Domates', 'Salatalık', 'Marul', 'Roka', 'Maydanoz', 'Dereotu', 'Soğan', 'Sarımsak', 'Muz', 'Elma', 'Portakal', 'Avokado', 'Brokoli', 'Havuç', 'Biber'],
      tahilBaklagil: ['Ekmek', 'Bulgur', 'Pirinç', 'Makarna', 'Yulaf', 'Quinoa', 'Mercimek', 'Nohut', 'Fasulye'],
      yagBaharat: ['Zeytinyağı', 'Tereyağı', 'Tuz', 'Karabiber', 'Kırmızı biber', 'Kimyon', 'Tarçın', 'Bal', 'Limon'],
      kuruyemis: ['Ceviz', 'Badem', 'Fındık', 'Antep fıstığı']
    };
    
    const secilenMalzemeler: string[] = [];
    
    // Her kategoriden rastgele malzemeler seç
    Object.values(malzemeKategorileri).forEach(kategori => {
      const kategoriSayisi = Math.floor(Math.random() * 3) + 2; // 2-4 arası
      const karisikKategori = [...kategori].sort(() => 0.5 - Math.random());
      secilenMalzemeler.push(...karisikKategori.slice(0, kategoriSayisi));
    });
    
    // Listeyi karıştır ve sınırla
    const finalListe = [...secilenMalzemeler].sort(() => 0.5 - Math.random()).slice(0, 20);
    
    console.log('Seçilen malzemeler:', finalListe);
    setMarketListesi(finalListe);
    
    // Kısa bir gecikme ile modal aç
    setTimeout(() => {
      setShowMarketModal(true);
    }, 100);
  };

  const getOgunTarifleri = (ogunKey: string) => {
    const kategoriMap: { [key: string]: string } = {
      'kahvalti': 'kahvalti',
      'ogle': 'ogle', 
      'aksam': 'aksam',
      'araOgun': 'ara-ogun'
    };
    
    return tarifler.filter(tarif => tarif.kategori === kategoriMap[ogunKey]);
  };

  const generateHaftalikRapor = async () => {
    // Son 7 günün verilerini al (gerçek uygulamada storage'dan)
    const bugun = new Date();
    const haftalikVeri = {
      hafta: `${bugun.getFullYear()}-${Math.ceil(bugun.getDate() / 7)}`,
      toplamKalori: 0,
      ortalamaBeslenmeSkoru: 0,
      tamamlananOgunSayisi: 0,
      toplamOgunSayisi: 28, // 7 gün x 4 öğün
      besinDagilimi: { protein: 0, karbonhidrat: 0, yag: 0 },
      gunlukDetaylar: {} as any
    };

    // Simüle edilmiş haftalık veri
    for (let i = 0; i < 7; i++) {
      const tarih = new Date(bugun);
      tarih.setDate(bugun.getDate() - i);
      const tarihStr = tarih.toISOString().split('T')[0];
      
      const gunlukKalori = Math.floor(Math.random() * 800) + 1200; // 1200-2000 arası
      const gunlukSkor = Math.floor(Math.random() * 40) + 60; // 60-100 arası
      const gunlukOgun = Math.floor(Math.random() * 2) + 3; // 3-4 arası
      
      haftalikVeri.toplamKalori += gunlukKalori;
      haftalikVeri.ortalamaBeslenmeSkoru += gunlukSkor;
      haftalikVeri.tamamlananOgunSayisi += gunlukOgun;
      
      haftalikVeri.gunlukDetaylar[tarihStr] = {
        kalori: gunlukKalori,
        beslenmeSkoru: gunlukSkor,
        tamamlananOgun: gunlukOgun
      };
    }
    
    haftalikVeri.ortalamaBeslenmeSkoru = Math.round(haftalikVeri.ortalamaBeslenmeSkoru / 7);
    haftalikVeri.besinDagilimi = {
      protein: Math.round(haftalikVeri.toplamKalori * 0.25 / 4), // %25 protein
      karbonhidrat: Math.round(haftalikVeri.toplamKalori * 0.50 / 4), // %50 karbonhidrat
      yag: Math.round(haftalikVeri.toplamKalori * 0.25 / 9) // %25 yağ
    };
    
    setHaftalikRapor(haftalikVeri);
    setShowRaporModal(true);
  };

  const handleHedefKaydet = async () => {
    try {
      const hedefBilgileri = {
        hedefKilo,
        hedefTarihi: hedefTarih,
        haftalikHedefKilo: haftalikHedef,
        beslenmeHedefi: (parseFloat(hedefKilo) < parseFloat(profile.kilo) ? 'kilo-ver' : 'kilo-al') as 'kilo-ver' | 'kilo-al' | 'koru' | 'kas-kazan'
      };
      
      // Profili güncelle
      await updateProfile(hedefBilgileri);
      console.log('Hedef kaydedildi:', hedefBilgileri);
      setShowHedefModal(false);
      
      // Input'ları temizle
      setHedefKilo('');
      setHedefTarih('');
      setHaftalikHedef('0.5');
    } catch (error) {
      console.error('Hedef kaydedilirken hata:', error);
    }
  };

  const handleMenuPlanla = () => {
    // Boş haftalık menü oluştur
    const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const ogunler = ['kahvalti', 'ogle', 'aksam', 'araOgun'];
    const yeniMenu: any = {};

    gunler.forEach(gun => {
      yeniMenu[gun] = {};
      ogunler.forEach(ogun => {
        yeniMenu[gun][ogun] = [];
      });
    });

    setHaftalikMenu(yeniMenu);
  };

  const handleProductAdd = (product: any) => {
    const currentMenu = { ...haftalikMenu };
    if (!currentMenu[selectedGun]) {
      currentMenu[selectedGun] = {};
    }
    if (!currentMenu[selectedGun][selectedMenuOgun]) {
      currentMenu[selectedGun][selectedMenuOgun] = [];
    }
    
    currentMenu[selectedGun][selectedMenuOgun].push({
      ...product,
      id: `${product.id}_${Date.now()}` // Unique ID for duplicates
    });
    
    setHaftalikMenu(currentMenu);
    setShowProductModal(false);
  };

  const handleCustomFoodAdd = () => {
    if (!customFoodName.trim()) {
      Alert.alert('Hata', 'Lütfen yemek adını girin.');
      return;
    }

    const customFood = {
      id: `custom_${Date.now()}`,
      isim: customFoodName.trim(),
      kalori: parseInt(customFoodCalories) || 0,
      protein: parseInt(customFoodProtein) || 0,
      karbonhidrat: parseInt(customFoodCarbs) || 0,
      yag: parseInt(customFoodFat) || 0,
      gram: parseInt(customFoodGrams) || 100,
      kategori: 'Özel Yemek'
    };

    handleProductAdd(customFood);
    
    // Form'u temizle
    setCustomFoodName('');
    setCustomFoodCalories('');
    setCustomFoodProtein('');
    setCustomFoodCarbs('');
    setCustomFoodFat('');
    setCustomFoodGrams('');
    setShowCustomFoodForm(false);
  };

  const handleProductRemove = (gun: string, ogun: string, productIndex: number) => {
    const currentMenu = { ...haftalikMenu };
    currentMenu[gun][ogun].splice(productIndex, 1);
    setHaftalikMenu(currentMenu);
  };

  const handleOgunSelect = (gun: string, ogun: string) => {
    setSelectedGun(gun);
    setSelectedMenuOgun(ogun);
    setSelectedProducts(onerilerVeVegetabanı[ogun as keyof typeof onerilerVeVegetabanı] || []);
    setShowProductModal(true);
  };

  const getOgunTotalNutrition = (products: any[]) => {
    return products.reduce((total, product) => ({
      kalori: total.kalori + product.kalori,
      protein: total.protein + product.protein,
      karbonhidrat: total.karbonhidrat + product.karbonhidrat,
      yag: total.yag + product.yag
    }), { kalori: 0, protein: 0, karbonhidrat: 0, yag: 0 });
  };

  const handleMenuKaydet = async () => {
    // Menüyü kaydet (gerçek uygulamada AsyncStorage kullanılacak)
    console.log('Haftalık menü kaydedildi:', haftalikMenu);
    setShowPlanModal(false);
  };

  const getHedefDurum = () => {
    const mevcutKilo = parseFloat(profile.kilo || '0');
    const hedef = parseFloat(profile.hedefKilo || '0');
    
    if (hedef === 0 || mevcutKilo === 0) return null;
    
    const fark = Math.abs(mevcutKilo - hedef);
    const yuzde = Math.max(0, Math.min(100, (1 - (fark / mevcutKilo)) * 100));
    
    return {
      fark: fark.toFixed(1),
      yuzde: yuzde.toFixed(1),
      tip: mevcutKilo > hedef ? 'ver' : 'al',
      hedefKilo: hedef.toFixed(1),
      mevcutKilo: mevcutKilo.toFixed(1)
    };
  };

  const getBesinDagilimi = () => {
    const toplamProtein = Object.values(todayActivity.beslenme).reduce((total, ogun) => total + (ogun.protein || 0), 0);
    const toplamKarbonhidrat = Object.values(todayActivity.beslenme).reduce((total, ogun) => total + (ogun.karbonhidrat || 0), 0);
    const toplamYag = Object.values(todayActivity.beslenme).reduce((total, ogun) => total + (ogun.yag || 0), 0);
    
    return { toplamProtein, toplamKarbonhidrat, toplamYag };
  };

  const { toplamProtein, toplamKarbonhidrat, toplamYag } = getBesinDagilimi();

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Günlük Beslenme</Text>
          <Text style={styles.subtitle}>Sağlıklı beslenme alışkanlıkları</Text>
        </View>
        <CircularProgress
          progress={beslenmeSkoru}
          size={80}
          strokeWidth={8}
          color={beslenmeSkoru >= 80 ? '#4CAF50' : beslenmeSkoru >= 60 ? '#FF9800' : '#FF5252'}
          backgroundColor={colors.border}
          text={`${beslenmeSkoru}`}
        />
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="restaurant" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{tamamlananOgunSayisi}/4</Text>
          <Text style={styles.statLabel}>Öğün</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#FF5252" />
          <Text style={styles.statValue}>{gunlukKalori}</Text>
          <Text style={styles.statLabel}>Kalori</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{Math.round(kaloriYuzdesi)}%</Text>
          <Text style={styles.statLabel}>Hedef</Text>
        </View>
      </View>

      {/* Kalori İlerleme */}
      <View style={styles.kaloriCard}>
        <Text style={styles.kaloriTitle}>Günlük Kalori Takibi</Text>
        <View style={styles.kaloriProgress}>
          <View style={styles.kaloriBar}>
            <View style={[styles.kaloriFill, { width: `${Math.min(kaloriYuzdesi, 100)}%` }]} />
          </View>
          <Text style={styles.kaloriText}>{gunlukKalori} / {hedefKalori} kcal</Text>
        </View>
      </View>

      {/* Besin Değerleri */}
      <View style={styles.besinCard}>
        <Text style={styles.besinTitle}>Besin Değerleri</Text>
        <View style={styles.besinRow}>
          <View style={styles.besinItem}>
            <View style={[styles.besinIcon, { backgroundColor: '#FF525220' }]}>
              <Ionicons name="fitness" size={20} color="#FF5252" />
            </View>
            <Text style={styles.besinLabel}>Protein</Text>
            <Text style={styles.besinValue}>{toplamProtein}g</Text>
          </View>
          <View style={styles.besinItem}>
            <View style={[styles.besinIcon, { backgroundColor: '#FF980020' }]}>
              <Ionicons name="leaf" size={20} color="#FF9800" />
            </View>
            <Text style={styles.besinLabel}>Karbonhidrat</Text>
            <Text style={styles.besinValue}>{toplamKarbonhidrat}g</Text>
          </View>
          <View style={styles.besinItem}>
            <View style={[styles.besinIcon, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="water" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.besinLabel}>Yağ</Text>
            <Text style={styles.besinValue}>{toplamYag}g</Text>
          </View>
        </View>
      </View>

      {/* Öğünler */}
      <Text style={styles.sectionTitle}>Günlük Öğünler</Text>
      <View style={styles.ogunlerContainer}>
        {ogunBilgileri.map((ogun) => {
          const ogunDetay = todayActivity.beslenme[ogun.key];
          const tamamlandi = ogunDetay.tamamlandi;
          
          return (
            <View key={ogun.key} style={[styles.ogunCard, { borderLeftColor: ogun.renk }]}>
              <View style={styles.ogunHeader}>
                <View style={[styles.ogunIconContainer, { backgroundColor: `${ogun.renk}20` }]}>
                  <Ionicons name={ogun.icon as any} size={28} color={ogun.renk} />
                </View>
                <View style={styles.ogunInfo}>
                  <Text style={styles.ogunName}>{ogun.isim}</Text>
                  <Text style={styles.ogunZaman}>{ogun.zaman}</Text>
                  {tamamlandi && ogunDetay.kalori && (
                    <Text style={styles.ogunKalori}>{ogunDetay.kalori} kcal</Text>
                  )}
                </View>
                <View style={styles.ogunStatus}>
                  {tamamlandi ? (
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={32} color="#ccc" />
                  )}
                </View>
              </View>
              
              <View style={styles.ogunOneriler}>
                <Text style={styles.ogunOneriTitle}>Öneriler:</Text>
                <Text style={styles.ogunOneriText}>{ogun.oneriler.join(', ')}</Text>
              </View>
              
              <View style={styles.ogunButtons}>
                <TouchableOpacity
                  style={[styles.ogunButton, styles.tarifButton]}
                  onPress={() => {
                    setSelectedOgun(ogun.key);
                    const ogunTarifleri = getOgunTarifleri(ogun.key);
                    if (ogunTarifleri.length > 0) {
                      handleTarifSec(ogunTarifleri[0]);
                    }
                  }}
                >
                  <Ionicons name="restaurant" size={16} color="#9C27B0" />
                  <Text style={[styles.ogunButtonText, { color: '#9C27B0' }]}>Tarif</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.ogunButton, styles.detayButton]}
                  onPress={() => handleOgunDetayAc(ogun.key)}
                >
                  <Ionicons name="create" size={16} color="#2196F3" />
                  <Text style={styles.ogunButtonText}>Detay</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.ogunButton, tamamlandi ? styles.tamamlandiButton : styles.tamamlaButton]}
                  onPress={() => handleOgunTamamla(ogun.key)}
                >
                  <Ionicons name={tamamlandi ? "checkmark" : "add"} size={16} color="#fff" />
                  <Text style={[styles.ogunButtonText, { color: '#fff' }]}>
                    {tamamlandi ? 'Tamamlandı' : 'Tamamla'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Hızlı Aksiyonlar */}
      <Text style={styles.sectionTitle}>Hızlı Aksiyonlar</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            handleMenuPlanla();
            setShowPlanModal(true);
          }}
        >
          <Ionicons name="calendar" size={32} color="#4CAF50" />
          <Text style={styles.quickActionText}>Menü Planlayıcı</Text>
          <Text style={styles.quickActionSubtext}>Haftalık plan oluştur</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            if (marketListesi.length === 0) {
              handleMarketListesiOlustur();
            } else {
              setShowMarketModal(true);
            }
          }}
        >
          <Ionicons name="basket" size={32} color="#FF9800" />
          <Text style={styles.quickActionText}>Market Listesi</Text>
          <Text style={styles.quickActionSubtext}>Alışveriş listesi oluştur</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            if (!haftalikRapor) {
              generateHaftalikRapor();
            } else {
              setShowRaporModal(true);
            }
          }}
        >
          <Ionicons name="analytics" size={32} color="#2196F3" />
          <Text style={styles.quickActionText}>Haftalık Rapor</Text>
          <Text style={styles.quickActionSubtext}>Beslenme analizi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            // Mevcut profil verilerini input'lara yükle
            setHedefKilo(profile.hedefKilo || '');
            setHedefTarih(profile.hedefTarihi || '');
            setHaftalikHedef(profile.haftalikHedefKilo || '0.5');
            setShowHedefModal(true);
          }}
        >
          <Ionicons name="trophy" size={32} color="#9C27B0" />
          <Text style={styles.quickActionText}>Hedef Belirle</Text>
          <Text style={styles.quickActionSubtext}>Kilo hedefi koy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setShowHatirlaticiModal(true)}
        >
          <Ionicons name="notifications" size={32} color="#FF5252" />
          <Text style={styles.quickActionText}>Hatırlatıcılar</Text>
          <Text style={styles.quickActionSubtext}>Öğün zamanları</Text>
        </TouchableOpacity>
        
        {getHedefDurum() && (
          <View style={styles.hedefDurumCard}>
            <Ionicons name="trending-up" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Hedef İlerleme</Text>
            <Text style={styles.hedefDurumText}>
              {getHedefDurum()?.mevcutKilo} kg → {getHedefDurum()?.hedefKilo} kg
            </Text>
            <Text style={styles.hedefDurumText}>
              {getHedefDurum()?.fark} kg {getHedefDurum()?.tip === 'ver' ? 'vermeli' : 'almalı'}
            </Text>
            <Text style={[styles.hedefDurumText, { fontSize: 10, marginTop: 2 }]}>
              %{getHedefDurum()?.yuzde} tamamlandı
            </Text>
          </View>
        )}
      </View>

      {/* Öğün Detay Modal */}
      <Modal
        visible={showOgunModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOgunModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOgun && ogunBilgileri.find(o => o.key === selectedOgun)?.isim} Detayları
              </Text>
              <TouchableOpacity onPress={() => setShowOgunModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kalori (kcal)</Text>
                <TextInput
                  style={styles.input}
                  value={kaloriInput}
                  onChangeText={setKaloriInput}
                  keyboardType="numeric"
                  placeholder="Örn: 350"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.besinInputRow}>
                <View style={styles.besinInputItem}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={proteinInput}
                    onChangeText={setProteinInput}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.besinInputItem}>
                  <Text style={styles.inputLabel}>Karbonhidrat (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={karbonhidratInput}
                    onChangeText={setKarbonhidratInput}
                    keyboardType="numeric"
                    placeholder="45"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.besinInputItem}>
                  <Text style={styles.inputLabel}>Yağ (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={yagInput}
                    onChangeText={setYagInput}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Besinler</Text>
                <TextInput
                  style={styles.input}
                  value={besinlerInput}
                  onChangeText={setBesinlerInput}
                  placeholder="Örn: Yumurta, Ekmek, Domates"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notlar</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notlarInput}
                  onChangeText={setNotlarInput}
                  placeholder="Öğün hakkında notlarınız..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowOgunModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleOgunKaydet}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tarif Modal */}
      <Modal
        visible={showTarifModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTarifModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTarif && (
              <>
                <View style={styles.tarifHeader}>
                  <Text style={styles.tarifEmoji}>{selectedTarif.resim}</Text>
                  <View style={styles.tarifInfo}>
                    <Text style={styles.tarifTitle}>{selectedTarif.isim}</Text>
                    <View style={styles.tarifMeta}>
                      <View style={styles.tarifMetaItem}>
                        <Ionicons name="time" size={16} color={colors.textSecondary} />
                        <Text style={styles.tarifMetaText}>{selectedTarif.hazirlamaSuresi} dk</Text>
                      </View>
                      <View style={styles.tarifMetaItem}>
                        <Ionicons name="flame" size={16} color="#FF5252" />
                        <Text style={styles.tarifMetaText}>{selectedTarif.kalori} kcal</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowTarifModal(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.tarifScroll} showsVerticalScrollIndicator={false}>
                  {/* Besin Değerleri */}
                  <View style={styles.tarifBesinler}>
                    <Text style={styles.tarifSectionTitle}>Besin Değerleri</Text>
                    <View style={styles.tarifBesinRow}>
                      <View style={styles.tarifBesinItem}>
                        <Text style={styles.tarifBesinValue}>{selectedTarif.besinDegerleri.protein}g</Text>
                        <Text style={styles.tarifBesinLabel}>Protein</Text>
                      </View>
                      <View style={styles.tarifBesinItem}>
                        <Text style={styles.tarifBesinValue}>{selectedTarif.besinDegerleri.karbonhidrat}g</Text>
                        <Text style={styles.tarifBesinLabel}>Karbonhidrat</Text>
                      </View>
                      <View style={styles.tarifBesinItem}>
                        <Text style={styles.tarifBesinValue}>{selectedTarif.besinDegerleri.yag}g</Text>
                        <Text style={styles.tarifBesinLabel}>Yağ</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Malzemeler */}
                  <View style={styles.tarifSection}>
                    <Text style={styles.tarifSectionTitle}>Malzemeler</Text>
                    {selectedTarif.malzemeler.map((malzeme: string, index: number) => (
                      <View key={index} style={styles.malzemeItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.malzemeText}>{malzeme}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {/* Tarif Adımları */}
                  <View style={styles.tarifSection}>
                    <Text style={styles.tarifSectionTitle}>Hazırlanışı</Text>
                    {selectedTarif.tarif.map((adim: string, index: number) => (
                      <View key={index} style={styles.tarifAdim}>
                        <View style={styles.adimNumara}>
                          <Text style={styles.adimNumaraText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.adimText}>{adim}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                
                <View style={styles.tarifButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowTarifModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Kapat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleTarifUygula}
                  >
                    <Text style={styles.modalButtonText}>Öğüne Ekle</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Market Listesi Modal */}
      <Modal
        visible={showMarketModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMarketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Market Listesi</Text>
              <TouchableOpacity onPress={() => setShowMarketModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {marketListesi.length > 0 ? (
              <>
                <ScrollView style={styles.marketScroll} showsVerticalScrollIndicator={false}>
                  {marketListesi.map((malzeme, index) => (
                    <View key={index} style={styles.marketItem}>
                      <Ionicons name="basket" size={20} color="#FF9800" />
                      <Text style={styles.marketItemText}>{malzeme}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => setShowMarketModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Tamam</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyMarket}>
                <Ionicons name="basket-outline" size={64} color="#ccc" />
                <Text style={styles.emptyMarketText}>Market listesi oluşturuluyor...</Text>
                <Text style={styles.emptyMarketSubtext}>Lütfen bekleyin</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Menü Planlayıcı Modal */}
      <Modal
        visible={showPlanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.menuPlanModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Haftalık Menü Planlayıcı</Text>
              <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.menuPlanScroll} showsVerticalScrollIndicator={false}>
              {Object.keys(haftalikMenu).length === 0 ? (
                <View style={styles.emptyMenu}>
                  <Ionicons name="calendar-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyMenuText}>Menü planı oluşturuluyor...</Text>
                </View>
              ) : (
                Object.entries(haftalikMenu).map(([gun, gunMenusu]: [string, any]) => (
                  <View key={gun} style={styles.gunCard}>
                    <Text style={styles.gunTitle}>{gun}</Text>
                    <View style={styles.gunOgunleri}>
                      {Object.entries(gunMenusu).map(([ogun, products]: [string, any]) => {
                        const ogunBilgi = ogunBilgileri.find(o => o.key === ogun);
                        const nutrition = getOgunTotalNutrition(products || []);
                        
                        return (
                          <View key={ogun} style={styles.menuOgunCard}>
                            <View style={styles.menuOgunHeader}>
                              <View style={[styles.menuOgunIcon, { backgroundColor: `${ogunBilgi?.renk}20` }]}>
                                <Ionicons name={ogunBilgi?.icon as any} size={20} color={ogunBilgi?.renk} />
                              </View>
                              <View style={styles.menuOgunInfo}>
                                <Text style={styles.menuOgunName}>{ogunBilgi?.isim}</Text>
                                <Text style={styles.menuNutritionText}>
                                  {nutrition.kalori} kcal • {nutrition.protein.toFixed(1)}g protein
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.menuAddButton}
                                onPress={() => handleOgunSelect(gun, ogun)}
                              >
                                <Ionicons name="add" size={20} color={colors.primary} />
                              </TouchableOpacity>
                            </View>
                            
                            {products && products.length > 0 && (
                              <View style={styles.menuProductsList}>
                                {products.map((product: any, index: number) => (
                                  <View key={product.id} style={styles.menuProductItem}>
                                    <Text style={styles.menuProductName}>{product.isim}</Text>
                                    <Text style={styles.menuProductNutrition}>
                                      {product.kalori}kcal • {product.protein}g protein
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.menuProductRemove}
                                      onPress={() => handleProductRemove(gun, ogun, index)}
                                    >
                                      <Ionicons name="close" size={16} color={colors.error} />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            <View style={styles.menuPlanButtons}>
              <TouchableOpacity
                style={[styles.menuPlanButton, styles.cancelButton]}
                onPress={() => setShowPlanModal(false)}
              >
                <Text style={styles.menuPlanButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuPlanButton, styles.planlaButton]}
                onPress={handleMenuPlanla}
              >
                <Ionicons name="refresh" size={14} color="#fff" />
                <Text style={styles.menuPlanButtonText}>Yeni Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuPlanButton, styles.saveButton]}
                onPress={handleMenuKaydet}
              >
                <Text style={styles.menuPlanButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ürün Seçim Modal */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedGun} - {ogunBilgileri.find(o => o.key === selectedMenuOgun)?.isim} Seçimi
              </Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Özel Yemek Ekleme Bölümü */}
              <View style={styles.customFoodSection}>
                <TouchableOpacity
                  style={styles.customFoodToggle}
                  onPress={() => setShowCustomFoodForm(!showCustomFoodForm)}
                >
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                  <Text style={styles.customFoodToggleText}>Özel Yemek Ekle</Text>
                  <Ionicons 
                    name={showCustomFoodForm ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>

                {showCustomFoodForm && (
                  <View style={styles.customFoodForm}>
                    <View style={styles.customFoodInputGroup}>
                      <Text style={styles.customFoodLabel}>Yemek Adı *</Text>
                      <TextInput
                        style={styles.customFoodInput}
                        value={customFoodName}
                        onChangeText={setCustomFoodName}
                        placeholder="Örn: Ev yapımı mantı"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.customFoodRow}>
                      <View style={styles.customFoodInputHalf}>
                        <Text style={styles.customFoodLabel}>Kalori</Text>
                        <TextInput
                          style={styles.customFoodInput}
                          value={customFoodCalories}
                          onChangeText={setCustomFoodCalories}
                          placeholder="250"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.customFoodInputHalf}>
                        <Text style={styles.customFoodLabel}>Gram</Text>
                        <TextInput
                          style={styles.customFoodInput}
                          value={customFoodGrams}
                          onChangeText={setCustomFoodGrams}
                          placeholder="100"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={styles.customFoodRow}>
                      <View style={styles.customFoodInputThird}>
                        <Text style={styles.customFoodLabel}>Protein (g)</Text>
                        <TextInput
                          style={styles.customFoodInput}
                          value={customFoodProtein}
                          onChangeText={setCustomFoodProtein}
                          placeholder="15"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.customFoodInputThird}>
                        <Text style={styles.customFoodLabel}>Karb (g)</Text>
                        <TextInput
                          style={styles.customFoodInput}
                          value={customFoodCarbs}
                          onChangeText={setCustomFoodCarbs}
                          placeholder="30"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.customFoodInputThird}>
                        <Text style={styles.customFoodLabel}>Yağ (g)</Text>
                        <TextInput
                          style={styles.customFoodInput}
                          value={customFoodFat}
                          onChangeText={setCustomFoodFat}
                          placeholder="8"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.customFoodAddButton}
                      onPress={handleCustomFoodAdd}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.customFoodAddButtonText}>Ekle</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.productModalSubtitle}>Önerilen ürünlerden seçim yapın:</Text>
              
              {selectedProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => handleProductAdd(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.isim}</Text>
                    <Text style={styles.productCategory}>{product.kategori} • {product.gram}g</Text>
                    <View style={styles.productNutrition}>
                      <Text style={styles.nutritionItem}>{product.kalori} kcal</Text>
                      <Text style={styles.nutritionItem}>{product.protein}g protein</Text>
                      <Text style={styles.nutritionItem}>{product.karbonhidrat}g karb</Text>
                      <Text style={styles.nutritionItem}>{product.yag}g yağ</Text>
                    </View>
                  </View>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setShowProductModal(false)}
              >
                <Text style={styles.modalButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Haftalık Rapor Modal */}
      <Modal
        visible={showRaporModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRaporModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.raporModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Haftalık Beslenme Raporu</Text>
              <TouchableOpacity onPress={() => setShowRaporModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {haftalikRapor ? (
              <>
                <ScrollView style={styles.raporScroll} showsVerticalScrollIndicator={false}>
                  {/* Özet Kartları */}
                  <View style={styles.raporOzet}>
                    <View style={styles.raporOzetCard}>
                      <Ionicons name="flame" size={24} color="#FF5252" />
                      <Text style={styles.raporOzetValue}>{haftalikRapor.toplamKalori}</Text>
                      <Text style={styles.raporOzetLabel}>Toplam Kalori</Text>
                    </View>
                    <View style={styles.raporOzetCard}>
                      <Ionicons name="star" size={24} color="#FFD700" />
                      <Text style={styles.raporOzetValue}>{haftalikRapor.ortalamaBeslenmeSkoru}</Text>
                      <Text style={styles.raporOzetLabel}>Ortalama Skor</Text>
                    </View>
                    <View style={styles.raporOzetCard}>
                      <Ionicons name="restaurant" size={24} color="#4CAF50" />
                      <Text style={styles.raporOzetValue}>{haftalikRapor.tamamlananOgunSayisi}/{haftalikRapor.toplamOgunSayisi}</Text>
                      <Text style={styles.raporOzetLabel}>Öğün Oranı</Text>
                    </View>
                  </View>
                  
                  {/* Besin Dağılımı */}
                  <View style={styles.raporSection}>
                    <Text style={styles.raporSectionTitle}>Haftalık Besin Dağılımı</Text>
                    <View style={styles.besinDagilimContainer}>
                      <View style={styles.besinDagilimItem}>
                        <View style={[styles.besinDagilimBar, { backgroundColor: '#FF5252', width: '40%' }]} />
                        <Text style={styles.besinDagilimText}>Protein: {haftalikRapor.besinDagilimi.protein}g</Text>
                      </View>
                      <View style={styles.besinDagilimItem}>
                        <View style={[styles.besinDagilimBar, { backgroundColor: '#FF9800', width: '60%' }]} />
                        <Text style={styles.besinDagilimText}>Karbonhidrat: {haftalikRapor.besinDagilimi.karbonhidrat}g</Text>
                      </View>
                      <View style={styles.besinDagilimItem}>
                        <View style={[styles.besinDagilimBar, { backgroundColor: '#4CAF50', width: '30%' }]} />
                        <Text style={styles.besinDagilimText}>Yağ: {haftalikRapor.besinDagilimi.yag}g</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Günlük Detaylar */}
                  <View style={styles.raporSection}>
                    <Text style={styles.raporSectionTitle}>Günlük Detaylar</Text>
                    {Object.entries(haftalikRapor.gunlukDetaylar).map(([tarih, detay]: [string, any]) => (
                      <View key={tarih} style={styles.gunlukDetayItem}>
                        <Text style={styles.gunlukDetayTarih}>
                          {new Date(tarih).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                        <View style={styles.gunlukDetayStats}>
                          <Text style={styles.gunlukDetayStat}>{detay.kalori} kcal</Text>
                          <Text style={styles.gunlukDetayStat}>Skor: {detay.beslenmeSkoru}</Text>
                          <Text style={styles.gunlukDetayStat}>{detay.tamamlananOgun}/4 öğün</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => setShowRaporModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Tamam</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyRapor}>
                <Ionicons name="analytics-outline" size={64} color="#ccc" />
                <Text style={styles.emptyRaporText}>Rapor oluşturuluyor...</Text>
                <Text style={styles.emptyRaporSubtext}>Lütfen bekleyin</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Hedef Belirleme Modal */}
      <Modal
        visible={showHedefModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHedefModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kilo Hedefi Belirle</Text>
              <TouchableOpacity onPress={() => setShowHedefModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.hedefBilgi}>
                <Text style={styles.hedefBilgiText}>Mevcut Kilo: {profile.kilo || '0'} kg</Text>
                <Text style={styles.hedefBilgiText}>Boy: {profile.boy || '0'} cm</Text>
                {profile.kilo && profile.boy && (
                  <Text style={styles.hedefBilgiText}>
                    BMI: {(parseFloat(profile.kilo) / Math.pow(parseFloat(profile.boy) / 100, 2)).toFixed(1)}
                  </Text>
                )}
                {profile.hedefKilo && (
                  <Text style={[styles.hedefBilgiText, { color: colors.primary, fontWeight: 'bold' }]}>
                    Mevcut Hedef: {profile.hedefKilo} kg
                  </Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hedef Kilo (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={hedefKilo}
                  onChangeText={setHedefKilo}
                  keyboardType="numeric"
                  placeholder={profile.hedefKilo || "Örn: 70"}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Haftalık Hedef (kg/hafta)</Text>
                <View style={styles.hedefSecenekler}>
                  {['0.25', '0.5', '0.75', '1.0'].map(deger => (
                    <TouchableOpacity
                      key={deger}
                      style={[
                        styles.hedefSecenek,
                        (haftalikHedef === deger || (!haftalikHedef && profile.haftalikHedefKilo === deger)) && styles.hedefSecenekSecili
                      ]}
                      onPress={() => setHaftalikHedef(deger)}
                    >
                      <Text style={[
                        styles.hedefSecenekText,
                        (haftalikHedef === deger || (!haftalikHedef && profile.haftalikHedefKilo === deger)) && styles.hedefSecenekTextSecili
                      ]}>
                        {deger} kg
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hedef Tarih</Text>
                <TextInput
                  style={styles.input}
                  value={hedefTarih}
                  onChangeText={setHedefTarih}
                  placeholder={profile.hedefTarihi || "GG.AA.YYYY"}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              {/* Beslenme Hedefi Seçimi */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Beslenme Hedefi</Text>
                <View style={styles.hedefSecenekler}>
                  {[
                    { key: 'kilo-ver', label: 'Kilo Ver' },
                    { key: 'kilo-al', label: 'Kilo Al' },
                    { key: 'koru', label: 'Koru' },
                    { key: 'kas-kazan', label: 'Kas Kazan' }
                  ].map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.hedefSecenek,
                        profile.beslenmeHedefi === key && styles.hedefSecenekSecili
                      ]}
                      onPress={() => updateProfile({ beslenmeHedefi: key as any })}
                    >
                      <Text style={[
                        styles.hedefSecenekText,
                        profile.beslenmeHedefi === key && styles.hedefSecenekTextSecili
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Günlük Kalori Hedefi */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Günlük Kalori Hedefi</Text>
                <TextInput
                  style={styles.input}
                  value={profile.hedefKalori || ''}
                  onChangeText={(value) => updateProfile({ hedefKalori: value })}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.hedefAciklama}>
                  {profile.beslenmeHedefi === 'kilo-ver' && 'Kilo vermek için günlük kalori alımınızı azaltın'}
                  {profile.beslenmeHedefi === 'kilo-al' && 'Kilo almak için günlük kalori alımınızı artırın'}
                  {profile.beslenmeHedefi === 'koru' && 'Mevcut kilonuzu korumak için dengeli beslenin'}
                  {profile.beslenmeHedefi === 'kas-kazan' && 'Kas kazanmak için protein ağırlıklı beslenin'}
                </Text>
              </View>
              
              {(hedefKilo || profile.hedefKilo) && profile.kilo && (
                <View style={styles.hedefOnizleme}>
                  <Text style={styles.hedefOnizlemeTitle}>Hedef Özeti</Text>
                  <Text style={styles.hedefOnizlemeText}>
                    Mevcut: {profile.kilo} kg → Hedef: {hedefKilo || profile.hedefKilo} kg
                  </Text>
                  <Text style={styles.hedefOnizlemeText}>
                    {parseFloat(hedefKilo || profile.hedefKilo || '0') < parseFloat(profile.kilo) ? 'Vermeli' : 'Almalı'}: {Math.abs(parseFloat(hedefKilo || profile.hedefKilo || '0') - parseFloat(profile.kilo)).toFixed(1)} kg
                  </Text>
                  <Text style={styles.hedefOnizlemeText}>
                    Haftalık: {haftalikHedef || profile.haftalikHedefKilo || '0.5'} kg
                  </Text>
                  <Text style={styles.hedefOnizlemeText}>
                    Tahmini Süre: {Math.ceil(Math.abs(parseFloat(hedefKilo || profile.hedefKilo || '0') - parseFloat(profile.kilo)) / parseFloat(haftalikHedef || profile.haftalikHedefKilo || '0.5'))} hafta
                  </Text>
                  {profile.beslenmeHedefi && (
                    <Text style={styles.hedefOnizlemeText}>
                      Beslenme Stratejisi: {
                        profile.beslenmeHedefi === 'kilo-ver' ? 'Kilo Verme' :
                        profile.beslenmeHedefi === 'kilo-al' ? 'Kilo Alma' :
                        profile.beslenmeHedefi === 'koru' ? 'Kilo Koruma' :
                        'Kas Kazanma'
                      }
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowHedefModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleHedefKaydet}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hatırlatıcılar Modal */}
      <Modal
        visible={showHatirlaticiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHatirlaticiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Öğün Hatırlatıcıları</Text>
              <TouchableOpacity onPress={() => setShowHatirlaticiModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.hatirlaticiAciklama}>
                Öğün zamanlarınız için hatırlatıcı kurabilirsiniz. Bildirimler belirlediğiniz saatlerde gelecektir.
              </Text>
              
              {ogunBilgileri.map((ogun) => (
                <View key={ogun.key} style={styles.hatirlaticiItem}>
                  <View style={styles.hatirlaticiHeader}>
                    <View style={[styles.hatirlaticiIcon, { backgroundColor: `${ogun.renk}20` }]}>
                      <Ionicons name={ogun.icon as any} size={24} color={ogun.renk} />
                    </View>
                    <View style={styles.hatirlaticiInfo}>
                      <Text style={styles.hatirlaticiTitle}>{ogun.isim}</Text>
                      <Text style={styles.hatirlaticiZaman}>{ogun.zaman}</Text>
                    </View>
                    <TouchableOpacity style={styles.hatirlaticiSwitch}>
                      <Ionicons name="notifications" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <View style={styles.hatirlaticiGenel}>
                <Text style={styles.hatirlaticiGenelTitle}>Genel Ayarlar</Text>
                <View style={styles.hatirlaticiGenelItem}>
                  <Ionicons name="water" size={24} color="#2196F3" />
                  <Text style={styles.hatirlaticiGenelText}>Su İçme Hatırlatıcısı</Text>
                  <TouchableOpacity style={styles.hatirlaticiSwitch}>
                    <Ionicons name="notifications" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setShowHatirlaticiModal(false)}
              >
                <Text style={styles.modalButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Motivasyon Mesajı */}
      {beslenmeSkoru < 50 && (
        <View style={styles.motivationCard}>
          <Ionicons name="leaf" size={32} color="#4CAF50" />
          <Text style={styles.motivationText}>
            Sağlıklı beslenme alışkanlıkları kazanmak için küçük adımlarla başla! 🌱
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
    kaloriCard: {
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
    kaloriTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    kaloriProgress: {
      gap: 8,
    },
    kaloriBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    kaloriFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 4,
    },
    kaloriText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    besinCard: {
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
    besinTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
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
      color: colors.textSecondary,
      marginBottom: 4,
    },
    besinValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    ogunlerContainer: {
      gap: 16,
      marginBottom: 20,
    },
    ogunCard: {
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
    ogunHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    ogunIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    ogunInfo: {
      flex: 1,
    },
    ogunName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    ogunZaman: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    ogunKalori: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '600',
    },
    ogunStatus: {
      marginLeft: 12,
    },
    ogunOneriler: {
      marginBottom: 12,
    },
    ogunOneriTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    ogunOneriText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    ogunButtons: {
      flexDirection: 'row',
      gap: 6,
    },
    ogunButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      gap: 4,
    },
    tarifButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: '#9C27B0',
    },
    detayButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    tamamlaButton: {
      backgroundColor: colors.success,
    },
    tamamlandiButton: {
      backgroundColor: colors.warning,
    },
    ogunButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondary,
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
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    hedefDurumCard: {
      width: '48%',
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.success,
    },
    hedefDurumText: {
      fontSize: 12,
      color: colors.success,
      marginTop: 4,
      textAlign: 'center',
      fontWeight: '600',
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
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      width: '100%',
      maxWidth: 450,
      maxHeight: '85%',
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
    modalScroll: {
      maxHeight: 250,
      marginBottom: 8,
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
    besinInputRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    besinInputItem: {
      flex: 1,
    },
    modalButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      minWidth: 120,
    },
    cancelButton: {
      backgroundColor: colors.error,
    },
    saveButton: {
      backgroundColor: colors.success,
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
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
      borderColor: colors.success,
    },
    motivationText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    tarifHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tarifEmoji: {
      fontSize: 48,
      marginRight: 16,
    },
    tarifInfo: {
      flex: 1,
    },
    tarifTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    tarifMeta: {
      flexDirection: 'row',
      gap: 16,
    },
    tarifMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tarifMetaText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    tarifScroll: {
      flex: 1,
    },
    tarifSection: {
      marginBottom: 20,
    },
    tarifSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    tarifBesinler: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    tarifBesinRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    tarifBesinItem: {
      alignItems: 'center',
    },
    tarifBesinValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    tarifBesinLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    malzemeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    malzemeText: {
      fontSize: 16,
      color: colors.text,
    },
    tarifAdim: {
      flexDirection: 'row',
      marginBottom: 12,
      gap: 12,
    },
    adimNumara: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
    },
    adimNumaraText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    adimText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    tarifButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    marketScroll: {
      maxHeight: 300,
      marginBottom: 8,
    },
    modalButtonContainer: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 16,
      flexDirection: 'row',
      gap: 12,
    },
    marketItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
      gap: 12,
    },
    marketItemText: {
      fontSize: 16,
      color: colors.text,
    },
    emptyMarket: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyMarketText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMarketSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    emptyRapor: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyRaporText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyRaporSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    raporModal: {
      maxHeight: '85%',
    },
    raporScroll: {
      maxHeight: 300,
      marginBottom: 8,
    },
    raporOzet: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    raporOzetCard: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    raporOzetValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
    },
    raporOzetLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    raporSection: {
      marginBottom: 20,
    },
    raporSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    besinDagilimContainer: {
      gap: 8,
    },
    besinDagilimItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    besinDagilimBar: {
      height: 8,
      borderRadius: 4,
    },
    besinDagilimText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    gunlukDetayItem: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    gunlukDetayTarih: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'capitalize',
    },
    gunlukDetayStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    gunlukDetayStat: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    hedefBilgi: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    hedefBilgiText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 4,
    },
    hedefSecenekler: {
      flexDirection: 'row',
      gap: 8,
    },
    hedefSecenek: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    hedefSecenekSecili: {
      borderColor: colors.success,
      backgroundColor: colors.background,
    },
    hedefSecenekText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    hedefSecenekTextSecili: {
      color: colors.success,
    },
    hedefOnizleme: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    hedefOnizlemeTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    hedefOnizlemeText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    hedefAciklama: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    hatirlaticiAciklama: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    hatirlaticiItem: {
      marginBottom: 16,
    },
    hatirlaticiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
    },
    hatirlaticiIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    hatirlaticiInfo: {
      flex: 1,
    },
    hatirlaticiTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    hatirlaticiZaman: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    hatirlaticiSwitch: {
      padding: 8,
    },
    hatirlaticiGenel: {
      marginTop: 20,
    },
    hatirlaticiGenelTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    hatirlaticiGenelItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    hatirlaticiGenelText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    // Menü Planlayıcı Stilleri
    menuPlanModal: {
      maxHeight: '90%',
    },
    menuPlanScroll: {
      maxHeight: 500,
    },
    emptyMenu: {
      alignItems: 'center',
      padding: 40,
    },
    emptyMenuText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    gunCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
    },
    gunTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      padding: 16,
      backgroundColor: colors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    gunOgunleri: {
      padding: 12,
      gap: 8,
    },
    menuOgunCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
    },
    menuOgunHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuOgunIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuOgunInfo: {
      flex: 1,
    },
    menuOgunName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    planlaButton: {
      backgroundColor: colors.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    menuAddButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    menuProductsList: {
      marginTop: 8,
      gap: 6,
    },
    menuProductItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 6,
      gap: 8,
    },
    menuProductName: {
      flex: 1,
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    menuProductNutrition: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    menuProductRemove: {
      padding: 4,
    },
    menuNutritionText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    productModalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      textAlign: 'center',
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      gap: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    productCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    productNutrition: {
      flexDirection: 'row',
      gap: 12,
    },
    nutritionItem: {
      fontSize: 11,
      color: colors.textSecondary,
      backgroundColor: colors.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    // Menü planlayıcı özel butonları
    menuPlanButtons: {
      flexDirection: 'row',
      gap: 6,
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    menuPlanButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 4,
      minHeight: 36,
    },
    menuPlanButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    // Özel yemek ekleme stilleri
    customFoodSection: {
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    customFoodToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    customFoodToggleText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    customFoodForm: {
      marginTop: 16,
      gap: 12,
    },
    customFoodInputGroup: {
      gap: 6,
    },
    customFoodLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    customFoodInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.background,
    },
    customFoodRow: {
      flexDirection: 'row',
      gap: 12,
    },
    customFoodInputHalf: {
      flex: 1,
      gap: 6,
    },
    customFoodInputThird: {
      flex: 1,
      gap: 6,
    },
    customFoodAddButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      marginTop: 8,
    },
    customFoodAddButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}