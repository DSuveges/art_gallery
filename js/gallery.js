/**
 * Renders the artwork grid and filter bar.
 */

const grid = document.getElementById('gallery');
const filtersNav = document.getElementById('filters');

let _allArtworks = [];
let _visible = [];  // currently displayed subset (respects active filter)

export function getVisible() {
  return _visible;
}

// ---------- Filter bar ----------

function buildFilters(artworks) {
  const techniques = ['All', ...new Set(artworks.map(a => a.technique))];

  techniques.forEach((tech, i) => {
    const btn = document.createElement('button');
    btn.textContent = tech === 'All' ? 'All' : capitalise(tech);
    btn.dataset.technique = tech;
    btn.classList.toggle('active', i === 0);
    btn.addEventListener('click', () => {
      filtersNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = tech === 'All' ? _allArtworks : _allArtworks.filter(a => a.technique === tech);
      render(filtered);
    });
    filtersNav.appendChild(btn);
  });
}

// ---------- Grid rendering ----------

export function render(artworks) {
  _visible = artworks;
  grid.innerHTML = '';

  if (artworks.length === 0) {
    grid.innerHTML = '<p class="empty">No works found.</p>';
    return;
  }

  artworks.forEach((artwork, index) => {
    const figure = document.createElement('figure');
    figure.className = 'card';
    figure.dataset.id = artwork.id;
    figure.dataset.index = index;

    const img = document.createElement('img');
    img.src = `images/thumbs/${artwork.id}.jpg`;
    img.alt = artwork.title;
    img.loading = 'lazy';
    img.onerror = () => { img.src = 'images/placeholder.svg'; };

    const caption = document.createElement('figcaption');
    caption.innerHTML = `
      <span class="card-title">${artwork.title}</span>
      <span class="card-meta">${artwork.year} &middot; ${capitalise(artwork.technique)}</span>
    `;

    figure.appendChild(img);
    figure.appendChild(caption);
    grid.appendChild(figure);
  });
}

// ---------- Init ----------

export function init(artworks) {
  _allArtworks = artworks;
  buildFilters(artworks);
  render(artworks);
}

// ---------- Helpers ----------

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
