/**
 * Lightbox — full-screen artwork view with metadata.
 * Re-populates on 'langchange' if currently open.
 */

import { getVisible } from './gallery.js';
import { t, field, getLang } from './i18n.js';
import { R2_BASE } from './config.js';

const lightbox  = document.getElementById('lightbox');
const backdrop  = document.getElementById('lightbox-backdrop');
const imgWrap   = document.getElementById('lightbox-image-wrap');
const img       = document.getElementById('lightbox-img');
const btnClose  = document.getElementById('lightbox-close');
const btnPrev   = document.getElementById('lightbox-prev');
const btnNext   = document.getElementById('lightbox-next');
const metaTitle = document.getElementById('meta-title');
const metaList  = document.getElementById('meta-details');
const metaDesc  = document.getElementById('meta-description');
const metaTags  = document.getElementById('meta-tags');
const metaBadge        = document.getElementById('meta-available');
const metaExhibitions  = document.getElementById('meta-exhibitions');
const metaExhLabel     = document.getElementById('meta-exhibitions-label');
const metaExhList      = document.getElementById('meta-exhibitions-list');
const metaEnquire      = document.getElementById('meta-enquire');
const zoomLink         = document.getElementById('lightbox-zoom');

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
  imgWrap.classList.add('loading');
  img.src = `${R2_BASE}/medium/${artwork.id}.jpg`;
  img.alt = field(artwork, 'title');
  img.onload  = () => imgWrap.classList.remove('loading');
  img.onerror = () => { imgWrap.classList.remove('loading'); img.src = 'images/placeholder.svg'; };
  zoomLink.href = `${R2_BASE}/large/${artwork.id}.jpg`;

  metaTitle.textContent = field(artwork, 'title');

  const rows = [
    { label: t('meta_year'),       value: artwork.year },
    { label: t('meta_technique'),  value: artwork.technique  && t(`technique_${artwork.technique}`) },
    { label: t('meta_dimensions'), value: artwork.dimensions },
    { label: t('meta_support'),    value: artwork.support    && t(`support_${artwork.support}`) },
  ];

  metaList.innerHTML = rows
    .filter(({ value }) => value != null && value !== '' && value !== false)
    .map(({ label, value }) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');

  const desc = field(artwork, 'description');
  metaDesc.textContent = desc ?? '';
  metaDesc.hidden = !desc;

  if (artwork.tags && artwork.tags.length) {
    metaTags.innerHTML = artwork.tags
      .map(tag => `<span class="tag">${t(`tag_${tag}`)}</span>`)
      .join('');
    metaTags.hidden = false;
  } else {
    metaTags.hidden = true;
  }

  const lang = getLang();
  const exhRaw = (lang !== 'en' && Array.isArray(artwork[`exhibitions_${lang}`]))
    ? artwork[`exhibitions_${lang}`]
    : artwork.exhibitions;
  const exhItems = Array.isArray(exhRaw) && exhRaw.length > 0 ? exhRaw : null;
  if (exhItems) {
    metaExhLabel.textContent = t('exhibitions');
    metaExhList.innerHTML = exhItems.map(e => `<li>${e}</li>`).join('');
    metaExhibitions.hidden = false;
  } else {
    metaExhList.innerHTML = '';
    metaExhibitions.hidden = true;
  }

  if (artwork.available == null) {
    metaBadge.hidden = true;
  } else {
    metaBadge.textContent = artwork.available ? t('available') : t('sold');
    metaBadge.className   = 'badge ' + (artwork.available ? 'badge-available' : 'badge-sold');
    metaBadge.hidden = false;
  }

  if (metaEnquire) {
    const subject = encodeURIComponent(`${t('enquire')}: ${field(artwork, 'title')}`);
    metaEnquire.href        = `mailto:?subject=${subject}`;
    metaEnquire.textContent = t('enquire');
  }

  updateNavButtons();
}

function updateNavButtons() {
  const total = getVisible().length;
  btnPrev.disabled = total <= 1;
  btnNext.disabled = total <= 1;
}

// ---------- Init ----------

export function init() {
  document.getElementById('gallery').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    open(Number(card.dataset.index));
  });

  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  btnPrev.addEventListener('click', () => navigate(-1));
  btnNext.addEventListener('click', () => navigate(+1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    switch (e.key) {
      case 'Escape':     close();      break;
      case 'ArrowLeft':  navigate(-1); break;
      case 'ArrowRight': navigate(+1); break;
    }
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    navigate(dx < 0 ? +1 : -1);
  }, { passive: true });

  // Re-populate if language changes while lightbox is open
  document.addEventListener('langchange', () => {
    if (lightbox.classList.contains('open')) {
      populate(getVisible()[currentIndex]);
    }
  });
}

// ---------- Helpers ----------

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
