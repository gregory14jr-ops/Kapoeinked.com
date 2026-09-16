document.documentElement.classList.remove('no-js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const preloader = document.getElementById('preloader');
const loaderCount = preloader.querySelector('.loader-count');
const loaderBar = preloader.querySelector('.loader-bar span');
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Preloader ----------
function finishPreloading(onDone) {
  let p = 0;
  const start = performance.now();
  const minDuration = 1100;
  const tick = () => {
    p = Math.min(100, p + Math.random() * 15);
    loaderCount.textContent = Math.floor(p) + '%';
    loaderBar.style.setProperty('--p', Math.floor(p) + '%');
    const elapsed = performance.now() - start;
    if (p >= 100 && elapsed >= minDuration) {
      preloader.classList.add('is-done');
      onDone();
    } else {
      setTimeout(tick, 90 + Math.random() * 80);
    }
  };
  tick();
}

// ---------- Reveal on scroll ----------
function initReveals() {
  const items = document.querySelectorAll('.reveal');

  // Stagger siblings that reveal together (grid cards, contact cards, wall entries)
  items.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const groupMates = Array.from(parent.children).filter((c) => c.classList.contains('reveal'));
    if (groupMates.length > 1) {
      const idx = groupMates.indexOf(el);
      el.style.transitionDelay = `${Math.min(idx, 8) * 0.09}s`;
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => io.observe(el));
}

// ---------- Smooth in-page anchor links ----------
function initAnchorScroll(lenis) {
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;
    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex + 1);
    if (!hash) return;
    // Only intercept links that point to a hash on THIS page
    if (path && path !== location.pathname.split('/').pop()) return;
    const target = document.getElementById(hash);
    if (!target) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.3 });
      history.pushState(null, '', `#${hash}`);
    });
  });
}

// ---------- Header + mobile nav ----------
function initHeader() {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', open);
  });
  mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
  }));
}

// ---------- Hero line-art draw-in ----------
function drawPath(el, duration = 1.6, delay = 0) {
  const length = el.getTotalLength();
  el.style.strokeDasharray = length;
  el.style.strokeDashoffset = length;
  gsap.to(el, { strokeDashoffset: 0, duration, delay, ease: 'power2.inOut' });
}

function initHeroArt() {
  const moth = document.querySelector('.hero-moth');
  const sprigLeft = document.querySelector('.hero-sprig-left');
  const sprigRight = document.querySelector('.hero-sprig-right');
  if (!moth) return;

  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(moth, { opacity: 1, duration: 0.4 }, 0)
    .to(sprigLeft, { opacity: 1, duration: 0.4 }, 0.15)
    .to(sprigRight, { opacity: 1, duration: 0.4 }, 0.15);

  [...moth.querySelectorAll('path'), ...sprigLeft.querySelectorAll('path'), ...sprigRight.querySelectorAll('path')]
    .forEach((path, i) => drawPath(path, 1.4, 0.3 + i * 0.08));

  gsap.to('.hero-ring', {
    rotation: 360,
    transformOrigin: '50% 50%',
    duration: 140,
    repeat: -1,
    ease: 'none',
  });
}

// ---------- Main ----------
function boot() {
  initHeader();
  initReveals();

  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-moth, .hero-sprig').forEach((el) => { el.style.opacity = 1; });
    finishPreloading(() => {});
    return;
  }

  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);

  initHeroArt();
  initAnchorScroll(lenis);

  finishPreloading(() => {
    ScrollTrigger.refresh();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
