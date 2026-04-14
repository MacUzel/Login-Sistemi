# MiniApp — Login + Dashboard (Vanilla JS)

Saf HTML, CSS ve JavaScript ile yapılmış küçük bir web uygulaması. Login sistemiyle başladı, zamanla dashboard ekleyerek To-Do listesi ve not alma özelliklerine kavuştu. Herhangi bir framework kullanılmadı.

---

## Önizleme

> `index.html` dosyasını tarayıcıda açmak yeterli — kurulum gerekmez.

Demo hesap bilgileri:
- **E-posta:** `demo@example.com`
- **Şifre:** `demo123`

---

## Özellikler

**Login Sayfası (`index.html`)**
- E-posta ve şifre doğrulaması (boş alan, format, minimum uzunluk)
- Şifreyi göster / gizle butonu
- Giriş başarılıysa otomatik dashboard yönlendirmesi
- Zaten oturum açıksa direk dashboard'a geçer

**Dashboard (`dashboard.html`)**
- Oturum kontrolü — login yapılmadan açılmaya çalışılırsa giriş sayfasına döner
- Üstte hoş geldin mesajı ve çıkış butonu
- İki panel yan yana: To-Do Listesi ve Notlar

**To-Do Listesi**
- Görev ekleme (buton veya Enter tuşu)
- Checkbox ile tamamlandı işaretleme
- Görev silme
- Tamamlanan / toplam sayacı
- Veriler localStorage'da tutulur

**Not Alma**
- Başlık (isteğe bağlı) + içerik ile not ekleme
- Kart görünümü, tarih etiketi
- Not silme
- Ctrl+Enter ile hızlı ekleme

---

## Proje Yapısı

```
mini-app/
├── index.html      → Login sayfası
├── dashboard.html  → Dashboard (Todo + Notlar)
├── style.css       → Login ve ortak stiller
├── dashboard.css   → Dashboard'a özel stiller
├── script.js       → Login mantığı
├── dashboard.js    → Dashboard, todo, notlar mantığı
└── README.md       → Bu dosya
```

---

## 🛠 Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| HTML5     | Sayfa yapısı |
| CSS3     | Stiller, animasyonlar, responsive layout |
| JavaScript (Vanilla) | Tüm uygulama mantığı |
| LocalStorage | Kullanıcı verilerini tarayıcıda saklama |

---

## Kurulum & Çalıştırma

1. Repoyu klonla:
   ```bash
   git clone https://github.com/kullanici-adin/mini-app.git
   cd mini-app
   ```

2. `index.html` dosyasını tarayıcıda aç (VS Code Live Server da çalışır).

3. Demo hesapla giriş yap: `demo@example.com` / `demo123`

Sunucu, build aracı ya da kurulum gerektirmiyor.

---

## Uygulama Akışı

```
index.html (Login)
    │
    ├─ Başarısız → Hata mesajı göster
    │
    └─ Başarılı → localStorage'a oturum yaz → dashboard.html'e yönlendir

dashboard.html
    │
    ├─ Sayfa açılınca: oturum var mı? → yok → index.html'e geri dön
    │
    ├─ Todo: Ekle / Tamamla / Sil → localStorage'da güncelle → yeniden render
    │
    ├─ Notlar: Ekle / Sil → localStorage'da güncelle → yeniden render
    │
    └─ Logout → localStorage'dan oturumu sil → index.html
```

---

## Bu Projede Öğrendiklerim

Projeyi geliştirirken birkaç şeyi daha iyi anladım:

**Auth guard mantığını** uygulamak düşündüğümden daha öğreticiydi. Tek bir `if` kontrolüyle sayfa yüklenince "bu kişi giriş yapmış mı?" sorusunu sormak ve cevaba göre yönlendirme yapmak, gerçek uygulamaların temelinde bu olduğunu gösterdi.

**`localStorage` ile state yönetimi** ilginç bir denge. Her ekleme/silmede önce veriyi güncelle, sonra kaydet, sonra render et sırası yerleşince kod daha okunabilir oldu. Dağınık olduğunda hata bulmak çok zorlaşıyor.

**XSS önlemi** için `escapeHtml` fonksiyonu yazdım. Kullanıcı girdisini `innerHTML`'e doğrudan koyarsan ne olabileceğini araştırınca bu küçük fonksiyonun neden gerekli olduğunu anladım.

**CSS ayrımı** da dikkat gerektirdi — login ve dashboard için ayrı dosya tutmak başta gereksiz gibi geldi ama ilerledikçe ne kadar temiz durduğunu gördüm.

---

## Geliştirilebilecek Yönler

- Kayıt (register) formu eklenebilir
- Notlara düzenleme özelliği eklenebilir
- Todo'lara öncelik veya tarih bilgisi eklenebilir
- Gerçek bir backend ile (Node.js + Express + veritabanı) entegre edilebilir
- Şifreler sunucu tarafında hash'lenebilir (bcrypt vb.)
