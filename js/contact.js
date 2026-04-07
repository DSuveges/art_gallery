/**
 * Loads the language-appropriate about.md and renders it on the About page.
 */

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@13/+esm';
import { loadStrings, initLang, initLangSwitcher, getLang } from './i18n.js';
import { renderFooter } from './footer.js';

async function loadAbout(lang) {
  const file = `./data/about.${lang}.md`;
  const res  = await fetch(file);
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
  return res.text();
}

async function render() {
  const md = await loadAbout(getLang());
  document.getElementById('contact-content').innerHTML = marked.parse(md);
}

async function init() {
  try {
    await loadStrings();
    initLang();
    await render();
    initLangSwitcher();
    renderFooter();
    document.addEventListener('langchange', render);
  } catch (err) {
    console.error(err);
    document.getElementById('contact-content').innerHTML =
      '<p class="empty">Could not load page.</p>';
  }
}

init();
