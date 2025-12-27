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

## Güncelleme Yayınlama

```bash
# Version'ı artır (app.json)
# "version": "1.0.1"
# "versionCode": 2

# Yeni build oluştur
eas build --platform android --profile production

# Google Play'e yükle
eas submit --platform android
```

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