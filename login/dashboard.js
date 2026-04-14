/**
 * dashboard.js — Dashboard İş Mantığı
 * ─────────────────────────────────────────────────────────────
 * Bu dosya üç ana konuyu yönetir:
 *   1. Kimlik doğrulama koruyucusu (auth guard)
 *      → Giriş yapılmamışsa login sayfasına yönlendir
 *   2. To-Do Listesi
 *      → Ekleme, silme, tamamlandı olarak işaretleme
 *      → Veriler localStorage'da saklanır
 *   3. Not Alma
 *      → Not ekleme, silme, kart görünümü
 *      → Veriler localStorage'da saklanır
 * ─────────────────────────────────────────────────────────────
 */

// ─── KİMLİK DOĞRULAMA KORUYUCUSU ─────────────────────────────
// Bu sayfa açıldığında ilk iş olarak oturum kontrolü yapılır.
// Eğer kullanıcı login yapmamışsa login sayfasına gönderilir.
const currentUser = localStorage.getItem("loggedInUser");

if (!currentUser) {
  // Oturum yok → giriş sayfasına yönlendir
  window.location.href = "index.html";
}

// ─── DOM REFERANSLARI ─────────────────────────────────────────
const userEmailEl    = document.getElementById("userEmail");
const logoutBtn      = document.getElementById("logoutBtn");

// Todo elemanları
const todoInput      = document.getElementById("todoInput");
const todoAddBtn     = document.getElementById("todoAddBtn");
const todoList       = document.getElementById("todoList");
const todoEmpty      = document.getElementById("todoEmpty");
const todoBadge      = document.getElementById("todoBadge");

// Not elemanları
const noteTitleInput   = document.getElementById("noteTitleInput");
const noteContentInput = document.getElementById("noteContentInput");
const noteAddBtn       = document.getElementById("noteAddBtn");
const notesGrid        = document.getElementById("notesGrid");
const notesEmpty       = document.getElementById("notesEmpty");
const notesBadge       = document.getElementById("notesBadge");

// ─── KULLANICI E-POSTASINI GÖSTER ─────────────────────────────
// Header'daki "Hoş geldin" yazısının yanına e-postayı yaz
userEmailEl.textContent = currentUser;

// ─── LOCALSTORAGE ANAHTARLARI ─────────────────────────────────
// Her kullanıcı için ayrı anahtar; ileride birden fazla kullanıcı
// desteklense bile veriler karışmaz.
const TODO_KEY  = `todos_${currentUser}`;
const NOTES_KEY = `notes_${currentUser}`;

// ─────────────────────────────────────────────────────────────
// ═══ TO-DO LİSTESİ ═══════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/** LocalStorage'dan todo dizisini okur. */
function getTodos() {
  return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
}

/** Güncel todo dizisini LocalStorage'a yazar. */
function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

/**
 * Todo listesini ekrana çizer.
 * Her seferinde listeyi temizleyip yeniden render eder.
 */
function renderTodos() {
  const todos = getTodos();

  // Listeyi temizle
  todoList.innerHTML = "";

  if (todos.length === 0) {
    // Görev yok → boş durum mesajını göster
    todoEmpty.classList.remove("hidden");
  } else {
    todoEmpty.classList.add("hidden");

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `todo-item${todo.completed ? " completed" : ""}`;
      li.dataset.id = todo.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? "checked" : ""}
          title="Tamamlandı olarak işaretle"
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="btn-delete" title="Görevi sil">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      `;

      // Checkbox: tamamlandı geçişi
      li.querySelector(".todo-checkbox").addEventListener("change", () => {
        toggleTodo(todo.id);
      });

      // Sil butonu
      li.querySelector(".btn-delete").addEventListener("click", () => {
        deleteTodo(todo.id);
      });

      todoList.appendChild(li);
    });
  }

  // Rozeti güncelle: "2 / 5" gibi tamamlanan / toplam
  const completed = todos.filter((t) => t.completed).length;
  todoBadge.textContent = `${completed} / ${todos.length}`;
}

/**
 * Yeni görev ekler.
 * Input boşsa sessizce döner (uyarı vermek yerine placeholder yeterli).
 */
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    todoInput.placeholder = "Önce bir şeyler yaz 👆";
    setTimeout(() => (todoInput.placeholder = "Yeni bir görev yaz..."), 2000);
    return;
  }

  const todos = getTodos();
  todos.unshift({
    id: Date.now(),          // Benzersiz ID için timestamp kullanıyoruz
    text,
    completed: false,
  });

  saveTodos(todos);
  renderTodos();

  // Input'u temizle ve odağı geri ver
  todoInput.value = "";
  todoInput.focus();
}

/**
 * Görevin tamamlandı / tamamlanmadı durumunu değiştirir.
 * @param {number} id - Todo ID'si
 */
function toggleTodo(id) {
  const todos = getTodos().map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos(todos);
  renderTodos();
}

/**
 * Görevi listeden siler.
 * @param {number} id - Todo ID'si
 */
function deleteTodo(id) {
  const todos = getTodos().filter((t) => t.id !== id);
  saveTodos(todos);
  renderTodos();
}

// ─────────────────────────────────────────────────────────────
// ═══ NOT ALMA ════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/** LocalStorage'dan not dizisini okur. */
function getNotes() {
  return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
}

/** Güncel not dizisini LocalStorage'a yazar. */
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

/**
 * Notları ekrana kart olarak çizer.
 */
function renderNotes() {
  const notes = getNotes();

  notesGrid.innerHTML = "";

  if (notes.length === 0) {
    notesEmpty.classList.remove("hidden");
  } else {
    notesEmpty.classList.add("hidden");

    notes.forEach((note) => {
      const card = document.createElement("div");
      card.className = "note-card";
      card.dataset.id = note.id;

      // Başlık varsa göster, yoksa içeriğin ilk satırını küçültülmüş göster
      const titleHtml = note.title
        ? `<span class="note-card__title">${escapeHtml(note.title)}</span>`
        : "";

      card.innerHTML = `
        <div class="note-card__header">
          ${titleHtml}
          <button class="btn-delete" title="Notu sil" style="margin-left:auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
        <p class="note-card__content">${escapeHtml(note.content)}</p>
        <p class="note-card__date">${note.date}</p>
      `;

      card.querySelector(".btn-delete").addEventListener("click", () => {
        deleteNote(note.id);
      });

      notesGrid.appendChild(card);
    });
  }

  // Rozeti güncelle
  notesBadge.textContent = `${notes.length} not`;
}

/**
 * Yeni not ekler.
 * İçerik boşsa not eklenmez.
 */
function addNote() {
  const title   = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();

  if (!content) {
    noteContentInput.focus();
    noteContentInput.placeholder = "İçerik boş olamaz 👆";
    setTimeout(
      () => (noteContentInput.placeholder = "Not içeriğini buraya yaz..."),
      2000
    );
    return;
  }

  const notes = getNotes();

  // Tarihi "GG.AA.YYYY" formatında oluştur
  const today = new Date();
  const dateStr = today.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  notes.unshift({
    id: Date.now(),
    title,
    content,
    date: dateStr,
  });

  saveNotes(notes);
  renderNotes();

  // Formu temizle
  noteTitleInput.value   = "";
  noteContentInput.value = "";
  noteTitleInput.focus();
}

/**
 * Notu siler.
 * @param {number} id - Not ID'si
 */
function deleteNote(id) {
  const notes = getNotes().filter((n) => n.id !== id);
  saveNotes(notes);
  renderNotes();
}

// ─────────────────────────────────────────────────────────────
// ═══ YARDIMCILAR ═════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * XSS (Cross-Site Scripting) saldırılarına karşı basit önlem.
 * Kullanıcıdan gelen metni HTML olarak render etmeden önce
 * özel karakterleri escape eder.
 * @param {string} str - Escape edilecek metin
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────────────────────
// ═══ LOGOUT ══════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────

/**
 * Kullanıcıyı çıkış yaptırır:
 *  - Oturum verisini localStorage'dan siler
 *  - Login sayfasına yönlendirir
 *  NOT: Todo ve not verileri kasıtlı olarak silinmiyor;
 *  kullanıcı tekrar giriş yapınca kaldığı yerden devam edebilir.
 */
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// ─────────────────────────────────────────────────────────────
// ═══ OLAY DİNLEYİCİLERİ ══════════════════════════════════════
// ─────────────────────────────────────────────────────────────

// Logout butonu
logoutBtn.addEventListener("click", logout);

// Todo: buton tıklaması
todoAddBtn.addEventListener("click", addTodo);

// Todo: Enter tuşu ile ekleme
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

// Not: buton tıklaması
noteAddBtn.addEventListener("click", addNote);

// Not: Ctrl + Enter ile ekleme (textarea'da Enter yeni satır olduğu için)
noteContentInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) addNote();
});

// ─────────────────────────────────────────────────────────────
// ═══ BAŞLANGIÇ RENDER ════════════════════════════════════════
// ─────────────────────────────────────────────────────────────
// Sayfa yüklendiğinde mevcut verileri göster
renderTodos();
renderNotes();
