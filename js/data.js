/**
 * Loads artwork data from artworks.json.
 *
 * Works both via a local server (recommended) and directly from the
 * filesystem (file://).  For file:// access, browsers like Chrome block
 * fetch() on local files.  In that case, include the fallback script in
 * index.html:
 *
 *   <script src="data/artworks.js"></script>
 *
 * where artworks.js contains a single line:
 *   window.__ARTWORKS__ = [ ... copy of artworks.json content ... ];
 *
 * Any modern static host (GitHub Pages, Netlify, etc.) does not need this.
 */

let _cache = null;

export async function loadArtworks() {
  if (_cache) return _cache;

  // Fallback: artworks.js pre-loaded the data into a global variable
  if (window.__ARTWORKS__) {
    _cache = window.__ARTWORKS__;
    return _cache;
  }

  const res = await fetch('./data/artworks.json');
  if (!res.ok) throw new Error(`Failed to load artworks.json: ${res.status}`);
  _cache = await res.json();
  return _cache;
}
