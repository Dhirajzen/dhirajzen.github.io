// Kept in sync with projects.json manually — used only if the fetch fails,
// so the Featured Projects section still renders all 5 entries.
const FALLBACK_PROJECTS = [
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
    order: 1,
  },
  {
    id: 'axi4-lite-slave-uvm',
    title: 'Verification of AXI4-Lite Slave Interface Using SystemVerilog and UVM',
    summary: 'Full UVM environment with constrained-random stimulus achieving functional coverage closure on AXI4-Lite.',
    bullets: [
      'Authored a Verification Plan covering reset behavior, address alignment, and corner-case transactions.',
      'Built a complete UVM environment (driver, monitor, sequencer, scoreboard) with constrained-random stimulus verifying handshake timing and back-to-back transaction stability.',
      'Achieved functional coverage closure validating protocol compliance across read and write channels.',
    ],
    tags: ['SystemVerilog', 'UVM', 'AXI4-Lite', 'Functional Coverage'],
    github: 'https://github.com/Dhirajzen/AXI4-UVM-Verification',
    order: 2,
  },
  {
    id: 'apb-protocol-uvm',
    title: 'Design Verification of APB Protocol Using SystemVerilog and UVM',
    summary: 'UVM environment with scoreboard reaching 100% functional coverage on APB.',
    bullets: [
      'Authored a Verification Plan covering reset behavior, PSLVERR responses, address alignment, and back-to-back transfers.',
      'Built a UVM environment with scoreboard validating APB protocol compliance under constrained-random stimulus.',
      'Achieved 100% Functional Coverage across address and data cross-bins during coverage closure.',
    ],
    tags: ['SystemVerilog', 'UVM', 'APB', 'Functional Coverage'],
    github: 'https://github.com/Dhirajzen/Design-Verification-Projects',
    order: 3,
  },
  {
    id: 'async-fifo-cdc',
    title: 'Asynchronous FIFO for Robust Clock Domain Crossing (CDC)',
    summary: 'SVA-monitored CDC-safe FIFO stress-tested across clock ratios, skew, and async reset.',
    bullets: [
      'Verified a CDC-safe asynchronous FIFO with independent read/write clock domains and Gray-code pointer synchronization.',
      'Implemented SystemVerilog Assertions (SVA) monitoring pointer stability and two-flop synchronizer latency across multiple clock ratios.',
      'Stress-tested under asynchronous reset, clock skew, and boundary conditions ensuring CDC robustness.',
    ],
    tags: ['SystemVerilog', 'SVA', 'CDC', 'Asynchronous FIFO'],
    github: 'https://github.com/Dhirajzen/Asynchronous-FIFO',
    order: 4,
  },
  {
    id: 'spi-uvm',
    title: 'Functional Verification of SPI Protocol Using SystemVerilog and UVM',
    summary: 'Self-checking SPI scoreboard validating CPOL/CPHA modes against a reference memory model.',
    bullets: [
      'Developed a UVM environment for an SPI controller with constrained-random read/write transactions and functional coverage tracking CPOL, CPHA modes.',
      'Designed a self-checking scoreboard using a 32×8 reference memory model validating readback data correctness.',
      'Verified protocol compliance during reset recovery and corner-case timing scenarios.',
    ],
    tags: ['SystemVerilog', 'UVM', 'SPI', 'Functional Coverage'],
    github: 'https://github.com/Dhirajzen/Design-Verification-Projects',
    order: 5,
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

  const bulletList = el('ul', { className: 'project-bullets' },
    project.bullets.map((bullet) => el('li', { text: bullet }))
  );
  card.appendChild(bulletList);

  const tagList = el('ul', { className: 'tag-list' },
    project.tags.map((tag) => el('li', { className: 'tag-chip', text: tag }))
  );
  card.appendChild(tagList);

  card.appendChild(el('a', {
    className: 'project-link',
    href: project.github,
    text: 'View on GitHub',
    ariaLabel: `View ${project.title} on GitHub`,
  }));

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

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  initReveal();
  initMobileNav();
  initCursorGlow();
});
