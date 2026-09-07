# SPARFIND Sammler — Chrome eklentisi kurulumu

Bir kere yapılır, sonra unutulur.

## Kurulum

1. Chrome'da adres çubuğuna yaz: `chrome://extensions`
2. Sağ üstte **"Geliştirici modu" / "Developer mode"** anahtarını aç
3. Sol üstte **"Paketlenmemiş öğe yükle" / "Load unpacked"** düğmesine bas
4. Şu klasörü seç: `C:\Users\RasulA\sparfind\extension`

Bitti. Chrome'u kapatıp açsan da kalır.

## Kullanım

1. Temu / AliExpress / Amazon.de'de bir **ürün sayfası** aç
2. Sağ altta turuncu **"✦ SPARFIND'e ekle"** düğmesi çıkar, bas
3. Pencere açılır — başlık, fiyat, resim sayfadan okunmuş olur
   - Bulamadığı alanlar turuncu çerçeveli olur, onları sen doldur
   - **Resim doğru değilse** `‹ önceki / sonraki ›` ile başka resim seç.
     Temu bazen ürün yerine reklam afişi koyuyor, ona dikkat et.
4. **Kaydet**. Ürün `Downloads\sparfind\` klasörüne düşer.
5. İstediğin kadar ürün topla — 5, 20, 50 fark etmez.
6. Bitirince `C:\Users\RasulA\sparfind\YAYINLA.bat` çift tıkla. Hepsi siteye gider.

## Bilmen gerekenler

**Kategori tahmini yanılabilir.** Başlıktaki kelimelere bakıyor. Yanlışsa listeden değiştir.

**Fiyatı bulamayabilir.** Temu ve AliExpress sınıf isimlerini her sürümde değiştiriyor.
Alan boş kalırsa elle yaz — 3 saniye. Yanlış fiyat yazmaktansa boş bırakmayı seçtim.

**Üstü çizili fiyatı sadece sayfada gerçekten varsa alır.** Uydurmaz.
Almanya'da sahte indirim `irreführende Werbung` sayılıyor, Abmahnung mektubu geliyor.

**Bir ürünü ikinci kez kaydedersen** eskisinin üstüne yazar, kopya oluşmaz.
Fiyat güncellemek için birebir bu yöntemi kullan.

## Bozulursa

Temu tasarımını değiştirirse fiyat/resim okuma bozulabilir — düğme ve kaydetme
yine çalışır, sadece alanlar boş gelir. O zaman bana söyle, seçicileri
`extension/content.js` içinde güncellerim. Eklentiyi güncelledikten sonra
`chrome://extensions` sayfasında yenile (↻) düğmesine basman yeterli.
