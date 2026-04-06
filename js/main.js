import { loadArtworks } from './data.js';
import { init as initGallery } from './gallery.js';
import { init as initLightbox } from './lightbox.js';

(async () => {
  try {
    const artworks = await loadArtworks();
    initGallery(artworks);
    initLightbox();
  } catch (err) {
    console.error('Gallery failed to load:', err);
    document.getElementById('gallery').innerHTML =
      '<p class="empty">Could not load artworks. ' +
      'If opening locally, use a simple server: <code>python3 -m http.server</code></p>';
  }
})();
