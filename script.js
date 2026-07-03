// Phase 1: content rendering only. Motion/scroll system added in Phase 3.

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text) node.textContent = options.text;
  if (options.href) node.href = options.href;
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

  card.appendChild(el('a', { className: 'project-link', href: project.github, text: 'View on GitHub' }));

  return card;
}

async function loadProjects() {
  const container = document.getElementById('projects-container');
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error(`projects.json responded with ${response.status}`);
    const projects = await response.json();
    projects.sort((a, b) => a.order - b.order);
    container.replaceChildren(...projects.map(renderProjectCard));
  } catch (error) {
    console.error('Failed to load projects.json:', error);
    container.replaceChildren(el('p', {
      className: 'projects-error',
      text: 'Projects failed to load — see the list below, or visit github.com/Dhirajzen directly.',
    }));
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
