// user-profile.js
(function () {

  /* ---------------------------------------------
   * 1. Touch feedback (mobile active state)
   * ------------------------------------------- */
  function attachTouchListeners() {
    document
      .querySelectorAll(
        '.log-out-btn-link, .delete-account-btn-link, .fav-item, .edit-btn, .setting-item, .header .back-btn, .header .home-btn, .desktop-back-button .back-icon, .view-all'
      )
      .forEach((btn) => {
        btn.addEventListener(
          'touchstart',
          function () {
            this.classList.add('active-touch');
          },
          { passive: true }
        );
        const clear = function () {
          this.classList.remove('active-touch');
        };
        btn.addEventListener('touchend', clear, { passive: true });
        btn.addEventListener('touchcancel', clear, { passive: true });
      });
  }

  /* ---------------------------------------------
   * 2. Avatar helper – สลับ icon / รูปจริง
   * ------------------------------------------- */
   function setAvatar(url) {
    const container = document.getElementById('userAvatarContainer');
    const img = document.getElementById('profileAvatarImg');
    if (!container || !img) return;

    if (!url || !url.trim()) {
      container.classList.remove('has-image');
      img.src = ''; // ใช้รูปเริ่มต้นหากไม่มีรูป
    } else {
      container.classList.add('has-image');
      img.src = url;
    }
  }

  /* ---------------------------------------------
   * 3. Render user info (ชื่อ + email + avatar)
   * ------------------------------------------- */
  function renderUserFromObject(u) {
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!usernameEl || !emailEl) return;

    const display = u.displayName || u.username || u.name || 'Guest';
    usernameEl.textContent = display;
    emailEl.textContent = u.email || '';

    usernameEl.dataset.username = u.username || u.displayName || '';
    emailEl.dataset.email = u.email || '';

    if (u.avatarUrl) {
      setAvatar(u.avatarUrl);
    } else {
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * 4. โหลด user จาก window.__USER__ หรือ /api/me
   * ------------------------------------------- */
  async function tryLoadCurrentUser() {
    // 1) หลังบ้าน inject window.__USER__ ไว้แล้ว
    if (window.__USER__ && typeof window.__USER__ === 'object') {
      try {
        renderUserFromObject(window.__USER__);
        return;
      } catch (err) {
        console.warn('render window.__USER__ failed:', err);
      }
    }

    // 2) ถ้ายังไม่มี ลองเรียก API ฝั่ง backend
    try {
      const resp = await fetch('/api/me', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!resp.ok) throw new Error('fetch /api/me failed');
      const user = await resp.json();
      renderUserFromObject(user);
    } catch (err) {
      console.info('No user info, fallback to Guest.', err);
      const usernameEl = document.getElementById('username');
      const emailEl = document.getElementById('email');
      if (usernameEl) usernameEl.textContent = 'Guest';
      if (emailEl) emailEl.textContent = '';
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * 5. ซ่อน Favorites ถ้ามีแต่ placeholder
   * ------------------------------------------- */
  function renderFavoritesTemplateCheck() {
    const favList = document.querySelector('.fav-list');
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favList || !favoritesSection) return;

    const favItems = favList.querySelectorAll('.fav-item');
    if (favItems.length === 1 && favItems[0].dataset.name === 'Placeholder Name') {
      favoritesSection.style.display = 'none'; // ซ่อน favorites section ถ้าไม่มีข้อมูล
    }
  }

  /* ---------------------------------------------
   * 6. Init
   * ------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // ฟังก์ชันการกดเพื่อเลือกและเปลี่ยนรูปโปรไฟล์
    const avatarContainer = document.getElementById('userAvatarContainer');
    const avatarImg = document.getElementById('profileAvatarImg');
    const avatarInput = document.getElementById('avatarInput');

    // เมื่อคลิกที่พื้นที่รูปโปรไฟล์หรือภาพ เพื่อเลือกไฟล์
    avatarContainer.addEventListener('click', () => {
      avatarInput.click();  // ให้แสดง input file เมื่อคลิกที่รูป
    });

    // เมื่อผู้ใช้เลือกไฟล์รูปใหม่
    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);  // สร้าง URL ชั่วคราวจากไฟล์
      avatarImg.src = previewUrl;  // เปลี่ยนรูปโปรไฟล์เป็นไฟล์ที่เลือก
      avatarContainer.classList.add('has-image');  // แสดงรูปจริงแทนไอคอน
    });

    // ลองโหลดข้อมูลผู้ใช้
    tryLoadCurrentUser();
    renderFavoritesTemplateCheck(); // เช็คและซ่อน Favorites หากไม่มีข้อมูล
  });
})();