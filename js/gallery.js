/**
 * Renders the artwork grid and filter bars.
 * Re-renders on 'langchange' events from i18n.js.
 */

import { t, field } from './i18n.js';

const grid       = document.getElementById('gallery');
const filtersNav = document.getElementById('filters');

let _allArtworks     = [];
let _visible         = [];
let _activeTechnique = 'All';
let _activeTag       = 'All';

export function getVisible() { return _visible; }

// ---------- Filter bars ----------

function buildFilters(artworks) {
  filtersNav.innerHTML = '';

  const techniques = ['All', ...new Set(artworks.map(a => a.technique).filter(Boolean))];
  const allTags    = ['All', ...new Set(artworks.flatMap(a => a.tags || []))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
  );
  const hasTags = artworks.some(a => a.tags && a.tags.length);

  filtersNav.appendChild(
    makeFilterRow(t('filter_technique'), techniques, 'technique', val => {
      _activeTechnique = val;
      applyFilters();
    }, _activeTechnique)
  );

  if (hasTags) {
    filtersNav.appendChild(
      makeFilterRow(t('filter_tags'), allTags, 'tag', val => {
        _activeTag = val;
        applyFilters();
      }, _activeTag)
    );
  }
}

function makeFilterRow(label, values, type, onChange, activeValue) {
  const row = document.createElement('div');
  row.className = 'filter-row';

  const lbl = document.createElement('span');
  lbl.className = 'filter-row-label';
  lbl.textContent = label;
  row.appendChild(lbl);

  const pills = document.createElement('div');
  pills.className = 'filter-pills';

  values.forEach(val => {
    const btn = document.createElement('button');
    btn.textContent = val === 'All' ? t('filter_all') : translateFilterValue(type, val);
    btn.dataset[type] = val;
    btn.classList.toggle('active', val === activeValue);
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

function translateFilterValue(type, val) {
  if (type === 'technique') return t(`technique_${val}`);
  if (type === 'tag')       return t(`tag_${val}`);
  return capitalise(val);
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

// ---------- Grid ----------

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
    img.alt     = field(artwork, 'title');
    img.loading = 'lazy';
    img.onerror = () => { img.src = 'images/placeholder.svg'; };

    const caption = document.createElement('figcaption');
    const metaParts = [
      artwork.year,
      artwork.technique && t(`technique_${artwork.technique}`),
    ].filter(Boolean);
    caption.innerHTML = `
      <span class="card-title">${field(artwork, 'title')}</span>
      ${metaParts.length ? `<span class="card-meta">${metaParts.join(' &middot; ')}</span>` : ''}
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

  document.addEventListener('langchange', () => {
    buildFilters(_allArtworks);
    applyFilters();
  });
}

// ---------- Helpers ----------

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
