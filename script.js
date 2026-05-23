/* ═══════════════════════════════════════════════════════════════
   ROMERO Y LINARES · Moda Flamenca Exclusiva
   script.js — Interactions & Animations
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     UTILITY: DOM helpers
  ───────────────────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─────────────────────────────────────────────────────────────
     1. NAVBAR — add scrolled class after 60px
  ───────────────────────────────────────────────────────────── */
  const navbar = $('#navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run on load

  /* ─────────────────────────────────────────────────────────────
     2. MOBILE MENU — open / close
  ───────────────────────────────────────────────────────────── */
  const hamburger     = $('#hamburger');
  const mobileMenu    = $('#mobile-menu');
  const mobileOverlay = $('#mobile-overlay');
  const menuClose     = $('#mobile-menu-close');
  const mobileLinks   = $$('.mobile-nav-link');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  menuClose.addEventListener('click', closeMenu);
  mobileOverlay.addEventListener('click', closeMenu);

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ─────────────────────────────────────────────────────────────
     3. VIDEO — Ensure autoplay on all browsers / mobile
  ───────────────────────────────────────────────────────────── */
  const heroVideo = $('#hero-video');

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');

    const playPromise = heroVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — try on first user interaction
        const unlockVideo = () => {
          heroVideo.play().catch(() => {});
          document.removeEventListener('touchstart', unlockVideo);
          document.removeEventListener('click', unlockVideo);
        };
        document.addEventListener('touchstart', unlockVideo, { once: true });
        document.addEventListener('click', unlockVideo, { once: true });
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     4. DISEÑOS GRID — build cards with random f*.webp images
  ───────────────────────────────────────────────────────────── */
  const diseniosGrid = $('#disenios-grid');

  // All design image filenames
  const disenioImages = [
    'img/f1.webp',  'img/f2.webp',  'img/f3.webp',  'img/f4.webp',
    'img/f5.webp',  'img/f6.webp',  'img/f7.webp',  'img/f8.webp',
    'img/f9.webp',  'img/f010.webp','img/f11.webp', 'img/f12.webp',
    'img/f13.webp', 'img/f14.webp', 'img/f15.webp', 'img/f16.webp',
    'img/f17.webp', 'img/f18.webp', 'img/f19.webp', 'img/f20.webp'
  ];

  // Card labels / descriptions for design cards
  const disenioMeta = [
    { title: 'Volantes Sevilla',  desc: 'Elegancia pura en cada vuelo' },
    { title: 'Traje de Cola',     desc: 'Para las noches más especiales' },
    { title: 'Lunares Primavera', desc: 'Frescura y tradición unidas' },
    { title: 'Alta Costura',      desc: 'Diseño único e irrepetible' },
    { title: 'Flamenco Íntimo',   desc: 'El alma en cada puntada' },
    { title: 'Bata de Cola',      desc: 'Arte en movimiento' },
    { title: 'Edición Especial',  desc: 'Producción absolutamente limitada' },
    { title: 'Colores Feria',     desc: 'Alegría y color en tu traje' },
  ];

  if (diseniosGrid) {
    // Shuffle images for random display
    const shuffled = [...disenioImages].sort(() => Math.random() - 0.5);

    // Create 8 cards, each cycling through 4 random images
    for (let i = 0; i < 8; i++) {
      // Assign 4 images per card, cycling through the shuffled pool
      const cardImages = [];
      for (let j = 0; j < 4; j++) {
        cardImages.push(shuffled[(i * 4 + j) % shuffled.length]);
      }
      const meta = disenioMeta[i % disenioMeta.length];

      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.dataset.images = JSON.stringify(cardImages);

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${cardImages[0]}" alt="${meta.title}" class="card-img" loading="lazy" />
          <div class="card-glow" aria-hidden="true"></div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${meta.title}</h3>
          <p class="card-desc">${meta.desc}</p>
        </div>
      `;
      diseniosGrid.appendChild(card);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     5. CARD IMAGE CYCLING
        All cards (.card) cycle their images every 1.2 seconds
        using a cross-fade transition
  ───────────────────────────────────────────────────────────── */
  function initCardCycling() {
    const allCards = $$('.card');

    allCards.forEach((card, cardIndex) => {
      const imagesAttr = card.dataset.images;
      if (!imagesAttr) return;

      let images;
      try { images = JSON.parse(imagesAttr); } catch { return; }
      if (!images || images.length < 2) return;

      const imgEl = card.querySelector('.card-img');
      if (!imgEl) return;

      let currentIdx = 0;

      // Stagger start times so not all cards flip at the same moment
      const staggerDelay = (cardIndex % 4) * 300;

      setTimeout(() => {
        setInterval(() => {
          // Fade out
          imgEl.style.transition = 'opacity 0.9s ease';
          imgEl.style.opacity = '0';

          setTimeout(() => {
            currentIdx = (currentIdx + 1) % images.length;
            imgEl.src = images[currentIdx];
            // Fade in
            imgEl.style.opacity = '1';
          }, 900);
        }, 3500);
      }, staggerDelay);
    });
  }

  // Wait a tick so dynamically-built cards are in the DOM
  setTimeout(initCardCycling, 50);

  /* ─────────────────────────────────────────────────────────────
     6. REVIEWS CAROUSEL
  ───────────────────────────────────────────────────────────── */
  const reviewsTrack = $('#reviews-track');
  const prevBtn = $('#review-prev');
  const nextBtn = $('#review-next');

  if (reviewsTrack && prevBtn && nextBtn) {
    const cards = $$('.review-card', reviewsTrack);
    let currentReview = 0;
    const visibleCount = () => window.innerWidth >= 960 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const maxIndex = () => Math.max(0, cards.length - visibleCount());

    function updateCarousel() {
      const cardEl = cards[0];
      if (!cardEl) return;
      const gap = 20; // 1.25rem ≈ 20px
      const cardW = cardEl.offsetWidth + gap;
      reviewsTrack.style.transform = `translateX(-${currentReview * cardW}px)`;
    }

    prevBtn.addEventListener('click', () => {
      currentReview = Math.max(0, currentReview - 1);
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentReview = Math.min(maxIndex(), currentReview + 1);
      updateCarousel();
    });

    // Auto-advance
    let reviewAutoInterval = setInterval(() => {
      if (currentReview >= maxIndex()) {
        currentReview = 0;
      } else {
        currentReview++;
      }
      updateCarousel();
    }, 4500);

    // Pause auto on hover / touch
    reviewsTrack.parentElement.addEventListener('mouseenter', () => clearInterval(reviewAutoInterval));
    reviewsTrack.parentElement.addEventListener('mouseleave', () => {
      reviewAutoInterval = setInterval(() => {
        currentReview = currentReview >= maxIndex() ? 0 : currentReview + 1;
        updateCarousel();
      }, 4500);
    });

    // Recalculate on resize
    window.addEventListener('resize', updateCarousel, { passive: true });

    // Touch / swipe support
    let touchStartX = 0;
    reviewsTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    reviewsTrack.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
        if (delta > 0) {
          currentReview = Math.min(maxIndex(), currentReview + 1);
        } else {
          currentReview = Math.max(0, currentReview - 1);
        }
        updateCarousel();
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     7. INSTAGRAM MARQUEE — duplicate items for seamless loop
  ───────────────────────────────────────────────────────────── */
  const marqueeTrack = $('#marquee-track');

  if (marqueeTrack) {
    // Clone all children for seamless infinite scroll
    const items = $$('.marquee-item', marqueeTrack);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marqueeTrack.appendChild(clone);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8. BACK TO TOP BUTTON
  ───────────────────────────────────────────────────────────── */
  const backToTopBtn = $('#back-to-top');

  function handleBackToTop() {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  if (backToTopBtn) {
    window.addEventListener('scroll', handleBackToTop, { passive: true });
    handleBackToTop();

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. SMOOTH SCROLL for anchor links (polyfill for old browsers)
  ───────────────────────────────────────────────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = $(targetId);
      if (target) {
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     10. INTERSECTION OBSERVER — subtle entrance animations
  ───────────────────────────────────────────────────────────── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const fadeUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeUpObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply fade-up effect to key elements
  const animateEls = $$(
    '.card, .review-card, .section-header, .brand-statement-inner, .cita-text, .cita-img-wrap, .footer-brand, .footer-info, .footer-map'
  );

  animateEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.7s ease ${(i % 4) * 0.1}s, transform 0.7s ease ${(i % 4) * 0.1}s`;
    fadeUpObserver.observe(el);
  });

  /* ─────────────────────────────────────────────────────────────
     11. GOLD SHIMMER on hero tags
  ───────────────────────────────────────────────────────────── */
  const heroTags = $$('.hero-tag');
  heroTags.forEach((tag, i) => {
    tag.style.animationDelay = `${i * 0.3}s`;
  });

  /* ─────────────────────────────────────────────────────────────
     12. NAVBAR: hide on scroll down, show on scroll up (desktop)
  ───────────────────────────────────────────────────────────── */
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  navbar.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease';

})();
