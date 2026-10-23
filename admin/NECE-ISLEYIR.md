# Admin panel — necə işləyir (müştəri üçün qısa izah)

**Qısaca:** saytın `/admin` səhifəsində siz mətni dəyişirsiniz, "Publish" basırsınız,
təxminən 1 dəqiqə sonra dəyişiklik saytda görünür. Kod bilmək lazım deyil.

## Addım-addım
1. Brauzerdə `saytınız.az/admin` açın.
2. **"Login with Turbo"** basın, e-poçt və şifrənizlə girin (şifrəni yalnız siz bilirsiniz).
3. Soldan **Seiten → Startseite** seçin.
4. Mətni dəyişin. Sağ tərəfdə necə görünəcəyini dərhal görürsünüz.
5. Yuxarıda **Publish → Publish now** basın.
6. 1–2 dəqiqə gözləyin, saytı yeniləyin (Ctrl+F5 / Cmd+Shift+R).

## Yeni ürün əlavə etmək
1. Soldan **Produkte → Produktliste** seçin.
2. **"Produkt hinzufügen"** basın, yeni boş kart açılır.
3. Doldurun: ad, kateqoriya, satıcı, qiymət, "yoxlanma tarixi", link,
   istəsəniz şəkil ("Wähle ein Bild" → kompüterdən yükləyin) və qısa təsvir.
4. **Veröffentlichen → Jetzt veröffentlichen**. 1–2 dəqiqəyə ürün saytda görünür.
- Ürünü silmək: kartın sağ üstündəki **×**.
- Sıranı dəyişmək: kartı yuxarıdakı ≡ işarəsindən tutub sürüşdürün.
- "Köhnə qiymət" (üstündən xətt çəkilən) yalnız satıcının saytında həqiqətən varsa yazılır.

## Arxada nə olur
- Saytın bütün faylları GitHub-da saxlanır (GitHub = kodun "seyfi").
- "Publish" basanda panel həmin seyfə yeni versiya yazır.
- GitHub Pages yeni versiyanı görür və saytı avtomatik yeniləyir.
- Hər dəyişiklik tarixçədə qalır — səhv olsa, köhnə versiyaya qaytarmaq olur.

## Təhlükəsizlik
- Giriş Decap Turbo hesabı ilə olur. Sizə GitHub hesabı lazım deyil.
- Saytın kodunda heç bir şifrə və ya açar saxlanmır.
- Kimin girə biləcəyini sayt sahibi Turbo panelindən idarə edir (dəvət göndərir / silir).
- Panel yalnız icazə verilən sahələri göstərir; saytın dizaynını təsadüfən sındırmaq olmur.

## Xərc
- Decap CMS pulsuzdur (açıq mənbə).
- Decap Turbo pulsuz planı: 1 sayt, 1 istifadəçi. Daha çox istifadəçi lazım olsa — ödənişli plan.
- GitHub Pages hostinqi pulsuzdur.
