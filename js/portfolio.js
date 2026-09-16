const CATEGORIES = {
  realism: {
    alt: 'Black and grey realism tattoo by Kapoe Inked',
    files: [
      'images/portfolio/1.jpg', 'images/portfolio/2.jpg', 'images/portfolio/4.jpg',
      ...Array.from({ length: 16 }, (_, i) => `images/portfolio/realism/${String(i + 1).padStart(2, '0')}.jpg`),
    ],
  },
  fineline: {
    alt: 'Fine line tattoo by Kapoe Inked',
    files: Array.from({ length: 18 }, (_, i) => `images/portfolio/fineline/${String(i + 1).padStart(2, '0')}.jpg`),
  },
  floral: {
    alt: 'Floral and nature tattoo by Kapoe Inked',
    files: Array.from({ length: 7 }, (_, i) => `images/portfolio/floral/${String(i + 1).padStart(2, '0')}.jpg`),
  },
  lettering: {
    alt: 'Custom lettering tattoo by Kapoe Inked',
    files: [
      'images/portfolio/3.jpg', 'images/portfolio/5.jpg',
      ...Array.from({ length: 14 }, (_, i) => `images/portfolio/lettering/${String(i + 1).padStart(2, '0')}.jpg`),
    ],
  },
};

function buildCard(src, alt) {
  const figure = document.createElement('figure');
  figure.className = 'photo-card reveal';
  figure.setAttribute('data-lightbox', '');
  figure.innerHTML = `
    <img src="${src}" alt="${alt}" loading="lazy" onerror="this.closest('.photo-card').classList.add('is-empty')">
    <div class="photo-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3 16 L9 12 L13 15 L17 11 L21 14"/></svg><span>${src}</span></div>
  `;
  return figure;
}

function populateGrids() {
  document.querySelectorAll('.photo-grid[data-category]').forEach((grid) => {
    const key = grid.dataset.category;
    const cat = CATEGORIES[key];
    if (!cat) return;
    cat.files.forEach((src) => grid.appendChild(buildCard(src, cat.alt)));
  });
}

populateGrids();
