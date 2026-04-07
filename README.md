# Gallery

A static artist portfolio. No server, no database, no build step.

Live at **https://adrienne-art.pages.dev** — deployed automatically via Cloudflare Pages on every push to `main`.

## Running locally

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

---

## Architecture

| Concern | Solution |
|---------|----------|
| Hosting | Cloudflare Pages (static, free tier) |
| Images | Cloudflare R2 (zero egress fees) |
| i18n | English + Hungarian, toggled at runtime, persisted in `localStorage` |
| Metadata | `data/artworks.json` — validated at commit time |
| About page | `data/about.en.md` / `data/about.hu.md` — rendered with marked.js |
| No build step | Vanilla JS ES modules, no bundler |

---

## Adding a new artwork

### 1. Prepare images

Generate three sizes from the original/cropped file:

```bash
# Thumbnail (~400px, shown in gallery grid)
magick original.jpg -resize 400x400\> -quality 75 thumbs/NNN.jpg

# Medium (~1400px, shown in lightbox)
magick original.jpg -resize 1400x1400\> -quality 82 medium/NNN.jpg

# Large (full resolution, opened by zoom link)
cp original.jpg large/NNN.jpg
```

Use the next available three-digit number (`001`, `002`, …) as the filename.

### 2. Upload to R2

Upload all three files to the R2 bucket under their respective prefixes:

```
thumbs/NNN.jpg
medium/NNN.jpg
large/NNN.jpg
```

### 3. Add an entry to `data/artworks.json`

Append to the array:

```json
{
  "id": "009",
  "title": "Painting Title",
  "title_hu": "Festmény Cím",
  "year": 2025,
  "technique": "oil",
  "dimensions": "40 × 50 cm",
  "support": "canvas",
  "description": null,
  "description_hu": null,
  "tags": ["portrait"],
  "exhibitions": [],
  "exhibitions_hu": [],
  "available": true
}
```

**Field reference**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Must match image filenames exactly |
| `title` | string | yes | English title |
| `title_hu` | string | no | Hungarian title; falls back to `title` if omitted |
| `year` | number | no | `null` hides the field |
| `technique` | string | no | Must match a key in `i18n.json` (e.g. `"oil"`, `"watercolour"`, `"pastel"`) |
| `dimensions` | string | no | e.g. `"60 × 80 cm"` |
| `support` | string | no | Must match a key in `i18n.json` (e.g. `"canvas"`, `"paper"`) |
| `description` | string | no | Shown in lightbox; `null` hides the field |
| `description_hu` | string | no | Hungarian description |
| `tags` | array | no | Each tag must match a key in `i18n.json` (e.g. `"portrait"`, `"landscape"`) |
| `exhibitions` | array | no | List of exhibition strings shown as bullet points |
| `exhibitions_hu` | array | no | Hungarian exhibition list |
| `available` | boolean\|null | no | `true` → "Available" badge; `false` → "Sold"; `null` → no badge |

### 4. Commit and push

```bash
git add data/artworks.json
git commit -m "Add: Painting Title (2025)"
git push
```

The pre-commit hook validates that all `technique`, `support`, and `tag` values have matching entries in `i18n.json` before the commit is accepted.

---

## Updating the About page

Edit either or both markdown files and commit:

- `data/about.en.md` — English text
- `data/about.hu.md` — Hungarian text

Standard markdown applies: `##` headings, paragraphs, bullet lists, `**bold**`, `*italic*`, links.

---

## Changing order / removing a work

- **Reorder**: move entries up or down in `artworks.json`.
- **Remove**: delete the entry from `artworks.json` and the corresponding files from R2.

---

## Adding a new technique, support type, or tag

1. Add the value to the relevant artwork entry in `artworks.json`.
2. Add translation keys to **both** `en` and `hu` blocks in `data/i18n.json`:
   - Technique: `"technique_yourvalue": "Label"`
   - Support: `"support_yourvalue": "Label"`
   - Tag: `"tag_yourvalue": "Label"`

The pre-commit validator will catch any missing keys before they reach production.

---

## Theming

All colours and fonts are CSS custom properties at the top of `css/style.css`. Edit the `:root` block to restyle the whole site. Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`.
