function buildLightbox() {
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.id = 'lightbox';
  el.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>
    </button>
    <img src="" alt="">
  `;
  document.body.appendChild(el);
  return el;
}

function initLightbox() {
  const cards = document.querySelectorAll('.photo-card[data-lightbox]');
  if (!cards.length) return;

  const lightbox = buildLightbox();
  const img = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function open(card) {
    if (card.classList.contains('is-empty')) return;
    const cardImg = card.querySelector('img');
    img.src = cardImg.src;
    img.alt = cardImg.alt;
    lightbox.classList.add('is-open');
  }
  function close() {
    lightbox.classList.remove('is-open');
  }

  cards.forEach((card) => card.addEventListener('click', () => open(card)));
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLightbox);
} else {
  initLightbox();
}
