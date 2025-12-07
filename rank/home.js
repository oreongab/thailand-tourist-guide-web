// ========== เมนูมือถือ (สามขีด) ==========
function setupMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".mobile-menu-close");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.add("open");
  });

  closeBtn?.addEventListener("click", () => {
    menu.classList.remove("open");
  });

  menu.addEventListener("click", (e) => {
    const link = e.target.closest(".mobile-link");
    if (link) {
      menu.classList.remove("open");
    }
  });
}

// ========== avatar click ==========
function setupAvatarClick() {
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Profile button clicked");
      // TODO: เปิดหน้า profile หรือ popup
    });
  });
}

// ========== active state nav ==========
function setupNavActive() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // ถ้า link เป็นไปหน้าอื่นไม่ต้อง prevent ก็ได้
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
      }
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const mobileLinks = document.querySelectorAll(".mobile-link");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
      }
      mobileLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

// ========== chips ==========
function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
}

// ========== ดาว ==========
function buildStars(rating) {
  if (rating == null) return "";
  const full = Math.round(rating);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < full ? "★" : "☆";
  }
  return html;
}

// ========== renderPlaceCards (ให้หลังบ้านเรียกใช้) ==========
function renderPlaceCards(places) {
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  if (!grid || !tpl) return;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    grid.style.display = "none";
    return;
  }

  grid.style.display = "grid";

  places.forEach((p, index) => {
    const node = tpl.content.firstElementChild.cloneNode(true);

    node.dataset.id = p.id ?? index + 1;

    const rankEl = node.querySelector(".card-rank-number");
    if (rankEl) rankEl.textContent = p.rank ?? index + 1;

    const imgEl = node.querySelector(".card-image");
    if (imgEl) {
      imgEl.src = p.imageUrl || "image1.png";
      imgEl.alt = p.title || "";
    }

    const dayEl = node.querySelector(".card-open-days");
    const hourEl = node.querySelector(".card-open-hours");
    if (dayEl) dayEl.textContent = p.openDays || "";
    if (hourEl) hourEl.textContent = p.openHours || "";

    const starEl = node.querySelector(".card-stars");
    const rateEl = node.querySelector(".card-rating");
    if (starEl && p.rating != null) starEl.textContent = buildStars(p.rating);
    if (rateEl && p.rating != null) rateEl.textContent = p.rating.toFixed(1);

    const titleEl = node.querySelector(".card-title");
    if (titleEl) titleEl.textContent = p.title || "";

    grid.appendChild(node);
  });
}

// เปิดให้หลังบ้านใช้
window.renderPlaceCards = renderPlaceCards;

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    btn.classList.toggle("is-fav");
    const icon = btn.querySelector(".material-icons");
    if (icon) {
      icon.textContent = btn.classList.contains("is-fav")
        ? "favorite"
        : "favorite_border";
    }
  });
}

// ========== ปุ่ม Category (filter) ==========
function setupCategoryButton() {
  const btn = document.getElementById("categoryBtn");
  const panel = document.getElementById("openingDaysPanel");
  if (!btn || !panel) return;

  const clearBtn = panel.querySelector(".filter-clear");
  const applyBtn = panel.querySelector(".filter-apply");
  const dayChips = panel.querySelectorAll(".day-chip");

  // toggle day active
  dayChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
    });
  });

  // clear
  clearBtn?.addEventListener("click", () => {
    panel.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.checked = false;
    });
    dayChips.forEach((chip) => chip.classList.remove("active"));
  });

  // apply (ตอนนี้แค่ปิด panel)
  applyBtn?.addEventListener("click", () => {
    closePanel();
  });

  function openPanel() {
    // ทำให้วัดขนาดได้
    panel.style.display = "block";

    const rect = btn.getBoundingClientRect();
    const inner = panel.firstElementChild;
    const panelRect = inner ? inner.getBoundingClientRect() : { width: 260 };

    // วาง panel ใต้ปุ่ม filter
    let left = rect.right - panelRect.width;
    if (left < 16) left = 16;
    const top = rect.bottom + 8 + window.scrollY;

    panel.style.position = "absolute";
    panel.style.left = `${left + window.scrollX}px`;
    panel.style.top = `${top}px`;

    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) {
      closePanel();
    } else {
      openPanel();
    }
  });

  // click นอก panel ปิด
  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    const insidePanel = e.target.closest("#openingDaysPanel");
    const isButton = e.target.closest("#categoryBtn");
    if (!insidePanel && !isButton) {
      closePanel();
    }
  });

  // Esc ปิด
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      closePanel();
    }
  });
}
// ========== ปุ่ม Login/Signup (dummy) ==========
function setupAuthButtons() {
  // ลบ Sign in/Sign up
  const authButtons = document.querySelectorAll(".mobile-auth");
  authButtons.forEach((btn) => {
    btn.remove();
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAvatarClick();
  setupNavActive();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();
  setupAuthButtons();

  // ตัวอย่างทดสอบ template (ลบออกได้)
  // window.renderPlaceCards([
  //   { id: 1, title: "Example Place", rating: 4.8, imageUrl: "image1.png", openDays: "Mon-Sun", openHours: "09:00 - 18:00", rank: 1 }
  // ]);
});