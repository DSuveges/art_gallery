# Gallery

A static artist portfolio. No server, no database, no build step.

## Running locally

The easiest way is a one-line Python server from the project root:

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

Alternatively, any static host works out of the box: GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.

---

## Adding a new work

### 1. Add images

Place two versions of the image in:

| Path | Purpose | Recommended size |
|------|---------|-----------------|
| `images/large/NNN.jpg` | Lightbox full view | original or up to ~2000px on longest side |
| `images/thumbs/NNN.jpg` | Grid thumbnail | ~600px on longest side |

Use the next available three-digit number (`001`, `002`, …) as the filename.

Quick resize with ImageMagick (run from `images/large/`):

```bash
magick NNN.jpg -resize 600x600\> ../thumbs/NNN.jpg
```

### 2. Edit `data/artworks.json`

Append an entry to the array:

```json
{
  "id": "009",
  "title": "Painting Title",
  "year": 2025,
  "technique": "oil",
  "dimensions": "40 × 50 cm",
  "support": "canvas",
  "description": "A sentence or two about this work.",
  "available": true
}
```

**Field reference**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Must match the image filenames exactly |
| `title` | string | Title of the work |
| `year` | number | Year of completion |
| `technique` | string | Used for filter buttons — e.g. `"oil"`, `"watercolour"`, `"charcoal"` |
| `dimensions` | string | e.g. `"60 × 80 cm"` |
| `support` | string | e.g. `"canvas"`, `"linen"`, `"paper"`, `"board"` |
| `description` | string | Shown in the lightbox. Can be left `""` |
| `available` | boolean | `true` shows an "Available" badge; `false` shows "Not available" |

### 3. Commit and push

```bash
git add data/artworks.json images/large/009.jpg images/thumbs/009.jpg
git commit -m "Add: Painting Title (2025)"
git push
```

---

## Changing order

The grid follows the order of entries in `artworks.json`. Move entries up or down in the file to reorder.

## Removing a work

Delete the entry from `artworks.json` and optionally delete the image files. Commit both changes together.

## Updating artist name / contact

Edit `index.html` directly:

```html
<h1 class="artist-name">Your Name</h1>
<a href="mailto:you@example.com">you@example.com</a>
```

## Theming

All colours and fonts are CSS custom properties at the top of `css/style.css`. Edit the `:root` block to restyle the whole site.

---

## File:// fallback (no server)

If you want to open `index.html` directly from the filesystem without a server, Chrome will block the `fetch()` call that loads the JSON. To work around this:

1. Create `data/artworks.js` containing:
   ```js
   window.__ARTWORKS__ = [ /* paste artworks.json content here */ ];
   ```
2. Uncomment this line in `index.html`:
   ```html
   <script src="data/artworks.js"></script>
   ```

Keep both files in sync when you add new works. The JSON file remains the source of truth.
