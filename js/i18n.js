/**
 * Lightweight i18n module.
 *
 * Usage:
 *   import { t, field, getLang, setLang, initLang, initLangSwitcher } from './i18n.js';
 *
 *   t('available')              → "Available" / "Elérhető"
 *   field(artwork, 'title')     → artwork.title_hu (if hu active) or artwork.title
 *
 * Language changes fire a 'langchange' CustomEvent on document so that
 * any module can listen and re-render independently.
 */

const DEFAULT_LANG  = 'en';
const SUPPORTED     = ['en', 'hu'];
const STORAGE_KEY   = 'gallery_lang';

let _strings = {};
let _lang    = DEFAULT_LANG;

// ---------- Bootstrap ----------

export async function loadStrings() {
  const res = await fetch('./data/i18n.json');
  if (!res.ok) throw new Error(`Failed to load i18n.json: ${res.status}`);
  _strings = await res.json();
}

/** Call before rendering anything. Reads localStorage, then browser lang. */
export function initLang() {
  const stored  = localStorage.getItem(STORAGE_KEY);
  const browser = (navigator.language || '').slice(0, 2);
  _lang = SUPPORTED.includes(stored)  ? stored
        : SUPPORTED.includes(browser) ? browser
        : DEFAULT_LANG;
  document.documentElement.lang = _lang;
}

/** Wire up the EN / HU buttons already in the DOM. */
export function initLangSwitcher() {
  document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  _updateSwitcherUI();
  _updateStaticStrings();
}

// ---------- Public API ----------

export function getLang() { return _lang; }

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === _lang) return;
  _lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  _updateSwitcherUI();
  _updateStaticStrings();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Translate a UI string key.
 * Falls back to English, then the bare key if missing.
 */
export function t(key) {
  return (_strings[_lang]?.[key])
      ?? (_strings[DEFAULT_LANG]?.[key])
      ?? key;
}


/**
 * Return a language-aware field from a data object.
 * e.g. field(artwork, 'title') → artwork.title_hu if 'hu' is active
 *      and that property exists, otherwise artwork.title.
 */
export function field(obj, key) {
  if (_lang !== DEFAULT_LANG) {
    const localised = obj[`${key}_${_lang}`];
    if (localised != null && localised !== '') return localised;
  }
  return obj[key] ?? '';
}

// ---------- Internal ----------

/** Translate all elements carrying a data-i18n attribute. */
function _updateStaticStrings() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

function _updateSwitcherUI() {
  document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === _lang);
  });
}
