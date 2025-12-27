// Kullanıcı profil tipi
export interface UserProfile {
  ad: string;
  yas: string;
  cinsiyet?: string;
  kilo: string;
  boy: string;
  hedefKilo?: string;
  hedefAdim: string;
  hedefSu: string;
  hedefSpor: string;
  hedefKalori?: string;
  beslenmeHedefi?: 'kilo-ver' | 'kilo-al' | 'koru' | 'kas-kazan';
  aktiviteSeviyesi?: string;
  hedefTarihi?: string;
  haftalikHedefKilo?: string; // kg/hafta
  kronikHastalik?: string;
  alerji?: string;
  ilac?: string;
  notifikasyon?: boolean;
  darkMode?: boolean;
  hatirlaticilar?: Hatirlatici[];
}

// Öğün detay tipi
export interface OgunDetay {
  tamamlandi: boolean;
  kalori?: number;
  protein?: number;
  karbonhidrat?: number;
  yag?: number;
  zaman?: string; // ISO string
  fotograf?: string;
  notlar?: string;
  besinler?: string[];
}

// Günlük aktivite tipi
export interface DailyActivity {
  tarih: string; // YYYY-MM-DD formatında
  spor: {
    tamamlandi: boolean;
    sure?: number; // dakika
  };
  beslenme: {
    kahvalti: OgunDetay;
    ogle: OgunDetay;
    aksam: OgunDetay;
    araOgun: OgunDetay;
  };
  rutin: {
    [rutinId: string]: RutinDetay;
  };
  adimSayisi?: number;
  suMiktari?: number; // ml
  beslenmeSkoru?: number; // 0-100
  gunlukKalori?: number;
  rutinSkoru?: number; // 0-100
}

// Varsayılan değerler
export const defaultUserProfile: UserProfile = {
  ad: '',
  yas: '',
  cinsiyet: '',
  kilo: '',
  boy: '',
  hedefKilo: '',
  hedefAdim: '10000',
  hedefSu: '2000',
  hedefSpor: '90',
  hedefKalori: '2000',
  beslenmeHedefi: 'koru',
  aktiviteSeviyesi: 'orta',
  hedefTarihi: '',
  haftalikHedefKilo: '0.5',
  kronikHastalik: '',
  alerji: '',
  ilac: '',
  notifikasyon: true,
  darkMode: false,
  hatirlaticilar: [],
};

// Besin kategorileri
export interface BesinKategorisi {
  id: string;
  isim: string;
  kalori: number;
  protein: number;
  karbonhidrat: number;
  yag: number;
  kategori: 'protein' | 'karbonhidrat' | 'sebze' | 'meyve' | 'sut' | 'yag';
}

// Rutin detay tipi
export interface RutinDetay {
  tamamlandi: boolean;
  zaman?: string; // ISO string
  sure?: number; // dakika (zamanlayıcı rutinleri için)
  notlar?: string;
  streak?: number; // ardışık gün sayısı
}

// Rutin kategorileri
export interface RutinKategori {
  id: string;
  isim: string;
  icon: string;
  renk: string;
  aciklama: string;
  kategori: 'temel' | 'saglik' | 'mental' | 'fiziksel' | 'sosyal' | 'ozel';
  zamanlayici?: boolean; // Zamanlayıcı gerekiyor mu?
  varsayilanSure?: number; // Varsayılan süre (dakika)
  hedefDeger?: number; // Hedef değer (adım, ml vs.)
  birim?: string; // Birim (adım, ml, dakika vs.)
}

// Rutin şablonu
export interface RutinSablonu {
  id: string;
  isim: string;
  aciklama: string;
  kategori: string;
  rutinler: string[]; // Rutin ID'leri
  icon: string;
  renk: string;
}

// Haftalık rapor tipi
export interface HaftalikRapor {
  hafta: string; // YYYY-WW formatında
  toplamKalori: number;
  ortalamaBeslenmeSkoru: number;
  tamamlananOgunSayisi: number;
  toplamOgunSayisi: number;
  besinDagilimi: {
    protein: number;
    karbonhidrat: number;
    yag: number;
  };
  gunlukDetaylar: {
    [tarih: string]: {
      kalori: number;
      beslenmeSkoru: number;
      tamamlananOgun: number;
    };
  };
}

// Hatırlatıcı tipi
export interface Hatirlatici {
  id: string;
  tip: 'kahvalti' | 'ogle' | 'aksam' | 'araOgun' | 'su';
  saat: string; // HH:MM formatında
  aktif: boolean;
  mesaj: string;
  gunler: boolean[]; // [Pzt, Sal, Çar, Per, Cum, Cmt, Paz]
}

// Hedef takip tipi
export interface HedefTakip {
  baslangicTarihi: string;
  hedefTarihi: string;
  baslangicKilo: number;
  hedefKilo: number;
  mevcutKilo: number;
  haftalikHedef: number; // kg/hafta
  gunlukKaloriHedefi: number;
  ilerleme: {
    [tarih: string]: {
      kilo: number;
      kalori: number;
      beslenmeSkoru: number;
    };
  };
}




