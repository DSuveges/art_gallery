/**
 * Loads contact.json and renders the contact page.
 * Language-aware via i18n.js.
 */

import { loadStrings, initLang, initLangSwitcher, t, field } from './i18n.js';

async function loadContact() {
  if (window.__CONTACT__) return window.__CONTACT__;
  const res = await fetch('./data/contact.json');
  if (!res.ok) throw new Error(`Failed to load contact.json: ${res.status}`);
  return res.json();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function render(c) {
  const main = document.getElementById('contact-content');
  main.innerHTML = '';

  if (c.bio) {
    main.appendChild(el('p', 'contact-bio', field(c, 'bio')));
  }

  const grid = el('div', 'contact-grid');

  const details = el('div', 'contact-details');

  if (c.email) {
    const block = el('div', 'contact-block');
    block.appendChild(el('h2', 'contact-label', t('contact_email')));
    const a = document.createElement('a');
    a.href = `mailto:${c.email}`;
    a.textContent = c.email;
    block.appendChild(a);
    details.appendChild(block);
  }

  if (c.phone) {
    const block = el('div', 'contact-block');
    block.appendChild(el('h2', 'contact-label', t('contact_phone')));
    block.appendChild(el('p', null, c.phone));
    details.appendChild(block);
  }

  if (c.location) {
    const block = el('div', 'contact-block');
    block.appendChild(el('h2', 'contact-label', t('contact_location')));
    block.appendChild(el('p', null, c.location));
    const studio = field(c, 'studio');
    if (studio) block.appendChild(el('p', 'contact-sub', studio));
    details.appendChild(block);
  }

  if (c.social && c.social.length) {
    const block = el('div', 'contact-block');
    block.appendChild(el('h2', 'contact-label', t('contact_online')));
    const ul = el('ul', 'contact-links');
    c.social.forEach(s => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      ul.appendChild(li);
    });
    block.appendChild(ul);
    details.appendChild(block);
  }

  if (c.representation && c.representation.length) {
    const block = el('div', 'contact-block');
    block.appendChild(el('h2', 'contact-label', t('contact_representation')));
    const ul = el('ul', 'contact-links');
    c.representation.forEach(r => {
      const li = document.createElement('li');
      if (r.url) {
        const a = document.createElement('a');
        a.href = r.url;
        a.textContent = r.gallery;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        if (r.city) li.appendChild(el('span', 'contact-sub', ` — ${r.city}`));
      } else {
        li.textContent = r.gallery + (r.city ? ` — ${r.city}` : '');
      }
      ul.appendChild(li);
    });
    block.appendChild(ul);
    details.appendChild(block);
  }

  grid.appendChild(details);
  main.appendChild(grid);
}

async function init() {
  try {
    const [contact] = await Promise.all([
      loadContact(),
      loadStrings(),
    ]);

    initLang();
    render(contact);
    initLangSwitcher();

    document.addEventListener('langchange', () => render(contact));
  } catch (err) {
    console.error(err);
    document.getElementById('contact-content').innerHTML =
      '<p class="empty">Could not load contact information.</p>';
  }
}

init();
