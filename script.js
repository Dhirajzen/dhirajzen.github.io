// ===== Reveal on scroll: single IntersectionObserver-driven system =====
// Hero elements have a staggered transition-delay (see styles.css) so they
// "build in" sequentially the moment they're observed, since they're already
// in view at load. Everything else fades in as it scrolls into view.
function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  targets.forEach((target) => io.observe(target));
}

// ===== Mobile nav: hamburger toggle =====
function initMobileNav() {
  const toggle = document.querySelector('.site-nav__toggle');
  const links = document.getElementById('site-nav-links');
  if (!toggle || !links) return;

  const setOpen = (open) => {
    links.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(links.dataset.open !== 'true'));
  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && links.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

// ===== Cursor-reactive background dots =====
// A brighter copy of the dot-grid is masked to a soft circle that eases
// toward the pointer, so nearby dots light up with a fluid trailing feel
// instead of a flat glow washing over the page.
function initCursorGlow() {
  const layer = document.querySelector('.site-bg-wave-active');
  if (!layer) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (prefersReducedMotion || isCoarsePointer) return;

  const root = document.documentElement;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let running = false;

  const tick = () => {
    // Ease the mask position toward the pointer each frame — a fraction of
    // the remaining distance, so the reveal trails smoothly instead of
    // snapping straight to the cursor.
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    root.style.setProperty('--cursor-x', `${currentX}px`);
    root.style.setProperty('--cursor-y', `${currentY}px`);

    const closeEnough = Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5;
    if (closeEnough) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
  };

  const ensureRunning = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  window.addEventListener('pointermove', (event) => {
    targetX = event.pageX;
    targetY = event.pageY;
    layer.classList.add('is-active');
    ensureRunning();
  });

  window.addEventListener('pointerleave', () => layer.classList.remove('is-active'));
  document.addEventListener('mouseleave', () => layer.classList.remove('is-active'));
}

// ===== Videos: click-to-load YouTube embeds =====
// Each video starts as a plain link to YouTube with a thumbnail, so nothing
// from YouTube loads until a visitor actually asks to watch — the page stays
// fast and no-JS visitors still get a working link. On click, the thumbnail
// is swapped for the privacy-enhanced (youtube-nocookie) player, autoplaying.
function initVideoEmbeds() {
  document.querySelectorAll('.video-thumb[data-video-id]').forEach((thumb) => {
    thumb.addEventListener('click', (event) => {
      // Let modified clicks (new tab/window) fall through to the plain link.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();

      const iframe = document.createElement('iframe');
      iframe.className = 'video-frame';
      iframe.src = `https://www.youtube-nocookie.com/embed/${thumb.dataset.videoId}?autoplay=1&rel=0`;
      iframe.title = thumb.dataset.videoTitle || 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      thumb.replaceWith(iframe);
      iframe.focus();
    });
  });
}

// ===== Nav: scroll progress + current-section highlight =====
// One rAF-throttled scroll handler drives both. The progress line under the
// nav is a copper "signal" that fills as you read; the highlight marks the
// in-page section whose top has passed 40% of the viewport (or the last one
// once you hit the bottom, since the short contact footer may never get
// that far up). On case-study pages the nav links point back to the home
// page, so there are no in-page targets and only the progress line runs.
function initNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const spyTargets = [...nav.querySelectorAll('.site-nav__links a[href^="#"]')]
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((t) => t.section);

  let scheduled = false;
  const update = () => {
    scheduled = false;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    nav.style.setProperty('--scroll-progress', progress.toFixed(4));

    if (!spyTargets.length) return;
    let active = null;
    if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
      active = spyTargets[spyTargets.length - 1];
    } else {
      const line = window.innerHeight * 0.4;
      spyTargets.forEach((t) => {
        if (t.section.getBoundingClientRect().top <= line) active = t;
      });
    }
    spyTargets.forEach((t) => {
      const isActive = t === active;
      t.link.classList.toggle('is-active', isActive);
      if (isActive) t.link.setAttribute('aria-current', 'true');
      else t.link.removeAttribute('aria-current');
    });
  };

  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

// ===== Contact: copy email to clipboard =====
// The button ships hidden and is only revealed where the Clipboard API
// exists (it needs a secure context), so it never appears broken.
function initCopyEmail() {
  if (!navigator.clipboard) return;
  document.querySelectorAll('.copy-email[data-email]').forEach((button) => {
    const label = button.textContent;
    let resetTimer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.email);
        button.textContent = 'Copied!';
      } catch (error) {
        button.textContent = 'Press Ctrl+C';
        console.error('Copy to clipboard failed:', error);
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { button.textContent = label; }, 2000);
    });
  });
}

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', () => {
  initVideoEmbeds();
  initReveal();
  initMobileNav();
  initCursorGlow();
  initNavScroll();
  initCopyEmail();
});
