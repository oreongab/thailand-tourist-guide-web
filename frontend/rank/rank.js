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
}

// ========== แมป chip กับ category endpoint ==========
const chipCategoryMap = {
  'Cafés & Restaurants': 'cafes',
  'Temple': 'temples',
  'Natural': 'natural',
  'View': 'view',
  'Art': 'art',
  'Museums': 'museums',
  'Markets': 'markets',
  'Beaches': 'beaches',
  'Parks & Gardens': 'parks',
  'Historical Attractions': 'historical',
  'Mall': 'malls',
  'Other': 'other'
};

// ตัวแปรสำหรับ Category Filter
let selectedTypes = [];
let selectedProvinces = [];

// ========== chips category ==========
function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", async (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    const isCurrentlyActive = chip.classList.contains("active");
    
    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    
    // ล้างช่องค้นหา
    const searchInput = document.getElementById('rankSearchInput');
    if (searchInput) searchInput.value = '';
    
    // ล้าง category filter selections
    clearCategorySelections();
    
    if (isCurrentlyActive) {
      // ถ้าเดิมเป็น active อยู่แล้ว ให้แสดงทั้งหมด
      await fetchRankPlaces();
    } else {
      // ถ้ายังไม่ active ให้เปิด active และกรอง
      chip.classList.add("active");
      
      const category = chip.textContent.trim();
      const endpoint = chipCategoryMap[category];
      
      if (endpoint) {
        await fetchPlacesByCategory(endpoint);
      } else {
        await fetchRankPlaces();
      }
    }
  });
}

// ========== ดาว ==========
function buildStars(place_score) {
  if (place_score == null) return "";
  const full = Math.round(place_score);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < full ? "★" : "☆";
  }
  return html;
}

// ========== renderPlaceCards ==========
function renderPlaceCards(places) {
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  if (!grid || !tpl) return;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">ไม่พบสถานที่</p>';
    return;
  }

  grid.style.display = "grid";

  places.forEach((p, index) => {
    const node = tpl.content.firstElementChild.cloneNode(true);

    node.dataset.id = p.place_id;

    // คลิกการ์ดไปหน้า detail
    node.style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      
      const placeId = node.dataset.id;
      if (placeId) {
        window.location.href = `../place/place-detail.html?id=${placeId}`;
      }
    });

    // แสดงหมายเลข rank
    const rankEl = node.querySelector(".card-rank-number");
    if (rankEl) rankEl.textContent = index + 1;
    
    // แสดง rank badge
    const rankBadge = node.querySelector(".card-rank-badge");
    if (rankBadge) rankBadge.style.display = 'flex';

    // รูปภาพ - แปลง path
    const imgEl = node.querySelector(".card-image");
    if (imgEl) {
      let imagePath = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
      
      if (p.image_path) {
        const fileName = p.image_path.includes('/') || p.image_path.includes('\\') 
          ? p.image_path.split(/[/\\]/).pop() 
          : p.image_path;
        imagePath = `../../img_place/${fileName}`;
      }
      
      imgEl.src = imagePath;
      imgEl.alt = p.place_name || "";
      
      imgEl.onerror = function() {
        this.onerror = null;
        this.src = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
      };
    }

    const dayEl = node.querySelector(".card-open-days");
    const hourEl = node.querySelector(".card-open-hours");
    if (dayEl) dayEl.textContent = p.place_province || "";
    if (hourEl) hourEl.textContent = p.opening_hours || "";

    const starEl = node.querySelector(".card-stars");
    const rateEl = node.querySelector(".card-rating");
    if (starEl && p.place_score != null) {
      const score = parseFloat(p.place_score) || 0;
      starEl.textContent = buildStars(score);
    }
    if (rateEl && p.place_score != null) {
      const score = parseFloat(p.place_score) || 0;
      rateEl.textContent = score.toFixed(1);
    }

    const titleEl = node.querySelector(".card-title");
    if (titleEl) titleEl.textContent = p.place_name || "";

    grid.appendChild(node);
  });
  
  console.log('Places rendered:', places.length);
  
  // โหลดสถานะ favorite
  if (typeof loadFavoriteStates === 'function') {
    console.log('Loading favorite states...');
    loadFavoriteStates();
  } else if (window.favoriteHandler && typeof window.favoriteHandler.loadFavoriteStates === 'function') {
    console.log('Loading favorite states from handler...');
    window.favoriteHandler.loadFavoriteStates();
  } else {
    console.warn('Favorite handler not found');
  }
}

// ========== เปิด/ปิด Opening Days Filter Panel ==========
function setupCategoryPanel() {
  const filterBtn = document.getElementById('categoryBtn');
  const panel = document.getElementById('openingDaysPanel');
  
  if (!filterBtn || !panel) {
    console.warn('Filter button or panel not found');
    return;
  }

  // เปิด panel
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    
    if (isOpen) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    } else {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }
  });

  // ปิด panel เมื่อคลิกข้างนอก
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== filterBtn) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  // ปุ่ม Clear
  const clearBtn = panel.querySelector('.filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // ยกเลิก checkbox ทั้งหมด
      panel.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      // ยกเลิก day chips
      panel.querySelectorAll('.day-chip').forEach(chip => chip.classList.remove('active'));
    });
  }

  // ปุ่ม Apply
  const applyBtn = panel.querySelector('.filter-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      // ปิด panel
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      
      // TODO: ใช้ filter ที่เลือกมากรองข้อมูล
      console.log('Apply filter clicked');
    });
  }

  // Day chips toggle
  const dayChips = panel.querySelectorAll('.day-chip');
  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });
}

// ========== โหลดข้อมูล rank ทั้งหมด (เรียงตาม score) ==========
async function fetchRankPlaces() {
  try {
    console.log('=== Loading rank places ===');
    
    const response = await fetch('http://localhost:3000/places');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Rank data received:', data.length, 'places');
    
    if (!data || data.length === 0) {
      console.log('No places found');
      renderPlaceCards([]);
      return;
    }
    
    // เรียงตาม place_score จากมากไปน้อย
    const sortedData = data.sort((a, b) => {
      const scoreA = parseFloat(a.place_score) || 0;
      const scoreB = parseFloat(b.place_score) || 0;
      return scoreB - scoreA;
    });
    
    console.log('Sorted places by score:', sortedData.slice(0, 5).map(p => ({
      name: p.place_name,
      score: p.place_score
    })));
    
    renderPlaceCards(sortedData);
    
  } catch (error) {
    console.error('Error fetching rank places:', error);
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า backend server ทำงานอยู่</p>';
      grid.style.display = 'block';
    }
  }
}

// ========== โหลดข้อมูลตาม category ==========
async function fetchPlacesByCategory(category) {
  try {
    console.log('=== Fetching category:', category, '===');
    const url = `http://localhost:3000/places/category/${category}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    console.log('Data received:', data.length, 'places');
    
    if (!data || data.length === 0) {
      const grid = document.getElementById("placeGrid");
      if (grid) {
        grid.innerHTML = `<p style="text-align:center; padding:2rem; color:#666;">ไม่พบสถานที่ในหมวดหมู่นี้</p>`;
        grid.style.display = 'block';
      }
      return;
    }
    
    // เรียงตาม place_score จากมากไปน้อย
    const sortedData = data.sort((a, b) => {
      const scoreA = parseFloat(a.place_score) || 0;
      const scoreB = parseFloat(b.place_score) || 0;
      return scoreB - scoreA;
    });
    
    renderPlaceCards(sortedData);
    
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
      grid.style.display = 'block';
    }
  }
}

// ========== ค้นหา ==========
function setupSearch() {
  const searchInput = document.getElementById('rankSearchInput');
  const suggestionsDiv = document.getElementById('rankSearchSuggestions');
  
  if (!searchInput) return;
  
  let searchTimeout;
  let allPlaces = []; // เก็บข้อมูลสถานที่ทั้งหมดสำหรับ suggestions
  
  // โหลดข้อมูลสถานที่ทั้งหมดสำหรับ suggestions
  async function loadAllPlaces() {
    try {
      const response = await fetch('http://localhost:3000/places');
      if (response.ok) {
        allPlaces = await response.json();
      }
    } catch (error) {
      console.error('Error loading places for suggestions:', error);
    }
  }
  
  loadAllPlaces();
  
  // แสดง suggestions
  function showSuggestions(query) {
    if (!suggestionsDiv || !query || query.length < 1) {
      if (suggestionsDiv) suggestionsDiv.style.display = 'none';
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allPlaces.filter(place => 
      place.place_name.toLowerCase().includes(lowerQuery) ||
      place.place_province.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // แสดงแค่ 8 รายการ
    
    if (filtered.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }
    
    suggestionsDiv.innerHTML = filtered.map(place => `
      <div class="search-suggestion-item" data-id="${place.place_id}">
        <div class="suggestion-name">${place.place_name}</div>
        <div class="suggestion-province">
          ${place.place_province}
          <span class="suggestion-score">★ ${parseFloat(place.place_score || 0).toFixed(1)}</span>
        </div>
      </div>
    `).join('');
    
    suggestionsDiv.style.display = 'block';
    
    // คลิก suggestion
    suggestionsDiv.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const placeId = item.dataset.id;
        window.location.href = `../place/place-detail.html?id=${placeId}`;
      });
    });
  }
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    const query = e.target.value.trim();
    
    console.log('Search input:', query);
    
    // แสดง suggestions
    showSuggestions(query);
    
    // ถ้าไม่มีคำค้นหา ให้โหลด rank ปกติ
    if (query === '') {
      fetchRankPlaces();
      return;
    }
    
    // ล้าง chip active เมื่อเริ่มค้นหา
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => chip.classList.remove('active'));
    
    // ล้าง category filter
    clearCategorySelections();
    
    // รอ 300ms หลังจากพิมพ์เสร็จ
    searchTimeout = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  });
  
  // ปิด suggestions เมื่อคลิกข้างนอก
  document.addEventListener('click', (e) => {
    if (suggestionsDiv && !searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = 'none';
    }
  });
}

// ========== ค้นหาสถานที่ ==========
async function searchPlaces(query) {
  try {
    console.log('=== Searching for:', query, '===');
    
    const params = new URLSearchParams({
      query: query
    });
    
    const url = `http://localhost:3000/places/search?${params.toString()}`;
    console.log('Search URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Search results:', result);
    
    if (result.success && result.data) {
      console.log('Found', result.data.length, 'places');
      
      // เรียงตาม place_score จากมากไปน้อย
      const sortedData = result.data.sort((a, b) => {
        const scoreA = parseFloat(a.place_score) || 0;
        const scoreB = parseFloat(b.place_score) || 0;
        return scoreB - scoreA;
      });
      
      renderPlaceCards(sortedData);
    } else {
      console.log('No results found');
      renderPlaceCards([]);
    }
    
  } catch (error) {
    console.error('Search error:', error);
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง</p>';
      grid.style.display = 'block';
    }
  }
}

// ========== Category Filter Panel ==========
function setupCategoryPanel() {
  let categoryOverlay = document.getElementById('categoryOverlay');
  
  if (!categoryOverlay) {
    console.log('Category overlay not found in rank.html, feature disabled');
    return;
  }

  const categoryClose = document.querySelector('.category-close');
  const applyBtn = document.querySelector('.category-apply');
  const clearBtn = document.querySelector('.category-clear');

  // ปิด panel
  if (categoryClose) {
    categoryClose.addEventListener('click', () => {
      categoryOverlay?.classList.remove('open');
    });
  }

  // ปิดเมื่อคลิกที่ overlay
  if (categoryOverlay) {
    categoryOverlay.addEventListener('click', (e) => {
      if (e.target === categoryOverlay) {
        categoryOverlay.classList.remove('open');
      }
    });
  }

  // จัดการ checkbox สำหรับ Place Type
  const placeCheckboxes = document.querySelectorAll('.category-place-list input[type="checkbox"]');
  placeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!selectedTypes.includes(value)) {
          selectedTypes.push(value);
        }
      } else {
        selectedTypes = selectedTypes.filter(type => type !== value);
      }
      console.log('Selected types:', selectedTypes);
    });
  });

  // จัดการ checkbox สำหรับ Province
  const provinceCheckboxes = document.querySelectorAll('.category-province-list input[type="checkbox"]');
  provinceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!selectedProvinces.includes(value)) {
          selectedProvinces.push(value);
        }
      } else {
        selectedProvinces = selectedProvinces.filter(prov => prov !== value);
      }
      console.log('Selected provinces:', selectedProvinces);
    });
  });

  // ปุ่ม Apply
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      // ล้าง chip selection
      document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
      
      // ล้างช่องค้นหา
      const searchInput = document.getElementById('rankSearchInput');
      if (searchInput) searchInput.value = '';
      
      await applyFilters();
      categoryOverlay?.classList.remove('open');
    });
  }

  // ปุ่ม Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearFilters();
    });
  }

  // Province search
  setupProvinceSearch();
}

// ฟังก์ชันค้นหา province
function setupProvinceSearch() {
  const searchInput = document.getElementById('provinceSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const provinceItems = document.querySelectorAll('.category-province-list li');

    provinceItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// ใช้ filter
async function applyFilters() {
  console.log('Applying filters...');
  console.log('Types:', selectedTypes);
  console.log('Provinces:', selectedProvinces);

  try {
    // สร้าง query string
    const params = new URLSearchParams();
    
    if (selectedTypes.length > 0) {
      selectedTypes.forEach(type => params.append('types', type));
    }
    
    if (selectedProvinces.length > 0) {
      selectedProvinces.forEach(province => params.append('provinces', province));
    }

    const url = `http://localhost:3000/categories?${params.toString()}`;
    console.log('Fetching:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Filtered result:', result);

    if (!result.success || !result.data || result.data.length === 0) {
      const grid = document.getElementById('placeGrid');
      if (grid) {
        grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่พบสถานที่ที่ตรงกับเงื่อนไข</p>';
      }
      return;
    }

    // เรียงตาม place_score จากมากไปน้อย
    const sortedData = result.data.sort((a, b) => {
      const scoreA = parseFloat(a.place_score) || 0;
      const scoreB = parseFloat(b.place_score) || 0;
      return scoreB - scoreA;
    });

    renderPlaceCards(sortedData);

  } catch (error) {
    console.error('Error applying filters:', error);
    alert('เกิดข้อผิดพลาดในการกรองข้อมูล: ' + error.message);
  }
}

// ล้าง filter ทั้งหมด
function clearFilters() {
  selectedTypes = [];
  selectedProvinces = [];

  // uncheck checkboxes ทั้งหมด
  document.querySelectorAll('.category-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // ล้าง search
  const searchInput = document.getElementById('provinceSearch');
  if (searchInput) searchInput.value = '';

  // แสดง province ทั้งหมด
  document.querySelectorAll('.category-province-list li').forEach(item => {
    item.style.display = '';
  });
  
  // ล้าง chip selection ด้วย
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  
  // แสดงข้อมูลทั้งหมด
  fetchRankPlaces();

  console.log('Filters cleared');
}

// ฟังก์ชันสำหรับล้าง category selections โดยไม่โหลดข้อมูลใหม่
function clearCategorySelections() {
  selectedTypes = [];
  selectedProvinces = [];
  
  document.querySelectorAll('.category-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  const searchInput = document.getElementById('provinceSearch');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.category-province-list li').forEach(item => {
    item.style.display = '';
  });
}

// ========== เช็ค Login Status ==========
function setupAuthButtons() {
  const userStr = localStorage.getItem('loggedInUser');
  const usernameDisplay = document.querySelector('.mobile-menu-header .username');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('User logged in:', user);
      
      if (usernameDisplay) {
        usernameDisplay.textContent = user.user_name || user.first_name || 'User';
      }
    } catch (e) {
      console.error('Parse user error:', e);
      localStorage.removeItem('loggedInUser');
    }
  } else {
    console.log('No user logged in');
    
    if (usernameDisplay) {
      usernameDisplay.textContent = 'Guest';
    }
  }
}

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  // ใช้ favorite-handler.js
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log('Rank page initialized');
  
  setupMobileMenu();
  setupChipActive();
  setupSearch();
  setupCategoryPanel();
  setupAuthButtons();
  setupFavoriteToggle();
  
  // โหลดข้อมูล rank ครั้งแรก
  fetchRankPlaces();
});
