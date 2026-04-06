/**
 * Lightbox — opens an artwork in full view with its metadata.
 * Navigation cycles through the currently visible (filtered) set.
 */

import { getVisible } from './gallery.js';

const lightbox  = document.getElementById('lightbox');
const backdrop  = document.getElementById('lightbox-backdrop');
const img       = document.getElementById('lightbox-img');
const btnClose  = document.getElementById('lightbox-close');
const btnPrev   = document.getElementById('lightbox-prev');
const btnNext   = document.getElementById('lightbox-next');
const metaTitle = document.getElementById('meta-title');
const metaList  = document.getElementById('meta-details');
const metaDesc  = document.getElementById('meta-description');
const metaBadge = document.getElementById('meta-available');

let currentIndex = 0;

// ---------- Open / Close ----------

export function open(index) {
  const artworks = getVisible();
  if (!artworks.length) return;
  currentIndex = Math.max(0, Math.min(index, artworks.length - 1));
  populate(artworks[currentIndex]);
  lightbox.classList.add('open');
  document.body.classList.add('lightbox-open');
  btnClose.focus();
}

function close() {
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
  img.src = '';
}

function navigate(dir) {
  const artworks = getVisible();
  currentIndex = (currentIndex + dir + artworks.length) % artworks.length;
  populate(artworks[currentIndex]);
}

// ---------- Populate ----------

function populate(artwork) {
  img.src = `images/large/${artwork.id}.jpg`;
  img.alt = artwork.title;
  img.onerror = () => { img.src = 'images/placeholder.svg'; };

  metaTitle.textContent = artwork.title;

  const rows = [
    ['Year',       artwork.year],
    ['Technique',  capitalise(artwork.technique)],
    ['Dimensions', artwork.dimensions],
    ['Support',    capitalise(artwork.support)],
  ];

  metaList.innerHTML = rows
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');

  // Tags
  const tagsEl = document.getElementById('meta-tags');
  if (artwork.tags && artwork.tags.length) {
    tagsEl.innerHTML = artwork.tags
      .map(t => `<span class="tag">${capitalise(t)}</span>`)
      .join('');
    tagsEl.hidden = false;
  } else {
    tagsEl.hidden = true;
  }

  metaDesc.textContent = artwork.description || '';

  metaBadge.textContent   = artwork.available ? 'Available' : 'Not available';
  metaBadge.className     = 'badge ' + (artwork.available ? 'badge-available' : 'badge-sold');

  updateNavButtons();
}

function updateNavButtons() {
  const total = getVisible().length;
  btnPrev.disabled = total <= 1;
  btnNext.disabled = total <= 1;
}

// ---------- Event wiring ----------

export function init() {
  // Open via click on gallery cards (event delegation)
  document.getElementById('gallery').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    open(Number(card.dataset.index));
  });

  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  btnPrev.addEventListener('click', () => navigate(-1));
  btnNext.addEventListener('click', () => navigate(+1));

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    switch (e.key) {
      case 'Escape':    close();         break;
      case 'ArrowLeft': navigate(-1);    break;
      case 'ArrowRight':navigate(+1);    break;
    }
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    navigate(dx < 0 ? +1 : -1);
  }, { passive: true });
}

// ---------- Helpers ----------

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
