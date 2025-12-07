// terms.js
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('termsBackBtn');
  if (!backBtn) return;

  // อ่าน ?from=index / ?from=favorites / ?from=rank / ?from=about
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');

  const fromMap = {
    index: 'index.html',
    favorites: 'favorites.html',
    rank: 'rank.html',
    about: 'about.html'
  };

  backBtn.addEventListener('click', () => {
    if (from && fromMap[from]) {
      window.location.href = fromMap[from];
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
});