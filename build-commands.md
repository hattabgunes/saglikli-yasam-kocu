# Build ve Deploy Komutları

## Gereksinimler

```bash
# EAS CLI kurulumu
npm install -g @expo/eas-cli

# EAS'a giriş yap
eas login
```

## Development Build

```bash
# Development APK oluştur
eas build --platform android --profile development

# Development için cihaza yükle
eas build --platform android --profile development --local
```

## Preview Build (Test)

```bash
# Preview APK oluştur (internal test için)
eas build --platform android --profile preview

# APK'yı indir ve test et
eas build:list
```

## Production Build

```bash
# Production AAB oluştur (Google Play için)
eas build --platform android --profile production

# Build durumunu kontrol et
eas build:list
```

## Google Play Store'a Yükleme

### 1. Manuel Yükleme
1. EAS Dashboard'dan AAB dosyasını indir
2. Google Play Console'a git
3. "App bundles and APKs" bölümüne yükle
4. Internal testing'e yayınla

### 2. Otomatik Yükleme (EAS Submit)
```bash
# Google Service Account JSON dosyası gerekli
eas submit --platform android
```

## Hata Çözümü Sonrası Build (v1.1.0)

```bash
# 1. ÖNCE TEMİZLİK YAP
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. YENİDEN YÜKLE
npm install

# 3. EXPO CACHE TEMİZLE
npx expo start --clear
# Ctrl+C ile çık

# 4. EAS CACHE TEMİZLEYEREK BUILD
eas build --platform android --profile production --clear-cache
```

## Yapılan Düzeltmeler:
- ✅ React 19 → React 18.3.1 (stable)
- ✅ Expo SDK 53 → 52.0.14 (stable)
- ✅ Firebase 12.7 → 10.13.2 (stable)
- ✅ React Native 0.79 → 0.76.3 (stable)
- ✅ newArchEnabled: false (uyumluluk için)
- ✅ targetSdkVersion: 33 (daha stable)
- ✅ Gereksiz permissions kaldırıldı
- ✅ TypeScript ve ESLint stable versiyonlar

## Önemli Notlar

1. **Google Service Account:** Google Play Console'dan service account JSON dosyası oluştur
2. **Signing Key:** EAS otomatik olarak signing key oluşturur
3. **App Bundle:** Google Play için AAB formatı kullan
4. **Testing:** Internal testing ile önce test et
5. **Review:** Google Play review süreci 1-3 gün sürebilir

## Hata Çözümleri

### Build Hatası
```bash
# Cache temizle
eas build --platform android --clear-cache

# Local build dene
eas build --platform android --local
```

### Signing Hatası
```bash
# Credentials'ları sıfırla
eas credentials

# Yeni keystore oluştur
eas credentials --platform android
```

## Test Checklist

- [ ] Tüm sayfalar çalışıyor
- [ ] Firebase bağlantısı aktif
- [ ] Bildirimler çalışıyor
- [ ] Kayıt/Giriş sistemi çalışıyor
- [ ] Veri kaydetme/yükleme çalışıyor
- [ ] Çıkış yap çalışıyor
- [ ] Tema değiştirme çalışıyor
- [ ] Responsive tasarım uygun
- [ ] Performans kabul edilebilir