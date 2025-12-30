# Google Play Console Güncelleme Rehberi

## 🚀 Adım Adım Güncelleme Süreci

### 1. Yeni Build Oluşturma

```bash
# Terminal'de proje klasöründe:
eas build --platform android --profile production
```

**Beklenen Süre:** 10-15 dakika  
**Sonuç:** AAB dosyası EAS Dashboard'da hazır olacak

### 2. Google Play Console'a Giriş

1. [Google Play Console](https://play.google.com/console) adresine git
2. "Sağlıklı Yaşam Koçu" uygulamanı seç
3. Sol menüden **"Release" > "Production"** seç

### 3. Yeni Sürüm Oluşturma

1. **"Create new release"** butonuna tıkla
2. **"Upload"** butonuna tıkla
3. EAS Dashboard'dan indirdiğin AAB dosyasını yükle
4. Yükleme tamamlanana kadar bekle

### 4. Sürüm Notları Ekleme

**Türkçe Sürüm Notları (Kullanıcılar için):**

```
🎉 Yeni Özellikler:

📋 Rutin Yönetimi
• 12 farklı rutin şablonu eklendi (Sabah, Akşam, Fitness, Mental Sağlık vb.)
• Kendi özel rutinlerinizi oluşturabilirsiniz
• Zamanlayıcı desteği ile meditasyon ve okuma rutinleri

🍽️ Beslenme Sistemi
• Menü değiştirme artık gerçekten çalışıyor!
• Zayıflama ve kilo alma için alternatif menüler
• Seçtiğiniz menü anında ana sayfada görünür

🏃‍♂️ Gerçek Adım Sayacı
• Artık gerçek telefon sensörleri kullanılıyor
• Doğru adım takibi

📚 Kitap Okuma Rutini
• Günlük okuma alışkanlığı için yeni rutin

🔧 İyileştirmeler:
• Daha hızlı ve stabil performans
• Verileriniz artık kalıcı olarak saklanıyor
• Kullanıcı arayüzü iyileştirmeleri
```

### 5. Kontrol ve Onay

1. **"Review release"** butonuna tıkla
2. Tüm bilgileri kontrol et:
   - ✅ Version: 1.1.0 (2)
   - ✅ AAB dosyası yüklendi
   - ✅ Sürüm notları eklendi
3. **"Start rollout to production"** tıkla

### 6. Yayınlama Seçenekleri

**Seçenek 1: Kademeli Yayın (Önerilen)**
- %20 kullanıcıya başla
- Sorun yoksa %50'ye çıkar
- Son olarak %100'e çıkar

**Seçenek 2: Tam Yayın**
- Direkt %100 kullanıcıya yayınla
- Daha riskli ama hızlı

### 7. Yayın Sonrası Takip

**İlk 24 Saat:**
- Crash raporlarını kontrol et
- Kullanıcı yorumlarını takip et
- Download/install oranlarını izle

**İlk Hafta:**
- Rating değişimlerini gözlemle
- Performans metriklerini kontrol et
- Geri bildirimler için hazır ol

## 📊 Beklenen Sonuçlar

### Pozitif Etkiler:
- ⬆️ Kullanıcı engagement artışı
- ⬆️ App rating iyileşmesi  
- ⬆️ Retention oranı artışı
- ⬇️ Crash oranı azalması

### Takip Edilecek Metrikler:
- Daily Active Users (DAU)
- Session duration
- Feature usage rates
- User retention (1-day, 7-day, 30-day)

## 🚨 Acil Durum Planı

### Kritik Bug Durumunda:
1. Google Play Console'dan "Halt rollout" seç
2. Sorunu hızlıca düzelt
3. Hotfix build oluştur (v1.1.1)
4. Yeni versiyonu yayınla

### Rollback Gerekirse:
1. "Halt rollout" tıkla
2. Önceki stabil versiyona dön
3. Kullanıcılara açıklama yap

## ✅ Checklist

**Build Öncesi:**
- [ ] Tüm özellikler test edildi
- [ ] Version numaraları güncellendi
- [ ] Firebase bağlantısı çalışıyor
- [ ] Bildirimler test edildi

**Yayın Öncesi:**
- [ ] AAB dosyası yüklendi
- [ ] Sürüm notları eklendi
- [ ] Screenshots güncellendi (isteğe bağlı)
- [ ] Store listing kontrol edildi

**Yayın Sonrası:**
- [ ] İlk 2 saat crash takibi
- [ ] Kullanıcı yorumlarına yanıt
- [ ] Sosyal medya duyurusu
- [ ] Ekip bilgilendirmesi

---

**Tahmini Süreç Süresi:** 2-4 saat (Google review dahil)  
**Kullanıcılara Ulaşma:** 24-48 saat içinde  

Bu güncelleme ile uygulamanız çok daha güçlü ve kullanıcı dostu olacak! 🎉