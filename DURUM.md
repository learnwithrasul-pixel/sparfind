# SPARFIND — durum

> Yeni bir Claude oturumu açtığında ilk iş: **"sparfind/DURUM.md oku"** de.
> Böylece eski konuşmayı taşımadan devam ederiz — asıl para/limit tasarrufu burada.

## Ne bu site
sparfind.de — sadece affiliate. Ürün satmıyoruz, satıcıya yönlendiriyoruz,
komisyon alıyoruz. Stok, kargo, iade yok. mr7even.shop'tan tamamen ayrı.

- Canlı: https://sparfind.de (HTTPS aktif)
- Depo: `learnwithrasul-pixel/sparfind`, GitHub Pages, dal `main`
- Yerel klasör: `C:\Users\RasulA\sparfind`
- Deploy anahtarı: `~/.ssh/sparfind_github`
- Alan adı Strato'da, DNS Strato'da, hosting GitHub'da (Strato hostingi kullanılmıyor)

## Ürün eklemek — Claude'a gerek yok
1. `neue-produkte.txt` içine blokları yaz (dosyanın başında örnek var)
2. Resim varsa `bilder\` klasörüne at
3. `YAYINLA.bat` çift tıkla

Script hatalı veriyi reddeder ve **hiçbir şeye dokunmaz**; ne eksik olduğunu satır satır söyler.
Ürün çıkarmak: `node tools/remove-deal.js --liste` sonra `node tools/remove-deal.js <id>`

## Mimari — bilinmesi gereken tek kural
`deals.js` tek veri kaynağı. `index.html` sadece ondan çizer.
`DEALS:START` / `DEALS:END` arası **script yazar, elle değiştirme.**

Link alanları ayrı, çünkü hangi kartın para kazandığı tahminle bilinemez:
- `url` → normal ürün linki, çalışır ama komisyon yok
- `affUrl` → partner linki, komisyon var
- Site `affUrl` varsa onu kullanır, yoksa `url` — yani hiç bozulmaz

Dürüstlük kuralları (koda gömülü, gevşetme):
- `statt` (üstü çizili fiyat) sadece satıcıda gerçekten varsa. Uydurma indirim yok.
- Fiyat 3 günden eskiyse kart "Preis kann abweichen" yazar
- Sahte geri sayım, sahte stok baskısı yok
- Her kartta "Anzeige" etiketi, `rel="sponsored nofollow"`

## Açık işler
- [ ] AliExpress: **sunucuya CAPTCHA çıkıyor**, scraping yok. Aşmaya çalışmıyoruz.
      Doğru yol Portals API (AppKey + AppSecret + Tracking ID gerekli).
      O gelene kadar ürünler elle giriliyor.
- [ ] Amazon PartnerNet başvurusu (Almanya'da dönüşüm en yüksek)
- [ ] Impressum'daki `hr.ahmadov@mail.ru` yerine `kontakt@sparfind.de`
- [ ] Strato hostingi iptal mi (Widerruf ~20.09.2026) — karar verilmedi
- [ ] Commerce OS'in `deals.js`'i otomatik güncellemesi (API geldikten sonra)

## Yapılmayacaklar
- CAPTCHA çözmek / bot korumasını atlatmak — affiliate hesabı riske girer
- Uydurma takip kimliği koymak — link tracking yapmaz, komisyon kaybolur
- Fiyatı iki yere yazmak (mr7even.shop'ta bu hata 20€/satış kaybettirmişti)
