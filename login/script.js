/**
 * script.js — Login Formu İş Mantığı
 * ─────────────────────────────────────────────────────────────
 * Bu dosya şunları yönetir:
 *   1. Sayfa yüklendiğinde demo kullanıcının LocalStorage'a eklenmesi
 *   2. Zaten oturum açıksa dashboard'a yönlendirme
 *   3. Gerçek zamanlı (blur) ve gönderim anında form doğrulama
 *   4. E-posta format kontrolü (regex)
 *   5. Şifre uzunluk kontrolü (minimum 6 karakter)
 *   6. LocalStorage'dan kullanıcı kimlik doğrulaması
 *   7. Başarılı girişte dashboard.html'e yönlendirme
 *   8. Şifreyi göster / gizle özelliği
 *   9. Enter tuşu ile form gönderme
 * ─────────────────────────────────────────────────────────────
 */

// ─── DEMO KULLANICI BİLGİLERİ ───────────────────────────────
// Gerçek bir uygulamada bu bilgiler sunucu tarafında doğrulanır.
// Burada LocalStorage üzerinde basit bir simülasyon yapıyoruz.
const DEMO_USER = {
  email: "demo@example.com",
  password: "demo123",
};

// ─── DOM REFERANSLARI ────────────────────────────────────────
const loginForm      = document.getElementById("loginForm");
const emailInput     = document.getElementById("email");
const passwordInput  = document.getElementById("password");
const emailGroup     = document.getElementById("emailGroup");
const passwordGroup  = document.getElementById("passwordGroup");
const emailError     = document.getElementById("emailError");
const passwordError  = document.getElementById("passwordError");
const generalError   = document.getElementById("generalError");
const generalErrorText = document.getElementById("generalErrorText");
const successMessage = document.getElementById("successMessage");
const submitBtn      = document.getElementById("submitBtn");
const togglePassword = document.getElementById("togglePassword");

// ─── BAŞLANGIÇ: DEMO KULLANICIYI LOCALSTORAGE'A KAYDET ───────
/**
 * Uygulama ilk açıldığında "users" anahtarı yoksa demo hesabı oluştur.
 * Böylece her açılışta üzerine yazılmaz.
 */
function initializeStorage() {
  const existingUsers = localStorage.getItem("users");

  if (!existingUsers) {
    // Demo kullanıcıyı bir dizi içinde saklıyoruz; ileride kayıt formu eklenirse
    // yeni kullanıcılar da bu diziye eklenebilir.
    const users = [DEMO_USER];
    localStorage.setItem("users", JSON.stringify(users));
    console.log("Demo kullanıcı LocalStorage'a eklendi.");
  }
}

// ─── YARDIMCI: E-POSTA FORMATI KONTROLÜ ─────────────────────
/**
 * Basit bir e-posta regex kontrolü.
 * Örn: "kullanici@alan.uzanti" formatını doğrular.
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {boolean} Geçerli mi?
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ─── YARDIMCI: HATA GÖSTER ───────────────────────────────────
/**
 * Belirtilen form grubuna hata sınıfı ekler ve hata metnini ayarlar.
 * @param {HTMLElement} group  - Form grubu elementi (.form__group)
 * @param {HTMLElement} span   - Hata mesajı span elementi
 * @param {string}      message - Gösterilecek hata metni
 */
function showFieldError(group, span, message) {
  group.classList.add("has-error");
  span.textContent = message;
}

// ─── YARDIMCI: HATA TEMİZLE ──────────────────────────────────
/**
 * Belirtilen form grubundaki hata sınıfını ve metni temizler.
 * @param {HTMLElement} group - Form grubu elementi
 * @param {HTMLElement} span  - Hata mesajı span elementi
 */
function clearFieldError(group, span) {
  group.classList.remove("has-error");
  span.textContent = "";
}

// ─── YARDIMCI: GENEL HATA GÖSTER / GİZLE ────────────────────
/**
 * Formun altındaki genel hata kutusunu gösterir ya da gizler.
 * @param {string|null} message - Mesaj metni; null ise kutyu gizlenir
 */
function setGeneralError(message) {
  if (message) {
    generalErrorText.textContent = message;
    generalError.classList.add("is-visible");
  } else {
    generalError.classList.remove("is-visible");
    generalErrorText.textContent = "";
  }
}

// ─── ALAN DOĞRULAMA FONKSİYONLARI ────────────────────────────

/**
 * E-posta alanını doğrular.
 * @returns {boolean} Geçerli mi?
 */
function validateEmail() {
  const value = emailInput.value.trim();

  if (!value) {
    showFieldError(emailGroup, emailError, "E-posta adresi boş bırakılamaz.");
    return false;
  }

  if (!isValidEmail(value)) {
    showFieldError(emailGroup, emailError, "Lütfen geçerli bir e-posta adresi girin.");
    return false;
  }

  clearFieldError(emailGroup, emailError);
  return true;
}

/**
 * Şifre alanını doğrular.
 * @returns {boolean} Geçerli mi?
 */
function validatePassword() {
  const value = passwordInput.value;

  if (!value) {
    showFieldError(passwordGroup, passwordError, "Şifre boş bırakılamaz.");
    return false;
  }

  if (value.length < 6) {
    showFieldError(passwordGroup, passwordError, "Şifre en az 6 karakter olmalıdır.");
    return false;
  }

  clearFieldError(passwordGroup, passwordError);
  return true;
}

// ─── GİRİŞ DOĞRULAMA (LocalStorage) ─────────────────────────
/**
 * Girilen bilgileri LocalStorage'daki kullanıcı listesiyle karşılaştırır.
 * @param {string} email    - Kullanıcının girdiği e-posta
 * @param {string} password - Kullanıcının girdiği şifre
 * @returns {boolean} Eşleşme var mı?
 */
function authenticateUser(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Kullanıcılar arasında e-posta ve şifre eşleşmesi ara
  return users.some(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );
}

// ─── BAŞARI AKIŞI ─────────────────────────────────────────────
/**
 * Başarılı giriş sonrası yapılacaklar:
 *  - Oturum bilgisini localStorage'a yaz
 *  - Kısa süre başarı mesajı göster
 *  - dashboard.html'e yönlendir
 */
function handleLoginSuccess(email) {
  // Oturum bilgisini localStorage'a yaz — sekme kapansa bile oturum devam eder.
  // Logout sırasında bu key silinir.
  localStorage.setItem("loggedInUser", email);

  // Formu gizle, başarı mesajını göster
  loginForm.style.display = "none";
  successMessage.classList.add("is-visible");

  console.log(`Kullanıcı giriş yaptı: ${email}`);

  // Kısa bir süre sonra dashboard sayfasına yönlendir
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1200);
}

// ─── ZATEN GİRİŞ YAPILDIYSA YÖNLENDİR ────────────────────────
// Kullanıcı login sayfasını açtığında oturum hâlâ geçerliyse
// tekrar giriş formunu göstermek yerine direkt dashboard'a gönder.
function redirectIfLoggedIn() {
  if (localStorage.getItem("loggedInUser")) {
    window.location.href = "dashboard.html";
  }
}

// ─── FORM GÖNDERİM OLAYINI YÖNET ─────────────────────────────
/**
 * Form submit olayı tetiklendiğinde çalışır.
 * Doğrulama → kimlik doğrulama → geri bildirim akışını yönetir.
 */
async function handleFormSubmit(event) {
  // Sayfanın yenilenmesini engelle
  event.preventDefault();

  // Önceki genel hatayı temizle
  setGeneralError(null);

  // Her iki alanı da doğrula
  const isEmailValid    = validateEmail();
  const isPasswordValid = validatePassword();

  // Herhangi bir alan geçersizse işlemi durdur
  if (!isEmailValid || !isPasswordValid) return;

  // ── Yükleme durumu: butonu devre dışı bırak ──
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  // Gerçek dünya senaryosunu simüle etmek için kısa bir gecikme ekle
  // (API isteği gibi davranması için)
  await new Promise((resolve) => setTimeout(resolve, 900));

  const email    = emailInput.value.trim();
  const password = passwordInput.value;

  // ── Kimlik doğrulaması ──
  const isAuthenticated = authenticateUser(email, password);

  // Yükleme durumunu kaldır
  submitBtn.classList.remove("loading");
  submitBtn.disabled = false;

  if (isAuthenticated) {
    handleLoginSuccess(email);
  } else {
    // E-posta kayıtlıysa ama şifre yanlışsa daha spesifik bir mesaj verebiliriz.
    // Güvenlik açısından genelde tek bir genel mesaj tercih edilir.
    setGeneralError(
      "E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin."
    );
  }
}

// ─── ŞİFREYİ GÖSTER / GİZLE ──────────────────────────────────
/**
 * "Göz" ikonuna tıklandığında şifre input'unun tipini değiştirir.
 */
function handleTogglePassword() {
  const isPassword = passwordInput.type === "password";

  // Input tipini değiştir
  passwordInput.type = isPassword ? "text" : "password";

  // SVG ikonunu güncelle (göz açık ↔ çizgili göz)
  const eyeIcon = document.getElementById("eyeIcon");
  eyeIcon.innerHTML = isPassword
    ? // Göz kapalı ikonu (şifre görünür halde)
      `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : // Göz açık ikonu (şifre gizli halde)
      `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>`;
}

// ─── BLUR OLAYLARI: GERÇEK ZAMANLI DOĞRULAMA ─────────────────
// Kullanıcı alandan çıktığında anlık doğrulama yapılır.
// Bu, UX açısından submit beklemeden erken geri bildirim sağlar.
emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

// Kullanıcı yazmaya başlayınca hata kutusunu temizle (genel hata için)
emailInput.addEventListener("input", () => {
  if (generalError.classList.contains("is-visible")) {
    setGeneralError(null);
  }
  if (emailGroup.classList.contains("has-error")) {
    clearFieldError(emailGroup, emailError);
  }
});

passwordInput.addEventListener("input", () => {
  if (generalError.classList.contains("is-visible")) {
    setGeneralError(null);
  }
  if (passwordGroup.classList.contains("has-error")) {
    clearFieldError(passwordGroup, passwordError);
  }
});

// ─── ANA OLAY DİNLEYİCİLERİ ──────────────────────────────────
loginForm.addEventListener("submit", handleFormSubmit);
togglePassword.addEventListener("click", handleTogglePassword);

// Enter tuşu formu otomatik olarak submit eder çünkü
// input[type="text/password"] içindeyken Enter'a basmak
// form submit'i tetikler — ek bir dinleyici gerekmez.
// Yine de erişilebilirlik için Keydown dinleyicisi ekleyebiliriz:
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    // Eğer odak formdaki bir input'taysa zaten submit tetiklenecek.
    // Bu blok sadece odak dışarıdaysa devreye girer.
    const active = document.activeElement;
    const isInsideForm = loginForm.contains(active);
    if (!isInsideForm) {
      loginForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  }
});

// ─── UYGULAMA BAŞLANGICI ──────────────────────────────────────
initializeStorage();     // Demo kullanıcıyı hazırla
redirectIfLoggedIn();    // Zaten giriş yapıldıysa dashboard'a geç
