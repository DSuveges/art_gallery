/**
 * Loads contact.json and renders the contact page.
 */

async function loadContact() {
  if (window.__CONTACT__) return window.__CONTACT__;
  const res = await fetch('./data/contact.json');
  if (!res.ok) throw new Error(`Failed to load contact.json: ${res.status}`);
  return res.json();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

async function init() {
  const main = document.getElementById('contact-content');
  try {
    const c = await loadContact();

    // Bio
    if (c.bio) {
      const bio = el('p', 'contact-bio', c.bio);
      main.appendChild(bio);
    }

    const grid = el('div', 'contact-grid');

    // Details column
    const details = el('div', 'contact-details');

    if (c.email) {
      const block = el('div', 'contact-block');
      block.appendChild(el('h2', 'contact-label', 'Email'));
      const a = document.createElement('a');
      a.href = `mailto:${c.email}`;
      a.textContent = c.email;
      block.appendChild(a);
      details.appendChild(block);
    }

    if (c.phone) {
      const block = el('div', 'contact-block');
      block.appendChild(el('h2', 'contact-label', 'Phone'));
      block.appendChild(el('p', null, c.phone));
      details.appendChild(block);
    }

    if (c.location) {
      const block = el('div', 'contact-block');
      block.appendChild(el('h2', 'contact-label', 'Location'));
      block.appendChild(el('p', null, c.location));
      if (c.studio) block.appendChild(el('p', 'contact-sub', c.studio));
      details.appendChild(block);
    }

    if (c.social && c.social.length) {
      const block = el('div', 'contact-block');
      block.appendChild(el('h2', 'contact-label', 'Online'));
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
      block.appendChild(el('h2', 'contact-label', 'Representation'));
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

  } catch (err) {
    console.error(err);
    main.innerHTML = '<p class="empty">Could not load contact information.</p>';
  }
}

init();
