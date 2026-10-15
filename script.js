// Kept in sync with projects.json manually — used only if the fetch fails,
// so the Featured Projects section still renders all 4 entries.
const FALLBACK_PROJECTS = [
  {
    id: 'axi4-burst-slave-uvm',
    title: 'Verification of a Burst-Capable AXI4 Slave Using SystemVerilog and UVM',
    summary: 'A UVM testbench strict enough to catch three real RTL bugs, each reproducible with its own failing test.',
    stats: [
      { value: '3', label: 'RTL bugs found' },
      { value: '14', label: 'SystemVerilog assertions' },
      { value: '100%', label: 'functional coverage' },
      { value: '8', label: 'tests on Xcelium' },
    ],
    bullets: [
      'Built a UVM environment (driver, monitor, reference-model scoreboard, functional coverage) verifying AXI4 FIXED/INCR/WRAP bursts, byte-lane strobes, and error responses across 8 tests on Cadence Xcelium.',
      'Wrote 14 SystemVerilog Assertions for channel handshake, payload stability, and reset protocol compliance; achieved 100% functional coverage via constrained-random and directed error-injection stimulus.',
      'Found and root-caused 3 RTL bugs — a response-flag race condition, a write-FSM deadlock on early WLAST, and an error-path memory-corruption bug — using a strict per-beat scoreboard and directed error injection.',
    ],
    tags: ['SystemVerilog', 'UVM', 'AXI4', 'SVA', 'Cadence Xcelium'],
    github: 'https://github.com/Dhirajzen/AXI4-UVM-Verification',
    order: 1,
  },
  {
    id: 'async-fifo-cdc',
    title: 'Assertion-Based Verification of a Dual-Clock Asynchronous FIFO for CDC',
    summary: 'A parameterized async FIFO proven with a bind-attached SVA suite across five write/read clock ratios.',
    stats: [
      { value: '14', label: 'assertions' },
      { value: '8', label: 'cover properties' },
      { value: '5', label: 'clock-ratio scenarios' },
    ],
    bullets: [
      'Designed and verified a parameterized dual-clock asynchronous FIFO (Gray-code pointers, 2-flop CDC synchronizers, MSB-invert full/empty logic) with a self-checking SystemVerilog testbench and a 14-assertion / 8-cover-property SVA suite (bind-attached, race-free clocking-block sampling, reference-queue scoreboard) regressed across 5 clock-ratio scenarios on Cadence Xcelium.',
      'Root-caused a same-edge race condition between the write- and read-clock-domain stimulus shutdown paths that could silently drop an in-flight write during drain; fixed it by decoupling the write/read enables for a guaranteed lossless drain.',
    ],
    tags: ['SystemVerilog', 'SVA', 'CDC', 'Asynchronous FIFO', 'Cadence Xcelium'],
    github: 'https://github.com/Dhirajzen/Asynchronous-FIFO',
    video: 'https://www.youtube.com/watch?v=NLQoDZw3vug',
    order: 2,
  },
  {
    id: 'llm-verification-assistant',
    title: 'LLM-Assisted Verification Assistant Using LangChain, LangGraph, and RAG',
    summary: 'Grounded spec Q&A and agentic coverage gap analysis on top of an ARM AXI4 RAG pipeline.',
    bullets: [
      'Built a RAG pipeline over the 500-page ARM AXI4 specification using LangChain, ChromaDB, and Claude, with regex preprocessing, semantic chunking, and MMR retrieval for grounded spec Q&A.',
      'Designed an agentic coverage gap analyzer in LangGraph that parses functional coverage reports and suggests UVM constrained-random stimulus to close uncovered bins.',
    ],
    tags: ['LangChain', 'LangGraph', 'RAG', 'ChromaDB', 'Claude'],
    github: 'https://github.com/Dhirajzen/dv-rag-assistant',
    order: 3,
  },
  {
    id: 'spi-uvm',
    title: 'Functional Verification of SPI Protocol Using SystemVerilog and UVM',
    summary: 'Self-checking SPI scoreboard validating CPOL/CPHA modes against a reference memory model.',
    bullets: [
      'Developed a UVM environment for an SPI controller with constrained-random read/write transactions and functional coverage tracking CPOL, CPHA modes.',
      'Designed a self-checking scoreboard using a 32×8 reference memory model validating readback correctness through reset recovery and corner-case timing scenarios.',
    ],
    tags: ['SystemVerilog', 'UVM', 'SPI', 'Functional Coverage'],
    github: 'https://github.com/Dhirajzen/Design-Verification-Projects/tree/main/SPI_UVM_Verification',
    order: 4,
  },
];

// ===== DOM helpers =====
function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text) node.textContent = options.text;
  if (options.href) node.href = options.href;
  if (options.ariaLabel) node.setAttribute('aria-label', options.ariaLabel);
  children.forEach((child) => node.appendChild(child));
  return node;
}

function renderProjectCard(project) {
  const card = el('article', { className: 'project-card' });
  card.dataset.reveal = '';

  card.appendChild(el('h3', { text: project.title }));
  card.appendChild(el('p', { className: 'project-summary', text: project.summary }));

  // Optional headline numbers (bugs found, assertions, coverage) — the
  // quickest read of a DV project's depth, so they sit above the bullets.
  if (project.stats && project.stats.length) {
    card.appendChild(el('ul', { className: 'project-stats', ariaLabel: 'Key results' },
      project.stats.map((stat) => el('li', {}, [
        el('span', { className: 'project-stat__value', text: stat.value }),
        el('span', { className: 'project-stat__label', text: stat.label }),
      ]))
    ));
  }

  const bulletList = el('ul', { className: 'project-bullets' },
    project.bullets.map((bullet) => el('li', { text: bullet }))
  );
  card.appendChild(bulletList);

  const tagList = el('ul', { className: 'tag-list' },
    project.tags.map((tag) => el('li', { className: 'tag-chip', text: tag }))
  );
  card.appendChild(tagList);

  const links = el('div', { className: 'project-links' }, [
    el('a', {
      className: 'project-link',
      href: project.github,
      text: 'View on GitHub',
      ariaLabel: `View ${project.title} on GitHub`,
    }),
  ]);
  if (project.video) {
    links.appendChild(el('a', {
      className: 'project-link project-link--video',
      href: project.video,
      text: 'Watch the explainer',
      ariaLabel: `Watch the YouTube explainer for ${project.title}`,
    }));
  }
  card.appendChild(links);

  return card;
}

async function loadProjects() {
  const container = document.getElementById('projects-container');
  let projects;
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error(`projects.json responded with ${response.status}`);
    projects = await response.json();
  } catch (error) {
    console.error('Failed to load projects.json, using fallback data:', error);
    projects = FALLBACK_PROJECTS;
  }
  projects = [...projects].sort((a, b) => a.order - b.order);
  container.replaceChildren(...projects.map(renderProjectCard));
}

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

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', async () => {
  initVideoEmbeds();
  await loadProjects();
  initReveal();
  initMobileNav();
  initCursorGlow();
});
