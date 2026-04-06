import { loadStrings, initLang, initLangSwitcher } from './i18n.js';
import { loadArtworks } from './data.js';
import { init as initGallery } from './gallery.js';
import { init as initLightbox } from './lightbox.js';
import { renderFooter } from './footer.js';

(async () => {
  try {
    // Load data and strings in parallel
    const [artworks] = await Promise.all([
      loadArtworks(),
      loadStrings(),
    ]);

    initLang();
    initGallery(artworks);
    initLightbox();
    initLangSwitcher();
    renderFooter();
  } catch (err) {
    console.error('Gallery failed to load:', err);
    document.getElementById('gallery').innerHTML =
      '<p class="empty">Could not load artworks. ' +
      'If opening locally, use a simple server: <code>python3 -m http.server</code></p>';
  }
})();
