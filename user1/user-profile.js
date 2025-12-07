// user-profile.js
(function () {
  /* ---------------------------------------------
   * 1. Touch feedback (mobile active state)
   * ------------------------------------------- */
  function attachTouchListeners() {
    document
      .querySelectorAll(
        '.log-out-btn-link, .delete-account-btn-link, .edit-btn, ' +
        '.setting-item, .header .back-btn, .header .home-btn, ' +
        '.desktop-back-button .back-icon, .view-all'
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
      img.src = '';
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
   * 5. ช่วยเช็ค favorites ว่าว่างไหม → ซ่อน section
   * ------------------------------------------- */
  function ensureFavoritesVisibility() {
    const section = document.querySelector('.favorites-section');
    const list = document.getElementById('favoriteList');
    if (!section || !list) return;

    if (!list.children.length) {
      section.style.display = 'none';
    }
  }

  /* ---------------------------------------------
   * 6. ฟังก์ชันให้หลังบ้าน render การ์ด Favorites
   * ------------------------------------------- */
  function renderFavoritePlaces(places) {
    const tpl = document.getElementById('favoritePlaceTemplate');
    const list = document.getElementById('favoriteList');
    const section = document.querySelector('.favorites-section');
    if (!tpl || !list || !section) return;

    list.innerHTML = '';

    if (!Array.isArray(places) || places.length === 0) {
      section.style.display = 'none';
      return;
    }

    places.forEach((p, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);

      // id/rank
      node.dataset.id = p.id ?? index + 1;

      const rankEl = node.querySelector('.card-rank-number');
      if (rankEl) rankEl.textContent = p.rank ?? index + 1;

      // image
      const imgEl = node.querySelector('.card-image');
      if (imgEl) {
        imgEl.src = p.imageUrl || '';
        imgEl.alt = p.title || '';
      }

      // open info
      const dayEl = node.querySelector('.card-open-days');
      const hourEl = node.querySelector('.card-open-hours');
      if (dayEl) dayEl.textContent = p.openDays || '';
      if (hourEl) hourEl.textContent = p.openHours || '';

      // rating + stars
      const starEl = node.querySelector('.card-stars');
      const rateEl = node.querySelector('.card-rating');
      if (p.rating != null) {
        if (starEl) {
          const full = Math.round(p.rating);
          let stars = '';
          for (let i = 0; i < 5; i++) {
            stars += i < full ? '★' : '☆';
          }
          starEl.textContent = stars;
        }
        if (rateEl) {
          rateEl.textContent = p.rating.toFixed(1);
        }
      }

      // title
      const titleEl = node.querySelector('.card-title');
      if (titleEl) titleEl.textContent = p.title || '';

      // ปุ่มหัวใจ → เอาไว้อนุญาตให้ unfavorite ได้ (frontend)
      const favBtn = node.querySelector('.card-fav-btn');
      const favIcon = favBtn?.querySelector('.material-icons');
      if (favBtn && favIcon) {
        favBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // TODO: call backend เพื่อลบออกจาก favorites จริง ๆ ถ้าต้องการ
          node.remove();
          ensureFavoritesVisibility();
        });
      }

      list.appendChild(node);
    });

    section.style.display = 'block';
  }

  // เปิดให้หลังบ้านใช้
  window.renderFavoritePlaces = renderFavoritePlaces;

  /* ---------------------------------------------
   * 7. Init
   * ------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // เปลี่ยนรูปโปรไฟล์ (เลือกไฟล์จากเครื่อง)
    const avatarContainer = document.getElementById('userAvatarContainer');
    const avatarImg = document.getElementById('profileAvatarImg');
    const avatarInput = document.getElementById('avatarInput');

    if (avatarContainer && avatarInput && avatarImg) {
      avatarContainer.addEventListener('click', () => {
        avatarInput.click();
      });

      avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        avatarImg.src = previewUrl;
        avatarContainer.classList.add('has-image');
      });
    }

    tryLoadCurrentUser();
    attachTouchListeners();
    ensureFavoritesVisibility();
  });
})();