/**
 * Renders the artwork grid and filter bars.
 *
 * Two independent filter rows:
 *   - Technique  (oil, watercolour, …)
 *   - Tags       (animals, portraits, Italy trip, …)
 *
 * Both default to "All". Active selections combine with AND:
 * only works matching both the selected technique and the selected
 * tag are shown.
 */

const grid        = document.getElementById('gallery');
const filtersNav  = document.getElementById('filters');

let _allArtworks = [];
let _visible     = [];

let _activeTechnique = 'All';
let _activeTag       = 'All';

export function getVisible() {
  return _visible;
}

// ---------- Filter bars ----------

function buildFilters(artworks) {
  const techniques = ['All', ...new Set(artworks.map(a => a.technique).filter(Boolean))];
  const tags       = ['All', ...new Set(artworks.flatMap(a => a.tags || []))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
  );

  // Only show tag row if at least one artwork has tags
  const hasTags = artworks.some(a => a.tags && a.tags.length);

  const rowTech = makeFilterRow('Technique', techniques, 'technique', val => {
    _activeTechnique = val;
    applyFilters();
  });
  filtersNav.appendChild(rowTech);

  if (hasTags) {
    const rowTags = makeFilterRow('Series & themes', tags, 'tag', val => {
      _activeTag = val;
      applyFilters();
    });
    filtersNav.appendChild(rowTags);
  }
}

function makeFilterRow(label, values, type, onChange) {
  const row = document.createElement('div');
  row.className = 'filter-row';

  const lbl = document.createElement('span');
  lbl.className = 'filter-row-label';
  lbl.textContent = label;
  row.appendChild(lbl);

  const pills = document.createElement('div');
  pills.className = 'filter-pills';

  values.forEach((val, i) => {
    const btn = document.createElement('button');
    btn.textContent = val === 'All' ? 'All' : capitalise(val);
    btn.dataset[type] = val;
    btn.classList.toggle('active', i === 0);
    btn.addEventListener('click', () => {
      pills.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(val);
    });
    pills.appendChild(btn);
  });

  row.appendChild(pills);
  return row;
}

// ---------- Filtering ----------

function applyFilters() {
  const result = _allArtworks.filter(a => {
    const techMatch = _activeTechnique === 'All' || a.technique === _activeTechnique;
    const tagMatch  = _activeTag === 'All' || (a.tags && a.tags.includes(_activeTag));
    return techMatch && tagMatch;
  });
  render(result);
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
    figure.dataset.id    = artwork.id;
    figure.dataset.index = index;

    const img = document.createElement('img');
    img.src     = `images/thumbs/${artwork.id}.jpg`;
    img.alt     = artwork.title;
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
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
